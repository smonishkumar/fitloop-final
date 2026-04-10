import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "New Fitting Algorithm",
      desc: "Fit precision for Tapered cuts has increased by 12%.",
      time: "2 mins ago",
      icon: "bolt",
      color: "text-primary"
    },
    {
      id: 2,
      title: "Spring Trend Report",
      desc: "Latest minimalist trends now integrated into Outfit Planner.",
      time: "1 hour ago",
      icon: "trending_up",
      color: "text-secondary"
    },
    {
      id: 3,
      title: "Measurement Update",
      desc: "Your last scan was 30 days ago. Update for latest accuracy.",
      time: "5 hours ago",
      icon: "psychology",
      color: "text-tertiary"
    }
  ];

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-72 h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 w-auto z-40 border-b border-zinc-200 uppercase tracking-tight">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-all">search</span>
          <input 
            className="w-full bg-zinc-100 border border-zinc-200 rounded-lg pl-11 pr-6 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all text-zinc-900 placeholder:text-zinc-400" 
            placeholder="Search catalog, orders..." 
            type="text"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[11px] font-black text-on-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/30 bg-surface-container">⌘</span>
            <span className="text-[11px] font-black text-on-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/30 bg-surface-container">K</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Live</span>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high active:scale-95 transition-all group"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group active:scale-95 ${showNotifications ? 'text-primary bg-primary/10' : 'text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high'}`}
            >
              <span className="material-symbols-outlined text-xl group-hover:shake">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full shadow-[0_0_8px_var(--secondary)]"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-xl border border-zinc-200 shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900">Notifications</h3>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">3 New</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
                  {notifications.map((n) => (
                    <button key={n.id} className="w-full text-left p-6 hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/5 last:border-none group">
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-surface-container-highest/20 flex items-center justify-center shrink-0 border border-outline-variant/10 group-hover:border-primary/30 transition-colors`}>
                          <span className={`material-symbols-outlined text-lg ${n.color}`}>{n.icon}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[13px] font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{n.title}</p>
                          <p className="text-[11px] text-on-surface-variant/80 font-medium leading-relaxed lowercase first-letter:uppercase">{n.desc}</p>
                          <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest pt-1">{n.time}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-zinc-50">
                  <button className="w-full py-2 rounded-lg text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-8 w-px bg-outline-variant/30"></div>
        
        <div className="flex items-center gap-5 cursor-pointer group relative">
          <div className="text-right">
            <p className="text-sm font-bold text-zinc-900 leading-none">{user?.name || 'Alex Rivera'}</p>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mt-1">{user?.role || 'Pro Plan'}</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img 
              className="w-11 h-11 rounded-xl border border-outline-variant/30 group-hover:border-primary/40 transition-all object-cover relative z-10 shadow-premium" 
              src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuD1j24JwdsvFBas5QANLkJ9ukJTOedg9ZK1iH4mPH3ffU4hjAFEl0qZtDgO6zOy4IpS4Fi85n8i-D0903xdCeveQ3HI3CrHr9_fuP9F-Qy1j0wTNVDZJA6FzJ8yUftIKWahkSDAgwdEgRSIfT0RjmFSgPoNnxAlBXZ5iTGLS0Vedi4v46SOfNeICDQQZ9StTcjYkqugO0kxQGZzWNMHZeU3ERCkbtBR7LIVU5p6CbGPTWm8769e9kqkkTYgg44z0-kbBGycIgE57Q"} 
              alt="Profile" 
            />
            {/* Logout Dropdown Simulation */}
            <div className="absolute top-full right-0 mt-4 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 z-50">
              <div className="glass-card p-2 border border-outline-variant/20 shadow-premium min-w-[160px]">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all text-xs font-bold"
                >
                  <span className="material-symbols-outlined text-lg focus:ring-0">logout</span>
                  Logout
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
