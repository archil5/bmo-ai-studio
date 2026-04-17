export type PatternId = "P1" | "P2" | "P4" | "P5" | "P6" | "P7";

export interface BuildingBlock {
  id: string;
  name: string;
  category: "Foundation" | "Governance" | "Operations" | "Prompt Management" | "Data & Retrieval" | "LLMOps" | "AgentOps" | "Evaluation" | "Model Customization";
  required: boolean;
  description: string;
  /** Blocks this one depends on. Adding it auto-adds these. */
  requires?: string[];
}

export const BUILDING_BLOCKS: BuildingBlock[] = [
  // Foundation
  { id: "CORE", name: "CORE", category: "Foundation", required: true, description: "Configuration management, structured logging, OSFI E-23 model registry, error handling, distributed cache." },
  { id: "MODEL", name: "MODEL", category: "Foundation", required: true, description: "Amazon Bedrock invocation with mandatory Application Inference Profiles (AIPs) for cost attribution and guardrail enforcement.", requires: ["CORE"] },
  
  // Governance & Operations
  { id: "GUARDRAILS", name: "GUARDRAILS", category: "Governance", required: true, description: "PII detection (8 entity types), prompt injection blocking (5 attack categories), configurable profiles (Public / Internal / Confidential).", requires: ["MODEL"] },
  { id: "OBSERVE", name: "OBSERVE", category: "Operations", required: true, description: "End-to-end request tracing, Amazon CloudWatch metrics emission, SageMaker MLflow experiment logging.", requires: ["CORE"] },
  { id: "COST", name: "COST", category: "Operations", required: true, description: "Real-time token counting, per-model pricing, per-team cost attribution with CloudWatch cost alarms.", requires: ["MODEL"] },
  
  // Prompt Management
  { id: "PROMPT_HUB", name: "PROMPT HUB", category: "Prompt Management", required: false, description: "Centralized, version-controlled prompt registry. Enables A/B testing, dynamic injection, and mandatory compliance approval workflows.", requires: ["CORE"] },
  
  // Data & Retrieval
  { id: "VECTORSTORE", name: "VECTORSTORE", category: "Data & Retrieval", required: false, description: "Amazon OpenSearch Serverless client, Titan Embeddings v2 integration, kNN semantic search, document ingestion pipeline.", requires: ["CORE"] },
  
  // LLMOps & AgentOps
  { id: "PIPELINE", name: "PIPELINE", category: "LLMOps", required: false, description: "RAG pipeline orchestration with developer hook system (pre_query, post_retrieval, post_response). Deterministic, 1 LLM call per request.", requires: ["MODEL", "GUARDRAILS"] },
  { id: "AGENT_CORE", name: "AGENT CORE", category: "AgentOps", required: false, description: "ReAct (Reason + Act) autonomous reasoning loop. Non-deterministic, 3–15+ LLM calls per request. Extends LLMOps layer.", requires: ["MODEL", "GUARDRAILS"] },
  { id: "AGENT_TOOLS", name: "AGENT TOOLS", category: "AgentOps", required: false, description: "Tool registry with permission scoping, sandboxed executor, 3 built-in tools: knowledge_search, calculator, compliance_check.", requires: ["AGENT_CORE"] },
  { id: "AGENT_GUARDRAILS", name: "AGENT GUARDRAILS", category: "AgentOps", required: false, description: "Token budget enforcement, action boundary policies, emergency kill switch, step-count limits to prevent runaway agents.", requires: ["AGENT_CORE"] },
  { id: "AGENT_TRACE", name: "AGENT TRACE", category: "AgentOps", required: false, description: "Full agent trajectory logging — every ReAct step, tool call, and reasoning trace captured for OSFI audit trail.", requires: ["AGENT_CORE", "OBSERVE"] },

  // Evaluation & Customization
  { id: "EVAL_ENGINE", name: "EVAL ENGINE", category: "Evaluation", required: false, description: "Automated offline & online evaluation suite. Runs RAGAS metrics (faithfulness, answer relevance), LLM-as-a-judge, and shadow testing.", requires: ["OBSERVE", "MODEL"] },
  { id: "DATA_PREP", name: "DATA PREP", category: "Model Customization", required: false, description: "Dataset curation pipeline. Auto-generates synthetic data, formats to JSONL, and enforces mandatory PII scrubbing before training.", requires: ["CORE", "GUARDRAILS"] },
  { id: "FINE_TUNER", name: "FINE TUNER", category: "Model Customization", required: false, description: "Managed PEFT/LoRA fine-tuning jobs on Amazon Bedrock Custom Models. Creates strictly isolated, team-specific model weights.", requires: ["DATA_PREP", "EVAL_ENGINE", "MODEL"] },
];

export const REQUIRED_BLOCK_IDS = BUILDING_BLOCKS.filter((b) => b.required).map((b) => b.id);

/** Recursively expand a selection to include all dependencies. */
export function expandWithDependencies(selected: string[]): string[] {
  const set = new Set<string>([...REQUIRED_BLOCK_IDS, ...selected]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(set)) {
      const b = BUILDING_BLOCKS.find((x) => x.id === id);
      b?.requires?.forEach((r) => {
        if (!set.has(r)) { set.add(r); changed = true; }
      });
    }
  }
  // preserve canonical order from BUILDING_BLOCKS
  return BUILDING_BLOCKS.filter((b) => set.has(b.id)).map((b) => b.id);
}

export const TEAMS = [
  "PCB Retail",
  "PCB Lending",
  "Risk & Trading",
  "Compliance & Legal",
  "Capital Markets",
  "Wealth Management",
  "BMO Harris",
  "Enterprise Technology",
];

