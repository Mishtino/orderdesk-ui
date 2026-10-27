"use client";

import { useState } from "react";

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubscribe = async (planType: "MONTHLY" | "YEARLY") => {
    setLoadingPlan(planType);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "https://orderdesk-backend-9gu2.onrender.com/saas/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan_type: planType,
            organization_id: "123e4567-e89b-12d3-a456-426614174000",
            user_email: "supplier@vortex.co.zw",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to initiate subscription");
      }

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error("No payment URL returned from server.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            OrderDesk Platform Plans
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Automate your B2B inventory, WhatsApp orders, and inter-city freight. Pay securely via Paynow (EcoCash, OneMoney, InnBucks, Cards).
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Monthly Tier</h2>
              <p className="mt-2 text-slate-500 text-sm">Flexible month-to-month access</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900">$29.99</span>
                <span className="ml-2 text-slate-500 font-medium">/ month</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">✓</span> Full WhatsApp & SMS Order Automation
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">✓</span> Unlimited Product & SKU Catalog
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">✓</span> Tiered Fulfillment Engine (Biker & Freight)
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">✓</span> Web Portal Dashboard & CSV Ingestion
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("MONTHLY")}
              disabled={loadingPlan === "MONTHLY"}
              className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3.5 font-semibold transition disabled:opacity-50"
            >
              {loadingPlan === "MONTHLY" ? "Connecting Paynow..." : "Subscribe Monthly"}
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-indigo-600 shadow-md flex flex-col justify-between relative hover:shadow-lg transition">
            <span className="absolute -top-3.5 right-6 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
              Save 17%
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Annual Tier</h2>
              <p className="mt-2 text-slate-500 text-sm">Best value for growing distributors</p>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900">$299.00</span>
                <span className="ml-2 text-slate-500 font-medium">/ year</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">✓</span> Everything in Monthly Plan
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">✓</span> Dedicated Aisle Logistics Freight Priority
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">✓</span> Custom WhatsApp Branding & Responses
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-600 font-bold">✓</span> Priority 24/7 Support
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("YEARLY")}
              disabled={loadingPlan === "YEARLY"}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 font-semibold transition disabled:opacity-50"
            >
              {loadingPlan === "YEARLY" ? "Connecting Paynow..." : "Subscribe Yearly"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}