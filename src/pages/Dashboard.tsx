import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusPill } from "@/components/portal/PatternBadge";
import { RECENT_ACTIVITY, USE_CASES, TRACK_META, type Track } from "@/lib/mockData";
import {
  Activity, ShieldAlert, DollarSign, Server, ArrowUpRight,
  Workflow, Bot, FlaskConical, ArrowRight,
} from "lucide-react";
import { useApps } from "@/context/AppsContext";

const TRACK_ICON: Record<Track, any> = {
  llmops: Workflow,
  agentops: Bot,
  mlops: FlaskConical,
};

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
  const navigate = useNavigate();
  const totalApps = apps.length;

  const trackStats = (["llmops", "agentops", "mlops"] as Track[]).map((track) => ({
    track,
    count: apps.filter((a) => {
      const uc = USE_CASES.find((u) => u.id === a.useCaseId);
      return uc?.track === track;
    }).length,
    useCases: USE_CASES.filter((u) => u.track === track).length,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time view of LLMOps, AgentOps, and MLOps activity across all deployed BMO applications."
      />

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Deployed Apps" value={totalApps} delta="+2 this week"
          icon={Server} accent="bg-info-soft text-primary" />
        <MetricCard label="Total Invocations" value="6,147" delta="+18.2% vs 7d"
          icon={Activity} accent="bg-info-soft text-primary" />
        <MetricCard label="Guardrail Interventions" value="43" delta="+3 today"
          icon={ShieldAlert} accent="bg-destructive-soft text-destructive" />
        <MetricCard label="Total Token Cost" value="$78.18" delta="Under budget"
          icon={DollarSign} accent="bg-success-soft text-success" />
      </div>

      {/* Track breakdown cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {trackStats.map(({ track, count, useCases }) => {
          const meta = TRACK_META[track];
          const Icon = TRACK_ICON[track];
          return (
            <div
              key={track}
              className="panel p-4 cursor-pointer hover:shadow-sm transition-all"
              onClick={() => navigate("/use-cases")}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex items-center gap-2 text-[13px] font-semibold ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                  {meta.label}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[26px] font-bold font-mono text-foreground">{count}</div>
                  <div className="text-[11px] text-muted-foreground">active apps</div>
                </div>
                <div className="text-right">
                  <div className="text-[20px] font-semibold font-mono text-muted-foreground">{useCases}</div>
                  <div className="text-[11px] text-muted-foreground">use cases available</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground leading-snug">{meta.description}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity table */}
        <div className="lg:col-span-2 panel">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Recent Activity</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Last 8 invocations across all applications
              </p>
            </div>
            <span className="pill bg-success-soft border-success/30 text-success">live</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>App</th>
                  <th>Query</th>
                  <th className="text-right">Latency</th>
                  <th className="text-right">Tokens</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ACTIVITY.map((row, i) => (
                  <tr key={i}>
                    <td className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">{row.ts.split(" ")[1]}</td>
                    <td>
                      <div className="font-medium text-foreground text-[12px]">{row.app}</div>
                      <div className="text-[10px] text-muted-foreground">{row.team}</div>
                    </td>
                    <td className={`max-w-[260px] truncate text-[12px] ${row.status === "Blocked" ? "text-destructive font-medium" : ""}`}
                      title={row.query}>
                      {row.query}
                    </td>
                    <td className="text-right font-mono text-[12px]">{row.latencyMs.toLocaleString()}ms</td>
                    <td className="text-right font-mono text-[12px]">{row.tokens.toLocaleString()}</td>
                    <td><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Active apps */}
          <div className="panel">
            <div className="panel-header">
              <h2 className="text-[14px] font-semibold">Active Applications</h2>
              <span className="text-[11px] text-muted-foreground">{apps.length} total</span>
            </div>
            <div className="divide-y divide-border">
              {apps.slice(0, 5).map((app) => {
                const uc = USE_CASES.find((u) => u.id === app.useCaseId);
                const track = uc?.track;
                const meta = track ? TRACK_META[track] : null;
                return (
                  <div key={app.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <div className="font-mono text-[12px] font-medium">{app.name}</div>
                      <div className="text-[10px] text-muted-foreground">{app.team}</div>
                    </div>
                    <div className="text-right">
                      {meta && (
                        <div className={`text-[10px] font-semibold ${meta.color}`}>{meta.label}</div>
                      )}
                      <div className="text-[10px] text-muted-foreground">{app.blockIds.length} blocks</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Governance status */}
          <div className="panel p-4">
            <h3 className="text-[13px] font-semibold mb-3">Governance Status</h3>
            {[
              ["OSFI E-23 Compliance", true],
              ["AIP Enforcement", true],
              ["PII Detection", true],
              ["Injection Blocking", true],
              ["VPC PrivateLink", true],
              ["KMS CMK Encryption", true],
              ["Audit Logging", true],
            ].map(([label, ok]) => (
              <div key={label as string} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-[12px] text-muted-foreground">{label as string}</span>
                <span className="text-[11px] font-semibold text-success">✓ Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
