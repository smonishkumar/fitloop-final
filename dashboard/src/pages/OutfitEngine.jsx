import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const OutfitEngine = () => {
  const { user } = useAuth();
  const [activeOccasion, setActiveOccasion] = useState('All Outfits');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [recommendationResult, setRecommendationResult] = useState(null);

  const outfits = [
    { 
      name: 'Smart Casual Friday', 
      desc: 'A balance of executive authority and creative comfort.', 
      match: '98%', 
      color: 'secondary',
      items: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDqFI4i9M9DAeGelkPrpFHqhhEnc8Tq9ZGpxtQX_eIf_3E1HiJVzWYmejgOCLPiaNrNCqN6x5-QbucBp1wTxqF_ITBCOKThbs8FO1PLgs7FgNM4y7YzZZFZc1O5iuPuZyZQxdbsArG3iWr8c5NgxqfUzwJZjThNpMDgQt_5Jlr_AWvmv1fcNBhzZHSABj63wnI02mQFmtSCPuny7U8Jv6BcFetBGTfXW66EjsGkIbgLEga91-6kYHRsbmScQK8P1SNRNB9chpj2J4k',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB23X9uGEw4HAjq6MtrB1tSrU_1G3nt9q3wFkb71-kAE4_CONuFNlXh_O6yPiTERs3s4hSJYGzbyN6hSQHhrGrED7eo3WB3jxh7zVq768D3SRk-Iq6JdHeYAtKfA2uzccXhPDSelco2p58KOe2gRXZD7jwkXcWvn45m_E1ToxLvP8nGtSlyMKw-5FbKrOKFIrKwYQBGj9VlZUqS0sKfRw_41YaQCXxC2lqdxWxrzSx1OcEJ139INiujPgQ51Hpy3f1rc4UX9BoQJO4',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA3uSBx5i5AmQH0s04JnUm7A0W_q7XSiZogDZZn1XikWhOikG6zFQFOvCQNc-5EC9BVTNqmp_9ankuozLh87dU6awxKZtorxHxupOpjSyhuHS4z3W-b_KEsdcxXThWkihFQNaAjiMx29PS4ZmCC4WMg-P8apVFgM9JRE9ULlVkWWQT606_adpAYe5ygADU6J-ezjcVUbibh0y93FSCpvcc565gHnjQqrcJa_FI5R3Zh2nEk52HJ1SguG1ej0BAVkLz9rR88Qwl9riA'
      ]
    },
    { 
      name: 'Summer Date Night', 
      desc: 'Edge meets elegance for an evening in the city.', 
      match: '84%', 
      color: 'tertiary',
      items: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCHJNBWvkZP4trKauV-4KAtbmXLb0gurbqMQO9oAix4_iZxBAMpF07rBff8vjm19JjSyF7gH51y2rOm1Paqsd6PKZUm-F18byYVLa4kbJ9bTc-H8q7arO_F6-R-jcmfboXnFOQR7YXmjrrO_3R28MbETFj7SCQp_pVY2PuzIQnhK7fw_A7dhXBJ2RL8UMtswTZLbXvFnKfMF3SmNDaJ9ODaAneQS1wCy2pSZpf6_KrS2Wo5LS0jSUFOhDPSAGEE4nXq57cy1gb2x6E',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOp1bx0U8KWttymgOQvuyLjOU6wyJGg1LBQ1tZvURfV_tN1qE356CLdtO753BY9u8C5W5NVCbSfA2BpSKBW9Fsnym0d1L6XmxFzn37-CuskF-18OM4AZYiA3D-V58tG2FB2Cs5mxFwZfxU3cPJs25o-TymP8m28g4i1pcyCCUIQeyBdxHWhAlUmVqfln9JY2PKEpDV7ZSDMpG7H3uOOUi5HrOe5RwUYcnEVdO_VqiZjRGtkiRsHEsQiM-tKyEOeVfdMGYgbuSiAB4',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAyAbBjXP7_tWbK32_6mNDjjSqSz9B8k7Ej3SPsljQUDcbS1gL2KFYunQ4FeimB116VtU4VagcStgQK4gaiRWuf8ijS2e3g3uWvsnTjFOFeSrS3g3y2OspWcDWaaYvvlOzw-YYV56JEWzZrb1s6SKYzFlo5GXrjry55xT3hXAFQ_5KN-ZUbaemLURGIjziSGoo5LX0mVeKPOQ-R7kZRN_rnAgFB8XrX7JkkWMsWJI152vf6LDyxDaEXGd16TVJLE1d5cDgWBqa8idw'
      ]
    }
  ];

  const handleGenerate = async () => {
    if (!user?.id) {
      setError("User session invalid. Please re-authenticate.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await api.generateRecommendations(user.id);
      setRecommendationResult(result.recommendations);
    } catch (err) {
      setError(err.message || "Failed to contact Intelligence Engine");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12 uppercase tracking-tight relative">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-10 text-center">
          <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8 shadow-[0_0_15px_var(--primary)]"></div>
          <h2 className="text-2xl font-black text-on-surface tracking-[0.2em] mb-4">SYNTHESIZING COMPOSITIONS</h2>
          <p className="text-on-surface-variant max-w-md italic lowercase first-letter:uppercase">Accessing biometric anchors and wardrobe intelligence. Gemini AI is calculating optimal aesthetic vectors...</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-on-surface">Outfit Engine</h1>
          <p className="text-on-surface-variant mt-2 text-base leading-relaxed">AI-powered composition based on your Body Intelligence profile.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          {error && (
            <div className="flex items-center gap-2 bg-error/10 text-error px-4 py-2 rounded-lg border border-error/20 text-[11px] font-black animate-pulse">
              <span className="material-symbols-outlined text-sm">warning</span> {error}
            </div>
          )}
          <button 
            className="btn-primary !py-2.5 !px-6 !text-[13px] uppercase tracking-widest disabled:opacity-50"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <span className="material-symbols-outlined text-lg">magic_button</span> 
            {isGenerating ? 'Synthesizing...' : 'Generate Compositions'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar: Occasion Filters */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          <div className="glass-card p-8 shadow-premium">
            <h3 className="font-headline font-bold text-sm mb-8 text-on-surface-variant flex items-center gap-2.5 uppercase tracking-[0.15em]">
              <span className="material-symbols-outlined text-secondary text-xl">event_note</span> Filters
            </h3>
            <div className="space-y-1.5">
              {[
                { name: 'All Outfits', count: 24 },
                { name: 'Casual & Daily', count: 12 },
                { name: 'Work / Professional', count: 8 },
                { name: 'Evening & Gala', count: 2 },
                { name: 'Athleisure', count: 5 },
              ].map(occasion => (
                <button 
                  key={occasion.name}
                  onClick={() => setActiveOccasion(occasion.name)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg text-[13px] transition-all uppercase tracking-widest font-black ${
                    activeOccasion === occasion.name 
                      ? 'bg-primary/20 text-primary border border-primary/20 shadow-inner' 
                      : 'text-on-surface-variant hover:bg-surface-container-highest/30 border border-transparent'
                  }`}
                >
                  <span>{occasion.name}</span>
                  <span className="text-[11px] opacity-60 font-black">{occasion.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-12">
          
          {/* Gemini Result Section */}
          {recommendationResult && (
            <div className="glass-card p-10 border-2 border-primary/20 shadow-[0_0_30px_rgba(186,158,255,0.1)] relative overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-on-surface uppercase tracking-[0.3em]">AI Synthesized Report</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">Vector: Aesthetic Precision 1.0</p>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div className="bg-surface-container-highest/30 p-8 rounded-2xl border border-outline-variant/10 leading-relaxed text-on-surface whitespace-pre-line text-lg font-medium lowercase first-letter:uppercase">
                    {recommendationResult}
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="btn-secondary !py-2.5 !px-5 !text-[11px] uppercase tracking-widest">Download Protocol</button>
                  <button className="text-primary font-black text-[11px] uppercase tracking-widest flex items-center gap-2 px-4">
                    Share Insight <span className="material-symbols-outlined text-sm">share</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Outfit Grid */}
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
              <h3 className="font-headline font-bold text-xl text-on-surface uppercase tracking-tight">Base Compositions</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {outfits.map((outfit, i) => (
                <div key={i} className="glass-card p-6 group hover:shadow-premium-hover transition-all duration-500 border-none relative flex flex-col">
                  <div className={`absolute top-6 right-6 bg-surface-container/60 backdrop-blur-md text-${outfit.color} text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-[0.2em] z-10 shadow-premium border border-${outfit.color}/20`}>
                    {outfit.match} MATCH
                  </div>
                  <div className="flex gap-4 mb-8">
                    <div className="w-1/2 aspect-[3/4] rounded-lg bg-surface-container-highest/20 overflow-hidden shadow-inner border border-white/5">
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src={outfit.items[0]} alt="blazer" />
                    </div>
                    <div className="w-1/2 space-y-4">
                      {outfit.items.slice(1).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg bg-surface-container-highest/20 overflow-hidden shadow-inner border border-white/5">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={img} alt="item" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-headline font-bold text-lg text-on-surface underline decoration-primary/20 decoration-2 underline-offset-4">{outfit.name}</h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed font-medium">{outfit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button 
        className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-full shadow-premium hover:shadow-premium-hover flex items-center justify-center z-50 group hover:scale-110 transition-all active:scale-95 border border-white/10"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        <span className="material-symbols-outlined text-3xl font-bold">auto_fix_high</span>
        <span className="absolute right-full mr-6 bg-surface-container-highest/90 backdrop-blur-xl border border-outline-variant/20 text-on-surface text-[10px] font-black py-2.5 px-6 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none uppercase tracking-[0.2em] shadow-premium">Recalculate AI Compositions</span>
      </button>
    </div>
  );
};

export default OutfitEngine;
