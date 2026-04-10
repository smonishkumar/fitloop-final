import React, { useState, useEffect } from 'react';

const VirtualTryOn = () => {
  const [activePerspective, setActivePerspective] = useState('Front');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [height, setHeight] = useState(184);
  const [weight, setWeight] = useState(78);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await fetch('/data/catalog.json');
        const data = await res.json();
        setProducts(data.slice(0, 8)); // Just show a few for selection
        setSelectedProduct(data[0]);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center shimmer w-full rounded-2xl"></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
      {/* Sidebar: Select Product */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 h-full">
        <section className="glass-card p-8 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-zinc-900">Choose Apparel</h2>
            <button className="text-zinc-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {products.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`group relative rounded-xl aspect-[3/4] cursor-pointer transition-all border-2 overflow-hidden ${
                  selectedProduct?.id === p.id 
                    ? 'border-primary shadow-md' 
                    : 'border-transparent bg-zinc-50'
                }`}
              >
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={p.image_url} alt={p.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">{p.name}</p>
                </div>
                {selectedProduct?.id === p.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-xs">check</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        
        <section className="glass-card p-8 shrink-0">
          <h2 className="text-sm font-bold mb-8 text-zinc-500 uppercase tracking-widest">Your Proportions</h2>
          <div className="space-y-8">
            <div className="flex bg-zinc-100 p-1 rounded-lg">
              <button className="flex-1 py-2 text-xs font-bold bg-white shadow-sm rounded-md text-zinc-900">Male</button>
              <button className="flex-1 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Female</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-zinc-500">Height</span>
                <span className="text-sm font-bold text-zinc-900">{height} cm</span>
              </div>
              <input 
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                type="range" min="150" max="210" value={height} 
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-zinc-500">Weight</span>
                <span className="text-sm font-bold text-zinc-900">{weight} kg</span>
              </div>
              <input 
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                type="range" min="45" max="130" value={weight} 
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            
            <button className="btn-primary w-full !py-4 mt-4">
              <span className="material-symbols-outlined text-xl">refresh</span>
              Update Simulation
            </button>
          </div>
        </section>
      </div>

      {/* Center: Real Human Model Rendering */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-10 h-full">
        <section className="glass-card flex-1 relative overflow-hidden flex flex-col bg-slate-50 border-white/40 shadow-premium">
          {/* Perspective Tabs */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center p-1 bg-white/60 backdrop-blur-xl rounded-full border border-zinc-200 z-20 shadow-sm">
            {['Front', 'Side', 'Back'].map(p => (
              <button 
                key={p}
                onClick={() => setActivePerspective(p)}
                className={`px-10 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activePerspective === p 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          
          <div className="flex-1 flex items-center justify-center relative pt-32 pb-20">
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-zinc-200/50 to-transparent pointer-events-none"></div>
            
            <div className="relative h-full flex flex-col items-center">
              {/* Actual Human Model Placeholder */}
              <img 
                className={`h-full max-h-[700px] object-contain drop-shadow-2xl transition-all duration-700 ${activePerspective === 'Side' ? 'rotate-y-180' : ''}`}
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" 
                alt="Human Model" 
              />
              
              {/* Product Overlay Context */}
              {selectedProduct && (
                <div className="absolute top-1/2 -right-40 -translate-y-1/2 glass-card p-6 w-56 animate-fade-in border-primary/20 bg-white/90">
                  <div className="flex items-center gap-3 mb-4">
                    <img className="w-12 h-16 object-cover rounded shadow-sm" src={selectedProduct.image_url} alt={selectedProduct.name} />
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 leading-tight">{selectedProduct.name}</h4>
                      <p className="text-[10px] font-bold text-secondary mt-1">${selectedProduct.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-zinc-400 uppercase tracking-widest">Fit Score</span>
                      <span className="text-secondary font-black">94%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8 flex items-center justify-between border-t border-zinc-200 bg-white/40">
            <div className="flex gap-4">
              <button 
                onClick={() => alert('Zoom functionality coming soon...')}
                className="w-11 h-11 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-zinc-600">zoom_in</span>
              </button>
              <button 
                onClick={() => alert('Calibration reset...')}
                className="w-11 h-11 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-zinc-600">restart_alt</span>
              </button>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rendering Precision</span>
                <span className="text-sm font-bold text-zinc-900">4K Ultra Fidelity</span>
              </div>
              <button 
                onClick={() => alert('Selections confirmed! AI rendering updated.')}
                className="btn-primary !px-8 active:scale-95 transition-all"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VirtualTryOn;
