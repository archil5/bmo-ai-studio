import { PageHeader } from "@/components/portal/PageHeader";
import { CheckCircle2, Clock3, Flag, ShieldAlert, Users } from "lucide-react";

const PHASES = [
  {
    phase: "Phase A — Enterprise Governance",
    timing: "Months 1–4",
    owner: "Enterprise governance team",
    summary: "Service reviews, data readiness coordination, responsible AI policy ratification, and CoE establishment.",
  },
  {
    phase: "Phase B — Portal Operationalization",
    timing: "Months 1–2",
    owner: "Portal operations team",
    summary: "Make the portal the production control plane for starter kits, policy checks, semantic search, scorecards, and one-click generation.",
  },
  {
    phase: "Phase C — Pattern Validation",
    timing: "Months 3–12",
    owner: "4 engineering cells",
    summary: "Run 4 sprint cycles to validate all 16 patterns with permanent owners across architecture, data/AI engineering, DevOps, and security.",
  },
];

const PORTAL_OPERATIONS = [
  "Semantic index validation across 1,390 items",
  "Performance and load testing for concurrent users",
  "One-click starter kit generation for all 16 patterns",
  "CI/CD integration and scorecard publishing",
  "Workflow support for approved / conditional / redesign dispositions",
];

const CELL_CADENCE = [
  { week: "Week 1", focus: "Pull starter kit, validate prerequisites, confirm horizontal capability integration" },
  { week: "Week 2", focus: "Execute architecture, data, security, and operational checks" },
  { week: "Week 3", focus: "Run evaluation, document gaps, and validate production constraints" },
  { week: "Week 4", focus: "Leadership disposition: approved, approved with conditions, or redesign required" },
  { week: "Weeks 5–6", focus: "Close conditional gaps or complete redesign loop where needed" },
];

const DISPOSITIONS = [
  {
    label: "Approved",
    note: "Pattern is production-ready and can be published as a validated starter kit.",
    tone: "bg-success-soft border-success/30 text-success",
  },
  {
    label: "Approved with conditions",
    note: "Core architecture is valid, but specific gaps must be tracked in the portal scorecard with owners and deadlines.",
    tone: "bg-warning-soft border-warning/40 text-warning",
  },
  {
    label: "Redesign required",
    note: "Pattern returns with gap documentation and does not become a promoted starter kit until reworked.",
    tone: "bg-destructive-soft border-destructive/30 text-destructive",
  },
];

const MILESTONES = [
  ["M1", "Month 1", "Governance reviews and portal hardening begin in parallel"],
  ["M3", "Month 3", "Validation cells staffed and Sprint 1 starts"],
  ["M5", "Month 4", "All 6 horizontal capabilities built and validated at MVP level"],
  ["M8", "Month 8", "Multiple validated patterns available for adoption via the CoE model"],
  ["M12", "Month 12", "All 16 patterns validated and portal operating as the system of record"],
];

export default function CreateApp() {
  return (
    <>
      <PageHeader
        title="Validation Roadmap"
        subtitle="This local MVP should narrate the implementation sequence clearly: governance gates first, portal hardening next, and pattern validation cells running against shared capabilities with explicit dispositions."
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {PHASES.map((item) => (
          <div key={item.phase} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.timing}</div>
                <h2 className="mt-1 text-[15px] font-semibold">{item.phase}</h2>
                <div className="mt-1 text-[11px] text-primary">{item.owner}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-foreground">
                {item.phase.includes("Governance") ? <ShieldAlert className="h-4 w-4" /> : item.phase.includes("Portal") ? <Flag className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              </div>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{item.summary}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            <h2 className="text-[14px] font-semibold">Portal operationalization scope</h2>
          </div>
          <div className="space-y-2">
            {PORTAL_OPERATIONS.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded border border-border bg-muted/20 px-3 py-2.5">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                <p className="text-[12px] leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Per-pattern validation cadence</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">4–6 week cycle that ends with a leadership disposition.</p>
            </div>
            <span className="pill bg-card border-border text-foreground"><Clock3 className="h-3 w-3" /> 4–6 weeks</span>
          </div>
          <div className="divide-y divide-border">
            {CELL_CADENCE.map((item) => (
              <div key={item.week} className="grid gap-2 px-4 py-3 md:grid-cols-[110px_1fr]">
                <div className="text-[12px] font-semibold text-foreground">{item.week}</div>
                <p className="text-[12px] leading-relaxed text-muted-foreground">{item.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel p-4">
          <h2 className="text-[14px] font-semibold">Disposition model</h2>
          <div className="mt-3 space-y-3">
            {DISPOSITIONS.map((item) => (
              <div key={item.label} className={`rounded border px-3 py-3 ${item.tone}`}>
                <div className="text-[12px] font-semibold">{item.label}</div>
                <p className="mt-1 text-[11px] leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Key milestones</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Enough structure for an executive walkthrough without overselling unfinished implementation detail.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Timing</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {MILESTONES.map(([milestone, timing, signal]) => (
                  <tr key={milestone}>
                    <td className="font-mono font-medium text-foreground">{milestone}</td>
                    <td>{timing}</td>
                    <td>{signal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
