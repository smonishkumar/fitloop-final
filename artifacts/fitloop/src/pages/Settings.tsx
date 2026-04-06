import { useState } from "react";
import {
  Settings as SettingsIcon, Bell, Shield, Cpu, Plug, Globe,
  ChevronRight, Check, RefreshCw, Save, ToggleLeft, ToggleRight,
  Sparkles, AlertCircle, Key, Webhook
} from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "ml", label: "ML Engine", icon: Cpu },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

const integrations = [
  { name: "Shopify", desc: "Sync products and orders from Shopify store", status: "connected", logo: "🛍️" },
  { name: "WooCommerce", desc: "Connect your WooCommerce catalog", status: "disconnected", logo: "🛒" },
  { name: "Magento", desc: "Enterprise eCommerce integration", status: "disconnected", logo: "🏪" },
  { name: "Stripe", desc: "Track payment and refund data", status: "connected", logo: "💳" },
  { name: "Klaviyo", desc: "Send fit recommendations via email", status: "disconnected", logo: "📧" },
  { name: "Segment", desc: "Pipe user events to your analytics stack", status: "connected", logo: "🔄" },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-10 h-5.5 rounded-full transition-colors ${on ? "bg-violet-600" : "bg-muted-foreground/30"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-4.5" : "translate-x-0"}`}
        style={{ width: 18, height: 18, top: 2, left: 2, transform: on ? "translateX(18px)" : "translateX(0)" }}
      />
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    fitThreshold: 85,
    autoRecommend: true,
    returnRiskAlerts: true,
    lowStockAlerts: false,
    mlAutoUpdate: true,
    confidenceMin: 80,
    bodyDataRetention: 30,
    anonymizeData: true,
    webhooks: true,
    darkMode: false,
    language: "en",
    currency: "INR",
  });

  const update = (key: string, value: any) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div className="p-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your FITLOOP workspace and ML engine</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Save className="w-3.5 h-3.5" />
          Save Changes
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-[200px] flex-shrink-0">
          <div className="bg-card border border-border rounded-xl p-2 space-y-0.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* General */}
          {activeTab === "general" && (
            <>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Workspace Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company Name</label>
                    <input defaultValue="FITLOOP Inc." className="h-9 px-3 w-full rounded-lg border border-border bg-muted/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Language</label>
                      <select className="h-9 px-3 w-full rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Currency</label>
                      <select value={settings.currency} onChange={e => update("currency", e.target.value)} className="h-9 px-3 w-full rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="INR">INR ₹</option>
                        <option value="USD">USD $</option>
                        <option value="EUR">EUR €</option>
                        <option value="GBP">GBP £</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Support Email</label>
                    <input defaultValue="support@fitloop.ai" type="email" className="h-9 px-3 w-full rounded-lg border border-border bg-muted/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Fit Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Minimum Fit Score Threshold</label>
                      <span className="text-xs font-bold text-foreground">{settings.fitThreshold}%</span>
                    </div>
                    <input
                      type="range" min={60} max={100} value={settings.fitThreshold}
                      onChange={e => update("fitThreshold", Number(e.target.value))}
                      className="w-full accent-violet-600 h-1.5 rounded-full"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Orders below this threshold will be flagged as high-risk returns</p>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-Recommend Size Alternatives</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Show size-up/down suggestions on product pages</p>
                    </div>
                    <Toggle on={settings.autoRecommend} onChange={v => update("autoRecommend", v)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ML Engine */}
          {activeTab === "ml" && (
            <>
              <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">FitLoop ML Engine v3.4</p>
                    <p className="text-white/70 text-xs mt-0.5">Running · Last updated 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-sm rounded-lg border border-white/20 transition-colors flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retrain
                  </button>
                  <button className="px-3 py-1.5 bg-white text-violet-700 text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors">
                    v3.4 Changelog
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Model Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Minimum Confidence Score</label>
                      <span className="text-xs font-bold text-foreground">{settings.confidenceMin}%</span>
                    </div>
                    <input
                      type="range" min={50} max={99} value={settings.confidenceMin}
                      onChange={e => update("confidenceMin", Number(e.target.value))}
                      className="w-full accent-violet-600 h-1.5 rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-update ML Model</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Automatically apply new model versions when released</p>
                    </div>
                    <Toggle on={settings.mlAutoUpdate} onChange={v => update("mlAutoUpdate", v)} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                    {[
                      { label: "Training Data Points", value: "2.8M" },
                      { label: "Model Accuracy", value: "96.2%" },
                      { label: "Avg Inference Time", value: "142ms" },
                    ].map(stat => (
                      <div key={stat.label} className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Integrations */}
          {activeTab === "integrations" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Connected Platforms</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Connect your eCommerce platforms to sync products, orders and fit data</p>
              </div>
              <div className="divide-y divide-border">
                {integrations.map(integ => (
                  <div key={integ.name} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integ.logo}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{integ.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            integ.status === "connected"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {integ.status === "connected" ? "Connected" : "Not connected"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{integ.desc}</p>
                      </div>
                    </div>
                    <button className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      integ.status === "connected"
                        ? "border border-border text-muted-foreground hover:border-red-300 hover:text-red-500"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}>
                      {integ.status === "connected" ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "returnRiskAlerts", label: "High Return Risk Alerts", desc: "Get notified when an order has high return probability" },
                  { key: "lowStockAlerts", label: "Low Stock Alerts", desc: "Alert when product stock drops below 20 units" },
                  { key: "mlAutoUpdate", label: "ML Model Updates", desc: "Notifications when new model versions are available" },
                  { key: "webhooks", label: "Webhook Events", desc: "Send fit events to your configured webhook endpoints" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      on={settings[item.key as keyof typeof settings] as boolean}
                      onChange={v => update(item.key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">API Keys</h3>
                <div className="space-y-3">
                  {["Live API Key", "Test API Key", "Webhook Secret"].map(key => (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{key}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">fl_••••••••••••••••</span>
                        <button className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline">Reveal</button>
                        <button className="text-xs text-muted-foreground hover:text-foreground">Rotate</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Data Privacy</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Body Data Retention (days)</label>
                      <span className="text-xs font-bold text-foreground">{settings.bodyDataRetention}d</span>
                    </div>
                    <input
                      type="range" min={7} max={365} value={settings.bodyDataRetention}
                      onChange={e => update("bodyDataRetention", Number(e.target.value))}
                      className="w-full accent-violet-600 h-1.5 rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Anonymize Measurement Data</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Strip PII from body scan data before training</p>
                    </div>
                    <Toggle on={settings.anonymizeData} onChange={v => update("anonymizeData", v)} />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">FITLOOP is GDPR and CCPA compliant. All body measurement data is encrypted at rest and in transit.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
