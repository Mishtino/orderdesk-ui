"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, apiJson } from "@/lib/api";
import CsvUploader from "./components/CsvUploader";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Upload, RefreshCw, DollarSign, TrendingUp, Boxes, Search, X } from "lucide-react";
type Product={id:string;sku:string;title:string;category?:string;wholesale_price:number|string;stock_quantity:number};
type Order={id:string;invoice_number?:string;client_name:string;status:string;total_amount:number|string;created_at:string;payment_status?:string};
type Customer={id:string;company_name:string;contact_email:string;phone_number?:string;pricing_tier:string;discount_rate?:number|string};
const fmt=(v:any)=>(typeof v==="number"?v:parseFloat(v||0)).toFixed(2);
export default function DashboardPage(){
 const router=useRouter();
 const [tab,setTab]=useState<"overview"|"products"|"orders"|"customers"|"settings">("overview");
 const [user,setUser]=useState<any>(null);
 const [products,setProducts]=useState<Product[]>([]);
 const [orders,setOrders]=useState<Order[]>([]);
 const [customers,setCustomers]=useState<Customer[]>([]);
 const [rate,setRate]=useState(26.5);
 const [loading,setLoading]=useState(true);
 const [refreshing,setRefreshing]=useState(false);
 const [showCsv,setShowCsv]=useState(false);
 const [search,setSearch]=useState("");
 const [newCust,setNewCust]=useState({company_name:"",contact_email:"",phone_number:"",pricing_tier:"STANDARD",discount_rate:0});
 const [custMsg,setCustMsg]=useState<string|null>(null);
 const [rateInput,setRateInput]=useState("");
 const [rateMsg,setRateMsg]=useState<string|null>(null);
 const fetchAll=async()=>{
  setRefreshing(true);
  try{
   const [p,o,c,r]=await Promise.all([
    apiJson<{data:Product[]}>("/products"),
    apiJson<{data:Order[]}>("/orders"),
    apiJson<{data:Customer[]}>("/customers"),
    apiJson<{zig_exchange_rate:number}>("/settings/rate"),
   ]);
   setProducts(p.data||[]);setOrders(o.data||[]);setCustomers(c.data||[]);
   setRate(r.zig_exchange_rate||26.5);setRateInput(String(r.zig_exchange_rate||26.5));
  }catch(e:any){if(String(e.message).includes("401"))router.push("/login");}
  finally{setRefreshing(false);setLoading(false);}
 };
 useEffect(()=>{(async()=>{try{const me=await apiJson<any>("/auth/me");setUser(me);await fetchAll();}catch{router.push("/login");}})();},[]);
 const handleLogout=async()=>{try{await fetch(`${API_BASE}/auth/logout`,{method:"POST",credentials:"include"});}catch{}router.push("/login");};
 const createCustomer=async(e:React.FormEvent)=>{e.preventDefault();setCustMsg(null);try{await apiJson("/customers",{method:"POST",body:JSON.stringify(newCust)});setCustMsg("Customer created.");setNewCust({company_name:"",contact_email:"",phone_number:"",pricing_tier:"STANDARD",discount_rate:0});fetchAll();}catch(err:any){setCustMsg(err.message);}};
 const updateRate=async(e:React.FormEvent)=>{e.preventDefault();setRateMsg(null);try{const r=await apiJson<any>("/settings/rate",{method:"POST",body:JSON.stringify({zig_exchange_rate:parseFloat(rateInput)})});setRate(r.zig_exchange_rate);setRateMsg("Updated.");}catch(err:any){setRateMsg(err.message);}};
 const revenue=orders.reduce((s,o)=>s+parseFloat(String(o.total_amount||0)),0);
 const lowStock=products.filter(p=>(p.stock_quantity||0)<=10).length;
 const fp=products.filter(p=>(p.title+p.sku+(p.category||"")).toLowerCase().includes(search.toLowerCase()));
 const fo=orders.filter(o=>(o.client_name+(o.invoice_number||"")+o.status).toLowerCase().includes(search.toLowerCase()));
 const fc=customers.filter(c=>(c.company_name+c.contact_email+(c.phone_number||"")).toLowerCase().includes(search.toLowerCase()));
 if(loading)return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin"/></div>;
 const nav=[{k:"overview",l:"Overview",i:LayoutDashboard},{k:"products",l:"Products",i:Package},{k:"orders",l:"Orders",i:ShoppingCart},{k:"customers",l:"Customers",i:Users},{k:"settings",l:"Settings",i:Settings}] as const;
 return (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex">
   <aside className="hidden md:flex w-60 bg-slate-900/80 border-r border-white/5 flex-col">
    <div className="p-5 border-b border-white/5 flex items-center gap-3">
     <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg"><Boxes className="w-5 h-5 text-white"/></div>
     <div><p className="font-black text-white text-sm leading-none">OrderDesk</p><p className="text-[10px] text-slate-500 mt-1">B2B Engine</p></div>
    </div>
    <nav className="flex-1 p-3 space-y-1">
     {nav.map(n=>{const Icon=n.i;const active=tab===n.k;return(
      <button key={n.k} onClick={()=>{setTab(n.k);setSearch("");}}
       className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${active?"bg-gradient-to-r from-indigo-600/80 to-fuchsia-600/60 text-white shadow":"text-slate-400 hover:text-white hover:bg-white/5"}`}>
       <Icon className="w-4 h-4"/>{n.l}
      </button>
     );})}
    </nav>
    <div className="p-4 border-t border-white/5">
     <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-black">{(user?.organization_name||"O").charAt(0).toUpperCase()}</div>
      <div className="min-w-0"><p className="text-xs font-bold text-white truncate">{user?.organization_name||"Organization"}</p><p className="text-[10px] text-slate-500 truncate">{user?.email}</p></div>
     </div>
     <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition"><LogOut className="w-3.5 h-3.5"/>Sign out</button>
    </div>
   </aside>
   <main className="flex-1 min-w-0">
    <header className="sticky top-0 z-20 bg-slate-950/70 backdrop-blur border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-3">
     <div className="flex-1"><h1 className="text-lg font-black text-white capitalize">{tab}</h1></div>
     <div className="relative hidden sm:block">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
       className="pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"/>
     </div>
     <button onClick={fetchAll} disabled={refreshing} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition disabled:opacity-50">
      <RefreshCw className={`w-4 h-4 ${refreshing?"animate-spin":""}`}/>
     </button>
    </header>
    <div className="p-4 sm:p-6 space-y-6">
     {tab==="overview" && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
       {[
        {label:"Total Revenue",value:`$${revenue.toFixed(2)}`,icon:DollarSign,gradient:"from-emerald-500 to-teal-600",sub:`${orders.length} orders`},
        {label:"Products",value:products.length,icon:Package,gradient:"from-indigo-500 to-blue-600",sub:`${lowStock} low stock`},
        {label:"Customers",value:customers.length,icon:Users,gradient:"from-fuchsia-500 to-pink-600",sub:"B2B clients"},
        {label:"ZiG Rate",value:rate.toFixed(2),icon:TrendingUp,gradient:"from-amber-500 to-orange-600",sub:"per 1 USD"},
       ].map(card=>{const Icon=card.icon;return(
        <div key={card.label} className="relative overflow-hidden rounded-2xl p-5 bg-white/5 border border-white/10 backdrop-blur">
         <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-20 blur-2xl`}/>
         <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}><Icon className="w-4 h-4 text-white"/></div>
         </div>
         <p className="text-2xl font-black text-white">{card.value}</p>
         <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
        </div>
       );})}
      </div>
     )}

     {tab==="products" && (
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
       <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-bold text-white">Products ({fp.length})</h2>
        <button onClick={()=>setShowCsv(true)} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition"><Upload className="w-3.5 h-3.5"/>Upload CSV</button>
       </div>
       <div className="overflow-x-auto">
        <table className="w-full text-sm">
         <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider"><tr><th className="text-left px-4 py-3">SKU</th><th className="text-left px-4 py-3">Title</th><th className="text-left px-4 py-3">Category</th><th className="text-right px-4 py-3">Price</th><th className="text-right px-4 py-3">Stock</th></tr></thead>
         <tbody>
          {fp.length===0?<tr><td colSpan={5} className="text-center py-10 text-slate-500">No products.</td></tr>:fp.map(p=>(
           <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 transition">
            <td className="px-4 py-3 font-mono text-xs text-indigo-300">{p.sku}</td>
            <td className="px-4 py-3 font-semibold text-white">{p.title}</td>
            <td className="px-4 py-3 text-slate-400">{p.category||"General"}</td>
            <td className="px-4 py-3 text-right text-white">${fmt(p.wholesale_price)}</td>
            <td className="px-4 py-3 text-right"><span className={`font-bold ${(p.stock_quantity||0)<=10?"text-red-300":"text-emerald-300"}`}>{p.stock_quantity}</span></td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </div>
     )}

     {tab==="orders" && (
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
       <div className="p-4 border-b border-white/5"><h2 className="font-bold text-white">Orders ({fo.length})</h2></div>
       <div className="overflow-x-auto">
        <table className="w-full text-sm">
         <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider"><tr><th className="text-left px-4 py-3">Invoice</th><th className="text-left px-4 py-3">Client</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Payment</th><th className="text-right px-4 py-3">Total</th><th className="text-left px-4 py-3">Date</th></tr></thead>
         <tbody>
          {fo.length===0?<tr><td colSpan={6} className="text-center py-10 text-slate-500">No orders.</td></tr>:fo.map(o=>(
           <tr key={o.id} className="border-t border-white/5 hover:bg-white/5 transition">
            <td className="px-4 py-3 font-mono text-xs text-indigo-300">{o.invoice_number||o.id.slice(0,8)}</td>
            <td className="px-4 py-3 font-semibold text-white">{o.client_name}</td>
            <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status==="COMPLETED"||o.status==="PAID"?"bg-emerald-500/20 text-emerald-300":o.status==="PENDING"?"bg-amber-500/20 text-amber-300":"bg-slate-500/20 text-slate-300"}`}>{o.status}</span></td>
            <td className="px-4 py-3 text-slate-400 text-xs">{o.payment_status||"—"}</td>
            <td className="px-4 py-3 text-right font-bold text-white">${fmt(o.total_amount)}</td>
            <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </div>
     )}

     {tab==="customers" && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
       <div className="lg:col-span-1 rounded-2xl bg-white/5 border border-white/10 p-5">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400"/>New Customer</h2>
        <form onSubmit={createCustomer} className="space-y-3">
         <input value={newCust.company_name} onChange={e=>setNewCust({...newCust,company_name:e.target.value})} placeholder="Company name" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
         <input value={newCust.contact_email} onChange={e=>setNewCust({...newCust,contact_email:e.target.value})} placeholder="contact@email.com" type="email" required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
         <input value={newCust.phone_number} onChange={e=>setNewCust({...newCust,phone_number:e.target.value})} placeholder="Phone (optional)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
         <div className="grid grid-cols-2 gap-2">
          <select value={newCust.pricing_tier} onChange={e=>setNewCust({...newCust,pricing_tier:e.target.value})} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
           <option value="STANDARD">Standard</option><option value="PREMIUM">Premium</option><option value="VIP">VIP</option>
          </select>
          <input value={newCust.discount_rate} onChange={e=>setNewCust({...newCust,discount_rate:parseFloat(e.target.value)||0})} placeholder="Discount %" type="number" min={0} max={100} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
         </div>
         <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition">Create Customer</button>
         {custMsg && <p className={`text-xs font-semibold ${custMsg.includes("success")?"text-emerald-300":"text-red-300"}`}>{custMsg}</p>}
        </form>
       </div>
       <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/5"><h2 className="font-bold text-white">Customers ({fc.length})</h2></div>
        <div className="overflow-x-auto">
         <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider"><tr><th className="text-left px-4 py-3">Company</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Phone</th><th className="text-left px-4 py-3">Tier</th><th className="text-right px-4 py-3">Discount</th></tr></thead>
          <tbody>
           {fc.length===0?<tr><td colSpan={5} className="text-center py-10 text-slate-500">No customers.</td></tr>:fc.map(c=>(
            <tr key={c.id} className="border-t border-white/5 hover:bg-white/5 transition">
             <td className="px-4 py-3 font-semibold text-white">{c.company_name}</td>
             <td className="px-4 py-3 text-slate-400 text-xs">{c.contact_email}</td>
             <td className="px-4 py-3 text-slate-400 text-xs">{c.phone_number||"—"}</td>
             <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">{c.pricing_tier}</span></td>
             <td className="px-4 py-3 text-right text-slate-300">{c.discount_rate||0}%</td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       </div>
      </div>
     )}

     {tab==="settings" && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
       <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-400"/>ZiG Exchange Rate</h2>
        <p className="text-xs text-slate-400 mb-4">Set how many ZiG equal 1 USD.</p>
        <form onSubmit={updateRate} className="flex gap-2">
         <input value={rateInput} onChange={e=>setRateInput(e.target.value)} type="number" step="0.0001" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
         <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition">Save</button>
        </form>
        {rateMsg && <p className={`text-xs font-semibold mt-2 ${rateMsg.includes("Updated")?"text-emerald-300":"text-red-300"}`}>{rateMsg}</p>}
        <p className="text-xs text-slate-500 mt-3">Current: 1 USD = {rate.toFixed(4)} ZiG</p>
       </div>
       <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400"/>Subscription & Billing</h2>
        <p className="text-xs text-slate-400 mb-4">Manage your SaaS plan via Paynow.</p>
        <a href="/billing" className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold text-sm transition">Open Billing Portal</a>
        <p className="text-[10px] text-slate-500 text-center mt-2">EcoCash, OneMoney, InnBucks & cards.</p>
       </div>
       <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-5">
        <h2 className="font-bold text-white mb-2">Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
         <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-slate-500 uppercase tracking-wider">Organization</p><p className="font-semibold text-white">{user?.organization_name}</p></div>
         <div className="p-3 rounded-xl bg-white/5"><p className="text-[10px] text-slate-500 uppercase tracking-wider">Email</p><p className="font-semibold text-white">{user?.email}</p></div>
        </div>
       </div>
      </div>
     )}
    </div>
   </main>
   {showCsv && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
     <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative">
      <button onClick={()=>setShowCsv(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/5 text-slate-400"><X className="w-4 h-4"/></button>
      <CsvUploader onSuccess={()=>{setShowCsv(false);fetchAll();}}/>
     </div>
    </div>
   )}
  </div>
 );
}

