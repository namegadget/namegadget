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

/* ---------- APPRAISAL + LEADS + GEO ---------- */

const AppraisalSchema = z.object({
  low: z.number().describe("Conservative USD valuation"),
  high: z.number().describe("Aggressive USD valuation"),
  confidence: z.number().describe("0-100 confidence score"),
  rationale: z.string().describe("2-3 sentence justification citing length, TLD, keyword, brandability, comparable sales."),
  comparableSales: z.array(z.object({
    name: z.string(),
    price: z.number(),
    year: z.number(),
  })).describe("3 plausible comparable sales"),
  leads: z.array(z.object({
    company: z.string(),
    industry: z.string(),
    match: z.number().describe("Match confidence 60-99"),
    reason: z.string().describe("One-line why they'd want this domain"),
  })).describe("5 targeted corporate buyer leads specific to the domain"),
  geography: z.array(z.object({
    region: z.string(),
    pct: z.number(),
  })).describe("Estimated buyer-intent distribution by region — must sum to ~100"),
});

export const appraiseDomain = createServerFn({ method: "POST" })
  .inputValidator((d: { domain: string }) => z.object({ domain: z.string().min(3) }).parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: AppraisalSchema }),
        prompt: `You are a senior domain-industry appraiser (like Estibot/GoDaddy Appraisals).
Analyze the domain: "${data.domain}"
Consider: TLD, length, pronounceability, keyword strength, industry vertical, brandability, .com premium, trademark risk.
Return a realistic USD valuation range, 3 plausible comparable sales (real-sounding names, prices $500-$500k, recent years), 5 highly targeted corporate buyer leads with real company names in matching industries, and estimated regional buyer-intent distribution.
Be specific and concrete — no filler.`,
      });
      return { ok: true as const, ...output };
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
