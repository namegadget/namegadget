import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio, ArrowUpRight, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/gadget-live")({
  component: GadgetLive,
});

type Pulse = { id: number; kind: "spike" | "drop" | "signal"; msg: string; delta: string; time: string };

const SEEDS = [
  { kind: "spike", msg: "Search volume +212% on 'ai-agent.com'", delta: "+212%" },
  { kind: "signal", msg: "Competitor 'neura.ai' registered by Anthropic Labs", delta: "NEW" },
  { kind: "drop", msg: "Valuation drift on 'oldweb3.io': -8.4%", delta: "-8.4%" },
  { kind: "spike", msg: "Traffic surge on 'quantum.dev' (+412 visits/hr)", delta: "+412" },
  { kind: "signal", msg: "Outbound match: Sequoia portfolio requesting .ai domains", delta: "HOT" },
  { kind: "spike", msg: "Keyword 'agentic' trending — +89% w/w", delta: "+89%" },
] as const;

function GadgetLive() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const push = () => {
      const s = SEEDS[Math.floor(Math.random() * SEEDS.length)];
      setPulses((p) =>
        [
          {
            id: Date.now() + Math.random(),
            kind: s.kind,
            msg: s.msg,
            delta: s.delta,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          },
          ...p,
        ].slice(0, 20),
      );
    };
    push();
    const t = setInterval(push, 2200);
    return () => clearInterval(t);
  }, [live]);

  return (
    <PageShell
      eyebrow="04 · Gadget+ Live"
      title="gadget+ Live Pulse"
      description="Realtime market triggers — search spikes, competitor registrations, valuation shifts. Wired to your portfolio's keyword graph."
      icon={Radio}
      actions={
        <button
          onClick={() => setLive((v) => !v)}
          className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium border transition ${
            live
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700"
              : "bg-card border-border text-muted-foreground"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
          {live ? "LIVE" : "PAUSED"}
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold">Market Pulse Stream</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {pulses.length} events
            </span>
          </div>
          <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
            {pulses.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Waiting for market signals…</div>
            )}
            {pulses.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20 transition">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    p.kind === "spike"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : p.kind === "drop"
                      ? "bg-red-500/10 text-red-600"
                      : "bg-sky-500/10 text-sky-600"
                  }`}
                >
                  {p.kind === "spike" ? <TrendingUp className="h-4 w-4" /> : p.kind === "drop" ? <TrendingDown className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{p.msg}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                    {p.time}
                  </div>
                </div>
                <div className="text-xs font-mono font-semibold flex-shrink-0">{p.delta}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Signals / min
            </div>
            <div className="text-3xl font-semibold">27.3</div>
            <div className="text-xs text-emerald-600 mt-1">+14% vs yesterday</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Watched keywords
            </div>
            <div className="text-3xl font-semibold">142</div>
            <div className="text-xs text-muted-foreground mt-1">Across your portfolio</div>
          </div>
          <Link
            to="/dashboard"
            className="block rounded-xl border border-dashed border-border p-5 text-center text-xs font-mono uppercase tracking-widest text-emerald-600 hover:border-emerald-500/40 transition"
          >
            Configure alerts <ArrowUpRight className="h-3 w-3 inline ml-1" />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
