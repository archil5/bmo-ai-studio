import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  BUILDING_BLOCKS, BuildingBlock, GUARDRAIL_PROFILES, MODELS, REQUIRED_BLOCK_IDS,
  TEAMS, expandWithDependencies,
} from "@/lib/mockData";
import { useApps } from "@/context/AppsContext";
import { Check, ChevronRight, Loader2, ShieldCheck, ArrowRight, Lock, Box, Activity, Database, Workflow, Bot, AlertTriangle, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Identity", "Compose", "Deploy"];

const CATEGORY_ICON: Record<string, any> = {
  Foundation: Box, Governance: ShieldCheck, Operations: Activity,
  "Data & Retrieval": Database, LLMOps: Workflow, AgentOps: Bot,
};

const CATEGORY_ORDER = ["Foundation", "Governance", "Operations", "Data & Retrieval", "LLMOps", "AgentOps"];

export default function CreateApp() {
  const navigate = useNavigate();
  const { addApp } = useApps();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [team, setTeam] = useState(TEAMS[0]);
  const [selected, setSelected] = useState<string[]>([...REQUIRED_BLOCK_IDS]);
  
  // Core Configs
  const [model, setModel] = useState(MODELS[1].id);
  const [guardrail, setGuardrail] = useState("Internal Only");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a BMO financial assistant. Answer only questions related to {context}. Do not speculate beyond retrieved documents."
  );
  const [topK, setTopK] = useState(5);

  // Extended Per-Block Configs (Mocked for PoC depth)
  const [bc, setBc] = useState({
    coreLog: "INFO",
    obsTarget: "CloudWatch + MLflow",
    costAlert: 100,
    agentSteps: 5,
    agentTimeout: 30,
    agentTrace: "Standard (OSFI Compliant)"
  });

  const finalBlockIds = useMemo(() => expandWithDependencies(selected), [selected]);
  const hasVectorStore = finalBlockIds.includes("VECTORSTORE");
  const isAgent = finalBlockIds.includes("AGENT_CORE");
  const hasPipeline = finalBlockIds.includes("PIPELINE");

  const toggleBlock = (id: string) => {
    if (REQUIRED_BLOCK_IDS.includes(id)) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      <PageHeader
        title="Create Application"
        subtitle="Compose your application from governed building blocks. Required blocks are enforced and cannot be removed."
      />

      <Stepper step={step} />

      <div className="panel mt-5 p-6 min-h-[420px]">
        {step === 0 && (
          <StepIdentity
            name={name} setName={setName} team={team} setTeam={setTeam}
            onNext={() => name.trim() && setStep(1)}
          />
        )}
        {step === 1 && (
          <StepCompose
            selected={selected} finalBlockIds={finalBlockIds}
            toggleBlock={toggleBlock}
            isAgent={isAgent} hasVectorStore={hasVectorStore} hasPipeline={hasPipeline}
            model={model} setModel={setModel}
            guardrail={guardrail} setGuardrail={setGuardrail}
            systemPrompt={systemPrompt} setSystemPrompt={setSystemPrompt}
            topK={topK} setTopK={setTopK}
            bc={bc} setBc={setBc}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepDeploy
            name={name} team={team} blockIds={finalBlockIds}
            isAgent={isAgent} hasVectorStore={hasVectorStore}
            model={model} guardrail={guardrail} systemPrompt={systemPrompt} topK={topK}
            onBack={() => setStep(1)}
            onDeployed={(app) => addApp(app)}
            onTest={() => navigate("/playground")}
            onView={() => navigate("/deployed")}
          />
        )}
      </div>
    </>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded border flex-1",
              i < step && "bg-success-soft border-success/30 text-success",
              i === step && "bg-info-soft border-primary text-primary",
              i > step && "bg-card border-border text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border",
                i < step && "bg-success text-white border-success",
                i === step && "bg-primary text-white border-primary",
                i > step && "bg-card border-border"
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className="text-[13px] font-medium">{label}</span>
          </div>
          {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

function StepIdentity({ name, setName, team, setTeam, onNext }: any) {
  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <h2 className="text-[16px] font-semibold">Application Identity</h2>
      <Field label="Application Name" hint="Lowercase kebab-case. Must be unique within your team.">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. pcb-mortgage-assistant"
          className="w-full px-3 py-2 border border-border rounded text-[13px] font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </Field>
      <Field label="Team" hint="Determines cost attribution and IAM scope.">
        <select
          value={team} onChange={(e) => setTeam(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded text-[13px] bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {TEAMS.map((t: string) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <div className="flex justify-end pt-3">
        <button disabled={!name.trim()} onClick={onNext}
          className="px-5 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
          Next <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function StepCompose({
  selected, finalBlockIds, toggleBlock, isAgent, hasVectorStore, hasPipeline,
  model, setModel, guardrail, setGuardrail, systemPrompt, setSystemPrompt,
  topK, setTopK, bc, setBc, onBack, onNext,
}: any) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    blocks: BUILDING_BLOCKS.filter((b) => b.category === cat),
  }));

  const inputClass = "w-full px-2.5 py-1.5 border border-border rounded text-[11.5px] bg-background focus:outline-none focus:border-primary";

  const renderSystemPrompt = () => (
    <Field label="System Prompt" hint="Defines the core behavior and boundaries.">
      <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
        rows={4}
        className="w-full px-2.5 py-1.5 border border-border rounded text-[11px] font-mono bg-background resize-y focus:outline-none focus:border-primary" />
    </Field>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* LEFT: Block checklist */}
      <div className="lg:col-span-5 space-y-4">
        <div>
          <h2 className="text-[16px] font-semibold">Compose Application</h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Select the blocks your use case needs. Required dependencies are auto-included.
          </p>
        </div>

        {grouped.map(({ cat, blocks }) => {
          const Icon = CATEGORY_ICON[cat];
          return (
            <div key={cat}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Icon className="h-3 w-3" /> {cat}
              </div>
              <div className="space-y-1.5">
                {blocks.map((b) => {
                  const isReq = b.required;
                  const isSelected = finalBlockIds.includes(b.id);
                  const isAuto = isSelected && !isReq && !selected.includes(b.id);
                  return (
                    <label
                      key={b.id}
                      className={cn(
                        "flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-all",
                        isSelected ? "border-primary/40 bg-info-soft/40" : "border-border bg-card hover:bg-muted/40",
                        isReq && "cursor-not-allowed opacity-95"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isReq}
                        onChange={() => toggleBlock(b.id)}
                        className="mt-0.5 accent-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[12px] font-semibold">{b.name}</span>
                          {isReq && (
                            <span className="pill text-[9px] bg-destructive-soft border-destructive/30 text-destructive">
                              <Lock className="h-2.5 w-2.5" /> Required
                            </span>
                          )}
                          {isAuto && (
                            <span className="pill text-[9px] bg-warning-soft border-warning/40 text-warning">
                              auto · dependency
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{b.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MIDDLE: Live architecture diagram */}
      <div className="lg:col-span-4">
        <div className="sticky top-2 space-y-4">
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold">Live Architecture</h3>
              <span className="pill bg-info-soft border-primary/30 text-primary font-mono text-[10px]">
                {finalBlockIds.length} blocks
              </span>
            </div>
            <ArchitectureDiagram blockIds={finalBlockIds} />
          </div>

          <div className="panel p-4 bg-info-soft/40 border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-[13px] font-semibold">Governance Summary</h3>
            </div>
            <ul className="space-y-1.5 text-[11.5px]">
              {[
                "OSFI E-23 model registry enforced",
                `Guardrail profile: ${guardrail}`,
                "Application Inference Profile (AIP) required",
                "PII detection & Injection blocking",
                "Per-team cost attribution enabled",
              ].map((line) => (
                <li key={line} className="flex items-start gap-1.5">
                  <Check className="h-3 w-3 text-success mt-0.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT: Dynamic Per-Block Configurations */}
      <div className="lg:col-span-3 flex flex-col h-full">
        <h3 className="text-[13px] font-semibold mb-3 shrink-0">Block Configurations</h3>
        <p className="text-[11.5px] text-muted-foreground mb-4 shrink-0">Fine-tune the parameters for your selected blocks.</p>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[480px]">
          
          {finalBlockIds.includes("CORE") && (
            <ConfigCard title="CORE">
              <Field label="Platform Log Level">
                <select value={bc.coreLog} onChange={(e) => setBc({...bc, coreLog: e.target.value})} className={inputClass}>
                  <option>INFO</option><option>DEBUG</option><option>WARN</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("MODEL") && (
            <ConfigCard title="MODEL">
              <Field label="Foundation Model (E-23 Approved)">
                <select value={model} onChange={(e) => setModel(e.target.value)} className={inputClass}>
                  {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </Field>
              {/* If no pipeline or agent is selected (P4 pattern), the model takes the system prompt */}
              {!hasPipeline && !isAgent && renderSystemPrompt()}
            </ConfigCard>
          )}

          {finalBlockIds.includes("GUARDRAILS") && (
            <ConfigCard title="GUARDRAILS">
              <Field label="Data Classification Profile">
                <select value={guardrail} onChange={(e) => setGuardrail(e.target.value)} className={inputClass}>
                  {GUARDRAIL_PROFILES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("VECTORSTORE") && (
            <ConfigCard title="VECTORSTORE">
              <Field label={`Top-K Retrieval: ${topK}`}>
                <input type="range" min={1} max={10} value={topK} onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                  <span>1</span><span>10</span>
                </div>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("PIPELINE") && (
            <ConfigCard title="PIPELINE">
              {renderSystemPrompt()}
            </ConfigCard>
          )}

          {finalBlockIds.includes("AGENT_CORE") && (
            <ConfigCard title="AGENT_CORE">
              {renderSystemPrompt()}
              <Field label={`Max ReAct Steps: ${bc.agentSteps}`} hint="Prevents infinite reasoning loops.">
                <input type="range" min={1} max={15} value={bc.agentSteps} onChange={(e) => setBc({...bc, agentSteps: Number(e.target.value)})}
                  className="w-full accent-warning" />
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("AGENT_TOOLS") && (
            <ConfigCard title="AGENT_TOOLS">
              <Field label="Registered Sandboxed Tools">
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="pill bg-muted text-[10px] font-mono">knowledge_search</span>
                  <span className="pill bg-muted text-[10px] font-mono">calculator</span>
                  <span className="pill bg-muted text-[10px] font-mono">compliance_check</span>
                </div>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("AGENT_GUARDRAILS") && (
            <ConfigCard title="AGENT_GUARDRAILS">
              <Field label="Execution Timeout (Seconds)">
                <select value={bc.agentTimeout} onChange={(e) => setBc({...bc, agentTimeout: Number(e.target.value)})} className={inputClass}>
                  <option value={15}>15s (Strict)</option>
                  <option value={30}>30s (Default)</option>
                  <option value={60}>60s (Extended)</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("AGENT_TRACE") && (
            <ConfigCard title="AGENT_TRACE">
              <Field label="Trajectory Storage">
                 <select value={bc.agentTrace} onChange={(e) => setBc({...bc, agentTrace: e.target.value})} className={inputClass}>
                  <option>Standard (OSFI Compliant)</option>
                  <option>Verbose (Debug Mode)</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("OBSERVE") && (
            <ConfigCard title="OBSERVE">
              <Field label="Telemetry Target">
                <select value={bc.obsTarget} onChange={(e) => setBc({...bc, obsTarget: e.target.value})} className={inputClass}>
                  <option>CloudWatch + MLflow</option>
                  <option>CloudWatch Only</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("COST") && (
            <ConfigCard title="COST">
              <Field label="Monthly Alert Threshold (CAD $)">
                <input type="number" value={bc.costAlert} onChange={(e) => setBc({...bc, costAlert: Number(e.target.value)})} className={inputClass} />
              </Field>
            </ConfigCard>
          )}

        </div>

        <div className="shrink-0 pt-4 mt-4 border-t border-border flex flex-col gap-2">
          <button onClick={onNext}
            className="w-full py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center justify-center gap-1.5">
            Review & Deploy <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <BackBtn onClick={onBack} />
        </div>
      </div>
    </div>
  );
}

function ConfigCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="rounded border border-border bg-card overflow-hidden shadow-sm">
      <div className="bg-muted/30 px-3 py-2 border-b border-border flex items-center gap-1.5">
        <Settings2 className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10.5px] font-bold font-mono text-foreground">{title}</span>
      </div>
      <div className="p-3 space-y-3">
        {children}
      </div>
    </div>
  );
}

function ArchitectureDiagram({ blockIds }: { blockIds: string[] }) {
  const layers = CATEGORY_ORDER.map((cat) => ({
    cat,
    blocks: BUILDING_BLOCKS.filter((b) => b.category === cat && blockIds.includes(b.id)),
  })).filter((l) => l.blocks.length > 0);

  return (
    <div className="space-y-1.5">
      {layers.map(({ cat, blocks }, idx) => {
        const Icon = CATEGORY_ICON[cat];
        return (
          <div key={cat}>
            <div className="rounded border border-primary/30 bg-info-soft/60 p-2">
              <div className="text-[9px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1 mb-1.5">
                <Icon className="h-2.5 w-2.5" /> {cat}
              </div>
              <div className="flex flex-wrap gap-1">
                {blocks.map((b) => (
                  <span key={b.id} className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px] font-medium">
                    {b.name}
                  </span>
                ))}
              </div>
            </div>
            {idx < layers.length - 1 && (
              <div className="flex justify-center text-muted-foreground/60 text-xs leading-none">↓</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepDeploy({ name, team, blockIds, isAgent, hasVectorStore, model, guardrail, systemPrompt, topK, onBack, onDeployed, onTest, onView }: any) {
  const [deploying, setDeploying] = useState(false);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const modelLabel = MODELS.find((m) => m.id === model)?.label.split(" (")[0] ?? model;

  const handleDeploy = async () => {
    setDeploying(true);
    const baseSteps = [
      "Initializing runtime configuration...",
      "Applying OSFI E-23 governance policies...",
      "Registering Application Inference Profile...",
      `Activating guardrail profile: ${guardrail}...`,
      "Enabling CloudWatch cost attribution...",
    ];
    const blockSteps = blockIds
      .filter((id: string) => !["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST"].includes(id))
      .map((id: string) => `Loading block: ${id}...`);
    const steps = [...baseSteps, ...blockSteps, "✓ Application deployed successfully."];

    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 400));
      setLogs((prev) => [...prev, s]);
    }

    onDeployed({
      id: `app-${Date.now()}`,
      name, team, blockIds,
      model, modelLabel,
      guardrailProfile: guardrail,
      systemPrompt, topK: hasVectorStore ? topK : undefined,
      status: "Active",
      invocations: 0, avgLatencyMs: 0, totalCost: 0,
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success-soft border-2 border-success flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-success" />
        </div>
        <div className="font-mono text-[20px] font-semibold mb-2">{name}</div>
        <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
          Your application is live and governed. All requests will be traced, costed, and guardrail-enforced.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button onClick={onTest} className="px-4 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
            Test in Playground <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={onView} className="px-4 py-2 rounded border border-border bg-card text-[13px] font-medium hover:bg-muted inline-flex items-center gap-1.5">
            View Deployed Apps <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div>
        <h2 className="text-[16px] font-semibold mb-4">Review</h2>
        <div className="panel divide-y divide-border">
          <ReviewRow label="Application Name" value={name} mono />
          <ReviewRow label="Team" value={team} />
          <ReviewRow label="Composition" value={`${blockIds.length} blocks${isAgent ? " · Agent" : hasVectorStore ? " · RAG" : " · Inference"}`} />
          <ReviewRow label="Model" value={modelLabel} />
          <ReviewRow label="Guardrail Profile" value={guardrail} />
          {hasVectorStore && <ReviewRow label="Top-K Retrieval" value={String(topK)} mono />}
          <ReviewRow label="System Prompt" value={<span className="text-[11px] font-mono text-muted-foreground line-clamp-3">{systemPrompt}</span>} />
        </div>

        <div className="mt-3 panel p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Selected Blocks</div>
          <div className="flex flex-wrap gap-1">
            {blockIds.map((id: string) => (
              <span key={id} className="pill bg-info-soft border-primary/30 text-primary font-mono text-[10px]">{id}</span>
            ))}
          </div>
        </div>

        {isAgent && (
          <div className="mt-4 panel p-3 bg-warning-soft border-warning/40">
            <div className="flex items-start gap-2 text-[12px] text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span><strong>Higher cost composition.</strong> Autonomous agents consume 3–15× more tokens. Cost alarms will be auto-configured.</span>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-5">
          <BackBtn onClick={onBack} disabled={deploying} />
          <button onClick={handleDeploy} disabled={deploying}
            className="px-6 py-2.5 rounded bg-navy text-white text-[13px] font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
            {deploying ? <><Loader2 className="h-4 w-4 animate-spin" /> Deploying...</> : <>Deploy Application <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-[16px] font-semibold mb-4">Deployment Log</h2>
        <div className="panel bg-[#0b1220] text-[#a8e6a3] font-mono text-[12px] p-4 h-[420px] overflow-auto">
          {logs.length === 0 && <div className="text-[#6b7280]">$ awaiting deployment...</div>}
          {logs.map((l, i) => (
            <div key={i} className="animate-fade-in py-0.5">
              <span className="text-[#6b7280]">[{new Date().toLocaleTimeString()}]</span> {l}
            </div>
          ))}
          {deploying && !done && <div className="text-[#fbbf24]">▍</div>}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, mono }: any) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-foreground text-right max-w-[60%]", mono && "font-mono font-medium")}>{value}</span>
    </div>
  );
}

function Field({ label, hint, children }: any) {
  return (
    <div>
      <div className="text-[11px] font-medium mb-1">{label}</div>
      {children}
      {hint && <div className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug">{hint}</div>}
    </div>
  );
}

function BackBtn({ onClick, disabled }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-2 rounded border border-border bg-card text-[13px] font-medium hover:bg-muted disabled:opacity-50">
      ← Back
    </button>
  );
}