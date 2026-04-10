import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await api.fetchOrders();
        setOrders(data.map(o => ({
          id: o.order_id,
          customer: o.customer_name,
          email: o.customer_email,
          product: o.product_name,
          status: o.status,
          fitScore: o.fit_score,
          risk: o.return_risk,
          amount: `₹${o.amount.toLocaleString()}`,
          date: new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          img: o.image_url
        })));
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <div className="space-y-12 uppercase tracking-tight">
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface underline decoration-primary/20 decoration-4 underline-offset-8">Order Intelligence</h1>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-[0.2em] mt-6 leading-relaxed">Synthesis of fulfillment nodes, biometric fit indexes, and return logistics.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary !py-3 !px-6 !text-[10px] uppercase tracking-[0.2em] font-black group">
            <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-180">filter_list</span> Filters
          </button>
          <button className="btn-primary !py-3 !px-6 !text-[10px] uppercase tracking-[0.2em] font-black shadow-premium group">
            <span className="material-symbols-outlined text-base group-hover:translate-y-1 transition-transform">download</span> Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Orders', val: 8, icon: 'inventory', color: 'primary', trend: '+12%' },
          { label: 'Delivered', val: 3, icon: 'local_shipping', color: 'secondary', trend: 'Optimal Flow' },
          { label: 'Returns', val: 2, icon: 'assignment_return', color: 'error', trend: 'High Priority', trendColor: 'text-error' },
          { label: 'High Risk', val: 2, icon: 'analytics', color: 'tertiary', trend: 'Predictive Alert' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 flex flex-col justify-between shadow-premium hover:shadow-premium-hover transition-all min-h-[180px]">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center border border-${stat.color}/20 group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined text-xl text-${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              {stat.trend && <span className={`text-[9px] font-black ${stat.trendColor || 'text-secondary'} uppercase tracking-[0.25em] bg-surface-container-highest/10 px-2 py-1 rounded`}>{stat.trend}</span>}
            </div>
            <div className="space-y-1 mt-6">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-3xl font-headline font-black text-on-surface">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Order Table */}
      <div className="glass-card shadow-premium overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/10 border-b border-outline-variant/10">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Order Identifier</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Entity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Product Asset</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Operational State</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Biometric Accuracy</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-right">Valuation</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-container-highest/10 transition-all group">
                  <td className="px-8 py-6 font-headline font-black text-primary text-[13px] tracking-widest">{o.id}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest/20 border border-outline-variant/10 flex items-center justify-center text-[11px] font-black text-primary shadow-premium">
                        {o.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[13px] font-black text-on-surface uppercase tracking-tight">{o.customer}</p>
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{o.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 rounded-lg bg-surface-container-highest/20 border border-white/5 overflow-hidden shadow-premium shrink-0">
                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={o.img} alt={o.product} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-on-surface">{o.product}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-[0.2em] border ${
                      o.status === 'Delivered' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                      o.status === 'Returned' ? 'bg-error/10 text-error border-error/20' : 'bg-surface-container-highest/10 text-on-surface-variant border-outline-variant/10'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="flex items-center gap-3">
                          <span className="text-[11px] font-black text-on-surface tracking-widest">{o.fitScore}%</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            o.risk === 'Low' ? 'bg-secondary/10 text-secondary' : 
                            o.risk === 'High' ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'
                          }`}>Risk: {o.risk}</span>
                       </div>
                       <div className="h-1 w-32 bg-surface-container-highest/20 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${o.fitScore > 80 ? 'bg-secondary shadow-[0_0_8px_rgba(63,255,139,0.3)]' : o.fitScore > 50 ? 'bg-tertiary' : 'bg-error'} transition-all duration-1000`} style={{ width: `${o.fitScore}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-black font-headline text-on-surface text-base">{o.amount}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button className="w-10 h-10 rounded-lg bg-surface-container-highest/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all border border-outline-variant/10 hover:border-primary/30">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      <button className="w-10 h-10 rounded-lg bg-surface-container-highest/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all border border-outline-variant/10 hover:border-primary/30">
                        <span className="material-symbols-outlined text-lg">chat_bubble</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-outline-variant/10 bg-surface-container/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">Showing <span className="font-black text-on-surface">1-4</span> of <span className="font-black text-on-surface">8</span> identifiers</p>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-highest/10 text-on-surface-variant hover:text-primary transition-all disabled:opacity-20 border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-black text-[10px] shadow-premium shadow-primary/20">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-highest/10 font-black text-[10px] transition-all border border-transparent hover:border-outline-variant/10">2</button>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-highest/10 text-on-surface-variant hover:text-primary transition-all border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Part */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-card p-10 shadow-premium bg-gradient-to-br from-primary/5 via-transparent to-transparent flex flex-col">
          <div className="flex items-start gap-6 mb-10">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black uppercase tracking-tight text-on-surface">Predictive Precision Delta</h4>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Comparative analysis of AI fit prediction vs. biometric outcome.</p>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-5 h-40">
            {[60, 85, 45, 92, 98].map((h, i) => (
              <div key={i} className="flex-1 bg-surface-container-highest/20 rounded border border-white/5 relative group min-w-[40px]">
                <div className={`absolute bottom-0 left-0 right-0 ${i === 4 ? 'bg-gradient-to-t from-secondary shadow-[0_0_15px_rgba(63,255,139,0.3)]' : 'bg-primary/40 group-hover:bg-primary/60'} rounded transition-all duration-1000`} style={{ height: `${h}%` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h}% ACC</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[9px] text-on-surface-variant font-black uppercase tracking-[0.2em]">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span className="text-secondary">Fri (Live)</span>
          </div>
        </div>
        
        <div className="glass-card p-10 shadow-premium flex flex-col justify-between bg-gradient-to-br from-tertiary/5 via-transparent to-transparent">
          <div className="space-y-10">
            <h4 className="text-base font-black uppercase tracking-tight text-on-surface flex items-center gap-4">
              <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>contact_support</span>
              Protocol Operations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: 'mail_outline', label: 'Email Shipped', color: 'tertiary', desc: 'Notify asset departure' },
                { icon: 'barcode_scanner', label: 'Generate Labels', color: 'primary', desc: 'System logistics sync' },
                { icon: 'sync_alt', label: 'Process Return', color: 'secondary', desc: 'Verify biometric delta' },
                { icon: 'block', label: 'Flag Fraud', color: 'error', desc: 'Secure ledger integrity' },
              ].map(act => (
                <button key={act.label} className="flex items-center gap-5 p-5 bg-surface-container-highest/10 border border-outline-variant/10 rounded-xl hover:bg-surface-container-highest/30 transition-all group text-left">
                  <div className={`w-10 h-10 rounded-lg bg-${act.color}/10 border border-${act.color}/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-lg text-${act.color}`}>{act.icon}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-on-surface block mb-0.5">{act.label}</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter">{act.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
