"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (email && password) {
        localStorage.setItem("orderdesk_org_name", orgName || "Supplier Org");
        localStorage.setItem("orderdesk_user_email", email);
        router.push("/");
      } else {
        throw new Error("Please fill in all required fields.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
            OrderDesk B2B SaaS
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {isSignUp ? "Create Supplier Account" : "Supplier Login"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Includes 7 Days Free Trial access</p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-bold text-slate-700">Company / Supplier Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Vortex Supplies"
                className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600 text-slate-900"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supplier@vortextech.co.zw"
              className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600 text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isSignUp ? "Start 7-Day Free Trial" : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need a supplier portal? Start 7-Day Free Trial"}
          </button>
        </div>
      </div>
    </div>
  );
}