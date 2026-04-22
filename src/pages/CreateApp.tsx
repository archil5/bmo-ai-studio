import { useMemo, useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import { ArchDiagram } from "@/components/portal/ArchDiagram";
import { INITIAL_APPS, getUseCaseById } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Activity, FolderKanban, ShieldCheck } from "lucide-react";

export default function CreateApp() {
  const [selectedId, setSelectedId] = useState(INITIAL_APPS[0]?.id ?? "");

  const selectedWorkspace = useMemo(
    () => INITIAL_APPS.find((workspace) => workspace.id === selectedId) ?? INITIAL_APPS[0],
    [selectedId]
  );

  const useCase = selectedWorkspace?.useCaseId ? getUseCaseById(selectedWorkspace.useCaseId) : undefined;

  return (
    <>
      <PageHeader
        title="Workspaces"
        subtitle="Workspace views bind technical use cases, governed building-block compositions, model posture, and team ownership into implementation-ready starter kits."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="space-y-4">
          {INITIAL_APPS.map((workspace) => {
            const workspaceUseCase = workspace.useCaseId ? getUseCaseById(workspace.useCaseId) : undefined;
            const isSelected = workspace.id === selectedWorkspace?.id;

            return (
              <button
                key={workspace.id}
                onClick={() => setSelectedId(workspace.id)}
                className={cn(
                  "panel w-full p-4 text-left transition-all border-2",
                  isSelected ? "border-primary bg-info-soft/20" : "border-transparent hover:border-border"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-semibold text-foreground">{workspace.name}</h2>
                    <div className="mt-1 text-[11px] text-muted-foreground">{workspace.team}</div>
                  </div>
                  <span className="pill bg-muted border-border text-foreground font-mono text-[10px]">
                    {workspace.blockIds.length} blocks
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <div className="text-muted-foreground">Use case</div>
                    <div className="mt-1 text-foreground">{workspaceUseCase?.name ?? "Custom"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Guardrail profile</div>
                    <div className="mt-1 text-foreground">{workspace.guardrailProfile}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Model</div>
                    <div className="mt-1 text-foreground">{workspace.modelLabel}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="mt-1 text-success">{workspace.status}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {selectedWorkspace && (
          <section className="space-y-4">
            <div className="panel p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Workspace architecture</div>
                  <h2 className="mt-1 text-[16px] font-semibold">{selectedWorkspace.name}</h2>
                  <p className="mt-1 text-[12px] text-muted-foreground">{useCase?.tagline}</p>
                </div>
                <span className="pill bg-info-soft border-primary/30 text-primary">{selectedWorkspace.team}</span>
              </div>
              {useCase ? (
                <ArchDiagram ucId={useCase.id} blockIds={selectedWorkspace.blockIds} />
              ) : (
                <div className="rounded border border-dashed border-border px-4 py-10 text-center text-[12px] text-muted-foreground">
                  No use-case architecture is attached to this workspace yet.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="panel p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  <h3 className="text-[13px] font-semibold">Composition</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWorkspace.blockIds.map((blockId) => (
                    <span key={blockId} className="pill bg-muted border-border text-foreground font-mono text-[10px]">
                      {blockId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="panel p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-[13px] font-semibold">Controls</h3>
                </div>
                <div className="space-y-2 text-[11px] text-muted-foreground">
                  <div>Guardrail profile: {selectedWorkspace.guardrailProfile}</div>
                  <div>Model access: {selectedWorkspace.modelLabel}</div>
                  <div>Use-case binding: {useCase?.id ?? "—"}</div>
                </div>
              </div>

              <div className="panel p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="text-[13px] font-semibold">Runtime signals</h3>
                </div>
                <div className="space-y-2 text-[11px] text-muted-foreground">
                  <div>Invocations: {selectedWorkspace.invocations.toLocaleString()}</div>
                  <div>Average latency: {selectedWorkspace.avgLatencyMs.toLocaleString()}ms</div>
                  <div>Total cost: ${selectedWorkspace.totalCost.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
