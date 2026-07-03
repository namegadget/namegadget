import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Plane, Music2, Landmark, Newspaper, Camera, Terminal, Home, Sparkles, Trophy, ScrollText, ArrowRight, Check, Zap, TrendingUp } from "lucide-react";

type Val = { low: number; high: number };
type LanderProps = { domain: string; val: Val };
const fmt = (n: number) => `$${n.toLocaleString()}`;

/* ================== 10 NON-ANIMATED ================== */

/* 12. Boarding Pass */
function BoardingPassLander({ domain, val }: LanderProps) {
  const name = domain.split(".")[0].toUpperCase();
  const tld = "." + (domain.split(".")[1] ?? "com").toUpperCase();
  return (
    <div className="bg-slate-100 min-h-[460px] flex items-center justify-center p-8" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
        <div className="flex-1 p-6 border-r-2 border-dashed border-slate-300">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-sky-600 tracking-widest">NG · AIRWAYS</span>
            <Plane className="h-4 w-4 text-sky-600" />
          </div>
          <div className="mt-6 flex items-end gap-6">
            <div>
              <p className="text-[10px] uppercase text-slate-400">From</p>
              <p className="text-3xl font-black text-slate-900">MKT</p>
              <p className="text-[10px] text-slate-500">Marketplace</p>
            </div>
            <div className="pb-2 flex-1 border-b border-dotted border-slate-300 relative">
              <Plane className="absolute right-0 -top-2 h-4 w-4 text-sky-600" />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-400">To</p>
              <p className="text-3xl font-black text-slate-900">YOU</p>
              <p className="text-[10px] text-slate-500">New Owner</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
            <div><p className="text-[9px] uppercase text-slate-400">Passenger</p><p className="font-bold">{name}{tld}</p></div>
            <div><p className="text-[9px] uppercase text-slate-400">Class</p><p className="font-bold">Premium</p></div>
            <div><p className="text-[9px] uppercase text-slate-400">Gate</p><p className="font-bold">A-01</p></div>
          </div>
          <p className="mt-5 text-[10px] text-slate-500">Instant transfer · seat guaranteed</p>
        </div>
        <div className="w-56 p-6 bg-sky-50 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase text-slate-500">Fare</p>
            <p className="text-3xl font-black text-sky-700">{fmt(val.high)}</p>
          </div>
          <div className="text-[8px] leading-tight tracking-widest text-slate-700 font-mono break-all">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="inline-block w-1 h-8 bg-slate-900 mr-0.5" style={{ opacity: (i * 7) % 3 ? 1 : 0.3 }} />
            ))}
          </div>
          <button className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded font-bold text-xs">BOARD NOW</button>
        </div>
      </div>
    </div>
  );
}

