"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CsvUploader from "./components/CsvUploader";

interface Product {
  id: string;
  sku: string;
  title: string;
  category?: string;
  wholesale_price: number;
  stock_quantity: number;
  reorder_level: number;
  weight_kg: number;
}

interface Order {
  id: string;
  invoice_number?: string;
  client_name: string;
  client_email?: string;
  item_subtotal: number;
  shipping_fee: number;
  total_amount: number;
  status: string;
  payment_status: string;
  fulfillment_type: string;
  delivery_city: string;
  created_at?: string;
}

interface Customer {
  id: string;
  company_name: string;
  contact_email: string;
  phone_number: string;
  pricing_tier: string;
  discount_rate: number;
}

export default function SupplierDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingCustomer, setSubmittingCustomer] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"stock" | "customers" | "profile" | "users">("stock");
  const [userEmail, setUserEmail] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");

  // MULTI-CURRENCY & SEARCH STATES
  const [currency, setCurrency] = useState<"USD" | "ZiG">("USD");
  const [zigRate, setZigRate] = useState<number>(26.50);
  const [editingRate, setEditingRate] = useState<boolean>(false);
  const [rateInput, setRateInput] = useState<string>("26.50");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);

  // Customer Form State
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTier, setNewTier] = useState("STANDARD");
  const [newDiscount, setNewDiscount] = useState("0");

  useEffect(() => {
    const storedEmail = localStorage.getItem("orderdesk_user_email");
    const storedOrg = localStorage.getItem("orderdesk_org_name");

    if (!storedEmail) {
      router.push("/login");
    } else {
      setUserEmail(storedEmail);
      setOrgName(storedOrg || "Supplier Org");
      setAuthenticated(true);
      fetchDashboardData();
      fetchExchangeRate();
    }
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, custRes] = await Promise.all([
        fetch("https://orderdesk-backend-9gu2.onrender.com/products"),
        fetch("https://orderdesk-backend-9gu2.onrender.com/orders"),
        fetch("https://orderdesk-backend-9gu2.onrender.com/customers")
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const custData = await custRes.json();

      setProducts(prodData.data || []);
      setOrders(orderData.data || []);
      setCustomers(custData.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch("https://orderdesk-backend-9gu2.onrender.com/settings/rate");
      const data = await res.json();
      if (data.zig_exchange_rate) {
        setZigRate(data.zig_exchange_rate);
        setRateInput(data.zig_exchange_rate.toString());
      }
    } catch (err) {
      console.error("Failed to load exchange rate:", err);
    }
  };

  const handleSaveRate = async () => {
    const parsed = parseFloat(rateInput);
    if (!parsed || parsed <= 0) return;

    try {
      const res = await fetch("https://orderdesk-backend-9gu2.onrender.com/settings/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zig_exchange_rate: parsed })
      });
      if (res.ok) {
        setZigRate(parsed);
        setEditingRate(false);
      }
    } catch (err) {
      console.error("Failed to update rate:", err);
    }
  };

  const formatPrice = (usdAmount: number) => {
    if (currency === "ZiG") {
      const zigVal = usdAmount * zigRate;
      return `ZiG ${zigVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    const pipeline = ["PENDING", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED"];
    const currentIndex = pipeline.indexOf(currentStatus.toUpperCase());
    const nextStatus = pipeline[(currentIndex + 1) % pipeline.length];

    try {
      const res = await fetch(`https://orderdesk-backend-9gu2.onrender.com/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingCustomer) return;

    setSubmittingCustomer(true);
    try {
      const url = editingCustomer
        ? `https://orderdesk-backend-9gu2.onrender.com/customers/${editingCustomer.id}`
        : "https://orderdesk-backend-9gu2.onrender.com/customers";

      const method = editingCustomer ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: newCompany,
          contact_email: newEmail,
          phone_number: newPhone,
          pricing_tier: newTier,
          discount_rate: parseFloat(newDiscount) || 0.0
        })
      });

      if (res.ok) {
        setShowCustomerModal(false);
        setEditingCustomer(null);
        setNewCompany("");
        setNewEmail("");
        setNewPhone("");
        setNewDiscount("0");
        await fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to save customer:", err);
    } finally {
      setSubmittingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this retailer account?")) return;

    try {
      const res = await fetch(`https://orderdesk-backend-9gu2.onrender.com/customers/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  };

  const openEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setNewCompany(c.company_name);
    setNewEmail(c.contact_email);
    setNewPhone(c.phone_number || "");
    setNewTier(c.pricing_tier);
    setNewDiscount(c.discount_rate.toString());
    setShowCustomerModal(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem("orderdesk_user_email");
    localStorage.removeItem("orderdesk_org_name");
    router.push("/login");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-sm font-semibold">
        Redirecting to Supplier Login...
      </div>
    );
  }

  // SEARCH AND CATEGORY FILTER LOGIC
  const categories = Array.from(new Set(products.map((p) => p.category || "General")));
  
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || (p.category || "General") === filterCategory;
    const matchesLowStock = !showLowStockOnly || p.stock_quantity <= (p.reorder_level || 10);
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockItems = products.filter((p) => p.stock_quantity <= (p.reorder_level || 10));
  const ordersShipped = orders.filter((o) => o.status === "SHIPPED" || o.status === "DELIVERED").length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Trial Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-xs font-black uppercase px-2.5 py-1 rounded-md">
              Trial Active
            </span>
            <p className="text-xs sm:text-sm font-medium">
              Welcome, <strong className="font-bold">{orgName}</strong>! You are on the <strong className="font-bold">7-Day Free Trial</strong> (5 days remaining).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/billing"
              className="bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
            >
              Upgrade Plan via Paynow
            </Link>
            <button
              onClick={handleLogout}
              className="bg-black/20 hover:bg-black/40 text-white font-semibold text-xs px-3 py-2 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Feature #1 Multi-Currency Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
              Multi-Currency Engine
            </span>
            <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  currency === "USD" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("ZiG")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  currency === "ZiG" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                ZiG (Zimbabwe Gold)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Manual Rate:</span>
            {editingRate ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-20 px-2 py-1 rounded-lg text-slate-900 font-bold text-xs"
                />
                <button onClick={handleSaveRate} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-3 py-1 rounded-lg">
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <strong className="text-indigo-300 font-mono text-sm">1 USD = {zigRate.toFixed(2)} ZiG</strong>
                <button onClick={() => setEditingRate(true)} className="text-[11px] underline text-slate-400 hover:text-white">
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Low-Stock Alert Banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-sm print:hidden">
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-full animate-pulse">
                ⚠️ Low Stock Alert
              </span>
              <p className="text-xs sm:text-sm font-bold">
                {lowStockItems.length} SKU(s) dropped below threshold.
              </p>
            </div>
            <button
              onClick={() => {
                setShowLowStockOnly(true);
                setActiveTab("stock");
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap"
            >
              Filter Low Stock SKUs
            </button>
          </div>
        )}

        {/* Header Navigation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Image 
              src="/orderdesk-icon.svg" 
              alt="OrderDesk Icon" 
              width={48} 
              height={48} 
              className="h-12 w-12 object-contain hidden sm:block" 
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Supplier Portal Dashboard
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                OrderDesk Operations Center
              </h1>
            </div>
          </div>

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
              onClick={() => setActiveTab("customers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "customers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Customers & Price Tiers
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

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 print:hidden">
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
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Retail Buyers</span>
            <p className="text-3xl font-black text-indigo-600 mt-2">{customers.length}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low-Stock Warnings</span>
            <p className={`text-3xl font-black mt-2 ${lowStockItems.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {lowStockItems.length}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders Dispatched</span>
            <p className="text-3xl font-black text-blue-600 mt-2">{ordersShipped}</p>
          </div>
        </div>

        {/* Tab 1: Stock Management with Search & Filters */}
        {activeTab === "stock" && (
          <div className="space-y-6 print:hidden">
            
            {/* Feature #2 Search & Filter Control Bar */}
            <div className="bg-white rounded-3xl p-4 px-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search SKU or Product Title..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-indigo-600"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    showLowStockOnly ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {showLowStockOnly ? "Showing Low Stock Only" : "Filter Low Stock"}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Stock Table */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Live Stock Management</h2>
                  <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                    {filteredProducts.length} / {products.length} SKUs
                  </span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-500 text-sm font-medium">No products match your search/filter criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white border-b border-slate-100">
                        <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">SKU</th>
                          <th className="pb-3">Title</th>
                          <th className="pb-3">Price ({currency})</th>
                          <th className="pb-3 text-right">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map((p) => {
                          const isLow = p.stock_quantity <= (p.reorder_level || 10);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3 font-bold text-slate-900 text-xs">{p.sku}</td>
                              <td className="py-3 text-slate-700 text-xs font-medium">{p.title}</td>
                              <td className="py-3 font-bold text-slate-900 text-xs">{formatPrice(p.wholesale_price)}</td>
                              <td className="py-3 text-right">
                                <span
                                  className={`text-xs px-2.5 py-1 rounded-full font-extrabold ${
                                    isLow ? "bg-red-100 text-red-700 animate-pulse" : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {p.stock_quantity} units
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Wholesale Pipeline */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
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
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white border-b border-slate-100">
                        <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">Invoice</th>
                          <th className="pb-3">Client</th>
                          <th className="pb-3">Total ({currency})</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((o) => {
                          const statusColors: Record<string, string> = {
                            PENDING: "bg-amber-100 text-amber-800",
                            CONFIRMED: "bg-blue-100 text-blue-800",
                            PACKED: "bg-purple-100 text-purple-800",
                            DISPATCHED: "bg-indigo-100 text-indigo-800",
                            DELIVERED: "bg-emerald-100 text-emerald-800",
                          };

                          return (
                            <tr key={o.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3 font-mono font-bold text-slate-800 text-xs">
                                {o.invoice_number || "INV-109012"}
                              </td>
                              <td className="py-3 font-bold text-slate-900 text-xs">{o.client_name}</td>
                              <td className="py-3 font-bold text-slate-900 text-xs">{formatPrice(o.total_amount)}</td>
                              <td className="py-3">
                                <button
                                  onClick={() => handleStatusChange(o.id, o.status)}
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm transition hover:scale-105 ${
                                    statusColors[o.status.toUpperCase()] || "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {o.status} →
                                </button>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => setSelectedInvoice(o)}
                                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition shadow-sm"
                                >
                                  PDF Invoice
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Retailer Accounts */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 print:hidden">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Retailer Accounts & Wholesale Price Tiers</h2>
                <p className="text-xs text-slate-500">Manage buyer discounts, edit contact details, or remove accounts.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setNewCompany("");
                  setNewEmail("");
                  setNewPhone("");
                  setNewTier("STANDARD");
                  setNewDiscount("0");
                  setShowCustomerModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                + Register Retail Customer
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Company Name</th>
                    <th className="pb-3">Contact Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Pricing Tier</th>
                    <th className="pb-3">Tier Discount</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const tierColors: Record<string, string> = {
                      STANDARD: "bg-slate-100 text-slate-800",
                      BULK_BUYER: "bg-blue-100 text-blue-800",
                      VIP: "bg-purple-100 text-purple-800",
                    };

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 font-bold text-slate-900">{c.company_name}</td>
                        <td className="py-3 text-xs text-slate-600">{c.contact_email}</td>
                        <td className="py-3 text-xs text-slate-500">{c.phone_number || "N/A"}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${tierColors[c.pricing_tier] || "bg-slate-100"}`}>
                            {c.pricing_tier}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-emerald-600">
                          {c.discount_rate}% Off Catalog
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => openEditCustomer(c)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-2xl space-y-4 print:hidden">
            <h2 className="text-xl font-bold text-slate-900">Supplier Profile</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p><strong>Organization Name:</strong> {orgName}</p>
              <p><strong>Account Email:</strong> {userEmail}</p>
              <p><strong>Subscription Status:</strong> 7-Day Free Trial Active</p>
              <p><strong>Exchange Rate:</strong> 1 USD = {zigRate.toFixed(2)} ZiG</p>
            </div>
            <Link
              href="/billing"
              className="inline-block bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl mt-4 hover:bg-indigo-700 transition"
            >
              Manage SaaS Billing & Subscription
            </Link>
          </div>
        )}

        {/* Tab 4: Users */}
        {activeTab === "users" && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm max-w-2xl space-y-4 print:hidden">
            <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500">Manage team seats and permissions for your supplier organization.</p>
            <div className="p-4 bg-slate-50 rounded-2xl text-xs font-mono text-slate-800">
              • {userEmail} (Owner / Primary Admin)
            </div>
          </div>
        )}

      </div>

      {/* PDF Invoice Modal with Multi-Currency Display */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl border border-slate-200 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Image src="/orderdesk-icon.svg" alt="Logo" width={32} height={32} />
                <span className="font-extrabold text-slate-900 text-lg">OrderDesk PDF Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div id="printable-invoice" className="space-y-6 text-slate-800 font-sans p-2">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{orgName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Wholesale & Logistics Supplier Portal</p>
                  <p className="text-xs text-slate-500">{userEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">TAX INVOICE ({currency})</span>
                  <h3 className="text-lg font-mono font-black text-slate-900 mt-1">
                    {selectedInvoice.invoice_number || "INV-109012"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Date: {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">BILLED TO</span>
                  <p className="font-bold text-slate-900 text-sm mt-1">{selectedInvoice.client_name}</p>
                  <p className="text-slate-500">{selectedInvoice.client_email || "client@orderdesk.co.zw"}</p>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">FULFILLMENT LOGISTICS</span>
                  <p className="font-bold text-slate-900 mt-1">{selectedInvoice.fulfillment_type}</p>
                  <p className="text-slate-500">Destination: {selectedInvoice.delivery_city}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 font-bold text-slate-800">Wholesale Goods Shipment Bundle</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{formatPrice(selectedInvoice.item_subtotal)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-600">Aisle Freight / Express Courier Fee</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{formatPrice(selectedInvoice.shipping_fee)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center border-t-2 border-slate-200 pt-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PAYMENT STATUS</span>
                  <div className="mt-1">
                    <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full uppercase">
                      {selectedInvoice.payment_status || "PAID"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL DUE ({currency})</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{formatPrice(selectedInvoice.total_amount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-xl relative">
            <button
              onClick={() => setShowCustomerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingCustomer ? "Edit Retailer Account" : "Register Retail Customer Account"}
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Ruwa Express Mart"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Contact Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="manager@ruwamart.co.zw"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+263771112233"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Wholesale Price Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white font-bold"
                >
                  <option value="STANDARD">STANDARD (0% Discount)</option>
                  <option value="BULK_BUYER">BULK_BUYER (5% Discount)</option>
                  <option value="VIP">VIP (10% Discount)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Custom Discount (%)</label>
                <input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={submittingCustomer}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-md mt-2 disabled:opacity-50"
              >
                {submittingCustomer ? "Saving Account..." : editingCustomer ? "Update Account" : "Create Customer Account"}
              </button>
            </form>
          </div>
        </div>
      )}

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