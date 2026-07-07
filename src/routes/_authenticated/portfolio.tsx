import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe2, ArrowUpRight, Search, RefreshCw, ArrowUpDown, ShieldCheck,
  Mail, Radio, Server, Loader2, ExternalLink, Sparkles, Tag, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { enrichDomain, type DomainEnrichment } from "@/lib/domain-enrich";

type Domain = {
  id: string;
  domain_name: string;
  registrar: string;
  expiry_date: string;
  visitor_count: number;
  status: string;
  appraised_value: number | null;
  price: number | null;
};

// Client-only enrichment cache — health signals we don't persist.
type Health = { hasA: boolean; hasMx: boolean; ns: string[]; source: string };

export const Route = createFileRoute("/_authenticated/portfolio")({
  component: PortfolioPage,
});

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

type SortKey = "domain" | "registrar" | "expiry" | "traffic" | "value";

function PortfolioPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "expiry", dir: "asc" });
  const [health, setHealth] = useState<Record<string, Health>>({});
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState<string>("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("domains").select("*").order("created_at", { ascending: false });
    setDomains((data as Domain[]) ?? []);
    setLoading(false);
  }

  // Background enrich (health only) after load — up to 6 in parallel, most recent first.
  useEffect(() => {
    if (!domains.length) return;
    const targets = domains.filter((d) => !health[d.domain_name]).slice(0, 12);
    if (!targets.length) return;
    let cancelled = false;
    (async () => {
      const CONC = 4;
      let i = 0;
      const worker = async () => {
        while (!cancelled && i < targets.length) {
          const t = targets[i++];
          try {
            const e = await enrichDomain(t.domain_name);
            if (cancelled) return;
            setHealth((h) => ({ ...h, [t.domain_name]: { hasA: e.hasA, hasMx: e.hasMx, ns: e.nameservers, source: e.source } }));
          } catch { /* ignore */ }
        }
      };
      await Promise.all(Array.from({ length: CONC }, worker));
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains]);

  async function refreshRow(d: Domain) {
    setRefreshing(d.id);
    try {
      const e: DomainEnrichment = await enrichDomain(d.domain_name);
      const { error } = await supabase.from("domains").update({
        registrar: e.registrar,
        expiry_date: e.expiryIso,
        visitor_count: e.visitorEstimate,
      }).eq("id", d.id);
      if (error) throw error;
      setHealth((h) => ({ ...h, [d.domain_name]: { hasA: e.hasA, hasMx: e.hasMx, ns: e.nameservers, source: e.source } }));
      setDomains((rows) => rows.map((r) => r.id === d.id
        ? { ...r, registrar: e.registrar, expiry_date: e.expiryIso, visitor_count: e.visitorEstimate } : r));
      toast.success(`${d.domain_name} refreshed · ${e.source}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(null);
    }
  }

  function startEditPrice(d: Domain) {
    setEditingPrice(d.id);
    setPriceDraft(d.price != null ? String(d.price) : "");
  }

  async function savePrice(d: Domain) {
    const raw = priceDraft.trim();
    const priceNum = raw === "" ? null : Number(raw);
    if (priceNum !== null && (!Number.isFinite(priceNum) || priceNum < 0)) {
      toast.error("Enter a valid price"); return;
    }
    setSavingPrice(true);
    const patch: { price: number | null; status?: string } = { price: priceNum };
    // Auto-transition status based on price + current status
    if (priceNum && priceNum > 0) {
      if (!["Listed", "Pending Payment", "escrow_secured", "Negotiating"].includes(d.status)) {
        patch.status = "Listed";
      }
    } else if (d.status === "Listed") {
      patch.status = "Parked";
    }
    const { error } = await supabase.from("domains").update(patch).eq("id", d.id);
    setSavingPrice(false);
    if (error) { toast.error(error.message); return; }
    setDomains((rows) => rows.map((r) => r.id === d.id ? { ...r, price: priceNum, status: patch.status ?? r.status } : r));
    setEditingPrice(null);
    toast.success(priceNum ? `Listed at $${priceNum.toLocaleString()}` : "Price cleared");
  }

  const list = useMemo(() => {
    const filtered = domains.filter((d) =>
      !q ? true : d.domain_name.toLowerCase().includes(q.toLowerCase()) || d.registrar.toLowerCase().includes(q.toLowerCase()),
    );
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "domain": return a.domain_name.localeCompare(b.domain_name) * dir;
        case "registrar": return a.registrar.localeCompare(b.registrar) * dir;
        case "expiry": return (new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()) * dir;
        case "traffic": return (a.visitor_count - b.visitor_count) * dir;
        case "value": return ((a.appraised_value ?? 0) - (b.appraised_value ?? 0)) * dir;
      }
    });
  }, [domains, q, sort]);

  useEffect(() => { setPage(1); }, [q, sort]);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedList = useMemo(
    () => list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [list, currentPage],
  );

  const totalValue = domains.reduce((s, d) => s + (d.appraised_value ?? 0), 0);
  const totalTraffic = domains.reduce((s, d) => s + d.visitor_count, 0);
  const liveCount = Object.values(health).filter((h) => h.hasA).length;
  const critical = domains.filter((d) => daysUntil(d.expiry_date) < 90).length;

  function toggleSort(key: SortKey) {
    setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — Page Pulse style */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-14 pb-8 md:pb-10">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground mb-5 shadow-sm">
                <span className="h-5 w-5 rounded-full gradient-brand inline-flex items-center justify-center">
                  <Globe2 className="h-3 w-3 text-primary-foreground" />
                </span>
                <span className="tracking-wide uppercase">02 · Portfolio</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-foreground">
                Portfolio
              </h1>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                {domains.length} asset{domains.length === 1 ? "" : "s"} · {liveCount} live · {critical} expiring soon
              </p>
            </div>
            <div className="col-span-2 sm:col-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 shrink-0">
              <StatMini label="Assets" value={domains.length.toString()} />
              <StatMini label="Traffic" value={totalTraffic.toLocaleString()} />
              <StatMini label="Valuation" value={`$${(totalValue / 1000).toFixed(1)}k`} />
              <StatMini label="Live" value={`${liveCount}/${domains.length}`} accent />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by domain or registrar…"
              className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-emerald-500/60"
            />
          </div>
          <button
            onClick={() => void load()}
            className="h-10 px-3 rounded-lg border border-border bg-card text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-emerald-500/40 inline-flex items-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reload
          </button>
        </div>

        {/* Nameserver notice */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-wrap items-start gap-3 text-xs">
          <Server className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-emerald-700">Point domains to NameGadget nameservers <span className="text-[10px] font-mono uppercase tracking-widest ml-1 rounded bg-emerald-500/10 px-1.5 py-0.5">Coming soon</span></p>
            <p className="text-muted-foreground mt-0.5">Delegate DNS to <code className="font-mono">ns1.namegadget.io</code> / <code className="font-mono">ns2.namegadget.io</code> to unlock instant parking, lander swaps and buyer analytics per asset.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading portfolio…
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No domains yet.{" "}
              <Link to="/dashboard" className="text-emerald-600 hover:underline">Add one from the dashboard →</Link>
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead className="bg-muted/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <Th onClick={() => toggleSort("domain")} active={sort.key === "domain"} dir={sort.dir}>Domain</Th>
                    <Th onClick={() => toggleSort("registrar")} active={sort.key === "registrar"} dir={sort.dir}>Registrar</Th>
                    <th className="text-left px-4 sm:px-5 py-3">Health</th>
                    <Th onClick={() => toggleSort("expiry")} active={sort.key === "expiry"} dir={sort.dir}>Expiry</Th>
                    <Th onClick={() => toggleSort("traffic")} active={sort.key === "traffic"} dir={sort.dir} align="right">Traffic</Th>
                    <th className="text-left px-4 sm:px-5 py-3">Status</th>
                    <th className="text-right px-4 sm:px-5 py-3">Price</th>
                    <Th onClick={() => toggleSort("value")} active={sort.key === "value"} dir={sort.dir} align="right">Appraisal</Th>
                    <th className="text-right px-4 sm:px-5 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {pagedList.map((d) => {
                    const dd = daysUntil(d.expiry_date);
                    const h = health[d.domain_name];
                    return (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 sm:px-5 py-3 font-semibold text-foreground whitespace-nowrap">
                          <a
                            href={`https://${d.domain_name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 hover:text-emerald-600"
                          >
                            {d.domain_name}
                            <ExternalLink className="h-3 w-3 opacity-40" />
                          </a>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-muted-foreground whitespace-nowrap">{d.registrar}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          <HealthDots h={h} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          <ExpiryBar days={dd} />
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-right font-mono whitespace-nowrap">{d.visitor_count.toLocaleString()}</td>
                        <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-muted">{d.status}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-right whitespace-nowrap">
                          {editingPrice === d.id ? (
                            <div className="inline-flex items-center gap-1">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">$</span>
                                <input
                                  autoFocus
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={priceDraft}
                                  onChange={(e) => setPriceDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") void savePrice(d);
                                    if (e.key === "Escape") setEditingPrice(null);
                                  }}
                                  placeholder="price"
                                  className="w-24 h-8 rounded-md border border-emerald-500/40 bg-background pl-5 pr-2 text-xs font-mono text-right outline-none focus:border-emerald-500"
                                />
                              </div>
                              <button
                                onClick={() => void savePrice(d)}
                                disabled={savingPrice}
                                title="Save price"
                                className="h-8 w-8 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 inline-flex items-center justify-center hover:bg-emerald-500/20 disabled:opacity-50"
                              >
                                {savingPrice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => setEditingPrice(null)}
                                title="Cancel"
                                className="h-8 w-8 rounded-md border border-border bg-card text-muted-foreground inline-flex items-center justify-center hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditPrice(d)}
                              title={d.price ? "Edit price" : "Set price to list"}
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md border border-transparent hover:border-emerald-500/40 hover:bg-emerald-500/5 font-mono text-xs group"
                            >
                              {d.price ? (
                                <span className="text-foreground">${d.price.toLocaleString()}</span>
                              ) : (
                                <span className="text-muted-foreground inline-flex items-center gap-1">
                                  <Tag className="h-3 w-3" /> Set price
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-right font-mono whitespace-nowrap text-muted-foreground">
                          {d.appraised_value ? `$${d.appraised_value.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to="/gadget-ai"
                              search={{ domain: d.domain_name }}
                              title="Run Gadget+ appraisal on this domain"
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md border border-primary/30 bg-primary/5 text-primary text-[11px] font-medium hover:bg-primary/10 hover:border-primary/50 transition"
                            >
                              <Sparkles className="h-3 w-3" /> Gadget+
                            </Link>
                            <button
                              onClick={() => refreshRow(d)}
                              disabled={refreshing === d.id}
                              title="Re-fetch registrar, expiry and DNS"
                              className="h-8 w-8 rounded-md border border-transparent hover:border-border hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                              {refreshing === d.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <RefreshCw className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {list.length > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border bg-muted/20 text-xs">
                <span className="font-mono text-muted-foreground">
                  {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, list.length)} of {list.length}
                </span>
                <div className="inline-flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-3 rounded-md border border-border bg-card font-mono uppercase tracking-widest text-[10px] hover:border-emerald-500/40 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >Prev</button>
                  <span className="font-mono text-muted-foreground">{currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 px-3 rounded-md border border-border bg-card font-mono uppercase tracking-widest text-[10px] hover:border-emerald-500/40 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >Next</button>
                </div>
              </div>
            )}
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

function Th({
  children, onClick, active, dir, align = "left",
}: { children: React.ReactNode; onClick: () => void; active: boolean; dir: "asc" | "desc"; align?: "left" | "right" }) {
  return (
    <th className={`px-4 sm:px-5 py-3 select-none ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-foreground transition ${active ? "text-emerald-600" : ""}`}
      >
        {children}
        <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-30"} ${active && dir === "desc" ? "rotate-180" : ""} transition`} />
      </button>
    </th>
  );
}

function HealthDots({ h }: { h?: Health }) {
  if (!h) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin opacity-50" /> checking
      </span>
    );
  }
  return (
    <div className="inline-flex items-center gap-2">
      <Pill on={h.hasA} icon={Radio} label="Live" title={h.hasA ? "A record present" : "No A record — parked / unresolved"} />
      <Pill on={h.hasMx} icon={Mail} label="Mail" title={h.hasMx ? "MX records present" : "No MX records"} />
      {h.source === "rdap+dns" && (
        <span title="RDAP-verified" className="inline-flex items-center text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" /></span>
      )}
    </div>
  );
}

function Pill({ on, icon: Icon, label, title }: { on: boolean; icon: React.ComponentType<{ className?: string }>; label: string; title: string }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
        on ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700" : "border-border bg-muted/40 text-muted-foreground"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function ExpiryBar({ days }: { days: number }) {
  const clamped = Math.max(0, Math.min(365, days));
  const pct = (clamped / 365) * 100;
  const tone =
    days < 0 ? "bg-destructive"
    : days < 30 ? "bg-red-500"
    : days < 90 ? "bg-amber-500"
    : "bg-emerald-500";
  const label = days < 0 ? `${Math.abs(days)}d expired` : `${days}d`;
  return (
    <div className="inline-flex items-center gap-2 min-w-[110px]">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${tone} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`font-mono text-xs ${days < 30 ? "text-red-600" : days < 90 ? "text-amber-600" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function StatMini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 sm:px-4 py-2 sm:py-2.5 min-w-0 shadow-sm ${accent ? "border-primary/30 bg-primary/10" : "border-border bg-card"}`}>
      <div className={`text-[9px] font-mono uppercase tracking-widest truncate ${accent ? "text-primary" : "text-muted-foreground"}`}>{label}</div>
      <div className={`text-sm sm:text-lg font-semibold mt-0.5 truncate text-foreground ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
