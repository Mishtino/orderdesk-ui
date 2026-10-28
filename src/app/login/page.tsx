"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState<"DETAILS" | "VERIFY">("DETAILS");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email) throw new Error("Please enter your work email.");

      const res = await fetch("https://orderdesk-backend-9gu2.onrender.com/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, org_name: orgName })
      });

      const data = await res.json();
      if (res.ok) {
        setStep("VERIFY");
      } else {
        throw new Error(data.detail || "Failed to send verification code.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://orderdesk-backend-9gu2.onrender.com/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, org_name: orgName })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("orderdesk_org_name", data.organization_name || orgName || "Supplier Org");
        localStorage.setItem("orderdesk_org_id", data.organization_id || "default");
        localStorage.setItem("orderdesk_user_email", data.email || email);
        router.push("/");
      } else {
        throw new Error(data.detail || "Invalid code. Please try again.");
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
        
        {/* Brand Header */}
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
            {step === "VERIFY" 
              ? "Check Your Email" 
              : isSignUp ? "Create Supplier Account" : "Supplier Sign In"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === "VERIFY" 
              ? `Enter the 6-digit code sent to ${email}`
              : "Access wholesale orders & live stock pipelines"}
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {step === "DETAILS" ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
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
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6 digits"
                className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl text-center text-xl tracking-widest font-mono font-bold focus:outline-indigo-600 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Log In"}
            </button>

            <button
              type="button"
              onClick={() => setStep("DETAILS")}
              className="w-full text-xs text-slate-500 hover:text-slate-700 font-semibold mt-2"
            >
              ← Edit email address
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setStep("DETAILS");
            }}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need a supplier portal? Register company"}
          </button>
        </div>
      </div>
    </div>
  );
}