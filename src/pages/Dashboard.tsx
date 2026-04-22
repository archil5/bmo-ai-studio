import { PageHeader } from "@/components/portal/PageHeader";
import {
  Boxes,
  BriefcaseBusiness,
  CheckCircle2,
  GitBranch,
  Library,
  ShieldCheck,
  Users,
} from "lucide-react";

const HEADLINE_METRICS = [
  {
    label: "Building blocks",
    value: "547",
    detail: "Across 8 domains; service catalog is already designed.",
    icon: Boxes,
    tone: "bg-info-soft text-primary",
  },
  {
    label: "Reference use cases",
    value: "153",
    detail: "Starter kits to adapt, not new discovery work to invent.",
    icon: Library,
    tone: "bg-success-soft text-success",
  },
  {
    label: "Solution patterns",
    value: "16",
    detail: "Patterns are the unit of validation and ownership.",
    icon: GitBranch,
    tone: "bg-warning-soft text-warning",
  },
  {
    label: "Sprint 1 coverage",
    value: "61%",
    detail: "First sprint validates the shared capabilities used by all cells.",
    icon: CheckCircle2,
    tone: "bg-info-soft text-primary",
  },
];

const WORKSTREAMS = [
  {
    name: "Enterprise Governance",
    window: "Months 1–4",
    owner: "Governance, privacy, legal, compliance",
    summary: "Clears service reviews, responsible AI policy, data readiness coordination, and CoE setup.",
  },
  {
    name: "Portal Operationalization",
    window: "Months 1–2",
    owner: "Portal operations team",
    summary: "Hardens the portal into the control plane for starter kits, scorecards, search, and policy-backed workflows.",
  },
  {
    name: "Pattern Validation Cells",
    window: "Months 3–12",
    owner: "4 cross-functional engineering cells",
    summary: "Validate all 16 patterns through sprint cycles with permanent pattern owners and no handoff model.",
  },
];

const MVP_PRIORITIES = [
  "Make validated patterns, dispositions, and scorecards the first thing leadership sees.",
  "Show horizontal capabilities as shared platform enablers required before pattern-specific scale-out.",
  "Position use cases as reference starter kits that will be adapted by business lines.",
  "Track governance readiness, cell execution, and portal hardening instead of generic app deployment activity.",
];

const HIGHLIGHTS = [
  { label: "Portal team", value: "4", note: "2 full-stack, 1 platform engineer, 1 UX/design" },
  { label: "Validation cells", value: "4", note: "4–5 people per cell with full delivery skills" },
  { label: "Total cell staffing", value: "16–20", note: "Dedicated for sprint duration" },
  { label: "Semantic index", value: "1,390", note: "Cross-asset discovery across all content types" },
];

function MetricCard({ label, value, detail, icon: Icon, tone }: any) {
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="mt-1.5 text-[28px] font-semibold tracking-tight font-mono">{value}</div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground max-w-[26ch]">{detail}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Director Vision Alignment"
        subtitle="This MVP should read as an enterprise AI control plane: validating patterns, operationalizing starter kits, enforcing governance, and coordinating 4 engineering cells — not as a generic app studio."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {HEADLINE_METRICS.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Parallel workstreams</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                The roadmap is three coordinated motions, not one monolithic delivery stream.
              </p>
            </div>
            <span className="pill bg-muted border-border text-foreground">Months 1–12</span>
          </div>
          <div className="divide-y divide-border">
            {WORKSTREAMS.map((item) => (
              <div key={item.name} className="grid gap-3 px-4 py-4 md:grid-cols-[170px_1fr]">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.window}</div>
                  <div className="mt-1 text-[13px] font-semibold text-foreground">{item.name}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{item.owner}</div>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground">{item.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-[14px] font-semibold">What this MVP must prove</h2>
          </div>
          <div className="space-y-2">
            {MVP_PRIORITIES.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded border border-border bg-muted/30 px-3 py-2.5">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                <p className="text-[12px] leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Why the previous direction felt sidelined</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                The roadmap centers on validation governance and starter-kit readiness.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Portal emphasis</th>
                  <th>What leadership expects</th>
                  <th>What this MVP now shows</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Deploying AI apps</td>
                  <td>Operationalizing reference patterns</td>
                  <td>Pattern validation pipeline and cell ownership</td>
                </tr>
                <tr>
                  <td>Interactive playground/testing</td>
                  <td>Governance scorecards and disposition tracking</td>
                  <td>Gate reviews, conditions, redesign paths</td>
                </tr>
                <tr>
                  <td>Standalone app metrics</td>
                  <td>Shared capabilities used across all patterns</td>
                  <td>Horizontal capability readiness and dependencies</td>
                </tr>
                <tr>
                  <td>Custom composition workflow</td>
                  <td>Starter-kit generation and adaptation model</td>
                  <td>Reference use cases mapped to permanent pattern owners</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.label.includes("Portal")
              ? BriefcaseBusiness
              : item.label.includes("cells")
                ? Users
                : item.label.includes("Semantic")
                  ? Library
                  : Boxes;

            return (
              <div key={item.label} className="panel p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{item.label}</div>
                <div className="mt-1 text-[26px] font-semibold font-mono tracking-tight">{item.value}</div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{item.note}</p>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