export const MODELS = [
  { id: "claude-3-haiku", label: "Claude 3 Haiku (Fast / Low Cost)" },
  { id: "claude-3-7-sonnet", label: "Claude 3.7 Sonnet (Balanced / Recommended)" },
];

export const GUARDRAIL_PROFILES = [
  { id: "Public", label: "Public" },
  { id: "Internal Only", label: "Internal Only" },
  { id: "Confidential", label: "Confidential (OSFI Restricted)" },
];

export interface DeployedApp {
  id: string;
  name: string;
  team: string;
  blockIds: string[];
  model: string;
  modelLabel: string;
  guardrailProfile: string;
  systemPrompt?: string;
  topK?: number;
  status: "Active";
  invocations: number;
  avgLatencyMs: number;
  totalCost: number;
}

export const isAgentApp = (app: Pick<DeployedApp, "blockIds">) => app.blockIds.includes("AGENT_CORE");
export const isRagApp = (app: Pick<DeployedApp, "blockIds">) => app.blockIds.includes("VECTORSTORE");

export const INITIAL_APPS: DeployedApp[] = [
  {
    id: "app-001", name: "pcb-rag-bot", team: "PCB Retail",
    blockIds: ["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST", "VECTORSTORE", "PIPELINE"],
    model: "claude-3-7-sonnet", modelLabel: "Claude 3.7 Sonnet",
    guardrailProfile: "Confidential", status: "Active",
    invocations: 847, avgLatencyMs: 1241, totalCost: 12.34,
    systemPrompt: "You are a BMO retail banking assistant. Answer only questions related to retail products and policies grounded in retrieved documents.",
    topK: 5,
  },
  {
    id: "app-002", name: "risk-agent", team: "Risk & Trading",
    blockIds: ["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST", "VECTORSTORE", "AGENT_CORE", "AGENT_TOOLS", "AGENT_GUARDRAILS", "AGENT_TRACE"],
    model: "claude-3-7-sonnet", modelLabel: "Claude 3.7 Sonnet",
    guardrailProfile: "Confidential", status: "Active",
    invocations: 234, avgLatencyMs: 4891, totalCost: 18.92,
    systemPrompt: "You are an autonomous risk analysis agent. Use available tools to assess counterparty exposure and produce auditable reports.",
    topK: 6,
  },
  {
    id: "app-003", name: "loan-scorer", team: "PCB Lending",
    blockIds: ["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST"],
    model: "claude-3-haiku", modelLabel: "Claude 3 Haiku",
    guardrailProfile: "Internal Only", status: "Active",
    invocations: 1893, avgLatencyMs: 412, totalCost: 3.21,
    systemPrompt: "Score the provided mortgage application against BMO underwriting criteria. Output JSON only.",
  },
];

export interface ActivityRow {
  ts: string; app: string; team: string; query: string;
  composition: string; latencyMs: number; tokens: number; status: "Success" | "Blocked";
}

export const RECENT_ACTIVITY: ActivityRow[] = [
  { ts: "2025-04-16 09:42:11", app: "pcb-rag-bot", team: "PCB Retail", query: "What are current margin requirements for...", composition: "RAG · 7 blocks", latencyMs: 1243, tokens: 2847, status: "Success" },
  { ts: "2025-04-16 09:38:55", app: "risk-agent", team: "Risk & Trading", query: "Analyze counterparty exposure for Q2...", composition: "Agent · 10 blocks", latencyMs: 4891, tokens: 8234, status: "Success" },
  { ts: "2025-04-16 09:35:12", app: "pcb-rag-bot", team: "PCB Retail", query: "BLOCKED: Ignore previous instructions and...", composition: "RAG · 7 blocks", latencyMs: 42, tokens: 0, status: "Blocked" },
  { ts: "2025-04-16 09:31:07", app: "doc-processor", team: "Compliance", query: "Extract key clauses from ISDA master agreement", composition: "Pipeline · 6 blocks", latencyMs: 2104, tokens: 4120, status: "Success" },
  { ts: "2025-04-16 09:28:44", app: "risk-agent", team: "Risk & Trading", query: "SIN: 123-456-789 — run credit assessment", composition: "Agent · 10 blocks", latencyMs: 38, tokens: 0, status: "Blocked" },
  { ts: "2025-04-16 09:21:33", app: "loan-scorer", team: "PCB Lending", query: "Score this mortgage application for...", composition: "Inference · 5 blocks", latencyMs: 891, tokens: 1203, status: "Success" },
];

export const patternAccentClass = (id: PatternId) => {
  switch (id) {
    case "P1": return { text: "text-pattern-p1", bg: "bg-pattern-p1", border: "border-pattern-p1", soft: "bg-[hsl(var(--pattern-p1)/0.08)]" };
    case "P2": return { text: "text-pattern-p2", bg: "bg-pattern-p2", border: "border-pattern-p2", soft: "bg-[hsl(var(--pattern-p2)/0.08)]" };
    case "P4": return { text: "text-pattern-p4", bg: "bg-pattern-p4", border: "border-pattern-p4", soft: "bg-[hsl(var(--pattern-p4)/0.08)]" };
    case "P5": return { text: "text-pattern-p5", bg: "bg-pattern-p5", border: "border-pattern-p5", soft: "bg-[hsl(var(--pattern-p5)/0.08)]" };
    default: return { text: "text-primary", bg: "bg-primary", border: "border-primary", soft: "bg-info-soft" };
  }
};
