"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0f1a" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold" style={{ background: "#3399ff20", color: "#3399ff" }}>⬡</div>
            <span className="text-2xl font-bold" style={{ color: "#f2f4ff" }}>Algorido AI</span>
          </div>
          <p className="text-sm italic" style={{ color: "#3399ff" }}>From digital slavery to digital mastery</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "#161927", border: "1px solid #2d3757" }}>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#f2f4ff" }}>Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: "#8d9ec7" }}>Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8d9ec7" }}>Email address</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{ background: "#1e2338", border: "1px solid #2d3757", color: "#f2f4ff" }}
                onFocus={e => e.target.style.borderColor = "#3399ff"}
                onBlur={e => e.target.style.borderColor = "#2d3757"}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8d9ec7" }}>Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{ background: "#1e2338", border: "1px solid #2d3757", color: "#f2f4ff" }}
                onFocus={e => e.target.style.borderColor = "#3399ff"}
                onBlur={e => e.target.style.borderColor = "#2d3757"}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#ff595920", color: "#ff5959", border: "1px solid #ff595940" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity"
              style={{ background: "#3399ff", color: "#0d0f1a", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: "1px solid #2d3757" }}>
            <p className="text-xs text-center" style={{ color: "#596494" }}>
              Don&apos;t have an account?{" "}
              <a href="https://dash.algorido.com" target="_blank" rel="noreferrer" style={{ color: "#3399ff" }}>
                Visit dash.algorido.com
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#596494" }}>
          Algorido AI · Market Maker Volume Bot
        </p>
      </div>
    </div>
  );
}
