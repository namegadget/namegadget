import { useEffect, useRef, useState } from "react";
import { animate, stagger, createTimeline } from "animejs";
import { Globe2, ShoppingCart, Mail, Clock, Shield, Star, ArrowRight, Sparkles, Zap, Check, TrendingUp, Heart } from "lucide-react";

type Val = { low: number; high: number };
type LanderProps = { domain: string; val: Val };

const fmt = (n: number) => `$${n.toLocaleString()}`;

/* ============================================================
   1. AFTERNIC style — clean corporate marketplace
   ============================================================ */
function AfternicLander({ domain, val }: LanderProps) {
  return (
    <div className="bg-white text-slate-900 min-h-[460px]" style={{ fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
      <div className="bg-[#003a70] text-white px-6 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-semibold tracking-wide">
          <Globe2 className="h-4 w-4" /> AFTERNIC · MARKETPLACE
        </div>
        <div className="opacity-80">Powered by GoDaddy</div>
      </div>
      <div className="px-8 py-10 max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">The domain</p>
        <h1 className="text-4xl font-bold mt-2 text-[#003a70]">{domain}</h1>
        <p className="text-slate-600 mt-2">is for sale</p>
        <div className="mt-8 border border-slate-200 rounded-lg p-6 bg-slate-50/60">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase">Buy Now Price</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{fmt(val.high)} <span className="text-sm font-normal text-slate-500">USD</span></p>
            </div>
            <button className="bg-[#00838f] hover:bg-[#006974] text-white px-6 py-3 rounded font-semibold text-sm">Buy Now</button>
          </div>
          <div className="border-t border-slate-200 mt-5 pt-5 flex items-center gap-3">
            <input placeholder="Make an offer" className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-[#00838f]" />
            <button className="border border-[#00838f] text-[#00838f] px-5 py-2 rounded text-sm font-semibold hover:bg-[#00838f]/5">Submit</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 text-xs">
          {[["Fast Transfer", "24-hour transfer"], ["Secure", "Escrow protected"], ["Trusted", "Since 1999"]].map(([t, s]) => (
            <div key={t} className="border-l-2 border-[#00838f] pl-3">
              <p className="font-semibold text-slate-900">{t}</p>
              <p className="text-slate-500 mt-0.5">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   2. SEDO style — orange/yellow, classic marketplace
   ============================================================ */
function SedoLander({ domain, val }: LanderProps) {
  return (
    <div className="bg-white text-slate-800 min-h-[460px]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="bg-gradient-to-r from-[#ffb400] to-[#ff8a00] px-6 py-4">
        <div className="flex items-center justify-between text-white">
          <div className="font-bold text-lg tracking-tight">sedo<span className="opacity-70">.com</span></div>
          <div className="text-[11px] uppercase tracking-wider">Domain Marketplace</div>
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="border-l-4 border-[#ff8a00] pl-4">
          <p className="text-xs text-slate-500">This domain name is for sale</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">{domain}</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="border border-slate-200 p-5 rounded">
            <p className="text-[11px] uppercase text-slate-500 font-semibold">Buy It Now</p>
            <p className="text-2xl font-bold text-[#ff8a00] mt-1">{fmt(val.high)}</p>
            <button className="mt-3 w-full bg-[#ff8a00] hover:bg-[#e67a00] text-white py-2 rounded text-sm font-bold">BUY NOW</button>
          </div>
          <div className="border border-slate-200 p-5 rounded">
            <p className="text-[11px] uppercase text-slate-500 font-semibold">Make Offer</p>
            <input placeholder="Your offer (USD)" className="mt-1 w-full border-b border-slate-300 py-1.5 text-lg font-semibold outline-none focus:border-[#ff8a00]" />
            <button className="mt-3 w-full border-2 border-[#ff8a00] text-[#ff8a00] py-2 rounded text-sm font-bold hover:bg-[#ff8a00]/5">SEND OFFER</button>
          </div>
        </div>
        <div className="mt-6 bg-slate-50 border border-slate-200 p-4 rounded text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1"><Shield className="h-3.5 w-3.5" /> Secure transaction via Sedo trust service</div>
          Buyer and seller protection · escrow included · worldwide transfer.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   3. SAW / Squadhelp style — branding marketplace
   ============================================================ */
function SawLander({ domain, val }: LanderProps) {
  const name = domain.split(".")[0];
  return (
    <div className="bg-gradient-to-br from-[#faf5ff] to-white text-slate-900 min-h-[460px]" style={{ fontFamily: "Poppins, system-ui, sans-serif" }}>
      <div className="px-6 py-3 flex items-center justify-between border-b border-purple-100">
        <div className="font-black text-lg text-[#6d28d9]">saw<span className="text-[#f59e0b]">.</span></div>
        <span className="text-[10px] uppercase tracking-widest text-slate-500">Curated Brand Names</span>
      </div>
      <div className="px-8 py-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-[#6d28d9] px-3 py-1 text-[11px] font-semibold">
          <Star className="h-3 w-3 fill-current" /> TOP-TIER BRAND
        </div>
        <h1 className="mt-4 text-5xl font-black tracking-tight bg-gradient-to-r from-[#6d28d9] to-[#f59e0b] bg-clip-text text-transparent">{domain}</h1>
        <p className="mt-3 text-slate-600 max-w-md">A premium brandable name — vetted by naming experts, trademark-screened, and matched to your industry.</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {["Logo included", "Trademark report", "Domain transfer"].map((f) => (
            <div key={f} className="rounded-xl border border-purple-100 bg-white p-3 text-xs">
              <Check className="h-3.5 w-3.5 text-[#6d28d9]" />
              <p className="mt-1 font-semibold">{f}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-xs uppercase opacity-80">Buy this brand</p>
            <p className="text-3xl font-black">{fmt(val.high)}</p>
          </div>
          <button className="bg-white text-[#6d28d9] px-5 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2">
            Buy {name} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   4. ATOM.COM style — modern dark, curated brand marketplace
   ============================================================ */
function AtomLander({ domain, val }: LanderProps) {
  return (
    <div className="bg-white text-slate-900 min-h-[460px]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full border-2 border-black relative">
            <span className="absolute inset-0 m-auto h-1.5 w-1.5 bg-black rounded-full top-0 bottom-0 left-0 right-0" style={{ margin: "auto" }} />
          </div>
          <span className="font-bold">Atom</span>
        </div>
        <button className="text-xs font-medium text-slate-600">Sign in</button>
      </div>
      <div className="px-10 py-12 grid grid-cols-5 gap-8">
        <div className="col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Brand for sale</p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight leading-tight">{domain}</h1>
          <p className="mt-4 text-slate-600 leading-relaxed">A short, memorable brand — perfect for a modern startup. Includes a professional logo, domain transfer, and a trademark screening report.</p>
          <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> Free logo</span>
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> TM screened</span>
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> 7-day money back</span>
          </div>
        </div>
        <div className="col-span-2">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs text-slate-500">Buy Now</p>
            <p className="text-3xl font-bold mt-1">{fmt(val.high)}</p>
            <button className="mt-4 w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800">Buy this domain</button>
            <button className="mt-2 w-full border border-slate-200 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50">Make an offer</button>
            <p className="mt-3 text-[10px] text-center text-slate-400">Secure checkout · Escrow.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   5. HANDWRITING lander — notebook, casual, personal
   ============================================================ */
function HandwritingLander({ domain, val }: LanderProps) {
  return (
    <div
      className="min-h-[460px] text-slate-900 relative overflow-hidden"
      style={{
        fontFamily: '"Caveat", "Bradley Hand", "Segoe Script", cursive',
        backgroundColor: "#fdf6e3",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 31px, #e8d9b0 31px, #e8d9b0 32px)",
      }}
    >
      <div className="absolute left-10 top-0 bottom-0 w-px bg-red-300/60" />
      <div className="px-16 py-10">
        <p className="text-2xl text-slate-700 rotate-[-2deg] inline-block">Hey there 👋</p>
        <h1 className="mt-4 text-6xl font-bold rotate-[-1deg]" style={{ color: "#1e40af" }}>
          {domain}
        </h1>
        <p className="mt-3 text-2xl text-slate-700 leading-tight">
          is available — and I think <br /> it'd look great on <u className="decoration-wavy decoration-amber-500">your</u> business.
        </p>

        <div className="mt-8 inline-block relative">
          <span className="text-3xl">Asking: </span>
          <span className="text-4xl font-bold" style={{ color: "#b91c1c" }}>{fmt(val.high)}</span>
          <svg className="absolute -bottom-2 left-0 right-0" height="10" viewBox="0 0 200 10">
            <path d="M2 6 Q 50 2, 100 5 T 198 4" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <input
            placeholder="Or... what would you pay?"
            className="text-2xl bg-transparent border-b-2 border-dashed border-slate-500 outline-none flex-1 pb-1"
            style={{ fontFamily: "inherit" }}
          />
          <button
            className="text-2xl px-5 py-1 rounded-full border-2 border-slate-900 bg-yellow-300 hover:rotate-[-2deg] transition-transform"
            style={{ fontFamily: "inherit" }}
          >
            Send it! →
          </button>
        </div>

        <p className="mt-10 text-xl text-slate-600 rotate-[1deg]">— cheers, the owner ✌️</p>
      </div>
    </div>
  );
}

/* ============================================================
   6. ANIME · Kinetic Typewriter reveal
   ============================================================ */
function KineticLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chars = ref.current.querySelectorAll<HTMLElement>(".kchar");
    animate(chars, {
      opacity: [0, 1],
      translateY: [40, 0],
      rotate: [-8, 0],
      duration: 700,
      delay: stagger(45),
      ease: "outExpo",
    });
    animate(ref.current.querySelectorAll(".kfade"), {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(120, { start: 800 }),
      duration: 600,
      ease: "outQuad",
    });
  }, [domain]);
  return (
    <div ref={ref} className="bg-black text-white min-h-[460px] flex flex-col items-center justify-center px-8 relative overflow-hidden" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.25),transparent_60%)]" />
      <p className="kfade text-xs uppercase tracking-[0.3em] text-emerald-400 relative">Now Available</p>
      <h1 className="mt-4 text-6xl font-black tracking-tight relative">
        {domain.split("").map((c, i) => (
          <span key={i} className="kchar inline-block">{c === "." ? <span className="text-emerald-400">.</span> : c}</span>
        ))}
      </h1>
      <p className="kfade mt-4 text-slate-400 text-sm relative">One name. Endless leverage.</p>
      <div className="kfade mt-8 flex items-center gap-3 relative">
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">Asking <span className="text-emerald-400 font-bold">{fmt(val.high)}</span></div>
        <button className="rounded-lg bg-emerald-500 text-black px-5 py-2 font-bold text-sm hover:bg-emerald-400">Acquire →</button>
      </div>
    </div>
  );
}

/* ============================================================
   7. ANIME · Particle burst
   ============================================================ */
function ParticleLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const dots = ref.current.querySelectorAll<HTMLElement>(".pdot");
    animate(dots, {
      translateX: () => (Math.random() - 0.5) * 400,
      translateY: () => (Math.random() - 0.5) * 400,
      scale: [{ from: 0, to: 1.2 }, { to: 0.6 }],
      opacity: [{ from: 0, to: 1 }, { to: 0.4 }],
      duration: 1800,
      delay: stagger(15),
      ease: "outQuint",
      loop: true,
      alternate: true,
    });
  }, [domain]);
  return (
    <div ref={ref} className="relative bg-[#0a0a1f] text-white min-h-[460px] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} className="pdot absolute h-1.5 w-1.5 rounded-full" style={{ background: i % 2 ? "#06b6d4" : "#a855f7", boxShadow: "0 0 8px currentColor" }} />
        ))}
      </div>
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
          <Sparkles className="h-3 w-3" /> Premium Release
        </div>
        <h1 className="mt-6 text-5xl font-black tracking-tight" style={{ textShadow: "0 0 30px rgba(6,182,212,0.5)" }}>{domain}</h1>
        <p className="mt-3 text-slate-400 text-sm max-w-sm mx-auto">A rare, phonetically perfect asset entering the market.</p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur px-2 py-2">
          <span className="pl-3 text-sm text-slate-300">{fmt(val.low)} – {fmt(val.high)}</span>
          <button className="rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 font-bold text-sm">Claim now</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   8. ANIME · Stagger card grid reveal
   ============================================================ */
function StaggerGridLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(ref.current.querySelectorAll<HTMLElement>(".sgtile"), {
      opacity: [0, 1],
      scale: [0.5, 1],
      rotate: [() => (Math.random() - 0.5) * 40, 0],
      duration: 800,
      delay: stagger(40, { grid: [6, 4], from: "center" }),
    }).add(ref.current.querySelectorAll<HTMLElement>(".sgcopy"), {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(100),
      duration: 500,
    }, "-=400");
  }, [domain]);
  return (
    <div ref={ref} className="relative bg-slate-950 text-white min-h-[460px] overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-1 opacity-70">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="sgtile rounded-md" style={{ background: `hsl(${(i * 12 + 180) % 360} 70% ${20 + (i % 5) * 6}%)` }} />
        ))}
      </div>
      <div className="relative z-10 min-h-[460px] flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-3xl bg-black/70 backdrop-blur-xl border border-white/10 p-8 max-w-md">
          <p className="sgcopy text-xs uppercase tracking-widest text-fuchsia-400">Featured Domain</p>
          <h1 className="sgcopy mt-3 text-4xl font-black">{domain}</h1>
          <p className="sgcopy mt-3 text-slate-400 text-sm">Reserved for a category leader.</p>
          <div className="sgcopy mt-5 flex items-center gap-2">
            <input placeholder={`Offer above ${fmt(val.low)}`} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-fuchsia-400" />
            <button className="bg-fuchsia-500 hover:bg-fuchsia-400 text-black rounded-lg px-4 py-2 text-sm font-bold">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   9. ANIME · Morphing blob + orbit
   ============================================================ */
function OrbitLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current.querySelectorAll<HTMLElement>(".blob"), {
      scale: [1, 1.15, 0.9, 1],
      rotate: "1turn",
      duration: 12000,
      loop: true,
      ease: "inOutSine",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".orbit"), {
      rotate: "1turn",
      duration: 9000,
      loop: true,
      ease: "linear",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".riseCopy"), {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(120),
      duration: 700,
      ease: "outExpo",
    });
  }, [domain]);
  return (
    <div ref={ref} className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white min-h-[460px] overflow-hidden flex items-center justify-center">
      <div className="blob absolute h-[380px] w-[380px] rounded-full opacity-40" style={{ background: "radial-gradient(circle, #22d3ee, transparent 60%)", left: "10%", top: "10%" }} />
      <div className="blob absolute h-[320px] w-[320px] rounded-full opacity-40" style={{ background: "radial-gradient(circle, #a855f7, transparent 60%)", right: "5%", bottom: "5%" }} />
      <div className="orbit absolute h-[500px] w-[500px] rounded-full border border-white/10" />
      <div className="orbit absolute h-[360px] w-[360px] rounded-full border border-white/10" />
      <div className="relative z-10 text-center px-8">
        <p className="riseCopy text-xs uppercase tracking-[0.3em] text-cyan-300">Signal · Discovered</p>
        <h1 className="riseCopy mt-4 text-6xl font-black bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-transparent">{domain}</h1>
        <p className="riseCopy mt-3 text-slate-400 max-w-md mx-auto">A gravitational brand — orbiting the intersection of design and technology.</p>
        <div className="riseCopy mt-8">
          <button className="rounded-full bg-white text-black px-8 py-3 font-bold hover:scale-105 transition">Own it · {fmt(val.high)}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   10. ANIME · Marquee + live counter
   ============================================================ */
function MarqueeLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = 100 + (domain.length * 37) % 900;
    const obj = { n: 0 };
    animate(obj, { n: target, duration: 1600, ease: "outExpo", onUpdate: () => setCount(Math.round(obj.n)) });
    if (ref.current) {
      animate(ref.current.querySelectorAll<HTMLElement>(".mline"), {
        translateX: ["100%", "-100%"],
        duration: 18000,
        loop: true,
        ease: "linear",
      });
      animate(ref.current.querySelectorAll<HTMLElement>(".mfade"), {
        opacity: [0, 1], translateY: [20, 0], delay: stagger(120), duration: 700, ease: "outQuad",
      });
    }
  }, [domain]);
  return (
    <div ref={ref} className="bg-[#faf7f2] text-slate-900 min-h-[460px] flex flex-col" style={{ fontFamily: "Georgia, serif" }}>
      <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap">
        <div className="mline inline-block text-sm tracking-widest uppercase">
          ✦ Premium Domain ✦ {domain} ✦ Now Available ✦ Instant Transfer ✦ Escrow Secured ✦ {domain} ✦
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-8 px-10 py-10 items-center">
        <div>
          <p className="mfade text-xs uppercase tracking-widest text-slate-500">Est. 2026 · Rare Release</p>
          <h1 className="mfade mt-4 text-6xl font-bold leading-none">{domain}</h1>
          <p className="mfade mt-4 text-slate-600 leading-relaxed">An editorial-grade name, meticulously curated for founders who value semiotic clarity.</p>
          <div className="mfade mt-6 flex items-center gap-3">
            <button className="bg-black text-white px-6 py-3 rounded-none font-semibold text-sm">Reserve — {fmt(val.high)}</button>
            <button className="border border-black px-6 py-3 font-semibold text-sm">Enquire</button>
          </div>
        </div>
        <div className="mfade border-l border-slate-300 pl-8">
          <p className="text-[11px] uppercase tracking-widest text-slate-500">Interest this week</p>
          <p className="text-7xl font-black tabular-nums">{count}</p>
          <p className="text-xs text-slate-500 mt-1">unique buyer signals</p>
          <div className="mt-6 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> +34% search velocity</div>
            <div className="flex items-center gap-2"><Heart className="h-3.5 w-3.5" /> 12 watchlists</div>
            <div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5" /> 3 active offers</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   11. ANIME · Neon glitch cyber
   ============================================================ */
function GlitchLander({ domain, val }: LanderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current.querySelectorAll<HTMLElement>(".gline"), {
      scaleX: [0, 1],
      transformOrigin: "0% 50%",
      duration: 900,
      delay: stagger(80),
      ease: "outExpo",
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".gtitle"), {
      translateX: [{ from: -20, to: 20, duration: 80 }, { to: 0, duration: 100 }],
      skewX: [{ from: -6, to: 6, duration: 80 }, { to: 0, duration: 100 }],
      opacity: [0, 1],
      loop: 3,
    });
    animate(ref.current.querySelectorAll<HTMLElement>(".gpanel"), {
      opacity: [0, 1], translateY: [40, 0], delay: stagger(120, { start: 400 }), duration: 700, ease: "outExpo",
    });
  }, [domain]);
  return (
    <div ref={ref} className="relative bg-black text-lime-300 min-h-[460px] overflow-hidden" style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(163,230,53,0.3) 2px, rgba(163,230,53,0.3) 3px)" }} />
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="gline absolute h-px bg-lime-400/40" style={{ top: `${15 + i * 14}%`, left: 0, right: 0 }} />
        ))}
      </div>
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between text-xs">
          <span>&gt; namegadget://landers/glitch</span>
          <span className="text-lime-500">[STATUS: LISTED]</span>
        </div>
        <div className="mt-16 text-center">
          <p className="text-xs opacity-70">// ASSET-ID: 0x{domain.length.toString(16).padStart(4, "0")}</p>
          <h1 className="gtitle mt-4 text-6xl font-black tracking-tight text-white" style={{ textShadow: "2px 0 #06b6d4, -2px 0 #ec4899" }}>
            {domain}
          </h1>
          <p className="mt-4 text-lime-400/80">▓▓▓▓▓▓▓▓░░░  Decrypting valuation...</p>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3">
          <div className="gpanel border border-lime-400/40 p-4">
            <p className="text-[10px] opacity-70">MIN.OFFER</p>
            <p className="text-xl text-white">{fmt(val.low)}</p>
          </div>
          <div className="gpanel border border-lime-400/40 p-4">
            <p className="text-[10px] opacity-70">BUY.NOW</p>
            <p className="text-xl text-white">{fmt(val.high)}</p>
          </div>
          <div className="gpanel border border-lime-400/40 p-4">
            <p className="text-[10px] opacity-70">ACTION</p>
            <button className="text-xl text-lime-300 hover:text-white">EXECUTE →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Gallery + selector
   ============================================================ */
