import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortalLayout } from "@/components/portal/Layout";
import Dashboard from "./pages/Dashboard";
import UseCases from "./pages/UseCases";
import BuildingBlocks from "./pages/BuildingBlocks";
import CreateApp from "./pages/CreateApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route element={<PortalLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/use-cases" element={<UseCases />} />
            <Route path="/building-blocks" element={<BuildingBlocks />} />
            <Route path="/create" element={<CreateApp />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
