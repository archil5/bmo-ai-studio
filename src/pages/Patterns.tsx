import { Link } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import { PATTERNS, Pattern, patternAccentClass } from "@/lib/mockData";
import { ArrowRight, AlertTriangle, Layers, Cpu, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

function ComplexityBar({ level }: { level: "Low" | "Medium" | "High" }) {
  const filled = level === "Low" ? 1 : level === "Medium" ? 2 : 3;
  const color = level === "Low" ? "bg-success" : level === "Medium" ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("w-5 h-1.5 rounded-sm", i < filled ? color : "bg-muted")} />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">{level}</span>
    </div>
  );
}

function PatternCard({ p }: { p: Pattern }) {
  const c = patternAccentClass(p.id);
  return (
    <div className={cn("panel p-5 flex flex-col gap-4 hover:shadow-md transition-shadow border-l-4", c.border)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded font-mono font-bold text-[14px] flex items-center justify-center text-white", c.bg)}>
            {p.id}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{p.name}</h3>
            <div className="text-[11px] text-muted-foreground mt-0.5">Reference Solution Pattern</div>
          </div>
        </div>
        {p.warning && (
          <span className="pill bg-warning-soft border-warning/40 text-warning">
            <AlertTriangle className="h-3 w-3" /> Higher Cost
          </span>
        )}
      </div>

      <p className="text-[12.5px] text-muted-foreground leading-relaxed">{p.description}</p>

      <div className="grid grid-cols-3 gap-3 py-3 border-y border-border">
        <Stat icon={Layers} label="Complexity"><ComplexityBar level={p.complexity} /></Stat>
        <Stat icon={Cpu} label="LLM calls/req"><span className="font-mono text-[13px] font-semibold">{p.llmCalls}</span></Stat>
        <Stat icon={Activity} label="Building Blocks"><span className="font-mono text-[13px] font-semibold">{p.blocks}</span></Stat>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Use cases</div>
        <div className="flex flex-wrap gap-1.5">
          {p.useCases.map((u) => (
            <span key={u} className="text-[11px] px-2 py-0.5 rounded bg-muted text-foreground border border-border">{u}</span>
          ))}
        </div>
      </div>

      <Link
        to={`/create?pattern=${p.id}`}
        className={cn("mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-white text-[13px] font-medium hover:opacity-90 transition-opacity", c.bg)}
      >
        Start Building <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      {p.warning && (
        <div className="text-[11px] text-warning bg-warning-soft border border-warning/30 rounded px-2.5 py-1.5 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 shrink-0" /> {p.warning}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, children }: any) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="h-3 w-3" /> {label}
      </div>
      {children}
    </div>
  );
}

export default function Patterns() {
  return (
    <>
      <PageHeader
        title="Reference Solution Patterns"
        subtitle="Pre-validated architectures. Select a pattern to auto-select the building blocks your app needs."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {PATTERNS.map((p) => <PatternCard key={p.id} p={p} />)}
      </div>
    </>
  );
}
