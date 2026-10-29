"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (tier: "MONTHLY" | "ANNUAL") => {
    setLoading(tier);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/billing/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Critical: Sends your session cookie across domains to Render
        body: JSON.stringify({
          plan_tier: tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to initiate checkout");

      if (data.redirect_url) {
        window.location.href = data.redirect_url; // Redirects straight to Paynow checkout
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          OrderDesk Platform Plans
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Automate your B2B inventory, WhatsApp orders, and inter-city freight. Pay securely via Paynow (EcoCash, OneMoney, InnBucks, Cards).
        </p>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 text-left">
          {/* Monthly Tier */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Flexible Tier</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Monthly Tier</h3>
              <p className="mt-4 flex items-baseline text-slate-900">
                <span className="text-5xl font-extrabold tracking-tight">$49.00</span>
                <span className="ml-1 text-xl font-medium text-slate-500">/ month</span>
              </p>
              <ul className="mt-6 space-y-4 text-sm text-slate-600">
                <li className="flex items-center">✓ Full WhatsApp & SMS Order Automation</li>
                <li className="flex items-center">✓ Unlimited Product & SKU Catalog</li>
                <li className="flex items-center">✓ Tiered Fulfillment Engine (Biker & Freight)</li>
                <li className="flex items-center">✓ Web Portal Dashboard & CSV Ingestion</li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("MONTHLY")}
              disabled={loading !== null}
              className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50"
            >
              {loading === "MONTHLY" ? "Processing..." : "Subscribe Monthly"}
            </button>
          </div>

          {/* Annual Tier */}
          <div className="bg-white rounded-3xl p-8 border-2 border-indigo-600 shadow-sm flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
              Save 17%
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Best Value</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Annual Tier</h3>
              <p className="mt-4 flex items-baseline text-slate-900">
                <span className="text-5xl font-extrabold tracking-tight">$499.00</span>
                <span className="ml-1 text-xl font-medium text-slate-500">/ year</span>
              </p>
              <ul className="mt-6 space-y-4 text-sm text-slate-600">
                <li className="flex items-center">✓ Everything in Monthly Plan</li>
                <li className="flex items-center">✓ Custom WhatsApp Branding & Responses</li>
                <li className="flex items-center">✓ Priority 24/7 Support</li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("ANNUAL")}
              disabled={loading !== null}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50"
            >
              {loading === "ANNUAL" ? "Processing..." : "Subscribe Yearly"}
            </button>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            &larr; Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}