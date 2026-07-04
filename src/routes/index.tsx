import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, Fragment } from "react";
import { animate, stagger, createTimeline } from "animejs";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight, Activity, ShieldCheck, Radio, Copy, Check, X,
  Layers, Bot, Handshake, Sparkles, Infinity as InfinityIcon,
  Plus, Code2, LineChart as LineChartIcon, MessageSquare, Wallet,
  Globe, Zap, Users, Clock, CircleDollarSign, TrendingUp,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import logo from "@/assets/logo.png.asset.json";
import founderImg from "@/assets/founder.jpg.asset.json";

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
    Parked:      "bg-muted text-muted-foreground border-border",
    Active:      "bg-primary/10 text-primary border-primary/30",
    Negotiation: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    "For Sale":  "bg-sky-500/10 text-sky-700 border-sky-500/30",
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
  const [liveCount, setLiveCount] = useState(24);
  const countersRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          const drift = Math.floor((Math.random() - 0.3) * 12);
          return { ...r, visitors: Math.max(0, r.visitors + drift) };
        }),
      );
      setLiveCount((c) => Math.max(8, c + Math.floor((Math.random() - 0.4) * 5)));
    }, 1400);
    return () => clearInterval(id);
  }, []);

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
    if (liveRef.current) {
      const cur = Number(liveRef.current.textContent ?? 0);
      const o = { v: cur };
      animate(o, {
        v: liveCount, duration: 600, ease: "outQuad",
        onUpdate: () => { if (liveRef.current) liveRef.current.textContent = String(Math.round(o.v)); },
      });
    }
  }, [rows, liveCount]);

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
    <div ref={countersRef} className="relative rounded-2xl border border-border bg-card shadow-[0_40px_120px_-30px_color-mix(in_oklab,var(--primary)_35%,transparent)] overflow-hidden">
      {/* window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <img src={logo.url} alt="" className="h-5 w-auto opacity-90" />
          <span className="text-xs font-semibold">Portfolio · quantumleap.ai</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/30 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3 w-3" /> verified
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-mono text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          <span ref={liveRef}>{liveCount}</span> live
        </div>
      </div>

      {/* header row */}
      <div className="hidden sm:grid grid-cols-[1.4fr_1fr_0.7fr_0.9fr_1fr] gap-3 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
        <div>Asset</div><div>Registrar</div><div>Expiry</div><div>Visitors</div><div>Status</div>
      </div>

      {/* rows */}
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.domain} className="grid grid-cols-[1.4fr_0.7fr_0.9fr_1fr] sm:grid-cols-[1.4fr_1fr_0.7fr_0.9fr_1fr] gap-3 items-center px-4 py-3 hover:bg-secondary/40 transition-colors">
            <div className="min-w-0">
              <div className="text-sm text-foreground truncate font-medium">{r.domain}</div>
              <div className="text-[10px] text-muted-foreground font-mono">rdap · dns synced</div>
            </div>
            <div className="hidden sm:block text-xs text-muted-foreground font-mono truncate">{r.registrar}</div>
            <div className={`text-xs font-mono ${r.days < 30 ? "text-danger" : r.days < 90 ? "text-warning" : "text-muted-foreground"}`}>
              {r.days}d
            </div>
            <div className="text-xs font-mono text-primary">
              <span className="visitor-count" data-value={r.visitors}>{r.visitors.toLocaleString()}</span>
            </div>
            <div><StatusBadge status={r.status} /></div>
          </div>
        ))}
      </div>

      {/* footer strip */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/50 text-[10px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Activity className="h-3 w-3 text-primary" /> RDAP + DNS synced</span>
        <span>0% commission · direct P2P</span>
      </div>
    </div>
  );
}

/* ----------------------------- Bloat chart ----------------------------- */

const bloatData = [
  { name: "GoDaddy Auctions",  fee: 20, color: "#f97316" },
  { name: "Afternic",          fee: 15, color: "#ef4444" },
  { name: "Sedo",              fee: 15, color: "#a855f7" },
  { name: "Dan.com",           fee: 9,  color: "#f59e0b" },
  { name: "NameGadget",        fee: 0,  color: "#047857" },
];

