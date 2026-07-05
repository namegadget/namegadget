ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS selected_lander text NOT NULL DEFAULT 'afternic';
ALTER PUBLICATION supabase_realtime ADD TABLE public.domains;