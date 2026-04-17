import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import { useApps } from "@/context/AppsContext";
import { isAgentApp } from "@/lib/mockData";
import { Send, ShieldCheck, ShieldAlert, ChevronDown, ChevronRight, FileText, Cpu, Clock, Coins, Database } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "pipeline" | "agent" | "compare";

interface Message {
  role: "user" | "assistant" | "blocked";
  content: string;
  blockedReason?: string;
  blockedKind?: "PII" | "Injection";
}

interface Telemetry {
  cost: number; latencyMs: number; inTokens: number; outTokens: number;
  guardrails: { pii: boolean; injection: boolean; output: boolean; reason?: string };
  agentSteps?: number;
  agentCost?: number; agentTokens?: number;
}

const INITIAL_MESSAGES: Message[] = [
  { role: "user", content: "What are the current margin requirements for equity derivatives under OSFI E-23?" },
  {
    role: "assistant",
    content:
      "Based on retrieved documents from the BMO risk knowledge base: Equity derivative margin requirements under OSFI E-23 guideline B-7 require initial margin of 8–12% of notional value depending on counterparty credit rating. Variation margin is settled daily via VM-CSA. For investment-grade counterparties (≥BBB-), the 8% floor applies; sub-investment grade requires 12% plus a 2% liquidity add-on. [trace_id: abc-1234]",
  },
];

const INITIAL_TELEMETRY: Telemetry = {
  cost: 0.0042, latencyMs: 1243, inTokens: 1847, outTokens: 312,
  guardrails: { pii: true, injection: true, output: true },
};

const SIN_REGEX = /\b\d{3}-?\d{3}-?\d{3}\b/;

function detectBlock(text: string): { blocked: boolean; kind?: "PII" | "Injection"; reason?: string } {
  const lower = text.toLowerCase();
  if (lower.includes("ignore previous") || lower.includes("ignore prior")) {
    return { blocked: true, kind: "Injection", reason: "Prompt injection pattern detected (instruction override)" };
  }
  if (lower.includes("sin") || lower.includes("ssn") || SIN_REGEX.test(text)) {
    return { blocked: true, kind: "PII", reason: "SIN/SSN pattern detected — request blocked before invocation" };
  }
  return { blocked: false };
}

