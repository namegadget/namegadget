import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Lock, X, Loader2, Globe2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { createDealForDomain } from "@/lib/deals.functions";
import { createEscrowTransaction } from "@/lib/escrow.functions";

// Public server fn — uses anon publishable key, only reads listed domains.
const loadPublicDomain = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => z.object({ domain: z.string().min(1) }).parse(raw))
  .handler(async ({ data }) => {
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: row } = await client
      .from("domains")
      .select("id, domain_name, price, status, appraised_value")
      .ilike("domain_name", data.domain)
      .maybeSingle();
    return row ?? null;
  });

export const Route = createFileRoute("/d/$domain")({
  loader: async ({ params }) => {
    const row = await loadPublicDomain({ data: { domain: params.domain } });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.domain_name} is for sale — NameGadget` },
          { name: "description", content: `Buy ${loaderData.domain_name} securely via Escrow.com — brokered by NameGadget.` },
          { property: "og:title", content: `${loaderData.domain_name} is for sale` },
          { property: "og:description", content: `Secure Escrow.com checkout — brokered by NameGadget.` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Domain not found" }],
  }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Something went wrong</p>
        <p className="mt-2 font-mono text-sm">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-lg font-semibold">Domain not found</p>
        <p className="text-sm text-muted-foreground mt-1">This domain isn't listed on NameGadget.</p>
      </div>
    </div>
  ),
  component: PublicDomainLanding,
});

function PublicDomainLanding() {
  const d = Route.useLoaderData();
  const [buyOpen, setBuyOpen] = useState(false);

  const isSecured = d.status === "escrow_secured";
  const isSold = d.status === "sold";
  const isPending = d.status === "Pending Payment";
  const price = d.price ?? d.appraised_value ?? 0;

  if (isSold) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">{d.domain_name}</h1>
          <p className="text-muted-foreground mt-2">This domain has been sold.</p>
        </div>
      </div>
    );
  }

  if (isSecured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{d.domain_name}</h1>
          <p className="text-muted-foreground mt-2">Under Secure Transfer</p>
          <p className="text-xs text-muted-foreground mt-1" dir="rtl">قيد النقل الآمن</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-mono uppercase tracking-widest text-primary">
            <Lock className="h-3 w-3" /> Escrow secured
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Globe2 className="h-4 w-4 text-primary" /> NameGadget
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Brokered by Escrow.com</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">This domain is for sale</p>
        <h1 className="text-5xl md:text-6xl font-bold mt-3 tracking-tight">{d.domain_name}</h1>
        <p className="text-muted-foreground mt-3">
          Instant, secure ownership transfer — brokered escrow via Escrow.com.
        </p>

        <div className="mt-10 mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Buy Now Price</p>
          <p className="text-5xl font-bold mt-2 tabular-nums">
            {price > 0 ? `$${price.toLocaleString()}` : "Make Offer"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">USD</p>

          <button
            onClick={() => setBuyOpen(true)}
            disabled={isPending}
            className="mt-6 w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {isPending ? "Payment in progress…" : "Buy Now · شراء الآن"}
          </button>

          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Escrow protected</span>
            <span>·</span>
            <span>Money-back if transfer fails</span>
          </div>
        </div>
      </main>

      {buyOpen && !isPending && (
        <BuyNowModal
          domainId={d.id}
          domain={d.domain_name}
          price={price}
          onClose={() => setBuyOpen(false)}
        />
      )}
    </div>
  );
}

function BuyNowModal({
  domainId, domain, price, onClose,
}: { domainId: string; domain: string; price: number; onClose: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(price || 0);
  const [busy, setBusy] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  const createDeal = useServerFn(createDealForDomain);
  const createTx = useServerFn(createEscrowTransaction);

  // Prefill email from active session
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
      else setNeedsAuth(true);
    });
    return 0;
  });

  async function proceed() {
    if (!email || amount <= 0) return toast.error("Please provide a valid email and amount");
    setBusy(true);
    try {
      const dealRes = await createDeal({
        data: { domainId, offer: amount, buyerEmail: email, firstMessage: `Buy Now request at $${amount.toLocaleString()}.` },
      });
      const txRes = await createTx({
        data: {
          domain, amount, buyerEmail: email,
          domainId, dealId: dealRes.dealId,
          feeAllocation: "buyer", brokerTipBps: 0,
        },
      });
      if (!txRes.ok) throw new Error(txRes.error || "Escrow API rejected the transaction");
      if (txRes.paymentUrl) {
        window.open(txRes.paymentUrl, "_blank", "noopener,noreferrer");
      }
      toast.success("Escrow transaction created. Redirecting to payment…");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Could not create escrow transaction");
    } finally {
      setBusy(false);
    }
  }

  if (needsAuth) {
    return (
      <Overlay onClose={onClose}>
        <h2 className="text-lg font-semibold">Sign in to buy</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You'll need to sign in with the email you want linked to the Escrow.com transaction.
        </p>
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="mt-5 w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          Sign in
        </button>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Buy {domain}</h2>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Final price · USD</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">${amount.toLocaleString()}</p>
        </div>
        {price === 0 && (
          <label className="block">
            <span className="text-xs text-muted-foreground">Your offer (USD)</span>
            <input
              type="number" min={1}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full h-11 rounded-lg border border-border bg-background px-3 text-sm font-mono outline-none focus:border-primary"
            />
          </label>
        )}
        <label className="block">
          <span className="text-xs text-muted-foreground">Buyer Escrow Email</span>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <p className="text-[11px] text-muted-foreground">
          NameGadget acts as broker on Escrow.com. Fees are paid by the buyer by default.
        </p>
        <button
          onClick={proceed} disabled={busy}
          className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Proceed to Escrow payment
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}
