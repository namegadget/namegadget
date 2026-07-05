import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Globe2, Handshake, ShieldCheck } from "lucide-react";

const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase: sb, userId } = context;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const [profiles, domains, deals, roles] = await Promise.all([
      sb.from("profiles").select("id", { count: "exact", head: true }),
      sb.from("domains").select("id", { count: "exact", head: true }),
      sb.from("deals").select("id", { count: "exact", head: true }),
      sb.from("user_roles").select("id", { count: "exact", head: true }),
    ]);
    return {
      users: profiles.count ?? 0,
      domains: domains.count ?? 0,
      deals: deals.count ?? 0,
      admins: roles.count ?? 0,
    };
  });

const q = queryOptions({ queryKey: ["admin-stats"], queryFn: () => getAdminStats() });

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth", search: { next: undefined } });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/dashboard" as const });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: AdminPage,
  errorComponent: ({ error }) => <div className="p-8 text-danger">{String(error)}</div>,
  notFoundComponent: () => <div className="p-8 text-muted-foreground">Not found.</div>,
});

function AdminPage() {
  const { data } = useSuspenseQuery(q);
  const cards = [
    { icon: Users, label: "Users", value: data.users },
    { icon: Globe2, label: "Domains", value: data.domains },
    { icon: Handshake, label: "Deals", value: data.deals },
    { icon: ShieldCheck, label: "Admins", value: data.admins },
  ];
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-14 md:top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-widest font-mono">/ Admin</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-6">
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
      </main>
    </div>
  );
}
