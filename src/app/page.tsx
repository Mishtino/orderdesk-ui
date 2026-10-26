"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

interface Product {
  id: string;
  sku: string;
  title: string;
  stock_quantity: number;
  wholesale_price: number;
}

interface Order {
  id: string;
  client_name: string;
  status: string;
  total_amount: number;
  created_at?: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Production Render Backend URL
  const API_BASE_URL = "https://orderdesk-backend-9gu2.onrender.com";

  const fetchData = async () => {
    setLoading(true);

    try {
      const tokenRes = await axios.post(`${API_BASE_URL}/auth/token`, {
        user_id: "demo-admin",
        organization_id: "123e4567-e89b-12d3-a456-426614174000",
      });

      const token = tokenRes.data.access_token;
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [prodRes, orderRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/orders`, { headers: authHeaders }),
      ]);

      setProducts(prodRes.data.data || []);
      setOrders(orderRes.data.data || []);
    } catch (error) {
      console.error("Failed to connect to FastAPI engine:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const lowStockCount = products.filter((product) => product.stock_quantity <= 20).length;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
                OrderDesk Supplier Portal
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Real-time inventory orchestration
              </h1>
            </div>

            <button
              type="button"
              onClick={fetchData}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<TrendingUp className="h-5 w-5" />}
            accent="bg-emerald-100 text-emerald-700"
          />
          <MetricCard
            title="Total Orders"
            value={String(orders.length)}
            icon={<ShoppingBag className="h-5 w-5" />}
            accent="bg-blue-100 text-blue-700"
          />
          <MetricCard
            title="Active SKUs"
            value={String(products.length)}
            icon={<Package className="h-5 w-5" />}
            accent="bg-violet-100 text-violet-700"
          />
          <MetricCard
            title="Low Stock Alerts"
            value={String(lowStockCount)}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent="bg-amber-100 text-amber-700"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Live SKU Inventory</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <Plus className="h-3.5 w-3.5" />
                Inventory Sync
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{product.sku}</td>
                      <td className="px-4 py-3 text-slate-600">{product.title}</td>
                      <td className="px-4 py-3 text-slate-700">${product.wholesale_price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.stock_quantity <= 20
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {product.stock_quantity} units
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!products.length && !loading && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No products available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Recent Wholesale Orders</h2>

            <div className="mt-5 space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{order.client_name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "New order"}
                      </p>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 text-lg font-semibold text-slate-900">
                    ${Number(order.total_amount || 0).toFixed(2)}
                  </div>
                </div>
              ))}

              {!orders.length && !loading && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No orders placed yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded-2xl p-2 ${accent}`}>{icon}</div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
}