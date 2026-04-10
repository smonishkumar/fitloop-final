import React, { useState } from 'react';

const VirtualTryOn = () => {
  const [activePerspective, setActivePerspective] = useState('Front');
  const [selectedProduct, setSelectedProduct] = useState('Slim Chino Trousers');
  const [height, setHeight] = useState(184);
  const [weight, setWeight] = useState(78);

  const products = [
    { name: 'Floral Midi Dress', desc: 'Luxe Silk Blend', price: '$189.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLtxggzoMQZnLfBize2VXA87HqRzyFuu-EimgvXip3nsGUzc_A_MZtzneQouf48ni6oh3Wz_81nYhylIXLy8p1XNFITKcc0ml9DJjzQKLr03jbHNeDJnu2at1rOWILO01ljeIDGb0-J4jXH-7szIs3XVzUfoUaSyBELFUUZkEqv4aXexdiXTqApXlcm8syT9gJFaKlD_7bKIJCc9g_vrHS0KJcg6KIuJfDxFOsmpDu_cRkZidsHW1nnkojmv4Gk8dD5_6_13QHiMU' },
    { name: 'Slim Chino Trousers', desc: 'Premium Cotton', price: '$124.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcqbQmvvaVh82WduJW7r8eVmHwsWREj1i2CyhPOsnJOqEa9Vdsgrp0fRHn0xfIOpWtPjdJxclO-hR_KLEJpwO8fL0d0jChoKolvghsn4n439o8rWdbvzQJCd3YTJobv4IY6lFvNupwUNoOtf0srINhebg6ZNwv2TkfD92temOAB7dRKSD8zmqz7_5cSvq_loKSJmOt2AasBfbt3cTP3KWezpfM5A_hY78m46EKzgDfcyLuu-ZbJsQknfxRqPKkbCaCF4UhhdTlKDU' },
    { name: 'Structured Blazer', desc: 'Tailored Fit', price: '$245.00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB75Y_CtG2wWJJsZo2AjXB-NrgOSZr8vqe_9kzvUzKk17YAJYG5kujh_u5hrH8c409ZoHl7BcWxEhBSg7jZlbxph0XBF5VMdySJ_CoBB4XwUrYT80Ea1kuFz03LJso9MRqoK4E4CJYOeiyewgpHZrhYikxkAIVNd1s4vUHJVU7xaHe-VqQ9QAtVB7oriWVBPkLgYQyOrETaeRJdOF9l7b6bnQG6LZb3ZKQnQ6kOKXHu70FqqhrEA1K-VH4NHeld_6UHeucYwRramFk' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full uppercase tracking-tight">
      {/* Sidebar: Select Product */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-8 h-full">
        <section className="glass-card p-8 flex-1 flex flex-col shadow-premium min-h-0">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-base font-bold text-on-surface uppercase tracking-[0.15em]">Select Product</h2>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-lg">filter_list</span>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide">
            {products.map(p => (
              <div 
                key={p.name}
                onClick={() => setSelectedProduct(p.name)}
                className={`group rounded-lg p-3 flex gap-4 cursor-pointer transition-all border ${
                  selectedProduct === p.name 
                    ? 'bg-primary/10 border-primary/30 shadow-inner' 
                    : 'bg-surface-container-highest/10 border-outline-variant/5 hover:border-primary/20 hover:bg-surface-container-highest/30'
                }`}
              >
                <img className="w-16 h-20 object-cover rounded shadow-premium" src={p.img} alt={p.name} />
                <div className="flex flex-col justify-center">
                  <p className={`text-[11px] font-black uppercase tracking-widest transition-all ${selectedProduct === p.name ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>{p.name}</p>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">{p.desc}</p>
                  <p className="text-[10px] font-black mt-3 text-secondary tracking-widest">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="glass-card p-8 shadow-premium shrink-0">
          <h2 className="font-headline text-sm font-bold mb-8 text-on-surface-variant uppercase tracking-[0.15em]">Body Matrix</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-1.5 bg-surface-container-highest/20 rounded-lg border border-outline-variant/10">
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-on-primary rounded shadow-premium">Male</button>
              <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">Female</button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Height</span>
                <span className="text-[10px] font-black text-primary tracking-widest">{height} cm</span>
              </div>
              <input 
                className="input-standard !p-0 !h-1 appearance-none cursor-pointer accent-primary" 
                type="range" 
                min="140" max="220" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Weight</span>
                <span className="text-[10px] font-black text-primary tracking-widest">{weight} kg</span>
              </div>
              <input 
                className="input-standard !p-0 !h-1 appearance-none cursor-pointer accent-primary" 
                type="range"
                min="40" max="150"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <button className="btn-secondary w-full group !py-3.5 mt-4">
              <span className="material-symbols-outlined text-sm text-primary transition-transform group-hover:scale-110">settings_suggest</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Update Synthesis</span>
            </button>
          </div>
        </section>
      </div>

      {/* Center: 3D Visualization */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-10 h-full">
        <section className="glass-card flex-1 relative overflow-hidden flex flex-col shadow-premium border-primary/5">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-surface-container/60 backdrop-blur-2xl rounded-full border border-white/10 z-20 shadow-premium">
            {['Front', 'Side', 'Back'].map(p => (
              <button 
                key={p}
                onClick={() => setActivePerspective(p)}
                className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                  activePerspective === p 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          
          <div className="flex-1 flex items-center justify-center relative py-20">
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full"></div>
              </div>
              <img 
                className="h-full max-h-[600px] object-contain [filter:drop-shadow(0_0_60px_rgba(186,158,255,0.2))] transition-transform duration-1000 hover:scale-[1.03]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVTsuG_zjBIiQSKS8pa0ltCE2whUKuDUfDenmxJ1auozeZDxh2T6OnB6ODyKuG_5syNWTKxNfG1MGbzKipRY9zMYX9qwpgExE1WcpLxBPH4siIVagbOY0hPfZkZr2HYpvwDSYPdFJ8RjTNSyb6dPkyX_qcFMZZ-lhKqEcIEImLo8hoR1eeFa2Z1IyWbEYTI2OSufJ7S5OI6_koIzd5L2ujOXMFXsUVIXSSCgePcwEWbMEyUXFP7rsvEL2Z7EC7LgbdXnXnz4xRiSA" 
                alt="3D Mannequin" 
              />
              <div className="absolute top-[35%] right-[25%] glass-card rounded-lg px-4 py-2 border-l-4 border-secondary flex items-center gap-3 shadow-premium animate-bounce-subtle z-10">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-[10px] font-black text-on-surface uppercase tracking-[0.1em]">Optimal Waist Drop</span>
              </div>
              <div className="absolute bottom-[30%] left-[20%] glass-card rounded-lg px-4 py-2 border-l-4 border-tertiary flex items-center gap-3 shadow-premium z-10">
                <span className="material-symbols-outlined text-tertiary text-lg">info</span>
                <span className="text-[10px] font-black text-on-surface uppercase tracking-[0.1em]">Hem Modification Rec.</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container/20">
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:bg-surface-container-highest/60 transition-all text-on-surface shadow-premium border border-white/5">
                <span className="material-symbols-outlined text-lg">zoom_in</span>
              </button>
              <button className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:bg-surface-container-highest/60 transition-all text-on-surface shadow-premium border border-white/5">
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end gap-1.5">
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Render Precision</span>
                <div className="h-1 w-32 bg-surface-container-highest/40 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary shadow-[0_0_8px_rgba(186,158,255,0.4)]"></div>
                </div>
              </div>
              <span className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-3 py-1.5 rounded-lg border border-secondary/20 shadow-premium">Elite Fidelity</span>
            </div>
          </div>
        </section>
      </div>

      {/* Right Panel: Analytics */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-8 h-full">
        <section className="glass-card p-10 text-center shadow-premium bg-gradient-to-b from-secondary/5 to-transparent">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/80 font-black mb-10">Fit Fidelity Score</h3>
          <div className="relative inline-flex items-center justify-center mb-8">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle className="text-surface-container-highest/20" cx="80" cy="80" fill="transparent" r="72" stroke="currentColor" strokeWidth="6"></circle>
              <circle className="text-secondary transition-all duration-1000 shadow-premium-hover" cx="80" cy="80" fill="transparent" r="72" stroke="currentColor" strokeDasharray="452.39" strokeDashoffset="13.57" strokeWidth="8" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-headline text-5xl font-black text-on-background tracking-tighter">97</span>
              <span className="text-[10px] uppercase text-secondary font-black tracking-[0.25em] mt-2">Elite Match</span>
            </div>
          </div>
          <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed px-4">High accuracy match based on 3D volumetric analysis and textile elasticity.</p>
        </section>
        
        <section className="glass-card p-8 flex-1 flex flex-col shadow-premium min-h-0">
          <h3 className="font-headline text-sm font-bold mb-8 text-on-surface-variant uppercase tracking-[0.15em]">Sizing Delta</h3>
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide">
            {[
              { label: 'Chest Coverage', val: '102.4 cm', status: 'ok' },
              { label: 'Waist Clearance', val: '84.2 cm', status: 'ok' },
              { label: 'Hip Tension', val: '98.5 cm', status: 'ok' },
              { label: 'Inseam Deviation', val: '81.0 cm', status: 'warn' },
            ].map(b => (
              <div key={b.label} className="flex items-center justify-between p-4 bg-surface-container-highest/10 border border-outline-variant/10 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg ${b.status === 'ok' ? 'bg-secondary/10' : 'bg-tertiary/10'} flex items-center justify-center border ${b.status === 'ok' ? 'border-secondary/20' : 'border-tertiary/20'}`}>
                    <span className={`material-symbols-outlined ${b.status === 'ok' ? 'text-secondary' : 'text-tertiary'} text-base`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {b.status === 'ok' ? 'check' : 'priority_high'}
                    </span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">{b.label}</span>
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest ${b.status === 'warn' ? 'text-tertiary' : 'text-on-surface'}`}>{b.val}</span>
              </div>
            ))}
          </div>
        </section>
        
        <section className="glass-card p-8 text-on-surface shadow-premium border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary">Intelligence Recommendation</h4>
          </div>
          <p className="text-[13px] leading-relaxed font-medium mb-8">
            Select <span className="text-primary font-black">Size 32L</span>. Your biometric inseam indicates the regular fit will sit 2cm above the optimal break point.
          </p>
          <button className="btn-primary w-full group !py-3.5 !text-[10px] uppercase font-black tracking-[0.2em]">
            <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">add_shopping_cart</span>
            Add Recommended Size
          </button>
        </section>
      </div>
    </div>
  );
};

export default VirtualTryOn;