/* 13. Vinyl record label */
function VinylLander({ domain, val }: LanderProps) {
  return (
    <div className="min-h-[460px] bg-gradient-to-br from-stone-900 via-stone-800 to-black flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className="relative flex items-center gap-8">
        <div className="relative h-72 w-72 rounded-full bg-black shadow-2xl flex items-center justify-center" style={{ backgroundImage: "repeating-radial-gradient(circle, #111 0, #111 2px, #000 2px, #000 4px)" }}>
          <div className="h-40 w-40 rounded-full bg-gradient-to-br from-amber-600 to-red-700 flex flex-col items-center justify-center text-white text-center p-3">
            <p className="text-[8px] uppercase tracking-widest opacity-80">Side A · 33⅓</p>
            <p className="text-lg font-black leading-tight mt-1">{domain}</p>
            <Music2 className="h-4 w-4 mt-1 opacity-70" />
            <p className="text-[8px] mt-1 opacity-80">NG Records</p>
          </div>
          <div className="absolute h-3 w-3 rounded-full bg-stone-900 border border-stone-700" />
        </div>
        <div className="text-white max-w-xs" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Limited pressing</p>
          <h1 className="text-4xl font-black mt-2">A first-edition brand.</h1>
          <p className="mt-3 text-sm text-stone-300 leading-relaxed">One name. One owner. Pressed once — never repressed.</p>
          <div className="mt-5 flex items-center gap-3">
            <div>
              <p className="text-[10px] uppercase text-stone-400">Cat. price</p>
              <p className="text-2xl font-black text-amber-400">{fmt(val.high)}</p>
            </div>
            <button className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-3 rounded-none font-bold text-sm">Buy the pressing</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 14. Museum placard */
function MuseumLander({ domain, val }: LanderProps) {
  return (
    <div className="min-h-[460px] bg-[#f5f1e8] p-10" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-stone-500">
          <Landmark className="h-3 w-3" /> Gallery 07 · Wing of Digital Assets
        </div>
        <div className="mt-8 border-t-4 border-stone-900 pt-6">
          <p className="text-xs italic text-stone-500">Untitled, c. 2026</p>
          <h1 className="mt-2 text-6xl font-normal text-stone-900 tracking-tight">{domain}</h1>
          <p className="mt-4 text-stone-700 italic max-w-lg leading-relaxed">
            A single lexical composition — negotiated between vowel, consonant, and consumer intent. The artist explores the tension between memorability and market.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-6 text-xs text-stone-600">
            <div><p className="uppercase tracking-widest text-[9px] text-stone-400">Medium</p><p className="mt-1">Domain, generic-TLD</p></div>
            <div><p className="uppercase tracking-widest text-[9px] text-stone-400">Provenance</p><p className="mt-1">Single owner</p></div>
            <div><p className="uppercase tracking-widest text-[9px] text-stone-400">Valuation</p><p className="mt-1 font-bold text-stone-900">{fmt(val.low)}–{fmt(val.high)}</p></div>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <button className="bg-stone-900 text-[#f5f1e8] px-6 py-3 text-sm tracking-widest uppercase">Acquire</button>
            <button className="border border-stone-900 px-6 py-3 text-sm tracking-widest uppercase">Request condition report</button>
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-stone-400">Do not touch · please observe from behind the rope</p>
        </div>
      </div>
    </div>
  );
}

/* 15. Vintage newspaper classified */
function NewspaperLander({ domain, val }: LanderProps) {
  return (
    <div className="min-h-[460px] bg-[#f4ecd8] p-8 relative" style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif", backgroundImage: "radial-gradient(circle at 10% 10%, rgba(0,0,0,0.04), transparent 40%)" }}>
      <div className="max-w-3xl mx-auto border-y-4 border-double border-stone-900 py-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone-600 flex items-center justify-center gap-2"><Newspaper className="h-3 w-3" /> The Daily Domain · Vol. XII · Est. 1998</p>
          <h2 className="text-3xl font-black mt-1 tracking-tight">CLASSIFIEDS</h2>
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-6 grid grid-cols-3 gap-4 text-stone-900" style={{ columnRule: "1px solid #78716c" }}>
        <div className="col-span-2 pr-4 border-r border-stone-400">
          <p className="text-[10px] uppercase tracking-widest text-stone-500">— FOR SALE BY OWNER —</p>
          <h1 className="text-4xl font-black uppercase leading-none mt-2">{domain}</h1>
          <p className="mt-3 text-sm leading-snug italic">A prime lexical property, immediately available. One (1) careful owner. No trademark encumbrances. Global TLD, all rights conveyed.</p>
          <p className="mt-3 text-sm">
            <strong>Asking:</strong> {fmt(val.high)} obo · <strong>Terms:</strong> Cash, wire, escrow · <strong>Ref:</strong> NG-{domain.length.toString().padStart(4,"0")}
          </p>
          <p className="mt-3 text-sm">Inquire via telegram, telephone, or telepathy. Serious buyers only. Bidding closes upon receipt of a suitable offer.</p>
        </div>
        <div className="pl-2">
          <div className="border-2 border-stone-900 p-3 text-center">
            <p className="text-[9px] uppercase tracking-widest">Reply</p>
            <p className="text-3xl font-black">{fmt(val.high)}</p>
            <button className="mt-2 w-full bg-stone-900 text-[#f4ecd8] py-1.5 text-xs uppercase tracking-widest">Post letter</button>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-center text-stone-500">— continued on p.7 —</p>
        </div>
      </div>
    </div>
  );
}

/* 16. Polaroid */
function PolaroidLander({ domain, val }: LanderProps) {
  return (
    <div className="min-h-[460px] bg-gradient-to-br from-teal-900 via-slate-800 to-stone-900 p-10 flex items-center justify-center" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 20px)" }}>
      <div className="relative">
        <div className="bg-white p-4 pb-16 shadow-2xl rotate-[-4deg] w-72" style={{ fontFamily: "'Kalam', 'Caveat', cursive" }}>
          <div className="h-56 bg-gradient-to-br from-fuchsia-400 via-orange-300 to-yellow-200 flex items-center justify-center relative overflow-hidden">
            <Camera className="absolute top-2 right-2 h-4 w-4 text-white/60" />
            <div className="text-center text-white drop-shadow">
              <p className="text-3xl font-black">{domain}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-90 mt-1">available · summer '26</p>
            </div>
          </div>
          <p className="absolute bottom-3 left-4 right-4 text-lg text-slate-800 text-center">the one that got away ♥</p>
        </div>
        <div className="absolute -bottom-6 -right-16 bg-yellow-200 rotate-[6deg] px-4 py-3 shadow-lg" style={{ fontFamily: "'Kalam', cursive" }}>
          <p className="text-slate-800 text-sm leading-tight">yours for<br /><span className="text-2xl font-black">{fmt(val.high)}</span></p>
          <button className="mt-2 bg-slate-900 text-yellow-200 text-xs px-3 py-1 rounded">grab it →</button>
        </div>
      </div>
    </div>
  );
}

/* 17. BSD manpage / terminal */
function ManpageLander({ domain, val }: LanderProps) {
  const name = domain.split(".")[0];
  return (
    <div className="min-h-[460px] bg-[#1a1a1a] text-[#e0e0e0] p-8" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 13, lineHeight: 1.7 }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-800 pb-2">
          <span className="flex items-center gap-2"><Terminal className="h-3 w-3" /> {name.toUpperCase()}(1)</span>
          <span>NameGadget Manual</span>
          <span>{name.toUpperCase()}(1)</span>
        </div>
        <div className="mt-6">
          <p className="text-white font-bold">NAME</p>
          <p className="pl-6"><span className="text-emerald-400">{domain}</span> — a premium, transferable domain asset</p>
        </div>
        <div className="mt-4">
          <p className="text-white font-bold">SYNOPSIS</p>
          <p className="pl-6"><span className="text-emerald-400">acquire</span> [<span className="text-amber-400">--price</span>=<span className="text-fuchsia-400">{val.high}</span>] [<span className="text-amber-400">--escrow</span>] <span className="text-emerald-400">{domain}</span></p>
        </div>
        <div className="mt-4">
          <p className="text-white font-bold">DESCRIPTION</p>
          <p className="pl-6 text-neutral-400">Transfers ownership of <span className="text-emerald-400">{domain}</span> to the invoking user. Returns <span className="text-amber-400">0</span> on success, non-zero on wire failure. See <span className="text-emerald-400">escrow</span>(8) for secure settlement.</p>
        </div>
        <div className="mt-4">
          <p className="text-white font-bold">OPTIONS</p>
          <p className="pl-6"><span className="text-amber-400">--buy-now</span>     Instant transfer at listed price ({fmt(val.high)})</p>
          <p className="pl-6"><span className="text-amber-400">--offer</span> N     Submit counter-offer of N USD (min {fmt(val.low)})</p>
          <p className="pl-6"><span className="text-amber-400">--lease</span>       Monthly-installment plan (contact seller)</p>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <span className="text-emerald-400">$</span>
          <span className="text-white">acquire --buy-now {domain}</span>
          <span className="w-2 h-4 bg-emerald-400 animate-pulse ml-1" />
        </div>
        <button className="mt-4 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-4 py-2 text-xs">[ EXECUTE ]</button>
      </div>
    </div>
  );
}

