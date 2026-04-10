import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { logout, user } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-72 h-20 bg-[#060c1d]/60 backdrop-blur-xl flex items-center justify-between px-10 w-auto z-40 border-b border-white/5 uppercase tracking-tight">
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-hover:text-primary transition-all duration-500">search</span>
          <input 
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-6 py-3 text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/40 focus:bg-white/10 transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none shadow-premium-inset" 
            placeholder="ACCESS PROTOCOL, ENTITIES, OR MACRO TRENDS..." 
            type="text"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-black text-on-surface-variant px-1.5 py-0.5 rounded border border-white/10 bg-white/5">⌘</span>
            <span className="text-[9px] font-black text-on-surface-variant px-1.5 py-0.5 rounded border border-white/10 bg-white/5">K</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:text-primary hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined text-xl group-hover:rotate-12">dark_mode</span>
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:text-primary hover:bg-white/5 transition-all relative group">
            <span className="material-symbols-outlined text-xl group-hover:shake">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full shadow-[0_0_8px_#3fff8b]"></span>
          </button>
        </div>
        
        <div className="h-8 w-px bg-white/10"></div>
        
        <div className="flex items-center gap-5 cursor-pointer group relative">
          <div className="text-right space-y-0.5">
            <p className="text-[12px] font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{user?.name || 'SYNCED NODE'}</p>
            <p className="text-[8px] text-primary font-black uppercase tracking-[0.3em]">{user?.role || 'ROOT ADMIN'}</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img 
              className="w-11 h-11 rounded-xl border border-white/10 group-hover:border-primary/40 transition-all object-cover relative z-10 shadow-premium" 
              src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuD1j24JwdsvFBas5QANLkJ9ukJTOedg9ZK1iH4mPH3ffU4hjAFEl0qZtDgO6zOy4IpS4Fi85n8i-D0903xdCeveQ3HI3CrHr9_fuP9F-Qy1j0wTNVDZJA6FzJ8yUftIKWahkSDAgwdEgRSIfT0RjmFSgPoNnxAlBXZ5iTGLS0Vedi4v46SOfNeICDQQZ9StTcjYkqugO0kxQGZzWNMHZeU3ERCkbtBR7LIVU5p6CbGPTWm8769e9kqkkTYgg44z0-kbBGycIgE57Q"} 
              alt="Profile" 
            />
            {/* Logout Dropdown Simulation */}
            <div className="absolute top-full right-0 mt-4 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 z-50">
              <div className="glass-card p-2 border border-white/10 shadow-premium min-w-[160px]">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout Protocol
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