type Template = { id: string; label: string; group: string; Comp: React.ComponentType<LanderProps> };

export const LANDER_TEMPLATES: Template[] = [
  { id: "afternic",   label: "Afternic",           group: "Marketplace",  Comp: AfternicLander },
  { id: "sedo",       label: "Sedo",               group: "Marketplace",  Comp: SedoLander },
  { id: "saw",        label: "Saw",                group: "Brandable",    Comp: SawLander },
  { id: "atom",       label: "Atom.com",           group: "Brandable",    Comp: AtomLander },
  { id: "handwrite",  label: "Handwritten Note",   group: "Personal",     Comp: HandwritingLander },
  { id: "kinetic",    label: "Kinetic Type",       group: "Animated",     Comp: KineticLander },
  { id: "particles",  label: "Particle Burst",     group: "Animated",     Comp: ParticleLander },
  { id: "stagger",    label: "Stagger Grid",       group: "Animated",     Comp: StaggerGridLander },
  { id: "orbit",      label: "Orbit / Blob",       group: "Animated",     Comp: OrbitLander },
  { id: "marquee",    label: "Editorial Marquee",  group: "Animated",     Comp: MarqueeLander },
  { id: "glitch",     label: "Neon Glitch",        group: "Animated",     Comp: GlitchLander },
];

export function LanderGallery({ domain, val }: LanderProps) {
  const [id, setId] = useState<string>(LANDER_TEMPLATES[0].id);
  const active = LANDER_TEMPLATES.find((t) => t.id === id) ?? LANDER_TEMPLATES[0];
  const Comp = active.Comp;
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {LANDER_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setId(t.id)}
            className={`shrink-0 text-[11px] px-2.5 py-1.5 rounded-md border transition ${
              t.id === id
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"
            }`}
            title={t.group}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
        <Comp domain={domain} val={val} />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {active.group} · Template: {active.label}
      </p>
    </div>
  );
}
