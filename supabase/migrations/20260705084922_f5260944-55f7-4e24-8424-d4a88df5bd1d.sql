
CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  ts timestamptz NOT NULL DEFAULT now(),
  country text,
  region text,
  city text,
  lat double precision,
  lon double precision,
  referrer text,
  ua_hash text
);
CREATE INDEX visits_domain_id_ts_idx ON public.visits (domain_id, ts DESC);

GRANT SELECT ON public.visits TO authenticated;
GRANT INSERT ON public.visits TO anon;
GRANT ALL ON public.visits TO service_role;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read their domain visits"
  ON public.visits FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.domains d WHERE d.id = visits.domain_id AND d.user_id = auth.uid()));

CREATE POLICY "Anyone can insert visit pings"
  ON public.visits FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.tg_bump_visitor_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.domains SET visitor_count = COALESCE(visitor_count, 0) + 1 WHERE id = NEW.domain_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER visits_bump_count
  AFTER INSERT ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.tg_bump_visitor_count();

ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;
