REVOKE ALL ON FUNCTION public.is_deal_participant(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_deal_participant(UUID) TO authenticated, service_role;