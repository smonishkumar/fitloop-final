import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import AIChatbot from "@/components/AIChatbot";
import Dashboard from "@/pages/Dashboard";
import BodyIntelligence from "@/pages/BodyIntelligence";
import WardrobeIntelligence from "@/pages/WardrobeIntelligence";
import OutfitEngine from "@/pages/OutfitEngine";
import SmartShopping from "@/pages/SmartShopping";
import Analytics from "@/pages/Analytics";
import VirtualTryOn from "@/pages/VirtualTryOn";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/body" component={BodyIntelligence} />
        <Route path="/wardrobe" component={WardrobeIntelligence} />
        <Route path="/outfits" component={OutfitEngine} />
        <Route path="/shopping" component={SmartShopping} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/try-on" component={VirtualTryOn} />
        <Route path="/products" component={Products} />
        <Route path="/orders" component={Orders} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
            <AIChatbot />
          </WouterRouter>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
