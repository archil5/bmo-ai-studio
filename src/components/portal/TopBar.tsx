import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Bell, HelpCircle } from "lucide-react";

const TITLES: Record<string, string> = {
  "": "Dashboard",
  "building-blocks": "Building Blocks",
  "patterns": "Patterns",
  "create": "Create App",
  "deployed": "Deployed Apps",
  "playground": "Playground",
};

export function TopBar() {
  const { pathname } = useLocation();
  const seg = pathname.replace(/^\//, "").split("/")[0];
  const title = TITLES[seg] ?? "Dashboard";

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-5 shrink-0">
      <nav className="flex items-center gap-1.5 text-[13px]">
        <Link to="/" className="text-muted-foreground hover:text-foreground">Platform</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link to="/" className="text-muted-foreground hover:text-foreground">AI Developer Portal</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="font-semibold text-foreground">{title}</span>
      </nav>

      <div className="flex items-center gap-3">
        <span className="pill bg-success-soft border-success/30 text-success">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-pulse-dot" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
          </span>
          All Systems Operational
        </span>
        <span className="text-[11px] text-muted-foreground font-mono">us-east-1</span>
        <button className="text-muted-foreground hover:text-foreground"><HelpCircle className="h-4 w-4" /></button>
        <button className="text-muted-foreground hover:text-foreground"><Bell className="h-4 w-4" /></button>
      </div>
    </header>
  );
}