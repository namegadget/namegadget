import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — NameGadget" },
      { name: "description", content: "Simple pricing for domain investors. Free forever, or unlock Gadget+ AI appraisal, live visitor map, and outbound buyer discovery." },
      { property: "og:title", content: "NameGadget Pricing" },
      { property: "og:description", content: "Free forever, Gadget+ at $19.99/mo, Ultra Gadget at $49.99/mo." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Pricing,
});

type Tier = {
  id: "free" | "plus" | "ultra";
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  monthly: number;
  annual: number;
  tag: string;
  cta: string;
  highlight?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Gadget",
    icon: Sparkles,
    monthly: 0,
    annual: 0,
    tag: "Everything you need to start selling.",
    cta: "Start free",
    features: [
      "Portfolio for up to 25 domains",
      "Free-forever P2P sales — zero commission",
      "Escrow deal room + built-in chat",
      "5 lander templates",
      "Real-time dashboard",
    ],
  },
  {
    id: "plus",
    name: "Gadget+",
    icon: Zap,
    monthly: 19.99,
    annual: 199,
    tag: "AI-powered appraisal & buyer discovery.",
    cta: "Upgrade to Gadget+",
    highlight: true,
    features: [
      "Everything in Gadget",
      "Unlimited portfolio",
      "Gadget+ AI appraisal (DomainIQ-Pro engine)",
      "Outbound: AI buyer discovery + contact scraping",
      "Live visitor map (Leaflet geo)",
      "CSV export of leads",
      "Priority realtime sync",
    ],
  },
  {
    id: "ultra",
    name: "Ultra Gadget",
    icon: Crown,
    monthly: 49.99,
    annual: 499,
    tag: "For pro brokers running deal flow at scale.",
    cta: "Go Ultra",
    features: [
      "Everything in Gadget+",
      "White-label lander domains",
      "Dedicated broker workspace",
      "MCP agent integrations (ChatGPT, Claude)",
      "Bulk outbound campaigns",
      "Custom API access",
      "Priority human support",
    ],
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground mb-5 shadow-sm">
            <span className="h-5 w-5 rounded-full bg-primary inline-flex items-center justify-center text-primary-foreground text-[10px] font-bold">$</span>
            <span className="tracking-wide uppercase">Plans · Simple. Boutique.</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            One workspace. <span className="text-primary">Every tool.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Free forever for personal portfolios. Upgrade only when you want AI-grade appraisal, outbound discovery, and live visitor intelligence.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1">
            <ToggleBtn active={!annual} onClick={() => setAnnual(false)}>Monthly</ToggleBtn>
            <ToggleBtn active={annual} onClick={() => setAnnual(true)}>
              Annual <span className="ml-1 text-[10px] text-emerald-600 font-mono">−17%</span>
            </ToggleBtn>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((t) => (
            <PlanCard key={t.id} tier={t} annual={annual} />
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Every plan includes</h2>
          <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            {[
              "Zero-commission P2P sales",
              "Bank-grade escrow",
              "Real-time dashboard",
              "SSL-secured landers",
              "Multi-registrar sync",
              "Encrypted chat",
              "Buyer verification",
              "Portfolio public profile",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 justify-center">
                <Check className="h-4 w-4 text-primary" /> {f}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-4 inline-flex items-center rounded-lg text-xs font-semibold transition ${
        active ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >{children}</button>
  );
}

function PlanCard({ tier, annual }: { tier: Tier; annual: boolean }) {
  const Icon = tier.icon;
  const price = annual ? tier.annual / 12 : tier.monthly;
  const suffix = annual ? "/mo · billed yearly" : "/month";
  return (
    <div className={`relative rounded-2xl border p-6 md:p-8 flex flex-col ${
      tier.highlight
        ? "border-primary/60 bg-card shadow-lg shadow-primary/10 ring-1 ring-primary/20"
        : "border-border bg-card"
    }`}>
      {tier.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
          Most Popular
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-9 w-9 rounded-xl inline-flex items-center justify-center ${
          tier.highlight ? "bg-emerald-500 text-white" : "bg-muted text-primary"
        }`}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-xl font-bold">{tier.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{tier.tag}</p>

      <div className="mb-6">
        {tier.monthly === 0 ? (
          <div className="text-4xl font-bold">Free</div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">${price.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">{suffix}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          if (tier.id === "free") { window.location.href = "/auth"; return; }
          toast.success(`${tier.name} — coming soon. We'll email you the moment it's live.`);
        }}
        className={`h-11 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition ${
          tier.highlight
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-foreground text-background hover:opacity-90"
        }`}
      >
        {tier.cta} <ArrowRight className="h-4 w-4" />
      </button>

      <ul className="mt-7 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-6 border-t border-border text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">
        <Link to="/dashboard" className="hover:text-primary">Open workspace →</Link>
      </div>
    </div>
  );
}
