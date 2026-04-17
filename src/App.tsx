import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppsProvider } from "@/context/AppsContext";
import { PortalLayout } from "@/components/portal/Layout";
import Dashboard from "./pages/Dashboard";
import BuildingBlocks from "./pages/BuildingBlocks";
import Patterns from "./pages/Patterns";
import CreateApp from "./pages/CreateApp";
import DeployedApps from "./pages/DeployedApps";
import Playground from "./pages/Playground";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PortalLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/building-blocks" element={<BuildingBlocks />} />
              <Route path="/patterns" element={<Patterns />} />
              <Route path="/create" element={<CreateApp />} />
              <Route path="/deployed" element={<DeployedApps />} />
              <Route path="/playground" element={<Playground />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
