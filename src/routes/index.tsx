import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  if (checking) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--cyan)_18%,transparent),transparent_50%),radial-gradient(circle_at_80%_80%,color-mix(in_oklab,var(--sky)_15%,transparent),transparent_50%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-brand glow-cyan flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-glow">NameGadget</span>
        </div>
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="rounded-md border border-border bg-card/60 backdrop-blur px-4 py-2 text-sm font-medium hover:bg-card"
        >
          Sign in
        </button>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
          Phase 1 — Live
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          The AI operating system<br />
          <span className="gradient-brand bg-clip-text text-transparent">for domain investors.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Portfolio analytics, AI appraisal, outbound lead generation, and commission-free
          peer-to-peer sales — all in one premium FinTech workspace.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate({ to: "/auth" })}
            className="inline-flex items-center gap-2 rounded-md gradient-brand text-primary-foreground px-6 py-3 text-sm font-semibold glow-cyan hover:opacity-90 transition"
          >
            Enter Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, title: "gadget AI", desc: "Instant valuation + targeted corporate lead extraction." },
            { icon: Zap, title: "gadget+ Live", desc: "Real-time market pulse, keyword spikes, valuation shifts." },
            { icon: ShieldCheck, title: "0% BYOL P2P", desc: "Direct buyer-seller deal room. Escrow, Atompay, Safepay." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card/60 backdrop-blur p-6 text-left hover:border-primary/40 transition">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
