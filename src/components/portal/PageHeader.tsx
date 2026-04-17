import { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5 gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted-foreground mt-1 max-w-3xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
