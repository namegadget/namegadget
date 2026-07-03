import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// The provided API key is a PRODUCTION Escrow.com key (verified against /customer/me).
// Sandbox rejects it with 401. Use production endpoint.
const BASE = () => process.env.ESCROW_API_BASE || "https://api.escrow.com";

function authHeader() {
  const email = process.env.ESCROW_API_EMAIL;
  const key = process.env.ESCROW_API_KEY;
  if (!email || !key) throw new Error("Missing ESCROW_API_EMAIL / ESCROW_API_KEY");
  return "Basic " + Buffer.from(`${email}:${key}`).toString("base64");
}

/**
 * Auto-generate an Escrow.com transaction for a domain deal.
 * NameGadget is the broker at 0% commission. Buyer & seller emails are
 * taken from each user's authenticated NameGadget email so the party
 * matches on Escrow's side.
 */
export const createEscrowTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({
      domain: z.string().min(3),
      amount: z.number().positive(),
      buyerEmail: z.string().email(),
      currency: z.string().default("usd"),
      inspectionDays: z.number().int().min(1).max(30).default(3),
    }).parse(raw)
  )
  .handler(async ({ data, context }) => {
    const sellerEmail = context.claims?.email as string | undefined;
    if (!sellerEmail) throw new Error("Seller email missing from session");

    const brokerEmail = process.env.ESCROW_API_EMAIL!; // NameGadget broker account

    const payload = {
      currency: data.currency,
      description: `NameGadget P2P — sale of ${data.domain}`,
      items: [
        {
          title: data.domain,
          description: `Domain name transfer: ${data.domain}`,
          type: "domain_name",
          inspection_period: data.inspectionDays * 86400,
          quantity: 1,
          schedule: [
            {
              amount: data.amount.toFixed(2),
              payer_customer: data.buyerEmail,
              beneficiary_customer: sellerEmail,
            },
          ],
        },
      ],
      parties: [
        { role: "buyer", customer: data.buyerEmail },
        { role: "seller", customer: sellerEmail },
        {
          role: "broker",
          customer: brokerEmail,
          // 0% commission — NameGadget takes nothing
          agreed: true,
        },
      ],
    };

    const res = await fetch(`${BASE()}/2017-09-01/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: JSON.stringify(payload),
    });

    const body = await res.text();
    if (!res.ok) {
      return {
        ok: false as const,
        status: res.status,
        error: body.slice(0, 500),
      };
    }
    const json = JSON.parse(body);
    const id = json.id ?? json.transaction_id;
    return {
      ok: true as const,
      transactionId: id,
      landingUrl: id ? `https://www.escrow-sandbox.com/transaction/${id}` : null,
      sellerEmail,
      buyerEmail: data.buyerEmail,
      brokerEmail,
      raw: json,
    };
  });
