// RDAP: browser-safe lookup via public bootstrap. No server function needed.
// Uses rdap.org which follows IANA bootstrap and returns normalized JSON.

export type RdapResult = {
  registrar: string | null;
  expiryDate: string | null; // ISO
  createdDate: string | null;
  nameservers: string[];
  status: string[];
};

const REGISTRAR_ALIASES: Record<string, string> = {
  "godaddy.com, llc": "GoDaddy",
  "namecheap, inc.": "Namecheap",
  "cloudflare, inc.": "Cloudflare",
  "porkbun llc": "Porkbun",
  "dynadot, llc": "Dynadot",
  "google llc": "Google Domains",
  "markmonitor inc.": "MarkMonitor",
  "network solutions, llc": "Network Solutions",
  "tucows domains inc.": "Tucows",
  "gandi sas": "Gandi",
  "name.com, inc.": "Name.com",
};

function normalizeRegistrar(raw: string | null): string | null {
  if (!raw) return null;
  const alias = REGISTRAR_ALIASES[raw.toLowerCase()];
  if (alias) return alias;
  return raw.replace(/,?\s*(llc|inc\.?|ltd|s\.a\.s|sas|gmbh)\.?$/i, "").trim();
}

export async function lookupRdap(domain: string): Promise<RdapResult | null> {
  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!clean.includes(".")) return null;
  try {
    const res = await fetch(`https://rdap.org/domain/${clean}`, {
      headers: { Accept: "application/rdap+json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json() as {
      entities?: Array<{ roles?: string[]; vcardArray?: unknown[] }>;
      events?: Array<{ eventAction: string; eventDate: string }>;
      nameservers?: Array<{ ldhName?: string }>;
      status?: string[];
    };

    let registrar: string | null = null;
    for (const e of json.entities ?? []) {
      if (!e.roles?.includes("registrar")) continue;
      const vcard = e.vcardArray?.[1] as unknown[][] | undefined;
      const fn = vcard?.find((row) => Array.isArray(row) && row[0] === "fn");
      if (fn && typeof fn[3] === "string") { registrar = fn[3]; break; }
    }

    const events = json.events ?? [];
    const expiry = events.find((e) => e.eventAction === "expiration")?.eventDate ?? null;
    const created = events.find((e) => e.eventAction === "registration")?.eventDate ?? null;

    return {
      registrar: normalizeRegistrar(registrar),
      expiryDate: expiry,
      createdDate: created,
      nameservers: (json.nameservers ?? []).map((n) => n.ldhName ?? "").filter(Boolean),
      status: json.status ?? [],
    };
  } catch {
    return null;
  }
}
