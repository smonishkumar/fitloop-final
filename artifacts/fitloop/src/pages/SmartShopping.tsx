import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import {
  ShoppingCart, Search, Star, CheckCircle2, AlertCircle,
  TrendingUp, ArrowRight, ExternalLink, Filter, Sparkles,
  Tag, Ruler, Package, ShoppingBag, Zap, ChevronRight
} from "lucide-react";

const brandSizeMap = [
  { brand: "Zara", region: "EU", tops: "M → EU 40", bottoms: "M → W32", confidence: 97, note: "Runs slim" },
  { brand: "H&M", region: "EU", tops: "L → EU 42", bottoms: "M → W32", confidence: 91, note: "True to size" },
  { brand: "Uniqlo", region: "JP", tops: "M → JP M", bottoms: "M → W31", confidence: 95, note: "Runs small" },
  { brand: "Levi's", region: "US", tops: "M → US M", bottoms: "32W 32L", confidence: 89, note: "True to size" },
  { brand: "Nike", region: "US", tops: "L → US L", bottoms: "32", confidence: 93, note: "Slightly generous" },
  { brand: "ASOS", region: "UK", tops: "M → UK M", bottoms: "UK 12", confidence: 87, note: "Check measurements" },
];

const productFeed = [
  { id: 1, name: "Studio Slim Trousers", brand: "Zara", price: 5799, fitScore: 96, match: "Perfect", category: "Bottoms", emoji: "👖", returnRisk: "low", size: "M", tags: ["New", "Trending"] },
  { id: 2, name: "Oxford Linen Blend Shirt", brand: "Uniqlo", price: 3299, fitScore: 94, match: "Excellent", category: "Tops", emoji: "👔", returnRisk: "low", size: "M", tags: ["Your Size"] },
  { id: 3, name: "Oversized Blazer", brand: "& Other Stories", price: 12499, fitScore: 82, match: "Good", category: "Outerwear", emoji: "🥼", returnRisk: "medium", size: "S/M", tags: ["Trending"] },
  { id: 4, name: "Wide-Leg Trousers", brand: "Mango", price: 4999, fitScore: 78, match: "Fair", category: "Bottoms", emoji: "👗", returnRisk: "high", size: "L", tags: ["Sale"] },
  { id: 5, name: "Floral Wrap Dress", brand: "Zara", price: 6699, fitScore: 97, match: "Perfect", category: "Dresses", emoji: "👗", returnRisk: "low", size: "M", tags: ["New", "Your Style"] },
  { id: 6, name: "Classic Chino", brand: "H&M", price: 4199, fitScore: 91, match: "Excellent", category: "Bottoms", emoji: "🩲", returnRisk: "low", size: "32W 30L", tags: [] },
];

const matchColors: Record<string, string> = {
  "Perfect": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Excellent": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Good": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Fair": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const riskColors: Record<string, string> = {
  low: "text-green-600 dark:text-green-400",
  medium: "text-amber-600",
  high: "text-red-500",
};

