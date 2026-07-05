import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

const LeadsSchema = z.object({
  leads: z.array(
    z.object({
      company: z.string(),
      website: z.string(),
      industry: z.string(),
      email: z.string(),
      phone: z.string(),
      contact_name: z.string(),
      contact_role: z.string(),
      country: z.string(),
      fit_reason: z.string(),
      score: z.number(),
    }),
  ),
});

export type OutboundLead = z.infer<typeof LeadsSchema>["leads"][number];

export const findOutboundLeads = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({
        domain: z.string().min(3),
        industry: z.string().optional(),
        limit: z.number().min(3).max(30).default(12),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false as const, error: "AI gateway not configured" };

    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `You are a B2B domain broker research analyst. For the domain "${data.domain}"${
      data.industry ? ` (industry hint: ${data.industry})` : ""
    }, produce a list of ${data.limit} REAL potential corporate acquirers or strategic buyers.

For each lead return:
- company: real company name
- website: primary domain (no protocol)
- industry: short label
- email: best public outbound email — use real published address if known, otherwise a plausible executive alias at the corporate domain (e.g. bd@company.com, partnerships@company.com). Never invent a fake domain.
- phone: plausible corporate main line in E.164, or "" if unknown
- contact_name: likely BD / M&A / brand lead full name if publicly known, else ""
- contact_role: role title (e.g. "Head of Brand", "VP Corporate Development")
- country: HQ country
- fit_reason: 1 sentence — why this buyer would want the domain
- score: 0-100 acquisition likelihood

Prioritize companies whose brand, product name, or category directly matches or extends the domain. Include a mix of enterprises, growth startups, and portfolio funds.`;

    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: LeadsSchema }),
        prompt,
      });
      return { ok: true as const, leads: output.leads };
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        try {
          const parsed = LeadsSchema.parse(JSON.parse(err.text ?? "{}"));
          return { ok: true as const, leads: parsed.leads };
        } catch {
          return { ok: false as const, error: "Model returned unusable output" };
        }
      }
      return { ok: false as const, error: err instanceof Error ? err.message : "Request failed" };
    }
  });
