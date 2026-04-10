import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/' },
    { name: 'Body Intelligence', icon: 'psychology', path: '/body-intelligence' },
    { name: 'Wardrobe', icon: 'checkroom', path: '/wardrobe' },
    { name: 'Outfit Engine', icon: 'auto_fix_high', path: '/outfit-engine' },
    { name: 'Smart Shopping', icon: 'shopping_bag', path: '/smart-shopping' },
    { name: 'Virtual Try-On', icon: 'accessibility_new', path: '/virtual-try-on' },
    { name: 'Products', icon: 'inventory_2', path: '/products' },
    { name: 'Orders', icon: 'receipt_long', path: '/orders' },
    { name: 'Analytics', icon: 'leaderboard', path: '/analytics' },
  ];

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 bg-surface-container flex flex-col py-10 z-50 shadow-[40px_0_100px_-20px_rgba(0,0,0,0.5)] border-r border-outline-variant/10 uppercase tracking-tight">
      <div className="px-10 mb-14">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-premium shadow-primary/20 border border-outline-variant/20 group">
            <span className="material-symbols-outlined text-white text-2xl group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black bg-gradient-to-br from-on-surface to-on-surface/70 bg-clip-text text-transparent font-headline tracking-tighter">FITLOOP</h1>
            <p className="text-[11px] font-black tracking-[0.3em] text-primary/80">AI SYNTHESIS</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 px-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 py-3.5 px-6 transition-all duration-500 rounded-xl border border-transparent group ${
                isActive 
                  ? 'bg-primary/20 text-primary border-primary/30 shadow-premium shadow-primary/10' 
                  : 'text-on-surface-variant/90 hover:text-on-surface hover:bg-surface-container-high active:scale-95'
              }`
            }
          >
            <span className={`material-symbols-outlined text-xl transition-all group-hover:scale-110`}>{item.icon}</span>
            <span className="text-[13px] font-black tracking-[0.15em] uppercase">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-10 mt-auto pt-10 space-y-8">
        <button className="btn-primary w-full !py-4 !text-[12px] font-black tracking-[0.2em] shadow-premium shadow-primary/20 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="material-symbols-outlined text-lg">add_circle</span>
          NODE ANALYSIS
        </button>
        <div className="space-y-4 pb-4">
          <a className="flex items-center gap-4 text-on-surface-variant/70 hover:text-on-surface transition-all group" href="#">
            <span className="material-symbols-outlined text-xl group-hover:rotate-45 transition-transform">settings</span>
            <span className="text-[12px] font-black tracking-[0.2em] uppercase">Settings</span>
          </a>
          <a className="flex items-center gap-4 text-on-surface-variant/70 hover:text-on-surface transition-all group" href="#">
            <span className="material-symbols-outlined text-xl group-hover:scale-125 transition-transform">help</span>
            <span className="text-[12px] font-black tracking-[0.2em] uppercase">Protocol</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
