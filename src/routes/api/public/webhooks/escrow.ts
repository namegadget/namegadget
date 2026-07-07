import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Escrow.com webhook receiver.
 * Every request is logged to public.escrow_webhook_logs for admin review.
 */
export const Route = createFileRoute("/api/public/webhooks/escrow")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.ESCROW_WEBHOOK_SECRET;
        const raw = await request.text();
        const headers: Record<string, string> = {};
        request.headers.forEach((v, k) => { headers[k] = v; });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Helper to persist a log line, never throwing.
        async function log(entry: {
          transaction_id?: string | null;
          status?: string | null;
          signature_valid: boolean;
          matched_record_id?: string | null;
          error?: string | null;
          raw?: unknown;
        }) {
          try {
            await supabaseAdmin.from("escrow_webhook_logs").insert({
              transaction_id: entry.transaction_id ?? null,
              status: entry.status ?? null,
              signature_valid: entry.signature_valid,
              matched_record_id: entry.matched_record_id ?? null,
              error: entry.error ?? null,
              raw: (entry.raw ?? null) as never,
              headers,
            });
          } catch { /* swallow — logging must never break the webhook */ }
        }

        // Signature verification (only enforced when secret is set)
        let signatureValid = !secret;
        if (secret) {
          const sig = request.headers.get("x-escrow-signature") || "";
          const expected = createHmac("sha256", secret).update(raw).digest("hex");
          const a = Buffer.from(sig);
          const b = Buffer.from(expected);
          signatureValid = a.length === b.length && timingSafeEqual(a, b);
          if (!signatureValid) {
            await log({ signature_valid: false, error: "invalid signature", raw: raw.slice(0, 2000) });
            return new Response("invalid signature", { status: 401 });
          }
        }

        let payload: unknown;
        try { payload = JSON.parse(raw); } catch {
          await log({ signature_valid: signatureValid, error: "bad json", raw: raw.slice(0, 2000) });
          return new Response("bad json", { status: 400 });
        }

        const p = payload as { transaction?: { id?: unknown; status?: unknown } } & { id?: unknown; status?: unknown };
        const tx = p.transaction ?? p;
        const transactionId: string | undefined = tx?.id != null ? String(tx.id) : undefined;
        const status: string | undefined = typeof tx?.status === "string" ? tx.status : undefined;
        if (!transactionId || !status) {
          await log({ signature_valid: signatureValid, transaction_id: transactionId ?? null, status: status ?? null, error: "missing transaction id/status", raw: payload });
          return new Response("missing transaction id/status", { status: 400 });
        }

        const { data: record } = await supabaseAdmin
          .from("escrow_transactions")
          .select("id, deal_id, domain_id, domain_name, buyer_email")
          .eq("transaction_id", transactionId)
          .maybeSingle();

        if (!record) {
          await log({ signature_valid: signatureValid, transaction_id: transactionId, status, error: "unknown transaction", raw: payload });
          return new Response("unknown transaction", { status: 202 });
        }

        await supabaseAdmin
          .from("escrow_transactions")
          .update({ status, raw: payload })
          .eq("id", record.id);

        // Map Escrow.com status → domain + deal state
        if (status === "secured" || status === "in_progress") {
          if (record.domain_id) {
            await supabaseAdmin.from("domains").update({ status: "escrow_secured" }).eq("id", record.domain_id);
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
            await supabaseAdmin.from("domains").update({ status: "sold" }).eq("id", record.domain_id);
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

        await log({ signature_valid: signatureValid, transaction_id: transactionId, status, matched_record_id: record.id, raw: payload });
        return Response.json({ ok: true });
      },
    },
  },
});
