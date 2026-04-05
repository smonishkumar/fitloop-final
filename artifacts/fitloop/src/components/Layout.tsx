import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import {
  LayoutDashboard, Shirt, Package, BarChart3, ShoppingBag,
  Settings, Moon, Sun, Bell, Search, ChevronLeft, ChevronRight,
  Sparkles, LogOut, Brain, BookOpen, Wand2, ShoppingCart,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "AI Intelligence",
    items: [
      { path: "/body", icon: Brain, label: "Body Intelligence" },
      { path: "/wardrobe", icon: BookOpen, label: "Wardrobe" },
      { path: "/outfits", icon: Wand2, label: "Outfit Engine" },
      { path: "/shopping", icon: ShoppingCart, label: "Smart Shopping" },
    ],
  },
  {
    label: "Management",
    items: [
      { path: "/try-on", icon: Shirt, label: "Virtual Try-On" },
      { path: "/products", icon: Package, label: "Products" },
      { path: "/orders", icon: ShoppingBag, label: "Orders" },
      { path: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
];

const bottomItems = [{ path: "/settings", icon: Settings, label: "Settings" }];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ${
          collapsed ? "w-[64px]" : "w-[224px]"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border ${collapsed ? "justify-center px-0" : ""}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-white tracking-tight text-base">FITLOOP</span>
              <span className="block text-[9px] text-sidebar-foreground/40 tracking-widest uppercase font-medium -mt-0.5">AI Fit Engine</span>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/30 uppercase px-3 mb-1.5">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ path, icon: Icon, label }) => {
                  const active = isActive(path);
                  return (
                    <Link key={path} href={path}>
                      <div
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 group relative ${
                          active
                            ? "bg-sidebar-accent text-white"
                            : "text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-white"
                        } ${collapsed ? "justify-center px-0" : ""}`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-violet-400 rounded-r-full" />
                        )}
                        <Icon className={`flex-shrink-0 w-4 h-4 ${active ? "text-violet-400" : "text-sidebar-foreground/45 group-hover:text-white"}`} />
                        {!collapsed && (
                          <span className={`text-[13px] font-medium ${active ? "text-white" : ""}`}>{label}</span>
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-3 px-2 py-1 bg-sidebar-accent text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                            {label}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-2 space-y-0.5 border-t border-sidebar-border pt-2">
          {bottomItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link key={path} href={path}>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all group ${active ? "bg-sidebar-accent text-white" : "text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-white"} ${collapsed ? "justify-center px-0" : ""}`}>
                  <Icon className={`flex-shrink-0 w-4 h-4 ${active ? "text-violet-400" : "text-sidebar-foreground/45 group-hover:text-white"}`} />
                  {!collapsed && <span className="text-[13px] font-medium">{label}</span>}
                </div>
              </Link>
            );
          })}
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer group ${collapsed ? "justify-center px-0" : ""}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AD</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-sidebar-foreground truncate">Admin User</p>
                <p className="text-[10px] text-sidebar-foreground/35 truncate">admin@fitloop.ai</p>
              </div>
            )}
            {!collapsed && <LogOut className="w-3 h-3 text-sidebar-foreground/25 group-hover:text-red-400 transition-colors" />}
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[68px] w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground/60 hover:text-white z-10 transition-colors shadow-md"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-13 flex items-center justify-between px-5 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0" style={{ height: 52 }}>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search anything..."
              className="w-full h-8 pl-8 pr-4 rounded-lg bg-muted/60 border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 border border-background" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-76 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden" style={{ width: 300 }}>
                  <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold">Notifications</span>
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full">3 new</span>
                  </div>
                  {[
                    { title: "Fit accuracy improved", desc: "ML model updated — accuracy at 96.2%", time: "2m ago", dot: "bg-green-500" },
                    { title: "High return risk detected", desc: "SKU-2041 showing 24% returns", time: "18m ago", dot: "bg-red-500" },
                    { title: "Wardrobe scan complete", desc: "42 items detected, 3 duplicates found", time: "1h ago", dot: "bg-blue-500" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-2.5 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-foreground">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.desc}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center cursor-pointer shadow-sm">
              <span className="text-white text-[10px] font-bold">AD</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
