import { useState, useRef, useCallback } from "react";
import {
  BookOpen, Upload, Camera, Search, Plus,
  CheckCircle2, Eye, Trash2, Grid3X3, List,
  Copy, X, Tag, Ruler, Star, ChevronRight, Edit2,
  Loader2, Shirt, Footprints, Sofa, AlertTriangle
} from "lucide-react";

type ClothingItem = {
  id: number;
  name: string;
  type: string;
  category: string;
  color: string;
  pattern: string;
  material: string;
  style: string;
  zone: string;
  confidence: number;
  gemini_label: string;
  is_duplicate: boolean;
};

// ── Emoji helper based on type ──
function getItemEmoji(type: string): string {
  const map: Record<string, string> = {
    shirt: "👔", sweater: "🧶", jacket: "🧥", cardigan: "🧥", coat: "🧥",
    "t-shirt": "👕", hoodie: "🧥", blouse: "👚", dress: "👗",
    jeans: "👖", trousers: "👖", shorts: "🩳", skirt: "👗",
    heels: "👠", boots: "👢", shoes: "👟", sneakers: "👟", sandals: "🩴",
    bag: "👜", belt: "🪢", scarf: "🧣", cap: "🧢", watch: "⌚",
    pillow: "🛋️", cushion: "🛋️",
  };
  return map[type] || "👕";
}

// ── Category from type ──
function getCategory(type: string): string {
  const tops = ["shirt", "t-shirt", "blouse", "sweater", "hoodie", "cardigan", "polo_shirt", "tank_top", "sweatshirt"];
  const bottoms = ["jeans", "trousers", "shorts", "skirt", "leggings"];
  const outerwear = ["jacket", "coat", "blazer"];
  const footwear = ["shoes", "boots", "heels", "sneakers", "sandals"];
  const accessories = ["bag", "belt", "scarf", "cap", "tie", "watch", "pillow"];
  if (tops.includes(type)) return "Tops";
  if (bottoms.includes(type)) return "Bottoms";
  if (outerwear.includes(type)) return "Outerwear";
  if (footwear.includes(type)) return "Footwear";
  if (accessories.includes(type)) return "Accessories";
  return "Other";
}

