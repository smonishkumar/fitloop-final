import React, { useState } from 'react';

const BodyIntelligence = () => {
  const [gender, setGender] = useState('Male');
  const [bodyType, setBodyType] = useState('Athletic');
  const [height, setHeight] = useState(167);
  const [weight, setWeight] = useState(62);

  const handleUpdateModel = () => {
    alert(`Syncing AI model for ${gender} ${bodyType} profile...`);
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Parameters & Measurements */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Body Parameters Card */}
          <section className="glass-card p-8 shadow-premium">
            <h2 className="font-headline text-lg font-bold mb-8 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-xl">tune</span>
              Body Parameters
            </h2>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Male', 'Female'].map(g => (
                    <button 
                      key={g}
                      onClick={() => setGender(g)}
                      className={`py-2 px-1 rounded-lg text-[13px] font-bold transition-all border ${
                        gender === g 
                          ? 'bg-primary/20 text-primary border-primary/30 shadow-inner' 
                          : 'bg-surface-container-highest/20 hover:bg-surface-container-highest/40 text-on-surface-variant border-transparent'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Body Type</label>
                <select 
                  className="input-standard !py-2 !px-3 !text-[13px] font-bold"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                >
                  <option>Athletic</option>
                  <option>Slim</option>
                  <option>Average</option>
                  <option>Husky</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Height</label>
                  <div className="relative">
                    <input 
                      className="input-standard !py-2 !pl-3 !pr-10 !text-[14px] font-bold" 
                      type="number" 
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-on-surface-variant font-bold">CM</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Weight</label>
                  <div className="relative">
                    <input 
                      className="input-standard !py-2 !pl-3 !pr-10 !text-[14px] font-bold" 
                      type="number" 
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-on-surface-variant font-bold">KG</span>
                  </div>
                </div>
              </div>
              <button 
                className="btn-primary w-full !py-2.5 mt-2"
                onClick={handleUpdateModel}
              >
                <span className="text-xs uppercase tracking-widest">Update Model</span>
              </button>
            </div>
          </section>

          {/* Measurements List */}
          <section className="glass-card p-6 shadow-premium">
            <h2 className="font-headline text-sm font-bold mb-6 flex items-center gap-2.5 uppercase tracking-widest text-on-surface-variant">
              <span className="material-symbols-outlined text-tertiary">straighten</span>
              Measurements
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Chest', value: '38.2"' },
                { label: 'Waist', value: '30.0"' },
                { label: 'Hips', value: '40.5"', active: true },
                { label: 'Shoulders', value: '18.4"' },
                { label: 'Inseam', value: '32.1"' },
              ].map(m => (
                <div key={m.label} className={`flex justify-between items-center p-3 rounded-lg bg-surface-container-highest/10 hover:bg-surface-container-highest/30 transition-all border-l-2 ${m.active ? 'border-primary' : 'border-transparent'}`}>
                  <span className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider">{m.label}</span>
                  <span className="font-headline font-bold text-base text-on-surface">{m.value}</span>
                </div>
              ))}
            </div>
            <button className="btn-secondary w-full !py-2 !text-[12px] uppercase tracking-widest mt-6">Manual Calibration</button>
          </section>
        </div>

        {/* Middle Column: Avatar Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full aspect-[3/4] flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center [filter:drop-shadow(0_0_40px_rgba(186,158,255,0.2))]">
              <img 
                alt="Body Intelligence Visualization" 
                className="h-full object-contain opacity-70 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNjzex0zN8DbTpX8_Osgxkm2NauhwqM5jFGC-InH7C64hgLN0mUcwJdcSGEVO3XJi-4lngUs9jmw-K1Gu0H3XM7QuMDEsBZ1QcWRTa4TxoEFZRRJdQUzOyVxOSxUZ42XhfkzOiDUbhArF3A0SoSfe3U4dAK2RYW-wfOvS7Be4EhuO-3TKw2iY6mA_fhUVrLh_XNrZVCuU7CfBHqDlpewjqkJH3zh7akZNSP4dyZ1JGk7xNMw2ZML-fy_yoD7xDDLzGKfry6eqBsw" 
              />
            </div>
            
            <div className="absolute top-[20%] left-[20%] group transition-all duration-300">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_15px_#ba9eff]"></div>
              <div className="absolute left-6 top-1/2 -translate-y-1/2 glass-card px-4 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-premium">
                <span className="text-[12px] font-bold text-primary uppercase tracking-widest">Shoulder Width: 18.4"</span>
              </div>
            </div>
            <div className="absolute top-[45%] right-[25%] group transition-all duration-300">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-[0_0_15px_#3fff8b]"></div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 glass-card px-4 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-right shadow-premium">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Waist Drop: Optimal</span>
              </div>
            </div>
            
            <div className="absolute bottom-6 flex gap-3">
              {['rotate_right', 'zoom_in', 'layers'].map(icon => (
                <button key={icon} className="w-11 h-11 rounded-full glass-card flex items-center justify-center hover:bg-surface-container-highest/60 transition-all group shadow-premium hover:shadow-premium-hover">
                  <span className="material-symbols-outlined text-lg text-on-surface-variant group-hover:text-primary transition-colors">{icon}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full mt-4 glass-card p-10 flex items-center justify-between border-b-4 border-secondary shadow-premium">
            <div>
              <h3 className="font-headline text-3xl font-bold text-on-background">V-Taper Analysis</h3>
              <p className="text-on-surface-variant text-sm mt-1.5">High shoulder-to-waist ratio detected. Tailored fits recommended.</p>
            </div>
            <div className="text-right">
              <div className="text-secondary font-headline text-4xl font-black">1.28</div>
              <div className="text-[11px] text-secondary font-bold uppercase tracking-[0.25em] mt-1">Ratio Index</div>
            </div>
          </div>
        </div>

        {/* Right Column: Fit Score & AI Recommendations */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <section className="glass-card p-8 relative overflow-hidden group shadow-premium">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700"></div>
            <h2 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Fit Prediction Score</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black font-headline text-on-background">97</span>
              <span className="text-2xl font-bold text-secondary">%</span>
            </div>
            <p className="text-on-surface-variant text-[13px] mt-6 leading-relaxed">Perfect Fit alignment across 9/10 major apparel categories based on algorithmic synthesis.</p>
            <div className="mt-8 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary w-[97%] shadow-[0_0_12px_#3fff8b]"></div>
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
              <span>STANDARD</span>
              <span className="text-secondary tracking-widest font-black">ELITE MATCH</span>
            </div>
          </section>

          <section className="glass-card p-8 space-y-8 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-xl">auto_awesome</span>
              </div>
              <h2 className="font-headline text-lg font-bold">AI Insights</h2>
            </div>
            <div className="space-y-6">
              {[
                { title: 'Fabric Suggestion', text: 'Opt for 2% Elastane blends. Your athletic drop requires mechanical stretch.', color: 'primary' },
                { title: 'Size Warning', text: "Most 'Regular Fit' brands will bunch at your waist. We suggest 'Darted' cuts.", color: 'tertiary' },
                { title: 'Growth Tracking', text: 'Chest measurements are up 1.2% since last month. Update filters.', color: 'secondary' },
              ].map(insight => (
                <div key={insight.title} className={`p-5 rounded-lg bg-surface-container-highest/10 border-l border-${insight.color}`}>
                  <p className={`text-[11px] font-bold text-${insight.color} uppercase tracking-widest mb-2`}>{insight.title}</p>
                  <p className="text-[13px] text-on-surface leading-normal">{insight.text}</p>
                </div>
              ))}
            </div>
            <button className="btn-secondary w-full !bg-surface-container-highest/20 !border-outline-variant/10 !py-3.5 mt-4 group">
              <span className="text-xs font-bold uppercase tracking-widest">View Apparel Mapping</span>
              <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 text-center shadow-premium">
              <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">BMI</div>
              <div className="text-2xl font-headline font-bold text-tertiary">22.2</div>
            </div>
            <div className="glass-card p-5 text-center shadow-premium">
              <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Lean Mass</div>
              <div className="text-2xl font-headline font-bold text-secondary">84%</div>
            </div>
          </section>
        </div>
      </div>
      
      <button className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary flex items-center justify-center shadow-premium hover:scale-110 active:scale-95 transition-all z-50 group">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-6 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
      </button>
    </div>
  );
};

export default BodyIntelligence;
