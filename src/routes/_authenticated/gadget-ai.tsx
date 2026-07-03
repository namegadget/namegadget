import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowUpRight, Zap, Target, TrendingUp, Users2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/gadget-ai")({
  component: GadgetAI,
});

const CAPABILITIES = [
  {
    icon: Zap,
    title: "Instant Appraisal",
    desc: "Neural valuation across 12M+ comparable sales — returns a price band in under 400ms.",
  },
  {
    icon: Target,
    title: "Outbound Lead Match",
    desc: "Extracts brand-fit corporate buyers per domain with a confidence score & contact vector.",
  },
  {
    icon: TrendingUp,
    title: "Traffic Geography",
    desc: "Visualizes buyer intent and regional traffic distribution for every asset.",
  },
  {
    icon: Users2,
    title: "Audience Modeling",
    desc: "Predicts likely acquirer segments based on TLD, keyword, and vertical signals.",
  },
];

function GadgetAI() {
  return (
    <PageShell
      eyebrow="03 · Gadget AI"
      title="gadget AI"
      description="The intelligence layer powering appraisals, lead extraction, and buyer-intent forecasting across your portfolio."
      icon={Sparkles}
      actions={
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          Open on a domain <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {CAPABILITIES.map((c, i) => (
          <div key={c.title} className="rounded-xl border border-border bg-card p-5 hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <c.icon className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-sm font-semibold mb-1">{c.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700">How to use</span>
        </div>
        <p className="text-sm text-foreground">
          Click any domain row in the <Link to="/dashboard" className="font-semibold underline">dashboard</Link> to open the
          Gadget AI panel for that asset — appraisal, buyer leads, and geography load automatically.
        </p>
      </div>
    </PageShell>
  );
}
