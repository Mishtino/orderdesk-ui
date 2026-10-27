"use client";

import { useState, useEffect } from "react";
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
  fulfillment_type: string;
  delivery_city: string;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);

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

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const activeSKUs = products.length;
  const lowStockAlerts = products.filter((p) => p.stock_quantity < 5).length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              OrderDesk Supplier Portal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Real-time inventory orchestration
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCsvModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm text-sm"
            >
              + Bulk Upload CSV
            </button>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh Data"}
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <p className="text-3xl font-black text-slate-900 mt-2">${totalRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <p className="text-3xl font-black text-slate-900 mt-2">{orders.length}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active SKUs</span>
            <p className="text-3xl font-black text-slate-900 mt-2">{activeSKUs}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Alerts</span>
            <p className={`text-3xl font-black mt-2 ${lowStockAlerts > 0 ? "text-amber-600" : "text-slate-900"}`}>
              {lowStockAlerts}
            </p>
          </div>
        </div>

        {/* Data Tables Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* SKU Inventory Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Live SKU Inventory</h2>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                {products.length} Items
              </span>
            </div>

            {products.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 text-sm font-medium">No products available yet.</p>
                <button
                  onClick={() => setShowCsvModal(true)}
                  className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
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
                        <td className="py-3.5 font-bold text-slate-900">{p.sku}</td>
                        <td className="py-3.5 text-slate-600">{p.title}</td>
                        <td className="py-3.5 font-semibold text-slate-900">${p.wholesale_price.toFixed(2)}</td>
                        <td className="py-3.5 text-right font-bold">
                          <span className={p.stock_quantity < 5 ? "text-amber-600" : "text-slate-900"}>
                            {p.stock_quantity} units
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Wholesale Orders Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Wholesale Orders</h2>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                {orders.length} Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 text-sm font-medium">No orders placed yet.</p>
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
                        <td className="py-3.5 font-bold text-slate-900">{o.client_name}</td>
                        <td className="py-3.5 text-xs text-slate-500">
                          {o.fulfillment_type} ({o.delivery_city})
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900">${o.total_amount.toFixed(2)}</td>
                        <td className="py-3.5 text-right">
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