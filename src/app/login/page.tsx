"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BACKEND_URL = "https://orderdesk-backend-9gu2.onrender.com";

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
      const endpoint = isSignUp ? `${BACKEND_URL}/auth/register` : `${BACKEND_URL}/auth/login`;
      const bodyData = isSignUp 
        ? { org_name: orgName, email, password } 
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      }).catch(() => {
        throw new Error("Backend server is waking up on Render. Please wait 15 seconds and try again.");
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed.");

      localStorage.setItem("orderdesk_org_name", data.organization_name || orgName || "Supplier Org");
      localStorage.setItem("orderdesk_user_email", data.email || email);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-800">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image 
              src="/orderdesk-logo-dark.svg" 
              alt="OrderDesk Logo" 
              width={180} 
              height={50} 
              priority
              className="h-12 w-auto object-contain" 
            />
          </div>
          <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
            OrderDesk B2B Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {isSignUp ? "Create Supplier Account" : "Supplier Sign In"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access wholesale orders & live stock pipelines
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-bold text-slate-700">Company Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Vortex Supplies"
                className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-indigo-600"
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
              className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-indigo-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Register Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need a supplier portal? Register company"}
          </button>
        </div>
      </div>
    </div>
  );
}