import { useMemo, useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import { ArchDiagram } from "@/components/portal/ArchDiagram";
import {
  COMPLEXITY_COLOR,
  TRACK_META,
  USE_CASES,
  expandWithDependencies,
  type Track,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const TRACKS: (Track | "all")[] = ["all", "llmops", "agentops", "mlops"];

export default function UseCases() {
  const [activeTrack, setActiveTrack] = useState<Track | "all">("all");
  const [selectedId, setSelectedId] = useState<string>(USE_CASES[0]?.id ?? "");

  const visible = activeTrack === "all"
    ? USE_CASES
    : USE_CASES.filter((useCase) => useCase.track === activeTrack);

  const selectedUseCase = useMemo(
    () => visible.find((useCase) => useCase.id === selectedId) ?? visible[0] ?? USE_CASES[0],
    [selectedId, visible]
  );

  const activeBlocks = selectedUseCase ? expandWithDependencies(selectedUseCase.recommendedBlocks) : [];

  return (
    <>
      <PageHeader
        title="Reference Use Cases"
        subtitle="Each use case is a technical starter kit: a target runtime flow, recommended building-block composition, and domain-specific examples that teams can implement inside governed workspaces."
      />

      <div className="mb-6 flex items-center gap-2 overflow-auto pb-1">
        {TRACKS.map((track) => {
          const count = track === "all" ? USE_CASES.length : USE_CASES.filter((useCase) => useCase.track === track).length;
          return (
            <button
              key={track}
              onClick={() => setActiveTrack(track)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all",
                activeTrack === track
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:bg-muted"
              )}
            >
              {track === "all" ? "All tracks" : TRACK_META[track].label}
              <span className="ml-1.5 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          {visible.map((useCase) => {
            const meta = TRACK_META[useCase.track];
            const expanded = expandWithDependencies(useCase.recommendedBlocks);
            const isSelected = selectedUseCase?.id === useCase.id;

            return (
              <button
                key={useCase.id}
                onClick={() => setSelectedId(useCase.id)}
                className={cn(
                  "panel w-full p-5 text-left transition-all border-2",
                  isSelected ? "border-primary bg-info-soft/20" : "border-transparent hover:border-border"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", meta.color)}>
                      {meta.label}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">{useCase.id}</div>
                    <h2 className="mt-1 text-[16px] font-semibold text-foreground">{useCase.name}</h2>
                    <p className="mt-1 text-[12px] text-muted-foreground">{useCase.tagline}</p>
                  </div>
                  <span className={cn("pill text-[10px] shrink-0", COMPLEXITY_COLOR[useCase.complexity])}>
                    {useCase.complexity}
                  </span>
                </div>

                <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">{useCase.description}</p>

                <div className="mt-4 flex items-center justify-between rounded border border-border bg-muted/20 px-3 py-2.5">
                  <div className="text-[11px] text-muted-foreground">Starter-kit composition</div>
                  <div className="font-mono text-[11px] font-semibold text-foreground">{expanded.length} active blocks</div>
                </div>
              </button>
            );
          })}
        </section>

        {selectedUseCase && (
          <section className="space-y-4">
            <div className="panel p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Architecture flow</div>
                  <h2 className="mt-1 text-[15px] font-semibold">{selectedUseCase.name}</h2>
                </div>
                <span className="pill bg-muted border-border text-foreground font-mono text-[10px]">
                  {activeBlocks.length} blocks active
                </span>
              </div>
              <ArchDiagram ucId={selectedUseCase.id} blockIds={activeBlocks} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="panel p-4">
                <h3 className="text-[13px] font-semibold">Included building blocks</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {activeBlocks.map((blockId) => (
                    <span key={blockId} className="pill bg-info-soft border-primary/30 text-primary font-mono text-[10px]">
                      {blockId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="panel p-4">
                <h3 className="text-[13px] font-semibold">Implementation examples</h3>
                <div className="mt-3 space-y-2">
                  {selectedUseCase.bankingExamples.map((example) => (
                    <div key={example} className="flex items-start gap-2 rounded border border-border bg-muted/20 px-3 py-2">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-[12px] text-muted-foreground">{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
