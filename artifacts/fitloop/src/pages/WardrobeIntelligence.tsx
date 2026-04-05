import { useState } from "react";
import {
  BookOpen, Upload, Camera, Search, Filter, Plus,
  CheckCircle2, AlertCircle, Tag, Layers, Eye,
  Trash2, Grid3X3, List, Copy, X, Sparkles
} from "lucide-react";

type ClothingItem = {
  id: number; name: string; category: string; color: string;
  pattern: string; brand: string; season: string; img: string;
  duplicate: boolean; confidence: number;
};

const wardrobeItems: ClothingItem[] = [
  { id: 1, name: "White Oxford Shirt", category: "Tops", color: "White", pattern: "Solid", brand: "Uniqlo", season: "All-year", img: "👔", duplicate: false, confidence: 98 },
  { id: 2, name: "Navy Slim Trousers", category: "Bottoms", color: "Navy", pattern: "Solid", brand: "Zara", season: "All-year", img: "👖", duplicate: false, confidence: 95 },
  { id: 3, name: "Floral Midi Dress", category: "Dresses", color: "Multicolor", pattern: "Floral", brand: "Zara", season: "Summer", img: "👗", duplicate: false, confidence: 97 },
  { id: 4, name: "Denim Jacket Classic", category: "Outerwear", color: "Blue", pattern: "Solid", brand: "Levi's", season: "Spring", img: "🧥", duplicate: false, confidence: 96 },
  { id: 5, name: "White T-Shirt V2", category: "Tops", color: "White", pattern: "Solid", brand: "H&M", season: "All-year", img: "👕", duplicate: true, confidence: 93 },
  { id: 6, name: "Black Skinny Jeans", category: "Bottoms", color: "Black", pattern: "Solid", brand: "Topshop", season: "All-year", img: "🦵", duplicate: false, confidence: 91 },
  { id: 7, name: "Striped Linen Shirt", category: "Tops", color: "Blue/White", pattern: "Striped", brand: "Mango", season: "Summer", img: "🏖️", duplicate: false, confidence: 89 },
  { id: 8, name: "White Polo V3", category: "Tops", color: "White", pattern: "Solid", brand: "Ralph Lauren", season: "Summer", img: "👕", duplicate: true, confidence: 87 },
  { id: 9, name: "Beige Chinos", category: "Bottoms", color: "Beige", pattern: "Solid", brand: "H&M", season: "Spring", img: "🩲", duplicate: false, confidence: 94 },
  { id: 10, name: "Wrap Maxi Skirt", category: "Bottoms", color: "Terracotta", pattern: "Solid", brand: "Mango", season: "Summer", img: "👗", duplicate: false, confidence: 96 },
  { id: 11, name: "Blazer Charcoal", category: "Outerwear", color: "Charcoal", pattern: "Solid", brand: "& Other Stories", season: "All-year", img: "🥼", duplicate: false, confidence: 98 },
  { id: 12, name: "White Oxford Slim", category: "Tops", color: "White", pattern: "Solid", brand: "COS", season: "All-year", img: "👔", duplicate: true, confidence: 84 },
];

const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear"];
const colorChips = ["All", "White", "Black", "Navy", "Blue", "Beige", "Multicolor"];

const categoryStats = [
  { cat: "Tops", count: 5, color: "bg-blue-500" },
  { cat: "Bottoms", count: 4, color: "bg-violet-500" },
  { cat: "Dresses", count: 1, color: "bg-pink-500" },
  { cat: "Outerwear", count: 2, color: "bg-amber-500" },
];

