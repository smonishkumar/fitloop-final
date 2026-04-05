import { useState } from "react";
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, Cpu, RefreshCw,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Sparkles, Zap,
  CheckCircle2, AlertCircle, Clock, Package
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
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

const fitAccuracyData = [
  { day: "Mon", accuracy: 94.1 },
  { day: "Tue", accuracy: 95.3 },
  { day: "Wed", accuracy: 94.8 },
  { day: "Thu", accuracy: 96.1 },
  { day: "Fri", accuracy: 96.5 },
  { day: "Sat", accuracy: 95.9 },
  { day: "Sun", accuracy: 96.2 },
];

const fitDistribution = [
  { name: "Perfect Fit", value: 61, color: "#7c3aed" },
  { name: "Slight Adjust", value: 24, color: "#a78bfa" },
  { name: "Size Up", value: 9, color: "#ddd6fe" },
  { name: "Size Down", value: 6, color: "#ede9fe" },
];

const recentActivity = [
  { user: "Sarah M.", action: "Virtual try-on completed", product: "Floral Midi Dress", time: "2m ago", status: "fit" },
  { user: "Alex K.", action: "Size recommendation applied", product: "Slim Chino Trousers", time: "8m ago", status: "adjusted" },
  { user: "Priya S.", action: "Return prevented", product: "Oversized Linen Shirt", time: "15m ago", status: "saved" },
  { user: "John D.", action: "Fit report generated", product: "Classic Denim Jacket", time: "22m ago", status: "fit" },
  { user: "Emma L.", action: "Body scan uploaded", product: "—", time: "31m ago", status: "scan" },
];

const statusColors: Record<string, string> = {
  fit: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  adjusted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  saved: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  scan: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusLabels: Record<string, string> = {
  fit: "Perfect Fit",
  adjusted: "Adjusted",
  saved: "Return Saved",
  scan: "Scan",
};

const metricCards = [
  {
    label: "Fit Accuracy",
    value: "96.2%",
    delta: "+2.1%",
    trend: "up",
    sub: "vs last month",
    icon: Cpu,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    label: "Return Rate Reduction",
    value: "67%",
    delta: "+12%",
    trend: "up",
    sub: "vs industry avg",
    icon: RefreshCw,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    label: "Active Users",
    value: "48,291",
    delta: "+8.4%",
    trend: "up",
    sub: "this month",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    label: "Revenue Saved",
    value: "$2.4M",
    delta: "+$340K",
    trend: "up",
    sub: "from prevented returns",
    icon: ShoppingBag,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}{p.name === "accuracy" ? "%" : "%"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ML-powered fit intelligence overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map((p) => (
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
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  card.trend === "up"
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {card.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.delta}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{card.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Return reduction chart */}
        <div className="col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Return Rate vs Revenue Saved</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly comparison over 7 months</p>
            </div>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={2} fill="url(#returnGrad)" name="returns" dot={false} />
              <Area type="monotone" dataKey="savings" stroke="#7c3aed" strokeWidth={2} fill="url(#savingsGrad)" name="savings" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-red-500 rounded" />
              <span className="text-xs text-muted-foreground">Return Rate (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-violet-600 rounded" />
              <span className="text-xs text-muted-foreground">Revenue Saved (K)</span>
            </div>
          </div>
        </div>

        {/* Fit distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Fit Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">This month's sessions</p>
            </div>
          </div>
          <div className="flex justify-center">
            <PieChart width={150} height={150}>
              <Pie
                data={fitDistribution}
                cx={75}
                cy={75}
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {fitDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2 mt-3">
            {fitDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Fit accuracy bar chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Daily Fit Accuracy</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days — ML model performance</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={fitAccuracyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="accuracy" fill="#7c3aed" radius={[4, 4, 0, 0]} name="accuracy" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Live user interactions</p>
            </div>
            <button className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">
                    {item.user.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{item.user}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.action} {item.product !== "—" ? `· ${item.product}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML model status banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">FitLoop ML Engine v3.4 — Active</p>
            <p className="text-white/70 text-xs mt-0.5">Body measurement model trained on 2.8M data points · Last update: 2h ago</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-white font-bold text-lg">96.2%</p>
            <p className="text-white/60 text-xs">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">142ms</p>
            <p className="text-white/60 text-xs">Avg Response</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">99.9%</p>
            <p className="text-white/60 text-xs">Uptime</p>
          </div>
          <button className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-lg transition-colors border border-white/20">
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
}
