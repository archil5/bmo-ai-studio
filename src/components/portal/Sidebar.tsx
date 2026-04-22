import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Boxes, Flag, ShieldCheck, Library,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { section: "Overview", items: [
    { to: "/", label: "Vision Alignment", icon: LayoutDashboard, end: true },
  ]},
  { section: "Roadmap", items: [
    { to: "/use-cases", label: "Reference Use Cases", icon: Library },
    { to: "/building-blocks", label: "Shared Capabilities", icon: Boxes },
    { to: "/create", label: "Validation Roadmap", icon: Flag },
  ]},
];

export function PortalSidebar() {
  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded bg-white text-navy font-bold flex items-center justify-center text-sm tracking-tight">
          AI
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-white">Enterprise AI Portal</div>
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/70">
            Patterns · Governance · Validation
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.section}>
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
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-[11px] font-semibold text-white">
            EA
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[12px] font-medium text-white truncate">Program Sponsor View</div>
            <div className="text-[10px] text-sidebar-foreground/70 truncate">Local MVP narrative</div>
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
