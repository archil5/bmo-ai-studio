import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  USE_CASES, TRACK_META, COMPLEXITY_COLOR, BUILDING_BLOCKS,
  type Track, type UseCase, expandWithDependencies,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Workflow, Bot, FlaskConical, ChevronRight, Zap,
  DollarSign, Layers, ArrowRight, CheckCircle2,
} from "lucide-react";

const TRACK_ICON: Record<Track, any> = {
  llmops: Workflow,
  agentops: Bot,
  mlops: FlaskConical,
};

const TRACK_FILTERS: Array<{ id: Track | "all"; label: string }> = [
  { id: "all", label: "All Use Cases" },
  { id: "llmops", label: "LLMOps" },
  { id: "agentops", label: "AgentOps" },
  { id: "mlops", label: "MLOps" },
];

export default function UseCases() {
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState<Track | "all">("all");
  const [hoveredUC, setHoveredUC] = useState<string | null>(null);

  const visible = activeTrack === "all" ? USE_CASES : USE_CASES.filter((uc) => uc.track === activeTrack);

  const stats = {
    llmops: USE_CASES.filter((u) => u.track === "llmops").length,
    agentops: USE_CASES.filter((u) => u.track === "agentops").length,
    mlops: USE_CASES.filter((u) => u.track === "mlops").length,
  };

  return (
    <>
      <PageHeader
        title="Use Case Catalog"
        subtitle="Browse 11 pre-validated use cases across LLMOps, AgentOps, and MLOps. Select a use case to auto-configure your building blocks."
      />

      {/* Track summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["llmops", "agentops", "mlops"] as Track[]).map((track) => {
          const meta = TRACK_META[track];
          const Icon = TRACK_ICON[track];
          return (
            <button
              key={track}
              onClick={() => setActiveTrack(activeTrack === track ? "all" : track)}
              className={cn(
                "panel p-4 text-left transition-all hover:shadow-sm",
                activeTrack === track ? `ring-2 ring-primary` : "hover:bg-muted/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn("flex items-center gap-2 text-[13px] font-semibold", meta.color)}>
                  <Icon className="h-4 w-4" />
                  {meta.label}
                </div>
                <span className="text-[22px] font-bold text-foreground">{stats[track]}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{meta.description}</p>
            </button>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-5">
        {TRACK_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveTrack(f.id)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
              activeTrack === f.id
                ? "bg-navy text-white border-navy"
                : "bg-card border-border text-foreground hover:bg-muted"
            )}
          >
            {f.label}
            {f.id !== "all" && (
              <span className="ml-1.5 opacity-60">({stats[f.id as Track]})</span>
            )}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-muted-foreground">
          Showing {visible.length} of {USE_CASES.length} use cases
        </span>
      </div>

      {/* Use case grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((uc) => (
          <UseCaseCard
            key={uc.id}
            uc={uc}
            isHovered={hoveredUC === uc.id}
            onHover={(id) => setHoveredUC(id)}
            onSelect={() =>
              navigate("/create", { state: { useCaseId: uc.id } })
            }
          />
        ))}
      </div>

      {/* Platform governance notice */}
      <div className="mt-6 panel p-4 bg-info-soft/40 border-primary/30 flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <div className="text-[13px] font-semibold text-primary mb-1">
            All use cases are governed by the platform
          </div>
          <div className="text-[12px] text-muted-foreground leading-relaxed">
            Regardless of which use case you select, the platform enforces OSFI E-23 compliance, mandatory Application Inference Profiles (AIPs), PII detection, prompt injection blocking, per-team cost attribution, and full audit logging. These controls cannot be disabled by application developers. Your configuration choices determine the <em>what</em> — the platform controls the <em>how</em>.
          </div>
        </div>
      </div>
    </>
  );
}

function UseCaseCard({
  uc,
  isHovered,
  onHover,
  onSelect,
}: {
  uc: UseCase;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: () => void;
}) {
  const meta = TRACK_META[uc.track];
  const Icon = TRACK_ICON[uc.track];
  const totalBlocks = expandWithDependencies(uc.blockIds).length;
  const optionalBlocks = BUILDING_BLOCKS.filter((b) => uc.blockIds.includes(b.id));

  return (
    <div
      className={cn(
        "panel flex flex-col transition-all duration-200",
        isHovered ? "shadow-md -translate-y-0.5" : "hover:shadow-sm"
      )}
      onMouseEnter={() => onHover(uc.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Track strip */}
      <div className={cn("h-1 rounded-t-md", {
        "bg-primary": uc.track === "llmops",
        "bg-pattern-p5": uc.track === "agentops",
        "bg-success": uc.track === "mlops",
      })} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide", meta.color)}>
            <Icon className="h-3 w-3" />
            {meta.label}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("pill text-[10px]", COMPLEXITY_COLOR[uc.complexity])}>
              {uc.complexity}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-muted-foreground mb-1">{uc.id}</div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">{uc.name}</h3>
        <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{uc.tagline}</p>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Metric icon={<Layers className="h-3 w-3" />} label="Blocks" value={String(totalBlocks)} />
          <Metric icon={<Zap className="h-3 w-3" />} label="LLM Calls" value={uc.llmCallsPerRequest} />
          <Metric icon={<DollarSign className="h-3 w-3" />} label="Est. Cost" value={uc.estimatedCost.split("/")[0].trim()} />
        </div>

        {/* Banking examples */}
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Banking examples</div>
          <ul className="space-y-1">
            {uc.bankingExamples.slice(0, 3).map((ex, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground/50" />
                {ex}
              </li>
            ))}
          </ul>
        </div>

        {/* Optional blocks added */}
        {optionalBlocks.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Adds {optionalBlocks.length} optional block{optionalBlocks.length > 1 ? "s" : ""}
            </div>
            <div className="flex flex-wrap gap-1">
              {optionalBlocks.map((b) => (
                <span key={b.id} className="pill bg-muted border-border text-foreground font-mono text-[10px]">
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {uc.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onSelect}
          className="mt-auto w-full py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5"
        >
          Start Building <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded p-1.5 text-center border border-border">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-[9px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-[11px] font-semibold font-mono text-foreground">{value}</div>
    </div>
  );
}
