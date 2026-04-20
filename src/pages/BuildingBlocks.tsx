import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  BUILDING_BLOCKS, USE_CASES, TRACK_META, expandWithDependencies,
  type Track,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Box, ShieldCheck, Activity, Database, Workflow, Bot, Lock,
  FileText, TestTube, Cpu, ArrowRight,
} from "lucide-react";

const CATEGORY_ICON: Record<string, any> = {
  Foundation: Box,
  Governance: ShieldCheck,
  Operations: Activity,
  "Prompt Management": FileText,
  "Data & Retrieval": Database,
  LLMOps: Workflow,
  AgentOps: Bot,
  Evaluation: TestTube,
  "Model Customization": Cpu,
  "MLOps": Cpu,
};

const CATEGORY_COLOR: Record<string, string> = {
  Foundation: "bg-muted text-foreground border-border",
  Governance: "bg-destructive-soft text-destructive border-destructive/30",
  Operations: "bg-info-soft text-primary border-primary/30",
  "Prompt Management": "bg-warning-soft text-warning border-warning/30",
  "Data & Retrieval": "bg-[hsl(var(--pattern-p5)/0.1)] text-pattern-p5 border-pattern-p5/30",
  LLMOps: "bg-info-soft text-primary border-primary/30",
  AgentOps: "bg-[hsl(var(--pattern-p5)/0.1)] text-pattern-p5 border-pattern-p5/30",
  Evaluation: "bg-success-soft text-success border-success/30",
  "Model Customization": "bg-success-soft text-success border-success/30",
  "MLOps": "bg-success-soft text-success border-success/30", 
};

type FilterMode = "category" | "usecase";

export default function BuildingBlocks() {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<FilterMode>("usecase");
  const [selectedUC, setSelectedUC] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const CATEGORIES = ["All", ...Array.from(new Set(BUILDING_BLOCKS.map((b) => b.category)))];

  // Compute which blocks are highlighted based on the selected use case
  const highlightedIds: Set<string> = selectedUC
    ? new Set(expandWithDependencies(USE_CASES.find((u) => u.id === selectedUC)?.recommendedBlocks || []))
    : new Set();

  const visibleBlocks = filterMode === "category" && selectedCat !== "All"
    ? BUILDING_BLOCKS.filter((b) => b.category === selectedCat)
    : BUILDING_BLOCKS;

  const selectedUseCase = USE_CASES.find((u) => u.id === selectedUC);

  return (
    <>
      <PageHeader
        title="Platform Building Blocks"
        subtitle="15 governed runtime modules across LLMOps, AgentOps, and MLOps. Select a use case to highlight the blocks it uses."
      />

      {/* Filter mode toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex rounded border border-border overflow-hidden">
          {(["usecase", "category"] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setFilterMode(mode);
                setSelectedUC(null);
                setSelectedCat("All");
              }}
              className={cn(
                "px-3 py-1.5 text-[12px] font-medium transition-colors",
                filterMode === mode
                  ? "bg-navy text-white"
                  : "bg-card text-foreground hover:bg-muted"
              )}
            >
              {mode === "usecase" ? "Filter by Use Case" : "Filter by Category"}
            </button>
          ))}
        </div>

        {selectedUC && (
          <button
            onClick={() => setSelectedUC(null)}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Clear filter
          </button>
        )}

        {selectedUC && selectedUseCase && (
          <button
            onClick={() => navigate("/create", { state: { useCaseId: selectedUC } })}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary-hover"
          >
            Build with {selectedUseCase.name} <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Use case filter pills */}
      {filterMode === "usecase" && (
        <div className="space-y-3 mb-5">
          {(["llmops", "agentops", "mlops"] as Track[]).map((track) => {
            const meta = TRACK_META[track];
            const trackUCs = USE_CASES.filter((u) => u.track === track);
            return (
              <div key={track}>
                <div className={cn("text-[10px] uppercase tracking-wider font-semibold mb-1.5", meta.color)}>
                  {meta.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {trackUCs.map((uc) => (
                    <button
                      key={uc.id}
                      onClick={() => setSelectedUC(selectedUC === uc.id ? null : uc.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all",
                        selectedUC === uc.id
                          ? "bg-navy text-white border-navy"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      )}
                    >
                      <span className="font-mono text-[10px] opacity-60 mr-1">{uc.id}</span>
                      {uc.name}
                      <span className="ml-1.5 opacity-60">
                        ({expandWithDependencies(uc.recommendedBlocks).length} blocks)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category filter pills */}
      {filterMode === "category" && (
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
                selectedCat === c
                  ? "bg-navy text-white border-navy"
                  : "bg-card border-border text-foreground hover:bg-muted"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Selected use case context banner */}
      {selectedUC && selectedUseCase && (
        <div className="mb-4 panel p-3 bg-info-soft/60 border-primary/30 flex items-center justify-between gap-4">
          <div className="text-[12px] text-primary">
            <span className="font-semibold">{selectedUseCase.name}</span>
            <span className="text-muted-foreground ml-2">
              — {highlightedIds.size} blocks required · {highlightedIds.size - 5} optional additions
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Highlighted = included · Dimmed = not required
          </span>
        </div>
      )}

      {/* Blocks grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleBlocks.map((b) => {
          const Icon = CATEGORY_ICON[b.category];
          const isHighlighted = selectedUC ? highlightedIds.has(b.id) : true;
          const isDimmed = selectedUC ? !highlightedIds.has(b.id) : false;

          // Which use cases include this block?
          const usedIn = USE_CASES.filter((uc) =>
            expandWithDependencies(uc.recommendedBlocks).includes(b.id)
          );

          return (
            <div
              key={b.id}
              className={cn(
                "panel p-4 flex flex-col gap-3 transition-all duration-200",
                isHighlighted && !isDimmed && "ring-2 ring-primary shadow-sm",
                isDimmed && "opacity-30 grayscale"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("pill", CATEGORY_COLOR[b.category])}>
                  <Icon className="h-3 w-3" /> {b.category}
                </span>
                <span
                  className={cn(
                    "pill text-[10px]",
                    b.required
                      ? "bg-destructive-soft border-destructive/30 text-destructive"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {b.required ? (
                    <><Lock className="h-2.5 w-2.5" /> Required</>
                  ) : (
                    "Optional"
                  )}
                </span>
              </div>

              <div>
                <h3 className="font-mono font-semibold text-[14px] tracking-tight">{b.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                  {b.description}
                </p>
              </div>

              {/* AWS Services */}
              {b.awsServices && b.awsServices.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    AWS Services
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {b.awsServices.map((s) => (
                      <span key={s} className="pill bg-muted border-border text-foreground font-mono text-[9px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Used in use cases */}
              <div className="mt-auto pt-2 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Used in {usedIn.length} use case{usedIn.length !== 1 ? "s" : ""}
                </div>
                <div className="flex flex-wrap gap-1">
                  {usedIn.slice(0, 4).map((uc) => (
                    <button
                      key={uc.id}
                      onClick={() => setSelectedUC(uc.id)}
                      className="pill bg-muted border-border text-foreground font-mono text-[9px] hover:bg-info-soft hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      {uc.id}
                    </button>
                  ))}
                  {usedIn.length > 4 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{usedIn.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Dependency chain */}
              {b.requires && b.requires.length > 0 && (
                <div className="border-t border-border pt-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                    Depends on
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {b.requires.map((r) => (
                      <span key={r} className="pill bg-muted border-border text-foreground font-mono text-[10px]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
