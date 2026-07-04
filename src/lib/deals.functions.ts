import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// -------- Create deal from public landing page (Buy Now / Make Offer) --------
export const createDealForDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({
      domainId: z.string().uuid(),
      offer: z.number().int().nonnegative(),
      buyerEmail: z.string().email(),
      buyerName: z.string().max(120).optional(),
      firstMessage: z.string().max(1000).optional(),
    }).parse(raw)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: domain, error: dErr } = await supabase
      .from("domains")
      .select("id, domain_name, user_id, status, price")
      .eq("id", data.domainId)
      .maybeSingle();
    if (dErr || !domain) throw new Error("Domain not found or not listed");
    if (!["Listed", "Pending Payment"].includes(domain.status)) {
      throw new Error("Domain is not available for offers");
    }

    // Buyer email must match session email (RLS also enforces this)
    const sessionEmail = (claims?.email as string | undefined)?.toLowerCase();
    if (!sessionEmail || sessionEmail !== data.buyerEmail.toLowerCase()) {
      throw new Error("Buyer email must match your account email");
    }

    const { data: deal, error: iErr } = await supabase
      .from("deals")
      .insert({
        domain_id: domain.id,
        domain_name: domain.domain_name,
        seller_id: domain.user_id,
        buyer_id: userId,
        buyer_email: data.buyerEmail,
        buyer_name: data.buyerName ?? null,
        offer: data.offer,
        stage: "Inbound",
      })
      .select("id")
      .single();
    if (iErr || !deal) throw new Error(iErr?.message || "Could not create deal");

    if (data.firstMessage) {
      await supabase.from("deal_messages").insert({
        deal_id: deal.id,
        sender_role: "buyer",
        sender_id: userId,
        body: data.firstMessage,
      });
    }

    return { ok: true as const, dealId: deal.id };
  });

// -------- Update stage --------
export const updateDealStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({
      dealId: z.string().uuid(),
      stage: z.enum(["Inbound", "Negotiating", "Agreed", "Paid", "Completed", "Closed"]),
    }).parse(raw)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("deals")
      .update({ stage: data.stage })
      .eq("id", data.dealId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// -------- Update offer/counter --------
export const updateDealAmounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({
      dealId: z.string().uuid(),
      offer: z.number().int().nonnegative().optional(),
      counter: z.number().int().nonnegative().optional(),
    }).parse(raw)
  )
  .handler(async ({ data, context }) => {
    const patch: Record<string, number | null> = {};
    if (data.offer !== undefined) patch.offer = data.offer;
    if (data.counter !== undefined) patch.counter = data.counter;
    if (Object.keys(patch).length === 0) return { ok: true as const };
    const { error } = await context.supabase
      .from("deals")
      .update(patch)
      .eq("id", data.dealId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
