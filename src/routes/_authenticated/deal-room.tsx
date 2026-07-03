import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MessagesSquare, Send, ShieldCheck, Copy, Plus, X, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/page-shell";
import { createEscrowTransaction } from "@/lib/escrow.functions";

export const Route = createFileRoute("/_authenticated/deal-room")({
  component: DealRoomPage,
});

type Stage = "Inbound" | "Negotiating" | "Agreed" | "Closed";
type Msg = { from: "buyer" | "seller"; text: string; time: string };
type Escrow = {
  status: "idle" | "creating" | "created" | "error";
  transactionId?: string;
  landingUrl?: string | null;
  error?: string;
};
type Deal = {
  id: string;
  domain: string;
  buyer: string;
  buyerEmail: string;
  offer: number;
  counter?: number;
  stage: Stage;
  messages: Msg[];
  updated: string;
  escrow?: Escrow;
};

const STAGES: Stage[] = ["Inbound", "Negotiating", "Agreed", "Closed"];

const SEED: Deal[] = [
  { id: "d1", domain: "quantum.dev", buyer: "Sequoia Labs", buyerEmail: "deals@sequoialabs.vc", offer: 8000, counter: 14500, stage: "Negotiating", updated: "10:29",
    messages: [
      { from: "buyer", text: "Opening at $8,000.", time: "10:22" },
      { from: "seller", text: "Counter at $14,500 — comparable sales support this.", time: "10:24" },
      { from: "buyer", text: "$11,000 firm.", time: "10:29" },
    ] },
  { id: "d2", domain: "aiagent.io", buyer: "Anthropic Corp", buyerEmail: "acquisitions@anthropic.com", offer: 22000, stage: "Inbound", updated: "09:55",
    messages: [{ from: "buyer", text: "We'd like to acquire aiagent.io. Opening bid $22k.", time: "09:55" }] },
  { id: "d3", domain: "neuralcore.ai", buyer: "OpenAI Research", buyerEmail: "domains@openai.com", offer: 45000, counter: 55000, stage: "Agreed", updated: "Yesterday",
    messages: [
      { from: "buyer", text: "$45k final?", time: "Yesterday" },
      { from: "seller", text: "$55k firm. Escrow ready.", time: "Yesterday" },
      { from: "buyer", text: "Accepted. Proceeding via Escrow.com.", time: "Yesterday" },
    ] },
  { id: "d4", domain: "fintechly.com", buyer: "Stripe Ventures", buyerEmail: "ma@stripe.com", offer: 32000, stage: "Closed", updated: "3d ago",
    messages: [{ from: "buyer", text: "Deal closed. Wire sent.", time: "3d ago" }] },
];

const STAGE_STYLE: Record<Stage, string> = {
  Inbound: "border-sky-500/40 text-sky-600 bg-sky-500/10",
  Negotiating: "border-warning/40 text-warning bg-warning/10",
  Agreed: "border-primary/40 text-primary bg-primary/10",
  Closed: "border-muted-foreground/30 text-muted-foreground bg-muted/40",
};

