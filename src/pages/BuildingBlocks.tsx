import { useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  BUILDING_BLOCKS, USE_CASES, TRACK_META, expandWithDependencies,
  type Track,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Box, ShieldCheck, Activity, Database, Workflow, Bot, Lock,
  FileText, TestTube, Cpu,
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
  MLOps: Cpu,
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
  MLOps: "bg-success-soft text-success border-success/30",
};

type FilterMode = "category" | "usecase";

export default function BuildingBlocks() {
  const [filterMode, setFilterMode] = useState<FilterMode>("usecase");
  const [selectedUC, setSelectedUC] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const CATEGORIES = ["All", ...Array.from(new Set(BUILDING_BLOCKS.map((block) => block.category)))];

  const highlightedIds: Set<string> = selectedUC
    ? new Set(expandWithDependencies(USE_CASES.find((useCase) => useCase.id === selectedUC)?.recommendedBlocks || []))
    : new Set();

  const visibleBlocks = filterMode === "category" && selectedCat !== "All"
    ? BUILDING_BLOCKS.filter((block) => block.category === selectedCat)
    : BUILDING_BLOCKS;

  const selectedUseCase = USE_CASES.find((useCase) => useCase.id === selectedUC);

  return (
    <>
      <PageHeader
        title="Platform Building Blocks"
        subtitle="Governed implementation modules across foundation, retrieval, orchestration, agent execution, evaluation, and model customization. Filter by use case to see how starter kits are assembled."
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
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
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              )}
            >
              {mode === "usecase" ? "Highlight by Use Case" : "Browse by Category"}
            </button>
          ))}
        </div>

        {selectedUC && (
          <button
            onClick={() => setSelectedUC(null)}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Clear highlight
          </button>
        )}
      </div>

      {filterMode === "usecase" && (
        <div className="space-y-3 mb-5">
          {(["llmops", "agentops", "mlops"] as Track[]).map((track) => {
            const meta = TRACK_META[track];
            const trackUCs = USE_CASES.filter((useCase) => useCase.track === track);
            return (
              <div key={track}>
                <div className={cn("text-[10px] uppercase tracking-wider font-semibold mb-1.5", meta.color)}>
                  {meta.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {trackUCs.map((useCase) => (
                    <button
                      key={useCase.id}
                      onClick={() => setSelectedUC(selectedUC === useCase.id ? null : useCase.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all",
                        selectedUC === useCase.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      )}
                    >
                      <span className="font-mono text-[10px] opacity-60 mr-1">{useCase.id}</span>
                      {useCase.name}
                      <span className="ml-1.5 opacity-60">
                        ({expandWithDependencies(useCase.recommendedBlocks).length} blocks)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filterMode === "category" && (
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCat(category)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
                selectedCat === category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:bg-muted"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {selectedUC && selectedUseCase && (
        <div className="mb-4 panel p-3 bg-info-soft/40 border-primary/30 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-[12px] text-primary">
            <span className="font-semibold">{selectedUseCase.name}</span>
            <span className="text-muted-foreground ml-2">
              — {highlightedIds.size} active modules in the starter-kit composition
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Highlighted = included in technical implementation
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleBlocks.map((block) => {
          const Icon = CATEGORY_ICON[block.category] ?? Box;
          const isHighlighted = selectedUC ? highlightedIds.has(block.id) : true;
          const isDimmed = selectedUC ? !highlightedIds.has(block.id) : false;
          const usedIn = USE_CASES.filter((useCase) =>
            expandWithDependencies(useCase.recommendedBlocks).includes(block.id)
          );

          return (
            <div
              key={block.id}
              className={cn(
                "panel p-4 flex flex-col gap-3 transition-all duration-200",
                isHighlighted && !isDimmed && "ring-2 ring-primary shadow-sm",
                isDimmed && "opacity-30 grayscale"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("pill", CATEGORY_COLOR[block.category] ?? "bg-muted text-foreground border-border")}>
                  <Icon className="h-3 w-3" /> {block.category}
                </span>
                <span
                  className={cn(
                    "pill text-[10px]",
                    block.required
                      ? "bg-destructive-soft border-destructive/30 text-destructive"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {block.required ? (
                    <><Lock className="h-2.5 w-2.5" /> Required</>
                  ) : (
                    "Optional"
                  )}
                </span>
              </div>

              <div>
                <h3 className="font-mono font-semibold text-[14px] tracking-tight">{block.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                  {block.description}
                </p>
              </div>

              {block.awsServices && block.awsServices.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Runtime services
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {block.awsServices.map((service) => (
                      <span key={service} className="pill bg-muted border-border text-foreground font-mono text-[9px]">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-2 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Used in {usedIn.length} use case{usedIn.length !== 1 ? "s" : ""}
                </div>
                <div className="flex flex-wrap gap-1">
                  {usedIn.slice(0, 4).map((useCase) => (
                    <button
                      key={useCase.id}
                      onClick={() => setSelectedUC(useCase.id)}
                      className="pill bg-muted border-border text-foreground font-mono text-[9px] hover:bg-info-soft hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      {useCase.id}
                    </button>
                  ))}
                  {usedIn.length > 4 && (
                    <span className="text-[10px] text-muted-foreground self-center">+{usedIn.length - 4}</span>
                  )}
                </div>
              </div>

              {block.requires && block.requires.length > 0 && (
                <div className="border-t border-border pt-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                    Depends on
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {block.requires.map((dependency) => (
                      <span key={dependency} className="pill bg-muted border-border text-foreground font-mono text-[10px]">
                        {dependency}
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
