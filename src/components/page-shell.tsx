import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0a0a0a] text-white border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 0%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(40% 40% at 90% 10%, rgba(4,120,87,0.15) 0%, transparent 60%)",
          }}
        />
        <div className="relative px-8 pt-10 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-400/80">
              {eyebrow}
            </span>
            <span className="h-1 w-1 rounded-full bg-emerald-400/40" />
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/30">
              NameGadget
            </span>
          </div>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4 max-w-2xl">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{description}</p>
              </div>
            </div>
            {actions}
          </div>
        </div>
      </div>

      <div className="p-8">{children}</div>
    </div>
  );
}

export function ComingSoonGrid({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it, i) => (
        <div
          key={it.title}
          className="group relative rounded-xl border border-border bg-card p-5 hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
              Available
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{it.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}
