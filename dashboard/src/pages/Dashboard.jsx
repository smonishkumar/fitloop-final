import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [trendRange, setTrendRange] = useState('Last 30 Days');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await api.fetchAnalyticsSummary();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleQuickLink = (path) => {
    navigate(path);
  };

  const handleAction = (action) => {
    console.log(`Action triggered: ${action}`);
    // Here we can add actual logic like opening modals or triggering API calls
  };

  return (
    <div className="space-y-12">
      {/* Hero Section: AI Summary Bento */}
      <section className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight text-on-surface">Intelligence Overview</h1>
              <p className="text-on-surface-variant mt-1.5 text-sm">Real-time fit synthesis and algorithmic performance metrics.</p>
            </div>
            <div className="bg-surface-container-highest/60 rounded-lg px-4 py-2 flex items-center gap-3 border border-outline-variant/10">
              <span className="text-secondary flex items-center gap-1 font-bold text-sm">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +12.4%
              </span>
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">vs last month</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Summary Card 1 */}
            <div className="glass-card p-8 flex flex-col justify-between relative group shadow-premium hover:shadow-premium-hover transition-all duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
              <div>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.15em] mb-3">Dominant Size</p>
                <h3 className="text-4xl font-headline font-bold text-primary">M-Reg</h3>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">High Frequency</span>
              </div>
            </div>
            
            {/* AI Summary Card 2 */}
            <div className="glass-card p-8 flex flex-col justify-between relative group shadow-premium hover:shadow-premium-hover transition-all duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all"></div>
              <div>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.15em] mb-3">Body Archetype</p>
                <h3 className="text-4xl font-headline font-bold text-secondary">Athletic</h3>
              </div>
              <div className="flex items-center gap-2 mt-6 text-[11px] font-semibold text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                Optimized for Taper
              </div>
            </div>
            
            {/* AI Summary Card 3 */}
            <div className="glass-card p-8 flex flex-col justify-between relative group shadow-premium hover:shadow-premium-hover transition-all duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all"></div>
              <div>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.15em] mb-3">Confidence</p>
                <h3 className="text-4xl font-headline font-bold text-tertiary">95%</h3>
              </div>
              <div className="w-full bg-surface-container-highest/50 h-1.5 rounded-full mt-8 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full shadow-[0_0_10px_rgba(87,188,255,0.4)]" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Feature Quick Links */}
        <div className="lg:w-[320px] flex flex-col gap-4 justify-end lg:pb-0">
          {[
            { label: 'Body Intelligence', sub: 'Anatomy & Motion', icon: 'psychology', path: '/body-intelligence', color: 'primary' },
            { label: 'Digital Wardrobe', sub: '1,248 Items Cataloged', icon: 'checkroom', path: '/wardrobe', color: 'secondary' },
            { label: 'Outfit Engine', sub: 'Generate New Looks', icon: 'auto_fix_high', path: '/outfit-engine', color: 'tertiary' },
          ].map((link) => (
            <div 
              key={link.path}
              className="glass-card p-5 !bg-surface-container-highest/20 flex items-center justify-between group hover:!bg-surface-container-highest/40 cursor-pointer shadow-premium hover:shadow-premium-hover transition-all" 
              onClick={() => handleQuickLink(link.path)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-${link.color}/20 rounded-lg flex items-center justify-center text-${link.color} shadow-inner`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{link.icon}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold">{link.label}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">{link.sub}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-on-surface group-hover:translate-x-1 transition-all">chevron_right</span>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics & Data Visualization */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Key Metrics Grid */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {(analytics?.kpis || [
            { label: 'Fit Accuracy', value: '97.2%', change: '+2.1%', icon: 'arrow_upward', color: 'secondary' },
            { label: 'Return Rate', value: '-14%', change: 'Optimized', icon: 'verified', color: 'secondary' },
            { label: 'Total Users', value: '124k', change: 'Global Reach', icon: 'groups', color: 'tertiary' },
            { label: 'Rev Impact', value: '$2.4M', change: 'Net Positive', icon: 'payments', color: 'primary' },
          ]).map((metric) => (
            <div key={metric.label} className="glass-card !bg-surface-container-highest/20 p-6 flex flex-col justify-between border-none shadow-premium transition-all hover:scale-[1.02]">
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mb-2">{metric.label}</p>
                <p className="text-3xl font-headline font-bold text-on-surface">{metric.value}</p>
              </div>
              <p className={`text-${metric.color} text-[10px] font-bold mt-4 flex items-center gap-1.5 uppercase tracking-wider`}>
                <span className="material-symbols-outlined text-sm">{metric.icon}</span>
                {metric.change}
              </p>
            </div>
          ))}
        </div>

        {/* Middle: Performance Trends Line Chart */}
        <div className="lg:col-span-5 glass-card p-8 shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-on-surface-variant">Performance Trends</h3>
            <select 
              className="bg-surface-container-highest/40 border-none text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors"
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value)}
            >
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
            </select>
          </div>
          <div className="h-44 flex items-end justify-between gap-2 relative mt-4">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 35 Q 25 30, 40 20 T 70 10 T 100 5" fill="none" stroke="#ba9eff" strokeWidth="2" strokeLinecap="round"></path>
              <path d="M0 35 Q 25 30, 40 20 T 70 10 T 100 5 L 100 40 L 0 40 Z" fill="url(#grad_dash)" opacity="0.15"></path>
              <defs>
                <linearGradient id="grad_dash" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ba9eff', stopOpacity: 1 }}></stop>
                  <stop offset="100%" style={{ stopColor: '#ba9eff', stopOpacity: 0 }}></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex-1 h-full border-l border-b border-outline-variant/10 flex items-end justify-around pb-1">
              {[32, 24, 40, 16, 28].map((h, i) => (
                <div key={i} className="w-[1px] bg-outline-variant/20 h-full"></div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest px-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
          </div>
        </div>

        {/* Right: Body Type Distribution Donut */}
        <div className="lg:col-span-3 glass-card p-8 flex flex-col items-center shadow-premium">
          <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-on-surface-variant self-start mb-8">Distribution</h3>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="rgba(255,255,255,0.03)" strokeWidth="3.5"></circle>
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#3fff8b" strokeDasharray="45 55" strokeDashoffset="0" strokeWidth="3.5" strokeLinecap="round"></circle>
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#ba9eff" strokeDasharray="30 70" strokeDashoffset="-45" strokeWidth="3.5" strokeLinecap="round"></circle>
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#57bcff" strokeDasharray="25 75" strokeDashoffset="-75" strokeWidth="3.5" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-headline text-on-surface">AI</span>
              <span className="text-[8px] uppercase font-bold text-on-surface-variant tracking-widest">Index</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 mt-8 w-full px-2">
            {[
              { label: 'Athletic', value: '45%', color: 'secondary' },
              { label: 'Slim', value: '30%', color: 'primary' },
              { label: 'Husky', value: '25%', color: 'tertiary' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full bg-${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                  <span className="font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                </div>
                <span className="font-bold text-on-surface">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-card p-10 shadow-premium">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold font-headline">Recent Processing</h3>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline px-2 py-1" onClick={() => navigate('/analytics')}>View Records</button>
          </div>
          <div className="space-y-4">
            {[
              { 
                name: 'Marcus Chen', 
                action: 'New Scan', 
                details: 'Processed 32 body anchor points successfully.', 
                match: '98%', 
                time: '2 mins ago', 
                color: 'primary',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuxlETZGu6YqmzyeaTDd83ZqfX7CYXYgSxREMKpX-IBN-2cF1lUYAkgcewzPyWmbLf-KO6jhIaGFWPR5WFL7waIN1xi6eH9g61iTbcSS99u1y124ypgm0_pfcKAxc49cfLKMjunSkjRlVBuwcIlZGYmZafuV2f_Op-8t4KonuiW7ISyc1EriCnd5p_dVp706uL31ZNgNvlUu70vZQLcXia5IrIG7vszl8lg8tlxzL7h-bcVGLXXmG6uUL9vMf4qz98Im1cMrWffg' 
              },
              { 
                name: 'Elena V.', 
                action: 'Wardrobe Sync', 
                details: "Integrated 12 items from 'Nordstrom' Fall Collection.", 
                match: 'Index +14', 
                time: '15 mins ago', 
                color: 'tertiary',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhZzN88A2uxkRVLqrY_-Zk-B0XgGTCcSMUZxNH_jyC64x5jAXYcwa8jekVyzElBZm9k3Uit0MEEMNP7SdtWWgKwAUbbLCj3oBHzfSbjXVuR5OtEyLDELbILJIpYEf4FOGKMgqkit46httRBh7kLPoBQGkU8DF6nqsyiy4lJvas-c7QnwA693DJPJOXUYjnupDfP_yv13XL6_KOoTMEA8BMVGM0ibKauDM0IMPnXBwKd77ARlVe6xUdIph3TwjaCjwJviWhTgZp0A' 
              },
              { 
                name: 'Leo Smith', 
                action: 'Optimization', 
                details: "AI recommended 'Tapered' cut for higher fit precision.", 
                match: 'Saved Return', 
                time: '42 mins ago', 
                color: 'primary',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgmY2kPYD5RktGUMLSqo76GOsf600vYAFjRdMwV3h4V0BNPHO1qlYXe4TK5CayvJWCK_dmQOV2XQQVfsIXzCsu-0pROGxHVeARptXx0BRGYYaqSxE7_i3IrwFxRWqRMH2JYJ5DT0sQ6vGEfKd6GHtfszeHX7_tDS3VpxZwJtZ57CTLanvte8FdeEujckCSGYrdahvNah93HcnGd_dcmiWplBSZ9vgeYNK9t-1oRiAeyL6j0Kl9m5AfzMRTT-31FRDsLSiO6GSHDw' 
              },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-6 p-4 rounded-lg bg-surface-container-highest/20 hover:bg-surface-container-highest/40 transition-all border border-transparent hover:border-outline-variant/10 group cursor-default">
                <div className={`w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-outline-variant/30 group-hover:ring-${activity.color}/40 transition-all`}>
                  <img className="w-full h-full object-cover" src={activity.img} alt={activity.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-on-surface truncate">{activity.action}: {activity.name}</p>
                  <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{activity.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[11px] font-bold text-${activity.color === 'primary' ? 'secondary' : 'tertiary'} uppercase tracking-wider`}>{activity.match}</p>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold mt-1 tracking-widest">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Feature Card */}
        <div className="lg:col-span-5 glass-card bg-gradient-to-br from-primary-container/10 via-surface-container-highest/40 to-surface-container-highest p-10 flex flex-col justify-between group overflow-hidden relative shadow-premium border-primary/10">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all"></div>
          <div>
            <span className="bg-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.2em] mb-8 inline-block shadow-inner">Intelligence Pro</span>
            <h3 className="text-4xl font-headline font-bold mb-4 leading-tight tracking-tight text-on-surface">Master the <br/>Virtual Runway.</h3>
            <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">Unlock real-time fabric physics simulation for a 100% accurate virtual try-on experience with biometric precision.</p>
          </div>
          <div className="mt-12">
            <button 
              className="btn-primary !bg-on-background !text-background hover:!bg-primary hover:!text-on-primary !py-4 !px-10 group"
              onClick={() => handleAction('Upgrade Engine')}
            >
              <span className="text-xs uppercase tracking-widest">Upgrade Engine</span>
              <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">bolt</span>
            </button>
          </div>
          <div className="absolute top-10 right-10 opacity-20 group-hover:opacity-30 transition-opacity">
            <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>tsunami</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
