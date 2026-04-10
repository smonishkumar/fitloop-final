import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await api.fetchAnalyticsSummary();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-12 uppercase tracking-tight">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-on-surface underline decoration-primary/20 decoration-4 underline-offset-8">Comprehensive Synthesis</h1>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-[0.2em] mt-6 leading-relaxed">Multidimensional analysis of biometric fit accuracy and performance modules.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-surface-container-highest/10 rounded-xl p-1.5 border border-outline-variant/10 shadow-premium">
            {['Last 30 Days', 'Last Quarter', 'YTD'].map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeRange === range 
                    ? 'bg-primary text-on-primary shadow-premium' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="btn-secondary !py-3 !px-6 !text-[10px] uppercase font-black tracking-widest group">
            <span className="material-symbols-outlined text-lg group-hover:translate-y-[-2px] transition-transform">ios_share</span>
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {(analytics?.kpis || [
          { label: 'Try-On Dynamics', value: '403K', icon: 'gesture', change: '+12.4%', color: 'primary' },
          { label: 'Returns Optimized', value: '28.6K', icon: 'restart_alt', change: '+8.2%', color: 'secondary' },
          { label: 'Capital Traction', value: '₹2.4Cr', icon: 'payments', change: '+18.9%', color: 'tertiary' },
          { label: 'Volatility Delta', value: '9.8%', icon: 'assignment_return', change: '-2.4%', color: 'error', down: true },
        ]).map((kpi) => (
          <div key={kpi.label} className="glass-card p-8 relative overflow-hidden group shadow-premium hover:shadow-premium-hover transition-all min-h-[180px] flex flex-col justify-between">
            <div className={`absolute -right-4 -bottom-4 w-32 h-32 bg-${kpi.color}/5 rounded-full blur-3xl group-hover:bg-${kpi.color}/10 transition-all duration-1000`}></div>
            <div className="flex justify-between items-start mb-6 z-10">
              <div className={`w-12 h-12 rounded-lg bg-${kpi.color}/10 border border-${kpi.color}/20 flex items-center justify-center text-${kpi.color}`}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
              </div>
              <span className={`${kpi.down ? 'text-error' : 'text-secondary'} text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-surface-container-highest/10 px-2 py-1 rounded`}>
                <span className="material-symbols-outlined text-sm">{kpi.down ? 'trending_down' : 'trending_up'}</span> {kpi.change}
              </span>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{kpi.label}</p>
              <h3 className="text-3xl font-black font-headline text-on-surface">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Trends Chart */}
      <div className="glass-card p-10 shadow-premium relative bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <h4 className="text-lg font-black uppercase tracking-tight text-on-surface">Synthesis Vector Map</h4>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Correlation between volumetric interaction and conversion nodes.</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-premium shadow-primary/20 scale-110"></div>
              <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Volume Flow</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-premium shadow-tertiary/20 scale-110"></div>
              <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Conversion Delta</span>
            </div>
          </div>
        </div>
        
        <div className="w-full h-80 relative">
          <svg className="w-full h-full drop-shadow-2xl overflow-visible" viewBox="0 0 1000 300">
            <defs>
              <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ba9eff" stopOpacity="0.4"></stop>
                <stop offset="100%" stopColor="#ba9eff" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path d="M0,250 Q100,150 200,200 T400,100 T600,180 T800,80 T1000,120 V300 H0 Z" fill="url(#lineGrad)"></path>
            <path d="M0,250 Q100,150 200,200 T400,100 T600,180 T800,80 T1000,120" fill="none" stroke="#ba9eff" strokeLinecap="round" strokeWidth="4"></path>
            <path d="M0,280 Q100,200 200,240 T400,180 T600,240 T800,150 T1000,200" fill="none" stroke="#57bcff" strokeDasharray="8,4" strokeLinecap="round" strokeWidth="2" opacity="0.6"></path>
            
            <line stroke="#ba9eff" strokeWidth="1" strokeDasharray="4,4" x1="600" x2="600" y1="0" y2="300" opacity="0.4"></line>
            <circle cx="600" cy="180" fill="#ba9eff" r="6" className="shadow-premium shadow-primary/50"></circle>
          </svg>
          
          <div className="absolute right-[35%] top-1/4 glass-card p-5 shadow-premium border-primary/20 group hover:border-primary/50 transition-all">
            <p className="text-[9px] text-primary font-black uppercase tracking-[0.25em] mb-3">Node 32 Analytics</p>
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">Flow</p>
                <p className="text-sm font-black text-on-surface tracking-tighter">14.2K</p>
              </div>
              <div className="h-8 w-px bg-outline-variant/20"></div>
              <div className="space-y-1">
                <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">Conv.</p>
                <p className="text-sm font-black text-on-surface tracking-tighter">3.1K</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-10 text-[9px] text-on-surface-variant font-black uppercase tracking-[0.25em]">
            {['WK 28', 'WK 29', 'WK 30', 'WK 31', 'WK 32', 'WK 33', 'WK 34'].map(w => <span key={w}>{w}</span>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Category Fit Performance */}
        <div className="glass-card p-10 shadow-premium border-secondary/5">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface">Category Precision Meta</h5>
          </div>
          <div className="space-y-8">
            {(analytics?.category_performance || [
              { label: 'Evening Wear', value: 98.2, color: 'secondary' },
              { label: 'Casual Essentials', value: 94.5, color: 'secondary' },
              { label: 'Denim Dynamics', value: 89.1, color: 'tertiary' },
              { label: 'Strategic Outerwear', value: 91.8, color: 'secondary' },
            ]).map(cat => (
              <div key={cat.label || cat.category} className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-on-surface-variant">{cat.label || cat.category}</span>
                  <span className={`text-${cat.color}`}>{cat.value || cat.score}%</span>
                </div>
                <div className="h-1.5 bg-surface-container-highest/20 rounded-full overflow-hidden border border-white/5">
                  <div className={`h-full bg-gradient-to-r from-${cat.color} to-${cat.color}-dim shadow-[0_0_8px_rgba(63,255,139,0.2)]`} style={{ width: `${cat.value || cat.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-secondary w-full mt-10 !py-3.5 !text-[9px] uppercase font-black tracking-[0.25em]">
            Access 18 Sub-Modules
          </button>
        </div>

        {/* ML Model Health */}
        <div className="glass-card p-10 shadow-premium relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface">Neural Integrity Health</h5>
          </div>
          <div className="flex justify-center py-4 relative">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            <svg className="w-48 h-48 drop-shadow-2xl" viewBox="0 0 200 200">
              <polygon fill="none" points="100,20 169,60 169,140 100,180 31,140 31,60" stroke="rgba(255,255,255,0.05)" strokeWidth="1"></polygon>
              <polygon fill="none" points="100,50 143,75 143,125 100,150 57,125 57,75" stroke="rgba(255,255,255,0.05)" strokeWidth="1"></polygon>
              <polygon fill="rgba(186, 158, 255, 0.2)" points="100,40 150,80 130,135 100,170 40,110 70,60" stroke="#ba9eff" strokeWidth="2" className="animate-pulse"></polygon>
              <circle cx="100" cy="40" fill="#ba9eff" r="3" className="shadow-[0_0_8px_#ba9eff]"></circle>
              <circle cx="150" cy="80" fill="#ba9eff" r="3"></circle>
              <circle cx="130" cy="135" fill="#ba9eff" r="3"></circle>
            </svg>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Synthesis Accuracy</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Processing Latency</div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-surface-container-highest/10 p-4 rounded-xl border border-outline-variant/10 shadow-premium">
              <p className="text-[8px] text-on-surface-variant uppercase font-black tracking-widest mb-1.5 whitespace-nowrap">Inference Clock</p>
              <p className="text-sm font-black text-on-surface uppercase leading-none">240ms <span className="text-secondary text-[8px] tracking-tighter ml-1">Elite</span></p>
            </div>
            <div className="bg-surface-container-highest/10 p-4 rounded-xl border border-outline-variant/10 shadow-premium">
              <p className="text-[8px] text-on-surface-variant uppercase font-black tracking-widest mb-1.5 whitespace-nowrap">Neural Drift</p>
              <p className="text-sm font-black text-on-surface uppercase leading-none">0.02% <span className="text-secondary text-[8px] tracking-tighter ml-1">Minimal</span></p>
            </div>
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="glass-card p-10 shadow-premium border-tertiary/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center border border-tertiary/20">
              <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
            </div>
            <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface">Geospatial Distribution</h5>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] text-on-surface-variant uppercase font-black tracking-[0.25em] border-b border-outline-variant/10">
                  <th className="pb-5">Region Entity</th>
                  <th className="pb-5 text-right">Magnitude</th>
                  <th className="pb-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {(analytics?.regional_data || [
                  { name: 'Maharashtra Unit', users: '124.5K', engagement: 'Peak', color: 'bg-secondary' },
                  { name: 'Karnataka Core', users: '98.2K', engagement: 'High', color: 'bg-primary' },
                  { name: 'Delhi NCR Hub', users: '86.4K', engagement: 'Stable', color: 'bg-tertiary' },
                  { name: 'Tamil Nadu Node', users: '72.1K', engagement: 'Growth', color: 'bg-slate-400' },
                ]).map(region => (
                  <tr key={region.name} className="group hover:bg-surface-container-highest/5 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${region.color} shadow-premium group-hover:scale-125 transition-transform`}></div>
                        <span className="text-[11px] font-black text-on-surface uppercase tracking-tight">{region.name}</span>
                      </div>
                    </td>
                    <td className="py-5 text-[11px] font-black text-on-surface text-right">{region.users}</td>
                    <td className="py-5 text-right">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                        region.engagement === 'Peak' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                        region.engagement === 'High' ? 'bg-primary/10 text-primary border-primary/20' :
                        region.engagement === 'Stable' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' :
                        'bg-surface-container-highest/10 text-on-surface-variant border-outline-variant/10'
                      }`}>
                        {region.engagement}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
