import { useState } from "react";
import {
  Wand2, Star, RefreshCw, Bookmark, ShoppingBag, ChevronRight,
  Sun, Briefcase, Music, Heart, Coffee, Plane, Plus, X,
  CheckCircle2, ArrowRight, Sparkles, MoreHorizontal
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

type Outfit = {
  id: number; name: string; occasion: string; score: number;
  items: { emoji: string; name: string; brand: string }[];
  missing?: string; saved: boolean; bodyScore: number;
};

const outfits: Outfit[] = [
  {
    id: 1, name: "Smart Casual Friday", occasion: "casual", score: 94, saved: true, bodyScore: 96,
    items: [
      { emoji: "👔", name: "White Oxford Shirt", brand: "Uniqlo" },
      { emoji: "👖", name: "Navy Slim Trousers", brand: "Zara" },
      { emoji: "👟", name: "White Sneakers", brand: "—" },
    ],
  },
  {
    id: 2, name: "Power Meeting Look", occasion: "work", score: 91, saved: false, bodyScore: 93,
    items: [
      { emoji: "🥼", name: "Blazer Charcoal", brand: "& Other Stories" },
      { emoji: "👔", name: "White Oxford Shirt", brand: "Uniqlo" },
      { emoji: "👖", name: "Beige Chinos", brand: "H&M" },
    ],
    missing: "Oxford shoes — shop now",
  },
  {
    id: 3, name: "Summer Date Night", occasion: "date", score: 88, saved: false, bodyScore: 90,
    items: [
      { emoji: "👗", name: "Floral Midi Dress", brand: "Zara" },
      { emoji: "👡", name: "Strappy Heels", brand: "—" },
      { emoji: "👛", name: "Clutch", brand: "—" },
    ],
    missing: "Strappy heels — not in wardrobe",
  },
  {
    id: 4, name: "Weekend Explorer", occasion: "outdoor", score: 96, saved: true, bodyScore: 97,
    items: [
      { emoji: "🧥", name: "Denim Jacket Classic", brand: "Levi's" },
      { emoji: "👕", name: "White T-Shirt V2", brand: "H&M" },
      { emoji: "🩲", name: "Beige Chinos", brand: "H&M" },
    ],
  },
  {
    id: 5, name: "Business Travel", occasion: "travel", score: 90, saved: false, bodyScore: 91,
    items: [
      { emoji: "🥼", name: "Blazer Charcoal", brand: "& Other Stories" },
      { emoji: "🏖️", name: "Striped Linen Shirt", brand: "Mango" },
      { emoji: "🦵", name: "Black Skinny Jeans", brand: "Topshop" },
    ],
  },
];

const scoreColor = (s: number) => s >= 92 ? "text-green-600 dark:text-green-400" : s >= 85 ? "text-amber-600" : "text-red-500";
const scoreBg = (s: number) => s >= 92 ? "bg-green-50 dark:bg-green-900/20" : s >= 85 ? "bg-amber-50 dark:bg-amber-900/20" : "bg-red-50 dark:bg-red-900/20";

export default function OutfitEngine() {
  const [activeOccasion, setActiveOccasion] = useState("casual");
  const [generating, setGenerating] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set([1, 4]));
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  const displayed = outfits.filter(o => activeOccasion === "all" || o.occasion === activeOccasion || !outfits.find(oo => oo.occasion === activeOccasion));

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
            <Bookmark className="w-3.5 h-3.5" />Saved Outfits ({savedIds.size})
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
        {/* Left: controls */}
        <div className="col-span-3 space-y-4">
          {/* D2: Occasion filter */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Occasion</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveOccasion("all")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${activeOccasion === "all" ? "bg-accent text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <Wand2 className="w-3.5 h-3.5" />All Occasions
              </button>
              {occasions.map(occ => {
                const Icon = occ.icon;
                return (
                  <button key={occ.id} onClick={() => setActiveOccasion(occ.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${activeOccasion === occ.id ? "bg-accent text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />{occ.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* D4: Body-aware matching */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Body-Aware Matching</h3>
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

          {/* D3: Mix & Match engine */}
          <div className="bg-gradient-to-br from-pink-500 to-purple-700 rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />Mix & Match
            </h3>
            <p className="text-white/70 text-[11px] mb-3">AI engine analyzes color, pattern, fit, and occasion compatibility</p>
            <div className="space-y-1.5">
              {[["Items Analyzed", "12"], ["Combos Tested", "864"], ["Top Outfits", "5"], ["Avg Match Score", "92%"]].map(([k, v]) => (
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

        {/* Right: Outfit cards */}
        <div className="col-span-9">
          {generating && (
            <div className="flex items-center gap-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4 mb-4">
              <div className="w-7 h-7 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-pink-800 dark:text-pink-300">Generating outfit combinations...</p>
                <p className="text-xs text-pink-600 dark:text-pink-400 mt-0.5">Analyzing 864 combinations for {occasions.find(o => o.id === activeOccasion)?.label ?? "all"} occasions</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {outfits.map(outfit => {
              const isSaved = savedIds.has(outfit.id);
              return (
                <div key={outfit.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all group cursor-pointer" onClick={() => setSelectedOutfit(outfit === selectedOutfit ? null : outfit)}>
                  {/* Outfit visual */}
                  <div className="relative h-36 bg-gradient-to-br from-muted/40 to-muted/70 flex items-center justify-center">
                    <div className="flex gap-3">
                      {outfit.items.map((item, i) => (
                        <div key={i} className="text-center">
                          <span className="text-3xl">{item.emoji}</span>
                          <p className="text-[9px] text-muted-foreground mt-0.5 max-w-[48px] leading-tight line-clamp-2">{item.name.split(" ").slice(0, 2).join(" ")}</p>
                        </div>
                      ))}
                    </div>
                    {/* D5: Match score */}
                    <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${scoreBg(outfit.score)} ${scoreColor(outfit.score)}`}>
                      <Star className="w-3 h-3" />
                      {outfit.score}
                    </div>
                    {/* Save button */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleSave(outfit.id); }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSaved ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" : "bg-card/80 text-muted-foreground hover:text-violet-600"}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{outfit.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {(() => {
                            const occ = occasions.find(o => o.id === outfit.occasion);
                            if (!occ) return null;
                            const Icon = occ.icon;
                            return (
                              <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${occ.color}`}>
                                <Icon className="w-2.5 h-2.5" />{occ.label}
                              </span>
                            );
                          })()}
                          <span className="text-[9px] text-muted-foreground">Body: {outfit.bodyScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-2">
                      {outfit.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-xs">{item.emoji}</span>
                          <span className="text-[10px] text-muted-foreground flex-1 truncate">{item.name}</span>
                          <span className="text-[9px] text-muted-foreground">{item.brand}</span>
                        </div>
                      ))}
                    </div>

                    {/* D6: Missing item suggestion */}
                    {outfit.missing && (
                      <div className="flex items-start gap-1.5 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-2">
                        <ShoppingBag className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">{outfit.missing}</p>
                      </div>
                    )}

                    {/* D7: Action buttons */}
                    <div className="flex gap-1.5 mt-2">
                      <button className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium hover:bg-primary/90 transition-colors">
                        Wear This
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); generate(); }}
                        className="w-8 h-7 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty slot */}
            <div className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center h-56 cursor-pointer hover:border-primary/40 transition-colors group" onClick={generate}>
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Generate More</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">For {occasions.find(o => o.id === activeOccasion)?.label ?? "all"} occasions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
