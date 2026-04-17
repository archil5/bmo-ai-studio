import { PageHeader } from "@/components/portal/PageHeader";
import { StatusPill } from "@/components/portal/PatternBadge";
import { RECENT_ACTIVITY } from "@/lib/mockData";
import { Activity, ShieldAlert, DollarSign, Server, ArrowUpRight, Download } from "lucide-react";
import { useApps } from "@/context/AppsContext";

function MetricCard({ label, value, delta, icon: Icon, accent }: any) {
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="text-[26px] font-semibold mt-1.5 tracking-tight font-mono">{value}</div>
          {delta && (
            <div className="text-[11px] text-success mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> {delta}
            </div>
          )}
        </div>
        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { apps } = useApps();
  const totalApps = apps.length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time view of LLMOps and AgentOps activity across all deployed BMO applications."
        actions={
          <button className="pill border-border bg-card hover:bg-muted text-foreground px-3 py-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Deployed Apps" value={totalApps} delta="+1 this week" icon={Server} accent="bg-info-soft text-primary" />
        <MetricCard label="Total Invocations" value="1,247" delta="+12.4% vs 7d" icon={Activity} accent="bg-info-soft text-primary" />
        <MetricCard label="Guardrail Interventions" value="43" delta="+3 today" icon={ShieldAlert} accent="bg-destructive-soft text-destructive" />
        <MetricCard label="Total Token Cost" value="$18.42" delta="Under budget" icon={DollarSign} accent="bg-success-soft text-success" />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="text-[14px] font-semibold">Recent Activity</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Last 6 invocations across all applications · auto-refreshing every 5s</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="kbd">us-east-1</span>
            <span className="pill bg-success-soft border-success/30 text-success">live</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>App Name</th>
                <th>Team</th>
                <th>Query</th>
                <th>Composition</th>
                <th className="text-right">Latency</th>
                <th className="text-right">Tokens</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIVITY.map((row, i) => (
                <tr key={i}>
                  <td className="font-mono text-[12px] text-muted-foreground whitespace-nowrap">{row.ts}</td>
                  <td className="font-medium text-foreground">{row.app}</td>
                  <td className="text-muted-foreground">{row.team}</td>
                  <td className={`max-w-[320px] truncate ${row.status === "Blocked" ? "text-destructive font-medium" : ""}`} title={row.query}>
                    {row.query}
                  </td>
                  <td><span className="pill bg-muted border-border text-foreground font-mono text-[10px]">{row.composition}</span></td>
                  <td className="text-right font-mono text-[12px]">{row.latencyMs.toLocaleString()}ms</td>
                  <td className="text-right font-mono text-[12px]">{row.tokens.toLocaleString()}</td>
                  <td><StatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
