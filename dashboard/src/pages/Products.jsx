import React, { useState, useEffect } from 'react';
import { productService, cartService, wardrobeService } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToWardrobe, setAddingToWardrobe] = useState(null);

  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getProducts();
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToWardrobe = async (product) => {
    try {
      setAddingToWardrobe(product.id);
      await wardrobeService.addToWardrobe(product);
      alert('Added to Wardrobe!');
    } catch (err) {
      console.error('Failed to add to wardrobe', err);
    } finally {
      setAddingToWardrobe(null);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(product.id);
      await cartService.addToCart({
        product_id: product._id || product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image_url: product.image_url,
        quantity: 1,
        size: 'M'
      });
      alert('Added to Cart!');
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12">
        <header>
          <div className="h-10 w-48 bg-zinc-200 rounded-lg shimmer mb-2"></div>
          <div className="h-4 w-64 bg-zinc-100 rounded shimmer"></div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] w-full bg-zinc-100 rounded-xl shimmer"></div>
              <div className="h-5 w-3/4 bg-zinc-100 rounded shimmer"></div>
              <div className="h-4 w-1/2 bg-zinc-100 rounded shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight text-zinc-900">Product Catalog</h1>
          <p className="text-zinc-500 mt-2 text-lg">Browse our latest collection of premium, fit-optimized apparel.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search items..." 
              className="bg-white border border-zinc-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none w-64"
            />
          </div>
          <button className="btn-secondary !py-2 !px-4 text-sm">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filters
          </button>
        </div>
      </header>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
        {products.map((p) => (
          <div key={p.id} className="group relative flex flex-col">
            {/* Image Container with Hover Zoom */}
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-100 mb-5 shadow-sm group-hover:shadow-md transition-all">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src={p.image_url} 
                alt={p.name} 
              />
              <div className="absolute top-4 right-4">
                <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-zinc-900 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="material-symbols-outlined text-lg">favorite</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-zinc-900 text-lg group-hover:text-primary transition-colors">{p.name}</h3>
                <span className="font-bold text-zinc-900">${p.price.toFixed(2)}</span>
              </div>
              <p className="text-zinc-500 text-sm mb-6">{p.category}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-2 w-full">
                <button 
                  onClick={() => handleAddToWardrobe(p)}
                  disabled={addingToWardrobe === p.id}
                  className={`py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all overflow-hidden flex items-center justify-center gap-1 ${
                    addingToWardrobe === p.id 
                      ? 'bg-secondary text-white' 
                      : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                  }`}
                >
                  {addingToWardrobe === p.id ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                      <span>Syncing</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">favorite</span>
                      <span>Wardrobe</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleAddToCart(p)}
                  disabled={addingToCart === p.id}
                  className={`py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all overflow-hidden flex items-center justify-center gap-1 ${
                    addingToCart === p.id 
                      ? 'bg-primary text-white' 
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {addingToCart === p.id ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                      <span>Adding</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">shopping_cart</span>
                      <span>Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pt-10 border-t border-zinc-100 flex items-center justify-between">
        <p className="text-sm text-zinc-500 font-medium">Showing 1-12 of 50 products</p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30" disabled>Previous</button>
          <button className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Products;
