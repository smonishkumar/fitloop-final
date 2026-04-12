import { Link } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-8xl font-black text-muted/50">404</p>
        <h1 className="text-2xl font-bold text-foreground mt-4">Page not found</h1>
        <p className="text-sm text-muted-foreground mt-2">This page doesn't exist in the FITLOOP dashboard.</p>
        <Link href="/">
          <button className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mx-auto">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