function mockResponse(q: string, app: any): string {
  const variants = [
    `Based on retrieved BMO knowledge base documents and ${app?.modelLabel ?? "Claude 3.7 Sonnet"} reasoning: ${q.slice(0, 60)}... Per OSFI Guideline E-23, internal model risk policies require validation evidence for all consumer-facing decisions. Recommended action: route to human reviewer if confidence < 0.85. [trace_id: ${Math.random().toString(36).slice(2, 8)}]`,
    `Retrieved 5 relevant chunks from osfi-e23-guidelines-2024.pdf and bmo-risk-framework-v3.pdf. Summary: BMO policy requires capital adequacy ratio above 10.5% Tier 1 plus a 2.5% conservation buffer. Counterparty exposures are netted under ISDA master agreements where enforceable. [trace_id: ${Math.random().toString(36).slice(2, 8)}]`,
    `Per BMO Compliance Framework v3.2: this query falls under category "Internal Risk Inquiry". Response grounded in 3 retrieved documents. No PII detected, no policy violations. Audit trace persisted to MLflow. [trace_id: ${Math.random().toString(36).slice(2, 8)}]`,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export default function Playground() {
  const [params] = useSearchParams();
  const { apps } = useApps();
  const presetApp = params.get("app");
  const [appId, setAppId] = useState(presetApp ?? apps[0]?.id ?? "");
  useEffect(() => { if (presetApp) setAppId(presetApp); }, [presetApp]);

  const app = useMemo(() => apps.find((a) => a.id === appId) ?? apps[0], [apps, appId]);

  const [mode, setMode] = useState<Mode>("pipeline");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [telemetry, setTelemetry] = useState<Telemetry>(INITIAL_TELEMETRY);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);

    const block = detectBlock(text);
    if (block.blocked) {
      await new Promise((r) => setTimeout(r, 250));
      setMessages((m) => [...m, { role: "blocked", content: "⚠ Request blocked by guardrails", blockedReason: block.reason, blockedKind: block.kind }]);
      setTelemetry({
        cost: 0, latencyMs: 38, inTokens: 0, outTokens: 0,
        guardrails: {
          pii: block.kind !== "PII", injection: block.kind !== "Injection", output: true,
          reason: block.reason,
        },
      });
      return;
    }

    setSending(true);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 800));
    const reply = mockResponse(text, app);
    setMessages((m) => [...m, { role: "assistant", content: reply }]);

    const inTok = 1500 + Math.floor(Math.random() * 800);
    const outTok = 200 + Math.floor(Math.random() * 250);
    const cost = ((inTok * 0.000003) + (outTok * 0.000015));
    const latency = 800 + Math.floor(Math.random() * 1500);
    const isAgent = (app && isAgentApp(app)) || mode !== "pipeline";

    setTelemetry({
      cost, latencyMs: latency, inTokens: inTok, outTokens: outTok,
      guardrails: { pii: true, injection: true, output: true },
      agentSteps: isAgent ? 7 : undefined,
      agentCost: isAgent ? cost * 4.2 : undefined,
      agentTokens: isAgent ? (inTok + outTok) * 4 : undefined,
    });
    setSending(false);
  };

  if (!app) {
    return (
      <>
        <PageHeader title="Playground" subtitle="No deployed applications yet." />
        <div className="panel p-8 text-center text-muted-foreground">Deploy an application first.</div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Playground"
        subtitle="Interactively test deployed applications. All requests pass through production guardrails."
        actions={
          <>
            <select value={appId} onChange={(e) => setAppId(e.target.value)}
              className="px-3 py-1.5 border border-border rounded text-[12.5px] bg-card font-mono">
              {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <div className="flex border border-border rounded overflow-hidden text-[12px]">
              {(["pipeline", "agent", "compare"] as Mode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={cn("px-3 py-1.5 capitalize", mode === m ? "bg-navy text-white" : "bg-card hover:bg-muted")}>
                  {m === "compare" ? "Compare Both" : `${m} Mode`}
                </button>
              ))}
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-180px)]">
        {/* CHAT */}
        <div className="panel flex flex-col lg:col-span-3 min-h-0">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-semibold">Chat</h2>
              <span className="pill bg-info-soft border-primary/30 text-primary font-mono">{app.name}</span>
              <span className="pill bg-muted border-border text-foreground font-mono text-[10px]">{app.blockIds.length} blocks</span>
              <span className="pill bg-muted border-border text-muted-foreground">{app.modelLabel}</span>
              <span className="pill bg-muted border-border text-muted-foreground">{app.guardrailProfile}</span>
            </div>
          </div>

          <div ref={threadRef} className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <ChatBubble key={i} m={m} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-muted-foreground text-[12px]">
                <div className="flex gap-1">
                  <Dot /><Dot delay={0.15} /><Dot delay={0.3} />
                </div>
                Generating response...
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 flex items-center gap-2">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Send a message..."
              className="flex-1 px-3 py-2 border border-border rounded text-[13px] bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={send} disabled={sending || !input.trim()}
              className="px-3.5 py-2 rounded bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 inline-flex items-center gap-1.5 text-[13px] font-medium">
              <Send className="h-3.5 w-3.5" /> Send
            </button>
          </div>
        </div>

        {/* TELEMETRY */}
        <div className="panel flex flex-col lg:col-span-2 min-h-0 overflow-auto">
          <div className="panel-header">
            <h2 className="text-[14px] font-semibold">Request Telemetry</h2>
            <span className="pill bg-success-soft border-success/30 text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" /> live
            </span>
          </div>

          <div className="p-4 space-y-4">
            {mode === "compare" ? (
              <CompareGrid t={telemetry} />
            ) : (
              <StatGrid t={telemetry} app={app} />
            )}

            {/* Guardrails */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Guardrails
              </div>
              <div className="space-y-1.5">
                <GuardrailRow label="PII Detection" ok={telemetry.guardrails.pii} reason={!telemetry.guardrails.pii ? telemetry.guardrails.reason : undefined} />
                <GuardrailRow label="Injection Blocking" ok={telemetry.guardrails.injection} reason={!telemetry.guardrails.injection ? telemetry.guardrails.reason : undefined} />
                <GuardrailRow label="Output Scan" ok={telemetry.guardrails.output} okText="Clean" />
                <div className="flex items-center justify-between text-[12px] px-2.5 py-1.5 rounded bg-muted/50">
                  <span className="text-muted-foreground">Guardrail Profile</span>
                  <span className="font-medium">{app.guardrailProfile}</span>
                </div>
              </div>
            </div>

            {/* Retrieved Context */}
            <div>
              <button onClick={() => setShowContext((s) => !s)}
                className="w-full flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-1.5"><Database className="h-3 w-3" /> Retrieved Context</span>
                {showContext ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
              {showContext && (
                <div className="mt-2 space-y-2">
                  <ContextChunk source="osfi-e23-guidelines-2024.pdf" chunk="47" score={0.892}
                    text="Section 4.2: Initial margin requirements for equity derivative positions held by federally regulated financial institutions shall be no less than 8% of notional value..." />
                  <ContextChunk source="bmo-risk-framework-v3.pdf" chunk="12" score={0.847}
                    text="BMO internal policy mandates a 2% liquidity surcharge on all sub-investment-grade counterparty exposures, calculated daily and posted to VM-CSA..." />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ChatBubble({ m }: { m: Message }) {
  if (m.role === "blocked") {
    return (
      <div className="rounded border border-destructive/40 bg-destructive-soft p-3 text-[13px] animate-fade-in">
        <div className="flex items-center gap-2 text-destructive font-semibold mb-1">
          <ShieldAlert className="h-4 w-4" /> {m.content}
        </div>
        {m.blockedReason && <div className="text-[12px] text-destructive/90">Reason: {m.blockedReason}</div>}
      </div>
    );
  }
  if (m.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[80%] rounded-lg rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2.5 text-[13px] leading-relaxed">
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded bg-navy text-white text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">AI</div>
      <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-muted px-3.5 py-2.5 text-[13px] leading-relaxed border border-border">
        {m.content}
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: `${delay}s` }} />;
}

function StatGrid({ t, app }: { t: Telemetry; app: any }) {
  const high = t.cost > 0.01;
  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat icon={Coins} label="Total Cost" value={`$${t.cost.toFixed(4)}`} highlight={high} />
      <Stat icon={Clock} label="Latency" value={`${t.latencyMs.toLocaleString()}ms`} />
      <Stat icon={Cpu} label="Input Tokens" value={t.inTokens.toLocaleString()} />
      <Stat icon={Cpu} label="Output Tokens" value={t.outTokens.toLocaleString()} />
      <Stat icon={Cpu} label="Total Tokens" value={(t.inTokens + t.outTokens).toLocaleString()} />
      <Stat icon={FileText} label="Model" value={app.modelLabel} small />
      {t.agentSteps && <Stat icon={Cpu} label="Reasoning Steps" value={`${t.agentSteps} steps`} />}
    </div>
  );
}

function CompareGrid({ t }: { t: Telemetry }) {
  const pipelineCost = t.cost;
  const agentCost = t.agentCost ?? t.cost * 4.2;
  const diff = (((agentCost - pipelineCost) / pipelineCost) * 100).toFixed(0);
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="panel p-3 border-pattern-p1/40 bg-[hsl(var(--pattern-p1)/0.05)]">
        <div className="text-[10px] uppercase tracking-wider text-pattern-p1 font-semibold mb-2">Pipeline</div>
        <div className="space-y-1.5 text-[12px]">
          <Row label="Cost" value={`$${pipelineCost.toFixed(4)}`} />
          <Row label="Tokens" value={(t.inTokens + t.outTokens).toLocaleString()} />
          <Row label="Latency" value={`${t.latencyMs}ms`} />
          <Row label="LLM Calls" value="1" />
        </div>
      </div>
      <div className="panel p-3 border-pattern-p5/40 bg-[hsl(var(--pattern-p5)/0.05)]">
        <div className="text-[10px] uppercase tracking-wider text-pattern-p5 font-semibold mb-2">Agent</div>
        <div className="space-y-1.5 text-[12px]">
          <Row label="Cost" value={`$${agentCost.toFixed(4)}`} highlight />
          <Row label="Tokens" value={(t.agentTokens ?? (t.inTokens + t.outTokens) * 4).toLocaleString()} />
          <Row label="Latency" value={`${t.latencyMs * 4}ms`} />
          <Row label="Reasoning" value="7 steps" />
        </div>
      </div>
      <div className="col-span-2 pill bg-warning-soft border-warning/40 text-warning justify-center">
        Agent costs +{diff}% vs pipeline for the same query
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-medium", highlight && "text-warning")}>{value}</span>
    </div>
  );
}

function Stat({ icon: Icon, label, value, highlight, small }: any) {
  return (
    <div className={cn("panel p-2.5", highlight && "border-warning/50 bg-warning-soft/50")}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={cn("font-mono font-semibold", small ? "text-[12px]" : "text-[15px]", highlight && "text-warning")}>{value}</div>
    </div>
  );
}

function GuardrailRow({ label, ok, reason, okText = "Pass" }: any) {
  return (
    <div className={cn("flex items-center justify-between text-[12px] px-2.5 py-1.5 rounded border",
      ok ? "bg-success-soft/50 border-success/30" : "bg-destructive-soft border-destructive/40")}>
      <span className={cn(ok ? "text-foreground" : "text-destructive font-medium")}>{label}</span>
      <span className={cn("font-medium", ok ? "text-success" : "text-destructive")}>
        {ok ? `✓ ${okText === "Pass" ? `No ${label.toLowerCase().replace("blocking", "attempt").replace(" detection", "")}` : okText}` : `✗ ${reason ?? "Blocked"}`}
      </span>
    </div>
  );
}

function ContextChunk({ source, chunk, score, text }: any) {
  return (
    <div className="rounded border border-border bg-muted/40 p-2.5">
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="font-mono text-foreground">{source}</span>
        <span className="text-muted-foreground">chunk {chunk} · score {score}</span>
      </div>
      <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-3">{text}</p>
    </div>
  );
}
