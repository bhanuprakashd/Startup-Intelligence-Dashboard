"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

type AuthTab = "signin" | "signup";

type AuthMessage =
  | { type: "error"; text: string }
  | { type: "success"; text: string }
  | { type: "unconfigured" }
  | null;

async function getSupabaseClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url === "undefined" || key === "undefined") {
      return null;
    }
    const { createClient } = await import("@/lib/supabase-client");
    return createClient();
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AuthMessage>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const supabase = await getSupabaseClient();

    if (!supabase) {
      setLoading(false);
      setMessage({ type: "unconfigured" });
      return;
    }

    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Signed in! Redirecting…" });
          setTimeout(() => { window.location.href = "/"; }, 1200);
        }
      } else {
        if (password !== confirmPassword) {
          setMessage({ type: "error", text: "Passwords do not match." });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Account created! Check your email to confirm." });
        }
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setMessage(null);
    const supabase = await getSupabaseClient();

    if (!supabase) {
      setMessage({ type: "unconfigured" });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      }
    } catch {
      setMessage({ type: "error", text: "Google sign-in failed. Please try again." });
    }
  }

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Mesh background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)", filter: "blur(100px)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-5"
          style={{ background: "radial-gradient(ellipse, #818cf8 0%, transparent 60%)", filter: "blur(60px)" }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Gradient border wrapper */}
        <div
          className="rounded-2xl p-px"
          style={{
            background: "linear-gradient(135deg, rgba(129,140,248,0.35), rgba(167,139,250,0.15), rgba(244,114,182,0.2))",
          }}
        >
          <div
            className="rounded-2xl px-8 py-10"
            style={{
              background: "rgba(13,13,20,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(129,140,248,0.15), rgba(167,139,250,0.1))",
                  border: "1px solid rgba(129,140,248,0.25)",
                }}
              >
                <Globe className="w-7 h-7" style={{ color: "#818cf8" }} />
              </div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#e4e4e7" }}>
                World Startup Intelligence
              </h1>
              <p className="text-sm mt-1" style={{ color: "#71717a" }}>
                Global startup ecosystem, at a glance
              </p>
            </div>

            {/* Tab toggle */}
            <div
              className="flex rounded-xl p-1 mb-7"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {(["signin", "signup"] as AuthTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setMessage(null); }}
                  className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={
                    tab === t
                      ? {
                          background: "linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.15))",
                          color: "#818cf8",
                          border: "1px solid rgba(129,140,248,0.2)",
                        }
                      : { color: "#71717a", border: "1px solid transparent" }
                  }
                >
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Message banner */}
            {message && (
              <div className="mb-5">
                {message.type === "unconfigured" ? (
                  <div
                    className="rounded-xl px-4 py-3 flex flex-col gap-1 text-sm"
                    style={{
                      background: "rgba(129,140,248,0.08)",
                      border: "1px solid rgba(129,140,248,0.2)",
                      color: "#a5b4fc",
                    }}
                  >
                    <span className="font-medium">Auth is being set up.</span>
                    <span style={{ color: "#818cf8" }}>
                      For now, access the dashboard directly.{" "}
                      <Link href="/" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
                        Go to dashboard →
                      </Link>
                    </span>
                  </div>
                ) : message.type === "error" ? (
                  <div
                    className="rounded-xl px-4 py-3 flex items-start gap-2 text-sm"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#fca5a5",
                    }}
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{message.text}</span>
                  </div>
                ) : (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.2)",
                      color: "#6ee7b7",
                    }}
                  >
                    {message.text}
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#a1a1aa" }}>
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "#52525b" }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e4e4e7",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(129,140,248,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#a1a1aa" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "#52525b" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e4e4e7",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(129,140,248,0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#52525b" }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password — Sign Up only */}
              {tab === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "#a1a1aa" }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "#52525b" }}
                    />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#e4e4e7",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(129,140,248,0.4)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "#52525b" }}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Primary action button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{
                  background: loading
                    ? "rgba(129,140,248,0.5)"
                    : "linear-gradient(135deg, #818cf8, #a78bfa)",
                  color: "#fff",
                }}
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {tab === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span className="text-xs" style={{ color: "#52525b" }}>
                Or continue with
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e4e4e7",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >
              {/* Google SVG icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            {/* Footer link */}
            <div className="mt-8 text-center">
              <Link
                href="/launch"
                className="inline-flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "#52525b" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#818cf8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#52525b"; }}
              >
                Learn more about WSI
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
