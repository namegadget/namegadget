import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MessagesSquare, Send, ShieldCheck, Plus, X, ArrowRight, Loader2, CheckCircle2, Lock, ExternalLink } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { createEscrowTransaction } from "@/lib/escrow.functions";
import { updateDealStage, updateDealAmounts } from "@/lib/deals.functions";

export const Route = createFileRoute("/_authenticated/deal-room")({
  component: DealRoomPage,
});

type Stage = "Inbound" | "Negotiating" | "Agreed" | "Paid" | "Completed" | "Closed";
type Deal = {
  id: string;
  domain_id: string;
  domain_name: string;
  seller_id: string;
  buyer_id: string | null;
  buyer_email: string;
  buyer_name: string | null;
  offer: number;
  counter: number | null;
  stage: Stage;
  escrow_transaction_id: string | null;
  updated_at: string;
};
type EscrowRow = {
  id: string;
  deal_id: string | null;
  transaction_id: string | null;
  amount: number;
  status: string;
  payment_url: string | null;
  landing_url: string | null;
  fee_allocation: string;
};

const STAGES: Stage[] = ["Inbound", "Negotiating", "Agreed", "Paid", "Completed", "Closed"];
const STAGE_STYLE: Record<Stage, string> = {
  Inbound: "border-sky-500/40 text-sky-600 bg-sky-500/10",
  Negotiating: "border-warning/40 text-warning bg-warning/10",
  Agreed: "border-primary/40 text-primary bg-primary/10",
  Paid: "border-emerald-500/40 text-emerald-600 bg-emerald-500/10",
  Completed: "border-emerald-500/40 text-emerald-600 bg-emerald-500/10",
  Closed: "border-muted-foreground/30 text-muted-foreground bg-muted/40",
};

function DealRoomPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [escrowByDeal, setEscrowByDeal] = useState<Record<string, EscrowRow>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [me, setMe] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const updateStage = useServerFn(updateDealStage);

  // Load current user + deals
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) setMe({ id: u.user.id, email: u.user.email || "" });

      const { data: dealRows } = await supabase
        .from("deals")
        .select("*")
        .order("updated_at", { ascending: false });
      setDeals((dealRows as Deal[]) || []);

      const { data: txRows } = await supabase
        .from("escrow_transactions")
        .select("id, deal_id, transaction_id, amount, status, payment_url, landing_url, fee_allocation");
      const map: Record<string, EscrowRow> = {};
      (txRows as EscrowRow[] | null)?.forEach((r) => { if (r.deal_id) map[r.deal_id] = r; });
      setEscrowByDeal(map);
      setLoading(false);
    })();
  }, []);

  // Realtime: deals + escrow transactions
  useEffect(() => {
    const ch = supabase
      .channel("deal-room")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, (payload) => {
        setDeals((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as Deal, ...prev];
          if (payload.eventType === "UPDATE") return prev.map((d) => d.id === (payload.new as Deal).id ? payload.new as Deal : d);
          if (payload.eventType === "DELETE") return prev.filter((d) => d.id !== (payload.old as Deal).id);
          return prev;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "escrow_transactions" }, (payload) => {
        const row = payload.new as EscrowRow;
        if (row?.deal_id) setEscrowByDeal((prev) => ({ ...prev, [row.deal_id!]: row }));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const grouped = useMemo(() => {
    const m: Record<Stage, Deal[]> = { Inbound: [], Negotiating: [], Agreed: [], Paid: [], Completed: [], Closed: [] };
    for (const d of deals) m[d.stage as Stage]?.push(d);
    return m;
  }, [deals]);

  const active = deals.find((d) => d.id === openId) ?? null;
  const activeTx = active ? escrowByDeal[active.id] : undefined;

  async function move(id: string, stage: Stage) {
    setDeals((ds) => ds.map((d) => d.id === id ? { ...d, stage } : d));
    try { await updateStage({ data: { dealId: id, stage } }); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <PageShell
      eyebrow="05 · Deal Room"
      title="P2P Deal Room"
      description="Real-time negotiations with brokered Escrow.com checkout. Drag deals through the funnel."
      icon={MessagesSquare}
      actions={
        <a
          href="/portfolio"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" /> List a domain
        </a>
      }
    >
      {loading && <div className="text-sm text-muted-foreground">Loading deals…</div>}
      {!loading && deals.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No deals yet. Buyers who click <b>Buy Now</b> on your landing pages will appear here automatically.
        </div>
      )}

      {!loading && deals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {STAGES.map((stage) => (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) { void move(dragId, stage); setDragId(null); } }}
              className="rounded-xl border border-border bg-card/60 p-3 min-h-[420px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-mono uppercase tracking-widest ${STAGE_STYLE[stage]}`}>
                  {stage}
                </span>
                <span className="text-xs text-muted-foreground">{grouped[stage].length}</span>
              </div>

              <div className="space-y-2 flex-1">
                {grouped[stage].map((d) => {
                  const tx = escrowByDeal[d.id];
                  return (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={() => setDragId(d.id)}
                      onClick={() => setOpenId(d.id)}
                      className="rounded-lg border border-border bg-background p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm truncate">{d.domain_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.buyer_email}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-mono">${d.offer.toLocaleString()}</span>
                        {d.counter && (
                          <span className="font-mono text-primary inline-flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" /> ${d.counter.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {tx && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest">
                          {tx.status === "created" && <><CheckCircle2 className="h-3 w-3 text-primary" /><span className="text-primary">Escrow #{tx.transaction_id}</span></>}
                          {(tx.status === "secured" || tx.status === "in_progress") && <><Lock className="h-3 w-3 text-emerald-600" /><span className="text-emerald-600">Payment secured</span></>}
                          {(tx.status === "closed" || tx.status === "completed") && <><CheckCircle2 className="h-3 w-3 text-emerald-600" /><span className="text-emerald-600">Sold</span></>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {grouped[stage].length === 0 && (
                  <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-[11px] text-muted-foreground">Drop deal here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && me && (
        <DealDetail
          deal={active}
          tx={activeTx}
          me={me}
          onClose={() => setOpenId(null)}
          onMove={(s) => void move(active.id, s)}
          onEscrowCreated={(row) => setEscrowByDeal((p) => ({ ...p, [active.id]: row }))}
        />
      )}
    </PageShell>
  );
}

// ================= Deal detail drawer =================

type Msg = { id: string; deal_id: string; sender_role: "buyer"|"seller"|"system"; body: string; cta_url: string | null; created_at: string; sender_id: string | null };

function DealDetail({
  deal, tx, me, onClose, onMove, onEscrowCreated,
}: {
  deal: Deal;
  tx?: EscrowRow;
  me: { id: string; email: string };
  onClose: () => void;
  onMove: (s: Stage) => void;
  onEscrowCreated: (row: EscrowRow) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [counter, setCounter] = useState("");
  const [escrowOpen, setEscrowOpen] = useState(false);
  const updateAmounts = useServerFn(updateDealAmounts);

  const isSeller = me.id === deal.seller_id;
  const myRole: "buyer" | "seller" = isSeller ? "seller" : "buyer";
  const disabled = deal.stage === "Completed" || deal.stage === "Closed";

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("deal_messages")
        .select("*")
        .eq("deal_id", deal.id)
        .order("created_at", { ascending: true });
      setMessages((data as Msg[]) || []);
    })();
    const ch = supabase
      .channel(`deal-${deal.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "deal_messages", filter: `deal_id=eq.${deal.id}` }, (p) => {
        setMessages((prev) => [...prev, p.new as Msg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [deal.id]);

  async function send() {
    if (!draft.trim() && !counter) return;
    const body = draft || `Offer: $${Number(counter).toLocaleString()}`;
    setDraft(""); const c = counter; setCounter("");
    await supabase.from("deal_messages").insert({ deal_id: deal.id, sender_role: myRole, sender_id: me.id, body });
    if (c) {
      const n = Number(c);
      if (isSeller) await updateAmounts({ data: { dealId: deal.id, counter: n } });
      else await updateAmounts({ data: { dealId: deal.id, offer: n } });
    }
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
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground truncate">
              Deal · {deal.buyer_email} · role: {myRole}
            </p>
            <h3 className="text-lg sm:text-xl font-bold truncate">{deal.domain_name}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted shrink-0"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Stage switcher (seller only) */}
          {isSeller && (
            <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-background/60 overflow-x-auto">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => onMove(s)}
                  className={`flex-1 min-w-[80px] text-[11px] font-mono uppercase tracking-widest py-1.5 rounded-md transition ${
                    deal.stage === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

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
            <div className="p-4 space-y-2 max-h-[340px] overflow-y-auto">
              {messages.map((m) => {
                if (m.sender_role === "system") {
                  return (
                    <div key={m.id} className="flex justify-center">
                      <div className="max-w-[85%] rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-center">
                        <p className="font-medium">{m.body}</p>
                        {m.cta_url && !isSeller && (
                          <a href={m.cta_url} target="_blank" rel="noreferrer"
                             className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary underline">
                            Proceed to Payment / اذهب للدفع <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }
                const mine = m.sender_role === myRole;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
                    }`}>
                      <p>{m.body}</p>
                      <p className={`text-[10px] mt-0.5 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border p-2 flex items-center gap-2">
              <input
                value={counter}
                onChange={(e) => setCounter(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="$"
                disabled={disabled}
                className="w-24 h-9 rounded-md border border-border bg-background px-2 text-sm font-mono outline-none focus:border-primary disabled:opacity-50"
              />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={disabled ? "Chat is closed" : "Reply or counter…"}
                disabled={disabled}
                className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={disabled}
                className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-mono uppercase inline-flex items-center gap-1 disabled:opacity-50"
              >
                <Send className="h-3 w-3" /> Send
              </button>
            </div>
          </div>

          {/* Escrow section */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Escrow.com checkout</p>
              <span className="ml-auto rounded-full border border-primary/40 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                Broker: NameGadget
              </span>
            </div>

            {!tx && isSeller && (
              <button
                onClick={() => setEscrowOpen(true)}
                disabled={disabled}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60"
              >
                Generate Escrow Payment · توليد عملية الدفع
              </button>
            )}
            {!tx && !isSeller && (
              <p className="text-xs text-muted-foreground">Waiting for the seller to generate the escrow payment.</p>
            )}
            {tx && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Escrow.com #{tx.transaction_id}</span>
                  <span className="font-mono uppercase text-[10px] tracking-widest text-primary">{tx.status}</span>
                </div>
                <p className="text-2xl font-bold tabular-nums">${tx.amount.toLocaleString()}</p>
                {!isSeller && tx.payment_url && (
                  <a href={tx.payment_url} target="_blank" rel="noreferrer"
                     className="mt-2 inline-flex w-full items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                    Proceed to Payment / اذهب للدفع <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {isSeller && tx.landing_url && (
                  <a href={tx.landing_url} target="_blank" rel="noreferrer"
                     className="mt-2 inline-flex w-full items-center justify-center gap-2 h-10 rounded-lg border border-border text-sm font-medium">
                    View on Escrow.com <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {escrowOpen && (
        <GenerateEscrowModal
          deal={deal}
          me={me}
          onClose={() => setEscrowOpen(false)}
          onCreated={(row) => {
            onEscrowCreated(row);
            setEscrowOpen(false);
            // Post system message with CTA
            void supabase.from("deal_messages").insert({
              deal_id: deal.id,
              sender_role: "seller",
              sender_id: me.id,
              body: "Invoice Generated! 🧾",
            });
          }}
        />
      )}
    </div>
  );
}

// ================= Generate Escrow modal =================

function GenerateEscrowModal({
  deal, me, onClose, onCreated,
}: {
  deal: Deal;
  me: { id: string; email: string };
  onClose: () => void;
  onCreated: (row: EscrowRow) => void;
}) {
  const [buyerEmail, setBuyerEmail] = useState(deal.buyer_email);
  const [sellerEmail, setSellerEmail] = useState(me.email);
  const [feeAllocation, setFeeAllocation] = useState<"buyer"|"seller"|"split">("split");
  const [brokerTip, setBrokerTip] = useState<number>(0); // percent
  const [busy, setBusy] = useState(false);

  const amount = deal.counter ?? deal.offer;
  const createTx = useServerFn(createEscrowTransaction);

  async function submit() {
    if (amount <= 0) return toast.error("Set an agreed price first");
    setBusy(true);
    try {
      const res = await createTx({
        data: {
          domain: deal.domain_name,
          amount,
          buyerEmail,
          sellerEmail,
          domainId: deal.domain_id,
          dealId: deal.id,
          feeAllocation,
          brokerTipBps: Math.round(brokerTip * 100),
        },
      });
      if (!res.ok) throw new Error(res.error || "Escrow rejected");
      toast.success(`Escrow #${res.transactionId} created`);
      onCreated({
        id: crypto.randomUUID(),
        deal_id: deal.id,
        transaction_id: res.transactionId,
        amount,
        status: "created",
        payment_url: res.paymentUrl,
        landing_url: res.landingUrl,
        fee_allocation: feeAllocation,
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generate Escrow Payment</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <Field label="Buyer Escrow Email">
            <input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm" />
          </Field>
          <Field label="Seller Escrow Email">
            <input value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm" />
          </Field>
          <Field label="Final Price (USD)">
            <input readOnly value={`$${amount.toLocaleString()}`}
              className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm font-mono" />
          </Field>
          <Field label="Fee Allocation">
            <select value={feeAllocation} onChange={(e) => setFeeAllocation(e.target.value as any)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
              <option value="split">Split 50 / 50</option>
              <option value="buyer">Buyer 100%</option>
              <option value="seller">Seller 100%</option>
            </select>
          </Field>
          <Field label="Broker tip to NameGadget (%) — optional">
            <input type="number" min={0} max={20} step={0.5} value={brokerTip}
              onChange={(e) => setBrokerTip(Number(e.target.value))}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm" />
          </Field>
        </div>
        <button
          onClick={submit} disabled={busy}
          className="mt-5 w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Escrow Transaction
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
