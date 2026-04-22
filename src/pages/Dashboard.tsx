import { PageHeader } from "@/components/portal/PageHeader";
import {
  BUILDING_BLOCKS,
  INITIAL_APPS,
  REQUIRED_BLOCK_IDS,
  TRACK_META,
  USE_CASES,
  getUseCaseById,
  type Track,
} from "@/lib/mockData";
import {
  Blocks,
  BriefcaseBusiness,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const TRACKS: Track[] = ["llmops", "agentops", "mlops"];

function MetricCard({ label, value, detail, icon: Icon, tone }: any) {
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="mt-1.5 text-[28px] font-semibold tracking-tight font-mono">{value}</div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const categories = Array.from(new Set(BUILDING_BLOCKS.map((block) => block.category)));

  return (
    <>
      <PageHeader
        title="Platform Overview"
        subtitle="This portal is the technical implementation surface for the platform: reference use cases, governed building blocks, and workspace-ready starter kits aligned to the enterprise AI target architecture."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Building blocks"
          value={BUILDING_BLOCKS.length}
          detail={`${categories.length} implementation domains across foundation, governance, data, orchestration, evaluation, and runtime controls.`}
          icon={Blocks}
          tone="bg-info-soft text-primary"
        />
        <MetricCard
          label="Reference use cases"
          value={USE_CASES.length}
          detail="Pre-modeled technical starter kits with architecture flows, recommended compositions, and domain examples."
          icon={Layers3}
          tone="bg-success-soft text-success"
        />
        <MetricCard
          label="Workspaces"
          value={INITIAL_APPS.length}
          detail="Example implementation workspaces that bind a use case, runtime composition, team ownership, and governance profile."
          icon={BriefcaseBusiness}
          tone="bg-warning-soft text-warning"
        />
        <MetricCard
          label="Mandatory controls"
          value={REQUIRED_BLOCK_IDS.length}
          detail="Every workspace inherits core runtime, model access, guardrails, observability, and cost controls by default."
          icon={ShieldCheck}
          tone="bg-info-soft text-primary"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Platform tracks</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                The technical portal should organize implementation work by runtime pattern, not by project-management swimlane.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 px-4 pb-4 md:grid-cols-3">
            {TRACKS.map((track) => {
              const meta = TRACK_META[track];
              const count = USE_CASES.filter((useCase) => useCase.track === track).length;
              return (
                <div key={track} className="rounded border border-border bg-muted/20 p-4">
                  <div className={`text-[11px] font-semibold ${meta.color}`}>{meta.label}</div>
                  <div className="mt-2 text-[24px] font-semibold font-mono tracking-tight">{count}</div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-[14px] font-semibold">Portal purpose</h2>
          </div>
          <div className="space-y-2">
            {[
              "Expose reusable technical assets instead of project status abstractions.",
              "Show how each use case composes platform building blocks and governed services.",
              "Give engineers a workspace-oriented view of starter kits, ownership, and runtime posture.",
              "Keep governance visible as implementation constraints inside the technical flow, not as a separate PM layer.",
            ].map((item) => (
              <div key={item} className="rounded border border-border bg-muted/20 px-3 py-2.5 text-[12px] leading-relaxed text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Workspace snapshots</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Representative implementations that prove how the platform gets assembled in practice.
              </p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {INITIAL_APPS.map((workspace) => {
              const useCase = workspace.useCaseId ? getUseCaseById(workspace.useCaseId) : undefined;
              return (
                <div key={workspace.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">{workspace.name}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{workspace.team}</div>
                    <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                      {useCase?.name ?? "Custom workspace"} · {useCase?.tagline}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Guardrail profile</span>
                      <span className="pill bg-muted border-border text-foreground">{workspace.guardrailProfile}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Composition</span>
                      <span className="font-mono text-foreground">{workspace.blockIds.length} blocks</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Model</span>
                      <span className="text-foreground">{workspace.modelLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Implementation layers</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                The portal should make the technical stack legible from controls through runtime specialization.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>What lives here</th>
                  <th>Examples in portal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Controls</td>
                  <td>Always-on platform guardrails and enterprise constraints</td>
                  <td>MODEL, GUARDRAILS, OBSERVE, COST</td>
                </tr>
                <tr>
                  <td>Core runtime</td>
                  <td>Shared compute, config, orchestration, and service integration</td>
                  <td>CORE, PIPELINE, PROMPT HUB</td>
                </tr>
                <tr>
                  <td>Specialized capabilities</td>
                  <td>Retrieval, agent execution, evaluation, and training stacks</td>
                  <td>VECTORSTORE, AGENT TOOLS, EVAL ENGINE, FINE TUNER</td>
                </tr>
                <tr>
                  <td>Workspace assembly</td>
                  <td>Concrete compositions bound to teams and technical use cases</td>
                  <td>Retail RAG bot, compliance agent, fine-tuning workspace</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
