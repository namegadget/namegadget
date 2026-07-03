import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { LanderGallery } from "@/components/landers";

export const Route = createFileRoute("/_authenticated/landers")({
  component: LandersPage,
});

function LandersPage() {
  const [domain, setDomain] = useState("quantum.dev");
  const [low, setLow] = useState(12500);
  const [high, setHigh] = useState(18500);

  return (
    <PageShell
      eyebrow="06 · Landers"
      title="Motion Lander Studio"
      description="Ten conversion-tuned templates — marketplace clones plus original anime.js-powered originals. Preview any template against your domain."
      icon={LayoutTemplate}
    >
      <div className="rounded-xl border border-border bg-card p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Domain</span>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono outline-none focus:border-emerald-500/60"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Valuation low</span>
          <input
            type="number"
            value={low}
            onChange={(e) => setLow(Number(e.target.value))}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono outline-none focus:border-emerald-500/60"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Valuation high</span>
          <input
            type="number"
            value={high}
            onChange={(e) => setHigh(Number(e.target.value))}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono outline-none focus:border-emerald-500/60"
          />
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <LanderGallery domain={domain} val={{ low, high }} />
      </div>
    </PageShell>
  );
}
