import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GEMINI_API_KEY = 'AIzaSyB2M-R0x2C0msXbbwLnQiUmu_4J4P3NGg4';
const GEMINI_MODEL = 'gemini-2.5-flash';

const Wardrobe = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [scanResultSummary, setScanResultSummary] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      loadWardrobe();
    }
  }, [user]);

  const loadWardrobe = async () => {
    try {
      const data = await api.fetchWardrobe(user.id);
      setInventory(data);
    } catch (err) {
      console.error('Failed to load wardrobe:', err);
      setError('Connection to Wardrobe Database failed.');
    }
  };

  const calculateMetrics = () => {
    const metrics = {
      Tops: 0,
      Bottoms: 0,
      Outerwear: 0,
      Shoes: 0,
      Other: 0
    };

    inventory.forEach(item => {
      const type = (item.item_type || '').toLowerCase();
      if (type.includes('shirt') || type.includes('top') || type.includes('tee') || type.includes('hoodie')) metrics.Tops++;
      else if (type.includes('pant') || type.includes('jean') || type.includes('trouser') || type.includes('short')) metrics.Bottoms++;
      else if (type.includes('jacket') || type.includes('coat') || type.includes('blazer')) metrics.Outerwear++;
      else if (type.includes('shoe') || type.includes('sneaker') || type.includes('boot')) metrics.Shoes++;
      else metrics.Other++;
    });

    return metrics;
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setScanResultSummary(null);

    try {
      const base64 = await toBase64(file);
      const base64Data = base64.split(',')[1];
      const mimeType = file.type;

      // VISION ANALYSIS
      const geminiResult = await callGeminiVision(base64Data, mimeType);
      
      let detectedItems = [];
      try {
        const jsonMatch = geminiResult.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        detectedItems = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      } catch (e) {
        throw new Error('AI Vision produced malformed extraction.');
      }

      if (detectedItems.length === 0) throw new Error('No clothing items identified in frame.');

      // UPLOAD ALL DETECTED ITEMS
      for (const item of detectedItems) {
        const payload = {
          user_id: user.id,
          item_type: item.item_type || 'Unknown Item',
          color: item.color || 'Unknown Color',
          brand: item.brand || 'Unknown Brand',
          size_label: item.size_label || 'detected',
          image_url: base64
        };
        await api.addToWardrobe(payload);
      }

      setScanResultSummary({
        count: detectedItems.length,
        items: detectedItems
      });

      await loadWardrobe();
      
    } catch (err) {
      console.error('Scan Fail:', err);
      setError(err.message || 'AI Vision processing failed.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const callGeminiVision = async (base64Data, mimeType) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const body = {
      contents: [{
        parts: [
          { text: "Identify all clothing items in this image. Return ONLY a JSON array of objects with keys: item_type, color, brand, size_label." },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Vision Engine Link Failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const metrics = calculateMetrics();

  const filteredItems = inventory.filter(item => 
    (filter === 'All Items' || item.item_type.toLowerCase().includes(filter.toLowerCase())) &&
    (item.item_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-10 uppercase tracking-tight relative">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-10 text-center">
          <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-black text-on-surface tracking-[0.4em] mb-4 shadow-sm">AI PERCEPTION ACTIVE</h2>
          <p className="text-on-surface-variant max-w-sm italic lowercase first-letter:uppercase leading-relaxed">Cross-referencing brand archives and color spectrums. Synthesizing garment geometry...</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-[320px] flex-shrink-0 space-y-6">
          <div className="glass-card p-8 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline font-bold text-base text-primary uppercase tracking-[0.15em]">Wardrobe Scan</h3>
              <span className="material-symbols-outlined text-tertiary text-xl">linked_camera</span>
            </div>
            
            <div className="space-y-4">
              <div 
                onClick={handleUploadClick}
                className="aspect-square rounded-lg bg-surface-container-highest/20 border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center p-6 group cursor-pointer hover:border-primary/40 hover:bg-surface-container-highest/30 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary mb-3 transition-colors">cloud_upload</span>
                <p className="text-[13px] font-black uppercase tracking-widest text-on-surface">Upload Clothing</p>
                <p className="text-[11px] text-on-surface-variant mt-1.5 uppercase font-bold">Automatic Detection</p>
              </div>

              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">warning</span> {error}
                </div>
              )}
            </div>
            
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2.5">Vision Engine</p>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400' : 'bg-secondary'} animate-pulse shadow-[0_0_8px_rgba(63,255,139,0.5)]`}></span>
                <span className="text-[11px] font-black text-on-surface uppercase tracking-wider">
                  {isProcessing ? 'Scanning Archive...' : 'Ready for Input'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 shadow-premium">
            <h3 className="font-headline font-bold text-xs text-on-surface-variant mb-8 uppercase tracking-[0.2em]">Closet Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tops', val: metrics.Tops, color: 'primary' },
                { label: 'Bottoms', val: metrics.Bottoms, color: 'secondary' },
                { label: 'Outerwear', val: metrics.Outerwear, color: 'tertiary' },
                { label: 'Shoes', val: metrics.Shoes, color: 'on-surface' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface-container-highest/10 p-4 rounded-lg border border-outline-variant/5">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className={`text-2xl font-headline font-bold text-${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-10">
          {/* SCAN SUCCESS REPORT */}
          {scanResultSummary && (
            <div className="glass-card p-8 border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center border border-secondary/20">
                    <span className="material-symbols-outlined text-secondary text-xl">verified</span>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-on-surface uppercase tracking-[0.25em]">AI Detection Report</h4>
                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mt-0.5">{scanResultSummary.count} Item(s) successfully cataloged</p>
                  </div>
                </div>
                <button onClick={() => setScanResultSummary(null)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scanResultSummary.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-highest/20 border border-outline-variant/10">
                    <div className="w-2 h-10 rounded-full bg-secondary"></div>
                    <div>
                      <h5 className="text-[13px] font-black text-on-surface uppercase tracking-wider">{item.item_type}</h5>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                        <span className="text-secondary">{item.color}</span> • {item.brand} • {item.size_label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All Items', 'Tops', 'Bottoms', 'Shoes'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                    filter === cat ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-highest/20 text-on-surface-variant border border-outline-variant/10 hover:bg-surface-container-highest/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
               <input 
                placeholder="Search Closet..." 
                className="bg-surface-container-highest/20 border border-outline-variant/10 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary/40 outline-none w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredItems.map((item, i) => (
              <div key={i} className="glass-card group shadow-premium hover:shadow-premium-hover transition-all duration-500 border-none relative flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.image_url || 'https://via.placeholder.com/300x400?text=Scan+Processing'} alt={item.item_type} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 rounded bg-surface-container/60 backdrop-blur-md text-[9px] font-black text-primary border border-primary/20 uppercase tracking-[0.2em]">{item.size_label}</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-headline font-bold text-lg text-on-surface leading-tight underline decoration-primary/20 decoration-2 underline-offset-4">{item.item_type}</h4>
                    <span className="text-secondary font-black text-[10px] uppercase tracking-widest mt-1 bg-secondary/10 px-2 py-0.5 rounded">Synced</span>
                  </div>
                  <div className="flex items-center gap-5 mb-6">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{item.color}</span>
                    <span className="text-[11px] font-black text-tertiary uppercase tracking-widest">{item.brand}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-24 text-center glass-card border-dashed">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">inventory_2</span>
                <p className="text-on-surface-variant font-black uppercase tracking-widest text-[11px]">No matching archives found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;
