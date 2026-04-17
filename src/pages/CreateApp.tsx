import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import { PatternBadge } from "@/components/portal/PatternBadge";
import { BUILDING_BLOCKS, GUARDRAIL_PROFILES, MODELS, PATTERNS, Pattern, PatternId, TEAMS, patternAccentClass } from "@/lib/mockData";
import { useApps } from "@/context/AppsContext";
import { Check, ChevronRight, Loader2, ShieldCheck, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Identity", "Pattern", "Configure", "Deploy"];

export default function CreateApp() {
  const [params] = useSearchParams();
  const presetPattern = params.get("pattern") as PatternId | null;
  const navigate = useNavigate();
  const { addApp } = useApps();

  const [step, setStep] = useState(presetPattern ? 2 : 0);
  const [name, setName] = useState("");
  const [team, setTeam] = useState(TEAMS[0]);
  const [pattern, setPattern] = useState<PatternId | null>(presetPattern);
  const [model, setModel] = useState(MODELS[1].id);
  const [guardrail, setGuardrail] = useState("Internal Only");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a BMO financial assistant. Answer only questions related to {context}. Do not speculate beyond retrieved documents."
  );
  const [topK, setTopK] = useState(5);

  const selectedPattern = useMemo(() => PATTERNS.find((p) => p.id === pattern) ?? null, [pattern]);
  const hasVectorStore = !!selectedPattern?.blockIds.includes("VECTORSTORE");

  return (
    <>
      <PageHeader
        title="Create Application"
        subtitle="Deploy a new governed AI application. All steps enforce OSFI E-23 model registry policies."
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
          <StepPattern
            pattern={pattern} setPattern={setPattern}
            onBack={() => setStep(0)} onNext={() => pattern && setStep(2)}
          />
        )}
        {step === 2 && selectedPattern && (
          <StepConfigure
            pattern={selectedPattern}
            hasVectorStore={hasVectorStore}
            model={model} setModel={setModel}
            guardrail={guardrail} setGuardrail={setGuardrail}
            systemPrompt={systemPrompt} setSystemPrompt={setSystemPrompt}
            topK={topK} setTopK={setTopK}
            onBack={() => setStep(1)} onNext={() => setStep(3)}
          />
        )}
        {step === 3 && selectedPattern && (
          <StepDeploy
            name={name} team={team} pattern={selectedPattern}
            model={model} guardrail={guardrail} systemPrompt={systemPrompt} topK={topK}
            hasVectorStore={hasVectorStore}
            onBack={() => setStep(2)}
            onDeployed={(app) => {
              addApp(app);
            }}
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
          {TEAMS.map((t) => <option key={t}>{t}</option>)}
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

function StepPattern({ pattern, setPattern, onBack, onNext }: any) {
  const selected = PATTERNS.find((p) => p.id === pattern);
  return (
    <div className="space-y-5 animate-fade-in">
      <h2 className="text-[16px] font-semibold">Choose a Reference Pattern</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PATTERNS.map((p) => {
          const c = patternAccentClass(p.id);
          const active = pattern === p.id;
          return (
            <button key={p.id} onClick={() => setPattern(p.id)}
              className={cn("text-left panel p-4 transition-all hover:shadow-sm border-l-4", c.border,
                active && "ring-2 ring-primary border-primary bg-info-soft/40")}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PatternBadge id={p.id} />
                  <span className="text-[14px] font-semibold">{p.name}</span>
                </div>
                {active && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-[12px] text-muted-foreground line-clamp-3">{p.description}</p>
              <div className="flex gap-3 mt-3 text-[11px] text-muted-foreground">
                <span><span className="font-mono font-semibold text-foreground">{p.blocks}</span> blocks</span>
                <span><span className="font-mono font-semibold text-foreground">{p.llmCalls}</span> LLM calls</span>
                <span>Complexity: <span className="font-semibold text-foreground">{p.complexity}</span></span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="panel p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Building blocks for {selected.id}</div>
          <div className="flex flex-wrap gap-1.5">
            {selected.blockIds.map((id) => {
              const b = BUILDING_BLOCKS.find((x) => x.id === id);
              return (
                <span key={id} className="pill bg-info-soft border-primary/30 text-primary font-mono">
                  <Check className="h-3 w-3" /> {b?.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-3">
        <BackBtn onClick={onBack} />
        <button disabled={!pattern} onClick={onNext}
          className="px-5 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 inline-flex items-center gap-1.5">
          Next <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function StepConfigure({ pattern, hasVectorStore, model, setModel, guardrail, setGuardrail, systemPrompt, setSystemPrompt, topK, setTopK, onBack, onNext }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-5">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold">Configure</h2>
          <PatternBadge id={pattern.id} />
          <span className="text-[12px] text-muted-foreground">{pattern.name}</span>
        </div>

        <Field label="Foundation Model" hint="Restricted to OSFI E-23 approved models.">
          <select value={model} onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-[13px] bg-background">
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </Field>

        <Field label="Guardrail Profile" hint="Determines PII detection strictness and allowed data classifications.">
          <select value={guardrail} onChange={(e) => setGuardrail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-[13px] bg-background">
            {GUARDRAIL_PROFILES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </Field>

        <Field label="System Prompt" hint="Grounding instructions enforced on every request.">
          <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-border rounded text-[13px] font-mono bg-background resize-y" />
        </Field>

        {hasVectorStore && (
          <Field label={`Top-K Retrieved Documents: ${topK}`} hint="Number of document chunks injected as context.">
            <input type="range" min={1} max={10} value={topK} onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
              <span>1</span><span>5</span><span>10</span>
            </div>
          </Field>
        )}

        <div className="flex justify-between pt-3">
          <BackBtn onClick={onBack} />
          <button onClick={onNext}
            className="px-5 py-2 rounded bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary-hover inline-flex items-center gap-1.5">
            Next <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="panel p-4 sticky top-2 bg-info-soft/40 border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-[13px] font-semibold">Governance Summary</h3>
          </div>
          <ul className="space-y-2 text-[12px]">
            {[
              "OSFI E-23 model registry enforced",
              `Guardrail profile: ${guardrail}`,
              "All invocations require Application Inference Profile (AIP)",
              "PII detection: active (8 entity types)",
              "Prompt injection blocking: active",
              "Per-team cost attribution: enabled",
              "Audit trace: every request logged to MLflow",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StepDeploy({ name, team, pattern, model, guardrail, systemPrompt, topK, hasVectorStore, onBack, onDeployed, onTest, onView }: any) {
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
    const agentSteps = pattern.id === "P5" ? [
      "Registering agent tools...",
      "Starting trajectory logger...",
    ] : [];
    const steps = [...baseSteps, ...agentSteps, "✓ Application deployed successfully."];

    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 500));
      setLogs((prev) => [...prev, s]);
    }

    onDeployed({
      id: `app-${Date.now()}`,
      name, team, pattern: pattern.id,
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
          <ReviewRow label="Pattern" value={<><PatternBadge id={pattern.id} /> {pattern.name}</>} />
          <ReviewRow label="Model" value={modelLabel} />
          <ReviewRow label="Guardrail Profile" value={guardrail} />
          {hasVectorStore && <ReviewRow label="Top-K Retrieval" value={String(topK)} mono />}
          <ReviewRow label="System Prompt" value={<span className="text-[11px] font-mono text-muted-foreground line-clamp-3">{systemPrompt}</span>} />
        </div>

        {pattern.id === "P5" && (
          <div className="mt-4 panel p-3 bg-warning-soft border-warning/40">
            <div className="flex items-start gap-2 text-[12px] text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span><strong>Higher cost pattern.</strong> Autonomous agents consume 3–15× more tokens. Cost alarms will be auto-configured.</span>
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
        <div className="panel bg-[#0b1220] text-[#a8e6a3] font-mono text-[12px] p-4 h-[360px] overflow-auto">
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
      <label className="block text-[12px] font-medium text-foreground mb-1">{label}</label>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
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
