"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

type Product = { id: string; sku: string; title: string; wholesale_price: number | string; stock_quantity: number };
type Order = { id: string; invoice_number?: string; client_name: string; status: string; total_amount: number | string; created_at: string };

export default function BuyerDashboard() {
  const router = useRouter();
  const [buyer, setBuyer] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ sku: string; title: string; price: number; qty: number }[]>([]);
  const [tab, setTab] = useState<"catalog" | "cart" | "orders">("catalog");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    try {
      const me = await fetch(`${API_BASE}/buyer/auth/me`, { credentials: "include" }).then((r) => r.json());
      if (!me || me.status !== "success") throw new Error("not auth");
      setBuyer(me);
      const [p, o] = await Promise.all([
        fetch(`${API_BASE}/buyer/products`, { credentials: "include" }).then((r) => r.json()),
        fetch(`${API_BASE}/buyer/orders`, { credentials: "include" }).then((r) => r.json()),
      ]);
      setProducts(p.data || []);
      setOrders(o.data || []);
    } catch {
      router.push("/buyer/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addToCart = (p: Product) => {
    const price = typeof p.wholesale_price === "number" ? p.wholesale_price : parseFloat(p.wholesale_price);
    setCart((c) => {
      const existing = c.find((x) => x.sku === p.sku);
      if (existing) return c.map((x) => (x.sku === p.sku ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { sku: p.sku, title: p.title, price, qty: 1 }];
    });
  };

  const placeOrder = async () => {
    setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/buyer/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          client_name: buyer.company_name,
          client_email: buyer.email,
          fulfillment_type: "PICKUP",
          shipping_fee: 0,
          currency: "USD",
          items: cart.map((c) => ({ sku: c.sku, title: c.title, quantity: c.qty, unit_price: c.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Order failed");
      setMsg("Order placed successfully!");
      setCart([]);
      setTab("orders");
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const downloadInvoice = async (id: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}/invoice`, { credentials: "include" });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `invoice-${id}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading…</div>;

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-white">Buyer Portal</h1>
          <p className="text-xs text-slate-500">{buyer?.company_name} · {buyer?.email}</p>
        </div>
        <div className="flex gap-2">
          {(["catalog", "cart", "orders"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${tab === t ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              {t === "cart" ? `Cart (${cart.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <button onClick={async () => { await fetch(`${API_BASE}/buyer/auth/logout`, { method: "POST", credentials: "include" }); window.location.href = "/buyer/login"; }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-red-300">Logout</button>
        </div>
      </header>

      <main className="p-6">
        {msg && <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 rounded-xl text-xs">{msg}</div>}

        {tab === "catalog" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="font-mono text-xs text-indigo-300">{p.sku}</p>
                <h3 className="font-bold text-white mt-1">{p.title}</h3>
                <p className="text-lg font-black text-white mt-2">${typeof p.wholesale_price === "number" ? p.wholesale_price.toFixed(2) : parseFloat(p.wholesale_price).toFixed(2)}</p>
                <p className="text-xs text-slate-500">Stock: {p.stock_quantity}</p>
                <button onClick={() => addToCart(p)} className="mt-3 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">Add to Cart</button>
              </div>
            ))}
          </div>
        )}

        {tab === "cart" && (
          <div className="max-w-2xl">
            {cart.length === 0 ? <p className="text-slate-500">Your cart is empty.</p> : (
              <>
                <div className="space-y-2 mb-4">
                  {cart.map((c) => (
                    <div key={c.sku} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-semibold text-white">{c.title}</p>
                        <p className="text-xs text-slate-500">{c.sku} · ${c.price.toFixed(2)} × {c.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCart((x) => x.map((i) => (i.sku === c.sku ? { ...i, qty: Math.max(1, i.qty - 1) } : i)))} className="px-2 py-1 bg-white/5 rounded">-</button>
                        <span className="text-sm">{c.qty}</span>
                        <button onClick={() => setCart((x) => x.map((i) => (i.sku === c.sku ? { ...i, qty: i.qty + 1 } : i)))} className="px-2 py-1 bg-white/5 rounded">+</button>
                        <button onClick={() => setCart((x) => x.filter((i) => i.sku !== c.sku))} className="text-xs text-red-300">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-white">Total: ${cartTotal.toFixed(2)}</p>
                  <button onClick={placeOrder} className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold text-sm transition">Place Order</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <tr><th className="text-left px-4 py-3">Invoice</th><th className="text-left px-4 py-3">Status</th><th className="text-right px-4 py-3">Total</th><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Actions</th></tr>
              </thead>
              <tbody>
                {orders.length === 0 ? <tr><td colSpan={5} className="text-center py-10 text-slate-500">No orders yet.</td></tr> : orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-300">{o.invoice_number || o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300">{o.status}</span></td>
                    <td className="px-4 py-3 text-right font-bold text-white">${typeof o.total_amount === "number" ? o.total_amount.toFixed(2) : parseFloat(o.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><button onClick={() => downloadInvoice(o.id)} className="text-xs font-bold text-indigo-300 hover:text-indigo-200">PDF Invoice</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