export default function SmartShopping() {
  const { formatPrice } = useSettings();
  const [productUrl, setProductUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [fitResult, setFitResult] = useState<null | { score: number; size: string; risk: string; note: string }>(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All");

  const checkFit = () => {
    if (!productUrl.trim()) return;
    setChecking(true);
    setFitResult(null);
    setTimeout(() => {
      setFitResult({ score: 94, size: "M", risk: "low", note: "This product uses EU sizing. Based on your profile, size M fits your chest (38.5\") and waist (30.2\") perfectly." });
      setChecking(false);
    }, 1800);
  };

  const filtered = productFeed.filter(p => {
    const matchCat = filterCategory === "All" || p.category === filterCategory;
    const matchBrand = filterBrand === "All" || p.brand === filterBrand;
    return matchCat && matchBrand;
  });

  return (
    <div className="p-5 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShoppingCart className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">Smart Shopping</h1>
          </div>
          <p className="text-xs text-muted-foreground">AI-powered fit predictions before you buy — across all brands</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
          <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-medium text-teal-700 dark:text-teal-400">Shopping Readiness: 88/100</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left column */}
        <div className="col-span-4 space-y-4">
          {/* E1: Will this fit me? */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-green-600 px-4 py-3">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Will This Fit Me?
              </h3>
              <p className="text-white/75 text-[11px] mt-0.5">Paste any product URL or SKU for instant fit analysis</p>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <input
                  type="url"
                  placeholder="https://zara.com/product/... or SKU"
                  value={productUrl}
                  onChange={e => setProductUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && checkFit()}
                  className="w-full h-9 pl-3 pr-20 rounded-lg border border-border bg-muted/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
                />
                <button
                  onClick={checkFit}
                  disabled={checking || !productUrl.trim()}
                  className="absolute right-1 top-1 px-2.5 py-1.5 bg-teal-600 text-white rounded-md text-[11px] font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {checking ? "Checking..." : "Check Fit"}
                </button>
              </div>

              {checking && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-5 h-5 rounded-full border-2 border-teal-200 border-t-teal-600 animate-spin flex-shrink-0" />
                  <p className="text-[11px] text-muted-foreground">Analyzing product sizing and matching to your profile...</p>
                </div>
              )}

              {fitResult && !checking && (
                <div className="space-y-2.5">
                  {/* Score */}
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">{fitResult.score}</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-green-700 dark:text-green-400">Excellent Fit</p>
                      <p className="text-[11px] text-green-600 dark:text-green-500">Recommended size: <strong>{fitResult.size}</strong></p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{fitResult.note}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-[11px] font-medium hover:bg-teal-700 transition-colors">Add to Cart</button>
                    <button className="flex-1 py-2 border border-border text-muted-foreground rounded-lg text-[11px] font-medium hover:bg-muted transition-colors">View Product</button>
                  </div>
                </div>
              )}

              {!fitResult && !checking && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Enter a URL and we'll check if it fits your body profile</p>
              )}
            </div>
          </div>

          {/* E2: Brand size mapping */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Brand Size Mapping</h3>
            </div>
            <div className="space-y-2">
              {brandSizeMap.map(b => (
                <div key={b.brand} className="p-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-foreground">{b.brand}</span>
                      <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{b.region}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${b.confidence >= 93 ? "text-green-600 dark:text-green-400" : "text-amber-600"}`}>{b.confidence}%</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[10px] text-muted-foreground">Top: {b.tops}</span>
                    <span className="text-[10px] text-muted-foreground">Bottom: {b.bottoms}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground/70 mt-0.5 italic">{b.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Smart feed */}
        <div className="col-span-8 space-y-4">
          {/* E3: Purchase recommendation summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Perfect Fit Items", value: "2", sub: "in current feed", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
              { label: "Avoid (High Risk)", value: "1", sub: "poor fit match", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
              { label: "Avg Match Score", value: "90%", sub: "across 6 products", icon: Star, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{c.value}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{c.label}</p>
                    <p className="text-[9px] text-muted-foreground">{c.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* E5: Smart product feed */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Smart Product Feed</h3>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Curated for your body profile</span>
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="h-7 px-2 rounded-lg border border-border bg-background text-[11px] focus:outline-none"
                >
                  {["All", "Tops", "Bottoms", "Dresses", "Outerwear"].map(c => <option key={c}>{c}</option>)}
                </select>
                <select
                  value={filterBrand}
                  onChange={e => setFilterBrand(e.target.value)}
                  className="h-7 px-2 rounded-lg border border-border bg-background text-[11px] focus:outline-none"
                >
                  {["All", "Zara", "H&M", "Uniqlo", "& Other Stories", "Mango"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4">
              {filtered.map(p => (
                <div key={p.id} className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                  {/* Product image area */}
                  <div className="relative h-28 bg-gradient-to-b from-muted/40 to-muted/70 flex items-center justify-center">
                    <span className="text-4xl">{p.emoji}</span>
                    {/* E4: Match confidence badge */}
                    <div className={`absolute top-2 left-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${matchColors[p.match]}`}>
                      {p.match}
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-card/90 px-1.5 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[9px] font-bold text-foreground">{p.fitScore}</span>
                    </div>
                    {/* Tags */}
                    {p.tags.length > 0 && (
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {p.tags.map(tag => (
                          <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full font-medium">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-[12px] font-semibold text-foreground leading-tight">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.brand} · Size {p.size}</p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-foreground">{formatPrice(p.price)}</span>
                      <span className={`text-[10px] font-medium ${riskColors[p.returnRisk]}`}>
                        {p.returnRisk === "low" ? "Low return risk" : p.returnRisk === "medium" ? "Med risk" : "High risk"}
                      </span>
                    </div>

                    {/* Fit bar */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex-1 h-1 bg-muted rounded-full">
                        <div className={`h-full rounded-full ${p.fitScore >= 92 ? "bg-green-500" : p.fitScore >= 85 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${p.fitScore}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{p.fitScore}% fit</span>
                    </div>

                    <div className="flex gap-1.5 mt-2.5">
                      <button className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium hover:bg-primary/90 transition-colors">
                        Buy Now
                      </button>
                      <button className="w-8 h-7 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
