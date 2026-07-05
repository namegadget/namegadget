import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Users, Globe2, Handshake, ShieldCheck } from "lucide-react";

const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const [profiles, domains, deals, roles] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("domains").select("id", { count: "exact", head: true }),
      supabase.from("deals").select("id", { count: "exact", head: true }),
      supabase.from("user_roles").select("id", { count: "exact", head: true }),
    ]);
    return {
      users: profiles.count ?? 0,
      domains: domains.count ?? 0,
      deals: deals.count ?? 0,
      admins: roles.count ?? 0,
    };
  });

const q = queryOptions({ queryKey: ["admin-stats"], queryFn: () => getAdminStats() });

export const Route = createFileRoute("/_authenticated/_admin/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: AdminIndex,
  errorComponent: ({ error }) => <div className="text-danger">{String(error)}</div>,
});

function AdminIndex() {
  const { data } = useSuspenseQuery(q);
  const cards = [
    { icon: Users, label: "Users", value: data.users },
    { icon: Globe2, label: "Domains", value: data.domains },
    { icon: Handshake, label: "Deals", value: data.deals },
    { icon: ShieldCheck, label: "Admins", value: data.admins },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Marketplace-wide metrics.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-mono">
              <c.icon className="h-3.5 w-3.5" /> {c.label}
            </div>
            <div className="mt-2 text-3xl font-bold text-primary text-glow">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
