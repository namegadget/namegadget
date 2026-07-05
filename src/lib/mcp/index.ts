import { auth, defineMcp } from "@lovable.dev/mcp-js";
import addDomainTool from "./tools/add-domain";
import findLeadsTool from "./tools/find-leads";
import listDomainsTool from "./tools/list-domains";
import visitorStatsTool from "./tools/visitor-stats";
import whoamiTool from "./tools/whoami";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "namegadget-mcp",
  title: "NameGadget",
  version: "0.1.0",
  instructions:
    "NameGadget MCP: manage your domain portfolio. Use `whoami` for auth, `list_domains` to read the portfolio, `add_domain` to add one, `visitor_stats` to feed the live visitor map, and `find_leads` to generate outbound buyer leads for a domain.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listDomainsTool, addDomainTool, visitorStatsTool, findLeadsTool],
});
