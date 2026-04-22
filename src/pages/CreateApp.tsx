import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IaCGenerator } from "@/components/portal/IaCGenerator";
import { PageHeader } from "@/components/portal/PageHeader";
import {
  BUILDING_BLOCKS, GUARDRAIL_PROFILES, TEAMS, USE_CASES, TRACK_META,
  COMPLEXITY_COLOR, expandWithDependencies, getUseCaseById, type UseCase,
  REQUIRED_BLOCK_IDS,
} from "@/lib/mockData";
import { ArchDiagram } from "@/components/portal/ArchDiagram";
import { useApps } from "@/context/AppsContext";
import { cn } from "@/lib/utils";
import {
  Check, ChevronRight, Loader2, ShieldCheck, ArrowRight, Lock,
  Settings2, AlertTriangle,
} from "lucide-react";

// ─── Helper: get use case by id ───────────────────────────────────────────────
function ucById(id: string): UseCase | undefined {
  return USE_CASES.find((u) => u.id === id);
}

const STEPS = ["Use Case", "Compose", "Configure", "Deploy"];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addApp } = useApps();

  const preselectedUCId = (location.state as any)?.useCaseId as string | undefined;

  const [step, setStep] = useState(preselectedUCId ? 1 : 0);
  const [selectedUCId, setSelectedUCId] = useState<string>(preselectedUCId ?? "");
  const [name, setName] = useState("");
  const [team, setTeam] = useState(TEAMS[0]);

  // Block selection — start from use case recommended blocks if available
  const [selected, setSelected] = useState<string[]>(
    preselectedUCId ? (ucById(preselectedUCId)?.recommendedBlocks ?? []) : []
  );

  // Per-block config values: { [blockId]: { [fieldKey]: value } }
  const [blockConfigs, setBlockConfigs] = useState<Record<string, Record<string, any>>>({});

  const finalBlockIds = useMemo(() => expandWithDependencies(selected), [selected]);
  const isAgent = finalBlockIds.includes("AGENT_CORE");
  const hasVectorStore = finalBlockIds.includes("VECTORSTORE");
  const isMLOps = finalBlockIds.some((id) => ["FINE_TUNER", "EVAL_ENGINE", "DATA_PREP"].includes(id));

  function toggleBlock(id: string) {
    if (REQUIRED_BLOCK_IDS.includes(id)) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleUCSelect(ucId: string) {
    setSelectedUCId(ucId);
    const uc = ucById(ucId);
    if (uc) setSelected(uc.recommendedBlocks);
  }

  function setBlockConfig(blockId: string, fieldKey: string, value: any) {
    setBlockConfigs((prev) => ({
      ...prev,
      [blockId]: { ...(prev[blockId] ?? {}), [fieldKey]: value },
    }));
  }

  function getConfigValue(blockId: string, fieldKey: string, defaultVal: any) {
    return blockConfigs[blockId]?.[fieldKey] ?? defaultVal;
  }

  return (
    <>
      <PageHeader
        title="Create Application"
        subtitle="Select a use case to start with recommended blocks, or compose custom. Configure each block with your team's IAM roles, KMS keys, and service endpoints."
      />
      <Stepper step={step} />

      <div className="panel mt-5 p-6 min-h-[440px]">
        {step === 0 && (
          <StepUseCase
            selectedUCId={selectedUCId}
            onSelect={handleUCSelect}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepCompose
            selectedUCId={selectedUCId}
            selected={selected}
            finalBlockIds={finalBlockIds}
            toggleBlock={toggleBlock}
            isAgent={isAgent}
            name={name} setName={setName}
            team={team} setTeam={setTeam}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepConfigure
            finalBlockIds={finalBlockIds}
            getVal={getConfigValue}
            setVal={setBlockConfig}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepDeploy
            name={name} team={team} blockIds={finalBlockIds}
            useCaseId={selectedUCId}
            isAgent={isAgent} hasVectorStore={hasVectorStore} isMLOps={isMLOps}
            blockConfigs={blockConfigs}
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

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mt-4">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded border flex-1",
            i < step && "bg-success-soft border-success/30 text-success",
            i === step && "bg-info-soft border-primary text-primary",
            i > step && "bg-card border-border text-muted-foreground"
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0",
              i < step && "bg-success text-white border-success",
              i === step && "bg-primary text-white border-primary",
              i > step && "bg-card border-border"
            )}>
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span className="text-[12px] font-medium">{label}</span>
          </div>
          {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

// ─── Step 0: Use Case ─────────────────────────────────────────────────────────

function StepUseCase({ selectedUCId, onSelect, onNext }: {
  selectedUCId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold">Select a Use Case (optional)</h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Pick one to pre-load its recommended building blocks. You can adjust anything on the next step.
          </p>
        </div>
        <button onClick={onNext}
          className="px-4 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
          {selectedUCId ? "Next" : "Skip — Compose Custom"} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {USE_CASES.map((uc) => {
          const meta = TRACK_META[uc.track];
          const isSelected = selectedUCId === uc.id;
          return (
            <button
              key={uc.id}
              onClick={() => onSelect(isSelected ? "" : uc.id)}
              className={cn(
                "text-left panel p-3 transition-all border-2",
                isSelected ? "border-primary bg-info-soft/30" : "border-transparent hover:border-border"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={cn("text-[10px] font-semibold uppercase tracking-wide", meta.color)}>
                  {meta.label}
                </span>
                <div className="flex items-center gap-1">
                  <span className={cn("pill text-[9px]", COMPLEXITY_COLOR[uc.complexity])}>{uc.complexity}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground mb-0.5">{uc.id}</div>
              <div className="text-[13px] font-semibold mb-1">{uc.name}</div>
              <div className="text-[11px] text-muted-foreground leading-snug">{uc.tagline}</div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                {expandWithDependencies(uc.recommendedBlocks).length} blocks recommended
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1: Compose (blocks + live diagram) ──────────────────────────────────

function StepCompose({
  selectedUCId, selected, finalBlockIds, toggleBlock, isAgent,
  name, setName, team, setTeam, onBack, onNext,
}: any) {
  const uc = ucById(selectedUCId);

  const grouped = [
    "Foundation", "Governance", "Operations", "LLMOps",
    "Data & Retrieval", "AgentOps", "Evaluation", "MLOps",
  ].map((cat) => ({
    cat,
    blocks: BUILDING_BLOCKS.filter((b) => b.category === cat),
  })).filter((g) => g.blocks.length > 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold">Compose Building Blocks</h2>
          {uc ? (
            <p className="text-[12px] text-muted-foreground mt-1">
              Pre-loaded for <span className="font-semibold">{uc.name}</span>. Add or remove blocks as needed.
            </p>
          ) : (
            <p className="text-[12px] text-muted-foreground mt-1">
              Select the blocks your application needs. Required blocks cannot be removed.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <BackBtn onClick={onBack} />
          <button onClick={onNext}
            className="px-4 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
            Configure Blocks <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Left: block selection + identity */}
        <div className="col-span-5 space-y-4">
          {/* Identity inline */}
          <div className="panel p-4 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">App Identity</div>
            <Field label="Application Name" hint="Lowercase kebab-case, unique within your team.">
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. risk-analysis-agent"
                className="w-full px-3 py-2 border border-border rounded text-[13px] font-mono bg-background focus:outline-none focus:border-primary" />
            </Field>
            <Field label="Team">
              <select value={team} onChange={(e) => setTeam(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-[13px] bg-background focus:outline-none focus:border-primary">
                {TEAMS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {/* Block checklist */}
          <div>
            {grouped.map(({ cat, blocks }) => (
              <div key={cat} className="mb-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">{cat}</div>
                <div className="space-y-1.5">
                  {blocks.map((b) => {
                    const isReq = b.required;
                    const isSelected = finalBlockIds.includes(b.id);
                    const isAuto = isSelected && !isReq && !selected.includes(b.id);
                    return (
                      <label key={b.id} className={cn(
                        "flex items-start gap-2.5 p-2.5 rounded border transition-all",
                        isReq ? "cursor-not-allowed" : "cursor-pointer",
                        isSelected ? "border-primary/40 bg-info-soft/40" : "border-border bg-card hover:bg-muted/40"
                      )}>
                        <input type="checkbox" checked={isSelected} disabled={isReq}
                          onChange={() => toggleBlock(b.id)} className="mt-0.5 accent-primary" />
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
                                auto-included
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
            ))}
          </div>
        </div>

        {/* Right: live architecture diagram */}
        <div className="col-span-7">
          <div className="sticky top-4">
            <div className="panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[13px] font-semibold">Live Architecture Diagram</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Updates as you toggle blocks
                  </p>
                </div>
                <span className="pill bg-info-soft border-primary/30 text-primary font-mono text-[10px]">
                  {finalBlockIds.length} blocks · {isAgent ? "Agent" : "Pipeline"} mode
                </span>
              </div>
              <ArchDiagram ucId={selectedUCId} blockIds={finalBlockIds} />
            </div>

            {isAgent && (
              <div className="mt-3 panel p-3 bg-warning-soft border-warning/40">
                <div className="flex items-start gap-2 text-[12px] text-warning">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Agent composition — higher cost.</strong> Autonomous agents consume 3–15× more tokens per request than pipeline patterns. Cost alarms will be auto-configured.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Configure ────────────────────────────────────────────────────────

function StepConfigure({ finalBlockIds, getVal, setVal, onBack, onNext }: any) {
  const activeBlocks = BUILDING_BLOCKS.filter((b) => finalBlockIds.includes(b.id));
  const inputClass = "w-full px-2.5 py-1.5 border border-border rounded text-[12px] bg-background focus:outline-none focus:border-primary font-mono";

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold">Configure Each Block</h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Supply your team's IAM roles, KMS keys, service endpoints, and parameters. Required fields must be filled before deploying to production.
          </p>
        </div>
        <div className="flex gap-2">
          <BackBtn onClick={onBack} />
          <button onClick={onNext}
            className="px-4 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
            Review & Deploy <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeBlocks.map((block) => (
          <div key={block.id} className="panel overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 border-b border-border flex items-center gap-1.5">
              <Settings2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] font-bold font-mono">{block.name}</span>
              {block.required && (
                <span className="ml-auto pill text-[9px] bg-destructive-soft border-destructive/30 text-destructive">
                  <Lock className="h-2.5 w-2.5" /> Required
                </span>
              )}
            </div>
            <div className="p-3 space-y-3">
              {block.configFields.map((field) => {
                const val = getVal(block.id, field.key, field.defaultValue);
                return (
                  <div key={field.key}>
                    <label className="text-[11px] font-medium block mb-1">{field.label}</label>
                    {field.type === "select" && (
                      <select value={val} onChange={(e) => setVal(block.id, field.key, e.target.value)} className={inputClass}>
                        {field.options!.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    )}
                    {field.type === "text" && (
                      <input type="text" value={val}
                        onChange={(e) => setVal(block.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={inputClass} />
                    )}
                    {field.type === "textarea" && (
                      <textarea value={val}
                        onChange={(e) => setVal(block.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className={inputClass + " resize-y"} />
                    )}
                    {field.type === "range" && (
                      <div>
                        <input type="range" min={field.min} max={field.max} value={val}
                          onChange={(e) => setVal(block.id, field.key, Number(e.target.value))}
                          className="w-full accent-primary" />
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-0.5">
                          <span>{field.min}</span>
                          <span className="font-semibold text-foreground">{val}</span>
                          <span>{field.max}</span>
                        </div>
                      </div>
                    )}
                    {field.hint && (
                      <div className="text-[10.5px] text-muted-foreground mt-1 leading-snug">{field.hint}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Deploy ───────────────────────────────────────────────────────────

function StepDeploy({
  name, team, blockIds, useCaseId, isAgent, hasVectorStore, isMLOps,
  blockConfigs, onBack, onDeployed, onTest, onView,
}: any) {
  const [deploying, setDeploying] = useState(false);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const uc = useCaseId ? ucById(useCaseId) : undefined;

  const modelId = blockConfigs?.MODEL?.modelId ?? "claude-3-5-sonnet";
  const modelLabel = modelId.includes("haiku") ? "Claude 3 Haiku" : modelId.includes("sonnet") ? "Claude 3.5 Sonnet" : modelId;
  const guardrailProfile = blockConfigs?.GUARDRAILS?.profile ?? "Internal";

  const handleDeploy = async () => {
    setDeploying(true);
    const steps = [
      `Provisioning ECS Fargate task — ${name || "unnamed-app"}...`,
      "Registering team IAM task role and attaching policies...",
      "Configuring KMS Customer Managed Key — data at rest + in transit...",
      "Establishing VPC PrivateLink endpoints — Bedrock, S3, CloudWatch, SSM...",
      "Applying OSFI E-23 governance policies...",
      "Registering Application Inference Profile (AIP) with Bedrock...",
      `Activating Bedrock Guardrail — profile: ${guardrailProfile}...`,
      "Enabling per-team CloudWatch cost attribution and alarms...",
      "Registering SageMaker MLflow experiment...",
      ...(hasVectorStore ? [
        "Connecting OpenSearch Serverless collection via VPC endpoint...",
        "Validating Titan Embeddings v2 inference profile...",
      ] : []),
      ...(isAgent ? [
        "Initializing ReAct reasoning loop — step limits configured...",
        "Registering tool registry with IAM permission scoping...",
        "Activating agent token budget and kill-switch policies...",
        "Starting trajectory audit logger — writing to team S3 bucket...",
      ] : []),
      ...(isMLOps ? [
        "Provisioning SageMaker execution role...",
        "Validating dataset S3 bucket for PII scan compliance...",
      ] : []),
      ...blockIds
        .filter((id: string) => !["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST"].includes(id))
        .map((id: string) => `Loading platform block: ${id}...`),
      "✓ Application deployed. All governance controls are active.",
    ];

    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 320));
      setLogs((prev) => [...prev, s]);
    }

    onDeployed({
      id: `app-${Date.now()}`,
      name: name || "unnamed-app",
      team, useCaseId, blockIds,
      model: modelId, modelLabel,
      guardrailProfile,
      status: "Active", invocations: 0, avgLatencyMs: 0, totalCost: 0,
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-3xl mx-auto py-8 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-success-soft border-2 border-success flex items-center justify-center mb-4">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
          <h2 className="text-xl font-semibold text-success flex items-center gap-2">
            Starter Kit Generated
          </h2>
          <div className="font-mono text-[16px] font-semibold mt-2">{name}</div>
          <p className="text-muted-foreground text-[13px] mt-2 max-w-lg mx-auto">
            The platform has validated your architecture against enterprise principles and generated your AWS CDK scaffold. Hand this off to the DevOps cell for deployment.
          </p>
        </div>
        
        {/* The Magic: */}
        <IaCGenerator appName={name} blockIds={blockIds} />
        
        <div className="flex justify-center gap-3 mt-8">
          <button onClick={onTest}
            className="px-4 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
            Open Guardrail Simulator <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={onView}
            className="px-4 py-2 rounded border border-border bg-card text-[13px] font-medium hover:bg-muted inline-flex items-center gap-1.5">
            View Fleet Dashboard <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div>
        <h2 className="text-[15px] font-semibold mb-4">Review</h2>
        <div className="panel divide-y divide-border mb-4">
          <ReviewRow label="App Name" value={name || "—"} mono />
          <ReviewRow label="Team" value={team} />
          {uc && <ReviewRow label="Use Case" value={`${uc.id} — ${uc.name}`} />}
          <ReviewRow label="Blocks" value={`${blockIds.length} total`} />
          <ReviewRow label="Model" value={modelLabel} />
          <ReviewRow label="Guardrail Profile" value={guardrailProfile} />
        </div>

        <div className="panel p-3 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Selected Blocks</div>
          <div className="flex flex-wrap gap-1">
            {blockIds.map((id: string) => (
              <span key={id} className="pill bg-info-soft border-primary/30 text-primary font-mono text-[10px]">{id}</span>
            ))}
          </div>
        </div>

        <div className="panel p-3 bg-info-soft/40 border-primary/30 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-semibold">Platform Governance — Always Active</span>
          </div>
          {["OSFI E-23 compliance enforced", "Application Inference Profile required", "PII detection + injection blocking", "Per-team cost attribution + alarms", "All requests traced and logged"].map((l) => (
            <div key={l} className="flex items-center gap-1.5 text-[11px] py-0.5">
              <Check className="h-3 w-3 text-success shrink-0" /> {l}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <BackBtn onClick={onBack} disabled={deploying} />
          <button onClick={handleDeploy} disabled={deploying}
            className="px-5 py-2.5 rounded bg-navy text-white text-[13px] font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
            {deploying
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Deploying...</>
              : <>🚀 Deploy Application <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>

      {/* Deployment log */}
      <div>
        <h2 className="text-[15px] font-semibold mb-4">Deployment Log</h2>
        <div className="panel bg-[#0b1220] text-[#a8e6a3] font-mono text-[11.5px] p-4 h-[400px] overflow-auto rounded">
          {logs.length === 0 && <div className="text-[#4b5563]">$ awaiting deployment trigger...</div>}
          {logs.map((l, i) => (
            <div key={i} className="animate-fade-in py-0.5">
              <span className="text-[#4b5563]">[{new Date().toLocaleTimeString()}]</span>{" "}
              <span className={l.startsWith("✓") ? "text-[#86efac] font-semibold" : "text-[#a8e6a3]"}>{l}</span>
            </div>
          ))}
          {deploying && !done && <div className="text-[#fbbf24] animate-pulse">▍</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({ label, hint, children }: any) {
  return (
    <div>
      <div className="text-[11px] font-medium mb-1">{label}</div>
      {children}
      {hint && <div className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug">{hint}</div>}
    </div>
  );
}

function ReviewRow({ label, value, mono }: any) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-foreground text-right", mono && "font-mono font-medium")}>{value}</span>
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