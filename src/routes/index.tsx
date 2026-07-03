import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { animate, stagger, createTimeline } from "animejs";
import { Fragment } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight, Activity, ShieldCheck, Radio,
  Layers, Bot, Handshake, Check, X, Sparkles, Infinity as InfinityIcon,
} from "lucide-react";
import logo from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: Landing,
});

/* ------------------------------- Helpers ------------------------------- */

function splitChars(text: string) {
  return text.split("").map((c, i) => (
    <span
      key={i}
      className="hero-char inline-block will-change-transform"
      style={{ whiteSpace: c === " " ? "pre" : "normal" }}
    >
      {c}
    </span>
  ));
}

/* ---------------------------- Live dashboard ---------------------------- */

type Row = {
  domain: string;
  registrar: string;
  days: number;
  visitors: number;
  status: "Parked" | "Active" | "Negotiation" | "For Sale";
};

const initialRows: Row[] = [
  { domain: "quantumleap.ai", registrar: "Cloudflare", days: 284, visitors: 1247, status: "Active" },
  { domain: "vaultstack.io",  registrar: "Porkbun",    days: 42,  visitors: 3812, status: "Negotiation" },
  { domain: "neurosend.com",  registrar: "Namecheap",  days: 611, visitors: 892,  status: "For Sale" },
  { domain: "atomforge.co",   registrar: "Dynadot",    days: 128, visitors: 2140, status: "Parked" },
  { domain: "prismloop.ai",   registrar: "Cloudflare", days: 19,  visitors: 5674, status: "Active" },
];

