import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: 'grid_view', path: '/' },
    { name: 'Measurements', icon: 'straighten', path: '/body-intelligence' },
    { name: 'My Wardrobe', icon: 'checkroom', path: '/wardrobe' },
    { name: 'Outfit Planner', icon: 'auto_fix_high', path: '/outfit-engine' },
    { name: 'Shop', icon: 'shopping_bag', path: '/smart-shopping' },
    { name: 'Try-On', icon: 'accessibility_new', path: '/virtual-try-on' },
    { name: 'Catalog', icon: 'inventory_2', path: '/products' },
    { name: 'Orders', icon: 'receipt_long', path: '/orders' },
    { name: 'Analytics', icon: 'leaderboard', path: '/analytics' },
  ];

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 bg-surface-container flex flex-col py-10 z-50 shadow-[40px_0_100px_-20px_rgba(0,0,0,0.5)] border-r border-outline-variant/10 uppercase tracking-tight">
      <div className="px-8 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline tracking-tight text-on-surface">FitLoop</h1>
            <p className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Premium Hub</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 py-2.5 px-4 transition-all rounded-lg border border-transparent group ${
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`
            }
          >
            <span className={`material-symbols-outlined text-xl transition-all group-hover:scale-110`}>{item.icon}</span>
            <span className="text-[13px] font-black tracking-[0.15em] uppercase">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 mt-auto pt-8 space-y-6">
        <button className="btn-primary w-full !py-3 !text-[11px] font-bold tracking-widest uppercase shadow-sm">
          <span className="material-symbols-outlined text-lg">add_circle</span>
          New Scan
        </button>
        <div className="space-y-3 pb-6 border-t border-outline-variant/10 pt-6">
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 transition-all text-xs font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-zinc-500 hover:text-on-surface'}`
            } 
            to="/settings"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            Settings
          </NavLink>
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 transition-all text-xs font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-zinc-500 hover:text-on-surface'}`
            } 
            to="/support"
          >
            <span className="material-symbols-outlined text-xl">help</span>
            Support
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
