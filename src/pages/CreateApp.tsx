import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  BUILDING_BLOCKS, GUARDRAIL_PROFILES, MODELS, REQUIRED_BLOCK_IDS,
  TEAMS, USE_CASES, TRACK_META, COMPLEXITY_COLOR, expandWithDependencies,
  getUseCaseById, type Track,
} from "@/lib/mockData";
import { useApps } from "@/context/AppsContext";
import {
  Check, ChevronRight, Loader2, ShieldCheck, ArrowRight, Lock,
  Box, Activity, Database, Workflow, Bot, AlertTriangle, Settings2,
  TestTube, FileText, Cpu, Library, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Use Case", "Identity", "Compose", "Deploy"];

const CATEGORY_ICON: Record<string, any> = {
  Foundation: Box, Governance: ShieldCheck, Operations: Activity,
  "Prompt Management": FileText, "Data & Retrieval": Database,
  LLMOps: Workflow, AgentOps: Bot, Evaluation: TestTube, "Model Customization": Cpu,
};

const CATEGORY_ORDER = [
  "Foundation", "Governance", "Operations", "Prompt Management",
  "Data & Retrieval", "LLMOps", "AgentOps", "Evaluation", "Model Customization",
];

export default function CreateApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addApp } = useApps();

  const preselectedUCId = (location.state as any)?.useCaseId as string | undefined;

  const [step, setStep] = useState(preselectedUCId ? 1 : 0);
  const [selectedUCId, setSelectedUCId] = useState<string>(preselectedUCId ?? "");
  const [name, setName] = useState("");
  const [team, setTeam] = useState(TEAMS[0]);

  // Build initial block selection from use case
  const ucBlockIds = useMemo(
    () => getUseCaseById(selectedUCId)?.blockIds ?? [],
    [selectedUCId]
  );
  const [selected, setSelected] = useState<string[]>(ucBlockIds);

  const [model, setModel] = useState(MODELS[1].id);
  const [guardrail, setGuardrail] = useState("Internal Only");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a BMO financial assistant. Answer only questions grounded in retrieved documents. Do not speculate beyond available context."
  );
  const [topK, setTopK] = useState(5);
  const [bc, setBc] = useState({
    coreLog: "INFO", obsTarget: "CloudWatch + MLflow", costAlert: 100,
    agentSteps: 5, agentTimeout: 30, agentTrace: "Standard (OSFI Compliant)",
    evalMetrics: "RAGAS Core (Faithfulness + Relevance)", evalFrequency: "Nightly Batch",
    promptApproval: "Require Manager Approval", tuningEpochs: 3, tuningRank: 8,
  });

  const finalBlockIds = useMemo(() => expandWithDependencies(selected), [selected]);
  const hasVectorStore = finalBlockIds.includes("VECTORSTORE");
  const isAgent = finalBlockIds.includes("AGENT_CORE");
  const hasPipeline = finalBlockIds.includes("PIPELINE");
  const isMLOps = finalBlockIds.includes("FINE_TUNER") || finalBlockIds.includes("EVAL_ENGINE");
  const selectedUC = getUseCaseById(selectedUCId);

  const toggleBlock = (id: string) => {
    if (REQUIRED_BLOCK_IDS.includes(id)) return;
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  function handleUCSelect(ucId: string) {
    setSelectedUCId(ucId);
    const uc = getUseCaseById(ucId);
    if (uc) setSelected(uc.blockIds);
  }

  return (
    <>
      <PageHeader
        title="Create Application"
        subtitle="Select a use case to auto-configure your building blocks, then deploy a governed AI application in one click."
      />
      <Stepper step={step} />

      <div className="panel mt-5 p-6 min-h-[420px]">
        {step === 0 && (
          <StepUseCase
            selectedUCId={selectedUCId}
            onSelect={handleUCSelect}
            onNext={() => step === 0 && setStep(1)}
          />
        )}
        {step === 1 && (
          <StepIdentity
            name={name} setName={setName} team={team} setTeam={setTeam}
            onBack={() => setStep(0)} onNext={() => name.trim() && setStep(2)}
          />
        )}
        {step === 2 && (
          <StepCompose
            selected={selected} finalBlockIds={finalBlockIds}
            toggleBlock={toggleBlock}
            isAgent={isAgent} hasVectorStore={hasVectorStore} hasPipeline={hasPipeline}
            model={model} setModel={setModel}
            guardrail={guardrail} setGuardrail={setGuardrail}
            systemPrompt={systemPrompt} setSystemPrompt={setSystemPrompt}
            topK={topK} setTopK={setTopK}
            bc={bc} setBc={setBc}
            onBack={() => setStep(1)} onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepDeploy
            name={name} team={team} blockIds={finalBlockIds}
            useCaseId={selectedUCId}
            isAgent={isAgent} hasVectorStore={hasVectorStore} isMLOps={isMLOps}
            model={model} guardrail={guardrail} systemPrompt={systemPrompt} topK={topK}
            onBack={() => setStep(2)}
            onDeployed={(app: any) => addApp(app)}
            onTest={() => navigate("/playground")}
            onView={() => navigate("/deployed")}
          />
        )}
      </div>
    </>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className={cn(
            "flex items-center gap-2.5 px-4 py-2 rounded border flex-1",
            i < step && "bg-success-soft border-success/30 text-success",
            i === step && "bg-info-soft border-primary text-primary",
            i > step && "bg-card border-border text-muted-foreground"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border",
              i < step && "bg-success text-white border-success",
              i === step && "bg-primary text-white border-primary",
              i > step && "bg-card border-border"
            )}>
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

// ─── Step 0: Use Case Selection ──────────────────────────────────────────────

function StepUseCase({ selectedUCId, onSelect, onNext }: {
  selectedUCId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  const [activeTrack, setActiveTrack] = useState<Track | "all">("all");
  const tracks: Track[] = ["llmops", "agentops", "mlops"];
  const visible = activeTrack === "all" ? USE_CASES : USE_CASES.filter((u) => u.track === activeTrack);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-semibold">Select Your Use Case</h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Choose the pattern that matches your team's problem. Building blocks will be auto-configured.
          </p>
        </div>
        <button
          disabled={!selectedUCId}
          onClick={onNext}
          className="px-5 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          Next <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Track filter */}
      <div className="flex gap-2 mb-4">
        {(["all", ...tracks] as (Track | "all")[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTrack(t)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all",
              activeTrack === t ? "bg-navy text-white border-navy" : "bg-card border-border text-foreground hover:bg-muted"
            )}
          >
            {t === "all" ? "All" : TRACK_META[t].label}
          </button>
        ))}
      </div>

      {/* Use case grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {visible.map((uc) => {
          const meta = TRACK_META[uc.track];
          const isSelected = selectedUCId === uc.id;
          const totalBlocks = expandWithDependencies(uc.blockIds).length;
          return (
            <button
              key={uc.id}
              onClick={() => onSelect(uc.id)}
              className={cn(
                "text-left panel p-3 transition-all hover:shadow-sm border-2",
                isSelected ? "border-primary bg-info-soft/30" : "border-transparent hover:border-border"
              )}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className={cn("text-[10px] font-semibold uppercase tracking-wide", meta.color)}>
                  {meta.label}
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn("pill text-[9px]", COMPLEXITY_COLOR[uc.complexity])}>
                    {uc.complexity}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground mb-0.5">{uc.id}</div>
              <div className="text-[13px] font-semibold mb-1">{uc.name}</div>
              <div className="text-[11px] text-muted-foreground mb-2 leading-snug line-clamp-2">{uc.tagline}</div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Library className="h-3 w-3" /> {totalBlocks} blocks
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {uc.llmCallsPerRequest} LLM call{uc.llmCallsPerRequest !== "1" ? "s" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Don't see your use case?{" "}
        <button onClick={onNext} className="text-primary underline underline-offset-2">
          Skip and compose manually →
        </button>
      </p>
    </div>
  );
}

// ─── Step 1: Identity ────────────────────────────────────────────────────────

function StepIdentity({ name, setName, team, setTeam, onBack, onNext }: any) {
  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <h2 className="text-[16px] font-semibold">Application Identity</h2>
      <Field label="Application Name" hint="Lowercase kebab-case. Must be unique within your team.">
        <input
          value={name} onChange={(e) => setName(e.target.value)}
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
      <div className="flex justify-between pt-3">
        <BackBtn onClick={onBack} />
        <button
          disabled={!name.trim()} onClick={onNext}
          className="px-5 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          Next <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Compose ─────────────────────────────────────────────────────────

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
      <textarea
        value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
        rows={4}
        className="w-full px-2.5 py-1.5 border border-border rounded text-[11px] font-mono bg-background resize-y focus:outline-none focus:border-primary"
      />
    </Field>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">

      {/* LEFT: Block checklist */}
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h2 className="text-[16px] font-semibold">Compose Application</h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Adjust the blocks your application needs. Required blocks cannot be removed.
          </p>
        </div>
        {grouped.map(({ cat, blocks }) => {
          if (blocks.length === 0) return null;
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
                        type="checkbox" checked={isSelected} disabled={isReq}
                        onChange={() => toggleBlock(b.id)} className="mt-0.5 accent-primary"
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

      {/* MIDDLE: AWS Architecture Diagram */}
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
              <h3 className="text-[13px] font-semibold">Governance — Cannot be disabled</h3>
            </div>
            <ul className="space-y-1.5 text-[11.5px]">
              {[
                "OSFI E-23 model registry enforced on all invocations",
                `Guardrail profile: ${guardrail}`,
                "Application Inference Profile (AIP) — mandatory",
                "PII detection (8 types) + injection blocking (5 categories)",
                "Per-team cost attribution + CloudWatch alarms",
                "All requests traced to SageMaker MLflow",
                "VPC PrivateLink — no internet egress to Bedrock",
                "Customer-managed KMS key — data at rest + in transit",
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

      {/* RIGHT: Per-Block Configurations */}
      <div className="lg:col-span-4 flex flex-col h-full">
        <h3 className="text-[13px] font-semibold mb-1 shrink-0">Block Configurations</h3>
        <p className="text-[11.5px] text-muted-foreground mb-4 shrink-0">
          Platform enforces security defaults. Configure application-level parameters below.
        </p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[520px]">
          {finalBlockIds.includes("CORE") && (
            <ConfigCard title="CORE — Platform Foundation">
              <Field label="Log Level">
                <select value={bc.coreLog} onChange={(e) => setBc({ ...bc, coreLog: e.target.value })} className={inputClass}>
                  <option>INFO</option><option>DEBUG</option><option>WARN</option>
                </select>
              </Field>
              <div className="text-[10px] text-muted-foreground bg-muted/40 p-2 rounded border border-border">
                VPC endpoints, KMS CMK, IAM boundaries, and proxy config are enforced by the platform and cannot be changed here.
              </div>
            </ConfigCard>
          )}

          {finalBlockIds.includes("MODEL") && (
            <ConfigCard title="MODEL — Bedrock Inference">
              <Field label="Foundation Model (OSFI E-23 Approved)">
                <select value={model} onChange={(e) => setModel(e.target.value)} className={inputClass}>
                  {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </Field>
              {!hasPipeline && !isAgent && renderSystemPrompt()}
            </ConfigCard>
          )}

          {finalBlockIds.includes("GUARDRAILS") && (
            <ConfigCard title="GUARDRAILS — Data Classification">
              <Field label="Profile" hint="Determines PII sensitivity, injection strictness, and audit depth.">
                <select value={guardrail} onChange={(e) => setGuardrail(e.target.value)} className={inputClass}>
                  {GUARDRAIL_PROFILES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("PROMPT_HUB") && (
            <ConfigCard title="PROMPT HUB — Version Control">
              <Field label="Deployment Workflow">
                <select value={bc.promptApproval} onChange={(e) => setBc({ ...bc, promptApproval: e.target.value })} className={inputClass}>
                  <option>Require Manager Approval</option>
                  <option>Auto-Deploy (Dev Only)</option>
                  <option>A/B Test Mode</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("VECTORSTORE") && (
            <ConfigCard title="VECTORSTORE — OpenSearch Serverless">
              <Field label={`Top-K Retrieval Results: ${topK}`}>
                <input
                  type="range" min={1} max={10} value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                  <span>1 (precise)</span><span>10 (broad)</span>
                </div>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("PIPELINE") && (
            <ConfigCard title="PIPELINE — RAG Orchestration">
              {renderSystemPrompt()}
            </ConfigCard>
          )}

          {finalBlockIds.includes("AGENT_CORE") && (
            <ConfigCard title="AGENT CORE — ReAct Loop">
              {renderSystemPrompt()}
              <Field label={`Max ReAct Steps: ${bc.agentSteps}`} hint="Hard limit — prevents infinite reasoning loops.">
                <input
                  type="range" min={1} max={15} value={bc.agentSteps}
                  onChange={(e) => setBc({ ...bc, agentSteps: Number(e.target.value) })}
                  className="w-full accent-warning"
                />
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("AGENT_TOOLS") && (
            <ConfigCard title="AGENT TOOLS — Sandboxed Executor">
              <Field label="Registered Tools">
                <div className="flex flex-wrap gap-1 mt-1">
                  {["knowledge_search", "calculator", "compliance_check"].map((t) => (
                    <span key={t} className="pill bg-muted text-[10px] font-mono">{t}</span>
                  ))}
                </div>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("AGENT_GUARDRAILS") && (
            <ConfigCard title="AGENT GUARDRAILS — Budget Control">
              <Field label="Execution Timeout">
                <select value={bc.agentTimeout} onChange={(e) => setBc({ ...bc, agentTimeout: Number(e.target.value) })} className={inputClass}>
                  <option value={15}>15s — Strict</option>
                  <option value={30}>30s — Default</option>
                  <option value={60}>60s — Extended</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("AGENT_TRACE") && (
            <ConfigCard title="AGENT TRACE — Audit Trail (S3)">
              <Field label="Trajectory Verbosity">
                <select value={bc.agentTrace} onChange={(e) => setBc({ ...bc, agentTrace: e.target.value })} className={inputClass}>
                  <option>Standard (OSFI Compliant)</option>
                  <option>Verbose (Debug Mode)</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("OBSERVE") && (
            <ConfigCard title="OBSERVE — Telemetry">
              <Field label="Telemetry Target">
                <select value={bc.obsTarget} onChange={(e) => setBc({ ...bc, obsTarget: e.target.value })} className={inputClass}>
                  <option>CloudWatch + MLflow</option>
                  <option>CloudWatch Only</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("COST") && (
            <ConfigCard title="COST — Attribution & Alarms">
              <Field label="Monthly Alert Threshold (CAD $)">
                <input
                  type="number" value={bc.costAlert}
                  onChange={(e) => setBc({ ...bc, costAlert: Number(e.target.value) })}
                  className={inputClass}
                />
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("EVAL_ENGINE") && (
            <ConfigCard title="EVAL ENGINE — Benchmarking">
              <Field label="Metric Suite">
                <select value={bc.evalMetrics} onChange={(e) => setBc({ ...bc, evalMetrics: e.target.value })} className={inputClass}>
                  <option>RAGAS Core (Faithfulness + Relevance)</option>
                  <option>Toxicity & Bias Only</option>
                  <option>Full Suite + LLM-as-a-Judge</option>
                </select>
              </Field>
              <Field label="Execution Frequency">
                <select value={bc.evalFrequency} onChange={(e) => setBc({ ...bc, evalFrequency: e.target.value })} className={inputClass}>
                  <option>Nightly Batch</option>
                  <option>10% Live Traffic Shadowing</option>
                  <option>Manual Trigger Only</option>
                </select>
              </Field>
            </ConfigCard>
          )}

          {finalBlockIds.includes("DATA_PREP") && (
            <ConfigCard title="DATA PREP — PII-Safe Curation">
              <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded border border-border">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                <span>Mandatory PII scrubbing is enforced on all datasets before entering any training pipeline. This cannot be disabled.</span>
              </div>
            </ConfigCard>
          )}

          {finalBlockIds.includes("FINE_TUNER") && (
            <ConfigCard title="FINE TUNER — LoRA / PEFT">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Epochs">
                  <input type="number" min={1} max={10} value={bc.tuningEpochs}
                    onChange={(e) => setBc({ ...bc, tuningEpochs: Number(e.target.value) })}
                    className={inputClass} />
                </Field>
                <Field label="LoRA Rank (r)">
                  <select value={bc.tuningRank} onChange={(e) => setBc({ ...bc, tuningRank: Number(e.target.value) })} className={inputClass}>
                    <option value={4}>4 — Light</option>
                    <option value={8}>8 — Standard</option>
                    <option value={16}>16 — Heavy</option>
                  </select>
                </Field>
              </div>
              <div className="mt-2 text-[10px] text-warning bg-warning/10 p-1.5 rounded border border-warning/20">
                ⚠️ Spins up dedicated GPU instances. Cost attributed to team budget.
              </div>
            </ConfigCard>
          )}
        </div>

        <div className="shrink-0 pt-4 mt-4 border-t border-border flex flex-col gap-2">
          <button
            onClick={onNext}
            className="w-full py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center justify-center gap-1.5"
          >
            Review & Deploy <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <BackBtn onClick={onBack} />
        </div>
      </div>
    </div>
  );
}

// ─── Architecture Diagram (SVG) ───────────────────────────────────────────────

function ArchitectureDiagram({ blockIds }: { blockIds: string[] }) {
  const has = (id: string) => blockIds.includes(id);

  // Determine which service columns to show
  const showOpenSearch = has("VECTORSTORE");
  const showAgentLoop = has("AGENT_CORE");
  const showLambda = has("AGENT_TOOLS");
  const showS3Trace = has("AGENT_TRACE");
  const showSageMaker = has("EVAL_ENGINE") || has("DATA_PREP") || has("FINE_TUNER");
  const showMLflow = has("OBSERVE");
  const showCustomModel = has("FINE_TUNER");

  // Colors
  const C = {
    vpc: "#0079C1",
    subnet: "#e6f3fb",
    ecs: "#FF9900",
    bedrock: "#8B5CF6",
    guardrail: "#DC2626",
    opensearch: "#059669",
    lambda: "#F59E0B",
    sagemaker: "#3B82F6",
    shared: "#6B7280",
    kms: "#DC2626",
    s3: "#16A34A",
    cw: "#F59E0B",
    mlflow: "#3B82F6",
    text: "#1e293b",
    muted: "#94a3b8",
  };

  // Compute layout — how many service columns do we need?
  const serviceCount = [true, showOpenSearch, showSageMaker].filter(Boolean).length;
  const W = 320;
  const colW = serviceCount === 1 ? 120 : serviceCount === 2 ? 100 : 85;
  const startX = serviceCount === 1 ? (W - colW) / 2 : serviceCount === 2 ? 40 : 20;
  const colGap = serviceCount === 1 ? 0 : serviceCount === 2 ? (W - 80 - colW * 2) / 1 : (W - 40 - colW * 3) / 2;

  const bedrockX = startX;
  const openSearchX = showOpenSearch ? bedrockX + colW + colGap : -999;
  const sageMakerX = showSageMaker ? (showOpenSearch ? openSearchX + colW + colGap : bedrockX + colW + colGap) : -999;

  const ecsY = 80;
  const serviceY = 150;
  const sharedY = 250;

  const SvcBox = ({ x, y, w = colW, h = 44, label, sublabel, color }: any) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill={color + "18"} stroke={color} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + 16} textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="monospace">
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + 30} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="system-ui">
          {sublabel}
        </text>
      )}
    </g>
  );

  const Arrow = ({ x1, y1, x2, y2, color = C.muted, dashed = false }: any) => (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth="1.5"
      strokeDasharray={dashed ? "4 3" : undefined}
      markerEnd="url(#arrow)"
    />
  );

  const SharedBox = ({ x, label, color }: { x: number; label: string; color: string }) => (
    <g>
      <rect x={x} y={sharedY} width={60} height={32} rx="4" fill={color + "18"} stroke={color} strokeWidth="1.2" />
      <text x={x + 30} y={sharedY + 12} textAnchor="middle" fontSize="8" fontWeight="700" fill={color} fontFamily="monospace">
        {label.split(" ")[0]}
      </text>
      <text x={x + 30} y={sharedY + 23} textAnchor="middle" fontSize="7" fill={C.muted} fontFamily="system-ui">
        {label.split(" ").slice(1).join(" ")}
      </text>
    </g>
  );

  const totalH = showSageMaker || showLambda ? 310 : 295;
  const ecsCX = W / 2;
  const ecsX = ecsCX - 70;

  return (
    <div className="w-full overflow-hidden rounded">
      <svg
        viewBox={`0 0 ${W} ${totalH}`}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={C.muted} />
          </marker>
        </defs>

        {/* AWS Cloud label */}
        <rect x={1} y={1} width={W - 2} height={totalH - 2} rx="8"
          fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="6 4" />
        <text x={8} y={13} fontSize="8" fill={C.muted} fontFamily="system-ui">AWS Cloud — ca-central-1</text>

        {/* VPC boundary */}
        <rect x={8} y={22} width={W - 16} height={totalH - 55} rx="6"
          fill="#f0f9ff" stroke={C.vpc} strokeWidth="1.5" strokeDasharray="5 3" />
        <text x={16} y={34} fontSize="8" fontWeight="600" fill={C.vpc} fontFamily="system-ui">VPC — Private Subnets Only</text>

        {/* Developer (outside VPC, but inside AWS Cloud visual for simplicity) */}
        <rect x={ecsCX - 38} y={38} width={76} height={24} rx="4"
          fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
        <text x={ecsCX} y={54} textAnchor="middle" fontSize="9" fontWeight="600" fill={C.text} fontFamily="system-ui">
          👤 Developer
        </text>

        {/* Arrow: Developer → ECS */}
        <line x1={ecsCX} y1={62} x2={ecsCX} y2={ecsY - 1}
          stroke={C.muted} strokeWidth="1.5" markerEnd="url(#arrow)" />

        {/* ECS Fargate box */}
        <rect x={ecsX} y={ecsY} width={140} height={44} rx="5"
          fill={C.ecs + "18"} stroke={C.ecs} strokeWidth="1.8" />
        <text x={ecsCX} y={ecsY + 16} textAnchor="middle" fontSize="9" fontWeight="700" fill={C.ecs} fontFamily="monospace">
          ECS FARGATE
        </text>
        <text x={ecsCX} y={ecsY + 30} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="system-ui">
          {showAgentLoop ? "Platform Runtime — ReAct Loop" : "Platform Runtime"}
        </text>

        {/* Branch arrows from ECS to services */}
        {/* → Bedrock */}
        <line
          x1={bedrockX + colW / 2 <= ecsCX - 10 ? bedrockX + colW / 2 : ecsCX}
          y1={ecsY + 44}
          x2={bedrockX + colW / 2}
          y2={serviceY - 1}
          stroke={C.bedrock} strokeWidth="1.5" markerEnd="url(#arrow)"
        />

        {/* → OpenSearch */}
        {showOpenSearch && (
          <line
            x1={ecsCX}
            y1={ecsY + 44}
            x2={openSearchX + colW / 2}
            y2={serviceY - 1}
            stroke={C.opensearch} strokeWidth="1.5" markerEnd="url(#arrow)"
          />
        )}

        {/* → SageMaker */}
        {showSageMaker && (
          <line
            x1={ecsCX}
            y1={ecsY + 44}
            x2={sageMakerX + colW / 2}
            y2={serviceY - 1}
            stroke={C.sagemaker} strokeWidth="1.5" markerEnd="url(#arrow)"
          />
        )}

        {/* Bedrock + Guardrails */}
        <SvcBox x={bedrockX} y={serviceY} label="BEDROCK" sublabel="via PrivateLink" color={C.bedrock} />
        {has("GUARDRAILS") && (
          <>
            <line x1={bedrockX + colW / 2} y1={serviceY + 44} x2={bedrockX + colW / 2} y2={serviceY + 60}
              stroke={C.guardrail} strokeWidth="1.2" markerEnd="url(#arrow)" />
            <rect x={bedrockX} y={serviceY + 60} width={colW} height={28} rx="4"
              fill={C.guardrail + "15"} stroke={C.guardrail} strokeWidth="1.2" />
            <text x={bedrockX + colW / 2} y={serviceY + 77} textAnchor="middle" fontSize="8" fontWeight="700"
              fill={C.guardrail} fontFamily="monospace">GUARDRAILS</text>
          </>
        )}

        {/* OpenSearch */}
        {showOpenSearch && (
          <SvcBox x={openSearchX} y={serviceY} label="OPENSEARCH" sublabel="Serverless kNN" color={C.opensearch} />
        )}

        {/* Lambda (Agent Tools) */}
        {showLambda && showOpenSearch && (
          <>
            <line x1={openSearchX + colW / 2} y1={serviceY + 44} x2={openSearchX + colW / 2} y2={serviceY + 60}
              stroke={C.lambda} strokeWidth="1.2" markerEnd="url(#arrow)" />
            <rect x={openSearchX} y={serviceY + 60} width={colW} height={28} rx="4"
              fill={C.lambda + "15"} stroke={C.lambda} strokeWidth="1.2" />
            <text x={openSearchX + colW / 2} y={serviceY + 77} textAnchor="middle" fontSize="8" fontWeight="700"
              fill={C.lambda} fontFamily="monospace">LAMBDA</text>
          </>
        )}

        {/* SageMaker column */}
        {showSageMaker && (
          <SvcBox x={sageMakerX} y={serviceY} label="SAGEMAKER" sublabel={showCustomModel ? "Training Jobs" : "Evaluation"} color={C.sagemaker} />
        )}
        {showMLflow && showSageMaker && (
          <>
            <line x1={sageMakerX + colW / 2} y1={serviceY + 44} x2={sageMakerX + colW / 2} y2={serviceY + 60}
              stroke={C.mlflow} strokeWidth="1.2" markerEnd="url(#arrow)" />
            <rect x={sageMakerX} y={serviceY + 60} width={colW} height={28} rx="4"
              fill={C.mlflow + "15"} stroke={C.mlflow} strokeWidth="1.2" />
            <text x={sageMakerX + colW / 2} y={serviceY + 77} textAnchor="middle" fontSize="8" fontWeight="700"
              fill={C.mlflow} fontFamily="monospace">MLFLOW</text>
          </>
        )}

        {/* Shared services bottom bar */}
        <SharedBox x={14} label="CloudWatch Metrics" color={C.cw} />
        <SharedBox x={82} label="S3 Artifacts" color={C.s3} />
        <SharedBox x={150} label="SSM Config" color={C.shared} />
        <SharedBox x={218} label="KMS CMK" color={C.kms} />
        {showS3Trace && (
          <SharedBox x={W - 74} label="S3 Trace" color={C.opensearch} />
        )}

        {/* VPC endpoint label */}
        <text x={W - 10} y={totalH - 6} textAnchor="end" fontSize="7" fill={C.muted} fontFamily="system-ui">
          All traffic via VPC PrivateLink · No internet egress
        </text>
      </svg>
    </div>
  );
}

// ─── Step 3: Deploy ──────────────────────────────────────────────────────────

function StepDeploy({
  name, team, blockIds, useCaseId, isAgent, hasVectorStore, isMLOps,
  model, guardrail, systemPrompt, topK, onBack, onDeployed, onTest, onView,
}: any) {
  const [deploying, setDeploying] = useState(false);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const modelLabel = MODELS.find((m) => m.id === model)?.label.split(" (")[0] ?? model;
  const uc = getUseCaseById(useCaseId);

  const handleDeploy = async () => {
    setDeploying(true);
    const baseSteps = [
      `Provisioning ECS Fargate task definition — ${name}...`,
      "Registering IAM task role with least-privilege policies...",
      "Attaching KMS Customer Managed Key — data at rest encryption...",
      "Configuring VPC PrivateLink endpoints — Bedrock, S3, CloudWatch...",
      "Applying OSFI E-23 governance policies...",
      "Registering Application Inference Profile (AIP) with Bedrock...",
      `Activating guardrail profile: ${guardrail}...`,
      "Enabling CloudWatch cost attribution alarms...",
      "Registering SageMaker MLflow experiment...",
    ];
    const optionalSteps = [
      ...(hasVectorStore ? [
        "Connecting OpenSearch Serverless collection (VPC endpoint)...",
        "Registering Titan Embeddings v2 inference profile...",
      ] : []),
      ...(isAgent ? [
        "Initializing ReAct reasoning loop with step limits...",
        "Registering tool registry: knowledge_search, calculator, compliance_check...",
        "Activating agent token budget and kill-switch policies...",
        "Starting trajectory audit logger (S3)...",
      ] : []),
      ...(isMLOps ? [
        "Provisioning SageMaker execution role...",
        "Validating dataset S3 bucket with mandatory PII scan...",
      ] : []),
    ];
    const blockSteps = blockIds
      .filter((id: string) => !["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST"].includes(id))
      .map((id: string) => `Loading platform block: ${id}...`);
    const steps = [...baseSteps, ...optionalSteps, ...blockSteps, "✓ Application deployed successfully. All governance controls are active."];

    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 350));
      setLogs((prev) => [...prev, s]);
    }

    onDeployed({
      id: `app-${Date.now()}`, name, team, useCaseId, blockIds,
      model, modelLabel, guardrailProfile: guardrail,
      systemPrompt, topK: hasVectorStore ? topK : undefined,
      status: "Active", invocations: 0, avgLatencyMs: 0, totalCost: 0,
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
        {uc && (
          <div className="text-[12px] text-muted-foreground mb-3">
            Deployed as <span className="font-semibold text-foreground">{uc.name}</span>
          </div>
        )}
        <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
          Your application is live and fully governed. Every request is traced, costed, and guardrail-enforced automatically. OSFI E-23 policies are active and cannot be bypassed.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button onClick={onTest}
            className="px-4 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
            Test in Playground <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={onView}
            className="px-4 py-2 rounded border border-border bg-card text-[13px] font-medium hover:bg-muted inline-flex items-center gap-1.5">
            View All Apps <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div>
        <h2 className="text-[16px] font-semibold mb-4">Review Configuration</h2>
        <div className="panel divide-y divide-border">
          <ReviewRow label="Application Name" value={name} mono />
          <ReviewRow label="Team" value={team} />
          {uc && <ReviewRow label="Use Case" value={`${uc.id} — ${uc.name}`} />}
          <ReviewRow label="Composition" value={`${blockIds.length} blocks${isAgent ? " · Agent" : hasVectorStore ? " · RAG" : isMLOps ? " · MLOps" : " · Inference"}`} />
          <ReviewRow label="Model" value={modelLabel} />
          <ReviewRow label="Guardrail Profile" value={guardrail} />
          {hasVectorStore && <ReviewRow label="Top-K Retrieval" value={String(topK)} mono />}
        </div>

        <div className="mt-3 panel p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Selected Blocks ({blockIds.length})</div>
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
              <span><strong>Higher cost composition.</strong> Autonomous agents consume 3–15× more tokens per request. Cost alarms are auto-configured.</span>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-5">
          <BackBtn onClick={onBack} disabled={deploying} />
          <button onClick={handleDeploy} disabled={deploying}
            className="px-6 py-2.5 rounded bg-navy text-white text-[13px] font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
            {deploying
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Deploying...</>
              : <>🚀 Deploy Application <ArrowRight className="h-4 w-4" /></>
            }
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-[16px] font-semibold mb-4">Deployment Log</h2>
        <div className="panel bg-[#0b1220] text-[#a8e6a3] font-mono text-[11.5px] p-4 h-[420px] overflow-auto rounded">
          {logs.length === 0 && <div className="text-[#6b7280]">$ awaiting deployment trigger...</div>}
          {logs.map((l, i) => (
            <div key={i} className="animate-fade-in py-0.5">
              <span className="text-[#4b5563]">[{new Date().toLocaleTimeString()}]</span>{" "}
              <span className={l.startsWith("✓") ? "text-[#86efac]" : "text-[#a8e6a3]"}>{l}</span>
            </div>
          ))}
          {deploying && !done && <div className="text-[#fbbf24] animate-pulse">▍</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ConfigCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-border bg-card overflow-hidden shadow-sm">
      <div className="bg-muted/30 px-3 py-2 border-b border-border flex items-center gap-1.5">
        <Settings2 className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10.5px] font-bold font-mono text-foreground">{title}</span>
      </div>
      <div className="p-3 space-y-3">{children}</div>
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
      className="px-4 py-2 rounded border border-border bg-card text-[13px] font-medium hover:bg-muted disabled:opacity-50">
      ← Back
    </button>
  );
}
