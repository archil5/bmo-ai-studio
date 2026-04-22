import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Boxes, Plus, Server, MessageSquare, ShieldCheck, Library, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApps } from "@/context/AppsContext";

// The menus for the two different personas
const DEV_NAV = [
  { section: "Workspace", items: [
    { to: "/use-cases", label: "Use Case Library", icon: Library },
    { to: "/create", label: "Generate App Scaffold", icon: Plus },
  ]},
  { section: "Validation", items: [
    { to: "/playground", label: "Guardrail Simulator", icon: MessageSquare },
  ]},
];

const ADMIN_NAV = [
  { section: "Platform Control", items: [
    { to: "/", label: "Fleet Observability", icon: Activity, end: true },
  ]},
  { section: "Governance", items: [
    { to: "/deployed", label: "Pattern Registry (OSFI)", icon: Server },
    { to: "/building-blocks", label: "Block Lifecycle", icon: Boxes },
  ]},
];

export function PortalSidebar() {
  const { isAdmin } = useApps();
  const activeNav = isAdmin ? ADMIN_NAV : DEV_NAV;

  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300">
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded bg-white text-navy font-bold flex items-center justify-center text-sm tracking-tight">
          BMO
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-white">AI Studio</div>
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/70">
            {isAdmin ? "Enterprise Control Plane" : "Developer Portal"}
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {activeNav.map((group) => (
          <div key={group.section} className="animate-fade-in">
            <div className="text-[9px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold px-3 mb-1">
              {group.section}
            </div>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
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
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white transition-colors ${isAdmin ? 'bg-destructive/80' : 'bg-primary'}`}>
            AP
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[12px] font-medium text-white truncate">Archil Patel</div>
            <div className="text-[10px] text-sidebar-foreground/70 truncate">
              {isAdmin ? "Platform Architect" : "Cloud Engineer"}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-sidebar-accent/50 border border-sidebar-border">
          <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/70">Environment</span>
          <span className="pill border-warning/40 bg-warning/15 text-warning font-mono text-[10px]">
            <ShieldCheck className="h-3 w-3" /> aws-lz-prod
          </span>
        </div>
      </div>
    </aside>
  );
}