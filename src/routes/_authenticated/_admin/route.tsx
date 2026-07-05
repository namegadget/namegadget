import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-14 md:top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center gap-4">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-widest font-mono">/ Admin</span>
          <nav className="ml-auto flex items-center gap-4 text-xs font-mono uppercase tracking-widest">
            <Link to="/admin" activeOptions={{ exact: true }} className="text-muted-foreground hover:text-foreground [&.active]:text-primary">Overview</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8"><Outlet /></main>
    </div>
  );
}
