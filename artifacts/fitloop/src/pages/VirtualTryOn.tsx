import { useState } from "react";
import {
  Shirt, Upload, Sliders, Camera, RefreshCw, ChevronDown,
  CheckCircle2, ArrowRight, Maximize2, RotateCcw, ZoomIn,
  Sparkles, AlertCircle, Info
} from "lucide-react";

const bodyTypes = ["Slim", "Athletic", "Regular", "Plus", "Petite"];
const genders = ["Women", "Men", "Unisex"];

const products = [
  { id: 1, name: "Floral Midi Dress", brand: "Zara", size: "M", fit: "perfect", sku: "ZAR-2041", img: "👗" },
  { id: 2, name: "Slim Chino Trousers", brand: "H&M", size: "32W 30L", fit: "size-up", sku: "HM-3820", img: "👖" },
  { id: 3, name: "Oversized Linen Shirt", brand: "Uniqlo", size: "L", fit: "perfect", sku: "UNQ-0912", img: "👔" },
  { id: 4, name: "Classic Denim Jacket", brand: "Levi's", size: "M", fit: "size-down", sku: "LVS-4451", img: "🧥" },
];

const fitBadge = {
  perfect: { label: "Perfect Fit", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  "size-up": { label: "Size Up Suggested", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  "size-down": { label: "Size Down Suggested", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

const measurements = [
  { label: "Chest", value: "38\"", match: true },
  { label: "Waist", value: "30\"", match: true },
  { label: "Hips", value: "40\"", match: true },
  { label: "Shoulder", value: "15.5\"", match: false },
  { label: "Length", value: "28\"", match: true },
  { label: "Inseam", value: "30\"", match: true },
];

export default function VirtualTryOn() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [bodyType, setBodyType] = useState("Athletic");
  const [gender, setGender] = useState("Women");
  const [height, setHeight] = useState(167);
  const [weight, setWeight] = useState(62);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);
  const [view, setView] = useState<"front" | "side" | "back">("front");

  const runAnalysis = () => {
    setAnalyzing(true);
    setAnalyzed(false);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1800);
  };

  const fit = fitBadge[selectedProduct.fit as keyof typeof fitBadge];

  return (
    <div className="p-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Virtual Try-On</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ML-powered 3D body simulation and fit analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload Body Scan
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Camera className="w-3.5 h-3.5" />
            Live Camera
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Left: Product selector */}
        <div className="col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Select Product</h3>
            <div className="space-y-2">
              {products.map((p) => {
                const pFit = fitBadge[p.fit as keyof typeof fitBadge];
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setAnalyzed(false); }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedProduct.id === p.id
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.img}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand} · {p.sku}</p>
                        {analyzed && selectedProduct.id === p.id && (
                          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${pFit.color}`}>
                            {pFit.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body params */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
              Body Parameters
            </h3>

            {/* Gender */}
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Gender</label>
              <div className="flex gap-1">
                {genders.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      gender === g
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Body type */}
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Body Type</label>
              <div className="grid grid-cols-3 gap-1">
                {bodyTypes.map((bt) => (
                  <button
                    key={bt}
                    onClick={() => setBodyType(bt)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      bodyType === bt
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Height */}
            <div className="mb-3">
              <label className="text-xs text-muted-foreground mb-1.5 block flex items-center justify-between">
                <span>Height</span>
                <span className="font-medium text-foreground">{height} cm</span>
              </label>
              <input
                type="range" min={140} max={210} value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 rounded-full"
              />
            </div>

            {/* Weight */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-1.5 block flex items-center justify-between">
                <span>Weight</span>
                <span className="font-medium text-foreground">{weight} kg</span>
              </label>
              <input
                type="range" min={40} max={130} value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 rounded-full"
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-all"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run Fit Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center: 3D view */}
        <div className="col-span-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* View controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {(["front", "side", "back"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                      view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3D canvas area */}
            <div className="relative h-[480px] flex items-center justify-center bg-gradient-to-b from-muted/30 to-muted/60">
              {analyzing ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-foreground">Analyzing body measurements...</p>
                  <p className="text-xs text-muted-foreground mt-1">Processing 2,048 data points</p>
                </div>
              ) : (
                <>
                  {/* Simulated body silhouette */}
                  <div className="relative">
                    {/* Body SVG representation */}
                    <svg width="160" height="360" viewBox="0 0 160 360" fill="none" className="drop-shadow-lg">
                      {/* Head */}
                      <ellipse cx="80" cy="32" rx="26" ry="30" fill="#e2d9f3" stroke="#7c3aed" strokeWidth="1.5" />
                      {/* Neck */}
                      <rect x="69" y="58" width="22" height="18" rx="4" fill="#e2d9f3" stroke="#7c3aed" strokeWidth="1.5" />
                      {/* Torso */}
                      <path d="M28 76 Q20 110 22 160 L138 160 Q140 110 132 76 Q112 68 80 68 Q48 68 28 76Z" fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" />
                      {/* Left arm */}
                      <path d="M28 82 Q8 110 12 160 L26 158 Q24 116 38 90Z" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5" />
                      {/* Right arm */}
                      <path d="M132 82 Q152 110 148 160 L134 158 Q136 116 122 90Z" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5" />
                      {/* Lower body */}
                      <path d="M22 158 Q18 200 20 230 L140 230 Q142 200 138 158Z" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1.5" />
                      {/* Left leg */}
                      <path d="M20 226 Q10 280 14 340 L54 340 Q52 280 48 228Z" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1.5" />
                      {/* Right leg */}
                      <path d="M140 226 Q150 280 146 340 L106 340 Q108 280 112 228Z" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1.5" />

                      {/* Fit indicators */}
                      {analyzed && (
                        <>
                          <circle cx="80" cy="120" r="8" fill="#22c55e" opacity="0.9" />
                          <text x="80" y="124" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">✓</text>

                          {selectedProduct.fit === "size-up" && (
                            <>
                              <rect x="18" y="82" width="12" height="80" rx="3" fill="#f59e0b" opacity="0.7" />
                              <rect x="130" y="82" width="12" height="80" rx="3" fill="#f59e0b" opacity="0.7" />
                            </>
                          )}
                        </>
                      )}
                    </svg>

                    {/* Garment label */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-lg">{selectedProduct.img}</span>
                      <span className="text-xs font-medium text-foreground ml-1">{selectedProduct.name}</span>
                    </div>

                    {/* Measurement lines */}
                    {analyzed && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-0 top-[76px] w-6 border-t border-dashed border-violet-400/60" />
                        <div className="absolute right-0 top-[76px] w-6 border-t border-dashed border-violet-400/60" />
                        <div className="absolute left-0 top-[158px] w-6 border-t border-dashed border-violet-400/60" />
                        <div className="absolute right-0 top-[158px] w-6 border-t border-dashed border-violet-400/60" />
                      </div>
                    )}
                  </div>

                  {/* Fit badge overlay */}
                  {analyzed && (
                    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${fit.color}`}>
                      <CheckCircle2 className="w-4 h-4" />
                      {fit.label}
                    </div>
                  )}

                  {!analyzed && !analyzing && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                      <p className="text-xs text-muted-foreground">Adjust parameters and run fit analysis</p>
                    </div>
                  )}
                </>
              )}

              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
              />
            </div>
          </div>
        </div>

        {/* Right: Fit analysis */}
        <div className="col-span-3 space-y-4">
          {/* Fit score */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Fit Score</h3>
            {analyzed ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-foreground">
                    {selectedProduct.fit === "perfect" ? "97" : "81"}
                  </span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${fit.color}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {fit.label}
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-1000"
                    style={{ width: selectedProduct.fit === "perfect" ? "97%" : "81%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedProduct.fit === "perfect"
                    ? "Excellent match across all measurement points"
                    : "Minor adjustment recommended for optimal fit"}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">Run analysis to see fit score</p>
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Measurements</h3>
            <div className="space-y-2.5">
              {measurements.map((m) => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">{m.value}</span>
                    {analyzed && (
                      m.match
                        ? <CheckCircle2 className="w-3 h-3 text-green-500" />
                        : <AlertCircle className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analyzed && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                AI Recommendations
              </h3>
              <div className="space-y-2">
                {selectedProduct.fit === "perfect" ? (
                  <>
                    <div className="flex items-start gap-2 p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-green-700 dark:text-green-400">Size M is your ideal fit for this style</p>
                    </div>
                    <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
                      <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">95% confidence based on your measurements</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">Consider sizing up for shoulder room</p>
                    </div>
                    <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
                      <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">81% confidence — shoulder width is borderline</p>
                    </div>
                  </>
                )}
              </div>
              <button className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 border border-primary text-primary rounded-lg text-xs font-medium hover:bg-accent transition-colors">
                Add to Order Report
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
