import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { findOutboundLeads, type OutboundLead } from "@/lib/outbound.functions";
import {
  Send, Loader2, Copy, Download, Mail, Phone, Search, Building2, ExternalLink, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

function toCsv(rows: OutboundLead[]) {
  const cols: (keyof OutboundLead)[] = [
    "company", "website", "industry", "email", "phone",
    "contact_name", "contact_role", "country", "score", "fit_reason",
  ];
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

async function copy(text: string, label: string) {
  await navigator.clipboard.writeText(text);
  toast.success(`${label} copied`);
}

const scoreTone = (n: number) =>
  n >= 80 ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
  : n >= 60 ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
  : "bg-muted text-muted-foreground border-border";

export function OutboundPanel({ initialDomain }: { initialDomain?: string }) {
  const find = useServerFn(findOutboundLeads);
  const [domain, setDomain] = useState(initialDomain ?? "");
  const [industry, setIndustry] = useState("");
  const [limit, setLimit] = useState(12);
  const [leads, setLeads] = useState<OutboundLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (domain.trim().length < 3) return;
    setLoading(true); setError(null);
    try {
      const res = await find({ data: { domain: domain.trim(), industry: industry || undefined, limit } });
      if (res.ok) setLeads(res.leads);
      else setError(res.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally { setLoading(false); }
  }

  const emails = leads.map((l) => l.email).filter(Boolean);
  const phones = leads.map((l) => l.phone).filter(Boolean);

  return (
    <div className="space-y-6">
      <form
        onSubmit={run}
        className="rounded-xl border border-border bg-card p-5 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Domain to sell (e.g. quantum.dev)"
            className="w-full h-11 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            disabled={loading}
          />
        </div>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Industry hint (optional)"
            className="w-full h-11 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            disabled={loading}
          />
        </div>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          disabled={loading}
          className="h-11 px-3 rounded-lg border border-border bg-background text-sm font-mono"
        >
          {[6, 12, 20, 30].map((n) => <option key={n} value={n}>{n} leads</option>)}
        </select>
        <button
          type="submit"
          disabled={loading || domain.trim().length < 3}
          className="h-11 px-5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Finding…</> : <><Send className="h-4 w-4" /> Find Buyers</>}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && <LeadsSkeleton />}

      {!loading && leads.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {leads.length} qualified buyers · avg score {Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActionBtn onClick={() => copy(emails.join(", "), `${emails.length} emails`)} icon={<Mail className="h-3.5 w-3.5" />}>Copy emails</ActionBtn>
              <ActionBtn onClick={() => copy(phones.join(", "), `${phones.length} phones`)} icon={<Phone className="h-3.5 w-3.5" />}>Copy phones</ActionBtn>
              <ActionBtn onClick={() => copy(JSON.stringify(leads, null, 2), "Leads JSON")} icon={<Copy className="h-3.5 w-3.5" />}>Copy all</ActionBtn>
              <ActionBtn
                onClick={() => downloadFile(`leads-${domain}-${Date.now()}.csv`, toCsv(leads), "text/csv")}
                icon={<Download className="h-3.5 w-3.5" />}
                primary
              >CSV</ActionBtn>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/30">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Company</th>
                    <th className="text-left font-medium px-4 py-3">Contact</th>
                    <th className="text-left font-medium px-4 py-3">Email</th>
                    <th className="text-left font-medium px-4 py-3">Phone</th>
                    <th className="text-left font-medium px-4 py-3">Fit</th>
                    <th className="text-left font-medium px-4 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l, i) => (
                    <tr key={`${l.company}-${i}`} className="border-b border-border last:border-0 hover:bg-primary/5">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground truncate max-w-[180px]" title={l.company}>{l.company}</div>
                        {l.website && (
                          <a
                            href={l.website.startsWith("http") ? l.website : `https://${l.website}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-primary"
                          >
                            {l.website} <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{l.industry} · {l.country}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">{l.contact_name || "—"}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l.contact_role}</div>
                      </td>
                      <td className="px-4 py-3">
                        <CopyCell text={l.email} href={l.email ? `mailto:${l.email}` : undefined} />
                      </td>
                      <td className="px-4 py-3">
                        <CopyCell text={l.phone} href={l.phone ? `tel:${l.phone.replace(/[^+0-9]/g, "")}` : undefined} mono />
                      </td>
                      <td className="px-4 py-3 max-w-[280px]">
                        <div className="text-xs text-muted-foreground line-clamp-2">{l.fit_reason}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center h-7 min-w-11 px-2 rounded-md border text-[11px] font-mono font-semibold ${scoreTone(l.score)}`}>
                          {l.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && leads.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Enter a domain above and Gadget will surface corporate buyers, contact emails, phone numbers, and fit reasoning — copy or download the list in one click.
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  onClick, icon, children, primary,
}: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-md border text-[11px] font-mono uppercase tracking-widest transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary/40 ${
        primary
          ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
          : "bg-card border-border text-muted-foreground hover:text-primary hover:border-primary/40"
      }`}
    >
      {icon} {children}
    </button>
  );
}

function CopyCell({ text, href, mono }: { text: string; href?: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  if (!text) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {href ? (
        <a
          href={href}
          className={`truncate max-w-[180px] text-xs ${mono ? "font-mono" : ""} text-foreground hover:text-primary`}
          title={text}
        >
          {text}
        </a>
      ) : (
        <span className={`truncate max-w-[180px] text-xs ${mono ? "font-mono" : ""}`}>{text}</span>
      )}
      <button
        title="Copy"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="h-6 w-6 inline-flex items-center justify-center rounded border border-transparent hover:border-border hover:bg-muted/60 text-muted-foreground hover:text-primary transition"
      >
        {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}

function LeadsSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4 border-b border-border last:border-0 p-4">
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="h-4 rounded bg-muted/60 animate-pulse" style={{ opacity: 1 - j * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
