import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

/* ---------- FULL DomainIQ-Pro STYLE APPRAISAL ---------- */

const AppraisalSchema = z.object({
  meaning: z.string().describe("One-line plain-English meaning or origin of the name (e.g. 'French business acronym — Société à Responsabilité Limitée = LLC'). Include translation if non-English."),
  algorithm: z.string().describe("Short label like 'DomainIQ-Pro v2' or 'NameGadget-Pro'."),

  insights: z.array(z.object({
    tone: z.string().describe("One of: market | scarcity | dual | trademark | trend"),
    icon: z.string().describe("Short emoji"),
    title: z.string().describe("Bold headline, under 90 chars"),
    body: z.string().describe("2-3 sentences of concrete evidence — real stats, real markets, real numbers where possible."),
  })).describe("EXACTLY 3 killer insight callouts specific to this domain — market size, scarcity, dual-use, trademark, or trend."),

  marketValue: z.number().describe("Central USD estimated market value"),
  suggestedLow: z.number().describe("Suggested range low USD"),
  suggestedHigh: z.number().describe("Suggested range high USD"),
  valueBasis: z.string().describe("One-liner justifying the range (e.g. 'Based on 4-letter scarcity + ecosystem')."),
  confidence: z.number().describe("0-100 confidence"),

  ecosystem: z.object({
    keyword: z.string(),
    totalTlds: z.number().describe("Realistic count of TLDs where this exact keyword is registered (5-200)"),
    totalNames: z.number().describe("Realistic count of total domains containing this keyword worldwide"),
    interpretation: z.string().describe("Short label: MASSIVE, LARGE, MEDIUM, NICHE"),
    extensionsCsv: z.string().describe("Comma-separated realistic list of 12-30 TLDs including .com, .net, .org, .io, .ai plus regional TLDs relevant to the keyword"),
    analysis: z.string().describe("2-3 sentence expert analysis of the ecosystem — what it means for demand."),
  }),

  comparableSales: z.array(z.object({
    name: z.string(),
    price: z.number(),
    date: z.string().describe("YYYY-MM-DD"),
    venue: z.string().describe("Sedo, GoDaddy, DropCatch, Afternic, NameJet, private"),
    relevance: z.string().describe("'THIS DOMAIN' if it is the appraised domain itself, otherwise 'CONTAINS' or 'RELATED'"),
  })).describe("6-10 plausible comparable sales — include the domain itself as first row if it likely had a wholesale sale, then containing/related sales."),

  pricingContext: z.string().describe("2-3 sentence pricing-tier context explaining where similar domains trade (e.g. 'Random 4-letter .com trade at $1-5k, meaningful acronyms $5-50k+')."),

  webPresence: z.object({
    searchNotes: z.array(z.string()).describe("3-4 short bullets on what google search reveals about the term (Wikipedia, existing brands, coverage)"),
    usageStats: z.array(z.string()).describe("3-5 short bullets with concrete, realistic usage/adoption stats"),
    multiCountry: z.string().describe("One-line list of countries/markets that use the keyword"),
    majorPlatforms: z.string().describe("One-line list of major companies/platforms covering the keyword"),
  }),

  altExtensions: z.array(z.object({
    domain: z.string(),
    status: z.string().describe("Short: 'Fully Developed', 'Active (200)', 'Registered', 'Not Resolving', 'Parked'"),
    statusTone: z.string().describe("developed | active | registered | none"),
    notes: z.string().describe("One sentence on what's actually there."),
  })).describe("EXACTLY 6 alternative TLDs (.io, .net, .org, .eu, .ai, plus one country-code most relevant) with realistic status."),
  altExtensionAnalysis: z.string().describe("2-3 sentence expert takeaway on what the ecosystem tells buyers."),

  brandScores: z.array(z.object({
    component: z.string().describe("Pronunciation | Memorability | Brevity | Brandability | Industry Fit"),
    score: z.number().describe("Score 1-5"),
    rationale: z.string().describe("One-sentence honest justification."),
  })).describe("EXACTLY these 5 components in this order: Pronunciation, Memorability, Brevity, Brandability, Industry Fit."),
  brandScoreTotal: z.number().describe("Sum of the 5 component scores, 0-25"),

  longTerm: z.object({
    projected: z.number().describe("Projected long-term (3-7 yr hold) USD value"),
    rangeLow: z.number(),
    rangeHigh: z.number(),
    thesis: z.array(z.object({
      title: z.string(),
      body: z.string(),
    })).describe("EXACTLY 5 investment thesis bullets — concrete, industry-specific, cite real market trends/companies."),
    catalysts: z.array(z.string()).describe("EXACTLY 5 short growth-catalyst bullets — each mentions a real trend, company, regulation, or number."),
  }),

  rationale: z.string().describe("2-3 sentence executive summary."),
  leads: z.array(z.object({
    company: z.string(),
    industry: z.string(),
    match: z.number().describe("60-99"),
    reason: z.string().describe("One-line why they'd want this."),
  })).describe("5 real, plausible corporate buyer leads."),
  geography: z.array(z.object({
    region: z.string(),
    pct: z.number(),
  })).describe("Regional buyer-intent distribution — 4-6 rows summing near 100."),
});

