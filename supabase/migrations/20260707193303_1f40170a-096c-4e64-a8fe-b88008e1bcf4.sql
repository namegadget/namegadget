CREATE TABLE public.escrow_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT,
  status TEXT,
  signature_valid BOOLEAN NOT NULL DEFAULT false,
  matched_record_id UUID,
  error TEXT,
  raw JSONB,
  headers JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.escrow_webhook_logs TO authenticated;
GRANT ALL ON public.escrow_webhook_logs TO service_role;
ALTER TABLE public.escrow_webhook_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view escrow webhook logs"
  ON public.escrow_webhook_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX escrow_webhook_logs_transaction_id_idx ON public.escrow_webhook_logs(transaction_id);
CREATE INDEX escrow_webhook_logs_created_at_idx ON public.escrow_webhook_logs(created_at DESC);