function StatusBadge({ status }: { status: Row["status"] }) {
  const map: Record<Row["status"], string> = {
    Parked:      "bg-white/5 text-white/60 border-white/10",
    Active:      "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    Negotiation: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    "For Sale":  "bg-sky-500/15 text-sky-300 border-sky-400/30",
  };
  return (
    <span className={`status-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider ${map[status]}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

function LiveDashboard() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const countersRef = useRef<HTMLDivElement>(null);

  // Continuous visitor tick
  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          const drift = Math.floor((Math.random() - 0.3) * 12);
          return { ...r, visitors: Math.max(0, r.visitors + drift) };
        }),
      );
    }, 1400);
    return () => clearInterval(id);
  }, []);

  // Animate counter numbers
  useEffect(() => {
    const els = countersRef.current?.querySelectorAll<HTMLElement>(".visitor-count");
    els?.forEach((el) => {
      const target = Number(el.dataset.value ?? 0);
      const current = Number(el.textContent?.replace(/,/g, "") ?? 0);
      const obj = { v: current };
      animate(obj, {
        v: target,
        duration: 900,
        ease: "outQuad",
        onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString(); },
      });
    });
  }, [rows]);

  // Occasionally toggle a status to fire the pulse effect
  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) => {
        const i = Math.floor(Math.random() * prev.length);
        const cycle: Row["status"][] = ["Parked", "Active", "Negotiation", "For Sale"];
        const next = cycle[(cycle.indexOf(prev[i].status) + 1) % cycle.length];
        return prev.map((r, idx) => (idx === i ? { ...r, status: next } : r));
      });
    }, 3200);
    return () => clearInterval(id);
  }, []);

  // Pulse newly changed badges
  useEffect(() => {
    const badges = countersRef.current?.querySelectorAll<HTMLElement>(".status-badge");
    if (!badges || badges.length === 0) return;
    animate(badges, {
      scale: [{ to: 1.08, duration: 180 }, { to: 1, duration: 220 }],
      opacity: [{ to: 0.6, duration: 120 }, { to: 1, duration: 240 }],
      ease: "inOutQuad",
      delay: stagger(40),
    });
  }, [rows.map((r) => r.status).join("|")]);

  return (
    <div ref={countersRef} className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_40px_120px_-20px_rgba(4,120,87,0.35)] overflow-hidden">
      {/* window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          Live · Portfolio Stream
        </div>
        <div className="text-[10px] font-mono text-white/30">NG-01</div>
      </div>

      {/* header row */}
      <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.9fr_1fr] gap-3 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/5">
        <div>Asset</div><div>Registrar</div><div>Expiry</div><div>Visitors</div><div>Status</div>
      </div>

      {/* rows */}
      <div className="divide-y divide-white/5">
        {rows.map((r) => (
          <div key={r.domain} className="grid grid-cols-[1.4fr_1fr_0.7fr_0.9fr_1fr] gap-3 items-center px-4 py-3 hover:bg-white/[0.02] transition-colors">
            <div className="min-w-0">
              <div className="text-sm text-white truncate font-medium">{r.domain}</div>
              <div className="text-[10px] text-white/30 font-mono">verified · rdap</div>
            </div>
            <div className="text-xs text-white/60 font-mono truncate">{r.registrar}</div>
            <div className={`text-xs font-mono ${r.days < 30 ? "text-red-400" : r.days < 90 ? "text-amber-300" : "text-white/60"}`}>
              {r.days}d
            </div>
            <div className="text-xs font-mono text-emerald-300">
              <span className="visitor-count" data-value={r.visitors}>{r.visitors.toLocaleString()}</span>
            </div>
            <div><StatusBadge status={r.status} /></div>
          </div>
        ))}
      </div>

      {/* footer strip */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.02] text-[10px] font-mono text-white/40">
        <span className="inline-flex items-center gap-1.5"><Activity className="h-3 w-3 text-emerald-400" /> RDAP + DNS synced</span>
        <span>0% commission · direct P2P</span>
      </div>
    </div>
  );
}

/* ------------------------------- Landing ------------------------------- */

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const heroRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const priceRefs = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  // Hero stagger + breathing CTA
  useEffect(() => {
    if (checking || !heroRef.current) return;
    const tl = createTimeline({ defaults: { ease: "outQuad" } });
    tl.add(".hero-eyebrow", { opacity: [0, 1], translateY: [12, 0], duration: 500 })
      .add(".hero-char",    { opacity: [0, 1], translateY: [24, 0], duration: 600, delay: stagger(18) }, "-=300")
      .add(".hero-sub",     { opacity: [0, 1], translateY: [16, 0], duration: 500 }, "-=200")
      .add(".hero-cta",     { opacity: [0, 1], translateY: [16, 0], duration: 500, delay: stagger(90) }, "-=200")
      .add(".hero-dash",    { opacity: [0, 1], translateY: [30, 0], scale: [0.98, 1], duration: 700 }, "-=300");

    if (ctaRef.current) {
      animate(ctaRef.current, {
        scale: [{ to: 1.035, duration: 1400 }, { to: 1, duration: 1400 }],
        ease: "inOutQuad",
        loop: true,
      });
    }
  }, [checking]);

  // Workflow scroll-triggered reveal
  useEffect(() => {
    if (!workflowRef.current) return;
    const el = workflowRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(el.querySelectorAll(".workflow-card"), {
              opacity: [0, 1],
              translateX: [-40, 0],
              duration: 700,
              ease: "outElastic(1, 0.7)",
              delay: stagger(150),
            });
            animate(el.querySelectorAll(".workflow-line"), {
              scaleX: [0, 1],
              duration: 700,
              ease: "outQuad",
              delay: stagger(150, { start: 200 }),
            });
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Billing toggle: bounce pill + refresh price numbers
  useEffect(() => {
    if (pillRef.current) {
      animate(pillRef.current, {
        scale: [{ to: 1.12, duration: 220 }, { to: 1, duration: 320 }],
        ease: "outElastic(1, 0.6)",
      });
    }
    const nums = priceRefs.current?.querySelectorAll<HTMLElement>(".price-num");
    if (nums) {
      animate(nums, {
        opacity: [0.2, 1],
        scale: [0.92, 1],
        duration: 420,
        ease: "outQuad",
        delay: stagger(60),
      });
    }
  }, [billing]);

  if (checking) return <div className="min-h-screen bg-background" />;

  const go = () => navigate({ to: "/auth" });

  const tiers = [
    {
      name: "Gadget",
      tag: "Free",
      priceMonthly: 0, priceAnnual: 0,
      bullets: [
        "Track & manage up to 25 domains",
        "5 AI appraisal credits / month",
        "Standard static landing pages",
        "Direct P2P checkout links",
      ],
      cta: "Get Started Free",
      highlight: false,
      icon: Layers,
    },
    {
      name: "Gadget plus",
      tag: "Most Popular",
      priceMonthly: 19.99, priceAnnual: 16.99,
      bullets: [
        "Unlimited domain assets",
        "Full AI + Corporate Outbound Leads",
        "gadget+ Live Pulse Simulator",
        "All premium motion landing templates",
      ],
      cta: "Upgrade to Gadget Plus",
      highlight: true,
      icon: Sparkles,
    },
    {
      name: "Ultra gadget",
      tag: "Power",
      priceMonthly: 49.99, priceAnnual: 42.99,
      bullets: [
        "All Gadget plus features",
        "Bulk Import / Export automation",
        "Priority AI processing pipeline",
        "Early access · in-house registrar",
      ],
      cta: "Go Ultra",
      highlight: false,
      icon: InfinityIcon,
    },
  ];

  const compareRows = [
    { label: "Marketplace commission",  legacy: "15–25%",      us: "0% — always" },
    { label: "Broker intervention",      legacy: "Mandatory",   us: "None. P2P self-negotiation" },
    { label: "Live portfolio telemetry", legacy: "Daily / stale", us: "Real-time RDAP + DNS" },
    { label: "Lead generation",          legacy: "Manual",      us: "gadget AI · outbound leads" },
    { label: "Landing pages",            legacy: "Static",      us: "Motion-driven templates" },
    { label: "Bulk ops",                 legacy: "Limited",     us: "CSV + API automation" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <img src={logo.url} alt="NameGadget" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <a href="#pricing" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">Pricing</a>
          <a href="#compare" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">Compare</a>
          <button onClick={go} className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
            Sign in
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none [background:radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-10 md:pt-16 pb-16 md:pb-24 text-center">
          <div className="hero-eyebrow opacity-0 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
            Live · 0% commission · BYOL
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            <span className="block">{splitChars("Your Domain Portfolio's")}</span>
            <span className="block">{splitChars("Live Heartbeat.")}</span>
            <span className="block gradient-brand bg-clip-text text-transparent">
              {splitChars("0% Commission.")}
            </span>
          </h1>

          <p className="hero-sub opacity-0 mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time RDAP + DNS telemetry across your entire portfolio. AI appraisal, outbound
            corporate leads, and a peer-to-peer deal room where you negotiate directly — no
            brokers, no fees, no friction.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              ref={ctaRef}
              onClick={go}
              className="hero-cta opacity-0 inline-flex items-center gap-2 rounded-md gradient-brand text-primary-foreground px-6 py-3 text-sm font-semibold glow-cyan hover:opacity-95 transition"
            >
              + Launch Dashboard Free <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#pricing"
              className="hero-cta opacity-0 inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary transition"
            >
              Explore Tiers
            </a>
          </div>

          <div className="hero-dash opacity-0 mt-14 md:mt-20 max-w-4xl mx-auto">
            <LiveDashboard />
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section ref={workflowRef} className="relative py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-3">
              The Framework
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Three moves. Zero friction.
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {[
              { n: "01", t: "Centralize & Monitor", d: "Import your portfolio and unlock live RDAP, DNS, expiry, and traffic telemetry — one command center.", icon: Layers },
              { n: "02", t: "Deploy Gadget AI",     d: "Instant valuation, competitor scan, and corporate lead extraction. Turn every asset into a warm outbound.", icon: Bot },
              { n: "03", t: "Self-Negotiate & Close", d: "Direct buyer-seller deal room with escrow. You negotiate. We stay out. 0% commission. Always.", icon: Handshake },
            ].map((s, i, arr) => (
              <div key={s.n} className="relative">
                <div className="workflow-card opacity-0 rounded-2xl border border-border bg-card p-6 h-full hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-muted-foreground tracking-widest">STEP {s.n}</span>
                    <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <s.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="workflow-line hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-primary/40 origin-left"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section id="compare" className="relative py-20 md:py-28 border-t border-border bg-secondary/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-3">
              Disruption Grid
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              NameGadget vs. Traditional Marketplaces
            </h2>
          </div>

          <div className="grid grid-cols-[1.1fr_1fr_1fr] rounded-2xl border border-border bg-card overflow-hidden">
            {/* header */}
            <div className="p-4 md:p-5 border-b border-border text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Metric
            </div>
            <div className="p-4 md:p-5 border-b border-l border-border text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Legacy</div>
              <div className="mt-1 text-sm font-semibold text-foreground/60">Traditional marketplaces</div>
            </div>
            <ComparePremiumHeader />

            {compareRows.map((r) => (
              <Fragment key={r.label}>
                <div className="p-4 md:p-5 border-t border-border text-sm text-muted-foreground">
                  {r.label}
                </div>
                <div className="p-4 md:p-5 border-t border-l border-border text-sm text-foreground/60 flex items-center gap-2">
                  <X className="h-4 w-4 text-danger/70 shrink-0" />
                  <span>{r.legacy}</span>
                </div>
                <div className="compare-us p-4 md:p-5 border-t border-l border-primary/30 text-sm text-foreground bg-primary/5 flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">{r.us}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-3">
              Pricing
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Pick your intensity.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Every tier keeps 0% commissions and pure peer-to-peer negotiation. You bring the lead. You close the deal.
            </p>
          </div>

          {/* billing toggle */}
          <div className="flex items-center justify-center mb-10">
            <div className="relative inline-flex items-center rounded-full border border-border bg-card p-1">
              <span
                ref={pillRef}
                className="absolute top-1 bottom-1 rounded-full gradient-brand transition-[left,width] duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
                style={{
                  left: billing === "monthly" ? "4px" : "50%",
                  width: "calc(50% - 4px)",
                }}
              />
              {(["monthly", "annual"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setBilling(k)}
                  className={`relative z-10 px-5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors ${
                    billing === k ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {k} {k === "annual" && <span className="opacity-80">· save 15%</span>}
                </button>
              ))}
            </div>
          </div>

          <div ref={priceRefs} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((t) => {
              const price = billing === "monthly" ? t.priceMonthly : t.priceAnnual;
              return (
                <div
                  key={t.name}
                  className={`group relative rounded-2xl border p-6 md:p-7 backdrop-blur transition-all overflow-hidden ${
                    t.highlight
                      ? "border-primary/40 bg-card shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
                      : "border-border bg-card/70 hover:border-primary/30"
                  }`}
                >
                  {t.highlight && (
                    <div className="absolute inset-0 pointer-events-none [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_60%)]" />
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <t.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm font-semibold">{t.name}</div>
                      </div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${
                        t.highlight ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>{t.tag}</span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="price-num text-4xl md:text-5xl font-bold tracking-tight">
                        {price === 0 ? "$0" : `$${price.toFixed(2)}`}
                      </span>
                      <span className="text-xs text-muted-foreground">/ mo</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mb-6">
                      {billing === "annual" && price > 0 ? "billed annually" : "no card required"}
                    </div>

                    <ul className="space-y-2.5 mb-7">
                      {t.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={go}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition ${
                        t.highlight
                          ? "gradient-brand text-primary-foreground glow-cyan hover:opacity-95"
                          : "border border-border bg-card hover:bg-secondary"
                      }`}
                    >
                      {t.cta} <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            BYOL · 0% commission · pure P2P. You negotiate directly with every buyer.
          </p>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo.url} alt="NameGadget" className="h-6 w-auto opacity-80" />
            <span>© {new Date().getFullYear()} NameGadget</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#compare" className="hover:text-foreground">Compare</a>
            <button onClick={go} className="hover:text-foreground">Sign in</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ComparePremiumHeader() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        if (ref.current) animate(ref.current, { scale: 1.02, duration: 320, ease: "outQuad" });
        const col = document.querySelectorAll<HTMLElement>(".compare-us");
        animate(col, { backgroundColor: "color-mix(in oklab, var(--primary) 12%, transparent)", duration: 320, ease: "outQuad" });
      }}
      onMouseLeave={() => {
        if (ref.current) animate(ref.current, { scale: 1, duration: 320, ease: "outQuad" });
        const col = document.querySelectorAll<HTMLElement>(".compare-us");
        animate(col, { backgroundColor: "color-mix(in oklab, var(--primary) 5%, transparent)", duration: 320, ease: "outQuad" });
      }}
      className="p-4 md:p-5 border-b border-l border-primary/30 text-center bg-primary/5 will-change-transform"
      style={{ transformOrigin: "center" }}
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3 w-3" /> NameGadget
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">Premium system</div>
    </div>
  );
}

