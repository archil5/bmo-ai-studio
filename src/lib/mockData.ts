export type PatternId = "P1" | "P2" | "P4" | "P5";

export interface Pattern {
  id: PatternId;
  name: string;
  shortName: string;
  description: string;
  complexity: "Low" | "Medium" | "High";
  llmCalls: string;
  blocks: number;
  blockIds: string[];
  useCases: string[];
  accent: string; // tailwind color name
  warning?: string;
}

export const PATTERNS: Pattern[] = [
  {
    id: "P1",
    name: "Enterprise RAG Chatbot",
    shortName: "RAG Chatbot",
    description:
      "Retrieval-Augmented Generation chatbot for knowledge-intensive use cases. Embeds documents in OpenSearch, retrieves relevant context at query time, generates governed responses via Bedrock.",
    complexity: "Medium",
    llmCalls: "1",
    blocks: 7,
    blockIds: ["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST", "VECTORSTORE", "PIPELINE"],
    useCases: ["Client FAQ bots", "Internal policy assistants", "Product knowledge bases"],
    accent: "p1",
  },
  {
    id: "P2",
    name: "Document Processing",
    shortName: "Doc Processing",
    description:
      "Batch document analysis pipeline. Extracts, classifies, and summarizes unstructured documents with full PII redaction and compliance logging. No vector search required.",
    complexity: "Low",
    llmCalls: "1",
    blocks: 6,
    blockIds: ["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST", "PIPELINE"],
    useCases: ["ISDA agreement extraction", "Regulatory filing summarization", "Loan document review"],
    accent: "p2",
  },
  {
    id: "P4",
    name: "Scoring & Classification",
    shortName: "Scoring",
    description:
      "Lightweight inference pattern for classification and scoring tasks. No retrieval, no agent loop. Pure LLM inference with guardrails and cost attribution. Lowest latency pattern.",
    complexity: "Low",
    llmCalls: "1",
    blocks: 5,
    blockIds: ["CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST"],
    useCases: ["Credit risk scoring", "AML transaction flagging", "Sentiment classification"],
    accent: "p4",
  },
  {
    id: "P5",
    name: "Autonomous Agent",
    shortName: "Agent",
    description:
      "Full AgentOps pattern with ReAct reasoning loop, tool registry, and trajectory audit logging. Agent autonomously decides which tools to invoke, how many times, and in what order. 3–15x higher cost than pipeline patterns.",
    complexity: "High",
    llmCalls: "3–15+",
    blocks: 10,
    blockIds: [
      "CORE", "MODEL", "GUARDRAILS", "OBSERVE", "COST", "VECTORSTORE",
      "AGENT_CORE", "AGENT_TOOLS", "AGENT_GUARDRAILS", "AGENT_TRACE",
    ],
    useCases: ["Multi-step research", "Counterparty exposure analysis", "Autonomous compliance checks"],
    accent: "p5",
    warning: "Higher Cost — Review Budget Before Deploying",
  },
];

export interface BuildingBlock {
  id: string;
  name: string;
  category: "Foundation" | "Governance" | "Operations" | "Data & Retrieval" | "LLMOps" | "AgentOps";
  required: boolean;
  description: string;
  patterns: PatternId[];
}

export const BUILDING_BLOCKS: BuildingBlock[] = [
  { id: "CORE", name: "CORE", category: "Foundation", required: true, description: "Configuration management, structured logging, OSFI E-23 model registry, error handling, distributed cache.", patterns: ["P1", "P2", "P4", "P5"] },
  { id: "MODEL", name: "MODEL", category: "Foundation", required: true, description: "Amazon Bedrock invocation with mandatory Application Inference Profiles (AIPs) for cost attribution and guardrail enforcement.", patterns: ["P1", "P2", "P4", "P5"] },
  { id: "GUARDRAILS", name: "GUARDRAILS", category: "Governance", required: true, description: "PII detection (8 entity types), prompt injection blocking (5 attack categories), configurable profiles (Public / Internal / Confidential).", patterns: ["P1", "P2", "P4", "P5"] },
  { id: "OBSERVE", name: "OBSERVE", category: "Operations", required: true, description: "End-to-end request tracing, Amazon CloudWatch metrics emission, SageMaker MLflow experiment logging.", patterns: ["P1", "P2", "P4", "P5"] },
  { id: "COST", name: "COST", category: "Operations", required: true, description: "Real-time token counting, per-model pricing, per-team cost attribution with CloudWatch cost alarms.", patterns: ["P1", "P2", "P4", "P5"] },
  { id: "VECTORSTORE", name: "VECTORSTORE", category: "Data & Retrieval", required: false, description: "Amazon OpenSearch Serverless client, Titan Embeddings v2 integration, kNN semantic search, document ingestion pipeline.", patterns: ["P1", "P5"] },
  { id: "PIPELINE", name: "PIPELINE", category: "LLMOps", required: false, description: "RAG pipeline orchestration with developer hook system (pre_query, post_retrieval, post_response). Deterministic, 1 LLM call per request.", patterns: ["P1", "P2"] },
  { id: "AGENT_CORE", name: "AGENT CORE", category: "AgentOps", required: false, description: "ReAct (Reason + Act) autonomous reasoning loop. Non-deterministic, 3–15+ LLM calls per request. Extends LLMOps layer.", patterns: ["P5"] },
  { id: "AGENT_TOOLS", name: "AGENT TOOLS", category: "AgentOps", required: false, description: "Tool registry with permission scoping, sandboxed executor, 3 built-in tools: knowledge_search, calculator, compliance_check.", patterns: ["P5"] },
  { id: "AGENT_GUARDRAILS", name: "AGENT GUARDRAILS", category: "AgentOps", required: false, description: "Token budget enforcement, action boundary policies, emergency kill switch, step-count limits to prevent runaway agents.", patterns: ["P5"] },
  { id: "AGENT_TRACE", name: "AGENT TRACE", category: "AgentOps", required: false, description: "Full agent trajectory logging — every ReAct step, tool call, and reasoning trace captured for OSFI audit trail.", patterns: ["P5"] },
];

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
  pattern: PatternId;
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

