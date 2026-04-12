import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Simple inline SVG bar chart
const BarChart = ({ data, color = '#6366f1' }) => {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  return (
    <div style={{ height: '80px' }} className="flex items-end gap-2">
      {data.map((d, i) => {
        const pct = ((d.value - min) / (max - min + 1)) * 70 + 30; // 30–100% range
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className="w-full rounded-t-md transition-all duration-700"
              style={{ height: `${pct}%`, backgroundColor: color }}
            />
            <span className="text-[9px] text-zinc-400 font-semibold">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// Simple donut chart
const DonutChart = ({ segments, size = 120 }) => {
  const r = 42;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;
  const total = segments.reduce((a, b) => a + b.value, 0);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const offset = circumference * (1 - cumulative);
        const dash = circumference * pct;
        cumulative += pct;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dasharray 1s ease' }}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#18181b">
        {segments[0]?.value}%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#71717a">
        {segments[0]?.label}
      </text>
    </svg>
  );
};

// Simple sparkline
const SparkLine = ({ data, color1 = '#6366f1', color2 = '#ef4444' }) => {
  const h = 80;
  const w = 300;
  const max = Math.max(...data.map(d => Math.max(d.v1, d.v2)));
  const pts1 = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.v1 / max) * h}`).join(' ');
  const pts2 = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.v2 / max) * h}`).join(' ');
  const area1 = `${pts1} ${w},${h} 0,${h}`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={area1} fill={color1} fillOpacity="0.1" />
      <polyline points={pts1} fill="none" stroke={color1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts2} fill="none" stroke={color2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
    </svg>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    api.fetchWardrobe().then(data => {
      setWardrobeCount(Array.isArray(data) ? data.length : 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const summaryCards = [
    { icon: 'checkroom', label: 'Recommended Size', value: 'M / 32W', sub: 'Based on your body profile', color: 'text-violet-500 bg-violet-50' },
    { icon: 'accessibility_new', label: 'Body Type', value: 'Athletic', sub: 'Shoulder-dominant frame', color: 'text-blue-500 bg-blue-50' },
    { icon: 'verified', label: 'Scan Confidence', value: '96.2%', sub: 'High accuracy measurement', color: 'text-emerald-500 bg-emerald-50' },
    { icon: 'styler', label: 'Wardrobe Items', value: wardrobeCount || 42, sub: '3 duplicates detected', color: 'text-amber-500 bg-amber-50' },
    { icon: 'grid_view', label: "Today's Outfits", value: '5', sub: 'Occasion-matched suggestions', color: 'text-pink-500 bg-pink-50' },
    { icon: 'report_problem', label: 'Duplicate Alerts', value: '3', sub: 'Similar items found', color: 'text-red-500 bg-red-50' },
    { icon: 'shopping_cart', label: 'Shopping Readiness', value: '88 / 100', sub: 'Profile nearly complete', color: 'text-teal-500 bg-teal-50' },
  ];

  const featureCards = [
    { label: 'Body Intelligence', sub: 'Live scan & measurements', icon: 'psychology', path: '/body-intelligence', gradient: 'from-blue-600 to-blue-800' },
    { label: 'Wardrobe', sub: 'Scan & manage items', icon: 'styler', path: '/wardrobe', gradient: 'from-orange-500 to-amber-600' },
    { label: 'Outfit Engine', sub: 'AI outfit suggestions', icon: 'auto_fix_high', path: '/outfit-engine', gradient: 'from-pink-500 to-rose-600' },
    { label: 'Smart Shopping', sub: 'Fit before you buy', icon: 'shopping_bag', path: '/smart-shopping', gradient: 'from-emerald-500 to-teal-600' },
  ];

  const kpis = [
    { icon: 'memory', label: 'Fit Accuracy', value: '96.2%', change: '+2.1%', up: true, color: 'text-violet-500 bg-violet-50' },
    { icon: 'sync', label: 'Return Rate Reduction', value: '67%', change: '+12%', up: true, color: 'text-emerald-500 bg-emerald-50' },
    { icon: 'group', label: 'Active Users', value: '48,291', change: '+8.4%', up: true, color: 'text-blue-500 bg-blue-50' },
    { icon: 'payments', label: 'Revenue Saved', value: '₹2.4Cr', change: '+₹28L', up: true, color: 'text-amber-500 bg-amber-50' },
  ];

  const sparkData = [
    { label: 'Oct', v1: 16, v2: 18 },
    { label: 'Nov', v1: 20, v2: 16 },
    { label: 'Dec', v1: 22, v2: 14 },
    { label: 'Jan', v1: 26, v2: 11 },
    { label: 'Feb', v1: 28, v2: 10 },
    { label: 'Mar', v1: 30, v2: 9 },
    { label: 'Apr', v1: 32, v2: 8 },
  ];

  const donutData = [
    { label: 'Perfect Fit', value: 61, color: '#6366f1' },
    { label: 'Slight Adjust', value: 24, color: '#a5b4fc' },
    { label: 'Size Up', value: 9, color: '#ddd6fe' },
    { label: 'Size Down', value: 6, color: '#ede9fe' },
  ];

  const barData = [
    { label: 'Mon', value: 93 },
    { label: 'Tue', value: 95 },
    { label: 'Wed', value: 96 },
    { label: 'Thu', value: 94 },
    { label: 'Fri', value: 97 },
    { label: 'Sat', value: 98 },
    { label: 'Sun', value: 96 },
  ];

  const activities = [
    { initials: 'SM', name: 'Sarah M.', badge: 'Perfect Fit', badgeColor: 'bg-emerald-100 text-emerald-700', detail: 'Virtual try-on completed · Floral Midi Dress', time: '2m ago', bg: 'bg-violet-100 text-violet-700' },
    { initials: 'AK', name: 'Alex K.', badge: 'Adjusted', badgeColor: 'bg-amber-100 text-amber-700', detail: 'Size recommendation applied · Slim Chino Trousers', time: '8m ago', bg: 'bg-blue-100 text-blue-700' },
    { initials: 'PS', name: 'Priya S.', badge: 'Return Saved', badgeColor: 'bg-teal-100 text-teal-700', detail: 'Return prevented · Oversized Linen Shirt', time: '15m ago', bg: 'bg-pink-100 text-pink-700' },
    { initials: 'JD', name: 'John D.', badge: 'Body Scan', badgeColor: 'bg-blue-100 text-blue-700', detail: 'Body scan uploaded', time: '22m ago', bg: 'bg-orange-100 text-orange-700' },
    { initials: 'EL', name: 'Emma L.', badge: 'Outfit Saved', badgeColor: 'bg-violet-100 text-violet-700', detail: 'Outfit saved · Evening Look #3', time: '31m ago', bg: 'bg-rose-100 text-rose-700' },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-72 bg-zinc-200 rounded-lg" />
        <div className="grid grid-cols-7 gap-3">{[...Array(7)].map((_, i) => <div key={i} className="h-28 bg-zinc-100 rounded-xl" />)}</div>
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-zinc-100 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-zinc-400 mt-1 text-sm">ML-powered fit intelligence overview · {today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 rounded-lg p-1 gap-1">
            {['7d', '30d', '90d'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${period === p ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="btn-primary !py-2 !px-4 text-sm gap-2">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Generate Report
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">AI Summary</h2>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live · Updated now
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {summaryCards.map((card, i) => (
            <div key={i} className="rounded-xl border border-zinc-100 p-4 hover:border-primary/20 hover:shadow-sm transition-all cursor-default">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
              </div>
              <p className="text-xl font-bold text-zinc-900 leading-tight">{card.value}</p>
              <p className="text-[11px] font-bold text-zinc-700 mt-1">{card.label}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {featureCards.map((card, i) => (
          <button
            key={i}
            onClick={() => navigate(card.path)}
            className={`bg-gradient-to-br ${card.gradient} text-white rounded-2xl p-6 text-left group hover:opacity-95 active:scale-[0.98] transition-all shadow-md`}
          >
            <span className="material-symbols-outlined text-3xl mb-4 opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
            <h3 className="text-lg font-bold leading-tight">{card.label}</h3>
            <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
              {card.sub}
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </p>
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
              </div>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                <span className="material-symbols-outlined text-sm">{kpi.up ? 'trending_up' : 'trending_down'}</span>
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{kpi.value}</p>
            <p className="text-xs text-zinc-400 font-semibold mt-1 uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-bold text-zinc-900">Return Rate vs Revenue Saved</h3>
              <p className="text-xs text-zinc-400 mt-0.5">7-month comparison</p>
            </div>
            <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="flex items-center gap-4 mb-4 mt-3">
            {[{color: '#6366f1', label: 'Revenue Saved (K)'}, {color: '#ef4444', label: 'Return Rate (%)'}].map((l, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: l.color, borderStyle: i === 1 ? 'dashed' : 'solid', borderWidth: i === 1 ? '1px' : '0' }} />
                <span className="text-[11px] text-zinc-400 font-semibold">{l.label}</span>
              </div>
            ))}
          </div>
          {/* Y axis labels + chart */}
          <div className="flex gap-2">
            <div className="flex flex-col justify-between text-[10px] text-zinc-300 font-semibold text-right w-6 pb-5">
              {[36, 27, 18, 9, 0].map(v => <span key={v}>{v}</span>)}
            </div>
            <div className="flex-1">
              <SparkLine data={sparkData} color1="#6366f1" color2="#ef4444" />
              <div className="flex justify-between mt-1">
                {sparkData.map(d => <span key={d.label} className="text-[10px] text-zinc-300 font-semibold">{d.label}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900">Fit Distribution</h3>
          <p className="text-xs text-zinc-400 mt-0.5 mb-4">Click a slice or legend to explore</p>
          <div className="flex justify-center mb-4">
            <DonutChart segments={donutData} size={140} />
          </div>
          <div className="space-y-2.5">
            {donutData.map((seg, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-sm text-zinc-600 font-medium">{seg.label}</span>
                </div>
                <span className="text-sm font-bold text-zinc-800">{seg.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart */}
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900">Daily Fit Accuracy</h3>
          <p className="text-xs text-zinc-400 mt-0.5 mb-4">Last 7 days</p>
          <div className="flex items-end justify-between text-[10px] text-zinc-300 font-semibold mb-2">
            {[100, 96, 93, 90].map(v => (
              <span key={v} className="absolute" style={{ display: 'none' }}>{v}</span>
            ))}
          </div>
          <BarChart data={barData} color="#6366f1" />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-zinc-900">Recent Activity</h3>
            <button className="text-sm font-bold text-primary hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-zinc-50 -mx-2 px-2 py-1.5 rounded-xl transition-colors">
                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${a.bg}`}>
                  {a.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-zinc-900">{a.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.badgeColor}`}>{a.badge}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{a.detail}</p>
                </div>
                <span className="text-[11px] text-zinc-300 font-semibold flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
