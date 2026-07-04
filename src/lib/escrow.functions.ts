import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Escrow.com Integrations API. Production base is used because the credentials
// provisioned for this project are production credentials.
const BASE = process.env.ESCROW_API_BASE || "https://api.escrow.com";

function authHeader() {
  const email = process.env.ESCROW_API_EMAIL;
  const key = process.env.ESCROW_API_KEY;
  if (!email || !key) throw new Error("Missing ESCROW_API_EMAIL / ESCROW_API_KEY");
  return "Basic " + Buffer.from(`${email}:${key}`).toString("base64");
}

const FeeAllocation = z.enum(["buyer", "seller", "split"]);

const CreateInput = z.object({
  domain: z.string().min(3),
  amount: z.number().positive(),
  buyerEmail: z.string().email(),
  sellerEmail: z.string().email().optional(),
  currency: z.string().default("usd"),
  inspectionDays: z.number().int().min(1).max(30).default(3),
  feeAllocation: FeeAllocation.default("split"),
  brokerTipBps: z.number().int().min(0).max(2000).default(0), // 0-20% tip to NameGadget
  domainId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
});

/**
 * Create an Escrow.com transaction with NameGadget acting as broker.
 * Persists an escrow_transactions row and updates domain/deal status.
 */
export const createEscrowTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => CreateInput.parse(raw))
  .handler(async ({ data, context }) => {
    const sessionEmail = context.claims?.email as string | undefined;
    const sellerEmail = data.sellerEmail || sessionEmail;
    if (!sellerEmail) throw new Error("Seller email required");

    const brokerEmail = process.env.ESCROW_API_EMAIL!;
    const inspectionSecs = data.inspectionDays * 86400;
    const amountStr = data.amount.toFixed(2);

    // Broker tip = amount * bps / 10000, added as a broker-directed fee item.
    const brokerFee = Math.round((data.amount * data.brokerTipBps) / 100) / 100;

    // Map fee allocation → who pays escrow platform fees on the item.
    const feePayer =
      data.feeAllocation === "buyer" ? data.buyerEmail
      : data.feeAllocation === "seller" ? sellerEmail
      : null; // split: omit → Escrow default (typically 50/50)

    const schedule: Array<Record<string, string>> = [
      {
        amount: amountStr,
        payer_customer: data.buyerEmail,
        beneficiary_customer: sellerEmail,
      },
    ];
    if (brokerFee > 0) {
      schedule.push({
        amount: brokerFee.toFixed(2),
        payer_customer: data.buyerEmail,
        beneficiary_customer: brokerEmail,
      });
    }

    const item: Record<string, unknown> = {
      title: data.domain,
      description: `Domain name transfer: ${data.domain}`,
      type: "domain_name",
      inspection_period: inspectionSecs,
      quantity: 1,
      schedule,
    };
    if (feePayer) {
      item.fees = [{ type: "escrow", payer_customer: feePayer }];
    }

    const payload = {
      currency: data.currency,
      description: `NameGadget brokered sale — ${data.domain}`,
      items: [item],
      parties: [
        { role: "buyer", customer: data.buyerEmail, initiator: data.feeAllocation !== "seller" },
        { role: "seller", customer: sellerEmail, initiator: data.feeAllocation === "seller" },
        { role: "broker", customer: brokerEmail, agreed: true },
      ],
    };

    const res = await fetch(`${BASE}/2017-09-01/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: JSON.stringify(payload),
    });
    const body = await res.text();

    if (!res.ok) {
      return { ok: false as const, status: res.status, error: body.slice(0, 800) };
    }

    const json = JSON.parse(body);
    const txId: string | undefined = json.id ?? json.transaction_id;
    const landingUrl: string | null =
      json.landing_page || (txId ? `https://www.escrow.com/transaction/${txId}` : null);
    const paymentUrl: string | null =
      json.payment_url || landingUrl;

    // Persist. Uses service role so RLS/GRANTs on escrow_transactions can stay tight.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("escrow_transactions").insert({
      transaction_id: txId ? String(txId) : null,
      domain_id: data.domainId ?? null,
      deal_id: data.dealId ?? null,
      domain_name: data.domain,
      seller_id: context.userId,
      buyer_email: data.buyerEmail,
      seller_email: sellerEmail,
      amount: Math.round(data.amount * 100) / 100,
      currency: data.currency,
      broker_tip_bps: data.brokerTipBps,
      fee_allocation: data.feeAllocation,
      payment_url: paymentUrl,
      landing_url: landingUrl,
      status: "created",
      raw: json,
    });

    if (data.domainId) {
      await supabaseAdmin
        .from("domains")
        .update({ status: "Pending Payment" })
        .eq("id", data.domainId);
    }
    if (data.dealId && txId) {
      await supabaseAdmin
        .from("deals")
        .update({ escrow_transaction_id: String(txId), stage: "Agreed" })
        .eq("id", data.dealId);
    }

    return {
      ok: true as const,
      transactionId: txId ? String(txId) : null,
      paymentUrl,
      landingUrl,
      sellerEmail,
      buyerEmail: data.buyerEmail,
      brokerEmail,
    };
  });
