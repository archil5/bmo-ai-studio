import { PageHeader } from "@/components/portal/PageHeader";
import {
  Activity,
  BadgeDollarSign,
  Binary,
  LockKeyhole,
  Search,
  ShieldCheck,
} from "lucide-react";

const CAPABILITIES = [
  {
    name: "Observability",
    owner: "First cell to deploy",
    detail: "Tracing, runtime metrics, quality telemetry, and evidence capture across every validated pattern.",
    icon: Activity,
    tone: "bg-info-soft text-primary",
  },
  {
    name: "Cost governance",
    owner: "First cell to deploy",
    detail: "Budget, quota, token tracking, showback, and model-routing controls required for sustainable scale.",
    icon: BadgeDollarSign,
    tone: "bg-warning-soft text-warning",
  },
  {
    name: "Auth & access",
    owner: "Sprint 1 shared capability",
    detail: "Role-bound access, environment separation, and policy-aligned entitlement patterns for all starter kits.",
    icon: LockKeyhole,
    tone: "bg-muted text-foreground",
  },
  {
    name: "RAG foundation",
    owner: "Sprint 1 shared capability",
    detail: "Multi-tenant retrieval, embedding pipelines, and access policies needed by multiple pattern families.",
    icon: Search,
    tone: "bg-success-soft text-success",
  },
  {
    name: "Guardrails & governance",
    owner: "Cross-cutting",
    detail: "Security, responsible AI, compliance sign-off, and documented conditions for every disposition.",
    icon: ShieldCheck,
    tone: "bg-destructive-soft text-destructive",
  },
  {
    name: "Starter kit generation",
    owner: "Portal operations team",
    detail: "One-click scaffolding for architecture docs, IaC, design specs, and operational artifacts.",
    icon: Binary,
    tone: "bg-info-soft text-primary",
  },
];

const ASSET_COUNTS = [
  ["Building blocks", "547", "Across 8 domains"],
  ["Security baselines", "158", "AWS and Azure references"],
  ["Architectural principles", "199", "Across cloud, AI architecture, and AI applications"],
  ["MCP tools", "34", "Used to accelerate cell workflows"],
];

const DOMAINS = [
  "Foundation",
  "Governance",
  "Operations",
  "Prompt management",
  "Data & retrieval",
  "LLMOps",
  "AgentOps",
  "Evaluation / model customization",
];

export default function BuildingBlocks() {
  return (
    <>
      <PageHeader
        title="Shared Capabilities & Building Blocks"
        subtitle="The portal should not feel like a picker of arbitrary components; it should communicate which horizontal capabilities must be production-ready before cells can validate patterns at scale."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CAPABILITIES.map((capability) => {
          const Icon = capability.icon;
          return (
            <section key={capability.name} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{capability.owner}</div>
                  <h2 className="mt-1 text-[15px] font-semibold">{capability.name}</h2>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${capability.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{capability.detail}</p>
            </section>
          );
        })}
      </div>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-4">
          <h2 className="text-[14px] font-semibold">What already exists</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            The roadmap is explicit: the work is to productionize, validate, and operationalize existing assets — not to restart discovery.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ASSET_COUNTS.map(([label, value, note]) => (
              <div key={label} className="rounded border border-border bg-muted/20 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="mt-1 text-[26px] font-semibold font-mono tracking-tight">{value}</div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Domain coverage</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                These are the families leadership expects to be represented in the service catalog and validation workflow.
              </p>
            </div>
            <span className="pill bg-card border-border text-foreground">8 domains</span>
          </div>
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
            {DOMAINS.map((domain, index) => (
              <div key={domain} className="bg-card px-4 py-4">
                <div className="text-[10px] font-mono text-muted-foreground">0{index + 1}</div>
                <div className="mt-1 text-[13px] font-semibold text-foreground">{domain}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel mt-6 p-4 bg-info-soft/30 border-primary/30">
        <h2 className="text-[14px] font-semibold text-primary">What to emphasize in the demo</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {[
            "Horizontal capabilities are shared prerequisites, not optional nice-to-haves.",
            "Starter kits combine architecture docs, IaC, specs, and compliance evidence into a repeatable handoff-free package.",
            "The portal becomes the system of record for which capabilities are ready, reused, or still carrying conditional gaps.",
          ].map((item) => (
            <div key={item} className="rounded border border-primary/20 bg-background/70 px-3 py-3 text-[12px] leading-relaxed text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
