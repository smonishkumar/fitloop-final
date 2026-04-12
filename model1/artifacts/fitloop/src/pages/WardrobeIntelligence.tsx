import { useState, useRef, useCallback, useEffect } from "react";
import {
  BookOpen, Upload, Camera, Search, Plus,
  CheckCircle2, Eye, Trash2, Grid3X3, List,
  Copy, X, Tag, Ruler, Star, ChevronRight, Edit2,
  Loader2, Shirt, Footprints, Sofa, AlertTriangle,
  Video, VideoOff, SwitchCamera, Aperture
} from "lucide-react";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { getClothingImage } from "@/lib/clothingMap";

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

// ═══════════════════════════════════════════════════════════════════════════
// Live Camera Capture Modal
// ═══════════════════════════════════════════════════════════════════════════
function CameraModal({ onCapture, onClose }: { onCapture: (blob: Blob) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [captured, setCaptured] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    setCameraReady(false);
    setCameraError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permissions in your browser."
          : err.name === "NotFoundError"
          ? "No camera found. Please connect a camera and try again."
          : `Camera error: ${err.message}`
      );
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const switchCamera = () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    startCamera(newFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
  };

  const captureWithCountdown = () => {
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const confirmCapture = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
      },
      "image/jpeg",
      0.92
    );
  };

  const retake = () => {
    setCaptured(null);
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Live Camera Scan</h2>
            {cameraReady && !captured && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Camera Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <VideoOff className="w-12 h-12 text-red-400 mb-3" />
              <p className="text-sm text-red-300 font-medium mb-1">Camera Unavailable</p>
              <p className="text-xs text-gray-400 max-w-xs">{cameraError}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="mt-4 px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${captured ? "hidden" : ""} ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />
              {captured && (
                <img src={captured} alt="Captured" className="w-full h-full object-cover" />
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-7xl font-bold text-white animate-ping">{countdown}</span>
                </div>
              )}

              {/* Corner guides */}
              {!captured && cameraReady && (
                <>
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400 rounded-br-lg" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-[11px] text-amber-300 font-medium">Point camera at your wardrobe</p>
                  </div>
                </>
              )}

              {/* Loading spinner while camera initializes */}
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                  <p className="text-xs text-gray-400">Initializing camera...</p>
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-4">
          {!captured ? (
            <>
              <button
                onClick={switchCamera}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 shadow-lg shadow-amber-600/30 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                title="Capture Photo"
              >
                <Aperture className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={captureWithCountdown}
                disabled={!cameraReady}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-40"
                title="3s Timer Capture"
              >
                <span className="text-xs text-white font-bold">3s</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Camera className="w-4 h-4" />Retake
              </button>
              <button
                onClick={confirmCapture}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-amber-600/30 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />Scan This Image
              </button>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-500 mt-3">
          {captured ? "Review your capture, then scan or retake" : "Position your wardrobe in the frame and capture"}
        </p>
      </div>
    </div>
  );
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
          <div className="h-36 rounded-xl bg-gradient-to-b from-muted/40 to-muted/80 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
              <img src={getClothingImage(item.type)} className="w-full h-full object-cover blur-sm" alt="bg blur" />
            </div>
            <div className="z-10 w-20 h-20 rounded-full border-4 border-white dark:border-card shadow-lg overflow-hidden bg-card">
              <img src={getClothingImage(item.type)} className="w-full h-full object-cover" alt={item.type} />
            </div>
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
  const { items, setItems, scannedImageUrl, setScannedImageUrl } = useWardrobe();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(items.length > 0);
  const [scanStatus, setScanStatus] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeColor, setActiveColor] = useState("All");
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  // ── Shared scan logic ──
  const runScan = useCallback(async (imageBlob: Blob, previewUrl?: string) => {
    if (previewUrl) {
      setScannedImageUrl(previewUrl);
    }
    setScanning(true);
    setScanned(false);
    setScanError(null);
    setScanStatus("Uploading image to AI engine...");

    try {
      const formData = new FormData();
      formData.append("image", imageBlob, "capture.jpg");

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
    }
  }, [setItems, setScannedImageUrl]);

  // ── File upload handler ──
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    await runScan(file, url);
    e.target.value = "";
  }, [runScan]);

  // ── Camera capture handler ──
  const handleCameraCapture = useCallback(async (blob: Blob) => {
    setShowCamera(false);
    const url = URL.createObjectURL(blob);
    await runScan(blob, url);
  }, [runScan]);

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
      {/* Hidden file input */}
      <input ref={uploadFileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

      {/* Camera Modal */}
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

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
          <p className="text-xs text-muted-foreground">AI-powered clothing detection with Gemini Deep Scan · Live Camera Supported</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => uploadFileRef.current?.click()} disabled={scanning} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60">
            <Upload className="w-3.5 h-3.5" />Upload Image
          </button>
          <button onClick={() => setShowCamera(true)} disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-xs font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-600/20 disabled:opacity-60"
          >
            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            {scanning ? "Scanning..." : "📷 Live Camera Scan"}
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
              {scannedImageUrl ? (
                <img src={scannedImageUrl} alt="Uploaded clothing" className="h-full w-full object-cover rounded-lg" />
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
              <button onClick={() => setShowCamera(true)} disabled={scanning} className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-xs font-medium hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 transition-all shadow-md shadow-amber-600/20">
                <Camera className="w-3.5 h-3.5" />📷 Scan via Camera
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
                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-red-200 dark:border-red-800">
                      <img src={getClothingImage(item.type)} className="w-full h-full object-cover" alt={item.type} />
                    </div>
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
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-base font-semibold mb-1">Your wardrobe is empty</p>
                  <p className="text-xs text-muted-foreground mb-4">Use the live camera or upload an image to get started</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-600/20"
                    >
                      <Camera className="w-4 h-4" />📷 Open Camera
                    </button>
                    <button
                      onClick={() => uploadFileRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <Upload className="w-4 h-4" />Upload Image
                    </button>
                  </div>
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
                      <div className="w-20 h-20 mx-auto mt-4 mb-3 rounded-full overflow-hidden border-2 border-border/50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <img src={getClothingImage(item.type)} className="w-full h-full object-cover" alt={item.type} />
                      </div>
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
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-border">
                        <img src={getClothingImage(item.type)} className="w-full h-full object-cover" alt={item.type} />
                      </div>
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
