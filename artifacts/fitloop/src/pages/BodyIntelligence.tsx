import { useState, useRef, useEffect } from "react";
import {
  Brain, Camera, Upload, RefreshCw, CheckCircle2, AlertCircle,
  Sparkles, Ruler, Info, Edit2, Check
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type Measurement = { label: string; value: number; unit: string; status: "good" | "warn" };

const defaultMeasurements: Measurement[] = [
  { label: "Chest", value: 38.5, unit: "in", status: "good" },
  { label: "Waist", value: 30.2, unit: "in", status: "good" },
  { label: "Hips", value: 40.0, unit: "in", status: "good" },
  { label: "Shoulder Width", value: 15.5, unit: "in", status: "warn" },
  { label: "Inseam", value: 30.0, unit: "in", status: "good" },
  { label: "Sleeve Length", value: 25.5, unit: "in", status: "good" },
  { label: "Neck", value: 15.0, unit: "in", status: "good" },
  { label: "Thigh", value: 22.0, unit: "in", status: "good" },
  { label: "Height", value: 167, unit: "cm", status: "good" },
  { label: "Weight", value: 62, unit: "kg", status: "good" },
  { label: "Rise", value: 10.5, unit: "in", status: "good" },
  { label: "Calf", value: 14.5, unit: "in", status: "good" },
];

function EditableMeasurementCell({ m, onSave }: { m: Measurement; onSave: (val: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(m.value));
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n > 0) onSave(n);
    setEditing(false);
  };
  return (
    <div
      onClick={() => { if (!editing) { setDraft(String(m.value)); setEditing(true); } }}
      className={`group relative p-2.5 rounded-lg border text-left w-full transition-all hover:shadow-sm cursor-pointer ${
        m.status === "warn"
          ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 hover:border-amber-400"
          : "border-border bg-muted/30 hover:border-blue-300 dark:hover:border-blue-700"
      }`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-muted-foreground">{m.label}</span>
        <div className="flex items-center gap-1">
          <Edit2 className="w-2.5 h-2.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          {m.status === "warn"
            ? <AlertCircle className="w-3 h-3 text-amber-500" />
            : <CheckCircle2 className="w-3 h-3 text-green-500" />}
        </div>
      </div>
      {editing ? (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            className="w-14 text-sm font-bold bg-background border border-primary rounded px-1 focus:outline-none"
          />
          <span className="text-[10px] text-muted-foreground">{m.unit}</span>
          <div onClick={commit} className="w-4 h-4 rounded bg-green-500 flex items-center justify-center cursor-pointer">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      ) : (
        <span className="text-sm font-bold text-foreground">{m.value} <span className="text-[10px] font-normal text-muted-foreground">{m.unit}</span></span>
      )}
    </div>
  );
}

const radarData = [
  { metric: "Chest", value: 78 },
  { metric: "Waist", value: 62 },
  { metric: "Hips", value: 82 },
  { metric: "Shoulders", value: 85 },
  { metric: "Legs", value: 74 },
  { metric: "Arms", value: 70 },
];

const bodyTypes = [
  { id: "athletic", label: "Athletic", desc: "Broad shoulders, defined waist", selected: true },
  { id: "slim", label: "Slim", desc: "Narrow frame, lean build", selected: false },
  { id: "regular", label: "Regular", desc: "Average proportions", selected: false },
  { id: "plus", label: "Plus", desc: "Fuller figure", selected: false },
];

const sizeRecommendations = [
  { brand: "Zara", tops: "M", bottoms: "32W 30L", confidence: 97 },
  { brand: "H&M", tops: "L", bottoms: "32W 30L", confidence: 91 },
  { brand: "Uniqlo", tops: "M", bottoms: "31W 30L", confidence: 94 },
  { brand: "Levi's", tops: "M", bottoms: "32W 32L", confidence: 89 },
  { brand: "Zara Man", tops: "L", bottoms: "M", confidence: 88 },
];