export const appraiseDomain = createServerFn({ method: "POST" })
  .inputValidator((d: { domain: string }) => z.object({ domain: z.string().min(3) }).parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: AppraisalSchema }),
        prompt: `You are DomainIQ-Pro, a senior domain-industry appraiser combining Estibot, GoDaddy Appraisals, NameBio, DotDB, and BuiltWith methodologies. Produce a FULL institutional-grade appraisal report for the domain: "${data.domain}".

Requirements:
- Be concrete and evidence-based. Cite real markets, real acronyms, real regulations, real platforms (Stripe, HubSpot, Wikipedia, GitHub, etc.) that plausibly reference this term.
- If the name is a known acronym, industry term, French/German/Spanish word, or programming project, IDENTIFY it and use that to drive every section.
- Comparable sales must include the appraised domain itself as the first row (mark relevance="THIS DOMAIN") with a plausible wholesale/DropCatch price, then 5-9 real-sounding sales that contain the keyword (mark "CONTAINS" or "RELATED"). Prices between $200 and $500,000; dates in the last 5 years.
- Alternative Extensions: give realistic per-TLD status. If a well-known project sits on .io or .ai (e.g. sarl.io programming language), flag it "Fully Developed" and describe it.
- Brand Score Breakdown must include exactly these 5 components in this order: Pronunciation, Memorability, Brevity, Brandability, Industry Fit. brandScoreTotal must equal the sum.
- Long-term thesis and catalysts must be specific: name real companies, funding rounds, regulations, demographic trends, TLD math, or ecosystem lock-in effects that make this domain appreciate over 3-7 years.
- Today's date: ${new Date().toISOString().slice(0, 10)}.
No filler, no hedging language, no "may" or "could" without a reason.`,
      });
      const totalPct = output.geography.reduce((s, g) => s + g.pct, 0) || 1;
      const geography = output.geography.map((g) => ({ ...g, pct: Math.round((g.pct / totalPct) * 100) }));
      return { ok: true as const, ...output, geography };
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        return { ok: false as const, error: "AI returned malformed data. Try again." };
      }
      const message = err instanceof Error ? err.message : "Unknown error";
      return { ok: false as const, error: message };
    }
  });

/* ---------- TECH PROFILE ---------- */

const TechSchema = z.object({
  categories: z.array(z.object({
    name: z.string().describe("Category, e.g. Analytics, Frameworks, CDN, Email, SSL, Advertising, Language"),
    items: z.array(z.object({
      name: z.string(),
      description: z.string().describe("One short line"),
    })),
  })),
  summary: z.string().describe("2-sentence overview of the site's technical posture"),
});

export const analyzeTechProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { domain: string }) => z.object({ domain: z.string().min(3) }).parse(d))
  .handler(async ({ data }) => {
    // Fetch homepage + headers (best-effort)
    let html = "";
    let headers: Record<string, string> = {};
    let statusCode = 0;
    try {
      const url = `https://${data.domain}`;
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 NameGadget-TechProfile/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      statusCode = res.status;
      res.headers.forEach((v, k) => { headers[k] = v; });
      const text = await res.text();
      html = text.slice(0, 60_000);
    } catch {
      // continue with empty — AI will infer from domain
    }

    const gateway = getGateway();
    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: TechSchema }),
        prompt: `You are a BuiltWith-style tech profiler. Given the raw response for ${data.domain}, identify the technologies in use across these categories: Analytics and Tracking, Widgets, Language, Frameworks, Mobile, Content Delivery Network, JavaScript Libraries, Advertising, Verified Link, Name Server, Email Hosting, Web Hosting, SSL Certificates, Robots.txt. Only include what's evidenced by the HTML or headers. Keep it concise (max 4 items per category, drop empty categories).

HTTP status: ${statusCode}
Response headers: ${JSON.stringify(headers).slice(0, 3000)}
HTML (truncated): ${html.slice(0, 30_000)}`,
      });
      return { ok: true as const, ...output, fetched: statusCode > 0 };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { ok: false as const, error: message };
    }
  });

/* ---------- LIVE PULSE ---------- */

const PulseSchema = z.object({
  events: z.array(z.object({
    kind: z.enum(["spike", "drop", "signal", "buyer"]),
    headline: z.string().describe("Short realistic market trigger, under 90 chars"),
    delta: z.string().describe("Short numeric like '+42%' or 'NEW'"),
  })).describe("4 fresh market signals tied to this specific domain, keyword, or vertical"),
});

export const generateLivePulse = createServerFn({ method: "POST" })
  .inputValidator((d: { domain: string }) => z.object({ domain: z.string().min(3) }).parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: PulseSchema }),
        prompt: `Simulate 4 plausible fresh market pulse events for the domain "${data.domain}" — search-volume spikes, competitor brand registrations, valuation shifts, or enterprise buyer signals. Reference the domain's keyword or vertical specifically. Make each unique and current-sounding (${new Date().toISOString().slice(0, 10)}). No repeats across calls.`,
      });
      return { ok: true as const, ...output };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { ok: false as const, error: message };
    }
  });
