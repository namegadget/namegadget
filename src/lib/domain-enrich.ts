// Domain enrichment — all free, browser-safe APIs. No keys required.
// - RDAP (rdap.org)       → registrar, expiry, created date, nameservers
// - Cloudflare DoH        → A / MX record presence (alive/parked signal)
// - Simple heuristics     → visitor_count estimate from age + TLD + length

import { lookupRdap, type RdapResult } from "@/lib/rdap";

export type DomainEnrichment = {
  domain: string;
  registrar: string;
  expiryIso: string;
  createdIso: string | null;
  nameservers: string[];
  hasA: boolean;
  hasMx: boolean;
  visitorEstimate: number;
  source: "rdap+dns" | "dns-only" | "fallback";
  note: string;
};

const REGISTRAR_LIST = [
  "Namecheap", "GoDaddy", "Cloudflare", "Porkbun", "Dynadot",
  "Google Domains", "Name.com", "Gandi", "Tucows", "Network Solutions",
  "MarkMonitor", "Other",
];

function matchRegistrar(name: string | null): string {
  if (!name) return "Other";
  return REGISTRAR_LIST.find((r) => r.toLowerCase() === name.toLowerCase()) ?? "Other";
}

async function dohQuery(name: string, type: "A" | "MX"): Promise<boolean> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return false;
    const j = await res.json() as { Answer?: unknown[] };
    return Array.isArray(j.Answer) && j.Answer.length > 0;
  } catch { return false; }
}

function estimateTraffic(domain: string, created: string | null, hasA: boolean): number {
  if (!hasA) return 0;
  const ageDays = created
    ? Math.max(1, Math.floor((Date.now() - new Date(created).getTime()) / 86400000))
    : 365;
  const tld = domain.split(".").pop() ?? "";
  const tldBonus = tld === "com" ? 2.4 : tld === "io" ? 1.8 : tld === "co" ? 1.5 : tld === "ai" ? 2.0 : 1.0;
  const lenPenalty = Math.max(0.4, 1 - Math.max(0, domain.split(".")[0].length - 8) * 0.06);
  const base = Math.log10(ageDays + 10) * 420;
  const seed = [...domain].reduce((s, c) => s + c.charCodeAt(0), 0);
  const jitter = 0.7 + ((seed % 60) / 100); // 0.7 – 1.3
  return Math.round(base * tldBonus * lenPenalty * jitter);
}

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

export async function enrichDomain(input: string): Promise<DomainEnrichment> {
  const domain = normalizeDomain(input);
  const [rdap, hasA, hasMx] = await Promise.all([
    lookupRdap(domain) as Promise<RdapResult | null>,
    dohQuery(domain, "A"),
    dohQuery(domain, "MX"),
  ]);

  const registrar = matchRegistrar(rdap?.registrar ?? null);
  const expiryIso = rdap?.expiryDate
    ? new Date(rdap.expiryDate).toISOString()
    : new Date(Date.now() + 365 * 86400000).toISOString();
  const createdIso = rdap?.createdDate ?? null;
  const visitorEstimate = estimateTraffic(domain, createdIso, hasA);

  const source: DomainEnrichment["source"] = rdap
    ? "rdap+dns"
    : (hasA || hasMx) ? "dns-only" : "fallback";
  const note = rdap
    ? `RDAP · ${registrar}${rdap.expiryDate ? ` · expires ${rdap.expiryDate.slice(0, 10)}` : ""}${hasA ? " · live" : " · parked"}`
    : (hasA || hasMx) ? `DNS only · ${hasA ? "live" : "no A"}${hasMx ? " · mail" : ""}` : "no RDAP · defaults";

  return {
    domain, registrar, expiryIso, createdIso,
    nameservers: rdap?.nameservers ?? [],
    hasA, hasMx, visitorEstimate, source, note,
  };
}
