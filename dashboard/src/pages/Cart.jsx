import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cartService, wardrobeService } from '../services/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      setCartItems(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Could not load your shopping cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await cartService.removeFromCart(id);
      setCartItems(cartItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      // Simulate moving all items to wardrobe
      for (const item of cartItems) {
        await wardrobeService.addToWardrobe({
          product_id: item.product_id,
          name: item.name,
          category: item.category,
          image_url: item.image_url,
          status: 'Added'
        });
        await cartService.removeFromCart(item.id);
      }
      setCartItems([]);
      alert("Checkout successful! Items added to your wardrobe.");
      navigate('/wardrobe');
    } catch (err) {
      console.error('Checkout failed:', err);
      alert("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse text-zinc-900 px-6 max-w-5xl mx-auto py-10">
        <div className="h-10 w-48 bg-zinc-200 rounded-lg"></div>
        <div className="flex gap-10">
          <div className="flex-1 space-y-6">
            {[1, 2].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-xl"></div>)}
          </div>
          <div className="w-80 h-64 bg-zinc-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Oops!</h2>
        <p className="text-zinc-500 mt-2">{error}</p>
        <button onClick={fetchCart} className="mt-6 btn-secondary !py-2 !px-6">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight font-headline">Shopping Cart</h1>
        <p className="text-zinc-500 mt-1">{cartItems.length} items waiting for checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8">
            Looks like you haven't added any items to your cart yet. Explore our precision-fit catalog to find your perfect style.
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="btn-primary !px-8 hover:scale-105 transition-transform shadow-lg"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="glass-card p-6 flex flex-col sm:flex-row gap-6 relative group border border-zinc-200">
                <div className="w-32 h-40 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover object-center mix-blend-multiply" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{item.category}</p>
                      <h3 className="text-xl font-bold text-zinc-900">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">Size {item.size || 'M'}</span>
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Perfect Match
                        </span>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-zinc-900">${item.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-zinc-500">Qty:</span>
                      <span className="text-sm font-bold text-zinc-900">{item.quantity}</span>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-bold active:scale-95 group/btn"
                    >
                      <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="glass-card p-6 sticky top-28 bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 group">
              <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full -mt-20 -mr-20 pointer-events-none group-hover:bg-primary/20 transition-colors duration-1000"></div>
              
              <h3 className="text-lg font-bold mb-6 relative z-10">Order Summary</h3>
              
              <div className="space-y-4 text-sm relative z-10">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Estimated Tax</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3 relative z-10">
                <button 
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full bg-white text-zinc-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-100 active:scale-95 transition-all overflow-hidden relative group/checkout shadow-lg"
                >
                  {checkingOut ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Secure Checkout
                      <ArrowRight className="w-4 h-4 group-hover/checkout:translate-x-1 group-hover/checkout:scale-110 transition-all" />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-zinc-500 font-medium uppercase tracking-widest flex items-center justify-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Encrypted Payment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
