import { ShieldCheck, User, Settings } from "lucide-react";
import { useApps } from "@/context/AppsContext";

export function TopBar() {
  const { isAdmin, setIsAdmin } = useApps();

  return (
    <header className="bg-white shadow-sm border-b border-sidebar-border z-10 h-[52px] shrink-0 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="font-medium text-sidebar-foreground text-[14px]">Platform Operations</div>
        
        {/* Persona Toggle tied to Global State */}
        <div className="flex items-center bg-muted rounded-md p-0.5 border border-border">
          <button 
            onClick={() => setIsAdmin(false)}
            className={`flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded-sm transition-all ${!isAdmin ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <User className="h-3 w-3" /> Dev Workspace
          </button>
          <button 
            onClick={() => setIsAdmin(true)}
            className={`flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded-sm transition-all ${isAdmin ? 'bg-navy text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Settings className="h-3 w-3" /> Platform Admin
          </button>
        </div>
      </div>

      <div className="flex items-center text-[11px] font-medium text-success bg-success-soft px-2.5 py-1 rounded border border-success/20">
        <span className="h-1.5 w-1.5 bg-success rounded-full mr-2 animate-pulse"></span>
        All Systems Operational
      </div>
    </header>
  );
}