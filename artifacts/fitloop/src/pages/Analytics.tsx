import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import {
  BarChart3, TrendingUp, TrendingDown, Users, Activity,
  Download, Calendar, RefreshCw, ArrowUpRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";

const monthlyData = [
  { month: "Sep", users: 28000, tryOns: 41000, returns: 5200, saves: 3100 },
  { month: "Oct", users: 31000, tryOns: 46000, returns: 4800, saves: 3600 },
  { month: "Nov", users: 36000, tryOns: 52000, returns: 4300, saves: 4200 },
  { month: "Dec", users: 42000, tryOns: 64000, returns: 3900, saves: 5100 },
  { month: "Jan", users: 38000, tryOns: 58000, returns: 3400, saves: 4800 },
  { month: "Feb", users: 44000, tryOns: 68000, returns: 3000, saves: 5600 },
  { month: "Mar", users: 48000, tryOns: 74000, returns: 2600, saves: 6200 },
];

const categoryPerformance = [
  { category: "Dresses", fitScore: 94, returns: 5.2, tryOns: 18400 },
  { category: "Tops", fitScore: 91, returns: 7.1, tryOns: 22100 },
  { category: "Bottoms", fitScore: 79, returns: 19.8, tryOns: 31200 },
  { category: "Outerwear", fitScore: 89, returns: 8.4, tryOns: 12800 },
  { category: "Accessories", fitScore: 97, returns: 2.1, tryOns: 6400 },
];

const radarData = [
  { metric: "Fit Accuracy", score: 96 },
  { metric: "User Adoption", score: 82 },
  { metric: "Return Reduction", score: 88 },
  { metric: "Conversion", score: 74 },
  { metric: "NPS Score", score: 91 },
  { metric: "Model Speed", score: 95 },
];

const bodyTypeDistrib = [
  { type: "Athletic", pct: 28 },
  { type: "Regular", pct: 36 },
  { type: "Slim", pct: 18 },
  { type: "Plus", pct: 12 },
  { type: "Petite", pct: 6 },
];

const regionData = [
  { region: "North America", users: 18200, returns: 7.2 },
  { region: "Europe", users: 14800, returns: 9.1 },
  { region: "Asia Pacific", users: 9600, returns: 11.4 },
  { region: "MENA", users: 3200, returns: 13.8 },
  { region: "LATAM", users: 2491, returns: 10.2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {typeof p.value === "number" && p.value > 999 ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [period, setPeriod] = useState<"7d" | "30d" | "6m" | "1y">("6m");
  const [metric, setMetric] = useState<"users" | "tryOns" | "returns" | "saves">("tryOns");
  const { formatLarge } = useSettings();

  const metricConfig = {
    users: { color: "#7c3aed", label: "Active Users" },
    tryOns: { color: "#3b82f6", label: "Try-On Sessions" },
    returns: { color: "#ef4444", label: "Returns Prevented" },
    saves: { color: "#22c55e", label: "Revenue Saved (K)" },
  };

  return (
    <div className="p-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Deep-dive into fit performance and business impact</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(["7d", "30d", "6m", "1y"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Try-On Sessions", value: "403K", change: "+22%", icon: Activity, up: true },
          { label: "Returns Prevented", value: "28.6K", change: "+31%", icon: RefreshCw, up: true },
          { label: "Revenue Impact", value: formatLarge(2_40_00_000), change: "+18%", icon: TrendingUp, up: true },
          { label: "Avg Return Rate", value: "9.8%", change: "-4.2%", icon: TrendingDown, up: false },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  kpi.up ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                }`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {kpi.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main chart */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Performance Trends</h3>
            <p className="text-xs text-muted-foreground mt-0.5">7-month view with daily granularity</p>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(Object.keys(metricConfig) as (keyof typeof metricConfig)[]).map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                  metric === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {metricConfig[m].label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricConfig[metric].color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={metricConfig[metric].color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={metricConfig[metric].color}
              strokeWidth={2.5}
              fill="url(#mainGrad)"
              name={metricConfig[metric].label}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Category performance */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Category Fit Performance</h3>
          <div className="space-y-3">
            {categoryPerformance.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{c.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${c.returns > 15 ? "text-red-500" : "text-muted-foreground"}`}>{c.returns}% ret.</span>
                    <span className={`text-xs font-bold ${c.fitScore >= 90 ? "text-green-600 dark:text-green-400" : c.fitScore >= 80 ? "text-amber-500" : "text-red-500"}`}>{c.fitScore}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${c.fitScore >= 90 ? "bg-green-500" : c.fitScore >= 80 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${c.fitScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Radar */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">ML Model Health</h3>
          <p className="text-xs text-muted-foreground mb-2">6 performance dimensions</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Regional breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Regional Breakdown</h3>
          <div className="space-y-3">
            {regionData.map((r, i) => (
              <div key={r.region} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                  <span className="text-xs font-medium text-foreground">{r.region}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{r.users.toLocaleString()} users</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    r.returns < 10 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {r.returns}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Body type distribution */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Body Type Distribution</p>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden">
              {["#7c3aed","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe"].map((color, i) => (
                <div key={i} style={{ width: `${bodyTypeDistrib[i].pct}%`, background: color }} title={`${bodyTypeDistrib[i].type}: ${bodyTypeDistrib[i].pct}%`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {bodyTypeDistrib.map((b, i) => (
                <div key={b.type} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm" style={{ background: ["#7c3aed","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe"][i] }} />
                  <span className="text-[10px] text-muted-foreground">{b.type} {b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
