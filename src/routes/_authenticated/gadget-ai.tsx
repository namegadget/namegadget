import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Sparkles,
  Search,
  Loader2,
  ScrollText,
  Globe2,
  Coins,
  Newspaper,
  Link2,
  Gauge,
  TrendingUp,
  Building2,
  MapPin,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { appraiseDomain } from "@/lib/gadget.functions";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/gadget-ai")({
  component: GadgetAI,
});

type Appraisal = Extract<Awaited<ReturnType<typeof appraiseDomain>>, { ok: true }>;

const fmtUSD = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n.toLocaleString()}`;

const toneBg: Record<string, string> = {
  market: "bg-sky-500/10 border-sky-500/30 text-sky-900",
  scarcity: "bg-amber-500/10 border-amber-500/30 text-amber-900",
  dual: "bg-emerald-500/10 border-emerald-500/30 text-emerald-900",
  trademark: "bg-rose-500/10 border-rose-500/30 text-rose-900",
  trend: "bg-violet-500/10 border-violet-500/30 text-violet-900",
};

const statusTone: Record<string, string> = {
  developed: "text-emerald-700 font-semibold",
  active: "text-amber-700 font-semibold",
  registered: "text-orange-700 font-semibold",
  none: "text-muted-foreground",
};

function GadgetAI() {
  const appraise = useServerFn(appraiseDomain);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Appraisal | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (d.length < 3) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await appraise({ data: { domain: d } });
      if (res.ok) setReport(res);
      else setError(res.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      eyebrow="03 · Gadget+"
      title="gadget+ Domain Intelligence"
      description="Institutional-grade appraisal report — comparable sales, TLD ecosystem, brand score, long-term thesis. Powered by Gemini."
      icon={Sparkles}
    >
      <form onSubmit={run} className="mb-8 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter a domain (e.g. sarl.com)"
            className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || domain.trim().length < 3}
          className="h-12 px-6 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <>Run Gadget+</>}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-3" />
          <div className="text-sm text-muted-foreground">
            Gemini is analyzing WHOIS, TLD ecosystem, comparable sales, brand fit, and long-term thesis…
          </div>
        </div>
      )}

      {report && <Report r={report} domain={domain} />}

      {!report && !loading && !error && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Enter a domain above to generate a full DomainIQ-Pro report.
        </div>
      )}
    </PageShell>
  );
}

function Report({ r, domain }: { r: Appraisal; domain: string }) {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <span className="inline-block px-3 py-1 rounded-full border border-border bg-background text-[10px] font-mono uppercase tracking-widest text-foreground">
          Domain Appraisal
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mt-4 text-foreground tracking-tight">{domain}</h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">{r.meaning}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-xs text-muted-foreground">
          <span>📅 {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          <span>📊 {r.algorithm}</span>
          <span>🌐 .{domain.split(".").pop()} TLD</span>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {r.insights.map((ins, i) => (
          <div key={i} className={`rounded-xl border-l-4 p-4 ${toneBg[ins.tone] ?? toneBg.market}`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl leading-none">{ins.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm mb-1">{ins.title}</div>
                <div className="text-xs leading-relaxed opacity-90">{ins.body}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Value cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Estimated Market Value</div>
          <div className="text-4xl font-bold my-3 text-foreground">{fmtUSD(r.marketValue)}</div>
          <div className="text-xs text-muted-foreground">{r.algorithm} + Premium</div>
        </div>
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-6 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Suggested Range</div>
          <div className="text-4xl font-bold my-3 text-primary">
            {fmtUSD(r.suggestedLow)} – {fmtUSD(r.suggestedHigh)}
          </div>
          <div className="text-xs text-muted-foreground">{r.valueBasis}</div>
        </div>
      </div>

      {/* DotDB TLD Ecosystem */}
      <Card icon={Globe2} title="DotDB TLD Ecosystem">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground uppercase font-mono tracking-widest border-b border-border">
                <th className="py-2 pr-4">Keyword</th>
                <th className="py-2 pr-4">Total TLDs</th>
                <th className="py-2 pr-4">Total Names</th>
                <th className="py-2">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 pr-4 font-semibold">{r.ecosystem.keyword} <span className="text-muted-foreground font-normal">(exact)</span></td>
                <td className="py-3 pr-4">{r.ecosystem.totalTlds}</td>
                <td className="py-3 pr-4">{r.ecosystem.totalNames.toLocaleString()}</td>
                <td className="py-3 font-semibold text-emerald-700">{r.ecosystem.interpretation}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          <span className="font-semibold text-foreground">Extensions include:</span> {r.ecosystem.extensionsCsv}
        </p>
        <p className="text-sm mt-3 leading-relaxed">{r.ecosystem.analysis}</p>
      </Card>

      {/* Comparable Sales */}
      <Card icon={Coins} title="NameBio Comparable Sales">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground uppercase font-mono tracking-widest border-b border-border">
                <th className="py-2 pr-4">Domain</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Venue</th>
                <th className="py-2">Relevance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {r.comparableSales.map((s, i) => (
                <tr key={i} className={s.relevance === "THIS DOMAIN" ? "bg-emerald-500/5" : ""}>
                  <td className="py-2 pr-4 font-semibold">{s.name}</td>
                  <td className="py-2 pr-4 font-mono">${s.price.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{s.date}</td>
                  <td className="py-2 pr-4">{s.venue}</td>
                  <td className="py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      s.relevance === "THIS DOMAIN"
                        ? "bg-emerald-500/15 text-emerald-700"
                        : "bg-amber-500/15 text-amber-800"
                    }`}>
                      {s.relevance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-3 leading-relaxed text-muted-foreground">{r.pricingContext}</p>
      </Card>

      {/* Web Presence */}
      <Card icon={Newspaper} title="Google Presence & News Coverage">
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Search Results</div>
            <ul className="space-y-1.5 text-xs leading-relaxed list-disc pl-4">
              {r.webPresence.searchNotes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Usage Stats</div>
            <ul className="space-y-1.5 text-xs leading-relaxed list-disc pl-4">
              {r.webPresence.usageStats.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border grid md:grid-cols-2 gap-4 text-xs">
          <div><span className="font-semibold">Multi-country usage:</span> <span className="text-muted-foreground">{r.webPresence.multiCountry}</span></div>
          <div><span className="font-semibold">Major platforms:</span> <span className="text-muted-foreground">{r.webPresence.majorPlatforms}</span></div>
        </div>
      </Card>

      {/* Alt Extensions */}
      <Card icon={Link2} title="Alternative Extensions & Ecosystem">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground uppercase font-mono tracking-widest border-b border-border">
                <th className="py-2 pr-4">Domain</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {r.altExtensions.map((a, i) => (
                <tr key={i} className={a.statusTone === "developed" ? "bg-emerald-500/5" : ""}>
                  <td className="py-2 pr-4 font-semibold">{a.domain}</td>
                  <td className={`py-2 pr-4 ${statusTone[a.statusTone] ?? ""}`}>{a.status}</td>
                  <td className="py-2 text-muted-foreground">{a.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm mt-4 leading-relaxed"><span className="font-semibold">Analysis:</span> {r.altExtensionAnalysis}</p>
      </Card>

      {/* Brand Score */}
      <Card icon={Gauge} title="DomainIQ-Pro Brand Score Breakdown">
        <div className="space-y-3">
          {r.brandScores.map((b, i) => (
            <div key={i} className="grid grid-cols-[140px_60px_1fr] gap-4 items-start text-sm">
              <div className="font-semibold">{b.component}</div>
              <div className="font-mono text-emerald-700 font-semibold">{b.score} / 5</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{b.rationale}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Total Brand Score</span>
            <span className="font-mono font-bold text-lg">{r.brandScoreTotal} / 25</span>
          </div>
          <Progress value={(r.brandScoreTotal / 25) * 100} />
        </div>
      </Card>

      {/* Long-Term */}
      <div className="rounded-2xl border-2 border-violet-500/30 bg-violet-500/5 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-violet-600" />
          <h3 className="font-semibold text-lg">Long-Term Investment Value (3–7 Year Hold)</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-80">Projected Long-Term Value</div>
            <div className="text-4xl font-bold my-3">{fmtUSD(r.longTerm.projected)}+</div>
            <div className="text-xs opacity-80">3–7 year patient hold strategy</div>
          </div>
          <div className="rounded-xl border border-violet-500/40 bg-white p-6 text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Long-Term Range</div>
            <div className="text-4xl font-bold my-3 text-violet-700">
              {fmtUSD(r.longTerm.rangeLow)} – {fmtUSD(r.longTerm.rangeHigh)}
            </div>
            <div className="text-xs text-muted-foreground">Based on market growth + scarcity appreciation</div>
          </div>
        </div>

        <div className="text-violet-700 font-semibold text-sm mb-3">Investment Thesis</div>
        <ul className="space-y-2.5 mb-6 text-sm">
          {r.longTerm.thesis.map((t, i) => (
            <li key={i} className="pl-4 border-l-2 border-violet-400/40">
              <span className="font-semibold">{t.title}:</span> <span className="text-muted-foreground">{t.body}</span>
            </li>
          ))}
        </ul>

        <div className="text-violet-700 font-semibold text-sm mb-3">Growth Catalysts</div>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-foreground/90">
          {r.longTerm.catalysts.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>

      {/* Rationale */}
      <Card icon={ScrollText} title="Executive Summary">
        <p className="text-sm leading-relaxed">{r.rationale}</p>
      </Card>

      {/* Leads */}
      <Card icon={Building2} title="Corporate Buyer Leads">
        <div className="grid md:grid-cols-2 gap-3">
          {r.leads.map((l, i) => (
            <div key={i} className="rounded-lg border border-border p-4 hover:border-emerald-500/40 transition">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-semibold text-sm">{l.company}</div>
                  <div className="text-xs text-muted-foreground">{l.industry}</div>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600">{l.match}%</div>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">{l.reason}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Geography */}
      <Card icon={MapPin} title="Regional Buyer-Intent Distribution">
        <div className="space-y-3">
          {r.geography.map((g, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{g.region}</span>
                <span className="font-mono text-muted-foreground">{g.pct}%</span>
              </div>
              <Progress value={g.pct} />
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground pt-4">
        Confidence · {r.confidence}% · Generated by {r.algorithm}
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-emerald-600" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
