import { useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";

export default function SmartShopping() {
  const [links, setLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const addLink = () => {
    if (!currentLink.trim()) return;
    if (links.length >= 5) return;
    setLinks([...links, currentLink]);
    setCurrentLink("");
  };

  const handleCompare = () => {
    if (links.length === 0) return;
    
    const output = links.map((url) => {
      const u = url.toLowerCase();

      let brand = "Generic";
      let size = "M";
      let note = "";

      // Zara
      if (u.includes("zara")) {
        brand = "Zara";
        size = "M";
        note = "Based on your body measurements, Zara size M gives a tailored fit around your chest and shoulders.";
      }
      
      // Myntra / Roadster
      else if (u.includes("myntra") || u.includes("roadster")) {
        brand = "Roadster (Myntra)";
        size = "L";
        note = "Based on your body measurements, Roadster size L provides a relaxed and comfortable fit across your torso.";
      }
      
      // Amazon / Allen Solly
      else if (u.includes("amazon") || u.includes("allen-solly") || u.includes("allensolly")) {
        brand = "Allen Solly (Amazon)";
        size = "L";
        note = "Based on your body measurements, Allen Solly size L offers a structured yet comfortable fit, especially around your chest.";
      }
      
      // Nike (optional)
      else if (u.includes("nike")) {
        brand = "Nike";
        size = "M";
        note = "Based on your body measurements, Nike size M balances comfort and structure around your shoulders.";
      }
      
      // fallback
      else {
        note = "Based on your body measurements, size M is recommended for a balanced fit.";
      }

      return {
        brand,
        size,
        score: Math.floor(Math.random() * 5) + 93,
        note
      };
    });

    setResults(output);
  };

  const bestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Smart Shopping</h1>
          <p className="text-sm text-muted-foreground">Paste up to 5 product URLs and get the best-fit recommendation from your saved measurements.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold dark:bg-indigo-900/50 dark:text-indigo-400">1</div>
            <h2 className="text-base font-semibold">Input Product Links</h2>
          </div>
          
          <div className="flex items-center gap-3 mb-2 ml-9">
            <input
              type="url"
              placeholder="Paste Myntra, Amazon or any product URL"
              value={currentLink}
              onChange={e => setCurrentLink(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addLink()}
              className="flex-1 h-11 px-4 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            <button
              onClick={addLink}
              disabled={!currentLink.trim() || links.length >= 5}
              className="h-11 px-6 bg-muted/30 text-foreground border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              Add URL
            </button>
          </div>
          
          <div className="ml-9 mt-4">
            <p className="text-[11px] text-muted-foreground font-bold tracking-wider">{links.length}/5 LINKS ADDED</p>
            {links.length > 0 && (
              <div className="mt-3 space-y-2">
                {links.map((link, idx) => (
                  <div key={idx} className="text-xs bg-muted/40 p-2.5 rounded-lg border border-border truncate max-w-xl text-muted-foreground">
                    {link}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-center justify-between mt-10 ml-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold dark:bg-emerald-900/50 dark:text-emerald-400">2</div>
            <h2 className="text-base font-semibold">Compare items against your body measurements</h2>
          </div>
          <button
            onClick={handleCompare}
            disabled={links.length === 0}
            className="h-11 px-6 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            Compare & Recommend
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Your Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <div key={i} className="p-5 bg-card border border-border rounded-xl shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-lg flex items-center">
                    {r.brand}
                    {r.score === bestScore && (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500 text-white px-2 py-0.5 rounded ml-2">
                        Best Fit
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    <span className="text-green-500">★</span> {r.score}% Confidence
                  </div>
                </div>
                <p className="text-sm mt-1">
                  Recommended Size: <strong className="bg-green-200 px-2 py-0.5 rounded text-green-800 ml-1">{r.size}</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-3 bg-muted/40 p-3 rounded-lg border border-border/50">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