function DealRoomPage() {
  const [deals, setDeals] = useState<Deal[]>(SEED);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const m: Record<Stage, Deal[]> = { Inbound: [], Negotiating: [], Agreed: [], Closed: [] };
    for (const d of deals) m[d.stage].push(d);
    return m;
  }, [deals]);

  const active = deals.find((d) => d.id === openId) ?? null;

  function move(id: string, stage: Stage) {
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, stage, updated: "just now" } : d)));
  }

  function update(id: string, patch: Partial<Deal>) {
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch, updated: "just now" } : d)));
  }

  function addDeal() {
    const domain = prompt("Domain for new deal?");
    if (!domain) return;
    const buyerEmail = prompt("Buyer email (they'll be added to Escrow automatically)?") || "buyer@example.com";
    const id = `d${Date.now()}`;
    setDeals((ds) => [
      { id, domain, buyer: buyerEmail.split("@")[0], buyerEmail, offer: 0, stage: "Inbound", messages: [], updated: "just now" },
      ...ds,
    ]);
    setOpenId(id);
  }

  // Auto-generate Escrow transaction when a deal enters "Agreed".
  const createEscrow = useServerFn(createEscrowTransaction);
  async function autoEscrow(deal: Deal) {
    if (deal.escrow?.status === "creating" || deal.escrow?.status === "created") return;
    const amount = deal.counter ?? deal.offer;
    if (!amount) return;
    update(deal.id, { escrow: { status: "creating" } });
    toast.info(`Generating Escrow transaction for ${deal.domain}…`);
    try {
      const res = await createEscrow({
        data: { domain: deal.domain, amount, buyerEmail: deal.buyerEmail },
      });
      if (res.ok) {
        update(deal.id, {
          escrow: { status: "created", transactionId: String(res.transactionId), landingUrl: res.landingUrl },
        });
        toast.success(`Escrow #${res.transactionId} created — 0% commission, NameGadget as broker.`);
      } else {
        update(deal.id, { escrow: { status: "error", error: res.error } });
        toast.error(`Escrow failed (${res.status}): ${res.error.slice(0, 120)}`);
      }
    } catch (e: any) {
      update(deal.id, { escrow: { status: "error", error: e.message } });
      toast.error(e.message);
    }
  }

  function moveWithEscrow(id: string, stage: Stage) {
    move(id, stage);
    if (stage === "Agreed") {
      const d = deals.find((x) => x.id === id);
      if (d) void autoEscrow({ ...d, stage });
    }
  }

  return (
    <PageShell
      eyebrow="05 · Deal Room"
      title="P2P Deal Room"
      description="Commission-free negotiations across every stage of the funnel. Drag deals through Inbound → Negotiating → Agreed → Closed."
      icon={MessagesSquare}
      actions={
        <button
          onClick={addDeal}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New deal
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <div
            key={stage}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId) { moveWithEscrow(dragId, stage); setDragId(null); } }}
            className="rounded-xl border border-border bg-card/60 p-3 min-h-[420px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-mono uppercase tracking-widest ${STAGE_STYLE[stage]}`}>
                  {stage}
                </span>
                <span className="text-xs text-muted-foreground">{grouped[stage].length}</span>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              {grouped[stage].map((d) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={() => setDragId(d.id)}
                  onClick={() => setOpenId(d.id)}
                  className="rounded-lg border border-border bg-background p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{d.domain}</p>
                    <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{d.updated}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.buyer}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-mono">${d.offer.toLocaleString()}</span>
                    {d.counter && (
                      <span className="font-mono text-primary inline-flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" /> ${d.counter.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {d.escrow && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest">
                      {d.escrow.status === "creating" && <><Loader2 className="h-3 w-3 animate-spin text-primary" /><span className="text-primary">Escrow…</span></>}
                      {d.escrow.status === "created" && <><CheckCircle2 className="h-3 w-3 text-success" /><span className="text-success">Escrow #{d.escrow.transactionId}</span></>}
                      {d.escrow.status === "error" && <span className="text-destructive">Escrow error</span>}
                    </div>
                  )}
                </div>
              ))}
              {grouped[stage].length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-[11px] text-muted-foreground">
                  Drop deal here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <DealDetail
          deal={active}
          onClose={() => setOpenId(null)}
          onUpdate={(patch) => update(active.id, patch)}
          onMove={(stage) => moveWithEscrow(active.id, stage)}
          onEscrow={() => autoEscrow(active)}
        />
      )}
    </PageShell>
  );
}

function DealDetail({
  deal, onClose, onUpdate, onMove, onEscrow,
}: { deal: Deal; onClose: () => void; onUpdate: (p: Partial<Deal>) => void; onMove: (s: Stage) => void; onEscrow: () => void }) {
  const [draft, setDraft] = useState("");
  const [amount, setAmount] = useState("");

  function send(from: "buyer" | "seller") {
    if (!draft.trim() && !amount) return;
    const text = draft || `Offer: $${Number(amount).toLocaleString()}`;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      messages: [...deal.messages, { from, text, time }],
      ...(amount ? (from === "buyer" ? { offer: Number(amount) } : { counter: Number(amount) }) : {}),
    });
    setDraft(""); setAmount("");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-full sm:max-w-2xl h-full bg-card border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between z-10 gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground truncate">Deal · {deal.buyer}</p>
            <h3 className="text-lg sm:text-xl font-bold truncate">{deal.domain}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted shrink-0"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Stage switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-background/60">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => onMove(s)}
                className={`flex-1 text-[11px] font-mono uppercase tracking-widest py-1.5 rounded-md transition ${
                  deal.stage === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Offer summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Buyer offer</p>
              <p className="text-2xl font-bold mt-1">${deal.offer.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary">Seller counter</p>
              <p className="text-2xl font-bold mt-1 text-primary">{deal.counter ? `$${deal.counter.toLocaleString()}` : "—"}</p>
            </div>
          </div>

          {/* Chat */}
          <div className="rounded-xl border border-border bg-background/40 overflow-hidden">
            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {deal.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "seller" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    m.from === "seller" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
                  }`}>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-0.5 ${m.from === "seller" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-2 flex items-center gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="$"
                className="w-24 h-9 rounded-md border border-border bg-background px-2 text-sm font-mono outline-none focus:border-primary"
              />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send("seller")}
                placeholder="Reply or counter…"
                className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <button onClick={() => send("buyer")} className="h-9 px-2 rounded-md border border-border text-[10px] font-mono uppercase hover:bg-muted">Buyer</button>
              <button onClick={() => send("seller")} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-mono uppercase inline-flex items-center gap-1"><Send className="h-3 w-3" /> Send</button>
            </div>
          </div>

          {/* Checkout */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Instant checkout</p>
              <span className="ml-auto rounded-full border border-success/40 bg-success/10 text-success px-2 py-0.5 text-[10px] font-semibold">0% fees</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Escrow", "Atompay", "Safepay"].map((p) => (
                <button
                  key={p}
                  onClick={() => toast.success(`${p} — Frictionless Integration Generated Successfully.`)}
                  className="rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 py-2 text-sm font-medium"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 truncate">
                namegadget.deal/{deal.id}
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText(`https://namegadget.deal/${deal.id}`); toast.success("Copied"); }}
                className="h-8 w-8 rounded-md border border-border hover:bg-muted flex items-center justify-center"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
