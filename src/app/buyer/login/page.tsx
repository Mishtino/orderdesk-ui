"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

export default function BuyerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "REGISTER") {
        const res = await fetch(`${API_BASE}/buyer/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ organization_id: orgId, company_name: company, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");
        setMode("LOGIN");
      } else {
        const res = await fetch(`${API_BASE}/buyer/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");
        router.push("/buyer");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-white text-center mb-2">Buyer Portal</h1>
        <p className="text-sm text-slate-300 text-center mb-6">Sign in to your wholesale account</p>
        <form onSubmit={submit} className="space-y-4">
          {mode === "REGISTER" && (
            <>
              <input value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="Supplier Organization ID" required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </>
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required minLength={8} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {error && <div className="p-3 bg-red-500/10 border border-red-400/30 text-red-300 rounded-xl text-xs">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-50">
            {loading ? "Processing..." : mode === "LOGIN" ? "Sign In" : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center text-xs">
          {mode === "LOGIN" ? (
            <button onClick={() => setMode("REGISTER")} className="text-indigo-400 hover:text-indigo-300">Need an account? Register</button>
          ) : (
            <button onClick={() => setMode("LOGIN")} className="text-slate-400 hover:text-indigo-300">Back to Sign In</button>
          )}
        </div>
      </div>
    </div>
  );
}