export const INITIAL_APPS: DeployedApp[] = [
  {
    id: "app-001", name: "pcb-rag-bot", team: "PCB Retail", pattern: "P1",
    model: "claude-3-7-sonnet", modelLabel: "Claude 3.7 Sonnet",
    guardrailProfile: "Confidential", status: "Active",
    invocations: 847, avgLatencyMs: 1241, totalCost: 12.34,
    systemPrompt: "You are a BMO retail banking assistant. Answer only questions related to retail products and policies grounded in retrieved documents.",
    topK: 5,
  },
  {
    id: "app-002", name: "risk-agent", team: "Risk & Trading", pattern: "P5",
    model: "claude-3-7-sonnet", modelLabel: "Claude 3.7 Sonnet",
    guardrailProfile: "Confidential", status: "Active",
    invocations: 234, avgLatencyMs: 4891, totalCost: 18.92,
    systemPrompt: "You are an autonomous risk analysis agent. Use available tools to assess counterparty exposure and produce auditable reports.",
    topK: 6,
  },
  {
    id: "app-003", name: "loan-scorer", team: "PCB Lending", pattern: "P4",
    model: "claude-3-haiku", modelLabel: "Claude 3 Haiku",
    guardrailProfile: "Internal Only", status: "Active",
    invocations: 1893, avgLatencyMs: 412, totalCost: 3.21,
    systemPrompt: "Score the provided mortgage application against BMO underwriting criteria. Output JSON only.",
  },
];

export interface ActivityRow {
  ts: string; app: string; team: string; query: string;
  pattern: PatternId; latencyMs: number; tokens: number; status: "Success" | "Blocked";
}

export const RECENT_ACTIVITY: ActivityRow[] = [
  { ts: "2025-04-16 09:42:11", app: "pcb-rag-bot", team: "PCB Retail", query: "What are current margin requirements for...", pattern: "P1", latencyMs: 1243, tokens: 2847, status: "Success" },
  { ts: "2025-04-16 09:38:55", app: "risk-agent", team: "Risk & Trading", query: "Analyze counterparty exposure for Q2...", pattern: "P5", latencyMs: 4891, tokens: 8234, status: "Success" },
  { ts: "2025-04-16 09:35:12", app: "pcb-rag-bot", team: "PCB Retail", query: "BLOCKED: Ignore previous instructions and...", pattern: "P1", latencyMs: 42, tokens: 0, status: "Blocked" },
  { ts: "2025-04-16 09:31:07", app: "doc-processor", team: "Compliance", query: "Extract key clauses from ISDA master agreement", pattern: "P2", latencyMs: 2104, tokens: 4120, status: "Success" },
  { ts: "2025-04-16 09:28:44", app: "risk-agent", team: "Risk & Trading", query: "SIN: 123-456-789 — run credit assessment", pattern: "P5", latencyMs: 38, tokens: 0, status: "Blocked" },
  { ts: "2025-04-16 09:21:33", app: "loan-scorer", team: "PCB Lending", query: "Score this mortgage application for...", pattern: "P4", latencyMs: 891, tokens: 1203, status: "Success" },
];

export const patternAccentClass = (id: PatternId) => {
  switch (id) {
    case "P1": return { text: "text-pattern-p1", bg: "bg-pattern-p1", border: "border-pattern-p1", soft: "bg-[hsl(var(--pattern-p1)/0.08)]" };
    case "P2": return { text: "text-pattern-p2", bg: "bg-pattern-p2", border: "border-pattern-p2", soft: "bg-[hsl(var(--pattern-p2)/0.08)]" };
    case "P4": return { text: "text-pattern-p4", bg: "bg-pattern-p4", border: "border-pattern-p4", soft: "bg-[hsl(var(--pattern-p4)/0.08)]" };
    case "P5": return { text: "text-pattern-p5", bg: "bg-pattern-p5", border: "border-pattern-p5", soft: "bg-[hsl(var(--pattern-p5)/0.08)]" };
  }
};
