import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  USE_CASES, TRACK_META, COMPLEXITY_COLOR, BUILDING_BLOCKS,
  expandWithDependencies, type Track, type UseCase,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronRight } from "lucide-react";

const TRACKS: (Track | "all")[] = ["all", "llmops", "agentops", "mlops"];

export default function UseCases() {
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState<Track | "all">("all");

  const visible = activeTrack === "all"
    ? USE_CASES
    : USE_CASES.filter((u) => u.track === activeTrack);

  return (
    <>
      <PageHeader
        title="Use Case Catalog"
        subtitle={`${USE_CASES.length} pre-validated use cases across LLMOps, AgentOps, and MLOps. Each comes with a recommended set of building blocks — you can use it as-is or customise.`}
      />

      {/* Track filter */}
      <div className="flex items-center gap-2 mb-5">
        {TRACKS.map((t) => {
          const count = t === "all" ? USE_CASES.length : USE_CASES.filter((u) => u.track === t).length;
          return (
            <button
              key={t}
              onClick={() => setActiveTrack(t)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
                activeTrack === t
                  ? "bg-navy text-white border-navy"
                  : "bg-card border-border text-foreground hover:bg-muted"
              )}
            >
              {t === "all" ? "All" : TRACK_META[t].label}
              <span className="ml-1.5 opacity-60">({count})</span>
            </button>
          );
        })}
        <span className="ml-auto text-[11px] text-muted-foreground">
          Click a use case to start building with its recommended blocks pre-loaded
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((uc) => <UCCard key={uc.id} uc={uc} navigate={navigate} />)}
      </div>

      {/* Custom path */}
      <div className="mt-6 panel p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-semibold mb-1">Don't see your use case?</div>
          <div className="text-[12px] text-muted-foreground">
            Go directly to Create App and compose your own combination of building blocks from scratch.
          </div>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="shrink-0 px-4 py-2 rounded border border-border bg-card text-[13px] font-medium hover:bg-muted inline-flex items-center gap-1.5"
        >
          Compose Custom <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}

function UCCard({ uc, navigate }: { uc: UseCase; navigate: any }) {
  const meta = TRACK_META[uc.track];
  const totalBlocks = expandWithDependencies(uc.recommendedBlocks).length;
  const optionalAdded = BUILDING_BLOCKS.filter((b) => uc.recommendedBlocks.includes(b.id));

  return (
    <div className="panel flex flex-col">
      {/* Top accent bar */}
      <div className={cn("h-1 rounded-t-md", {
        "bg-primary": uc.track === "llmops",
        "bg-pattern-p5": uc.track === "agentops",
        "bg-success": uc.track === "mlops",
      })} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className={cn("text-[10px] font-semibold uppercase tracking-wide", meta.color)}>
            {meta.label}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("pill text-[10px]", COMPLEXITY_COLOR[uc.complexity])}>
              {uc.complexity}
            </span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-muted-foreground mb-0.5">{uc.id}</div>
        <h3 className="text-[14px] font-semibold mb-1">{uc.name}</h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{uc.tagline}</p>

        {/* Block summary */}
        <div className="text-[10px] text-muted-foreground mb-1.5">
          Recommended: <span className="font-semibold text-foreground">{totalBlocks} blocks</span>
          {optionalAdded.length > 0 && (
            <span> — adds {optionalAdded.map((b) => b.name).join(", ")}</span>
          )}
        </div>

        {/* Banking examples */}
        <div className="mb-4 space-y-1">
          {uc.bankingExamples.slice(0, 3).map((ex, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 opacity-50" />
              {ex}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/create", { state: { useCaseId: uc.id } })}
          className="mt-auto w-full py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover flex items-center justify-center gap-1.5"
        >
          Use this solution <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}