import { PageHeader } from "@/components/portal/PageHeader";
import { ArrowRight, BriefcaseBusiness, GitBranch, Layers3, Sparkles } from "lucide-react";

const POSITIONING = [
  {
    title: "Reference use cases are starter kits",
    body: "They come from domain-informed design work and should be adapted by 15–25% based on production findings — not rebuilt from scratch.",
  },
  {
    title: "Patterns are the real operating unit",
    body: "Each cell validates patterns, while use cases supply acceptance criteria, domain context, and proof that a pattern is reusable.",
  },
  {
    title: "The portal should accelerate matching",
    body: "The target user journey is: business problem → CoE match → validated pattern → starter kit → domain adaptation.",
  },
];

const CELL_ASSIGNMENTS = [
  {
    cell: "Cell 1",
    pattern: "PAT-GENAI-CAI",
    focus: "Conversational AI starter kits",
    sampleUseCases: ["Customer service virtual assistant", "Capital markets trading assistant"],
  },
  {
    cell: "Cell 2",
    pattern: "PAT-GENAI-DOC",
    focus: "Document intelligence and extraction",
    sampleUseCases: ["Document review assistant", "Policy summarization and classification"],
  },
  {
    cell: "Cell 3",
    pattern: "PAT-ML-ANA",
    focus: "ML analytics and decision support",
    sampleUseCases: ["Credit risk modeling", "Financial forecasting"],
  },
  {
    cell: "Cell 4",
    pattern: "PAT-AGENT-WFO",
    focus: "Workflow and agent orchestration",
    sampleUseCases: ["Compliance workflow agent", "Operational triage and actioning"],
  },
];

const PATTERN_BANDS = [
  { band: "Sprint 1", detail: "6 horizontal capabilities at MVP plus the highest-leverage starter kits", emphasis: "61% of all use cases covered" },
  { band: "Sprint 2", detail: "Expand pattern validation after horizontal capability integration checks", emphasis: "Reuse portal controls built in Sprint 1" },
  { band: "Sprint 3", detail: "Scale validated patterns into broader domain packs", emphasis: "Drive adoption through the CoE matching model" },
  { band: "Sprint 4", detail: "Close the remaining pattern gaps and publish permanent ownership", emphasis: "Portal becomes the record of approved patterns" },
];

export default function UseCases() {
  return (
    <>
      <PageHeader
        title="Reference Use Cases"
        subtitle="This view should frame the 153 use cases as reusable starter kits that map business problems to validated patterns, not as bespoke requests waiting for custom development."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {POSITIONING.map((item, index) => {
          const Icon = index === 0 ? Layers3 : index === 1 ? GitBranch : Sparkles;
          return (
            <section key={item.title} className="panel p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="text-[14px] font-semibold">{item.title}</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{item.body}</p>
            </section>
          );
        })}
      </div>

      <section className="panel mt-6 overflow-hidden">
        <div className="panel-header">
          <div>
            <h2 className="text-[14px] font-semibold">Illustrative Sprint 1 validation mapping</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Leadership should immediately see how cells, patterns, and reference packs line up.
            </p>
          </div>
          <span className="pill bg-info-soft border-primary/30 text-primary">4 parallel cells</span>
        </div>
        <div className="grid grid-cols-1 gap-px bg-border lg:grid-cols-2">
          {CELL_ASSIGNMENTS.map((item) => (
            <div key={item.cell} className="bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.cell}</div>
                  <h3 className="mt-1 text-[16px] font-semibold">{item.pattern}</h3>
                  <p className="mt-1 text-[12px] text-muted-foreground">{item.focus}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {item.sampleUseCases.map((sample) => (
                  <div key={sample} className="flex items-start gap-2 rounded border border-border bg-muted/30 px-3 py-2">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-[12px] text-muted-foreground">{sample}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="text-[14px] font-semibold">Adoption motion</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                The use-case catalog only matters if it becomes a matching and adoption engine.
              </p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {[
                "LOB business problem submitted",
                "CoE maps to validated pattern",
                "Starter kit generated from portal",
                "LOB adapts and owns production rollout",
              ].map((step, index) => (
                <div key={step} className="rounded border border-border bg-muted/20 p-3">
                  <div className="text-[10px] font-mono text-muted-foreground">0{index + 1}</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel p-4">
          <h2 className="text-[14px] font-semibold">Validation cadence</h2>
          <div className="mt-3 space-y-2">
            {PATTERN_BANDS.map((item) => (
              <div key={item.band} className="rounded border border-border bg-muted/20 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-foreground">{item.band}</span>
                  <span className="pill bg-card border-border text-muted-foreground">Pattern cycle</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{item.detail}</p>
                <div className="mt-2 text-[11px] font-medium text-primary">{item.emphasis}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
