import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessagesSquare, Send, ShieldCheck, Copy, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/deal-room")({
  component: DealRoomPage,
});

type Msg = { from: "buyer" | "seller"; text: string; amount?: number; time: string };

const SEED: Msg[] = [
  { from: "buyer", text: "Interested in acquiring. Opening at $8,000.", amount: 8000, time: "10:22" },
  { from: "seller", text: "Thanks for the interest. Counter at $14,500 — comparable sales in the ballpark.", amount: 14500, time: "10:24" },
  { from: "buyer", text: "Meeting in the middle — $11,000 firm.", amount: 11000, time: "10:29" },
];

function DealRoomPage() {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [draft, setDraft] = useState("");
  const [amount, setAmount] = useState<string>("");

  function send(from: "buyer" | "seller") {
    if (!draft.trim() && !amount) return;
    setMsgs((m) => [
      ...m,
      {
        from,
        text: draft || `Offer: $${Number(amount).toLocaleString()}`,
        amount: amount ? Number(amount) : undefined,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
    setAmount("");
  }

  function integration(name: string) {
    toast.success(`${name} — Frictionless Integration Generated Successfully.`);
  }

  return (
    <PageShell
      eyebrow="05 · Deal Room"
      title="P2P Deal Room"
      description="Commission-free peer-to-peer negotiations. 0% broker fees. Instant checkout via Escrow, Atompay, or Safepay."
      icon={MessagesSquare}
      actions={
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-card border border-border text-sm font-medium hover:border-emerald-500/40 transition"
        >
          Open on a domain <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Negotiation · quantum.dev</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Buyer ↔ Seller · 0% fees
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-700 bg-emerald-500/10 px-2 py-1 rounded">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          </div>

          <div className="flex-1 p-5 space-y-3 max-h-[420px] overflow-y-auto">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "seller" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.from === "seller"
                      ? "bg-emerald-500 text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <div>{m.text}</div>
                  <div className={`text-[10px] font-mono mt-1 ${m.from === "seller" ? "text-emerald-50/80" : "text-muted-foreground"}`}>
                    {m.from.toUpperCase()} · {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-3 flex items-center gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="$ offer"
              className="w-28 h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono outline-none focus:border-emerald-500/60"
            />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send("seller")}
              placeholder="Message or counter-offer…"
              className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-emerald-500/60"
            />
            <button
              onClick={() => send("buyer")}
              className="h-10 px-3 rounded-lg border border-border text-xs font-mono uppercase tracking-widest hover:bg-muted"
            >
              As Buyer
            </button>
            <button
              onClick={() => send("seller")}
              className="h-10 px-3 rounded-lg bg-emerald-500 text-white text-xs font-mono uppercase tracking-widest hover:bg-emerald-600 flex items-center gap-1.5"
            >
              <Send className="h-3 w-3" /> Send
            </button>
          </div>
        </div>

        {/* Checkout */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Instant Checkout
            </div>
            <div className="space-y-2">
              {["Escrow", "Atompay", "Safepay"].map((n) => (
                <button
                  key={n}
                  onClick={() => integration(n)}
                  className="w-full h-10 rounded-lg border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 flex items-center justify-between px-4 text-sm font-medium transition"
                >
                  <span>{n}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600">Generate</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Secure link
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 truncate">
                namegadget.deal/qtm-9f2a
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("https://namegadget.deal/qtm-9f2a");
                  toast.success("Copied");
                }}
                className="h-8 w-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              Buyer receives a one-time secure page. 0% broker cut. Funds routed via the provider you select above.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