const mlFeedback = [
  { type: "info", text: "Shoulder width is slightly above average for your height — prefer raglan or relaxed cuts." },
  { type: "tip", text: "Slim-fit trousers will complement your leg-to-waist ratio best." },
  { type: "warn", text: "Avoid boxy fits — they may conceal your athletic frame." },
  { type: "tip", text: "Your inseam-to-rise ratio suggests mid-rise bottoms are ideal." },
];

export default function BodyIntelligence() {
  const [measurements, setMeasurements] = useState<Measurement[]>(defaultMeasurements);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(true);
  const [scanStep, setScanStep] = useState(3);
  const [activeBodyType, setActiveBodyType] = useState("athletic");

  const updateMeasurement = (label: string, value: number) => {
    setMeasurements(prev => prev.map(m => m.label === label ? { ...m, value } : m));
  };

  const startScan = () => {
    setScanning(true);
    setScanned(false);
    setScanStep(0);
    const steps = [0, 1, 2, 3];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setScanStep(s + 1);
        if (i === steps.length - 1) { setScanning(false); setScanned(true); }
      }, (i + 1) * 900);
    });
  };

  return (
    <div className="p-5 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Brain className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">Body Intelligence</h1>
          </div>
          <p className="text-xs text-muted-foreground">Real-time body analysis, measurements, and ML-powered fit predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload Photos
          </button>
          <button
            onClick={startScan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <Camera className="w-3.5 h-3.5" />
            {scanning ? "Scanning..." : "Scan Body"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Live scan panel */}
        <div className="col-span-4 space-y-4">
          {/* B1: Live body scan */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Live Body Scan</span>
              <div className={`flex items-center gap-1.5 text-[11px] font-medium ${scanned ? "text-green-600" : scanning ? "text-amber-500" : "text-muted-foreground"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${scanned ? "bg-green-500" : scanning ? "bg-amber-400 animate-pulse" : "bg-muted-foreground/40"}`} />
                {scanned ? "Scan Complete" : scanning ? "Scanning..." : "Ready"}
              </div>
            </div>

            {/* Scan viewport */}
            <div className="relative h-64 bg-gradient-to-b from-blue-50/50 to-muted/30 dark:from-blue-900/10 dark:to-muted/30 flex items-center justify-center">
              {scanning ? (
                <div className="text-center px-4">
                  {/* Animated scan lines */}
                  <div className="relative w-24 mx-auto mb-4">
                    <div className="w-24 h-36 border-2 border-blue-400/60 rounded-lg flex items-center justify-center bg-blue-50/50 dark:bg-blue-900/20">
                      <div className="absolute inset-x-0 animate-bounce" style={{ top: `${(scanStep / 4) * 100}%` }}>
                        <div className="h-0.5 bg-blue-500/70 w-full" />
                      </div>
                      <Brain className="w-8 h-8 text-blue-300" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {["Initializing camera...", "Detecting body outline...", "Measuring key points...", "Finalizing scan..."][scanStep - 1] || "Processing..."}
                  </p>
                  <div className="flex justify-center gap-1 mt-3">
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} className={`h-1 rounded-full transition-all ${s <= scanStep ? "w-6 bg-blue-500" : "w-2 bg-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Body SVG */}
                  <svg width="110" height="260" viewBox="0 0 110 260" fill="none">
                    <ellipse cx="55" cy="26" rx="18" ry="22" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" />
                    <rect x="46" y="44" width="18" height="14" rx="3" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" />
                    <path d="M18 56 Q12 80 14 118 L96 118 Q98 80 92 56 Q76 48 55 48 Q34 48 18 56Z" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" />
                    <path d="M18 60 Q6 82 8 118 L18 116 Q16 84 26 66Z" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" />
                    <path d="M92 60 Q104 82 102 118 L92 116 Q94 84 84 66Z" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" />
                    <path d="M14 116 Q10 148 12 166 L98 166 Q100 148 96 116Z" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1.5" />
                    <path d="M12 162 Q6 206 10 248 L38 248 Q36 204 36 164Z" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.5" />
                    <path d="M98 162 Q104 206 100 248 L72 248 Q74 204 74 164Z" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.5" />
                    {scanned && (
                      <>
                        <circle cx="55" cy="88" r="6" fill="#22c55e" opacity={0.9} />
                        <text x="55" y="92" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">✓</text>
                      </>
                    )}
                  </svg>
                  {scanned && (
                    <div className="absolute -right-16 top-8 space-y-2">
                      {["38.5\"", "30.2\"", "40.0\""].map((v, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className="w-6 border-t border-dashed border-blue-300" />
                          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1 rounded">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            </div>

            <div className="p-3 flex gap-2">
              <button onClick={startScan} disabled={scanning} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                <Camera className="w-3.5 h-3.5" />Camera Scan
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                <Upload className="w-3.5 h-3.5" />Upload
              </button>
            </div>
          </div>

          {/* B2: Confidence layer */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Confidence Layer</h3>
            {scanned ? (
              <div className="space-y-2.5">
                {[
                  { label: "Overall Scan Confidence", value: 96, color: "bg-green-500" },
                  { label: "Measurement Accuracy", value: 94, color: "bg-blue-500" },
                  { label: "Body Type Classification", value: 91, color: "bg-violet-500" },
                  { label: "Fit Prediction Reliability", value: 93, color: "bg-amber-500" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-muted-foreground">{item.label}</span>
                      <span className="text-[11px] font-bold text-foreground">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">Run a body scan to see confidence scores</div>
            )}
          </div>
        </div>

        {/* Center: Measurements & radar */}
        <div className="col-span-5 space-y-4">
          {/* Body type */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Body Type Classification</h3>
            <div className="grid grid-cols-4 gap-2">
              {bodyTypes.map(bt => (
                <button
                  key={bt.id}
                  onClick={() => setActiveBodyType(bt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${activeBodyType === bt.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-border hover:border-blue-300"}`}
                >
                  <p className={`text-xs font-semibold ${activeBodyType === bt.id ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>{bt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{bt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Measurements grid — click any cell to edit */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Measurements</h3>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                <Edit2 className="w-2.5 h-2.5" />Click any cell to edit
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {measurements.map(m => (
                <EditableMeasurementCell
                  key={m.label}
                  m={m}
                  onSave={val => updateMeasurement(m.label, val)}
                />
              ))}
            </div>
          </div>

          {/* Radar */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">Body Proportion Radar</h3>
            <p className="text-xs text-muted-foreground mb-2">Relative body dimensions compared to your height</p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: size recs & ML feedback */}
        <div className="col-span-3 space-y-4">
          {/* B3: Size recommendations */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Size Recommendations</h3>
            </div>
            <div className="space-y-2">
              {sizeRecommendations.map(r => (
                <div key={r.brand} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{r.brand}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Top: {r.tops} · Bottom: {r.bottoms}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold ${r.confidence >= 93 ? "text-green-600 dark:text-green-400" : r.confidence >= 88 ? "text-amber-600" : "text-red-500"}`}>
                      {r.confidence}%
                    </div>
                    <div className="text-[9px] text-muted-foreground">confidence</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B4: Smart ML feedback */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <h3 className="text-sm font-semibold text-foreground">Smart ML Feedback</h3>
            </div>
            <div className="space-y-2">
              {mlFeedback.map((f, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg text-[11px] ${
                  f.type === "warn" ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                  : f.type === "info" ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  : "bg-muted/60"
                }`}>
                  {f.type === "warn" ? <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    : f.type === "info" ? <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    : <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />}
                  <p className={`leading-relaxed ${f.type === "warn" ? "text-amber-700 dark:text-amber-400" : f.type === "info" ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground"}`}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Profile completeness */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4">
            <p className="text-white font-semibold text-sm mb-1">Body Profile</p>
            <p className="text-white/70 text-[11px] mb-3">12/12 measurements captured</p>
            <div className="h-2 bg-white/20 rounded-full mb-2">
              <div className="h-full w-full bg-white rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-[11px]">100% complete</span>
              <span className="text-white text-xs font-bold">96.2% confidence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
