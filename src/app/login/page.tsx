"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BACKEND_URL = "https://orderdesk-backend-9gu2.onrender.com";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"LOGIN" | "REGISTER" | "RESET">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [generatedPasskey, setGeneratedPasskey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let endpoint = "";
      let bodyData = {};

      if (mode === "REGISTER") {
        endpoint = `${BACKEND_URL}/auth/register`;
        bodyData = { org_name: orgName, email, password };
      } else if (mode === "LOGIN") {
        endpoint = `${BACKEND_URL}/auth/login`;
        bodyData = { email, password };
      } else if (mode === "RESET") {
        endpoint = `${BACKEND_URL}/auth/reset-password`;
        bodyData = { email, security_passkey: passkey, new_password: newPassword };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify(bodyData),
      }).catch(() => {
        throw new Error("Backend server is waking up on Render. Please wait 15 seconds and try again.");
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication request failed.");

      if (mode === "REGISTER") {
        setGeneratedPasskey(data.security_passkey);
      } else if (mode === "LOGIN") {
        localStorage.setItem("orderdesk_org_name", data.organization_name);
        localStorage.setItem("orderdesk_user_email", data.email);
        router.push("/");
      } else if (mode === "RESET") {
        setSuccessMsg("Password reset successfully! Please sign in with your new password.");
        setMode("LOGIN");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
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
            {mode === "LOGIN" && "Supplier Sign In"}
            {mode === "REGISTER" && "Register Company"}
            {mode === "RESET" && "Reset Password"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "LOGIN" && "Manage wholesale orders & live inventory"}
            {mode === "REGISTER" && "Get your unique security passkey"}
            {mode === "RESET" && "Authorize password change with your security passkey"}
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl text-center border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl text-center border border-emerald-200">
            {successMsg}
          </div>
        )}

        {generatedPasskey ? (
          <div className="space-y-4 text-center">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-left">
              <span className="text-xs font-bold text-amber-800 uppercase block mb-1">🔑 Save Your Unique Passkey</span>
              <p className="text-[11px] text-amber-700 mb-2">
                This passkey is shown ONCE. It is required to reset your password if you ever forget it. Store it safely.
              </p>
              <div className="bg-white border border-amber-300 font-mono font-bold text-base text-slate-900 p-3 rounded-xl text-center tracking-wider break-all">
                {generatedPasskey}
              </div>
            </div>
            <button
              onClick={() => setMode("LOGIN")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md"
            >
              Proceed to Sign In →
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "REGISTER" && (
              <div>
                <label className="text-xs font-bold text-slate-700">Company / Supplier Name</label>
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

            {mode !== "RESET" && (
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
            )}

            {mode === "RESET" && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700">Security Passkey</label>
                  <input
                    type="text"
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="ORD-XXXX-XXXX-XXXX"
                    className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase tracking-wider text-slate-900 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-indigo-600"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md disabled:opacity-50"
            >
              {loading ? "Processing..." : mode === "LOGIN" ? "Sign In" : mode === "REGISTER" ? "Register Company" : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-2 text-center text-xs font-semibold text-slate-600">
          {mode === "LOGIN" && (
            <>
              <button onClick={() => setMode("RESET")} className="hover:text-indigo-600 text-slate-500">
                Forgot password? Reset with Security Passkey
              </button>
              <button onClick={() => setMode("REGISTER")} className="hover:text-indigo-600 text-indigo-600 font-bold">
                Need a portal? Register company
              </button>
            </>
          )}

          {(mode === "REGISTER" || mode === "RESET") && (
            <button onClick={() => setMode("LOGIN")} className="hover:text-indigo-600">
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}