/* 18. Real estate listing */
function RealEstateLander({ domain, val }: LanderProps) {
  return (
    <div className="min-h-[460px] bg-white text-slate-900" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="bg-emerald-900 text-white px-6 py-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 font-bold tracking-widest"><Home className="h-3.5 w-3.5" /> NG REALTY · PREMIUM LISTINGS</span>
        <span>MLS# NG-{Math.abs(domain.length * 1873).toString().padStart(6,"0")}</span>
      </div>
      <div className="grid grid-cols-5">
        <div className="col-span-3 relative h-72 bg-gradient-to-br from-emerald-100 via-amber-50 to-sky-100 flex items-center justify-center">
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-1 tracking-widest">Just Listed</div>
          <p className="text-4xl font-black text-emerald-900 tracking-tight">{domain}</p>
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-mono">1 / 12</div>
        </div>
        <div className="col-span-2 p-5 border-l border-slate-200">
          <p className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold">Prime .com District</p>
          <p className="text-3xl font-black mt-1">{fmt(val.high)}</p>
          <p className="text-xs text-slate-500">Listed at asking · Est. {fmt(Math.round(val.high * 1.4))} after brand build-out</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center border-y border-slate-200 py-3">
            <div><p className="text-sm font-black">{domain.length}</p><p className="text-[9px] uppercase text-slate-500">chars</p></div>
            <div><p className="text-sm font-black">1</p><p className="text-[9px] uppercase text-slate-500">owner</p></div>
            <div><p className="text-sm font-black">24h</p><p className="text-[9px] uppercase text-slate-500">close</p></div>
          </div>
          <button className="mt-4 w-full bg-emerald-900 text-white py-2.5 text-xs font-bold uppercase tracking-widest">Schedule showing</button>
          <button className="mt-2 w-full border border-slate-300 py-2.5 text-xs font-bold uppercase tracking-widest">Submit offer</button>
        </div>
      </div>
      <div className="px-6 py-5 border-t border-slate-100 text-sm text-slate-600">
        <p><strong className="text-slate-900">Property highlights.</strong> Corner lot on the .com boulevard · walk-score 100 · zoned for e-commerce, SaaS, or personal brand · turnkey, no build-out required · comes fully entitled with WHOIS privacy.</p>
      </div>
    </div>
  );
}

