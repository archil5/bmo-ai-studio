import { Link } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import { useApps } from "@/context/AppsContext";
import { isAgentApp, isRagApp } from "@/lib/mockData";
import { 
  DollarSign, ShieldCheck, FileText, Terminal, 
  CheckCircle2, AlertTriangle, XCircle, Archive, ChevronDown 
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

function compositionLabel(blockIds: string[]) {
  if (blockIds.includes("AGENT_CORE")) return "PAT-AGENT-WFO";
  if (blockIds.includes("VECTORSTORE")) return "PAT-GENAI-RAG";
  if (blockIds.includes("PIPELINE")) return "PAT-GENAI-DOC";
  return "PAT-ML-RTS";
}

const DISPOSITIONS = {
  "Approved": { icon: CheckCircle2, color: "text-success", bg: "bg-success-soft border-success/30", text: "text-success" },
  "Approved with Conditions": { icon: AlertTriangle, color: "text-warning", bg: "bg-warning-soft border-warning/40", text: "text-warning" },
  "Redesign Required": { icon: XCircle, color: "text-destructive", bg: "bg-destructive-soft border-destructive/30", text: "text-destructive" },
  "Retired": { icon: Archive, color: "text-muted-foreground", bg: "bg-muted border-border", text: "text-muted-foreground" }
};

export default function DeployedApps() {
  const { apps } = useApps();
  
  // Local state to handle disposition changes (in a real app, this would patch the DB)
  const [dispositions, setDispositions] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <PageHeader
        title="Pattern Disposition & Fleet Management"
        subtitle="Architecture system of record. Every pattern must achieve 'Approved' disposition before final production handover."
        actions={
          <Link to="/create" className="px-4 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover">
            + Generate Starter Kit
          </Link>
        }
      />

      <div className="panel mt-6">
        <div className="panel-header flex justify-between items-center bg-muted/30 p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-semibold">{apps.length} Validated Patterns</h2>
            <span className="pill bg-success-soft border-success/30 text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> E-23 Baselines Enforced
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">Environment: AWS Enterprise Landing Zone</span>
        </div>
        
        <div className="overflow-x-auto pb-32"> {/* Padding for dropdowns */}
          <table className="data-table w-full text-left text-[13px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="p-3 font-medium">Consuming App</th>
                <th className="p-3 font-medium">Team</th>
                <th className="p-3 font-medium">Roadmap Pattern</th>
                <th className="p-3 font-medium">Model Binding</th>
                <th className="p-3 font-medium">Sprint Disposition</th>
                <th className="p-3 font-medium">Conditions / Gaps</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const pattern = compositionLabel(a.blockIds);
                const isAgent = isAgentApp(a);
                // Default to 'Approved with Conditions' as per Sprint 1 expectations
                const currentDisp = dispositions[a.id] || "Approved with Conditions";
                const dispConfig = DISPOSITIONS[currentDisp as keyof typeof DISPOSITIONS];
                const DispIcon = dispConfig.icon;

                return (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-mono font-semibold text-foreground">{a.name}</td>
                    <td className="p-3 text-muted-foreground">{a.team}</td>
                    <td className="p-3">
                      <span className={`pill font-mono text-[10px] ${isAgent ? "bg-[hsl(var(--pattern-p5)/0.1)] border-pattern-p5/30 text-pattern-p5" : isRagApp(a) ? "bg-info-soft border-primary/30 text-primary" : "bg-muted border-border text-foreground"}`}>
                        {pattern}
                      </span>
                    </td>
                    <td className="p-3 text-[12px]">{a.modelLabel}</td>
                    
                    {/* Interactive Disposition Dropdown */}
                    <td className="p-3 relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === a.id ? null : a.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-medium cursor-pointer transition-opacity hover:opacity-80 ${dispConfig.bg} ${dispConfig.text}`}
                      >
                        <DispIcon className="h-3.5 w-3.5" />
                        {currentDisp}
                        <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                      </button>

                      {openDropdown === a.id && (
                        <div className="absolute top-[80%] left-3 mt-1 w-56 bg-white border border-border shadow-xl rounded-md z-50 py-1.5">
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 mb-1">
                            Update Phase C Status
                          </div>
                          {Object.keys(DISPOSITIONS).map((dKey) => {
                            const DIcon = DISPOSITIONS[dKey as keyof typeof DISPOSITIONS].icon;
                            return (
                              <button
                                key={dKey}
                                onClick={() => {
                                  setDispositions({ ...dispositions, [a.id]: dKey });
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-3 py-2 text-[12px] font-medium flex items-center gap-2 hover:bg-muted transition-colors"
                              >
                                <DIcon className={`h-4 w-4 ${DISPOSITIONS[dKey as keyof typeof DISPOSITIONS].color}`} />
                                {dKey}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Dynamic Conditions Logic */}
                    <td className="p-3 text-[11px]">
                      {currentDisp === "Approved with Conditions" ? (
                        <span className="text-warning flex items-start gap-1.5 max-w-[180px] leading-tight">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> 
                          Pending ops runbook integration & deep validation tool run.
                        </span>
                      ) : currentDisp === "Redesign Required" ? (
                        <span className="text-destructive flex items-start gap-1.5 max-w-[180px] leading-tight">
                          <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> 
                          Missing mandatory horizontal integration (AuthZ).
                        </span>
                      ) : currentDisp === "Approved" ? (
                        <span className="text-success font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready for LOB handover
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Enterprise Actions */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-2 py-1 rounded bg-card border border-border text-[11px] font-medium text-foreground hover:bg-muted" title="Architecture Decision Record">
                          <FileText className="h-3 w-3" /> ADR
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 rounded bg-card border border-border text-[11px] font-medium text-foreground hover:bg-muted" title="View Generated CDK">
                          <Terminal className="h-3 w-3" /> IaC
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 rounded bg-card border border-border text-[11px] font-medium text-foreground hover:bg-muted" title="FinOps Showback">
                          <DollarSign className="h-3 w-3" /> Showback
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {apps.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground border-b-0">
                    <div className="flex flex-col items-center gap-2">
                      <Archive className="h-8 w-8 opacity-20" />
                      <p>No sprint patterns have been generated yet.</p>
                      <Link to="/create" className="text-primary font-medium hover:underline mt-2">
                        Generate Starter Kit
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}