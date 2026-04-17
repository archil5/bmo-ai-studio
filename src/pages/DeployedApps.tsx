import { Link } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusPill } from "@/components/portal/PatternBadge";
import { useApps } from "@/context/AppsContext";
import { isAgentApp, isRagApp } from "@/lib/mockData";
import { Activity, DollarSign, FlaskConical, ShieldCheck } from "lucide-react";

function compositionLabel(blockIds: string[]) {
  if (blockIds.includes("AGENT_CORE")) return "Agent";
  if (blockIds.includes("VECTORSTORE")) return "RAG";
  if (blockIds.includes("PIPELINE")) return "Pipeline";
  return "Inference";
}

export default function DeployedApps() {
  const { apps } = useApps();

  return (
    <>
      <PageHeader
        title="Deployed Applications"
        subtitle="All applications are governed — guardrails, tracing, and cost attribution are mandatory and cannot be disabled."
        actions={
          <Link to="/create" className="px-4 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover">
            + Deploy New App
          </Link>
        }
      />

      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold">{apps.length} applications</h2>
            <span className="pill bg-success-soft border-success/30 text-success">
              <ShieldCheck className="h-3 w-3" /> All governed
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">region: us-east-1 · acct: 419223***</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>App Name</th>
                <th>Team</th>
                <th>Composition</th>
                <th className="text-right">Blocks</th>
                <th>Model</th>
                <th>Guardrail</th>
                <th>Status</th>
                <th className="text-right">Invocations</th>
                <th className="text-right">Avg Latency</th>
                <th className="text-right">Total Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const label = compositionLabel(a.blockIds);
                const isAgent = isAgentApp(a);
                return (
                  <tr key={a.id}>
                    <td className="font-mono font-medium text-foreground">{a.name}</td>
                    <td className="text-muted-foreground">{a.team}</td>
                    <td>
                      <span className={`pill font-mono text-[10px] ${isAgent ? "bg-[hsl(var(--pattern-p5)/0.1)] border-pattern-p5/30 text-pattern-p5" : isRagApp(a) ? "bg-info-soft border-primary/30 text-primary" : "bg-muted border-border text-foreground"}`}>
                        {label}
                      </span>
                    </td>
                    <td className="text-right font-mono text-[12px]" title={a.blockIds.join(", ")}>
                      {a.blockIds.length}
                    </td>
                    <td className="text-[12px]">{a.modelLabel}</td>
                    <td>
                      <span className="pill bg-muted border-border text-foreground">{a.guardrailProfile}</span>
                    </td>
                    <td><StatusPill status={a.status} /></td>
                    <td className="text-right font-mono text-[12px]">{a.invocations.toLocaleString()}</td>
                    <td className="text-right font-mono text-[12px]">{a.avgLatencyMs.toLocaleString()}ms</td>
                    <td className="text-right font-mono text-[12px] font-semibold">${a.totalCost.toFixed(2)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link to={`/playground?app=${a.id}`} className="pill bg-card border-border hover:bg-muted text-foreground">
                          <FlaskConical className="h-3 w-3" /> Test
                        </Link>
                        <button className="pill bg-card border-border hover:bg-muted text-foreground">
                          <Activity className="h-3 w-3" /> Traces
                        </button>
                        <button className="pill bg-card border-border hover:bg-muted text-foreground">
                          <DollarSign className="h-3 w-3" /> Costs
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
