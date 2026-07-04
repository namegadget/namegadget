import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Loader2, Mail, ArrowLeft, ShieldCheck, KeyRound, Lock } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

type Step = "identify" | "verify";

function GoogleGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 5.9 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 5.9 29.5 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.4 34.9 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8L6.1 33C9.3 39.5 16.1 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.6l6.5 5.3C41.5 34.5 44 29.6 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("identify");
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [passwordMode, setPasswordMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  // Entrance
  useEffect(() => {
    if (!cardRef.current) return;
    animate(cardRef.current.querySelectorAll(".auth-el"), {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 500,
      ease: "outQuad",
      delay: stagger(60),
    });
  }, [step]);

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      toast.success("Check your inbox — code sent.");
      setStep("verify");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send code";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(token: string) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) throw error;
      toast.success("Welcome in.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid code";
      toast.error(msg);
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        const msg = result.error instanceof Error ? result.error.message : "Google sign-in failed";
        toast.error(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function submitPassword(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (passwordMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid relative flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* ambient */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%),radial-gradient(40%_40%_at_100%_100%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_60%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-40 [background:linear-gradient(to_bottom,transparent,var(--background)_80%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* brand */}
        <button
          onClick={() => navigate({ to: "/" })}
          className="mx-auto mb-6 flex items-center justify-center gap-2 opacity-90 hover:opacity-100 transition"
        >
          <img src={logo.url} alt="NameGadget" className="h-8 w-auto" />
        </button>

        <div
          ref={cardRef}
          className="relative rounded-3xl border border-border/80 bg-card/70 backdrop-blur-2xl p-7 md:p-8 shadow-[0_40px_120px_-30px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
        >
          {/* subtle inner glow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none [background:radial-gradient(60%_40%_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_60%)]" />

          <div className="relative">
            {step === "identify" ? (
              <>
                <div className="auth-el flex items-center gap-2 mb-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-primary">
                    <ShieldCheck className="h-3 w-3" /> secure gate
                  </div>
                </div>
                <h1 className="auth-el text-2xl md:text-3xl font-bold tracking-tight">
                  Enter your portfolio.
                </h1>
                <p className="auth-el mt-1.5 text-sm text-muted-foreground">
                  Passwordless by design. 0% commission always.
                </p>

                {/* google */}
                <button
                  onClick={signInWithGoogle}
                  disabled={googleLoading || loading}
                  className="auth-el mt-6 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-background hover:bg-secondary transition px-4 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleGlyph className="h-5 w-5" />
                  )}
                  Continue with Google
                </button>

                {/* divider */}
                <div className="auth-el my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    or via email
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* mode toggle */}
                <div className="auth-el mb-3 flex rounded-lg border border-border bg-background p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("otp")}
                    className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${mode === "otp" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Email code
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("password")}
                    className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${mode === "password" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Password
                  </button>
                </div>

                {mode === "otp" ? (
                  <form onSubmit={sendOtp} className="space-y-3">
                    <div className="auth-el">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                        Email
                      </label>
                      <div className="mt-1.5 relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@fund.io"
                          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="auth-el w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-brand text-primary-foreground px-4 py-3 text-sm font-semibold glow-cyan hover:opacity-95 disabled:opacity-60 transition"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                      Send secure code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={submitPassword} className="space-y-3">
                    <div className="auth-el">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                        Email
                      </label>
                      <div className="mt-1.5 relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@fund.io"
                          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                        />
                      </div>
                    </div>
                    <div className="auth-el">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                        Password
                      </label>
                      <div className="mt-1.5 relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="auth-el w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-brand text-primary-foreground px-4 py-3 text-sm font-semibold glow-cyan hover:opacity-95 disabled:opacity-60 transition"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      {passwordMode === "signin" ? "Sign in" : "Create account"}
                    </button>

                    <p className="auth-el text-center text-[11px] text-muted-foreground">
                      {passwordMode === "signin" ? "New here?" : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={() => setPasswordMode(passwordMode === "signin" ? "signup" : "signin")}
                        className="text-primary hover:underline font-medium"
                      >
                        {passwordMode === "signin" ? "Create account" : "Sign in"}
                      </button>
                    </p>
                  </form>
                )}

              </>
            ) : (
              <>
                <button
                  onClick={() => { setStep("identify"); setCode(""); }}
                  className="auth-el inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition mb-4"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> back
                </button>

                <div className="auth-el flex items-center gap-2 mb-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-primary">
                    <Mail className="h-3 w-3" /> code sent
                  </div>
                </div>
                <h1 className="auth-el text-2xl md:text-3xl font-bold tracking-tight">
                  Verify your inbox.
                </h1>
                <p className="auth-el mt-1.5 text-sm text-muted-foreground">
                  We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>.
                </p>

                <div className="auth-el mt-6 flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(v) => {
                      setCode(v);
                      if (v.length === 6) verifyOtp(v);
                    }}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <button
                  onClick={() => verifyOtp(code)}
                  disabled={loading || code.length !== 6}
                  className="auth-el mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-brand text-primary-foreground px-4 py-3 text-sm font-semibold glow-cyan hover:opacity-95 disabled:opacity-60 transition"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify & enter
                </button>

                <p className="auth-el mt-5 text-center text-[11px] text-muted-foreground">
                  Didn't receive it?{" "}
                  <button
                    onClick={() => sendOtp()}
                    className="text-primary hover:underline font-medium"
                    disabled={loading}
                  >
                    Resend code
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          By continuing you agree to NameGadget's P2P, 0%-commission terms.
        </p>
      </div>
    </div>
  );
}
