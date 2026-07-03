import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Globe2, Radio, MessagesSquare, LayoutTemplate,
  Sparkles, User, LogOut, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import darkLogo from "@/assets/darkmodelogo.png.asset.json";


type NavItem = { num: string; label: string; to: string; icon: React.ComponentType<{ className?: string }> };

const NAV_MAIN: NavItem[] = [
  { num: "01", label: "Dashboard",   to: "/dashboard", icon: LayoutDashboard },
  { num: "02", label: "Portfolio",   to: "/dashboard", icon: Globe2 },
];

const NAV_TOOLS: NavItem[] = [
  { num: "03", label: "gadget AI",     to: "/dashboard", icon: Sparkles },
  { num: "04", label: "gadget+ Live",  to: "/dashboard", icon: Radio },
  { num: "05", label: "Deal Room",     to: "/dashboard", icon: MessagesSquare },
  { num: "06", label: "Landers",       to: "/dashboard", icon: LayoutTemplate },
];

const NAV_ACCOUNT: NavItem[] = [
  { num: "07", label: "Account",     to: "/account", icon: User },
];

export function BrandSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar text-sidebar-foreground z-40 flex flex-col border-r border-sidebar-border">
      {/* Brand mark */}
      <div className="px-5 pt-7 pb-5 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 mb-1 group">
          <img src={darkLogo.url} alt="NameGadget" className="h-8 w-auto" />
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-white/20">
          NameGadget
        </span>
      </div>


      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <NavGroup label="Main"    items={NAV_MAIN}    pathname={pathname} />
        <NavGroup label="Tools"   items={NAV_TOOLS}   pathname={pathname} />
        <NavGroup label="Account" items={NAV_ACCOUNT} pathname={pathname} />

        <div className="px-2 pt-4 pb-2 mt-4 border-t border-sidebar-border">
          <label className="text-[9px] font-mono uppercase tracking-[0.14em] text-white/20 px-1">Search</label>
          <div className="relative mt-2">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              placeholder="Quick find…"
              className="w-full rounded-md bg-white/5 border border-white/5 pl-8 pr-2 py-1.5 text-xs text-white/80 placeholder:text-white/25 outline-none focus:border-primary/60"
            />
          </div>
        </div>
      </nav>

      {/* Footer / user */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {email.slice(0, 1).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-white/80 truncate font-medium">{email || "—"}</div>
            <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Investor</div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          v1.0 · Live
        </div>
      </div>
    </aside>
  );
}

function NavGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="mb-2">
      <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-white/20 px-2 pt-3 pb-1.5">
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
                "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] font-medium transition-all",
                active
                  ? "text-primary bg-primary/10"
                  : "text-white/45 hover:text-white/85 hover:bg-white/5",
              ].join(" ")}
            >
              <span className={`text-[9px] font-mono w-4 flex-shrink-0 ${active ? "text-primary/50" : "text-white/20"}`}>
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
