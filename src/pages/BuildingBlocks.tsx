import { useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import { PatternBadge } from "@/components/portal/PatternBadge";
import { BUILDING_BLOCKS, PATTERNS, PatternId } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Box, ShieldCheck, Activity, Database, Workflow, Bot } from "lucide-react";

const CATEGORY_ICON: Record<string, any> = {
  Foundation: Box,
  Governance: ShieldCheck,
  Operations: Activity,
  "Data & Retrieval": Database,
  LLMOps: Workflow,
  AgentOps: Bot,
};

const CATEGORY_COLOR: Record<string, string> = {
  Foundation: "bg-muted text-foreground border-border",
  Governance: "bg-destructive-soft text-destructive border-destructive/30",
  Operations: "bg-info-soft text-primary border-primary/30",
  "Data & Retrieval": "bg-warning-soft text-warning border-warning/30",
  LLMOps: "bg-info-soft text-primary border-primary/30",
  AgentOps: "bg-[hsl(var(--pattern-p5)/0.1)] text-pattern-p5 border-pattern-p5/30",
};

export default function BuildingBlocks() {
  const [filter, setFilter] = useState<PatternId | "ALL">("ALL");

  return (
    <>
      <PageHeader
        title="Platform Building Blocks"
        subtitle="11 governed runtime modules. Select a pattern below to see which blocks it uses."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <FilterPill active={filter === "ALL"} onClick={() => setFilter("ALL")}>All</FilterPill>
        {PATTERNS.map((p) => (
          <FilterPill key={p.id} active={filter === p.id} onClick={() => setFilter(p.id)} patternId={p.id}>
            {p.id} — {p.shortName}
          </FilterPill>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {BUILDING_BLOCKS.map((b) => {
          const Icon = CATEGORY_ICON[b.category];
          const inPattern = filter === "ALL" || b.patterns.includes(filter as PatternId);
          return (
            <div
              key={b.id}
              className={cn(
                "panel p-4 flex flex-col gap-3 transition-all",
                filter !== "ALL" && inPattern && "border-primary ring-1 ring-primary/30 bg-info-soft/40 shadow-sm",
                filter !== "ALL" && !inPattern && "opacity-40"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("pill", CATEGORY_COLOR[b.category])}>
                  <Icon className="h-3 w-3" /> {b.category}
                </span>
                <span className={cn("pill text-[10px]", b.required ? "bg-destructive-soft border-destructive/30 text-destructive" : "bg-muted border-border text-muted-foreground")}>
                  {b.required ? "Required" : "Optional"}
                </span>
              </div>

              <div>
                <h3 className="font-mono font-semibold text-[14px] tracking-tight">{b.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{b.description}</p>
              </div>

              <div className="mt-auto pt-3 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Used in patterns</div>
                <div className="flex flex-wrap gap-1">
                  {b.patterns.map((p) => <PatternBadge key={p} id={p} />)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function FilterPill({ children, active, onClick, patternId }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
        active
          ? "bg-navy text-white border-navy shadow-sm"
          : "bg-card border-border text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
