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
    <div className="min-h-screen bg-background">
      {/* Hero — Page Pulse-inspired: light, centered pill eyebrow, bold headline */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-14 pb-8 md:pb-10">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground mb-5 shadow-sm">
                <span className="h-5 w-5 rounded-full gradient-brand inline-flex items-center justify-center">
                  <Icon className="h-3 w-3 text-primary-foreground" />
                </span>
                <span className="tracking-wide uppercase">{eyebrow}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-foreground">
                {title}
              </h1>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
            {actions && <div className="col-span-2 sm:col-auto shrink-0">{actions}</div>}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">{children}</div>
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
