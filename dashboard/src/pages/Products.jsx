import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Products = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.fetchProducts();
        setProducts(data.map(p => ({
          id: p._id,
          name: p.name,
          sku: p.sku || 'N/A',
          status: p.status,
          fitScore: p.fit_score_avg,
          returnRate: `${p.return_rate}%`,
          tryOns: 'N/A', // Not in current schema
          price: `$${p.price.toFixed(2)}`,
          stock: p.stock,
          rating: p.rating,
          img: p.image_url
        })));
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const toggleSelect = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-12 uppercase tracking-tight">
      {/* Quick Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Avg Fit Score', val: '90.5', change: '+1.2%', color: 'primary', icon: 'trending_up', status: 'success' },
          { label: 'Avg Return Rate', val: '9.8%', change: '-0.5%', color: 'tertiary', icon: 'trending_down', status: 'danger' },
          { label: 'Total Try-Ons', val: '10.3K', sub: 'Global', color: 'secondary' },
          { label: 'High Risk Items', val: '2', sub: 'Action Required', color: 'error' },
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-8 flex flex-col justify-between shadow-premium border-l-4 border-${stat.color}`}>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={`font-headline text-3xl font-black text-${stat.color}`}>{stat.val}</h3>
              <div className="flex flex-col items-end">
                {stat.change && (
                  <span className={`${stat.status === 'success' ? 'text-secondary' : 'text-error'} text-[10px] font-black flex items-center gap-1`}>
                    <span className="material-symbols-outlined text-sm">{stat.icon}</span>{stat.change}
                  </span>
                )}
                {stat.sub && <span className="text-on-surface-variant text-[9px] font-black uppercase tracking-widest">{stat.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="glass-card shadow-premium overflow-hidden border-white/5">
        <div className="p-8 border-b border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <button className="btn-secondary !py-2 !px-4 !text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">filter_list</span> Filter
            </button>
            <button className="btn-secondary !py-2 !px-4 !text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">sort</span> Sort
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg bg-surface-container-highest/20 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg">file_download</span>
            </button>
            <button className="w-10 h-10 rounded-lg bg-surface-container-highest/20 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg">print</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/10 border-b border-outline-variant/10">
                <th className="px-8 py-5 w-16">
                  <div className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-outline-variant/20 bg-surface-container-highest/40 accent-primary cursor-pointer" />
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Product Logic</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Lifecycle</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Fit Dynamics</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-center">Score Delta</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-right">Inventory</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-right">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {products.map((p) => (
                <tr key={p.id} className={`group hover:bg-surface-container-highest/10 transition-all ${p.status === 'Low Stock' ? 'bg-error/5 hover:bg-error/10' : ''}`}>
                  <td className="px-8 py-6">
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="w-4 h-4 rounded border-outline-variant/20 bg-surface-container-highest/40 accent-primary cursor-pointer" 
                    />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-highest/20 shadow-premium border border-white/5 shrink-0">
                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={p.img} alt={p.name} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-on-surface leading-tight underline decoration-primary/10 group-hover:decoration-primary/40 underline-offset-4">{p.name}</p>
                        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-[0.15em] border ${
                      p.status === 'Active' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                      p.status === 'Low Stock' ? 'bg-error/10 text-error border-error/20' : 'bg-surface-container-highest/20 text-on-surface-variant border-outline-variant/10'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-40 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-on-surface-variant">{p.fitScore}% Accuracy</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-highest/20 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full bg-gradient-to-r ${p.fitScore > 80 ? 'from-primary to-secondary shadow-[0_0_8px_rgba(63,255,139,0.3)]' : 'from-error to-primary'}`} style={{ width: `${p.fitScore}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${parseFloat(p.returnRate) > 10 ? 'text-error' : 'text-secondary'}`}>{p.returnRate}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-sm font-black text-on-surface">{p.stock}</p>
                    <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mt-1">units</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-sm font-black font-headline text-on-surface">{p.price}</p>
                    <div className="flex justify-end mt-1.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary/10 border border-tertiary/10">
                        <span className="material-symbols-outlined text-[10px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-[9px] font-black text-tertiary">{p.rating}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">Showing <span className="text-on-surface">1-4</span> of <span className="text-on-surface">254</span> identifiers</p>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-highest/20 text-on-surface-variant hover:text-primary transition-all disabled:opacity-20 border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-black text-[10px] shadow-premium shadow-primary/20">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-highest/20 font-black text-[10px] transition-all border border-transparent hover:border-outline-variant/10">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-highest/20 font-black text-[10px] transition-all border border-transparent hover:border-outline-variant/10">3</button>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-highest/20 text-on-surface-variant hover:text-primary transition-all border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <button className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary flex items-center justify-center shadow-premium hover:shadow-premium-hover hover:scale-110 active:scale-95 transition-all z-50 group border border-white/10">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
      </button>
    </div>
  );
};

export default Products;
