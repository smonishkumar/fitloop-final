import { useState } from "react";
import {
  Search, Filter, ShoppingBag, Package, CheckCircle2,
  AlertCircle, Clock, XCircle, ChevronDown, ArrowUpRight,
  Truck, RefreshCw, Eye, MessageSquare, MoreHorizontal
} from "lucide-react";

const orders = [
  { id: "ORD-8821", customer: "Sarah Miller", email: "s.miller@email.com", product: "Floral Midi Dress", size: "M", fitScore: 97, fitIssue: null, status: "delivered", date: "Apr 3, 2026", amount: 89.99, returnRisk: "low" },
  { id: "ORD-8820", customer: "Alex Kim", email: "alex.k@email.com", product: "Slim Chino Trousers", size: "32W 30L", fitScore: 81, fitIssue: "Shoulder width borderline", status: "shipped", date: "Apr 3, 2026", amount: 49.99, returnRisk: "high" },
  { id: "ORD-8819", customer: "Priya Sharma", email: "priya.s@email.com", product: "Oversized Linen Shirt", size: "L", fitScore: 93, fitIssue: null, status: "processing", date: "Apr 2, 2026", amount: 39.99, returnRisk: "low" },
  { id: "ORD-8818", customer: "John Doe", email: "john.d@email.com", product: "Classic Denim Jacket", size: "M", fitScore: 88, fitIssue: "Slight arm length concern", status: "delivered", date: "Apr 2, 2026", amount: 129.99, returnRisk: "medium" },
  { id: "ORD-8817", customer: "Emma Liu", email: "emma.l@email.com", product: "Wrap Maxi Skirt", size: "S", fitScore: 94, fitIssue: null, status: "returned", date: "Apr 1, 2026", amount: 59.99, returnRisk: "low" },
  { id: "ORD-8816", customer: "Carlos Rivera", email: "c.rivera@email.com", product: "High-Waist Jeans", size: "28W 32L", fitScore: 76, fitIssue: "Hip measurement exceeds tolerance", status: "return-pending", date: "Apr 1, 2026", amount: 69.99, returnRisk: "high" },
  { id: "ORD-8815", customer: "Nina Okafor", email: "nina.o@email.com", product: "Blazer Cropped", size: "XS", fitScore: 95, fitIssue: null, status: "delivered", date: "Mar 31, 2026", amount: 149.99, returnRisk: "low" },
  { id: "ORD-8814", customer: "Jake Thompson", email: "j.thompson@email.com", product: "Turtleneck Sweater", size: "L", fitScore: 90, fitIssue: null, status: "processing", date: "Mar 31, 2026", amount: 79.99, returnRisk: "low" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  shipped: { label: "Shipped", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Truck },
  processing: { label: "Processing", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400", icon: Clock },
  returned: { label: "Returned", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  "return-pending": { label: "Return Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: AlertCircle },
};

const riskConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-green-600 dark:text-green-400" },
  medium: { label: "Medium", color: "text-amber-600 dark:text-amber-400" },
  high: { label: "High", color: "text-red-600 dark:text-red-400" },
};

const statuses = ["All", "Delivered", "Shipped", "Processing", "Returned", "Return Pending"];

export default function Orders() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeStatus === "All" ||
      o.status === activeStatus.toLowerCase().replace(" ", "-");
    return matchSearch && matchStatus;
  });

  const summaryStats = [
    { label: "Total Orders", value: orders.length.toString() },
    { label: "Delivered", value: orders.filter(o => o.status === "delivered").length.toString() },
    { label: "Returns", value: orders.filter(o => o.status === "returned" || o.status === "return-pending").length.toString() },
    { label: "High Risk", value: orders.filter(o => o.returnRisk === "high").length.toString() },
  ];

  return (
    <div className="p-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ML fit scores and return risk per order</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Orders
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {summaryStats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search" placeholder="Search orders, customers..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto">
          <Filter className="w-3.5 h-3.5" />
          Filters
        </button>
      </div>

      {/* Orders table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Fit Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Return Risk</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const risk = riskConfig[order.returnRisk];
              const isExpanded = expandedOrder === order.id;

              return (
                <>
                  <tr
                    key={order.id}
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono font-medium text-foreground">{order.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-foreground">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-foreground">{order.product}</p>
                      <p className="text-xs text-muted-foreground">Size: {order.size}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${order.fitScore >= 90 ? "bg-green-500" : order.fitScore >= 80 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${order.fitScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${order.fitScore >= 90 ? "text-green-600 dark:text-green-400" : order.fitScore >= 80 ? "text-amber-600" : "text-red-600"}`}>
                          {order.fitScore}
                        </span>
                      </div>
                      {order.fitIssue && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                          {order.fitIssue}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold ${risk.color}`}>{risk.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-foreground">${order.amount}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{order.date}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground" onClick={e => e.stopPropagation()}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground" onClick={e => e.stopPropagation()}>
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${order.id}-expanded`} className="bg-muted/20 border-b border-border">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Fit Analysis</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Fit Confidence</span><span className="text-xs font-medium text-foreground">{order.fitScore}%</span></div>
                              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Size Recommendation</span><span className="text-xs font-medium text-foreground">{order.size}</span></div>
                              <div className="flex justify-between"><span className="text-xs text-muted-foreground">ML Model Version</span><span className="text-xs font-medium text-foreground">v3.4</span></div>
                              {order.fitIssue && <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"><p className="text-xs text-amber-700 dark:text-amber-400">{order.fitIssue}</p></div>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Return Risk Assessment</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Risk Level</span><span className={`text-xs font-semibold ${riskConfig[order.returnRisk].color}`}>{riskConfig[order.returnRisk].label}</span></div>
                              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Category Avg Return</span><span className="text-xs font-medium text-foreground">8.2%</span></div>
                              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Try-On Completed</span><span className="text-xs font-medium text-green-600">Yes</span></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Actions</p>
                            <div className="flex flex-col gap-2">
                              <button className="w-full py-1.5 px-3 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors text-left">Send Fit Reminder</button>
                              <button className="w-full py-1.5 px-3 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors text-left">Initiate Exchange</button>
                              <button className="w-full py-1.5 px-3 text-xs font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">Process Return</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No orders found</p>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {orders.length} orders</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(n => (
              <button key={n} className={`w-7 h-7 text-xs rounded-md font-medium ${n === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{n}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
