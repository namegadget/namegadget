-- ============================================================
-- 1. DOMAINS: add price column + public read policy for listed domains
-- ============================================================
ALTER TABLE public.domains
  ADD COLUMN IF NOT EXISTS price INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Public visitors can view a domain if it is publicly listed / mid-escrow
DROP POLICY IF EXISTS "Public can view listed domains" ON public.domains;
CREATE POLICY "Public can view listed domains"
  ON public.domains FOR SELECT
  TO anon, authenticated
  USING (status IN ('Listed', 'Pending Payment', 'escrow_secured'));

GRANT SELECT ON public.domains TO anon;

-- ============================================================
-- 2. DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  offer INTEGER NOT NULL DEFAULT 0,
  counter INTEGER,
  stage TEXT NOT NULL DEFAULT 'Inbound',
  escrow_transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deals_seller_idx ON public.deals(seller_id);
CREATE INDEX IF NOT EXISTS deals_buyer_email_idx ON public.deals(lower(buyer_email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers manage own deals"
  ON public.deals FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Buyers view own deals"
  ON public.deals FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id
    OR lower(buyer_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  );

-- Buyers can insert deals for themselves against any listed domain
CREATE POLICY "Buyers create deals for listed domains"
  ON public.deals FOR INSERT
  TO authenticated
  WITH CHECK (
    lower(buyer_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    AND EXISTS (
      SELECT 1 FROM public.domains d
      WHERE d.id = domain_id
        AND d.status IN ('Listed', 'Pending Payment')
    )
  );

-- ============================================================
-- 3. DEAL_MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('buyer', 'seller', 'system')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  cta_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deal_messages_deal_idx ON public.deal_messages(deal_id, created_at);

GRANT SELECT, INSERT ON public.deal_messages TO authenticated;
GRANT ALL ON public.deal_messages TO service_role;
ALTER TABLE public.deal_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_deal_participant(_deal_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id = _deal_id
      AND (
        d.seller_id = auth.uid()
        OR d.buyer_id = auth.uid()
        OR lower(d.buyer_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
      )
  );
$$;

CREATE POLICY "Participants view messages"
  ON public.deal_messages FOR SELECT
  TO authenticated
  USING (public.is_deal_participant(deal_id));

CREATE POLICY "Participants post messages"
  ON public.deal_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_role IN ('buyer', 'seller')
    AND public.is_deal_participant(deal_id)
  );

-- ============================================================
-- 4. ESCROW_TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT UNIQUE,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  domain_name TEXT NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  broker_tip_bps INTEGER NOT NULL DEFAULT 0,  -- basis points (500 = 5%)
  fee_allocation TEXT NOT NULL DEFAULT 'split' CHECK (fee_allocation IN ('buyer','seller','split')),
  payment_url TEXT,
  landing_url TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS escrow_tx_domain_idx ON public.escrow_transactions(domain_id);
CREATE INDEX IF NOT EXISTS escrow_tx_deal_idx ON public.escrow_transactions(deal_id);
CREATE INDEX IF NOT EXISTS escrow_tx_buyer_email_idx ON public.escrow_transactions(lower(buyer_email));

GRANT SELECT ON public.escrow_transactions TO authenticated;
GRANT ALL ON public.escrow_transactions TO service_role;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers view own escrow tx"
  ON public.escrow_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Buyers view own escrow tx"
  ON public.escrow_transactions FOR SELECT
  TO authenticated
  USING (lower(buyer_email) = lower(coalesce((auth.jwt() ->> 'email'), '')));

-- ============================================================
-- 5. updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS deals_set_updated_at ON public.deals;
CREATE TRIGGER deals_set_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS domains_set_updated_at ON public.domains;
CREATE TRIGGER domains_set_updated_at BEFORE UPDATE ON public.domains
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS escrow_tx_set_updated_at ON public.escrow_transactions;
CREATE TRIGGER escrow_tx_set_updated_at BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 6. REALTIME
-- ============================================================
ALTER TABLE public.deals REPLICA IDENTITY FULL;
ALTER TABLE public.deal_messages REPLICA IDENTITY FULL;
ALTER TABLE public.escrow_transactions REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='deals'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.deals; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='deal_messages'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_messages; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='escrow_transactions'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.escrow_transactions; END IF;
END $$;