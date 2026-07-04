import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Escrow.com webhook receiver.
 * Configure in Escrow.com dashboard to POST here with header
 *   x-escrow-signature: <hex hmac-sha256 of raw body using ESCROW_WEBHOOK_SECRET>
 *
 * Payload we care about (Escrow.com "transaction" event):
 *   { transaction: { id, status: "created"|"in_progress"|"secured"|"closed"|... } }
 */
export const Route = createFileRoute("/api/public/webhooks/escrow")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.ESCROW_WEBHOOK_SECRET;
        const raw = await request.text();

        // Signature verification (only enforced when secret is set)
        if (secret) {
          const sig = request.headers.get("x-escrow-signature") || "";
          const expected = createHmac("sha256", secret).update(raw).digest("hex");
          const a = Buffer.from(sig);
          const b = Buffer.from(expected);
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return new Response("invalid signature", { status: 401 });
          }
        }

        let payload: any;
        try { payload = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

        const tx = payload.transaction ?? payload;
        const transactionId: string | undefined = tx?.id ? String(tx.id) : undefined;
        const status: string | undefined = tx?.status;
        if (!transactionId || !status) {
          return new Response("missing transaction id/status", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: record } = await supabaseAdmin
          .from("escrow_transactions")
          .select("id, deal_id, domain_id, domain_name, buyer_email")
          .eq("transaction_id", transactionId)
          .maybeSingle();

        if (!record) return new Response("unknown transaction", { status: 202 });

        await supabaseAdmin
          .from("escrow_transactions")
          .update({ status, raw: payload })
          .eq("id", record.id);

        // Map Escrow.com status → domain + deal state
        if (status === "secured" || status === "in_progress") {
          if (record.domain_id) {
            await supabaseAdmin
              .from("domains")
              .update({ status: "escrow_secured" })
              .eq("id", record.domain_id);
          }
          if (record.deal_id) {
            await supabaseAdmin.from("deals").update({ stage: "Paid" }).eq("id", record.deal_id);
            await supabaseAdmin.from("deal_messages").insert({
              deal_id: record.deal_id,
              sender_role: "system",
              body: "🔒 Payment Secured! Seller, please transfer the domain now.",
            });
          }
        } else if (status === "closed" || status === "completed") {
          if (record.domain_id) {
            await supabaseAdmin
              .from("domains")
              .update({ status: "sold" })
              .eq("id", record.domain_id);
          }
          if (record.deal_id) {
            await supabaseAdmin.from("deals").update({ stage: "Completed" }).eq("id", record.deal_id);
            await supabaseAdmin.from("deal_messages").insert({
              deal_id: record.deal_id,
              sender_role: "system",
              body: "✅ Deal complete — domain transferred and funds released.",
            });
          }
        } else if (status === "cancelled" || status === "canceled") {
          if (record.domain_id) {
            await supabaseAdmin.from("domains").update({ status: "Listed" }).eq("id", record.domain_id);
          }
          if (record.deal_id) {
            await supabaseAdmin.from("deals").update({ stage: "Closed" }).eq("id", record.deal_id);
          }
        }

        return Response.json({ ok: true });
      },
    },
  },
});
