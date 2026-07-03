import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, Calendar, Globe2, TrendingUp,
  AlertTriangle, DollarSign, ShieldCheck, KeyRound, Copy, Loader2,
} from "lucide-react";

type Domain = {
  id: string;
  domain_name: string;
  expiry_date: string;
  visitor_count: number;
  status: string;
  appraised_value: number | null;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountPage,
});

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function AccountPage() {
  const [user, setUser] = useState<{ email: string; id: string; created_at: string } | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        setUser({ email: u.user.email ?? "", id: u.user.id, created_at: u.user.created_at });
      }
      const { data, error } = await supabase.from("domains").select("*");
      if (error) toast.error(error.message);
      setDomains((data as Domain[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = domains.length;
    const critical = domains.filter((d) => daysUntil(d.expiry_date) < 90).length;
    const traffic = domains.reduce((s, d) => s + (d.visitor_count || 0), 0);
    const portfolioValue = domains.reduce((s, d) => s + (d.appraised_value || 0), 0);
    const forSale = domains.filter((d) => d.status === "For Sale").length;
    const sold = domains.filter((d) => d.status === "Sold").length;
    return { total, critical, traffic, portfolioValue, forSale, sold };
  }, [domains]);


  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password must be at least 6 characters.");
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    setPw("");
  }

  function copyId() {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    toast.success("User ID copied.");
  }

  const memberSince = user ? new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
  const tier = stats.portfolioValue > 50000 ? "Institutional" : stats.total > 5 ? "Pro Investor" : "Starter";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-14 md:top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-mono uppercase tracking-widest">
            <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Back to Portfolio</span><span className="sm:hidden">Back</span>
          </Link>
          <span className="ml-auto text-xs uppercase tracking-widest text-muted-foreground font-mono">/ Account</span>
        </div>
      </header>



      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading account...
          </div>
        ) : (
          <>
            {/* Profile hero */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 sm:p-8 bg-grid">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full gradient-brand opacity-20 blur-3xl" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl gradient-brand glow-cyan flex items-center justify-center text-primary-foreground text-2xl sm:text-3xl font-bold">
                  {user?.email.slice(0, 1).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold truncate min-w-0">{user?.email}</h1>
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary shrink-0">
                      <ShieldCheck className="h-3 w-3" /> {tier}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 sm:gap-4 text-xs text-muted-foreground font-mono">
                    <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Verified</span>
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Member since</span> {memberSince}</span>
                    <button onClick={copyId} className="inline-flex items-center gap-1.5 hover:text-foreground transition">
                      <Copy className="h-3.5 w-3.5" /> {user?.id.slice(0, 8)}…
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Portfolio stats */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-mono">Portfolio Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={Globe2} label="Total Assets" value={stats.total.toString()} />
                <MetricCard icon={DollarSign} label="Portfolio Value" value={`$${stats.portfolioValue.toLocaleString()}`} accent />
                <MetricCard icon={TrendingUp} label="Total Traffic" value={stats.traffic.toLocaleString()} />
                <MetricCard icon={AlertTriangle} label="Critical (<90d)" value={stats.critical.toString()} danger={stats.critical > 0} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <MetricCard label="For Sale" value={stats.forSale.toString()} />
                <MetricCard label="Sold" value={stats.sold.toString()} />
                <MetricCard label="Active Landers" value={stats.total.toString()} />
                <MetricCard label="Avg. Appraisal" value={stats.total ? `$${Math.round(stats.portfolioValue / Math.max(stats.total, 1)).toLocaleString()}` : "—"} />
              </div>
            </section>

            {/* Two column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security */}
              <section className="rounded-2xl border border-border bg-card/60 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Security</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-5">Rotate your password. Use at least 6 characters.</p>
                <form onSubmit={handlePasswordUpdate} className="space-y-3">
                  <input
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="New password"
                    className="w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md gradient-brand text-primary-foreground px-4 py-2 text-sm font-semibold glow-cyan hover:opacity-90 transition disabled:opacity-60"
                  >
                    {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Update password
                  </button>
                </form>
              </section>

              {/* Recent activity */}
              <section className="rounded-2xl border border-border bg-card/60 p-6">
                <h3 className="font-semibold mb-1">Recent Assets</h3>
                <p className="text-xs text-muted-foreground mb-4">Your latest domains under management.</p>
                <div className="space-y-2">
                  {domains.slice(0, 5).map((d) => {
                    const days = daysUntil(d.expiry_date);
                    return (
                      <div key={d.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{d.domain_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{d.status} · {d.visitor_count.toLocaleString()} visits</div>
                        </div>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${days < 30 ? "border-danger/50 text-danger bg-danger/10" : days < 90 ? "border-warning/50 text-warning bg-warning/10" : "border-success/50 text-success bg-success/10"}`}>
                          {days}d
                        </span>
                      </div>
                    );
                  })}
                  {domains.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No domains yet.</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, accent, danger }: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string; value: string; accent?: boolean; danger?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 bg-card/60 backdrop-blur transition ${accent ? "border-primary/40 glow-cyan" : danger ? "border-danger/40" : "border-border"}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-mono">
        {Icon && <Icon className={`h-3.5 w-3.5 ${danger ? "text-danger" : accent ? "text-primary" : ""}`} />}
        {label}
      </div>
      <div className={`mt-2 text-2xl font-bold ${accent ? "text-primary text-glow" : danger ? "text-danger" : ""}`}>{value}</div>
    </div>
  );
}
