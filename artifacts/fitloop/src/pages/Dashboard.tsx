import { useState, useCallback } from "react";
import { Link } from "wouter";
import {
  TrendingUp, Users, Cpu, RefreshCw,
  ShoppingBag, Sparkles, Zap, CheckCircle2, AlertCircle,
  Brain, Shirt, BookOpen, Wand2, ShoppingCart, ArrowRight,
  MoreHorizontal
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Sector
} from "recharts";

const areaData = [
  { month: "Oct", returns: 18, savings: 12 },
  { month: "Nov", returns: 16, savings: 15 },
  { month: "Dec", returns: 20, savings: 14 },
  { month: "Jan", returns: 14, savings: 19 },
  { month: "Feb", returns: 11, savings: 23 },
  { month: "Mar", returns: 8, savings: 28 },
  { month: "Apr", returns: 6, savings: 34 },
];

const fitDist = [
  { name: "Perfect Fit", value: 61, color: "#7c3aed" },
  { name: "Slight Adjust", value: 24, color: "#a78bfa" },
  { name: "Size Up", value: 9, color: "#ddd6fe" },
  { name: "Size Down", value: 6, color: "#ede9fe" },
];

const accuracyData = [
  { day: "Mon", v: 94.1 }, { day: "Tue", v: 95.3 }, { day: "Wed", v: 94.8 },
  { day: "Thu", v: 96.1 }, { day: "Fri", v: 96.5 }, { day: "Sat", v: 95.9 }, { day: "Sun", v: 96.2 },
];

const recentActivity = [
  { user: "Sarah M.", action: "Virtual try-on completed", product: "Floral Midi Dress", time: "2m ago", status: "fit" },
  { user: "Alex K.", action: "Size recommendation applied", product: "Slim Chino Trousers", time: "8m ago", status: "adjusted" },
  { user: "Priya S.", action: "Return prevented", product: "Oversized Linen Shirt", time: "15m ago", status: "saved" },
  { user: "John D.", action: "Body scan uploaded", product: "—", time: "22m ago", status: "scan" },
  { user: "Emma L.", action: "Outfit saved", product: "Evening Look #3", time: "31m ago", status: "outfit" },
];

const statusColors: Record<string, string> = {
  fit: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  adjusted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  saved: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  scan: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  outfit: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};