export default function WardrobeIntelligence() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeColor, setActiveColor] = useState("All");
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [search, setSearch] = useState("");

  const runScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setScanned(true); }, 2200);
  };

  const filtered = wardrobeItems.filter(item => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchColor = activeColor === "All" || item.color.includes(activeColor);
    const matchDup = !showDuplicates || item.duplicate;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchColor && matchDup && matchSearch;
  });

  const duplicates = wardrobeItems.filter(i => i.duplicate);

  return (
    <div className="p-5 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">Wardrobe Intelligence</h1>
          </div>
          <p className="text-xs text-muted-foreground">AI-powered clothing detection, cataloging, and wardrobe analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors">
            <Upload className="w-3.5 h-3.5" />Upload Image
          </button>
          <button onClick={runScan} disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors disabled:opacity-60"
          >
            <Camera className="w-3.5 h-3.5" />
            {scanning ? "Scanning..." : "Scan Wardrobe"}
          </button>
        </div>
      </div>

      {/* Scanning progress */}
      {scanning && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Scanning wardrobe...</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Detecting items, extracting attributes, checking for duplicates</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-amber-600 dark:text-amber-400">Clothing Detection</p>
            <div className="w-32 h-1.5 bg-amber-200 rounded-full mt-1">
              <div className="h-full bg-amber-600 rounded-full animate-pulse" style={{ width: "70%" }} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left sidebar */}
        <div className="col-span-3 space-y-4">
          {/* C1: Scan widget */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Wardrobe Scan</h3>
            <div className="h-32 rounded-lg bg-gradient-to-b from-amber-50/50 to-muted/30 dark:from-amber-900/10 border border-border flex items-center justify-center mb-3 relative overflow-hidden">
              <div className="text-center">
                <span className="text-3xl">👗👔👖</span>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {scanned ? `${wardrobeItems.length} items detected` : "No items scanned yet"}
                </p>
                {scanned && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full mt-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />Scan complete
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <button onClick={runScan} disabled={scanning} className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 disabled:opacity-60 transition-colors">
                <Camera className="w-3.5 h-3.5" />Scan via Camera
              </button>
              <button className="w-full flex items-center justify-center gap-1.5 py-2 border border-border text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                <Upload className="w-3.5 h-3.5" />Upload Clothing Image
              </button>
            </div>
          </div>

          {/* C2 & C3: Detection results */}
          {scanned && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Clothing Detection</h3>
              <div className="space-y-2">
                {categoryStats.map(c => (
                  <div key={c.cat}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{c.cat}</span>
                      <span className="text-xs font-semibold text-foreground">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div className={`h-full ${c.color} rounded-full`} style={{ width: `${(c.count / wardrobeItems.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2">Attribute Detection</p>
                <div className="space-y-1">
                  {[
                    { k: "Colors Detected", v: "8 unique" },
                    { k: "Patterns Found", v: "Solid, Stripe, Floral" },
                    { k: "Seasons Covered", v: "All seasons" },
                    { k: "Avg Condition", v: "Good" },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">{k}</span>
                      <span className="text-[10px] font-medium text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* C5: Duplicate detection */}
          {scanned && duplicates.length > 0 && (
            <div className="bg-card border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Copy className="w-3.5 h-3.5 text-red-500" />
                <h3 className="text-sm font-semibold text-foreground">Duplicate Detection</h3>
                <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium">{duplicates.length}</span>
              </div>
              <div className="space-y-2">
                {duplicates.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-lg">{item.img}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.brand} · {item.confidence}% similar</p>
                    </div>
                    <button className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowDuplicates(s => !s)}
                className="mt-2 w-full py-1.5 text-[11px] font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {showDuplicates ? "Show all items" : "Filter duplicates only"}
              </button>
            </div>
          )}
        </div>

        {/* Main: Inventory builder */}
        <div className="col-span-9">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="search" placeholder="Search wardrobe..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted/60 border border-border text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="flex items-center gap-1">
                {categories.map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${activeCategory === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >{c}</button>
                ))}
              </div>
              <div className="flex items-center gap-0.5 ml-auto">
                <button onClick={() => setViewMode("grid")} className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setViewMode("list")} className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              <button className="flex items-center gap-1 px-2.5 py-1.5 border border-dashed border-border text-muted-foreground rounded-lg text-[11px] hover:border-primary/40 hover:text-primary transition-colors">
                <Plus className="w-3 h-3" />Add Item
              </button>
            </div>

            {/* Color filter */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <span className="text-[10px] text-muted-foreground">Color:</span>
              <div className="flex gap-1.5">
                {colorChips.map(c => (
                  <button key={c} onClick={() => setActiveColor(c)}
                    className={`px-2 py-0.5 text-[10px] rounded-full border font-medium transition-all ${activeColor === c ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                  >{c}</button>
                ))}
              </div>
              <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} items</span>
            </div>

            {/* C4: Wardrobe inventory */}
            <div className="p-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-6 gap-3">
                  {filtered.map(item => (
                    <div key={item.id} className={`group relative border rounded-xl p-3 cursor-pointer hover:shadow-sm transition-all ${item.duplicate ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10" : "border-border hover:border-primary/30 bg-card"}`}>
                      {item.duplicate && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <Copy className="w-2.5 h-2.5 text-red-500" />
                        </div>
                      )}
                      <div className="text-2xl text-center mb-2">{item.img}</div>
                      <p className="text-[11px] font-medium text-foreground text-center leading-tight line-clamp-2">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground text-center mt-0.5">{item.brand}</p>
                      <div className="flex flex-wrap gap-0.5 mt-2 justify-center">
                        <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">{item.color}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">{item.season}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
                        <div className="flex gap-1">
                          <button className="w-7 h-7 bg-card rounded-full flex items-center justify-center shadow-sm"><Eye className="w-3 h-3 text-muted-foreground" /></button>
                          <button className="w-7 h-7 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center shadow-sm"><Trash2 className="w-3 h-3 text-red-500" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filtered.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${item.duplicate ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10" : "border-border hover:bg-muted/40"} cursor-pointer transition-colors group`}>
                      <span className="text-xl flex-shrink-0">{item.img}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-foreground">{item.name}</span>
                          {item.duplicate && <span className="text-[9px] px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium">Duplicate</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{item.brand} · {item.category} · {item.color} · {item.pattern}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{item.season}</span>
                        <span className={`text-[10px] font-semibold ${item.confidence >= 93 ? "text-green-600 dark:text-green-400" : "text-amber-600"}`}>{item.confidence}%</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted"><Eye className="w-3 h-3 text-muted-foreground" /></button>
                          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3 h-3 text-red-500" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
