import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Globe2, MessagesSquare, LayoutTemplate,
  Sparkles, User, LogOut, Search, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import lightLogo from "@/assets/logo.png.asset.json";

type NavItem = { num: string; label: string; to: string; icon: React.ComponentType<{ className?: string }> };

const NAV_MAIN: NavItem[] = [
  { num: "01", label: "Dashboard",   to: "/dashboard", icon: LayoutDashboard },
  { num: "02", label: "Portfolio",   to: "/portfolio", icon: Globe2 },
];

const NAV_TOOLS: NavItem[] = [
  { num: "03", label: "Gadget+",       to: "/gadget-ai", icon: Sparkles },
  { num: "04", label: "Deal Room",     to: "/deal-room", icon: MessagesSquare },
  { num: "05", label: "Landers",       to: "/landers", icon: LayoutTemplate },
];

const NAV_ACCOUNT: NavItem[] = [
  { num: "06", label: "Account",     to: "/account", icon: User },
];

export function BrandSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebarInner = (
    <>
      {/* Brand mark — rounded-square logo tile */}
      <div className="px-5 pt-6 pb-5 border-b border-border flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <span className="h-9 w-9 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex items-center justify-center">
            <img src={lightLogo.url} alt="NameGadget" className="h-6 w-6 object-contain" />
          </span>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">NameGadget</span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <NavGroup label="Main"    items={NAV_MAIN}    pathname={pathname} />
        <NavGroup label="Tools"   items={NAV_TOOLS}   pathname={pathname} />
        <NavGroup label="Account" items={NAV_ACCOUNT} pathname={pathname} />

        <div className="px-2 pt-4 pb-2 mt-4 border-t border-border">
          <label className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground px-1">Search</label>
          <div className="relative mt-2">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Quick find…"
              className="w-full rounded-md bg-muted/50 border border-border pl-8 pr-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:bg-background"
            />
          </div>
        </div>
      </nav>

      {/* Footer / user */}
      <div className="px-4 py-4 border-t border-border space-y-3 bg-muted/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 shadow-sm">
            {email.slice(0, 1).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-foreground truncate font-medium">{email || "—"}</div>
            <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Investor</div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          v1.0 · Live
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-background border-b border-border flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg border border-border bg-card shadow-sm overflow-hidden flex items-center justify-center">
            <img src={lightLogo.url} alt="NameGadget" className="h-5 w-5 object-contain" />
          </span>
          <span className="font-semibold text-sm text-foreground">NameGadget</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar (desktop static, mobile drawer) */}
      <aside
        className={[
          "fixed left-0 top-0 bottom-0 w-[260px] md:w-[240px] bg-background text-foreground z-50 md:z-40 flex flex-col border-r border-border",
          "transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {sidebarInner}
      </aside>
    </>
  );
}

function NavGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="mb-2">
      <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground px-2 pt-3 pb-1.5">
        {label}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.to || (item.to === "/dashboard" && pathname.startsWith("/dashboard") && item.num === "01");
          return (
            <Link
              key={item.num + item.label}
              to={item.to}
              className={[
                "flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all",
                active
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent",
              ].join(" ")}
            >
              <span className={`text-[9px] font-mono w-4 flex-shrink-0 ${active ? "text-primary/70" : "text-muted-foreground/60"}`}>
                {item.num}
              </span>
              <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
