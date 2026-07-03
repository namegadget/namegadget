import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Globe2, ArrowUpRight, Search } from "lucide-react";

type Domain = {
  id: string;
  domain_name: string;
  registrar: string;
  expiry_date: string;
  visitor_count: number;
  status: string;
  appraised_value: number | null;
};

export const Route = createFileRoute("/_authenticated/portfolio")({
  component: PortfolioPage,
});

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function PortfolioPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("domains").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setDomains((data as Domain[]) ?? []);
      setLoading(false);
    });
  }, []);

  const list = domains.filter((d) =>
    !q ? true : d.domain_name.toLowerCase().includes(q.toLowerCase()),
  );

  const totalValue = domains.reduce((s, d) => s + (d.appraised_value ?? 0), 0);
  const totalTraffic = domains.reduce((s, d) => s + d.visitor_count, 0);

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-[#0a0a0a] text-white border-b border-white/5">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 0%, rgba(16,185,129,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative px-8 pt-10 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400/80">
              02 · Portfolio
            </span>
          </div>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                <Globe2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1>
                <p className="text-sm text-white/50 mt-1.5">
                  All assets under management · {domains.length} domain{domains.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatMini label="Assets" value={domains.length.toString()} />
              <StatMini label="Traffic" value={totalTraffic.toLocaleString()} />
              <StatMini label="Valuation" value={`$${(totalValue / 1000).toFixed(1)}k`} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter domains…"
            className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-emerald-500/60"
          />
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading portfolio…</div>
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No domains yet.{" "}
              <Link to="/dashboard" className="text-emerald-600 hover:underline">
                Add one from the dashboard →
              </Link>
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Domain</th>
                  <th className="text-left px-5 py-3">Registrar</th>
                  <th className="text-left px-5 py-3">Expiry</th>
                  <th className="text-right px-5 py-3">Traffic</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => {
                  const dd = daysUntil(d.expiry_date);
                  const dCls =
                    dd < 30 ? "text-red-600" : dd < 90 ? "text-amber-600" : "text-emerald-600";
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-5 py-3 font-semibold text-foreground">{d.domain_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{d.registrar}</td>
                      <td className={`px-5 py-3 font-mono text-xs ${dCls}`}>{dd}d</td>
                      <td className="px-5 py-3 text-right font-mono">{d.visitor_count.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-muted">
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        {d.appraised_value ? `$${d.appraised_value.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-emerald-600 hover:gap-2 transition-all"
        >
          Manage in dashboard <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 min-w-[110px]">
      <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}
