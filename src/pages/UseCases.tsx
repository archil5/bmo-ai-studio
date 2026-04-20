import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  USE_CASES, TRACK_META, COMPLEXITY_COLOR,
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
        subtitle="4 production-validated use cases, each with a pre-configured block composition and real-world AWS architecture. Select one to start building — or skip to compose custom."
      />

      {/* Track filter */}
      <div className="flex items-center gap-2 mb-6">
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
        <button
          onClick={() => navigate("/create")}
          className="ml-auto px-3 py-1.5 rounded border border-border bg-card text-[12px] font-medium hover:bg-muted inline-flex items-center gap-1.5"
        >
          Compose Custom <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* 2-column grid — cards are detailed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {visible.map((uc) => <UCCard key={uc.id} uc={uc} onSelect={() => navigate("/create", { state: { useCaseId: uc.id } })} />)}
      </div>

      <div className="mt-6 panel p-4 bg-info-soft/40 border-primary/30">
        <div className="text-[12px] font-semibold text-primary mb-1">
          All use cases are governed by the platform — you configure, the platform enforces.
        </div>
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          OSFI E-23 compliance, Application Inference Profiles, PII detection, injection blocking, per-team cost attribution, and audit logging are active on every request regardless of use case. Your team controls: IAM roles, KMS keys, service endpoints, model selection, and application parameters.
        </div>
      </div>
    </>
  );
}

function UCCard({ uc, onSelect }: { uc: UseCase; onSelect: () => void }) {
  const meta = TRACK_META[uc.track];
  const totalBlocks = expandWithDependencies(uc.recommendedBlocks).length;

  return (
    <div className="panel flex flex-col">
      {/* Track accent */}
      <div className={cn("h-1 rounded-t-md", {
        "bg-primary":    uc.track === "llmops",
        "bg-pattern-p5": uc.track === "agentops",
        "bg-success":    uc.track === "mlops",
      })} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", meta.color)}>
              {meta.label}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mb-0.5">{uc.id}</div>
            <h3 className="text-[16px] font-semibold">{uc.name}</h3>
          </div>
          <span className={cn("pill text-[10px] shrink-0 mt-1", COMPLEXITY_COLOR[uc.complexity])}>
            {uc.complexity}
          </span>
        </div>

        <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{uc.description}</p>

        {/* Block summary */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded bg-muted/40 border border-border">
          <span className="text-[11px] text-muted-foreground">Recommended composition:</span>
          <span className="text-[11px] font-semibold text-foreground font-mono">{totalBlocks} blocks</span>
          <span className="text-[10px] text-muted-foreground ml-auto">(adjustable on next step)</span>
        </div>

        {/* Banking examples */}
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Banking examples</div>
          <ul className="space-y-1.5">
            {uc.bankingExamples.map((ex, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[12px] text-muted-foreground">
                <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-40" />
                {ex}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={onSelect}
          className="mt-auto w-full py-2.5 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover flex items-center justify-center gap-1.5 transition-colors"
        >
          Build with this use case <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
