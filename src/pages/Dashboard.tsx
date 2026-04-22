import { PageHeader } from "@/components/portal/PageHeader";
import { useApps } from "@/context/AppsContext";
import { 
  ShieldAlert, Activity, DollarSign, Target, 
  CheckCircle2, AlertTriangle, Fingerprint, Lock
} from "lucide-react";

export default function Dashboard() {
  const { apps } = useApps();

  // Calculate Roadmap KPIs based on active apps
  const activeApps = apps.filter(a => a.status === "Active");
  const totalCost = activeApps.reduce((sum, app) => sum + app.totalCost, 0);
  
  // Verify 100% Observability & Cost Enforcement
  const compliantApps = activeApps.filter(a => 
    a.blockIds.includes("OBSERVE") && a.blockIds.includes("COST")
  );
  const complianceRate = activeApps.length > 0 
    ? Math.round((compliantApps.length / activeApps.length) * 100) 
    : 100;

  return (
    <>
      <PageHeader 
        title="Fleet Observability" 
        subtitle="Enterprise AI Platform Control Plane. Monitoring adoption, compliance, and showback across all LOBs." 
      />

      {/* KPI Row - Aligned with Director's Roadmap Goals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="panel p-4 flex flex-col gap-1">
          <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider flex items-center gap-2">
            <Target className="h-3.5 w-3.5" /> Pattern Adoption
          </div>
          <div className="text-2xl font-mono font-semibold mt-1">4 / 16</div>
          <div className="text-[11px] text-success flex items-center gap-1 mt-1">
            Sprint 1 On Track
          </div>
        </div>

        <div className="panel p-4 flex flex-col gap-1">
          <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Full Observability
          </div>
          <div className="text-2xl font-mono font-semibold mt-1">{complianceRate}%</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {compliantApps.length} of {activeApps.length} workloads emitting metrics
          </div>
        </div>

        <div className="panel p-4 flex flex-col gap-1">
          <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" /> Cost Attribution
          </div>
          <div className="text-2xl font-mono font-semibold mt-1">${totalCost.toFixed(2)}</div>
          <div className="text-[11px] text-success mt-1">
            100% Showback via AIPs
          </div>
        </div>

        <div className="panel p-4 flex flex-col gap-1 bg-navy text-white border-navy">
          <div className="text-white/70 text-[11px] font-medium uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5" /> Agent Safety
          </div>
          <div className="text-2xl font-mono font-semibold mt-1">0</div>
          <div className="text-[11px] text-white/70 mt-1">
            Critical Incidents in Prod
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Governance Posture */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-0 overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="text-[13px] font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> OSFI E-23 Governance Posture
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="font-medium p-3">Consuming App</th>
                    <th className="font-medium p-3">LOB Team</th>
                    <th className="font-medium p-3">Model Registry</th>
                    <th className="font-medium p-3">Guardrail Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {activeApps.map((app) => (
                    <tr key={app.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="p-3 font-mono font-medium text-primary">{app.name}</td>
                      <td className="p-3">{app.team}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1.5 text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-destructive-soft text-destructive border border-destructive/20">
                          {app.guardrailProfile}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activeApps.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No active deployments.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live Intercepts */}
        <div className="space-y-6">
          <div className="panel p-0 overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
              <h3 className="text-[13px] font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" /> Platform Guardrail Intercepts
              </h3>
              <span className="text-[10px] text-muted-foreground">Last 24h</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded bg-destructive-soft flex items-center justify-center shrink-0 mt-0.5">
                  <Fingerprint className="h-3.5 w-3.5 text-destructive" />
                </div>
                <div>
                  <div className="text-[12px] font-medium">PII Redaction Triggered</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-mono text-primary">compliance-agent</span> attempted to log unmasked SIN. Blocked by global policy.
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">12 mins ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded bg-warning-soft flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                </div>
                <div>
                  <div className="text-[12px] font-medium">Agent Token Budget Exceeded</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-mono text-primary">pcb-rag-bot</span> hit 10k token limit. ReAct loop forcefully terminated.
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">45 mins ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}