function BloatChart({ inView }: { inView: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold text-foreground">Marketplace commission</div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">% cut per sale</div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={bloatData}
            margin={{ top: 4, right: 40, bottom: 4, left: 4 }}
            barCategoryGap={14}
          >
            <XAxis type="number" hide domain={[0, 25]} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar
              dataKey="fee"
              radius={[0, 6, 6, 0]}
              isAnimationActive={inView}
              animationDuration={1100}
              animationEasing="ease-out"
            >
              {bloatData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
              <LabelList
                dataKey="fee"
                position="right"
                formatter={(v: unknown) => (Number(v) === 0 ? "0% — flat" : `${v}%`)}
                style={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-primary font-medium">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
        NameGadget locks flat 0% — forever.
      </div>
    </div>
  );
}

/* ------------------------------- Landing ------------------------------- */

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [bloatVisible, setBloatVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const bloatRef = useRef<HTMLDivElement>(null);
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
      .add(".hero-char",    { opacity: [0, 1], translateY: [25, 0], duration: 700, delay: stagger(20) }, "-=300")
      .add(".hero-sub",     { opacity: [0, 1], translateY: [16, 0], duration: 500 }, "-=300")
      .add(".hero-cta",     { opacity: [0, 1], translateY: [16, 0], duration: 500, delay: stagger(80) }, "-=200")
      .add(".hero-dash",    { opacity: [0, 1], translateY: [30, 0], scale: [0.98, 1], duration: 700 }, "-=300");

    if (ctaRef.current) {
      animate(ctaRef.current, {
        scale: [{ to: 1.03, duration: 1400 }, { to: 1, duration: 1400 }],
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
              translateY: [30, 0],
              duration: 700,
              ease: "outElastic(1, 0.75)",
              delay: stagger(140),
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
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Bloat chart scroll reveal (triggers recharts animation)
  useEffect(() => {
    if (!bloatRef.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { setBloatVisible(true); io.disconnect(); }
      }),
      { threshold: 0.25 },
    );
    io.observe(bloatRef.current);
    return () => io.disconnect();
  }, []);

  // Billing toggle bounce
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

  const scriptTag = `<script src="https://cdn.namegadget.io/pulse.js" data-portfolio="ng-xxx"></script>`;

  const copyScript = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const tiers = [
    {
      name: "Gadget",
      tag: "Free",
      priceMonthly: 0, priceAnnual: 0,
      bullets: [
        "Track & manage up to 25 domains",
        "5 AI appraisal credits / month",
        "Standard static landing pages",
        "Raw P2P chat + checkout links",
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
        "UNLIMITED domain assets",
        "Full AI appraisal + Outbound Leads engine",
        "gadget+ Live Pulse Simulator feed",
        "Premium motion landing templates",
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
        "Everything in Gadget Plus",
        "Bulk Import / Export CSV automation",
        "Priority AI processing queue",
        "Early access · in-house registrar",
      ],
      cta: "Go Ultra",
      highlight: false,
      icon: InfinityIcon,
    },
  ];

  const bento = [
    { icon: Layers,    t: "Aggregated Portfolio",  d: "One command center for every registrar, every asset, every expiry." },
    { icon: Bot,       t: "AI Outbound Leads",     d: "gadget AI extracts and warms corporate buyers directly from your keywords." },
    { icon: TrendingUp,t: "Live Trends",           d: "Real-time keyword volume + brand registration spikes on your radar." },
    { icon: Handshake, t: "Zero-Broker Settlement",d: "Buyer talks to seller. No middleman. Escrow, Atompay, Safepay integrated." },
  ];

  const faqs = [
    { q: "How does 0% commission actually work?", a: "It's the moat. NameGadget makes money on subscriptions, not sales. Every dollar a buyer pays lands in your wallet — we never touch it. Escrow / Atompay / Safepay handle settlement natively." },
    { q: "What does BYOL (Bring Your Own Lead) mean?", a: "You are the seller and the closer. gadget AI surfaces corporate outbound leads, but every conversation is peer-to-peer. No broker calls a buyer on your behalf, ever." },
    { q: "Can I use my current registrar?", a: "Yes. We track any domain via RDAP + DNS regardless of registrar — Cloudflare, Porkbun, Namecheap, Dynadot, GoDaddy, all of them. Our in-house registrar (Ultra tier beta) is optional and cost-plus." },
    { q: "How does the P2P deal room work?", a: "Every listing generates a private negotiation room. Buyer offers, you counter — directly, in your voice. Accept → an escrow / Atompay / Safepay checkout link fires instantly. Zero platform intervention." },
    { q: "Is escrow really integrated natively?", a: "Yes. Escrow.com, Atompay, and Safepay are one click inside the deal room. Funds route straight from buyer to your account — we never hold your money." },
    { q: "What's the difference between Plus and Ultra?", a: "Plus unlocks unlimited domains + the Outbound Leads engine + Pulse Simulator. Ultra adds CSV bulk automation, a priority AI queue, and early registrar access for professional flippers." },
    { q: "Can I cancel any time?", a: "Yes. Month-to-month, one click, no retention friction. Your data + your portfolio remain yours." },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <img src={logo.url} alt="NameGadget" className="h-8 w-auto" />
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#workflow" className="hover:text-foreground transition">How It Works</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={go} className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary transition">
            Sign in
          </button>
          <button onClick={go} className="hidden sm:inline-flex rounded-md gradient-brand text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-95 transition">
            Get Started Free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none [background:radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-8 md:pt-14 pb-16 md:pb-24 text-center">
          <div className="hero-eyebrow opacity-0 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            Live · 0% commission · BYOL
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            <span className="block">{splitChars("Your Domain Portfolio's")}</span>
            <span className="block gradient-brand bg-clip-text text-transparent">
              {splitChars("Live Heartbeat.")}
            </span>
            <span className="block">{splitChars("0% Commission.")}</span>
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
              <Plus className="h-4 w-4" /> Launch Dashboard Free <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#pricing"
              className="hero-cta opacity-0 inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary transition"
            >
              Explore Tiers
            </a>
          </div>

          <div className="hero-cta opacity-0 mt-5 text-xs text-muted-foreground">
            No credit card. No brokers. Ever.
          </div>

          <div className="hero-dash opacity-0 mt-12 md:mt-16 max-w-4xl mx-auto text-left">
            <LiveDashboard />
          </div>
        </div>
      </section>

      {/* BENTO — Stop juggling tools */}
      <section id="features" className="relative py-20 md:py-28 bg-secondary/40 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-primary mb-4">
              <Layers className="h-3.5 w-3.5" /> ONE TOOL TO RULE THEM ALL
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="block">Stop juggling tools.</span>
              <span className="block gradient-brand bg-clip-text text-transparent">Start seeing clearly.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Most domainers stitch spreadsheets, RDAP checkers, appraisal APIs, escrow tools, and
              broker inboxes. NameGadget fuses all of it into one live command center.
            </p>
          </div>

          {/* faded tool grid + glass card overlay */}
          <div className="relative">
            <div className="grid grid-cols-5 gap-3 opacity-30 pointer-events-none select-none">
              {["Spreadsheets","RDAP checkers","Appraisal APIs","Escrow email","Broker DMs","GoDaddy","Afternic","Sedo","Slack","Notion","DNS logs","Traffic tools","Analytics","Landing sites","Zapier"].map((n, i) => (
                <div key={i} className="h-16 rounded-lg border border-border bg-card flex items-center justify-center text-[11px] text-muted-foreground text-center px-2">
                  {n}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[min(360px,90%)] rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl p-6 shadow-[0_30px_80px_-20px_color-mix(in_oklab,var(--primary)_40%,transparent)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">NameGadget</div>
                    <div className="text-[11px] text-muted-foreground">One dashboard. Every asset.</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {bento.map((b) => (
                    <li key={b.t} className="flex items-start gap-2 text-[13px]">
                      <b.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span><span className="font-semibold">{b.t}</span> <span className="text-muted-foreground">— {b.d}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOAT CALCULATOR */}
      <section ref={bloatRef} className="relative py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[11px] font-medium text-warning mb-4">
              <Zap className="h-3.5 w-3.5" /> Commission Bloat Report
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              How much is your <span className="gradient-brand bg-clip-text text-transparent">marketplace</span> stealing?
            </h2>
            <p className="mt-4 text-muted-foreground text-sm md:text-base">
              Traditional marketplaces skim 15–25% off every sale. On a $50,000 domain, that's up
              to <span className="text-foreground font-semibold">$12,500 gone</span> — before you
              even pay tax. NameGadget stays flat at <span className="text-primary font-semibold">0%</span>. Always.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-foreground/80">
              {[
                "Escrow, Atompay & Safepay integrated natively",
                "Funds move buyer → you, we never touch them",
                "Subscription-funded, not commission-funded",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
            <button
              onClick={go}
              className="mt-8 inline-flex items-center gap-2 rounded-md gradient-brand text-primary-foreground px-5 py-2.5 text-sm font-semibold glow-cyan hover:opacity-95 transition"
            >
              Try the 0% Framework <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <BloatChart inView={bloatVisible} />
        </div>
      </section>

      {/* 2-MINUTE WORKFLOW */}
      <section id="workflow" ref={workflowRef} className="relative py-20 md:py-28 border-t border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-primary mb-4">
              <Clock className="h-3.5 w-3.5" /> ONBOARDING
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Up and running in <span className="gradient-brand bg-clip-text text-transparent">under 2 minutes</span>.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              No CSV imports. No CRM setup. No sales calls. Four steps from signup to your first buyer ping — most
              investors finish before their coffee cools.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
            {/* Step 01 */}
            <div className="relative">
              <div className="workflow-card opacity-0 rounded-2xl border border-border bg-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-muted-foreground tracking-widest">STEP 01 · ~30s</span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Add your assets</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Paste a domain or upload a list. RDAP + DNS enrich each one with registrar, expiry, TLD ecosystem
                  and traffic signals — no manual tagging.
                </p>
                <div className="rounded-lg border border-border bg-secondary/60 p-2 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-mono text-foreground truncate flex-1">quantumleap.ai</span>
                  <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/30 rounded px-1.5 py-0.5">+ADD</span>
                </div>
              </div>
              <div className="workflow-line hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-primary/40 origin-left" />
            </div>

            {/* Step 02 */}
            <div className="relative">
              <div className="workflow-card opacity-0 rounded-2xl border border-border bg-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-muted-foreground tracking-widest">STEP 02 · ~45s</span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Deploy landers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  One-click deploy branded for-sale pages, or drop our motion-tracking tag on your own. Every visit,
                  click and country is captured live.
                </p>
                <button
                  onClick={copyScript}
                  className="w-full rounded-lg border border-border bg-[#0a0a0a] text-[11px] font-mono text-white/85 p-2.5 flex items-center gap-2 hover:border-primary/40 transition"
                >
                  <span className="truncate flex-1 text-left">&lt;script src="namegadget.js"&gt;&lt;/script&gt;</span>
                  {copied ? <Check className="h-3.5 w-3.5 text-primary shrink-0" /> : <Copy className="h-3.5 w-3.5 text-white/60 shrink-0" />}
                </button>
              </div>
              <div className="workflow-line hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-primary/40 origin-left" />
            </div>

            {/* Step 03 */}
            <div className="relative">
              <div className="workflow-card opacity-0 rounded-2xl border border-border bg-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-muted-foreground tracking-widest">STEP 03 · live</span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <LineChartIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Watch it live</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Inbound clicks, geo signals, referrer and intent score ping into your dashboard the moment they
                  happen. Filter by TLD, buyer country, or lander.
                </p>
                <div className="space-y-1.5">
                  {[
                    { l: "US · direct", v: 72 },
                    { l: "DE · organic", v: 44 },
                    { l: "IN · referral", v: 28 },
                  ].map((m) => (
                    <div key={m.l} className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="w-20 text-muted-foreground">{m.l}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full gradient-brand" style={{ width: `${m.v}%` }} />
                      </div>
                      <span className="w-8 text-right text-foreground">{m.v}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="workflow-line hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-primary/40 origin-left" />
            </div>

            {/* Step 04 */}
            <div className="relative">
              <div className="workflow-card opacity-0 rounded-2xl border border-border bg-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-muted-foreground tracking-widest">STEP 04 · 0% fee</span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Handshake className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Close &amp; get paid</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Negotiate in the deal room, trigger Escrow / Atompay / Safepay in one click. Funds move buyer → you.
                  We never touch them.
                </p>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs font-mono text-foreground flex-1">$18,400 → your account</span>
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No credit card to start</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Import up to 500 domains free</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* DEAL ROOM */}
      <section className="relative py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-primary mb-4">
              <Handshake className="h-3.5 w-3.5" /> P2P DEAL ROOM
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Insights your portfolio can <span className="gradient-brand bg-clip-text text-transparent">actually use together</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* left column */}
            <div className="space-y-4">
              {[
                { i: Users,           t: "Absolute seller autonomy", d: "You control every counter-offer, every message, every close. Zero platform intervention." },
                { i: CircleDollarSign,t: "Automated checkout links",  d: "Accept an offer → Escrow / Atompay / Safepay link fires instantly. Funds route buyer → you." },
                { i: ShieldCheck,     t: "Zero commission cuts",      d: "0% flat, forever. NameGadget is subscription-funded. We never touch your revenue." },
              ].map((b) => (
                <div key={b.t} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <b.i className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{b.t}</div>
                      <div className="text-sm text-muted-foreground mt-1">{b.d}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* right column — chat */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/60">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">Deal Room · vaultstack.io</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" /> P2P · encrypted
                </span>
              </div>

              <div className="flex-1 p-4 space-y-3 bg-muted/30 min-h-[320px]">
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-card border border-border px-3 py-2 text-sm">
                    <div className="text-[10px] font-mono text-muted-foreground mb-0.5">Buyer · nova.co</div>
                    Would you take <span className="font-semibold">$18,000</span> for vaultstack.io?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm gradient-brand text-primary-foreground px-3 py-2 text-sm">
                    <div className="text-[10px] font-mono opacity-80 mb-0.5">You · seller</div>
                    Appreciate the offer. Firm on <span className="font-semibold">$24,500</span> — traffic 3.8k/mo, 4yr age, .io premium.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-card border border-border px-3 py-2 text-sm">
                    <div className="text-[10px] font-mono text-muted-foreground mb-0.5">Buyer · nova.co</div>
                    Deal. Send me the escrow link — let's close today.
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-3 bg-secondary/40">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Trigger native payout
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Escrow", "Atompay", "Safepay"].map((p) => (
                    <button key={p} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold py-2 transition">
                      <Wallet className="h-3.5 w-3.5" /> {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-20 md:py-28 border-t border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-primary mb-4">
              <CircleDollarSign className="h-3.5 w-3.5" /> PRICING
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Pick your <span className="gradient-brand bg-clip-text text-transparent">intensity</span>.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Every tier keeps 0% commissions and pure P2P negotiation. You bring the lead. You close the deal.
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
                      ? "border-primary/50 bg-card shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {t.highlight && (
                    <>
                      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_60%)]" />
                      <div className="absolute -top-px left-1/2 -translate-x-1/2 gradient-brand text-primary-foreground text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-b-md">
                        Most Popular Choice
                      </div>
                    </>
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

      {/* FAQ */}
      <section id="faq" className="relative py-20 md:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-primary mb-4">
              WHY NAMEGADGET?
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to know before you flip the switch.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <Accordion type="single" collapsible className="divide-y divide-border">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="px-5 border-b-0">
                  <AccordionTrigger className="text-left text-sm md:text-base font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative py-16 md:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl gradient-brand overflow-hidden p-8 md:p-14 text-primary-foreground shadow-[0_40px_120px_-30px_color-mix(in_oklab,var(--primary)_60%,transparent)]">
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[11px] font-medium mb-4">
                  <Sparkles className="h-3.5 w-3.5" /> WITH AI SUPERPOWERS
                </div>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Ready to see your assets clearly?
                </h3>
                <p className="mt-3 text-sm md:text-base text-primary-foreground/85 max-w-md">
                  Join domainers replacing bloated marketplaces with a real-time, 0% commission command center.
                </p>
                <button
                  onClick={go}
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-white text-primary px-5 py-2.5 text-sm font-semibold hover:opacity-95 transition"
                >
                  Start Tracking Your Portfolio <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/25 backdrop-blur p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-semibold">Dashboard</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> 120 live
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { l: "Domains", v: "1,284", d: "+14%" },
                    { l: "Traffic", v: "18,392", d: "+8%" },
                    { l: "Leads",   v: "342",    d: "+22%" },
                    { l: "Offers",  v: "27",     d: "+0.4%" },
                  ].map((k) => (
                    <div key={k.l} className="rounded-lg bg-white/10 border border-white/10 p-3">
                      <div className="text-[10px] uppercase tracking-widest opacity-80">{k.l}</div>
                      <div className="text-xl font-bold mt-0.5">{k.v}</div>
                      <div className="text-[10px] font-mono opacity-80">{k.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src={logo.url} alt="NameGadget" className="h-7 w-auto" />
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Domain portfolio telemetry, AI outbound leads, and 0% commission P2P deal rooms.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Product</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#workflow" className="hover:text-foreground">How it works</a></li>
              <li><a href="#pricing"  className="hover:text-foreground">Pricing</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Compare</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>vs GoDaddy</li>
              <li>vs Afternic</li>
              <li>vs Sedo</li>
              <li>vs Dan.com</li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Company</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              <li><button onClick={go} className="hover:text-foreground">Sign in</button></li>
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} NameGadget · 0% commission · pure P2P</span>
          <div className="flex items-center gap-3">
            <img
              src={founderImg.url}
              alt="Founder"
              className="h-8 w-8 rounded-full object-cover border border-border shadow-sm"
            />
            <span className="inline-flex items-center gap-1">
              Made with <span className="text-red-500">♥</span> by NameGadget
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-primary" /> BYOL · seller-owned negotiation
          </span>
        </div>
      </footer>
    </div>
  );
}
