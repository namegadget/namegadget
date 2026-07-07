ALTER TABLE public.domains DROP CONSTRAINT IF EXISTS domains_status_check;
ALTER TABLE public.domains ADD CONSTRAINT domains_status_check
  CHECK (status IN ('Parked','For Sale','Negotiating','Sold','Listed','Pending Payment','escrow_secured','sold'));