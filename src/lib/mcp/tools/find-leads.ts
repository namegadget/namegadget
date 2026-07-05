import { defineTool } from "@lovable.dev/mcp-js";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const LeadsSchema = z.object({
  leads: z.array(
    z.object({
      company: z.string(),
      website: z.string(),
      contactEmail: z.string(),
      contactPhone: z.string(),
      reason: z.string(),
      score: z.number(),
    }),
  ),
});

export default defineTool({
  name: "find_leads",
  title: "Find outbound leads",
  description:
    "Generate a ranked list of potential corporate buyers for a domain. Returns company, website, likely contact email, phone, relevance reason and 0-100 score.",
  inputSchema: {
    domain: z.string().trim().min(3).describe("Target domain, e.g. quantumleap.ai"),
    limit: z.number().int().min(1).max(20).optional().describe("Max leads (default 8)."),
    industry: z.string().trim().optional().describe("Optional industry hint (fintech, saas, etc.)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ domain, limit, industry }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { content: [{ type: "text", text: "AI gateway not configured" }], isError: true };
    }
    const gateway = createLovableAiGatewayProvider(key);
    const max = limit ?? 8;

    const prompt = `You are an outbound-lead prospecting engine for domain brokers.
Given a domain, return ${max} realistic corporate buyer leads most likely to want it.
Domain: ${domain}
${industry ? `Industry hint: ${industry}` : ""}

For each lead include: company name, primary website, a plausible generic contact email (info@, hello@, contact@), a plausible phone (with country code or "unknown"), a one-sentence reason it is a fit, and a 0-100 relevance score. Prefer well-known active companies whose brand or product line overlaps the domain keyword.`;

    try {
      const { experimental_output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
        experimental_output: Output.object({ schema: LeadsSchema }),
      });
      const leads = experimental_output.leads.slice(0, max);
      return {
        content: [{ type: "text", text: JSON.stringify(leads, null, 2) }],
        structuredContent: { domain, leads },
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return {
          content: [{ type: "text", text: `Model returned malformed output: ${error.text ?? ""}` }],
          isError: true,
        };
      }
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `find_leads failed: ${msg}` }], isError: true };
    }
  },
});
