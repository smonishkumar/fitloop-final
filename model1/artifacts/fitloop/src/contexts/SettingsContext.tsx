import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface AppSettings {
  fitThreshold: number;
  autoRecommend: boolean;
  returnRiskAlerts: boolean;
  lowStockAlerts: boolean;
  mlAutoUpdate: boolean;
  confidenceMin: number;
  bodyDataRetention: number;
  anonymizeData: true;
  webhooks: boolean;
  darkMode: boolean;
  language: string;
  currency: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
};

function formatLargeINR(inrValue: number, currency: string, prefix = ""): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? "₹";
  const rate = EXCHANGE_RATES[currency] ?? 1;
  const converted = inrValue / rate;

  if (currency === "INR") {
    if (inrValue >= 1_00_00_000) return `${prefix}${symbol}${(inrValue / 1_00_00_000).toFixed(1)}Cr`;
    if (inrValue >= 1_00_000) return `${prefix}${symbol}${(inrValue / 1_00_000).toFixed(0)}L`;
    return `${prefix}${symbol}${inrValue.toLocaleString("en-IN")}`;
  }
  if (converted >= 1_000_000) return `${prefix}${symbol}${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${prefix}${symbol}${(converted / 1_000).toFixed(0)}K`;
  return `${prefix}${symbol}${Math.round(converted).toLocaleString()}`;
}

function formatProductPrice(inrPrice: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? "₹";
  const rate = EXCHANGE_RATES[currency] ?? 1;
  const converted = Math.round(inrPrice / rate);
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return `${symbol}${converted.toLocaleString(locale)}`;
}

interface SettingsContextValue {
  settings: AppSettings;
  savedSettings: AppSettings;
  update: (key: string, value: any) => void;
  save: () => void;
  hasUnsaved: boolean;
  currencySymbol: string;
  formatLarge: (inrValue: number, prefix?: string) => string;
  formatPrice: (inrPrice: number) => string;
}

const defaultSettings: AppSettings = {
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
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(defaultSettings);

  const update = useCallback((key: string, value: any) => {
    setSettings(s => ({ ...s, [key]: value }));
  }, []);

  const save = useCallback(() => {
    setSavedSettings(prev => ({ ...prev, ...settings }));
  }, [settings]);

  const hasUnsaved = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const currencySymbol = CURRENCY_SYMBOLS[savedSettings.currency] ?? "₹";

  const formatLarge = useCallback(
    (inrValue: number, prefix = "") => formatLargeINR(inrValue, savedSettings.currency, prefix),
    [savedSettings.currency]
  );

  const formatPrice = useCallback(
    (inrPrice: number) => formatProductPrice(inrPrice, savedSettings.currency),
    [savedSettings.currency]
  );

  return (
    <SettingsContext.Provider value={{ settings, savedSettings, update, save, hasUnsaved, currencySymbol, formatLarge, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