const statusLabels: Record<string, string> = {
  fit: "Perfect Fit", adjusted: "Adjusted", saved: "Return Saved", scan: "Body Scan", outfit: "Outfit Saved",
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      {/* Center text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={fill} fontSize={18} fontWeight={700}>
        {(percent * 100).toFixed(0)}%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={9}>
        {payload.name}
      </text>
      {/* Expanded active slice */}
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      {/* Outer ring highlight */}
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 9} outerRadius={outerRadius + 11} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const aiSummaryCards = [
  { label: "Recommended Size", value: "M / 32W", sub: "Based on your body profile", icon: Shirt, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
  { label: "Body Type", value: "Athletic", sub: "Shoulder-dominant frame", icon: Brain, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { label: "Scan Confidence", value: "96.2%", sub: "High accuracy measurement", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
  { label: "Wardrobe Items", value: "42", sub: "3 duplicates detected", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { label: "Today's Outfits", value: "5", sub: "Occasion-matched suggestions", icon: Wand2, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20" },
  { label: "Duplicate Alerts", value: "3", sub: "Similar items found", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { label: "Shopping Readiness", value: "88 / 100", sub: "Profile nearly complete", icon: ShoppingCart, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
];

const quickLinks = [
  { path: "/body", icon: Brain, label: "Body Intelligence", desc: "Live scan & measurements", color: "from-blue-500 to-blue-700" },
  { path: "/wardrobe", icon: BookOpen, label: "Wardrobe", desc: "Scan & manage items", color: "from-amber-500 to-orange-600" },
  { path: "/outfits", icon: Wand2, label: "Outfit Engine", desc: "AI outfit suggestions", color: "from-pink-500 to-rose-600" },
  { path: "/shopping", icon: ShoppingCart, label: "Smart Shopping", desc: "Fit before you buy", color: "from-teal-500 to-green-600" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [activePieIndex, setActivePieIndex] = useState(0);
  const onPieEnter = useCallback((_: any, index: number) => setActivePieIndex(index), []);

  return (
    <div className="p-5 space-y-5 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">ML-powered fit intelligence overview · April 5, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{p}</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Sparkles className="w-3 h-3" />
            Generate Report
          </button>
        </div>
      </div>

      {/* ── A) AI SUMMARY SECTION ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-5 rounded-full bg-violet-500" />
          <h2 className="text-sm font-bold text-foreground">AI Summary</h2>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Live · Updated now</span>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {aiSummaryCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition-all cursor-pointer group">
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2.5`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-base font-bold text-foreground">{card.value}</p>
                <p className="text-[11px] font-medium text-foreground mt-0.5">{card.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{card.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Access to AI sections */}
      <div className="grid grid-cols-4 gap-3">
        {quickLinks.map(({ path, icon: Icon, label, desc, color }) => (
          <Link key={path} href={path}>
            <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${color} cursor-pointer hover:scale-[1.01] transition-transform`}>
              <Icon className="w-6 h-6 text-white mb-3 opacity-90" />
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className="text-white/70 text-[11px] mt-0.5">{desc}</p>
              <ArrowRight className="absolute right-3 bottom-3 w-4 h-4 text-white/60" />
            </div>
          </Link>
        ))}
      </div>

      {/* Core metric cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Fit Accuracy", value: "96.2%", delta: "+2.1%", icon: Cpu, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
          { label: "Return Rate Reduction", value: "67%", delta: "+12%", icon: RefreshCw, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Active Users", value: "48,291", delta: "+8.4%", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Revenue Saved", value: "₹2.4Cr", delta: "+₹28L", icon: ShoppingBag, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} style={{ width: 18, height: 18 }} />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  {card.delta}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Return vs savings */}
        <div className="col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Return Rate vs Revenue Saved</h3>
              <p className="text-xs text-muted-foreground mt-0.5">7-month comparison</p>
            </div>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={2} fill="url(#rg)" name="returns" dot={false} />
              <Area type="monotone" dataKey="savings" stroke="#7c3aed" strokeWidth={2} fill="url(#sg)" name="savings" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 rounded" /><span className="text-[11px] text-muted-foreground">Return Rate (%)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-600 rounded" /><span className="text-[11px] text-muted-foreground">Revenue Saved (K)</span></div>
          </div>
        </div>

        {/* Fit distribution */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">Fit Distribution</h3>
          <p className="text-xs text-muted-foreground mb-3">Click a slice or legend to explore</p>
          <div className="flex justify-center">
            <PieChart width={180} height={180}>
              <Pie
                data={fitDist}
                cx={90}
                cy={90}
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                activeIndex={activePieIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onClick={(_: any, index: number) => setActivePieIndex(index)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {fitDist.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    stroke="none"
                    opacity={activePieIndex === i ? 1 : 0.55}
                    style={{ transition: "opacity 0.2s" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-1.5 mt-1">
            {fitDist.map((item, i) => {
              const isActive = activePieIndex === i;
              return (
                <div
                  key={item.name}
                  onClick={() => setActivePieIndex(i)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all ${isActive ? "bg-accent" : "hover:bg-muted/50"}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-sm transition-transform ${isActive ? "scale-125" : ""}`}
                      style={{ background: item.color }}
                    />
                    <span className={`text-[11px] transition-colors ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {item.name}
                    </span>
                  </div>
                  <span
                    className={`text-[12px] font-bold transition-colors`}
                    style={{ color: isActive ? item.color : undefined }}
                  >
                    {item.value}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">Daily Fit Accuracy</h3>
          <p className="text-xs text-muted-foreground mb-3">Last 7 days</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={accuracyData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="v" fill="#7c3aed" radius={[3, 3, 0, 0]} name="accuracy" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            <button className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-2.5">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 cursor-pointer hover:bg-muted/40 -mx-2 px-2 py-1 rounded-lg transition-colors">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground">{item.user.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-foreground">{item.user}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>{statusLabels[item.status]}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{item.action}{item.product !== "—" ? ` · ${item.product}` : ""}</p>
                </div>
                <span className="text-[11px] text-muted-foreground flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML status banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">FitLoop ML Engine v3.4 — Active</p>
            <p className="text-white/65 text-xs mt-0.5">2.8M training points · Smart feedback loop enabled · Last update 2h ago</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          {[["96.2%", "Accuracy"], ["142ms", "Response"], ["99.9%", "Uptime"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-white font-bold text-base">{v}</p>
              <p className="text-white/55 text-[10px]">{l}</p>
            </div>
          ))}
          <button className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-lg transition-colors border border-white/20">View Logs</button>
        </div>
      </div>
    </div>
  );
}