/* 19. Luxury perfume ad */
function PerfumeLander({ domain, val }: LanderProps) {
  return (
    <div className="min-h-[460px] bg-gradient-to-b from-[#f8f1e6] via-[#e8ddc7] to-[#c9b596] flex items-center justify-center p-10" style={{ fontFamily: "'Cormorant Garamond', 'Didot', serif" }}>
      <div className="grid grid-cols-2 gap-10 max-w-3xl items-center">
        <div className="relative flex items-center justify-center h-80">
          <div className="absolute h-72 w-40 rounded-b-full rounded-t-2xl bg-gradient-to-b from-amber-200/60 via-amber-500/70 to-amber-900/80 shadow-2xl backdrop-blur" style={{ border: "1px solid rgba(255,255,255,0.3)" }}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-8 w-14 rounded-sm bg-gradient-to-b from-amber-900 to-amber-950" />
            <div className="absolute top-16 left-0 right-0 mx-4 border-y border-amber-900/40 bg-[#f8f1e6] py-4 text-center">
              <p className="text-[9px] uppercase tracking-[0.4em] text-amber-900">Parfum</p>
              <p className="text-2xl font-normal text-amber-950 italic">{domain}</p>
              <p className="text-[8px] uppercase tracking-[0.3em] text-amber-900/70 mt-1">Eau de Domaine</p>
            </div>
          </div>
        </div>
        <div className="text-amber-950">
          <p className="text-[10px] uppercase tracking-[0.5em]">Nº {(domain.length * 3).toString().padStart(2,"0")}</p>
          <h1 className="mt-3 text-5xl italic font-normal leading-none">{domain.split(".")[0]}.</h1>
          <p className="mt-4 text-sm italic leading-relaxed opacity-80">Top notes of ambition. A heart of memorability. Base notes of enterprise value. The signature of a modern brand.</p>
          <div className="mt-6 h-px bg-amber-900/40" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-70">100ml · Flacon</p>
              <p className="text-2xl italic mt-1">{fmt(val.high)}</p>
            </div>
            <button className="border border-amber-950 px-6 py-2 text-[10px] uppercase tracking-[0.4em] hover:bg-amber-950 hover:text-[#f8f1e6] transition">Découvrir</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 20. Trading card */
function TradingCardLander({ domain, val }: LanderProps) {
  const rarity = val.high > 20000 ? "MYTHIC" : val.high > 8000 ? "LEGENDARY" : "RARE";
  const color = rarity === "MYTHIC" ? "from-fuchsia-500 to-orange-400" : rarity === "LEGENDARY" ? "from-amber-400 to-yellow-600" : "from-sky-400 to-indigo-600";
  return (
    <div className="min-h-[460px] bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 flex items-center justify-center">
      <div className={`w-80 rounded-2xl p-1 bg-gradient-to-br ${color} shadow-[0_0_40px_rgba(236,72,153,0.4)]`}>
        <div className="rounded-xl bg-slate-950 text-white p-4 relative overflow-hidden" style={{ fontFamily: "'Rajdhani', 'Orbitron', system-ui, sans-serif" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 60%, #fff 1px, transparent 1px)", backgroundSize: "40px 40px, 55px 55px" }} />
          <div className="relative flex items-center justify-between text-[10px] uppercase tracking-widest">
            <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> NG · Series 1</span>
            <span className={`bg-gradient-to-r ${color} bg-clip-text text-transparent font-black`}>{rarity}</span>
          </div>
          <h1 className="relative mt-3 text-3xl font-black tracking-tight">{domain}</h1>
          <div className={`relative mt-3 h-40 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/80">Hologram</p>
              <p className="text-5xl font-black text-white drop-shadow-lg">.{domain.split(".")[1]?.toUpperCase() ?? "COM"}</p>
            </div>
            <div className="absolute inset-0 rounded-lg opacity-30" style={{ backgroundImage: "repeating-linear-gradient(120deg, rgba(255,255,255,0.4) 0 2px, transparent 2px 8px)" }} />
          </div>
          <div className="relative mt-3 grid grid-cols-3 gap-1 text-center text-[10px]">
            <div className="bg-white/5 rounded p-1.5"><p className="text-slate-400">MEM</p><p className="font-black text-lg">{Math.min(99, 120 - domain.length * 4)}</p></div>
            <div className="bg-white/5 rounded p-1.5"><p className="text-slate-400">BRAND</p><p className="font-black text-lg">92</p></div>
            <div className="bg-white/5 rounded p-1.5"><p className="text-slate-400">SEO</p><p className="font-black text-lg">87</p></div>
          </div>
          <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <div>
              <p className="text-[9px] uppercase text-slate-400">Card value</p>
              <p className="text-xl font-black">{fmt(val.high)}</p>
            </div>
            <button className={`bg-gradient-to-r ${color} text-slate-950 font-black text-xs px-4 py-2 rounded`}>PULL CARD</button>
          </div>
          <p className="relative text-[8px] text-slate-500 mt-2 text-right">#{Math.abs(domain.length * 4919) % 999}/999</p>
        </div>
      </div>
    </div>
  );
}

/* 21. Legal deed / contract */
function DeedLander({ domain, val }: LanderProps) {
  return (
    <div className="min-h-[460px] bg-[#faf7ee] p-10" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>
      <div className="max-w-2xl mx-auto border-4 border-double border-stone-800 p-8 relative">
        <div className="absolute top-4 right-4 h-20 w-20 rounded-full border-2 border-red-800 flex items-center justify-center text-red-800 rotate-[-12deg] text-[9px] uppercase tracking-widest font-bold" style={{ borderStyle: "double" }}>
          <div className="text-center leading-tight">
            <ScrollText className="h-4 w-4 mx-auto" />
            Certified<br />Original
          </div>
        </div>
        <p className="text-center text-[10px] uppercase tracking-[0.5em] text-stone-600">— Deed of Conveyance —</p>
        <h1 className="text-center text-3xl font-black mt-2 tracking-tight">DOMAIN TITLE</h1>
        <div className="mt-6 h-px bg-stone-400" />
        <p className="mt-6 text-stone-800 leading-loose text-base">
          Know all persons by these presents, that the undersigned Registrar, in consideration of the sum of <span className="font-bold underline decoration-stone-400">{fmt(val.high)} United States Dollars</span>, doth hereby grant, bargain, and convey unto the Purchaser all right, title, and interest in and to the domain known as
        </p>
        <p className="text-center text-4xl font-black italic my-5 text-stone-900">« {domain} »</p>
        <p className="text-stone-800 leading-loose text-sm">
          together with all associated DNS records, WHOIS metadata, and forwarding privileges, to have and to hold, free of encumbrance, in perpetuity, subject only to timely renewal.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-8 text-xs">
          <div className="border-t border-stone-500 pt-2">
            <p className="italic text-stone-700 text-xl" style={{ fontFamily: "'Great Vibes', 'Caveat', cursive" }}>Seller</p>
            <p className="mt-1 uppercase tracking-widest text-[9px] text-stone-500">Signature of grantor</p>
          </div>
          <div className="border-t border-stone-500 pt-2">
            <p className="italic text-stone-400 text-xl" style={{ fontFamily: "'Great Vibes', 'Caveat', cursive" }}>___________</p>
            <p className="mt-1 uppercase tracking-widest text-[9px] text-stone-500">Signature of buyer</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="bg-stone-900 text-[#faf7ee] px-5 py-2 text-xs uppercase tracking-[0.3em]">Sign & Acquire</button>
          <button className="border border-stone-900 px-5 py-2 text-xs uppercase tracking-[0.3em]">Request draft</button>
        </div>
      </div>
    </div>
  );
}

/* ================== 10 ANIMATED (anime.js) ================== */

/* 22. Matrix code rain */
function MatrixLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current.querySelectorAll<HTMLElement>(".mcol"), {
      translateY: ["-100%", "100%"],
      duration: () => 4000 + Math.random() * 4000,
      delay: () => Math.random() * 2000,
      loop: true,
      ease: "linear",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".mreveal"), {
      opacity: [0, 1], scale: [0.85, 1], delay: stagger(150, { start: 400 }), duration: 800, ease: "outExpo",
    });
  }, [domain]);
  const glyphs = "01アイウエオｶｷｸｹｺｻｼｽｾｿ$#@*+".split("");
  return (
    <div ref={ref} className="relative min-h-[460px] bg-black overflow-hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="absolute inset-0 flex">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="mcol flex-1 text-emerald-500/60 text-xs leading-tight whitespace-pre text-center" style={{ opacity: 0.4 + Math.random() * 0.5 }}>
            {Array.from({ length: 30 }).map((__, j) => glyphs[(i * j + j) % glyphs.length]).join("\n")}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      <div className="relative z-10 min-h-[460px] flex flex-col items-center justify-center px-6 text-center">
        <p className="mreveal text-[10px] uppercase tracking-[0.4em] text-emerald-400">::  system.unlock  ::</p>
        <h1 className="mreveal mt-5 text-6xl font-black text-white tracking-tight" style={{ textShadow: "0 0 24px rgba(16,185,129,0.6)" }}>{domain}</h1>
        <p className="mreveal mt-3 text-emerald-300/80 text-sm">A key. To a category. To a category-leader.</p>
        <div className="mreveal mt-6 inline-flex items-center gap-2 border border-emerald-500/40 bg-black/60 backdrop-blur px-2 py-2 rounded">
          <span className="px-3 text-emerald-300 text-sm">unlock @ {fmt(val.high)}</span>
          <button className="bg-emerald-500 text-black font-black text-sm px-4 py-1.5 rounded">DECRYPT</button>
        </div>
      </div>
    </div>
  );
}

/* 23. Liquid metal SVG shimmer */
function LiquidMetalLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const paths = ref.current.querySelectorAll<SVGPathElement>(".lmpath");
    paths.forEach((p, i) => {
      animate(p, {
        d: [
          { to: "M0,140 Q100,80 200,140 T400,140 T600,140 T800,140 L800,300 L0,300 Z" },
          { to: "M0,160 Q100,220 200,150 T400,180 T600,120 T800,170 L800,300 L0,300 Z" },
          { to: "M0,130 Q100,100 200,170 T400,120 T600,180 T800,130 L800,300 L0,300 Z" },
        ],
        duration: 6000 + i * 800,
        loop: true,
        alternate: true,
        ease: "inOutSine",
      });
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".lmtxt"), {
      opacity: [0, 1], translateY: [30, 0], delay: stagger(140), duration: 800, ease: "outExpo",
    });
  }, [domain]);
  return (
    <div ref={ref} className="relative min-h-[460px] bg-slate-950 overflow-hidden text-white">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lm1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67e8f9" /><stop offset="0.5" stopColor="#a78bfa" /><stop offset="1" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="lm2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f472b6" stopOpacity="0.7" /><stop offset="1" stopColor="#67e8f9" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path className="lmpath" d="M0,140 Q100,80 200,140 T400,140 T600,140 T800,140 L800,300 L0,300 Z" fill="url(#lm1)" opacity="0.75" />
        <path className="lmpath" d="M0,180 Q100,120 200,180 T400,180 T600,180 T800,180 L800,300 L0,300 Z" fill="url(#lm2)" opacity="0.55" />
      </svg>
      <div className="relative z-10 min-h-[460px] flex flex-col items-center justify-center px-8 text-center">
        <p className="lmtxt text-[10px] uppercase tracking-[0.4em] text-white/70">Liquid Asset</p>
        <h1 className="lmtxt mt-5 text-7xl font-black tracking-tight drop-shadow-2xl">{domain}</h1>
        <p className="lmtxt mt-4 max-w-md text-white/80">A brand that flows — memorable, malleable, market-ready.</p>
        <button className="lmtxt mt-8 rounded-full bg-white text-slate-900 px-8 py-3 font-black">Pour {fmt(val.high)} →</button>
      </div>
    </div>
  );
}

/* 24. Neon sign flicker */
function NeonSignLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const sign = ref.current.querySelector<HTMLElement>(".nsign");
    if (sign) animate(sign, {
      opacity: [
        { to: 1, duration: 100 }, { to: 0.3, duration: 40 }, { to: 1, duration: 60 },
        { to: 0.7, duration: 30 }, { to: 1, duration: 200 }, { to: 0.9, duration: 40 }, { to: 1, duration: 3000 },
      ],
      loop: true,
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".nfade"), {
      opacity: [0, 1], duration: 800, delay: stagger(140, { start: 400 }),
    });
  }, [domain]);
  return (
    <div ref={ref} className="relative min-h-[460px] bg-[#0a0510] overflow-hidden flex flex-col items-center justify-center p-8 text-center" style={{ backgroundImage: "radial-gradient(ellipse at center, rgba(236,72,153,0.15), transparent 60%)" }}>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <p className="nfade text-[10px] uppercase tracking-[0.4em] text-pink-400/80 relative">Open · Late</p>
      <div className="nsign relative mt-6" style={{ fontFamily: "'Monoton', 'Impact', sans-serif" }}>
        <h1 className="text-7xl text-pink-300" style={{ textShadow: "0 0 6px #ec4899, 0 0 20px #ec4899, 0 0 40px #ec4899, 0 0 80px #f472b6" }}>
          {domain}
        </h1>
      </div>
      <p className="nfade mt-4 text-cyan-300 text-sm relative" style={{ textShadow: "0 0 8px #22d3ee, 0 0 20px #22d3ee" }}>— vacancy · one brand only —</p>
      <div className="nfade mt-8 relative flex items-center gap-3">
        <div className="border border-pink-500/50 bg-black/40 backdrop-blur px-4 py-2 text-pink-300 text-sm" style={{ boxShadow: "inset 0 0 20px rgba(236,72,153,0.2)" }}>Room rate · {fmt(val.high)}</div>
        <button className="bg-pink-500 hover:bg-pink-400 text-black font-black px-6 py-2 text-sm" style={{ boxShadow: "0 0 20px rgba(236,72,153,0.6)" }}>CHECK IN</button>
      </div>
    </div>
  );
}

/* 25. Stock ticker exchange */
function TickerLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [price, setPrice] = useState(val.low);
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current.querySelectorAll<HTMLElement>(".tkline"), {
      translateX: ["100%", "-100%"], duration: 20000, loop: true, ease: "linear",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".tkbar"), {
      scaleY: () => 0.3 + Math.random() * 0.9,
      duration: () => 400 + Math.random() * 800,
      loop: true, alternate: true, ease: "inOutQuad",
      delay: stagger(60),
    });
    const iv = setInterval(() => {
      setPrice((p) => Math.max(val.low, Math.min(val.high, p + (Math.random() - 0.4) * (val.high - val.low) * 0.03)));
    }, 500);
    return () => clearInterval(iv);
  }, [domain, val.low, val.high]);
  const ticker = domain.split(".")[0].toUpperCase().slice(0, 5);
  return (
    <div ref={ref} className="min-h-[460px] bg-black text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="bg-red-600 text-white text-xs py-1.5 overflow-hidden whitespace-nowrap">
        <div className="tkline inline-block tracking-widest">
          ▲ {ticker} +8.4%   ●   {domain} LISTED @ {fmt(val.high)}   ●   VOL 12.4K   ●   NEXT BID {fmt(val.low)}   ●   MARKET OPEN   ●   
        </div>
      </div>
      <div className="p-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs text-red-400 uppercase tracking-widest">NG:EXCHANGE — Live</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h1 className="text-4xl font-black">{ticker}</h1>
            <span className="text-xs text-slate-500">({domain})</span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <p className="text-6xl font-black text-emerald-400 tabular-nums">{fmt(Math.round(price))}</p>
            <span className="text-emerald-400 text-sm">▲ +{((price / val.low - 1) * 100).toFixed(2)}%</span>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
            <div><p className="text-slate-500">DAY LOW</p><p className="text-white text-base">{fmt(val.low)}</p></div>
            <div><p className="text-slate-500">DAY HIGH</p><p className="text-white text-base">{fmt(val.high)}</p></div>
            <div><p className="text-slate-500">VOL</p><p className="text-white text-base">12.4K</p></div>
          </div>
          <div className="mt-6 flex gap-2">
            <button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 font-black text-sm">BUY @ MKT</button>
            <button className="flex-1 border border-red-500 text-red-400 hover:bg-red-500/10 py-3 font-black text-sm">BID</button>
          </div>
        </div>
        <div className="flex items-end gap-1 h-56 border-l border-white/10 pl-6">
          {Array.from({ length: 34 }).map((_, i) => (
            <div key={i} className="tkbar flex-1 rounded-t origin-bottom" style={{ background: i % 3 ? "#10b981" : "#ef4444", height: "80%" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* 26. Auction countdown */
function AuctionLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current.querySelectorAll<HTMLElement>(".gavel"), {
      rotate: [{ to: -30, duration: 400 }, { to: 0, duration: 200 }],
      loop: true,
      delay: 1500,
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".apop"), {
      opacity: [0, 1], scale: [0.9, 1], delay: stagger(120), duration: 700, ease: "outBack",
    });
    const end = Date.now() + 1000 * 60 * 60 * 6;
    const iv = setInterval(() => {
      const diff = Math.max(0, end - Date.now());
      setT({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 250);
    return () => clearInterval(iv);
  }, [domain]);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div ref={ref} className="min-h-[460px] bg-gradient-to-br from-red-950 via-black to-red-950 text-white p-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
      <div className="max-w-3xl mx-auto">
        <div className="apop flex items-center justify-between text-xs uppercase tracking-[0.4em] text-red-300">
          <span>LOT 007 · Live Auction</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> BIDDING OPEN</span>
        </div>
        <div className="apop mt-6 text-center">
          <div className="gavel inline-block text-6xl origin-bottom-right">🔨</div>
          <h1 className="mt-2 text-6xl font-black tracking-tight">{domain}</h1>
          <p className="mt-2 text-red-200/80 italic">Estimate {fmt(val.low)}–{fmt(val.high)} · Reserve met</p>
        </div>
        <div className="apop mt-8 grid grid-cols-4 gap-3 max-w-lg mx-auto text-center">
          {[["HRS", pad(t.h)], ["MIN", pad(t.m)], ["SEC", pad(t.s)], ["BIDS", "23"]].map(([l, v]) => (
            <div key={l} className="border-y-2 border-red-500 py-3 bg-black/40">
              <p className="text-4xl font-black tabular-nums">{v}</p>
              <p className="text-[9px] uppercase tracking-widest text-red-300 mt-1">{l}</p>
            </div>
          ))}
        </div>
        <div className="apop mt-8 max-w-lg mx-auto bg-black/50 border border-red-800/60 rounded-lg p-5">
          <p className="text-xs text-red-300 uppercase tracking-widest">Current bid</p>
          <p className="text-4xl font-black">{fmt(Math.round((val.low + val.high) * 0.6))}</p>
          <div className="mt-4 flex items-center gap-2">
            <input placeholder={`Bid > ${fmt(Math.round((val.low + val.high) * 0.65))}`} className="flex-1 bg-white/5 border border-red-800/60 rounded px-3 py-2.5 text-sm outline-none focus:border-red-400" />
            <button className="bg-red-600 hover:bg-red-500 px-5 py-2.5 font-black text-sm rounded">BID NOW</button>
          </div>
          <p className="mt-2 text-[10px] text-red-300/60">Going once. Going twice.</p>
        </div>
      </div>
    </div>
  );
}

/* 27. Card flip 3D */
function CardFlipLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const card = ref.current.querySelector<HTMLElement>(".flipcard");
    if (card) animate(card, {
      rotateY: [0, 180, 360],
      duration: 5000,
      loop: true,
      ease: "inOutQuad",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".fcopy"), {
      opacity: [0, 1], translateX: [-30, 0], delay: stagger(140), duration: 700, ease: "outExpo",
    });
  }, [domain]);
  return (
    <div ref={ref} className="min-h-[460px] bg-gradient-to-br from-indigo-900 via-slate-950 to-black text-white grid grid-cols-2 items-center p-10 gap-8">
      <div>
        <p className="fcopy text-[10px] uppercase tracking-[0.4em] text-indigo-300">Signature Card · Ltd.</p>
        <h1 className="fcopy mt-4 text-5xl font-black leading-none">{domain}</h1>
        <p className="fcopy mt-4 text-slate-300 max-w-sm">A tangible identity for an intangible asset. Flip to reveal the price.</p>
        <div className="fcopy mt-6 flex items-center gap-3">
          <button className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-6 py-3 rounded">Reserve · {fmt(val.high)}</button>
          <button className="border border-white/20 px-6 py-3 rounded text-sm">Concierge</button>
        </div>
      </div>
      <div className="flex items-center justify-center [perspective:1400px]">
        <div className="flipcard relative h-56 w-96 [transform-style:preserve-3d]">
          <div className="absolute inset-0 rounded-2xl [backface-visibility:hidden] bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 p-5 flex flex-col justify-between" style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(-135deg, rgba(255,255,255,0.05) 25%, transparent 25%)", backgroundSize: "20px 20px" }}>
            <div className="flex items-center justify-between text-xs">
              <span className="tracking-widest text-indigo-300">NAMEGADGET</span>
              <span className="opacity-60">CLASSIC</span>
            </div>
            <p className="text-2xl font-mono tracking-widest">•••• {domain.slice(0, 4).toUpperCase().padEnd(4, "X")}</p>
            <div className="flex items-end justify-between text-xs">
              <div>
                <p className="opacity-50 text-[9px] uppercase">Card holder</p>
                <p className="tracking-wider">{domain.toUpperCase()}</p>
              </div>
              <p className="text-2xl italic bg-gradient-to-r from-amber-300 to-fuchsia-400 bg-clip-text text-transparent font-black">NG</p>
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 p-5 flex flex-col justify-center items-center text-white">
            <p className="text-[10px] uppercase tracking-widest opacity-90">Asking Price</p>
            <p className="text-5xl font-black mt-1 drop-shadow">{fmt(val.high)}</p>
            <p className="mt-3 text-xs opacity-90">Instant · Escrow · Transferable</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 28. Ocean wave morph */
function OceanWaveLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const path = ref.current.querySelector<SVGPathElement>(".wavepath");
    if (path) animate(path, {
      d: [
        { to: "M0,60 C150,120 350,0 500,60 C650,120 750,20 900,60 L900,200 L0,200 Z" },
        { to: "M0,80 C150,20 350,140 500,80 C650,20 750,140 900,80 L900,200 L0,200 Z" },
        { to: "M0,60 C150,120 350,0 500,60 C650,120 750,20 900,60 L900,200 L0,200 Z" },
      ],
      duration: 5000, loop: true, ease: "inOutSine",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".owfade"), {
      opacity: [0, 1], translateY: [30, 0], delay: stagger(130), duration: 700, ease: "outExpo",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".bubble"), {
      translateY: [0, -400], opacity: [{ from: 0, to: 0.6 }, { to: 0 }],
      duration: () => 4000 + Math.random() * 3000, delay: stagger(400), loop: true, ease: "outSine",
    });
  }, [domain]);
  return (
    <div ref={ref} className="relative min-h-[460px] bg-gradient-to-b from-sky-200 via-cyan-300 to-blue-600 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="bubble absolute rounded-full bg-white/40 border border-white/60" style={{ left: `${i * 10 + 3}%`, bottom: 0, width: 8 + (i % 3) * 4, height: 8 + (i % 3) * 4 }} />
      ))}
      <div className="relative z-10 min-h-[460px] flex flex-col items-center justify-center px-8 text-center">
        <p className="owfade text-[10px] uppercase tracking-[0.4em] text-white/90 drop-shadow">Blue Ocean · Uncontested Category</p>
        <h1 className="owfade mt-4 text-7xl font-black text-white drop-shadow-xl tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{domain}</h1>
        <p className="owfade mt-3 text-white/90 max-w-md">Ride the wave before it crests. First-mover asset.</p>
        <button className="owfade mt-8 bg-white text-blue-700 rounded-full px-8 py-3 font-black shadow-2xl">Dive in · {fmt(val.high)}</button>
      </div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 900 200" preserveAspectRatio="none" style={{ height: 140 }}>
        <path className="wavepath" d="M0,60 C150,120 350,0 500,60 C650,120 750,20 900,60 L900,200 L0,200 Z" fill="rgba(255,255,255,0.35)" />
        <path d="M0,110 C150,60 350,170 500,110 C650,60 750,170 900,110 L900,200 L0,200 Z" fill="rgba(255,255,255,0.5)" />
      </svg>
    </div>
  );
}

/* 29. Elastic bounce text */
function ElasticLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chars = ref.current.querySelectorAll<HTMLElement>(".echar");
    animate(chars, {
      translateY: [{ from: -200, to: 0 }],
      scale: [{ from: 0.5, to: 1 }],
      opacity: [0, 1],
      duration: 1400,
      delay: stagger(70),
      ease: "outElastic(1, 0.5)",
      loop: true,
      loopDelay: 2500,
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".bounceball"), {
      translateY: [0, -40, 0], scale: [1, 0.9, 1], duration: 900, loop: true, ease: "inOutQuad", delay: stagger(150),
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".epop"), {
      opacity: [0, 1], scale: [0.8, 1], delay: stagger(160, { start: 900 }), duration: 700, ease: "outBack",
    });
  }, [domain]);
  const chars = domain.split("");
  return (
    <div ref={ref} className="min-h-[460px] bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 p-10 relative overflow-hidden" style={{ fontFamily: "'Fredoka', 'Nunito', system-ui, sans-serif" }}>
      <div className="absolute top-8 left-10 flex gap-2">
        {[0,1,2].map(i => <span key={i} className="bounceball h-4 w-4 rounded-full" style={{ background: ["#ec4899","#8b5cf6","#f59e0b"][i] }} />)}
      </div>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="epop text-xs uppercase tracking-[0.3em] text-purple-700 font-bold">boing! new domain just dropped</p>
        <h1 className="mt-6 text-7xl font-black text-slate-900 flex tracking-tight">
          {chars.map((c, i) => (
            <span key={i} className="echar inline-block" style={{ color: c === "." ? "#ec4899" : undefined }}>{c}</span>
          ))}
        </h1>
        <p className="epop mt-4 text-slate-700 text-lg">springy · playful · impossible to forget</p>
        <div className="epop mt-8 flex items-center gap-3">
          <div className="bg-white/70 backdrop-blur rounded-full px-5 py-2 font-black text-slate-900">{fmt(val.high)}</div>
          <button className="rounded-full bg-slate-900 text-yellow-200 font-black px-6 py-3 hover:scale-110 transition">SNAG IT →</button>
        </div>
      </div>
    </div>
  );
}

/* 30. Constellation connect */
function ConstellationLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const svgEl = ref.current.querySelector<SVGSVGElement>(".cnvsvg");
    if (svgEl) {
      const lines = svgEl.querySelectorAll<SVGLineElement>("line");
      lines.forEach((ln) => {
        animate(ln, {
          strokeDashoffset: [svg.createDrawable(ln as unknown as SVGElement) ? 200 : 200, 0],
          duration: 2000,
          delay: Math.random() * 1500,
          loop: true,
          alternate: true,
          ease: "inOutSine",
        });
      });
    }
    animate(ref.current.querySelectorAll<HTMLElement>(".star"), {
      opacity: [{ from: 0.3, to: 1 }, { to: 0.3 }],
      scale: [{ from: 0.8, to: 1.4 }, { to: 0.8 }],
      duration: () => 1500 + Math.random() * 2000,
      loop: true,
      delay: stagger(80),
      ease: "inOutSine",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".cfade"), {
      opacity: [0, 1], translateY: [24, 0], delay: stagger(140, { start: 300 }), duration: 800, ease: "outExpo",
    });
  }, [domain]);
  const points = Array.from({ length: 14 }).map((_, i) => ({
    x: 50 + ((i * 71) % 700),
    y: 30 + ((i * 53) % 380),
  }));
  return (
    <div ref={ref} className="relative min-h-[460px] bg-gradient-to-b from-[#050817] via-[#0a0e2a] to-[#111a3a] text-white overflow-hidden">
      <svg className="cnvsvg absolute inset-0 w-full h-full" viewBox="0 0 800 460" preserveAspectRatio="none">
        {points.map((p, i) => points.slice(i + 1, i + 3).map((q, j) => (
          <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgba(139,197,255,0.5)" strokeWidth="0.6" strokeDasharray="200" />
        )))}
      </svg>
      {points.map((p, i) => (
        <span key={i} className="star absolute h-1.5 w-1.5 rounded-full bg-white" style={{ left: p.x, top: p.y, boxShadow: "0 0 8px #fff, 0 0 16px #93c5fd" }} />
      ))}
      <div className="relative z-10 min-h-[460px] flex flex-col items-center justify-center px-8 text-center" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
        <p className="cfade text-[10px] uppercase tracking-[0.5em] text-sky-300">— A New Constellation —</p>
        <h1 className="cfade mt-5 text-7xl italic font-normal tracking-tight">{domain}</h1>
        <p className="cfade mt-3 text-slate-300 max-w-md font-sans text-sm">Every category-defining brand starts as a single point of light. Connect the dots.</p>
        <div className="cfade mt-8 flex items-center gap-3 font-sans">
          <span className="text-slate-300 text-sm">Chart it · {fmt(val.high)}</span>
          <button className="rounded-full bg-sky-400 text-slate-950 font-black px-6 py-2.5 text-sm">Claim the sky →</button>
        </div>
      </div>
    </div>
  );
}

/* 31. Confetti celebration */
function ConfettiLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current.querySelectorAll<HTMLElement>(".confetti"), {
      translateY: () => 400 + Math.random() * 300,
      translateX: () => (Math.random() - 0.5) * 400,
      rotate: () => Math.random() * 720,
      opacity: [{ from: 1, to: 0 }],
      duration: () => 3500 + Math.random() * 2500,
      delay: stagger(50),
      loop: true,
      ease: "outQuad",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".cfx"), {
      scale: [0.6, 1], opacity: [0, 1], delay: stagger(120), duration: 700, ease: "outBack",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".party"), {
      rotate: [-15, 15], duration: 400, loop: true, alternate: true, ease: "inOutSine",
    });
  }, [domain]);
  const colors = ["#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#a855f7", "#fbbf24"];
  return (
    <div ref={ref} className="relative min-h-[460px] bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-500 overflow-hidden text-white">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} className="confetti absolute" style={{
            left: `${Math.random() * 100}%`, top: `-10%`,
            width: 6 + (i % 4) * 3, height: 10 + (i % 3) * 4,
            background: colors[i % colors.length],
            transform: `rotate(${i * 20}deg)`,
            borderRadius: i % 2 ? 2 : "50%",
          }} />
        ))}
      </div>
      <div className="relative z-10 min-h-[460px] flex flex-col items-center justify-center px-8 text-center">
        <div className="party inline-block text-6xl origin-center">🎉</div>
        <p className="cfx mt-4 text-xs uppercase tracking-[0.4em] font-bold">Congratulations · You found it</p>
        <h1 className="cfx mt-4 text-6xl font-black drop-shadow-lg tracking-tight" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{domain}</h1>
        <p className="cfx mt-3 max-w-md text-white/90">The party name your brand's been waiting for. Bring the cake — we brought the balloons.</p>
        <div className="cfx mt-8 rounded-2xl bg-white text-slate-900 p-4 flex items-center gap-4 shadow-2xl">
          <div>
            <p className="text-[10px] uppercase text-slate-500 font-bold">Take-home gift</p>
            <p className="text-3xl font-black">{fmt(val.high)}</p>
          </div>
          <button className="bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white font-black px-6 py-3 rounded-xl">Grab a slice 🎂</button>
        </div>
      </div>
    </div>
  );
}

export const EXTRA_LANDERS = [
  { id: "boarding",     label: "Boarding Pass",     group: "Non-Animated", Comp: BoardingPassLander },
  { id: "vinyl",        label: "Vinyl Record",      group: "Non-Animated", Comp: VinylLander },
  { id: "museum",       label: "Museum Placard",    group: "Non-Animated", Comp: MuseumLander },
  { id: "newspaper",    label: "Newspaper Classified", group: "Non-Animated", Comp: NewspaperLander },
  { id: "polaroid",     label: "Polaroid",          group: "Non-Animated", Comp: PolaroidLander },
  { id: "manpage",      label: "BSD Manpage",       group: "Non-Animated", Comp: ManpageLander },
  { id: "realestate",   label: "Real Estate",       group: "Non-Animated", Comp: RealEstateLander },
  { id: "perfume",      label: "Luxury Perfume",    group: "Non-Animated", Comp: PerfumeLander },
  { id: "tradingcard",  label: "Trading Card",      group: "Non-Animated", Comp: TradingCardLander },
  { id: "deed",         label: "Legal Deed",        group: "Non-Animated", Comp: DeedLander },
  { id: "matrix",       label: "Matrix Rain",       group: "Animated",     Comp: MatrixLander },
  { id: "liquidmetal",  label: "Liquid Metal",      group: "Animated",     Comp: LiquidMetalLander },
  { id: "neonsign",     label: "Neon Sign",         group: "Animated",     Comp: NeonSignLander },
  { id: "ticker",       label: "Stock Ticker",      group: "Animated",     Comp: TickerLander },
  { id: "auction",      label: "Live Auction",      group: "Animated",     Comp: AuctionLander },
  { id: "cardflip",     label: "3D Card Flip",      group: "Animated",     Comp: CardFlipLander },
  { id: "oceanwave",    label: "Ocean Wave",        group: "Animated",     Comp: OceanWaveLander },
  { id: "elastic",      label: "Elastic Bounce",    group: "Animated",     Comp: ElasticLander },
  { id: "constellation",label: "Constellation",     group: "Animated",     Comp: ConstellationLander },
  { id: "confetti",     label: "Confetti Party",    group: "Animated",     Comp: ConfettiLander },
];
