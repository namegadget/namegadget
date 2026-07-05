import { auth, defineMcp } from "@lovable.dev/mcp-js";
import addDomainTool from "./tools/add-domain";
import listDomainsTool from "./tools/list-domains";
import whoamiTool from "./tools/whoami";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "namegadget-mcp",
  title: "NameGadget",
  version: "0.1.0",
  instructions:
    "NameGadget MCP: manage your domain portfolio. Use `whoami` to verify auth, `list_domains` to read your portfolio, and `add_domain` to add a new domain.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listDomainsTool, addDomainTool],
});
