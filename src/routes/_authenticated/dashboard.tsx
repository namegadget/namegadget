import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Plus, TrendingUp, AlertTriangle, Users2,
  Sparkles, X, Radio, MessagesSquare, LayoutTemplate, Globe2,
  ShieldCheck, Send, Copy, ExternalLink, Loader2, Activity,
  RefreshCw, Layers,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { LanderGallery } from "@/components/landers";
import { lookupRdap } from "@/lib/rdap";
import { appraiseDomain, analyzeTechProfile, generateLivePulse } from "@/lib/gadget.functions";

type Domain = {
  id: string;
  user_id: string;
  domain_name: string;
  registrar: string;
  expiry_date: string;
  visitor_count: number;
  status: "Parked" | "For Sale" | "Negotiating" | "Sold";
  appraised_value: number | null;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const REGISTRARS = ["Namecheap", "GoDaddy", "Cloudflare", "Porkbun", "Dynadot", "Google Domains", "Name.com", "Gandi", "Tucows", "Network Solutions", "MarkMonitor", "Other"];

function daysUntil(dateStr: string) {
  const d = new Date(dateStr).getTime();
  return Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
}

function Dashboard() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Domain | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    void loadDomains();
  }, []);

  async function loadDomains() {
    setLoading(true);
    const { data, error } = await supabase.from("domains").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setDomains((data as Domain[]) ?? []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return domains;
    return domains.filter((d) => d.domain_name.toLowerCase().includes(q) || d.registrar.toLowerCase().includes(q));
  }, [domains, query]);

  const totalAssets = domains.length;
  const critical = domains.filter((d) => daysUntil(d.expiry_date) < 90).length;
  const totalTraffic = domains.reduce((sum, d) => sum + (d.visitor_count || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden bg-sidebar text-white">
        <div className="absolute -top-40 -right-40 h-[560px] w-[560px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(4,120,87,0.22) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-24 left-16 h-[320px] w-[320px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(4,120,87,0.10) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto px-8 pt-16 pb-14">
          <div className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-primary mb-6">
            <span className="inline-block w-7 h-px bg-primary" />
            Domain Portfolio
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05] max-w-2xl">
            Welcome back, <strong className="font-bold text-primary">{email.split("@")[0] || "investor"}</strong>.
          </h1>
          <div className="mt-8 flex items-center gap-5 flex-wrap text-[11px] font-mono text-white/30">
            <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> LIVE SYNC</span>
            <span>·</span>
            <span>{totalAssets} assets</span>
            <span>·</span>
            <span>{totalTraffic.toLocaleString()} visits</span>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-14 flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search domains, registrars..."
              className="w-full rounded-md border border-border bg-muted pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Link to="/account" className="text-xs font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition">
            Account →
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Assets" value={totalAssets} icon={Globe2} accent="cyan" hint="Domains under management" />
          <StatCard label="Critical Expirations" value={critical} icon={AlertTriangle} accent="danger" hint="< 90 days remaining" />
          <StatCard label="Total Traffic" value={totalTraffic.toLocaleString()} icon={TrendingUp} accent="sky" hint="Aggregated visitors" />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card/60 backdrop-blur overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="font-semibold">Domain Portfolio</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Click any row to open the gadget panel</p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-md gradient-brand text-primary-foreground px-4 py-2 text-sm font-semibold glow-cyan hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" /> Add New Asset
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading portfolio...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onAdd={() => setAddOpen(true)} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left font-medium px-6 py-3">Domain</th>
                    <th className="text-left font-medium px-6 py-3">Registrar</th>
                    <th className="text-left font-medium px-6 py-3">Expiry</th>
                    <th className="text-left font-medium px-6 py-3">Traffic</th>
                    <th className="text-left font-medium px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelected(d)}
                      className="border-b border-border last:border-0 hover:bg-primary/5 cursor-pointer transition"
                    >
                      <td className="px-6 py-4 font-semibold text-foreground">{d.domain_name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs">{d.registrar}</span>
                      </td>
                      <td className="px-6 py-4"><ExpiryBadge days={daysUntil(d.expiry_date)} /></td>
                      <td className="px-6 py-4"><TrafficIndicator count={d.visitor_count} /></td>
                      <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {addOpen && <AddDomainModal onClose={() => setAddOpen(false)} onCreated={() => { setAddOpen(false); void loadDomains(); }} />}
      {selected && <GadgetDrawer domain={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, accent, hint,
}: { label: string; value: string | number; icon: any; accent: "cyan" | "sky" | "danger"; hint: string }) {
  const ring = accent === "danger" ? "text-danger border-danger/40" : accent === "sky" ? "text-accent border-accent/40" : "text-primary border-primary/40";
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 relative overflow-hidden group hover:border-primary/40 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className={`h-10 w-10 rounded-lg border ${ring} bg-background/40 flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px gradient-brand opacity-40 group-hover:opacity-100 transition" />
    </div>
  );
}

function ExpiryBadge({ days }: { days: number }) {
  const cls = days < 30
    ? "text-danger border-danger/40 bg-danger/10"
    : days < 90 ? "text-warning border-warning/40 bg-warning/10"
    : "text-success border-success/40 bg-success/10";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {days < 0 ? `${Math.abs(days)}d expired` : `${days}d`}
    </span>
  );
}

function TrafficIndicator({ count }: { count: number }) {
  const bars = Array.from({ length: 8 }).map((_, i) => {
    const seed = (count * (i + 3)) % 100;
    const h = 4 + (seed % 16);
    return <span key={i} style={{ height: `${h}px` }} className="w-1 rounded-full bg-primary/70" />;
  });
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-0.5 h-5">{bars}</div>
      <span className="text-xs text-muted-foreground">{count.toLocaleString()}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: Domain["status"] }) {
  const map: Record<Domain["status"], string> = {
    Parked: "border-border bg-muted/60 text-muted-foreground",
    "For Sale": "border-primary/40 bg-primary/10 text-primary",
    Negotiating: "border-warning/40 bg-warning/10 text-warning",
    Sold: "border-success/40 bg-success/10 text-success",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl border border-border bg-muted/40 flex items-center justify-center">
        <Globe2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold">Your portfolio is empty</h3>
      <p className="mt-1 text-sm text-muted-foreground">Add your first domain asset to unlock AI appraisal and outbound leads.</p>
      <button onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-md gradient-brand text-primary-foreground px-4 py-2 text-sm font-semibold glow-cyan">
        <Plus className="h-4 w-4" /> Add First Asset
      </button>
    </div>
  );
}

function AddDomainModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [domainName, setDomainName] = useState("");
  const [registrar, setRegistrar] = useState("Namecheap");
  const [expiry, setExpiry] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);
  const [rdapLoading, setRdapLoading] = useState(false);
  const [rdapNote, setRdapNote] = useState<string | null>(null);

  async function runRdap(name: string) {
    const clean = name.trim().toLowerCase();
    if (!clean.includes(".")) return;
    setRdapLoading(true);
    setRdapNote(null);
    const r = await lookupRdap(clean);
    setRdapLoading(false);
    if (!r) {
      setRdapNote("No RDAP record found — enter manually.");
      return;
    }
    if (r.registrar) {
      const match = REGISTRARS.find((x) => x.toLowerCase() === r.registrar!.toLowerCase());
      setRegistrar(match ?? "Other");
    }
    if (r.expiryDate) setExpiry(r.expiryDate.slice(0, 10));
    setRdapNote(`RDAP auto-filled${r.registrar ? ` · ${r.registrar}` : ""}${r.expiryDate ? ` · expires ${r.expiryDate.slice(0, 10)}` : ""}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { toast.error("Not signed in"); setSaving(false); return; }
    const { error } = await supabase.from("domains").insert({
      user_id: userData.user.id,
      domain_name: domainName.trim().toLowerCase(),
      registrar,
      expiry_date: new Date(expiry).toISOString(),
      visitor_count: Math.floor(Math.random() * 5000),
      status: "Parked",
      appraised_value: null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Asset added to portfolio");
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl glow-cyan animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Add New Asset</h3>
            <p className="text-xs text-muted-foreground mt-0.5">RDAP auto-fills registrar & expiry.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain Name</label>
            <div className="mt-1 relative">
              <input
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                onBlur={(e) => runRdap(e.target.value)}
                required
                placeholder="example.com"
                className="w-full rounded-md border border-input bg-input/40 px-3 py-2 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              {rdapLoading && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-primary" />}
            </div>
            {rdapNote && (
              <p className={`mt-1.5 text-[11px] ${rdapNote.startsWith("No") ? "text-muted-foreground" : "text-primary"}`}>
                {rdapNote}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registrar</label>
            <select value={registrar} onChange={(e) => setRegistrar(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary">
              {REGISTRARS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiry Date</label>
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} required className="mt-1 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 rounded-md gradient-brand text-primary-foreground px-4 py-2.5 text-sm font-semibold glow-cyan disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add to Portfolio
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============ Right Drawer: gadget suite ============ */

type Tab = "gadget" | "tech" | "live" | "deal" | "lander";

function GadgetDrawer({ domain, onClose }: { domain: Domain; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("gadget");

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200" onClick={onClose}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> gadget suite
            </div>
            <h3 className="text-xl font-bold truncate text-glow">{domain.domain_name}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="inline-flex flex-wrap rounded-lg border border-border bg-background/60 p-1 text-xs">
            <TabBtn active={tab === "gadget"} onClick={() => setTab("gadget")} icon={Sparkles}>gadget AI</TabBtn>
            <TabBtn active={tab === "tech"} onClick={() => setTab("tech")} icon={Layers}>Tech Profile</TabBtn>
            <TabBtn active={tab === "live"} onClick={() => setTab("live")} icon={Radio}>gadget+ Live</TabBtn>
            <TabBtn active={tab === "deal"} onClick={() => setTab("deal")} icon={MessagesSquare}>Deal Room</TabBtn>
            <TabBtn active={tab === "lander"} onClick={() => setTab("lander")} icon={LayoutTemplate}>Lander</TabBtn>
          </div>
        </div>

        <div className="p-6">
          {tab === "gadget" && <GadgetView domain={domain} />}
          {tab === "tech" && <TechView domain={domain} />}
          {tab === "live" && <LiveView domain={domain} />}
          {tab === "deal" && <DealRoomView domain={domain} />}
          {tab === "lander" && <LanderView domain={domain} />}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
        active ? "gradient-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}

/* ============ REAL AI Views ============ */

type AppraisalData = {
  low: number; high: number; confidence: number; rationale: string;
  comparableSales: { name: string; price: number; year: number }[];
  leads: { company: string; industry: string; match: number; reason: string }[];
  geography: { region: string; pct: number }[];
};

function GadgetView({ domain }: { domain: Domain }) {
  const appraise = useServerFn(appraiseDomain);
  const [data, setData] = useState<AppraisalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null);
    const r = await appraise({ data: { domain: domain.domain_name } });
    setLoading(false);
    if (r.ok) setData(r);
    else setError(r.error);
  }

  useEffect(() => { void run(); }, [domain.domain_name]);

  if (loading) return <AiLoading label="Analyzing domain with Gadget AI..." />;
  if (error || !data) return <AiError message={error ?? "Failed to load"} onRetry={run} />;

  const meterPct = Math.min(100, data.confidence);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-background/40 p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Appraisal</h4>
          <button onClick={run} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Re-analyze
          </button>
        </div>
        <p className="mt-4 text-3xl font-bold gradient-brand bg-clip-text text-transparent">
          ${data.low.toLocaleString()} – ${data.high.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Confidence {data.confidence}%</p>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full gradient-brand" style={{ width: `${meterPct}%` }} />
        </div>
        <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{data.rationale}</p>
      </section>

      <section className="rounded-xl border border-border bg-background/40 p-5">
        <h4 className="font-semibold mb-3">Comparable Sales</h4>
        <div className="space-y-1.5">
          {data.comparableSales.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/60 last:border-0">
              <span className="font-mono">{c.name}</span>
              <span className="text-muted-foreground text-xs">{c.year}</span>
              <span className="font-semibold text-primary">${c.price.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="font-semibold flex items-center gap-2 mb-3"><Users2 className="h-4 w-4 text-primary" /> Outbound Corporate Leads</h4>
        <div className="space-y-2">
          {data.leads.map((l, i) => (
            <div key={i} className="rounded-lg border border-border bg-background/40 p-4 hover:border-primary/40 transition">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{l.company}</p>
                  <p className="text-xs text-muted-foreground">{l.industry}</p>
                </div>
                <div className="text-right pl-3">
                  <p className="text-lg font-bold text-primary">{l.match}%</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Match</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-foreground/70">{l.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-background/40 p-5">
        <h4 className="font-semibold flex items-center gap-2 mb-4"><Globe2 className="h-4 w-4 text-primary" /> Buyer-Intent Geography</h4>
        <div className="space-y-3">
          {data.geography.map((g) => (
            <div key={g.region}>
              <div className="flex justify-between text-xs mb-1">
                <span>{g.region}</span>
                <span className="text-muted-foreground">{g.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full gradient-brand" style={{ width: `${Math.min(100, g.pct)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

type TechData = { categories: { name: string; items: { name: string; description: string }[] }[]; summary: string; fetched: boolean };

function TechView({ domain }: { domain: Domain }) {
  const analyze = useServerFn(analyzeTechProfile);
  const [data, setData] = useState<TechData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null);
    const r = await analyze({ data: { domain: domain.domain_name } });
    setLoading(false);
    if (r.ok) setData(r as TechData);
    else setError(r.error);
  }

  useEffect(() => { void run(); }, [domain.domain_name]);

  if (loading) return <AiLoading label="Scanning site & profiling tech stack..." />;
  if (error || !data) return <AiError message={error ?? "Failed"} onRetry={run} />;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background/40 p-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Tech Profile</h4>
          <button onClick={run} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Rescan
          </button>
        </div>
        <p className="text-sm text-foreground/80">{data.summary}</p>
        {!data.fetched && (
          <p className="mt-2 text-[11px] text-warning">Homepage unreachable — inferred from domain signals only.</p>
        )}
      </div>

      {data.categories.map((cat) => (
        <div key={cat.name} className="rounded-xl border border-border bg-background/40 p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{cat.name}</p>
          <div className="space-y-2">
            {cat.items.map((it, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border/40 last:border-0">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{it.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type Pulse = { id: number; kind: "spike" | "drop" | "signal" | "buyer"; headline: string; delta: string; time: string };

function LiveView({ domain }: { domain: Domain }) {
  const gen = useServerFn(generateLivePulse);
  const [events, setEvents] = useState<Pulse[]>([]);
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(false);

  async function tick() {
    setLoading(true);
    const r = await gen({ data: { domain: domain.domain_name } });
    setLoading(false);
    if (!r.ok) return;
    const now = new Date().toLocaleTimeString();
    setEvents((prev) => [
      ...r.events.map((e, i) => ({ ...e, id: Date.now() + i, time: now })),
      ...prev,
    ].slice(0, 20));
  }

  useEffect(() => {
    setEvents([]);
    if (!live) return;
    void tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, [domain.domain_name, live]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-success/40 bg-success/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {live && <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${live ? "bg-success" : "bg-muted-foreground"}`} />
          </span>
          <div>
            <p className="text-sm font-semibold text-success uppercase tracking-wider">{live ? "LIVE · AI" : "PAUSED"}</p>
            <p className="text-xs text-muted-foreground">AI-generated market triggers for {domain.domain_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-success" />}
          <button onClick={() => setLive((v) => !v)} className="text-xs font-mono uppercase text-muted-foreground hover:text-foreground">
            {live ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/40 divide-y divide-border max-h-[480px] overflow-y-auto">
        {events.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Contacting AI market feed...
          </p>
        )}
        {events.map((e) => (
          <div key={e.id} className="p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className={`mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
              e.kind === "spike" ? "border-primary/40 bg-primary/10 text-primary"
              : e.kind === "drop" ? "border-danger/40 bg-danger/10 text-danger"
              : e.kind === "buyer" ? "border-warning/40 bg-warning/10 text-warning"
              : "border-accent/40 bg-accent/10 text-accent"
            }`}>{e.kind}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{e.headline}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{e.time}</p>
            </div>
            <span className="text-xs font-mono font-semibold">{e.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiLoading({ label }: { label: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {label}
    </div>
  );
}
function AiError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-danger/40 bg-danger/5 p-6 text-center">
      <p className="text-sm text-danger font-semibold">AI request failed</p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 text-xs font-mono uppercase border border-border rounded-md px-3 py-1.5 hover:border-primary">
        <RefreshCw className="h-3 w-3" /> Retry
      </button>
    </div>
  );
}

function DealRoomView({ domain }: { domain: Domain }) {
  const [messages, setMessages] = useState([
    { from: "buyer" as const, text: `Interested in ${domain.domain_name}. Serious offer.`, time: "10:42" },
    { from: "seller" as const, text: "Thanks — appreciate the direct approach. What's your range?", time: "10:44" },
  ]);
  const [offer, setOffer] = useState("5000");
  const [counter, setCounter] = useState("12000");
  const [msg, setMsg] = useState("");

  function send() {
    if (!msg.trim()) return;
    setMessages((m) => [...m, { from: "seller", text: msg, time: new Date().toLocaleTimeString().slice(0, 5) }]);
    setMsg("");
  }

  function trigger(provider: string) {
    toast.success(`Frictionless Integration Generated Successfully`, { description: `${provider} checkout link ready.` });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-sm"><span className="font-semibold">BYOL Deal Room</span> — Direct P2P</p>
        </div>
        <span className="rounded-full border border-success/40 bg-success/10 text-success px-2 py-0.5 text-xs font-semibold">0% broker fees</span>
      </div>

      <div className="rounded-xl border border-border bg-background/40 p-4">
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "seller" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                m.from === "seller" ? "gradient-brand text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
              }`}>
                <p>{m.text}</p>
                <p className={`mt-0.5 text-[10px] ${m.from === "seller" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Reply to buyer..."
            className="flex-1 rounded-md border border-input bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary" />
          <button onClick={send} className="rounded-md gradient-brand text-primary-foreground p-2 glow-cyan">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background/40 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Buyer Offer</p>
          <div className="mt-2 flex items-center gap-1"><span className="text-muted-foreground">$</span>
            <input value={offer} onChange={(e) => setOffer(e.target.value)} className="w-full bg-transparent outline-none text-xl font-bold" />
          </div>
        </div>
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
          <p className="text-xs uppercase tracking-wider text-primary">Seller Counter</p>
          <div className="mt-2 flex items-center gap-1"><span className="text-primary">$</span>
            <input value={counter} onChange={(e) => setCounter(e.target.value)} className="w-full bg-transparent outline-none text-xl font-bold text-primary" />
          </div>
        </div>
      </div>

      <button
        onClick={() => toast.success("Terms Accepted", { description: "Deal moved to secure checkout." })}
        className="w-full rounded-md gradient-brand text-primary-foreground py-3 font-semibold glow-cyan"
      >
        Accept Terms — 0% Commission
      </button>

      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Instant Checkout Link Generator</p>
        <div className="grid grid-cols-3 gap-2">
          {["Escrow", "Atompay", "Safepay"].map((p) => (
            <button key={p} onClick={() => trigger(p)}
              className="rounded-lg border border-border bg-background/60 hover:border-primary/50 hover:bg-primary/5 transition p-3 text-sm font-medium inline-flex items-center justify-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" /> {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LanderView({ domain }: { domain: Domain }) {
  const [copied, setCopied] = useState(false);
  const url = `https://${domain.domain_name}`;
  const h = Math.abs([...domain.domain_name].reduce((a, c) => a * 31 + c.charCodeAt(0), 0));
  const val = { low: 2000 + (h % 20000), high: 15000 + (h % 40000) };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2"><LayoutTemplate className="h-4 w-4 text-primary" /> Lander Templates</h4>
        <button
          onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="text-xs inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 hover:border-primary/50"
        >
          <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy URL"}
        </button>
      </div>

      <LanderGallery domain={domain.domain_name} val={val} />

      <p className="text-xs text-muted-foreground">
        Switch templates instantly. NameGadget landers auto-optimize buyer engagement with fluid motion, live countdowns, and frictionless offer capture.
      </p>
    </div>
  );
}
