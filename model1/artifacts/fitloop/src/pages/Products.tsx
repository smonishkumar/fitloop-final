import { useState } from "react";
import {
  Search, Filter, Plus, MoreHorizontal, ChevronUp, ChevronDown,
  Package, TrendingDown, TrendingUp, CheckCircle2, AlertCircle,
  Star, Edit2, Trash2, Eye
} from "lucide-react";

const statuses = ["All", "Active", "High Returns", "Low Stock", "Pending"];
const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Accessories"];

const products = [
  { id: 1, name: "Floral Midi Dress", brand: "Zara", category: "Dresses", sku: "ZAR-2041", price: 89.99, stock: 234, fitScore: 97, returnRate: 4.2, status: "active", rating: 4.8, tryOns: 1420 },
  { id: 2, name: "Slim Chino Trousers", brand: "H&M", category: "Bottoms", sku: "HM-3820", price: 49.99, stock: 89, fitScore: 81, returnRate: 18.7, status: "high-returns", rating: 4.1, tryOns: 820 },
  { id: 3, name: "Oversized Linen Shirt", brand: "Uniqlo", category: "Tops", sku: "UNQ-0912", price: 39.99, stock: 12, fitScore: 93, returnRate: 6.1, status: "low-stock", rating: 4.6, tryOns: 640 },
  { id: 4, name: "Classic Denim Jacket", brand: "Levi's", category: "Outerwear", sku: "LVS-4451", price: 129.99, stock: 178, fitScore: 88, returnRate: 9.4, status: "active", rating: 4.7, tryOns: 2100 },
  { id: 5, name: "Wrap Maxi Skirt", brand: "Mango", category: "Bottoms", sku: "MNG-7720", price: 59.99, stock: 67, fitScore: 94, returnRate: 5.0, status: "active", rating: 4.5, tryOns: 930 },
  { id: 6, name: "Turtleneck Sweater", brand: "COS", category: "Tops", sku: "COS-1102", price: 79.99, stock: 0, fitScore: 90, returnRate: 7.8, status: "pending", rating: 4.4, tryOns: 0 },
  { id: 7, name: "High-Waist Jeans", brand: "Topshop", category: "Bottoms", sku: "TOP-9981", price: 69.99, stock: 205, fitScore: 76, returnRate: 22.3, status: "high-returns", rating: 3.9, tryOns: 3240 },
  { id: 8, name: "Blazer Cropped", brand: "& Other Stories", category: "Outerwear", sku: "AOS-0032", price: 149.99, stock: 43, fitScore: 95, returnRate: 4.8, status: "active", rating: 4.9, tryOns: 1180 },
];

const statusBadge: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  "high-returns": { label: "High Returns", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  "low-stock": { label: "Low Stock", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
};

export default function Products() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "fitScore" | "returnRate" | "price">("fitScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      const matchStatus = activeStatus === "All" || (activeStatus === "High Returns" && p.status === "high-returns") || (activeStatus === "Low Stock" && p.status === "low-stock") || (activeStatus === "Active" && p.status === "active") || (activeStatus === "Pending" && p.status === "pending");
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      return matchSearch && matchStatus && matchCat;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return dir * a.name.localeCompare(b.name);
      return dir * (a[sortBy] - b[sortBy]);
    });

  return (
    <div className="p-6 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} total products · ML fit data applied</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          Add Product
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Avg Fit Score", value: "90.5", icon: CheckCircle2, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
          { label: "Avg Return Rate", value: "9.8%", icon: TrendingDown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "Total Try-Ons", value: "10.3K", icon: Eye, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "High Risk Items", value: "2", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search" placeholder="Search products, SKU, brand..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1">
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

        <select
          value={activeCategory}
          onChange={e => setActiveCategory(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>

        <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto">
          <Filter className="w-3.5 h-3.5" />
          More filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3">
                <input type="checkbox" className="rounded accent-violet-600" />
              </th>
              <th className="text-left px-4 py-3">
                <button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                  Product
                  {sortBy === "name" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3">
                <button onClick={() => toggleSort("fitScore")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                  Fit Score
                  {sortBy === "fitScore" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button onClick={() => toggleSort("returnRate")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                  Return Rate
                  {sortBy === "returnRate" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Try-Ons</th>
              <th className="text-left px-4 py-3">
                <button onClick={() => toggleSort("price")} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                  Price
                  {sortBy === "price" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const badge = statusBadge[p.status];
              return (
                <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-4 py-3.5">
                    <input type="checkbox" className="rounded accent-violet-600" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.brand} · {p.sku}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[60px] h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.fitScore >= 90 ? "bg-green-500" : p.fitScore >= 80 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${p.fitScore}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${p.fitScore >= 90 ? "text-green-600 dark:text-green-400" : p.fitScore >= 80 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                        {p.fitScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {p.returnRate > 15 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                      )}
                      <span className={`text-xs font-semibold ${p.returnRate > 15 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                        {p.returnRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{p.tryOns.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-xs font-medium text-foreground">${p.price}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium ${p.stock === 0 ? "text-red-500" : p.stock < 20 ? "text-amber-500" : "text-foreground"}`}>
                      {p.stock === 0 ? "Out" : p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-foreground">{p.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {products.length} products</p>
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
