import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wardrobeCount, setWardrobeCount] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [analyticsData, wardrobeData] = await Promise.all([
          api.fetchAnalyticsSummary(),
          api.fetchWardrobe()
        ]);
        setAnalytics(analyticsData);
        setWardrobeCount(wardrobeData.length);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-48 bg-zinc-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-100 rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-zinc-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-4">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight text-zinc-900">Welcome back, Alex</h1>
          <p className="text-zinc-500 mt-2 text-lg">Here's a summary of your style profile and recent activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary !py-2 !px-4 text-sm" onClick={() => navigate('/analytics')}>
            Detailed Reports
          </button>
          <button className="btn-primary !py-2 !px-4 text-sm" onClick={() => navigate('/virtual-try-on')}>
            Start New Try-On
          </button>
        </div>
      </section>

      {/* Primary Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 group hover:border-primary/30 transition-all">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Fit Accuracy</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-bold text-zinc-900">95%</h3>
            <span className="text-secondary font-bold text-sm">+2.4%</span>
          </div>
          <div className="mt-8 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: '95%' }}></div>
          </div>
        </div>

        <div className="glass-card p-8 group hover:border-secondary/30 transition-all">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Items in Wardrobe</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-bold text-zinc-900">{wardrobeCount || 128}</h3>
            <span className="text-zinc-400 font-medium text-sm">Total items</span>
          </div>
          <p className="mt-8 text-sm text-zinc-500 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
            All items synced successfully
          </p>
        </div>

        <div className="glass-card p-8 group hover:border-tertiary/30 transition-all">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Body Type</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-bold text-zinc-900">Athletic</h3>
          </div>
          <div className="mt-8 flex gap-2">
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-200">Tapered Fit</span>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-200">Broad Shoulders</span>
          </div>
        </div>
      </section>

      {/* Main Insights & Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="glass-card p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-zinc-900">Recent Activity</h3>
              <select className="bg-transparent border-none text-sm font-bold text-zinc-500 focus:ring-0 cursor-pointer">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="space-y-6">
              {[
                { action: 'New Measurement Scan', time: '2h ago', detail: '32 points analyzed', result: '98% match', color: 'primary' },
                { action: 'Wardrobe Sync', time: '5h ago', detail: '12 items from Nordstrom', result: 'Synced', color: 'secondary' },
                { action: 'Fit Recommendation', time: '1d ago', detail: 'Tapered cut suggested', result: 'View', color: 'tertiary' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-lg bg-${item.color}/10 flex items-center justify-center text-${item.color}`}>
                      <span className="material-symbols-outlined text-xl">{i === 0 ? 'straighten' : i === 1 ? 'sync' : 'recommend'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-[15px]">{item.action}</h4>
                      <p className="text-zinc-500 text-sm mt-0.5">{item.detail} • {item.time}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg bg-${item.color === 'primary' ? 'indigo' : item.color === 'secondary' ? 'emerald' : 'sky'}-100 text-${item.color === 'primary' ? 'indigo' : item.color === 'secondary' ? 'emerald' : 'sky'}-600`}>
                    {item.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card bg-zinc-900 p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Pro Feature</span>
              <h3 className="text-2xl font-bold leading-tight mb-4">Precision <br/>Virtual Try-On</h3>
              <p className="text-zinc-400 text-sm mb-10 leading-relaxed">Simulate fabric physics and drape with 100% biometric precision.</p>
              <button 
                className="w-full bg-white text-zinc-900 font-bold py-3 rounded-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group"
                onClick={() => navigate('/virtual-try-on')}
              >
                <span>Try it now</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>app_registration</span>
            </div>
          </div>

          <div 
            onClick={() => alert('Connect Store interface coming soon...')}
            className="glass-card p-8 border-dashed border-2 border-zinc-200 bg-transparent flex flex-col items-center justify-center text-center py-12 hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all mb-4">
              <span className="material-symbols-outlined">add</span>
            </div>
            <h4 className="font-bold text-zinc-900">Connect Store</h4>
            <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest font-bold">Import your purchase history</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
