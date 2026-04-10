import React from 'react';

const Settings = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-headline font-bold text-on-background tracking-tight">System Settings</h1>
        <p className="text-on-surface-variant text-lg mt-2 font-medium">Configure your FitLoop experience and account preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <section className="glass-card p-8 border-l-4 border-primary">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
            <h2 className="text-xl font-bold font-headline">Profile Identity</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">Manage your biometric data visibility and personal information synchronization protocols.</p>
          <div className="p-4 bg-surface-container-highest/20 rounded-xl border border-outline-variant/10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Feature Status</p>
            <p className="text-sm font-medium">Personalization engine currently optimized.</p>
          </div>
        </section>

        <section className="glass-card p-8 border-l-4 border-secondary">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-2xl">security</span>
            </div>
            <h2 className="text-xl font-bold font-headline">Security Layer</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">Control your encryption keys and session duration for secure data access across all nodes.</p>
          <button className="btn-secondary w-full !py-3 font-bold uppercase tracking-widest text-xs">Manage Keys (Coming Soon)</button>
        </section>

        <section className="glass-card p-8 border-l-4 border-tertiary">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-2xl">notifications</span>
            </div>
            <h2 className="text-xl font-bold font-headline">Sync Notifications</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">Toggle intelligence updates and system status alerts for real-time monitoring of your style stats.</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Global Alerts</span>
            <div className="w-12 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
