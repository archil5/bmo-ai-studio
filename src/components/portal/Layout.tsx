import { Outlet } from "react-router-dom";
import { PortalSidebar } from "./Sidebar";
import  { TopBar }  from "./TopBar";

export function PortalLayout() {
  return (
    <div className="flex h-screen w-full bg-background">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-[1500px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
