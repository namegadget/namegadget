import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "visitor_stats",
  title: "Visitor map data",
  description:
    "Return per-domain visitor counts plus portfolio totals for the signed-in user. Feed for the live visitor map / analytics.",
  inputSchema: {
    domain: z
      .string()
      .trim()
      .optional()
      .describe("Optional: filter to a single domain name."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ domain }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("domains")
      .select("id, domain_name, visitor_count, status, expiry_date, selected_lander")
      .order("visitor_count", { ascending: false });
    if (domain) query = query.eq("domain_name", domain.toLowerCase());

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = data ?? [];
    const totalVisitors = rows.reduce((s, r) => s + (r.visitor_count ?? 0), 0);
    const totalDomains = rows.length;
    const top = rows.slice(0, 10);

    const payload = {
      totals: { totalDomains, totalVisitors },
      top,
      domains: rows,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
