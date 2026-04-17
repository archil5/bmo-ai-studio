import { PatternId, patternAccentClass } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function PatternBadge({ id, className }: { id: PatternId; className?: string }) {
  const c = patternAccentClass(id);
  return (
    <span className={cn("inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-mono font-semibold border", c.text, c.border.replace("border-", "border-") + "/40", c.soft, className)}>
      {id}
    </span>
  );
}

export function StatusPill({ status }: { status: "Success" | "Blocked" | "Active" }) {
  if (status === "Blocked") {
    return <span className="pill bg-destructive-soft border-destructive/30 text-destructive">● Blocked</span>;
  }
  return <span className="pill bg-success-soft border-success/30 text-success">● {status}</span>;
}
