import { useState } from "react";
import { PageHeader } from "@/components/portal/PageHeader";
import { BUILDING_BLOCKS, BuildingBlock } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Box, ShieldCheck, Activity, Database, Workflow, Bot, Lock } from "lucide-react";

const CATEGORIES = ["All", "Foundation", "Governance", "Operations", "Data & Retrieval", "LLMOps", "AgentOps"] as const;
type Cat = typeof CATEGORIES[number];

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
  const [filter, setFilter] = useState<Cat>("All");

  const visible = BUILDING_BLOCKS.filter((b) => filter === "All" || b.category === filter);

  return (
    <>
      <PageHeader
        title="Platform Building Blocks"
        subtitle="11 governed runtime modules. Compose any combination to build your application — required blocks are auto-included."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((c) => (
          <FilterPill key={c} active={filter === c} onClick={() => setFilter(c)}>
            {c}
          </FilterPill>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((b) => {
          const Icon = CATEGORY_ICON[b.category];
          return (
            <div key={b.id} className="panel p-4 flex flex-col gap-3 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className={cn("pill", CATEGORY_COLOR[b.category])}>
                  <Icon className="h-3 w-3" /> {b.category}
                </span>
                <span className={cn("pill text-[10px]", b.required ? "bg-destructive-soft border-destructive/30 text-destructive" : "bg-muted border-border text-muted-foreground")}>
                  {b.required ? <><Lock className="h-2.5 w-2.5" /> Required</> : "Optional"}
                </span>
              </div>

              <div>
                <h3 className="font-mono font-semibold text-[14px] tracking-tight">{b.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{b.description}</p>
              </div>

              {b.requires && b.requires.length > 0 && (
                <div className="mt-auto pt-3 border-t border-border">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Depends on</div>
                  <div className="flex flex-wrap gap-1">
                    {b.requires.map((r) => (
                      <span key={r} className="pill bg-muted border-border text-foreground font-mono text-[10px]">{r}</span>
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

function FilterPill({ children, active, onClick }: any) {
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
