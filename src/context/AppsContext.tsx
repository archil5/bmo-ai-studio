import { createContext, useContext, useState, ReactNode } from "react";
import { DeployedApp, INITIAL_APPS } from "@/lib/mockData";

interface AppsContextValue {
  apps: DeployedApp[];
  addApp: (app: DeployedApp) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

const AppsContext = createContext<AppsContextValue | undefined>(undefined);

export function AppsProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<DeployedApp[]>(INITIAL_APPS);
  const [isAdmin, setIsAdmin] = useState(true); // Default to Admin for your demo

  const addApp = (app: DeployedApp) => setApps((prev) => [...prev, app]);

  return (
    <AppsContext.Provider value={{ apps, addApp, isAdmin, setIsAdmin }}>
      {children}
    </AppsContext.Provider>
  );
}

export function useApps() {
  const ctx = useContext(AppsContext);
  if (!ctx) throw new Error("useApps must be used within AppsProvider");
  return ctx;
}