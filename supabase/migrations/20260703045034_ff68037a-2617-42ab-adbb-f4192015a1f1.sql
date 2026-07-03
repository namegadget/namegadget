
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL UNIQUE,
  registrar TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  visitor_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Parked' CHECK (status IN ('Parked','For Sale','Negotiating','Sold')),
  appraised_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.domains TO authenticated;
GRANT ALL ON public.domains TO service_role;

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own domains" ON public.domains
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own domains" ON public.domains
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own domains" ON public.domains
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own domains" ON public.domains
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
