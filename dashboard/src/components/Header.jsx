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
      title: "New Sizing Engine Update",
      desc: "AI precision for 'Tapered' cuts has increased by 12%.",
      time: "2 mins ago",
      icon: "bolt",
      color: "text-primary"
    },
    {
      id: 2,
      title: "Tokyo Trend Report",
      desc: "Latest minimalist trends from Tokyo now integrated into Outfit Engine.",
      time: "1 hour ago",
      icon: "trending_up",
      color: "text-secondary"
    },
    {
      id: 3,
      title: "Body Scan Reminder",
      desc: "Your last scan was 30 days ago. Update for better accuracy.",
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
    <header className="fixed top-0 right-0 left-72 h-20 bg-surface/60 backdrop-blur-xl flex items-center justify-between px-10 w-auto z-40 border-b border-outline-variant/10 uppercase tracking-tight">
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-hover:text-primary transition-all duration-500">search</span>
          <input 
            className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-xl pl-12 pr-6 py-3 text-[13px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/40 focus:bg-surface-container transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none shadow-premium-inset" 
            placeholder="ACCESS PROTOCOL, ENTITIES, OR MACRO TRENDS..." 
            type="text"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[11px] font-black text-on-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/30 bg-surface-container">⌘</span>
            <span className="text-[11px] font-black text-on-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/30 bg-surface-container">K</span>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_var(--secondary)]"></span>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">PROTOCOL: {theme}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high transition-all group"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group ${showNotifications ? 'text-primary bg-primary/10' : 'text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high'}`}
            >
              <span className="material-symbols-outlined text-xl group-hover:shake">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full shadow-[0_0_8px_var(--secondary)]"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-4 w-[360px] !bg-surface/95 backdrop-blur-3xl rounded-xl border border-outline-variant/20 shadow-premium animate-in fade-in slide-in-from-top-2 duration-300 z-50 overflow-hidden">
                <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-on-surface">Latest Intelligence</h3>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded">3 NEW</span>
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
                <div className="p-4 bg-surface-container-highest/10">
                  <button className="w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.25em] text-primary hover:bg-primary/10 transition-colors">
                    View All Status Logs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-8 w-px bg-outline-variant/30"></div>
        
        <div className="flex items-center gap-5 cursor-pointer group relative">
          <div className="text-right space-y-0.5">
            <p className="text-[14px] font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{user?.name || 'SYNCED NODE'}</p>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">{user?.role || 'ROOT ADMIN'}</p>
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-colors text-[12px] font-black uppercase tracking-widest"
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
