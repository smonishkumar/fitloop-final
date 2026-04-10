import React, { useState } from 'react';

const OutfitEngine = () => {
  const [activeOccasion, setActiveOccasion] = useState('All Outfits');

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
    },
    { 
      name: 'Minimalist Professional', 
      desc: 'Clean silhouettes for high-stakes presentations.', 
      match: '92%', 
      color: 'secondary',
      items: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBSj6vPGgb9oPTQWV3bTV4WyFsCsGEnDldXkZN_ealD_aGKZvv1C9zacdRwb-HsYnzshS20eMW2Y8C6yG9CgAkD6SiKR1Yhh0BuMAKZmBq4__OKozfdm0Po7sS5mz3uItohBFFe5g9nV2q9f68E-S5dttxBXApIoVAPlCjrUAAnH-Jc-No80GyRlZAF8_k-xMk0EixdX6vKLcapjaT_Nt5xsG1iz0fOmHfJ31kZ-K6CoITzkIbRwnviH0-7JVCWPGsAglICcxBbmUg',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBMA_Ky9nENvjXrD6QR4vdPfLpRx6K8BtnErOKp7LQwkDL2m9cWhoeNnlKvDBzxj5WBRAKJzPcUVfPPIec4pQCgXnKIKC13dAW5Dy6srsu26imYzkx1Imu1TXkXnZr_xtske728n1r7D1cCUrWxOSMBdyshzAPiPXEA__E5eDHHfbZ7Lrn36z78QDRaOGuYWgapyS5ulVtwMpgv2FrOfYFBpgz7l3oM5Szhfo-FQdV-cX5Xva6mblPNN7u8RBDkj58BOxDanQBgUcU',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCQHgqTMVR7UcxmTsAW-kPb_lVxH4f01KwEdGhI8RVk_ksNKe2x8y7bRJ-5KZdbXmnoX0fodKjEQuwbEvfTyF_nZQ-nP_5MYQ0sOU_YtsFpgfDx0nVhp0ZlgW0gNmvOfy7-tbT6U2BZv2akiDaFsl4GnW5yi7KNdp1WEEOH1yfzs7wC4rdTM0K9TiO1FAiigJ5-4TIFLOU_U2OL42Wb1vnxqXwAEsAkRdfhaDPwP1CMhkRd-YoiXEL27fe9fTO5FLGAkRf8tFCmGI'
      ]
    },
    { 
      name: 'Urban Explorer', 
      desc: 'Tech-focused aesthetic with comfort-first layering.', 
      match: '76%', 
      color: 'primary',
      items: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBCQR_QpN_2hLf969yKZlSye53bnGnLyH-YJIWbIz4pZpdBYppcDz6I7A_ti75_7cwZ2SN1Uo3BbFTn479GIuObhffavHZCELB9gIf19EVJuQDF3dNYyWFyJHTyQfz6AH2tqatHaT2h881KH0uWol7KxFgkO8mDsEu81r1FvGpm3jRRUYWyatoFoJjQZevFzFn5c-aWaQj0F51Um4w-cNS0BwzR1Zv3R3HNn1OqNLYjR-2eGmQZFlXhu-a7DQ-Y_K7ObXznf57hrwg',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDGvmbJt-3AWZyGGnYVGQcid6RenVjGOiDvN7rnzbFz5yp8vCiySl93f1ihiL_sboxQa5lNqclHkEmG-p9PRsweM0wXzrfeSXJdPDRaw5ey0NhK20gdNIioYAwbp5jIBtvTDefBbSSYD7Cqpbn0YVQUMw1azMH1-hHS6jdxl4OK-_FoZFUcdPTAvE2eWzpgdCejvy-GPMAE3uod664pYkVqr0a0a8tg__jX0rniDrFU2FpkdRTvhIsvcvaDcbZq48aITx3v5zTcjoU',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDhN3rYP5OiIZKvsFCNf-t6R4F26_gWMjkBpQeNMkCyOlPD1PyxOCPDK27DuLSPhEz9DvWh-ssEAaRmqmVd4IV6OwooIVphdyPYzDZENgAkn7HkWiiTJ3bbEw30nQFFpMlF7kPDcPTIyL23sQvpI2vzd_0mkSEnv75NZwgZ6NNaMj6-NHOZ_62SlZs9f98gx4D3eU27GCmqsumlH49-hdByJoFYeL9-X7EyNTAEHpRcQZQcSMPZ8sYZ-IZIXNKZnfFggu0gomCEwiE'
      ]
    }
  ];

  const handleGenerate = () => {
    alert("AI Engine is recalculating compositions...");
  };

  return (
    <div className="space-y-12 uppercase tracking-tight">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-on-surface">Outfit Engine</h1>
          <p className="text-on-surface-variant mt-2 text-base leading-relaxed">AI-powered composition based on your Body Intelligence profile.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="btn-secondary !py-2.5 !px-5 !text-[13px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-lg">tune</span> Filters
          </button>
          <button 
            className="btn-primary !py-2.5 !px-6 !text-[13px] uppercase tracking-widest"
            onClick={handleGenerate}
          >
            <span className="material-symbols-outlined text-lg">magic_button</span> Generate Compositions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar: Occasion Filters */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          <div className="glass-card p-8 shadow-premium">
            <h3 className="font-headline font-bold text-sm mb-8 text-on-surface-variant flex items-center gap-2.5 uppercase tracking-[0.15em]">
              <span className="material-symbols-outlined text-secondary text-xl">event_note</span> Occasion
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
          
          <div className="glass-card p-8 shadow-premium">
            <h3 className="font-headline font-bold text-sm mb-8 text-on-surface-variant flex items-center gap-2.5 uppercase tracking-[0.15em]">
              <span className="material-symbols-outlined text-tertiary text-xl">analytics</span> Utilization
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Wardrobe Coverage</span>
                  <span className="text-[11px] font-black text-secondary">78%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary shadow-[0_0_10px_rgba(63,255,139,0.4)]" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-on-surface">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Style DNA Balance</span>
                  <span className="text-[11px] font-black text-primary uppercase">High</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 1, 1, 1, 0].map((v, i) => (
                    <div key={i} className={`h-1.5 rounded-full ${v ? 'bg-primary shadow-[0_0_8px_rgba(186,158,255,0.4)]' : 'bg-surface-container-highest/40'}`}></div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest/30 flex items-center justify-center border border-outline-variant/10">
                    <span className="material-symbols-outlined text-lg text-tertiary">trending_up</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-on-surface-variant uppercase font-black tracking-[0.2em] mb-1">Projected Score</p>
                    <p className="text-base font-black text-on-surface">92.4 <span className="text-[12px] text-tertiary opacity-80">/ 100</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-12">
          {/* Body-Aware Matching Widget */}
          <div className="glass-card p-10 relative overflow-hidden group shadow-premium bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col xl:flex-row gap-16 items-center">
              <div className="w-full xl:w-1/3 flex flex-col items-center shrink-0">
                <div className="relative mb-8">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle className="text-surface-container-highest/20" cx="80" cy="80" fill="transparent" r="72" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-primary" cx="80" cy="80" fill="transparent" r="72" stroke="currentColor" strokeDasharray="452.39" strokeDashoffset="45.24" strokeWidth="8" strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-headline font-bold text-on-background tracking-tighter">90%</span>
                    <span className="text-[8px] text-on-surface-variant uppercase tracking-[0.3em] font-black mt-1">Match Index</span>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-headline font-bold text-lg text-on-surface underline decoration-primary/30 decoration-2 underline-offset-8">AI Persona Alignment</h4>
                  <p className="text-base text-on-surface-variant px-6 mt-6 leading-relaxed">Synthesized using 32 biometric anchors and your <span className="text-primary font-bold">Inverted Triangle</span> profile.</p>
                </div>
              </div>
              
              <div className="w-full xl:w-2/3 space-y-8">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/30"></span>
                  Algorithmic Precision Metrics
                </h4>
                <div className="space-y-6">
                  {[
                    { label: 'Physical Fit Precision', value: 98, color: 'from-error via-primary to-secondary', sub: 'EXCELLENT' },
                    { label: 'Color Harmony Balance', value: 85, color: 'from-tertiary to-tertiary-fixed-dim', sub: 'OPTIMAL' },
                    { label: 'Style DNA Alignment', value: 92, color: 'from-primary-dim to-primary', sub: 'COHESIVE' },
                  ].map(metric => (
                    <div key={metric.label} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-on-surface uppercase tracking-wider">{metric.label}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${metric.label.includes('Fit') ? 'text-secondary' : metric.label.includes('Color') ? 'text-tertiary' : 'text-primary'}`}>{metric.value}% {metric.sub}</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-highest/40 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full bg-gradient-to-r ${metric.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${metric.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Outfit Grid */}
          <div className="space-y-10">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
              <h3 className="font-headline font-bold text-xl text-on-surface uppercase tracking-tight">Recommended Compositions</h3>
              <div className="flex gap-2">
                <button className="w-9 h-9 border border-outline-variant/20 rounded-lg bg-surface-container-highest/20 text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                </button>
                <button className="w-9 h-9 border border-outline-variant/20 rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">view_stream</span>
                </button>
              </div>
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
                  <div className="mt-8 flex items-center justify-between border-t border-outline-variant/10 pt-6">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(v => (
                        <div key={v} className="w-9 h-9 rounded-full border-2 border-surface-container-highest bg-surface-container-highest/60 backdrop-blur-md flex items-center justify-center text-[11px] font-black text-on-surface-variant">+ {v}</div>
                      ))}
                    </div>
                    <button className="text-primary font-black text-[12px] uppercase tracking-widest flex items-center gap-1.5 hover:underline transition-all group/btn">
                      View Full Analysis <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
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
      >
        <span className="material-symbols-outlined text-3xl font-bold">auto_fix_high</span>
        <span className="absolute right-full mr-6 bg-surface-container-highest/90 backdrop-blur-xl border border-outline-variant/20 text-on-surface text-[10px] font-black py-2.5 px-6 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none uppercase tracking-[0.2em] shadow-premium">Recalculate AI Compositions</span>
      </button>
    </div>
  );
};

export default OutfitEngine;
