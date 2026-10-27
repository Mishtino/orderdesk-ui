"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CsvUploader from "./components/CsvUploader";

interface Product {
  id: string;
  sku: string;
  title: string;
  wholesale_price: number;
  stock_quantity: number;
  weight_kg: number;
}

interface Order {
  id: string;
  client_name: string;
  total_amount: number;
  shipping_fee: number;
  status: string;
  payment_status: string;
  fulfillment_type: string;
  delivery_city: string;
}

export default function SupplierDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"stock" | "profile" | "users">("stock");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        fetch("https://orderdesk-backend-9gu2.onrender.com/products"),
        fetch("https://orderdesk-backend-9gu2.onrender.com/orders")
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();

      setProducts(prodData.data || []);
      setOrders(orderData.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const ordersPlaced = orders.length;
  const ordersPaid = orders.filter((o) => o.payment_status === "PAID").length;
  const ordersShipped = orders.filter((o) => o.status === "SHIPPED" || o.status === "COLLECTED").length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 7-Day Free Trial Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-xs font-black uppercase px-2.5 py-1 rounded-md">
              Trial Active
            </span>
            <p className="text-xs sm:text-sm font-medium">
              You are currently on the <strong className="font-bold">7-Day Free Trial</strong>. 5 days remaining.
            </p>
          </div>
          <Link
            href="/billing"
            className="bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
          >
            Upgrade Plan via Paynow
          </Link>
        </div>

        {/* Header & Main Navigation Menu */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Supplier Portal Dashboard
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              OrderDesk Operations Center
            </h1>
          </div>

          {/* Diagram Main Menu Navigation */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab("stock")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "stock" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Stock Management
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "users" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {/* Diagram Order Pipeline Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => setShowCsvModal(true)}
            className="bg-indigo-50 hover:bg-indigo-100/80 cursor-pointer rounded-3xl p-6 border border-indigo-200 transition shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Quick Action</span>
              <p className="text-lg font-black text-indigo-900 mt-2">Upload CSV for Inventories</p>
            </div>
            <span className="text-xs text-indigo-600 font-semibold mt-4">+ Click to import catalog</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders Placed</span>
            <p className="text-3xl font-black text-slate-900 mt-2">{ordersPlaced}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders Paid</span>
            <p className="text-3xl font-black text-emerald-600 mt-2">{ordersPaid}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected / Shipped</span>
            <p className="text-3xl font-black text-blue-600 mt-2">{ordersShipped}</p>
          </div>
        </div>

        {/* Dynamic Views matching Main Menu */}
        {activeTab === "stock" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Live Stock Management</h2>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                  {products.length} SKUs
                </span>
              </div>

              {products.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-500 text-sm font-medium">No stock registered yet.</p>
                  <button
                    onClick={() => setShowCsvModal(true)}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Upload CSV Spreadsheet
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">SKU</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3 text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 font-bold text-slate-900">{p.sku}</td>
                          <td className="py-3 text-slate-600">{p.title}</td>
                          <td className="py-3 font-semibold text-slate-900">${p.wholesale_price.toFixed(2)}</td>
                          <td className="py-3 text-right font-bold text-slate-900">{p.stock_quantity} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Wholesale Orders Pipeline</h2>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                  {orders.length} Total
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-500 text-sm font-medium">No orders received yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Client</th>
                        <th className="pb-3">Fulfillment</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 font-bold text-slate-900">{o.client_name}</td>
                          <td className="py-3 text-xs text-slate-500">{o.fulfillment_type} ({o.delivery_city})</td>
                          <td className="py-3 font-semibold text-slate-900">${o.total_amount.toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Supplier Profile</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p><strong>Organization:</strong> Vortex Technologies Demo</p>
              <p><strong>Plan Status:</strong> 7-Day Free Trial Active</p>
              <p><strong>Paynow Integration:</strong> Enabled</p>
            </div>
            <Link
              href="/billing"
              className="inline-block bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl mt-4 hover:bg-indigo-700 transition"
            >
              Manage SaaS Billing & Subscription
            </Link>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500">Manage team seats and access permissions for your supplier organization.</p>
            <div className="p-4 bg-slate-50 rounded-2xl text-xs font-mono text-slate-800">
              • misheck@vortextech.co.zw (Owner / CEO)
            </div>
          </div>
        )}

      </div>

      {/* CSV Uploader Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-xl relative">
            <button
              onClick={() => setShowCsvModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>
            <CsvUploader
              onSuccess={() => {
                setShowCsvModal(false);
                fetchDashboardData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}