function ItemDetailPanel({ item, onClose, onDelete }: { item: ClothingItem; onClose: () => void; onDelete: (id: number) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-80 bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <span className="text-sm font-semibold text-foreground">Item Details</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Hero */}
          <div className="h-36 rounded-xl bg-gradient-to-b from-muted/40 to-muted/80 flex flex-col items-center justify-center gap-2 relative">
            <span className="text-5xl">{getItemEmoji(item.type)}</span>
            {item.is_duplicate && (
              <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium">
                <Copy className="w-2.5 h-2.5" />Duplicate
              </span>
            )}
            <span className={`absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full font-medium ${
              item.zone === "shelf"
                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            }`}>
              {item.zone === "shelf" ? "👟 Shelf" : "👔 Hanging"}
            </span>
            <div className="flex items-center gap-1 bg-card/80 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-foreground">{Math.round(item.confidence * 100)}% confidence</span>
            </div>
          </div>

          {/* Info */}
          <div>
            <h2 className="text-base font-bold text-foreground">{item.gemini_label || item.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{item.category} · {item.type}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Color", value: item.color },
              { label: "Pattern", value: item.pattern },
              { label: "Material", value: item.material },
              { label: "Style", value: item.style },
              { label: "Zone", value: item.zone },
              { label: "Status", value: item.is_duplicate ? "Duplicate" : "Unique" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                <p className="text-[12px] font-semibold text-foreground mt-0.5 capitalize">{value}</p>
              </div>
            ))}
          </div>

          {/* AI info */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">🤖 Gemini Deep Scan</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-relaxed">
              Detected via Gemini 2.5 Flash Vision AI. {item.is_duplicate ? "Similar item found in your wardrobe — consider removing one." : "Unique item in your wardrobe."}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <Edit2 className="w-3.5 h-3.5" />Edit Item Details
            </button>
            <button className="w-full py-2 bg-muted text-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2">
              <Tag className="w-3.5 h-3.5" />Add to Outfit
            </button>
            <button
              onClick={() => { onDelete(item.id); onClose(); }}
              className="w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />Remove from Wardrobe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WardrobeIntelligence() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeColor, setActiveColor] = useState("All");
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // ── Real API scan ──
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setScanning(true);
    setScanned(false);
    setScanError(null);
    setScanStatus("Uploading image to AI engine...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      setScanStatus("🔍 Running Gemini Deep Scan...");

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Scan failed");
      }

      const data = await response.json();
      setScanStatus(`✅ Found ${data.total_items} items (${data.hanging_count} hanging, ${data.shelf_count} shelf)`);

      // Convert API results to our ClothingItem format
      const allItems: ClothingItem[] = data.all_items.map((item: any, idx: number) => ({
        id: idx + 1,
        name: item.gemini_label || `${item.color} ${item.type}`,
        type: item.type,
        category: getCategory(item.type),
        color: item.color,
        pattern: item.pattern || "unknown",
        material: item.material || "unknown",
        style: item.style || "unknown",
        zone: item.zone || "hanging",
        confidence: item.confidence,
        gemini_label: item.gemini_label || "",
        is_duplicate: item.is_duplicate || false,
      }));

      setItems(allItems);
      setScanned(true);
    } catch (err: any) {
      setScanError(err.message || "Failed to scan image");
      setScanStatus("");
    } finally {
      setScanning(false);
      e.target.value = "";
    }
  }, []);

  const deleteItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  // Derive categories and colors from actual scan data
  const allCategories = ["All", ...Array.from(new Set(items.map(i => i.category)))];
  const allColors = ["All", ...Array.from(new Set(items.map(i => i.color)))];

  const filtered = items.filter(item => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchColor = activeColor === "All" || item.color.includes(activeColor);
    const matchDup = !showDuplicates || item.is_duplicate;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.type.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchColor && matchDup && matchSearch;
  });

  const duplicates = items.filter(i => i.is_duplicate);
  const hangingItems = items.filter(i => i.zone === "hanging");
  const shelfItems = items.filter(i => i.zone === "shelf");

  // Category stats from real data
  const categoryStats = allCategories.filter(c => c !== "All").map(cat => {
    const count = items.filter(i => i.category === cat).length;
    const colors: Record<string, string> = {
      Tops: "bg-blue-500", Bottoms: "bg-violet-500", Outerwear: "bg-amber-500",
      Footwear: "bg-emerald-500", Accessories: "bg-pink-500", Other: "bg-gray-500",
    };
    return { cat, count, color: colors[cat] || "bg-gray-500" };
  });

  return (
    <div className="p-5 max-w-screen-2xl">
      {/* Hidden file inputs */}
      <input ref={uploadFileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={deleteItem}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">Wardrobe Intelligence</h1>
          </div>
          <p className="text-xs text-muted-foreground">AI-powered clothing detection with Gemini Deep Scan</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => uploadFileRef.current?.click()} disabled={scanning} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60">
            <Upload className="w-3.5 h-3.5" />Upload Image
          </button>
          <button onClick={() => cameraRef.current?.click()} disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors disabled:opacity-60"
          >
            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            {scanning ? "Scanning..." : "Scan Wardrobe"}
          </button>
        </div>
      </div>

      {/* Scanning progress */}
      {scanning && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{scanStatus}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">
                Gemini Vision is analyzing every item in the image...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scan error */}
      {scanError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Scan Failed</p>
              <p className="text-[11px] text-red-600 dark:text-red-500 mt-0.5">{scanError}</p>
              <p className="text-[11px] text-red-500 dark:text-red-600 mt-1">Make sure the Python API server is running on port 5001.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left sidebar */}
        <div className="col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Wardrobe Scan</h3>
            <div className="h-32 rounded-lg bg-gradient-to-b from-amber-50/50 to-muted/30 dark:from-amber-900/10 border border-border flex items-center justify-center mb-3 relative overflow-hidden">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded clothing" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <span className="text-3xl">👗👔👖</span>
                  <p className="text-xs text-muted-foreground mt-1.5">{items.length} items in wardrobe</p>
                </div>
              )}
              {scanned && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" />Scan complete
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <button onClick={() => cameraRef.current?.click()} disabled={scanning} className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 disabled:opacity-60 transition-colors">
                <Camera className="w-3.5 h-3.5" />Scan via Camera
              </button>
              <button onClick={() => uploadFileRef.current?.click()} disabled={scanning} className="w-full flex items-center justify-center gap-1.5 py-2 border border-border text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60">
                <Upload className="w-3.5 h-3.5" />Upload Clothing Image
              </button>
            </div>
          </div>

          {/* Zone summary */}
          {scanned && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Zone Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-foreground font-medium">Hanging</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{hangingItems.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-violet-500" />
                    <span className="text-xs text-foreground font-medium">Shelf</span>
                  </div>
                  <span className="text-xs font-bold text-violet-600">{shelfItems.length}</span>
                </div>
              </div>
            </div>
          )}

          {scanned && categoryStats.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Clothing Detection</h3>
              <div className="space-y-2">
                {categoryStats.map(c => (
                  <button
                    key={c.cat}
                    onClick={() => setActiveCategory(activeCategory === c.cat ? "All" : c.cat)}
                    className={`w-full text-left transition-all rounded-lg px-1 ${activeCategory === c.cat ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{c.cat}</span>
                      <span className="text-xs font-semibold text-foreground">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div className={`h-full ${c.color} rounded-full transition-all`} style={{ width: `${(c.count / items.length) * 100}%` }} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2">Scan Info</p>
                <div className="space-y-1">
                  {[
                    { k: "Total Items", v: `${items.length}` },
                    { k: "Colors Found", v: `${new Set(items.map(i => i.color)).size} unique` },
                    { k: "Patterns Found", v: Array.from(new Set(items.map(i => i.pattern).filter(p => p !== "unknown"))).join(", ") || "—" },
                    { k: "Duplicates", v: `${duplicates.length}` },
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

          {/* Duplicate detection */}
          {scanned && duplicates.length > 0 && (
            <div className="bg-card border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Copy className="w-3.5 h-3.5 text-red-500" />
                <h3 className="text-sm font-semibold text-foreground">Duplicate Detection</h3>
                <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium">{duplicates.length}</span>
              </div>
              <div className="space-y-2">
                {duplicates.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                  >
                    <span className="text-lg">{getItemEmoji(item.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{item.gemini_label || item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.color} · {Math.round(item.confidence * 100)}%</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteItem(item.id); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowDuplicates(s => !s)}
                className={`mt-2 w-full py-1.5 text-[11px] font-medium border rounded-lg transition-colors ${showDuplicates ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400" : "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"}`}
              >
                {showDuplicates ? "Show all items" : "Show duplicates only"}
              </button>
            </div>
          )}
        </div>

        {/* Main: Inventory */}
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
              <div className="flex items-center gap-1 flex-wrap">
                {allCategories.map(c => (
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
            </div>

            {/* Color filter */}
            {items.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
                <span className="text-[10px] text-muted-foreground font-medium">Color:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {allColors.slice(0, 10).map(c => (
                    <button key={c} onClick={() => setActiveColor(c)}
                      className={`px-2 py-0.5 text-[10px] rounded-full border font-medium transition-all capitalize ${activeColor === c ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                    >{c}</button>
                  ))}
                </div>
                <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} items</span>
              </div>
            )}

            {/* Items */}
            <div className="p-4">
              {/* Empty state */}
              {items.length === 0 && !scanning && (
                <div className="text-center py-16 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-base font-semibold mb-1">Your wardrobe is empty</p>
                  <p className="text-xs text-muted-foreground mb-4">Upload or capture a wardrobe image to get started</p>
                  <button
                    onClick={() => uploadFileRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />Upload Your First Image
                  </button>
                </div>
              )}

              {viewMode === "grid" ? (
                <div className="grid grid-cols-5 gap-3">
                  {filtered.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative border rounded-xl p-3 text-left cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        item.is_duplicate
                          ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 hover:border-red-400"
                          : "border-border hover:border-primary/50 bg-card"
                      } ${selectedItem?.id === item.id ? "ring-2 ring-primary" : ""}`}
                    >
                      {item.is_duplicate && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <Copy className="w-2.5 h-2.5 text-red-500" />
                        </div>
                      )}
                      <span className={`absolute top-1.5 left-1.5 text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                        item.zone === "shelf"
                          ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                      }`}>
                        {item.zone}
                      </span>
                      <div className="text-2xl text-center mb-2 mt-2">{getItemEmoji(item.type)}</div>
                      <p className="text-[11px] font-medium text-foreground text-center leading-tight line-clamp-2">{item.gemini_label || item.name}</p>
                      <div className="flex flex-wrap gap-0.5 mt-2 justify-center">
                        <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground capitalize">{item.color}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">{Math.round(item.confidence * 100)}%</span>
                      </div>
                      <div className="absolute bottom-1.5 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] text-primary font-medium">View details</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filtered.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all hover:shadow-sm active:scale-[0.99] ${
                        item.is_duplicate
                          ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20"
                          : "border-border hover:bg-muted/40 hover:border-primary/30"
                      } ${selectedItem?.id === item.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <span className="text-xl flex-shrink-0">{getItemEmoji(item.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-foreground">{item.gemini_label || item.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                            item.zone === "shelf"
                              ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                          }`}>{item.zone}</span>
                          {item.is_duplicate && <span className="text-[9px] px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium">Duplicate</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground capitalize">{item.category} · {item.color} · {item.pattern} · {item.material}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-semibold ${item.confidence >= 0.9 ? "text-green-600 dark:text-green-400" : "text-amber-600"}`}>{Math.round(item.confidence * 100)}%</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {filtered.length === 0 && items.length > 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No items match your filters</p>
                  <button onClick={() => { setActiveCategory("All"); setActiveColor("All"); setSearch(""); setShowDuplicates(false); }} className="text-xs text-primary mt-2 hover:underline">Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
