"use client";

import Link from "next/link";

export default function BillingReturnPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Processed!</h1>
        <p className="mt-2 text-slate-600 text-sm">
          Paynow is finalizing your payment status. Your subscription will activate automatically within a few moments.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}