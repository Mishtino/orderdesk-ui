"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (tier: "MONTHLY" | "ANNUAL") => {
    setLoading(tier);
    setError(null);

    const userEmail = localStorage.getItem("orderdesk_user_email") || "supplier@vortextech.co.zw";

    try {
      const res = await fetch("https://orderdesk-backend-9gu2.onrender.com/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_tier: tier,
          email: userEmail
        })
      });

      const data = await res.json();

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error(data.detail || "Unable to initiate Paynow checkout.");
      }
    } catch (err: any) {
      setError(err.message || "Paynow connection error.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/orderdesk-icon.svg" 
              alt="OrderDesk Icon" 
              width={36} 
              height={36} 
              className="h-9 w-9 object-contain" 
            />
            <span className="text-xl font-extrabold text-slate-900">OrderDesk</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Title Block */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">OrderDesk Platform Plans</h1>
          <p className="text-sm text-slate-500">
            Automate your B2B inventory, WhatsApp orders, and inter-city freight. Pay securely via Paynow (EcoCash, OneMoney, InnBucks, Cards).
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Monthly Tier */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flexible Tier</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Monthly Tier</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">$29.99</span>
                <span className="text-xs font-bold text-slate-400">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">✓ Full WhatsApp & SMS Order Automation</li>
                <li className="flex items-center gap-2">✓ Unlimited Product & SKU Catalog</li>
                <li className="flex items-center gap-2">✓ Tiered Fulfillment Engine (Biker & Freight)</li>
                <li className="flex items-center gap-2">✓ Web Portal Dashboard & CSV Ingestion</li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("MONTHLY")}
              disabled={loading === "MONTHLY"}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition disabled:opacity-50"
            >
              {loading === "MONTHLY" ? "Connecting to Paynow..." : "Subscribe Monthly"}
            </button>
          </div>

          {/* Annual Tier */}
          <div className="bg-white rounded-3xl p-8 border-2 border-indigo-600 shadow-md relative flex flex-col justify-between space-y-6">
            <span className="absolute -top-3.5 right-6 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
              Save 17%
            </span>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Best Value</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Annual Tier</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">$299.00</span>
                <span className="text-xs font-bold text-slate-400">/ year</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">✓ Everything in Monthly Plan</li>
                <li className="flex items-center gap-2">✓ Dedicated Aisle Logistics Freight Priority</li>
                <li className="flex items-center gap-2">✓ Custom WhatsApp Branding & Responses</li>
                <li className="flex items-center gap-2">✓ Priority 24/7 Support</li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("ANNUAL")}
              disabled={loading === "ANNUAL"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition disabled:opacity-50"
            >
              {loading === "ANNUAL" ? "Connecting to Paynow..." : "Subscribe Yearly"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}