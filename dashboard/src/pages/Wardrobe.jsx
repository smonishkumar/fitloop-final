import React, { useState } from 'react';

const Wardrobe = () => {
  const [filter, setFilter] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');

  const inventory = [
    { name: 'Cashmere Overcoat', brand: 'Zara Heritage', category: 'Tops', color: 'Navy Blue', colorCode: '#0a1a3a', score: 'A+ Score', tags: ['Formal', 'Winter'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC96YcqNte6GJryD06yUePP_m5oaW8IjqvasgGXiCagqigNot2MoEtDkFqMP2U4fSmtRjl2VFVsrEBMIiLdwpMuhWyZjT3bLbEN68hRk615Q_dQxpBjJiwwwUzs9aeyrJWfGz1Jph2u0NwN6T1pJF75JN4WZCSHj_57l3tYkPGgNE1jyYX8tDrWgqTGYTE81du6il9k_YL0DBiqdLl4GDD64GTg7cN4uXpXCASK27y70E6GgwpA8KdoL5L92lONrFtdb4_MK_Xw41c' },
    { name: 'Slim Fit Selvedge', brand: "Levi's Premium", category: 'Bottoms', color: 'Indigo', colorCode: '#1c2e4a', score: 'B+ Score', tags: ['Casual', 'All Season'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2rFRgVF56zSEyH1CFKKhQQrxgUiXRAM3hl3hDnXMatvTrgMVMI-qMxl-ZoXAg3thPl-mI6gH0Eu1kjyNtyo2l0wr9puNEKJ_Q1D2HvpNxPBHZ-Ouf8SnZnwK1QVT_xDeTKVLMpR-XJFNCvUEMwPNGuL2wxC0SZFmV59XSR3940xZHHOk78v3NSzUQtf5zT7qnvA7dKnSgUH-COT7fjI-jxVKRzF4GO3nrSdR2vgiN1OdK0FOSlNQRRdydlcSsfLy84d46Bd0LCuA' },
    { name: 'Supima Cotton Tee', brand: 'Uniqlo U', category: 'Tops', color: 'Arctic White', colorCode: '#ffffff', score: 'Essential', tags: ['Basics', 'Summer'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUbgXu9hNQJ9yR-BO33P2a5WWuZNbtvx3o43yvCazrGF-2TZcFK0qgDPlZ20uAfmGpveqydrvU3waYuGmLcG_v2vx7P3dGG52D9B4i5zR-Gq9v-dIEo4HGuyC_Qh91BaCeOQ4ecx0jaIqvFpKlnEDYHv9RM6Bwy0jLF2xtPiklMEeq8X3bSTd7VbMFHDJrvrOLvI5KOTnE4zR2FXJS_ohrqABHa1uclg8ZWh5zY52Gzucgu_CnKRaQMMJ7K5ItfoBuzvfFADRmiOM' },
  ];

  const filteredItems = inventory.filter(item => 
    (filter === 'All Items' || item.category === filter) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-10 uppercase tracking-tight">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: Wardrobe Scan & Stats */}
        <div className="lg:w-[320px] flex-shrink-0 space-y-6">
          <div className="glass-card p-8 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline font-bold text-base text-primary uppercase tracking-[0.15em]">Wardrobe Scan</h3>
              <span className="material-symbols-outlined text-tertiary text-xl">linked_camera</span>
            </div>
            <div className="space-y-4">
              <div className="aspect-square rounded-lg bg-surface-container-highest/20 border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center p-6 group cursor-pointer hover:border-primary/40 hover:bg-surface-container-highest/30 transition-all duration-300">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary mb-3 transition-colors">cloud_upload</span>
                <p className="text-[13px] font-black uppercase tracking-widest text-on-surface">Upload Clothing</p>
                <p className="text-[11px] text-on-surface-variant mt-1.5 uppercase font-bold">PNG, JPG &lt; 10MB</p>
              </div>
              <button className="btn-secondary w-full group !py-3.5 mt-2">
                <span className="material-symbols-outlined text-lg text-secondary transition-transform group-hover:scale-110">photo_camera</span>
                <span className="text-[12px] uppercase tracking-widest font-black">Scan via Camera</span>
              </button>
            </div>
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-2.5">AI Perception Status</p>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(63,255,139,0.5)]"></span>
                <span className="text-[12px] font-black text-on-surface uppercase tracking-wider">Vision Engine Online</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 shadow-premium">
            <h3 className="font-headline font-bold text-sm text-on-surface-variant mb-8 uppercase tracking-[0.15em]">Inventory Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tops', val: 42, color: 'tertiary' },
                { label: 'Bottoms', val: 28, color: 'secondary' },
                { label: 'Outerwear', val: 15, color: 'primary' },
                { label: 'Shoes', val: 12, color: 'on-surface' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface-container-highest/20 p-4 rounded-lg border border-outline-variant/5">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className={`text-2xl font-headline font-bold text-${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-outline-variant/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">Digital Sync</span>
                <span className="text-[12px] font-black text-secondary">84%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_8px_rgba(63,255,139,0.3)]" style={{ width: '84%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Filters & Wardrobe Grid */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All Items', 'Tops', 'Bottoms', 'Shoes', 'Accessories'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2.5 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all ${
                    filter === cat ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-highest/20 text-on-surface-variant border border-outline-variant/10 hover:bg-surface-container-highest/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="w-10 h-10 rounded-lg bg-surface-container-highest/20 border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">filter_list</span>
              </button>
              <button className="w-10 h-10 rounded-lg bg-surface-container-highest/20 border border-outline-variant/10 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">grid_view</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredItems.map((item, i) => (
              <div key={i} className="glass-card group shadow-premium hover:shadow-premium-hover transition-all duration-500 border-none relative flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.img} alt={item.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 rounded bg-surface-container/60 backdrop-blur-md text-[10px] font-black text-primary border border-primary/20 uppercase tracking-[0.2em]">Premium Fit</span>
                  </div>
                  <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container/60 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-premium">
                    <span className="material-symbols-outlined text-lg">favorite</span>
                  </button>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-headline font-bold text-lg text-on-surface leading-tight underline decoration-primary/20 decoration-2 underline-offset-4">{item.name}</h4>
                    <span className="text-secondary font-black text-[11px] uppercase tracking-widest mt-1 bg-secondary/10 px-2 py-0.5 rounded">{item.score}</span>
                  </div>
                  <div className="flex items-center gap-5 mb-6">
                    <span className="text-[12px] font-bold text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-inner" style={{ backgroundColor: item.colorCode }}></span> {item.color}
                    </span>
                    <span className="text-[12px] font-black text-tertiary uppercase tracking-widest">{item.brand}</span>
                  </div>
                  <div className="flex gap-2.5 mt-auto">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded bg-surface-container-highest/30 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant border border-outline-variant/10">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-24 text-center glass-card border-dashed">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">inventory_2</span>
                <p className="text-on-surface-variant font-black uppercase tracking-widest text-[11px]">No matching items detected.</p>
              </div>
            )}
          </div>

          <div className="glass-card p-10 flex flex-col md:flex-row items-center justify-between mt-8 shadow-premium border-tertiary/10 bg-gradient-to-r from-tertiary/5 to-transparent">
            <div className="flex items-center gap-8 mb-6 md:mb-0">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div>
                <h4 className="text-lg font-headline font-bold text-on-surface uppercase tracking-tight">Intelligence Report</h4>
                <p className="text-on-surface-variant text-[13px] mt-1.5 leading-relaxed">AI detected 12 missing essentials for your upcoming <span className="text-primary font-bold">Tokyo Trip</span>.</p>
              </div>
            </div>
            <button className="btn-primary !px-10 !py-4 group">
              <span className="text-xs font-black uppercase tracking-[0.2em]">View Analysis</span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;
