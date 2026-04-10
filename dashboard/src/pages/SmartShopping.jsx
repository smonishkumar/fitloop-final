import React, { useState } from 'react';

const SmartShopping = () => {
  const [productUrl, setProductUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState(null);

  const handleAnalyze = () => {
    if (!productUrl) return;
    setAnalyzing(true);
    setScore(null);
    setTimeout(() => {
      setAnalyzing(false);
      setScore(Math.floor(Math.random() * (99 - 80 + 1)) + 80); // Random score between 80-99
    }, 2000);
  };

  const products = [
    { name: 'Minimal Wool Overcoat', price: '$249.00', score: 96, category: 'Premium Collection', tagColor: 'text-primary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3QMygv-Ru-MTZKhAFTEU2-ivqKW54BPtS9whi4b3D-NCsYZMi0UY4cs4Kd-nL7AHKyQXV7bv9hnUOc1AY3188-NiC2u9UbnT6GXpgIseiVlnAfDWdaq4t8yUGWSyol6muCI3MvZAaUZ_m-ZX-OfVLgAQxWTBqdtxY0X5yq3MwLCgsLvyZxPZIsAYScwRhXAvGw4gslSBMtPR_MAa4gIZOMf9G3qAQuWIyksBxzMcE2OR3xkEPIAsxxpsCfrmMZQxE5RScsfGAUGk', detail: 'Exact match for shoulder width & arm length' },
    { name: 'Aero-Core Moto Jacket', price: '$185.00', score: 94, category: 'Technical Gear', tagColor: 'text-tertiary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBecyS5J4CkOO90uxepwcOO8VP58r0uxUT6BA1ipETpnW2zcgjrrpCDPzxLBBO4MjwcL1mlKOl_APf239ZGeB4JiN0SdSL6aZvZtVMI1PzfwbqzEgCKnPd9nSJ2O9MADOpMDOB8UDCooCXzfqIoJSyXUspQU4mAWnu-wpfsQUxwDKhOAYIzZP2XNawHFFXlu4xzvXV9_XR05qB9vw2UPkFlpyKq2FnY9sAathwZSIEnKZuMou9NxL2w4bBPVf9W1lGk2YPTBe_wrCo', detail: 'Optimal waist-to-hip ratio clearance' },
    { name: 'Heavyweight Structured Tee', price: '$45.00', score: 82, category: 'Essentials', tagColor: 'text-on-surface-variant', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQpNQVSYiYZRLnn9lqok7S2sKWHQ_eqi-9IvwZTdFXEsI8ZKBkWBmkyvcglzliyVnm5zwwd_djVJmcppCF6GVG7PmlJT9VjeOipjVBehyWGDv_FHrATotK8B0h0ZJT6OSd2uPDeCDXp2_-eZbSUzbxRVJ7LplqMEakGVgaBb20m5Pap6VD1FrukimzVf53DLqSCpvnrCEAgG9gT-jIjcWuv9FgkAFwFT1uC6Wdcq19p77pUfsZJVQQZizyg17xVwe5xUaYvUnZDA0', detail: 'Slightly loose on neckline based on profile', warn: true },
    { name: 'Velocity Running System', price: '$160.00', score: 98, category: 'Performance', tagColor: 'text-secondary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZcTubluKs9h1n7BL8z3HaAeY6H3hVKhqrC_2PJrRLiG1Y_ht83-NmvFKSad9j09vYM7BianFDicRtxlWLX3qx6nT9oM2U9l_bVAyhtT4eMyA15alQWnX7K5gu71MeavDGsFephflSp9EA_99570DMCfbeCikx4VSdm0o_pOfW94s76s6SSrBoFQ1fi-aVX6JkAJWgP2uZve6TkuBCEqYhEYxKjSuPXMFI8o0C1XPY4Tt0ABLYVof_uLPAKsGNUJYr53p__OL2k8I', detail: 'Dynamic arch support matches scan data' },
  ];

  return (
    <div className="space-y-12 uppercase tracking-tight">
      {/* Hero Banner: Smart Input */}
      <section className="glass-card p-10 relative overflow-hidden group shadow-premium bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-40"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold font-headline tracking-tight text-on-surface mb-3 underline decoration-primary/20 decoration-4 underline-offset-8">Will This Fit Me?</h1>
              <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-md mt-6">Paste a product URL or SKU from any retailer, and our <span className="text-primary font-bold">Neural Engine</span> will calculate your precise fit index based on biometric anchors.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-surface-container-highest/20 rounded-xl border border-outline-variant/10">
              <input 
                className="flex-1 bg-transparent border-none rounded-lg px-5 py-4 text-xs font-bold focus:ring-0 outline-none text-on-surface placeholder:text-on-surface-variant/40 uppercase tracking-widest" 
                placeholder="https://retailer.link/item/..." 
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
              />
              <button 
                className="btn-primary !px-10 !py-4 shadow-premium group/btn shrink-0"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-sm">cycle</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synthesizing...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Analyze Fit</span>
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">scan</span>
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center">
            <div className="relative w-64 h-64 glass-card rounded-full p-8 flex flex-col justify-center items-center text-center overflow-hidden shadow-premium border-2 border-primary/10">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
              <div className="w-32 h-32 rounded-full border-2 border-secondary/30 flex items-center justify-center mb-4 relative shadow-inner">
                {analyzing && (
                  <div className="absolute inset-[-4px] border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                )}
                <span className="text-6xl font-headline font-black text-secondary tracking-tighter">{score || '--'}</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80">{analyzing ? 'Scanning Dimensions' : score ? 'Synthesis Complete' : 'Awaiting Data'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Perfect Fit Items', val: 142, icon: 'verified', color: 'secondary' },
          { label: 'Avoid (High Risk)', val: 28, icon: 'warning', color: 'error' },
          { label: 'Avg Match Score', val: '89%', icon: 'analytics', color: 'primary' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 flex items-center justify-between group shadow-premium hover:shadow-premium-hover transition-all">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className={`text-3xl font-headline font-bold text-${stat.color}`}>{stat.val}</h3>
            </div>
            <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center border border-${stat.color}/20 group-hover:scale-110 transition-transform`}>
              <span className={`material-symbols-outlined text-xl text-${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Brand Size Mapping */}
        <section className="lg:col-span-4 space-y-8">
          <div className="glass-card p-10 shadow-premium sticky top-28 border-primary/10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-on-surface-variant">Retailer Mapping</h3>
              <span className="material-symbols-outlined text-primary text-xl">hub</span>
            </div>
            <div className="space-y-8">
              {[
                { brand: 'Zara', match: 92, color: 'secondary', rec: 'Medium (Regular Fit)' },
                { brand: 'H&M', match: 78, color: 'tertiary', rec: 'Large (Slim Fit)' },
                { brand: 'Uniqlo', match: 96, color: 'secondary', rec: 'Medium (Oversized)' },
                { brand: 'Nike', match: 45, color: 'error', rec: 'High compression risk' },
              ].map(b => (
                <div key={b.brand} className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.15em]">
                    <span className="text-on-surface">{b.brand}</span>
                    <span className={`text-${b.color}`}>{b.match}% Match</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-highest/40 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full bg-gradient-to-r from-${b.color} to-${b.color}-dim shadow-[0_0_8px_rgba(255,255,255,0.1)]`} style={{ width: `${b.match}%` }}></div>
                  </div>
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {b.color === 'error' ? 'Warning: ' : 'Rec: '}
                    <span className={`${b.color === 'error' ? 'text-error' : 'text-on-surface'}`}>{b.rec}</span>
                  </p>
                </div>
              ))}
            </div>
            <button className="btn-secondary w-full mt-10 !py-3.5 !text-[10px] uppercase tracking-[0.2em] font-black">
              View All 42 Identifiers
            </button>
          </div>
        </section>

        {/* Smart Product Feed */}
        <section className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
            <h3 className="text-xl font-headline font-bold text-on-surface uppercase tracking-tight">Smart Recommendations</h3>
            <div className="flex gap-2">
              <button className="w-10 h-10 border border-outline-variant/20 rounded-lg bg-surface-container-highest/20 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center"><span className="material-symbols-outlined text-lg">filter_list</span></button>
              <button className="w-10 h-10 border border-outline-variant/20 rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-all flex items-center justify-center"><span className="material-symbols-outlined text-lg">grid_view</span></button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {products.map((p, i) => (
              <div key={i} className="glass-card group shadow-premium hover:shadow-premium-hover transition-all duration-500 border-none relative flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src={p.img} alt={p.name} />
                  <div className="absolute top-4 left-4 bg-surface-container/70 backdrop-blur-md px-3.5 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-premium">
                    <div className={`w-2 h-2 rounded-full ${p.score > 90 ? 'bg-secondary' : 'bg-tertiary'} shadow-[0_0_8px_rgba(63,255,139,0.5)]`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${p.score > 90 ? 'text-secondary' : 'text-tertiary'}`}>Fit Index {p.score}</span>
                  </div>
                  <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container/70 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-premium">
                    <span className="material-symbols-outlined text-lg">favorite</span>
                  </button>
                </div>
                
                <div className="p-8 space-y-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <p className={`text-[9px] ${p.tagColor} font-black uppercase tracking-[0.2em]`}>{p.category}</p>
                      <h4 className="text-lg font-bold text-on-surface underline decoration-primary/20 decoration-2 underline-offset-4">{p.name}</h4>
                    </div>
                    <span className="text-lg font-black font-headline text-on-surface">{p.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-container-highest/10 border border-outline-variant/5">
                    <span className={`material-symbols-outlined text-base ${p.warn ? 'text-error' : 'text-secondary'}`}>{p.warn ? 'info' : 'check_circle'}</span>
                    <span className="text-[11px] font-bold text-on-surface-variant leading-tight">{p.detail}</span>
                  </div>
                  
                  <button className={`btn-primary w-full !py-4 mt-auto group/buy ${
                    p.warn 
                      ? '!bg-surface-container-highest/20 !text-on-surface-variant !border-outline-variant/10 hover:!bg-surface-container-highest/40 shadow-none' 
                      : 'shadow-premium'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Buy Now</span>
                    <span className="material-symbols-outlined text-sm group-hover/buy:translate-x-1 group-hover/buy:-translate-y-1 transition-transform">arrow_outward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SmartShopping;
