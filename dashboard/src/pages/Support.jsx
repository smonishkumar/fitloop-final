import React from 'react';

const Support = () => {
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold text-on-background tracking-tight">Support Node</h1>
        <p className="text-on-surface-variant text-lg mt-2 font-medium">Access dedicated assistance and technical maintenance protocols.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass-card p-10 flex flex-col items-center text-center shadow-premium">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">chat_bubble</span>
          </div>
          <h2 className="text-2xl font-bold font-headline mb-4">Direct Sync</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">Initiate a live session with an intelligence specialist for immediate troubleshooting and fit calibration.</p>
          <button className="btn-primary w-full !py-4 uppercase tracking-widest text-xs font-bold">Initialize Live Chat</button>
        </section>

        <section className="glass-card p-10 flex flex-col items-center text-center shadow-premium">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-secondary text-3xl">topic</span>
          </div>
          <h2 className="text-2xl font-bold font-headline mb-4">Knowledge Hub</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">Access detailed status reports, FAQs, and system documentation to optimize your FitLoop experience.</p>
          <button className="btn-secondary w-full !py-4 uppercase tracking-widest text-xs font-bold">Search Database</button>
        </section>
      </div>

      <section className="glass-card p-8 border border-outline-variant/10">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6">System Status</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <span className="text-sm font-bold text-on-surface">Core Systems Operational</span>
          </div>
          <div className="h-4 w-px bg-outline-variant/30"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <span className="text-sm font-bold text-on-surface">API Latency: 42ms</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
