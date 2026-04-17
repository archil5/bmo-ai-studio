import { NavLink } from "react-router-dom";
import { LayoutDashboard, Boxes, Plus, Server, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/building-blocks", label: "Building Blocks", icon: Boxes },
  { to: "/create", label: "Create App", icon: Plus },
  { to: "/deployed", label: "Deployed Apps", icon: Server },
  { to: "/playground", label: "Playground", icon: MessageSquare },
];

export function PortalSidebar() {
  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded bg-white text-navy font-bold flex items-center justify-center text-sm tracking-tight">
          BMO
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-white">AI Developer Portal</div>
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/70">LLMOps · AgentOps</div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-white"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-[11px] font-semibold text-white">
            JM
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[12px] font-medium text-white truncate">J. Morrison</div>
            <div className="text-[10px] text-sidebar-foreground/70 truncate">Principal Cloud Engineer</div>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-sidebar-accent/50 border border-sidebar-border">
          <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/70">Environment</span>
          <span className="pill border-warning/40 bg-warning/15 text-warning font-mono text-[10px]">
            <ShieldCheck className="h-3 w-3" /> dev
          </span>
        </div>
      </div>
    </aside>
  );
}
