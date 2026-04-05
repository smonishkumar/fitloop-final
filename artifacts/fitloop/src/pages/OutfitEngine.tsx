import { useState } from "react";
import {
  Wand2, Star, RefreshCw, Bookmark, ShoppingBag,
  Sun, Briefcase, Music, Heart, Coffee, Plane, Plus, X,
  CheckCircle2, Sparkles, ChevronRight, Share2, Download
} from "lucide-react";

type Occasion = { id: string; label: string; icon: React.ComponentType<any>; color: string };
const occasions: Occasion[] = [
  { id: "casual", label: "Casual", icon: Coffee, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { id: "work", label: "Work", icon: Briefcase, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "evening", label: "Evening", icon: Music, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: "date", label: "Date", icon: Heart, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  { id: "travel", label: "Travel", icon: Plane, color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  { id: "outdoor", label: "Outdoor", icon: Sun, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
];

type OutfitItem = { emoji: string; name: string; brand: string };
type Outfit = {
  id: number; name: string; occasion: string; score: number;
  items: OutfitItem[]; missing?: string; bodyScore: number;
  colorStory: string; styleNote: string;
};

const allOutfits: Outfit[] = [
  {
    id: 1, name: "Smart Casual Friday", occasion: "casual", score: 94, bodyScore: 96,
    colorStory: "Cool neutrals", styleNote: "Relaxed but polished. Great for casual office or brunch.",
    items: [
      { emoji: "👔", name: "White Oxford Shirt", brand: "Uniqlo" },
      { emoji: "👖", name: "Navy Slim Trousers", brand: "Zara" },
      { emoji: "👟", name: "White Sneakers", brand: "—" },
    ],
  },
  {
    id: 2, name: "Power Meeting Look", occasion: "work", score: 91, bodyScore: 93,
    colorStory: "Charcoal & neutral", styleNote: "Authoritative and clean. The blazer elevates the whole look.",
    items: [
      { emoji: "🥼", name: "Blazer Charcoal", brand: "& Other Stories" },
      { emoji: "👔", name: "White Oxford Shirt", brand: "Uniqlo" },
      { emoji: "👖", name: "Beige Chinos", brand: "H&M" },
    ],
    missing: "Oxford shoes — shop now",
  },
  {
    id: 3, name: "Summer Date Night", occasion: "date", score: 88, bodyScore: 90,
    colorStory: "Floral & feminine", styleNote: "Soft and romantic. The floral print does all the work.",
    items: [
      { emoji: "👗", name: "Floral Midi Dress", brand: "Zara" },
      { emoji: "👡", name: "Strappy Heels", brand: "—" },
      { emoji: "👛", name: "Clutch", brand: "—" },
    ],
    missing: "Strappy heels — not in wardrobe",
  },
  {
    id: 4, name: "Weekend Explorer", occasion: "outdoor", score: 96, bodyScore: 97,
    colorStory: "Denim & earth tones", styleNote: "Effortless weekend energy. Comfortable and put-together.",
    items: [
      { emoji: "🧥", name: "Denim Jacket Classic", brand: "Levi's" },
      { emoji: "👕", name: "White T-Shirt", brand: "H&M" },
      { emoji: "🩲", name: "Beige Chinos", brand: "H&M" },
    ],
  },
  {
    id: 5, name: "Business Travel", occasion: "travel", score: 90, bodyScore: 91,
    colorStory: "Charcoal & stripe", styleNote: "Smart enough for meetings, comfortable for long flights.",
    items: [
      { emoji: "🥼", name: "Blazer Charcoal", brand: "& Other Stories" },
      { emoji: "🏖️", name: "Striped Linen Shirt", brand: "Mango" },
      { emoji: "🦵", name: "Black Skinny Jeans", brand: "Topshop" },
    ],
  },
  {
    id: 6, name: "Evening Minimalist", occasion: "evening", score: 93, bodyScore: 94,
    colorStory: "All-black with texture", styleNote: "Confident and striking. Let the fit speak for itself.",
    items: [
      { emoji: "🦵", name: "Black Skinny Jeans", brand: "Topshop" },
      { emoji: "🥼", name: "Blazer Charcoal", brand: "& Other Stories" },
      { emoji: "👔", name: "White Oxford Shirt", brand: "Uniqlo" },
    ],
  },
];

function scoreColor(s: number) {
  return s >= 92 ? "text-green-600 dark:text-green-400" : s >= 85 ? "text-amber-600" : "text-red-500";
}
function scoreBg(s: number) {
  return s >= 92 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : s >= 85 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
}

function OutfitDetailPanel({ outfit, onClose, isSaved, onToggleSave }: {
  outfit: Outfit; onClose: () => void; isSaved: boolean; onToggleSave: () => void;
}) {
  const occ = occasions.find(o => o.id === outfit.occasion);
  const OccIcon = occ?.icon ?? Coffee;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Hero */}
        <div className="h-40 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center relative">
          <div className="flex gap-6">
            {outfit.items.map((item, i) => (
              <div key={i} className="text-center">
                <span className="text-4xl">{item.emoji}</span>
                <p className="text-[9px] text-muted-foreground mt-1">{item.name.split(" ").slice(0, 2).join(" ")}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 bg-card rounded-full flex items-center justify-center shadow-md text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${scoreBg(outfit.score)} ${scoreColor(outfit.score)}`}>
            <Star className="w-3 h-3" />{outfit.score}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">{outfit.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {occ && (
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${occ.color}`}>
                      <OccIcon className="w-2.5 h-2.5" />{occ.label}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">Body match: {outfit.bodyScore}%</span>
                </div>
              </div>
              <button
                onClick={onToggleSave}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${isSaved ? "bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400" : "border-border text-muted-foreground hover:text-violet-600"}`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">"{outfit.styleNote}"</p>
          </div>

          {/* Color story */}
          <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
            <div className="flex -space-x-1">
              {["bg-slate-400", "bg-amber-200", "bg-white border border-border"].map((c, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${c}`} />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">Color story: <strong className="text-foreground">{outfit.colorStory}</strong></span>
          </div>

          {/* Items list */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Outfit Items</p>
            {outfit.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-lg">
                <span className="text-xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-foreground">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.brand !== "—" ? item.brand : "Not in wardrobe"}</p>
                </div>
                {item.brand === "—" && <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">Missing</span>}
                {item.brand !== "—" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
              </div>
            ))}
          </div>

          {/* Missing item */}
          {outfit.missing && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Missing item</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-500">{outfit.missing}</p>
              </div>
              <button className="ml-auto text-[10px] font-medium text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap">Shop now</button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm">
              Wear This Look
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OutfitEngine() {
  const [activeOccasion, setActiveOccasion] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set([1, 4]));
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  const displayed = activeOccasion === "all"
    ? allOutfits
    : allOutfits.filter(o => o.occasion === activeOccasion);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1600);
  };

  const toggleSave = (id: number) => setSavedIds(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="p-5 max-w-screen-2xl">
      {selectedOutfit && (
        <OutfitDetailPanel
          outfit={selectedOutfit}
          onClose={() => setSelectedOutfit(null)}
          isSaved={savedIds.has(selectedOutfit.id)}
          onToggleSave={() => toggleSave(selectedOutfit.id)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Wand2 className="w-5 h-5 text-pink-600" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">Outfit Engine</h1>
          </div>
          <p className="text-xs text-muted-foreground">AI-generated outfits based on your body, wardrobe, and occasion</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors">
            <Bookmark className="w-3.5 h-3.5" />Saved ({savedIds.size})
          </button>
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {generating ? "Generating..." : "Generate New"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left */}
        <div className="col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Occasion</h3>
            <div className="space-y-1">
              {[{ id: "all", label: "All Occasions", icon: Wand2, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" }, ...occasions].map(occ => {
                const Icon = occ.icon;
                const isActive = activeOccasion === occ.id;
                return (
                  <button key={occ.id} onClick={() => setActiveOccasion(occ.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${isActive ? "bg-accent border border-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${isActive ? occ.color : ""}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    {occ.label}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body-aware matching */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Body-Aware Matching</h3>
            <div className="space-y-2.5">
              {[
                { label: "Body Type Fit", value: "Athletic — optimal", score: 96 },
                { label: "Color Harmony", value: "Cool neutrals", score: 91 },
                { label: "Style Alignment", value: "Smart casual", score: 88 },
                { label: "Season Match", value: "Spring/Summer", score: 100 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                    <span className={`text-[10px] font-semibold ${scoreColor(item.score)}`}>{item.score}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full">
                    <div className={`h-full rounded-full ${item.score >= 92 ? "bg-green-500" : item.score >= 85 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mix & Match engine */}
          <div className="bg-gradient-to-br from-pink-500 to-purple-700 rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />Mix & Match
            </h3>
            <p className="text-white/70 text-[11px] mb-3">AI analyzes color, pattern, fit, and occasion compatibility</p>
            <div className="space-y-1.5">
              {[["Items Analyzed", "12"], ["Combos Tested", "864"], ["Top Outfits", `${displayed.length}`], ["Avg Match Score", "92%"]].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-white/70 text-[10px]">{k}</span>
                  <span className="text-white font-semibold text-[10px]">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={generate} disabled={generating} className="mt-3 w-full py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-lg border border-white/20 transition-colors disabled:opacity-60">
              {generating ? "Running engine..." : "Re-run Engine"}
            </button>
          </div>
        </div>

        {/* Outfit grid */}
        <div className="col-span-9">
          {generating && (
            <div className="flex items-center gap-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4 mb-4">
              <div className="w-7 h-7 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-pink-800 dark:text-pink-300">Generating outfit combinations...</p>
                <p className="text-xs text-pink-600 dark:text-pink-400 mt-0.5">Analyzing 864 combinations across all occasions</p>
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground mb-3">Click any outfit card to view details, share, or wear it</p>

          <div className="grid grid-cols-3 gap-4">
            {displayed.map(outfit => {
              const isSaved = savedIds.has(outfit.id);
              const occ = occasions.find(o => o.id === outfit.occasion);
              const OccIcon = occ?.icon ?? Coffee;
              const isSelected = selectedOutfit?.id === outfit.id;
              return (
                <div
                  key={outfit.id}
                  onClick={() => setSelectedOutfit(isSelected ? null : outfit)}
                  className={`bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] ${isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}
                >
                  {/* Visual */}
                  <div className="relative h-36 bg-gradient-to-br from-muted/40 to-muted/70 flex items-center justify-center">
                    <div className="flex gap-3">
                      {outfit.items.map((item, i) => (
                        <div key={i} className="text-center">
                          <span className="text-3xl">{item.emoji}</span>
                          <p className="text-[9px] text-muted-foreground mt-0.5 max-w-[48px] leading-tight line-clamp-1">{item.name.split(" ").slice(0, 2).join(" ")}</p>
                        </div>
                      ))}
                    </div>
                    <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${scoreBg(outfit.score)} ${scoreColor(outfit.score)}`}>
                      <Star className="w-3 h-3" />{outfit.score}
                    </div>
                    <div
                      onClick={e => { e.stopPropagation(); toggleSave(outfit.id); }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${isSaved ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" : "bg-card/80 text-muted-foreground hover:text-violet-600"}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between mb-1.5">
                      <p className="text-[12px] font-semibold text-foreground">{outfit.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      {occ && (
                        <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${occ.color}`}>
                          <OccIcon className="w-2.5 h-2.5" />{occ.label}
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground">Body: {outfit.bodyScore}%</span>
                    </div>

                    {outfit.missing && (
                      <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-2">
                        <ShoppingBag className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-[9px] text-amber-700 dark:text-amber-400 leading-tight line-clamp-1">{outfit.missing}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{outfit.items.length} items</span>
                      <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                        View details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Generate more */}
            <button
              onClick={generate}
              className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors group active:scale-[0.98]"
              style={{ minHeight: 240 }}
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 group-hover:border-primary/40 flex items-center justify-center mb-2 transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Generate More</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {activeOccasion === "all" ? "All occasions" : occasions.find(o => o.id === activeOccasion)?.label}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
