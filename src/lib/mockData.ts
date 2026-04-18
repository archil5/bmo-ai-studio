// ─── Types ────────────────────────────────────────────────────────────────────

export type Track = "llmops" | "agentops" | "mlops";

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "select" | "range" | "textarea";
  placeholder?: string;
  hint?: string;
  options?: string[];
  min?: number;
  max?: number;
  defaultValue: string | number;
}

export interface BuildingBlock {
  id: string;
  name: string;
  category: string;
  required: boolean;
  description: string;
  awsServices: string[];   // service node IDs this block adds to the diagram
  requires?: string[];     // block IDs this block depends on
  configFields: ConfigField[];
}

export interface UseCase {
  id: string;
  track: Track;
  name: string;
  tagline: string;
  description: string;
  complexity: "Low" | "Medium" | "High";
  recommendedBlocks: string[];  // optional block IDs to pre-select (required always added)
  bankingExamples: string[];
}

export interface DeployedApp {
  id: string;
  name: string;
  team: string;
  useCaseId?: string;
  blockIds: string[];
  model: string;
  modelLabel: string;
  guardrailProfile: string;
  status: "Active";
  invocations: number;
  avgLatencyMs: number;
  totalCost: number;
}

// ─── AWS Service Nodes (for architecture diagram) ─────────────────────────────
// These are the visual nodes that appear in the diagram.
// Each block declares which service node IDs it contributes.

export const AWS_SERVICE_NODES: Record<string, { label: string; sublabel: string; color: string; layer: number }> = {
  // Layer 0 – always shown
  "ecs":        { label: "ECS Fargate",       sublabel: "Platform Runtime",         color: "#FF9900", layer: 1 },
  // Layer 1 – core services
  "bedrock":    { label: "Amazon Bedrock",     sublabel: "Model Inference",          color: "#8B5CF6", layer: 2 },
  "guardrails": { label: "Bedrock Guardrails", sublabel: "PII + Injection",          color: "#DC2626", layer: 2 },
  "ssm":        { label: "SSM Param Store",    sublabel: "Config + Secrets",         color: "#6B7280", layer: 2 },
  // Layer 2 – optional services
  "opensearch": { label: "OpenSearch",         sublabel: "Vector Store (kNN)",       color: "#059669", layer: 3 },
  "lambda":     { label: "AWS Lambda",         sublabel: "Tool Executor",            color: "#F59E0B", layer: 3 },
  "sagemaker":  { label: "SageMaker",          sublabel: "Training / Evaluation",   color: "#3B82F6", layer: 3 },
  "mlflow":     { label: "SageMaker MLflow",   sublabel: "Experiment Tracking",     color: "#3B82F6", layer: 3 },
  // Layer 3 – storage / shared
  "s3":         { label: "Amazon S3",          sublabel: "Artifacts + Traces",       color: "#16A34A", layer: 4 },
  "cloudwatch": { label: "CloudWatch",         sublabel: "Metrics + Alarms",         color: "#F59E0B", layer: 4 },
  "kms":        { label: "KMS CMK",            sublabel: "Customer Managed Key",     color: "#DC2626", layer: 4 },
  "dynamodb":   { label: "DynamoDB",           sublabel: "State + Trajectory",       color: "#059669", layer: 4 },
};

// Edges in the diagram: [sourceId, targetId]
// These are static relationships between service nodes.
export const SERVICE_EDGES: [string, string][] = [
  ["ecs", "bedrock"],
  ["ecs", "ssm"],
  ["ecs", "opensearch"],
  ["ecs", "lambda"],
  ["ecs", "sagemaker"],
  ["bedrock", "guardrails"],
  ["bedrock", "mlflow"],
  ["opensearch", "s3"],
  ["sagemaker", "s3"],
  ["sagemaker", "mlflow"],
  ["ecs", "cloudwatch"],
  ["ecs", "s3"],
  ["bedrock", "kms"],
  ["opensearch", "kms"],
  ["lambda", "dynamodb"],
];

// ─── Building Blocks ──────────────────────────────────────────────────────────

export const BUILDING_BLOCKS: BuildingBlock[] = [
  {
    id: "CORE",
    name: "CORE",
    category: "Foundation",
    required: true,
    description: "Configuration management, structured logging, model registry, error handling. The base every other block builds on.",
    awsServices: ["ecs", "ssm", "cloudwatch"],
    configFields: [
      { key: "logLevel", label: "Log Level", type: "select", options: ["INFO", "DEBUG", "WARN", "ERROR"], defaultValue: "INFO" },
      { key: "region", label: "AWS Region", type: "text", placeholder: "ca-central-1", hint: "Region where platform resources are deployed.", defaultValue: "ca-central-1" },
    ],
  },
  {
    id: "MODEL",
    name: "MODEL",
    category: "Foundation",
    required: true,
    description: "Amazon Bedrock invocation with Application Inference Profiles (AIPs) for per-team cost attribution.",
    awsServices: ["bedrock"],
    requires: ["CORE"],
    configFields: [
      { key: "modelId", label: "Foundation Model", type: "select", options: ["anthropic.claude-3-5-sonnet-20241022-v2:0", "anthropic.claude-3-haiku-20240307-v1:0", "amazon.titan-text-express-v1", "meta.llama3-70b-instruct-v1:0"], defaultValue: "anthropic.claude-3-5-sonnet-20241022-v2:0" },
      { key: "aipArn", label: "Application Inference Profile ARN", type: "text", placeholder: "arn:aws:bedrock:ca-central-1:123456789:application-inference-profile/...", hint: "Required for per-team cost tracking. Each team must supply their own AIP.", defaultValue: "" },
      { key: "maxTokens", label: "Max Output Tokens", type: "range", min: 256, max: 4096, defaultValue: 1024 },
    ],
  },
  {
    id: "GUARDRAILS",
    name: "GUARDRAILS",
    category: "Governance",
    required: true,
    description: "PII detection (8 entity types), prompt injection blocking (5 categories), configurable data classification profiles.",
    awsServices: ["guardrails", "kms"],
    requires: ["MODEL"],
    configFields: [
      { key: "guardrailId", label: "Bedrock Guardrail ID", type: "text", placeholder: "grd-xxxxxxxxxxxxxxxxx", hint: "Each team must provision their own Bedrock Guardrail resource.", defaultValue: "" },
      { key: "guardrailVersion", label: "Guardrail Version", type: "text", placeholder: "DRAFT or 1", defaultValue: "DRAFT" },
      { key: "profile", label: "Data Classification", type: "select", options: ["Public", "Internal", "Confidential", "Restricted"], defaultValue: "Internal" },
    ],
  },
  {
    id: "OBSERVE",
    name: "OBSERVE",
    category: "Operations",
    required: true,
    description: "End-to-end request tracing, CloudWatch metrics, SageMaker MLflow experiment logging.",
    awsServices: ["cloudwatch", "mlflow"],
    requires: ["CORE"],
    configFields: [
      { key: "mlflowArn", label: "MLflow Tracking Server ARN", type: "text", placeholder: "arn:aws:sagemaker:ca-central-1:123456789:mlflow-tracking-server/...", hint: "Supply your team's MLflow server ARN for experiment tracking.", defaultValue: "" },
      { key: "metricsNamespace", label: "CloudWatch Namespace", type: "text", placeholder: "BMO/LLMOps/YourTeam", defaultValue: "" },
    ],
  },
  {
    id: "COST",
    name: "COST",
    category: "Operations",
    required: true,
    description: "Token counting, per-model pricing, per-team cost attribution, configurable CloudWatch budget alarms.",
    awsServices: ["cloudwatch"],
    requires: ["CORE"],
    configFields: [
      { key: "alertThreshold", label: "Monthly Alert Threshold (CAD $)", type: "range", min: 10, max: 5000, defaultValue: 100 },
      { key: "alertEmail", label: "Alert Notification Email", type: "text", placeholder: "your-team@bmo.com", defaultValue: "" },
    ],
  },
  {
    id: "VECTORSTORE",
    name: "VECTORSTORE",
    category: "Data & Retrieval",
    required: false,
    description: "Semantic search using Amazon OpenSearch Serverless. Titan Embeddings v2 for vector generation. kNN retrieval at query time.",
    awsServices: ["opensearch", "s3"],
    requires: ["CORE"],
    configFields: [
      { key: "collectionEndpoint", label: "OpenSearch Collection Endpoint", type: "text", placeholder: "https://xxxxxxxx.ca-central-1.aoss.amazonaws.com", hint: "Your team's OpenSearch Serverless collection. Must be in same VPC.", defaultValue: "" },
      { key: "indexName", label: "Index Name", type: "text", placeholder: "my-team-knowledge-base", defaultValue: "" },
      { key: "topK", label: "Top-K Retrieval Results", type: "range", min: 1, max: 20, defaultValue: 5 },
      { key: "embeddingModel", label: "Embedding Model", type: "select", options: ["amazon.titan-embed-text-v2:0", "amazon.titan-embed-text-v1"], defaultValue: "amazon.titan-embed-text-v2:0" },
    ],
  },
  {
    id: "PIPELINE",
    name: "PIPELINE",
    category: "LLMOps",
    required: false,
    description: "Deterministic RAG pipeline orchestration with a developer hook system (pre_query, post_retrieval, post_response). Exactly 1 LLM call per request.",
    awsServices: ["ecs"],
    requires: ["MODEL", "GUARDRAILS"],
    configFields: [
      { key: "systemPrompt", label: "System Prompt", type: "textarea", placeholder: "You are a BMO assistant. Answer using the retrieved context only...", defaultValue: "" },
      { key: "hooksEnabled", label: "Developer Hooks", type: "select", options: ["Enabled (pre_query, post_retrieval, post_response)", "Disabled"], defaultValue: "Enabled (pre_query, post_retrieval, post_response)" },
    ],
  },
  {
    id: "PROMPT_HUB",
    name: "PROMPT HUB",
    category: "LLMOps",
    required: false,
    description: "Centralized version-controlled prompt registry stored in S3. Supports A/B testing and approval workflows before production deployment.",
    awsServices: ["s3"],
    requires: ["CORE"],
    configFields: [
      { key: "promptBucket", label: "S3 Bucket for Prompts", type: "text", placeholder: "s3://my-team-prompts-bucket", hint: "Your team's S3 bucket for storing prompt versions.", defaultValue: "" },
      { key: "approvalWorkflow", label: "Deployment Approval", type: "select", options: ["Require Approval", "Auto-deploy (dev only)", "A/B Test Mode"], defaultValue: "Require Approval" },
    ],
  },
  {
    id: "AGENT_CORE",
    name: "AGENT CORE",
    category: "AgentOps",
    required: false,
    description: "ReAct (Reason + Act) autonomous reasoning loop. Non-deterministic. 3–15+ LLM calls per request. Extends the LLMOps layer — never duplicates it.",
    awsServices: ["bedrock"],
    requires: ["MODEL", "GUARDRAILS"],
    configFields: [
      { key: "systemPrompt", label: "Agent System Prompt", type: "textarea", placeholder: "You are an autonomous agent. Use your tools to research thoroughly before responding...", defaultValue: "" },
      { key: "maxSteps", label: "Max ReAct Steps (hard limit)", type: "range", min: 1, max: 20, defaultValue: 5 },
      { key: "temperature", label: "Temperature", type: "range", min: 0, max: 1, defaultValue: 0 },
    ],
  },
  {
    id: "AGENT_TOOLS",
    name: "AGENT TOOLS",
    category: "AgentOps",
    required: false,
    description: "Sandboxed tool executor with IAM permission scoping per tool. Platform provides: knowledge_search, calculator, compliance_check. Teams can register custom tools.",
    awsServices: ["lambda", "dynamodb"],
    requires: ["AGENT_CORE"],
    configFields: [
      { key: "lambdaRoleArn", label: "Lambda Execution Role ARN", type: "text", placeholder: "arn:aws:iam::123456789:role/my-team-agent-tool-role", hint: "Each team supplies their own Lambda execution role with least-privilege scoping.", defaultValue: "" },
      { key: "customTools", label: "Custom Tool Lambda ARNs (comma-separated)", type: "text", placeholder: "arn:aws:lambda:...:function:my-tool-1, arn:aws:lambda:...:function:my-tool-2", defaultValue: "" },
      { key: "timeout", label: "Tool Execution Timeout (seconds)", type: "select", options: ["15", "30", "60", "120"], defaultValue: "30" },
    ],
  },
  {
    id: "AGENT_GUARDRAILS",
    name: "AGENT GUARDRAILS",
    category: "AgentOps",
    required: false,
    description: "Token budget enforcement, action boundary policies, step-count kill switch. Prevents runaway agent loops from consuming unbounded resources.",
    awsServices: ["cloudwatch"],
    requires: ["AGENT_CORE"],
    configFields: [
      { key: "tokenBudget", label: "Total Token Budget per Request", type: "range", min: 1000, max: 50000, defaultValue: 10000 },
      { key: "killSwitchEnabled", label: "Kill Switch", type: "select", options: ["Enabled", "Disabled (not recommended)"], defaultValue: "Enabled" },
    ],
  },
  {
    id: "AGENT_TRACE",
    name: "AGENT TRACE",
    category: "AgentOps",
    required: false,
    description: "Full trajectory logging — every reasoning step, tool call, and intermediate result written to S3 and DynamoDB for OSFI audit trail.",
    awsServices: ["s3", "dynamodb"],
    requires: ["AGENT_CORE"],
    configFields: [
      { key: "tracesBucket", label: "S3 Bucket for Trajectories", type: "text", placeholder: "s3://my-team-agent-traces", hint: "Your team's S3 bucket. Must have server-side encryption enabled (KMS CMK).", defaultValue: "" },
      { key: "traceVerbosity", label: "Verbosity", type: "select", options: ["Standard (OSFI Compliant)", "Verbose (Debug Mode)"], defaultValue: "Standard (OSFI Compliant)" },
    ],
  },
  {
    id: "EVAL_ENGINE",
    name: "EVAL ENGINE",
    category: "Evaluation",
    required: false,
    description: "Automated evaluation using RAGAS metrics (faithfulness, relevance, context precision), LLM-as-a-judge, and optional shadow testing on live traffic.",
    awsServices: ["sagemaker", "mlflow"],
    requires: ["OBSERVE", "MODEL"],
    configFields: [
      { key: "metrics", label: "Metric Suite", type: "select", options: ["RAGAS Core (Faithfulness + Relevance)", "Full Suite + LLM-as-a-Judge", "Toxicity & Bias Only", "Custom"], defaultValue: "RAGAS Core (Faithfulness + Relevance)" },
      { key: "frequency", label: "Evaluation Frequency", type: "select", options: ["Nightly Batch", "10% Traffic Shadowing", "Manual Trigger Only", "On Every Deploy"], defaultValue: "Nightly Batch" },
      { key: "sagemakerRoleArn", label: "SageMaker Execution Role ARN", type: "text", placeholder: "arn:aws:iam::123456789:role/my-team-sagemaker-role", hint: "Your team's role with SageMaker and S3 permissions.", defaultValue: "" },
    ],
  },
  {
    id: "DATA_PREP",
    name: "DATA PREP",
    category: "MLOps",
    required: false,
    description: "Dataset curation pipeline using SageMaker Processing Jobs. Generates synthetic data, formats to training-ready JSONL, enforces mandatory PII scrubbing.",
    awsServices: ["sagemaker", "s3"],
    requires: ["CORE", "GUARDRAILS"],
    configFields: [
      { key: "inputBucket", label: "Input S3 URI", type: "text", placeholder: "s3://my-team-raw-data/dataset/", defaultValue: "" },
      { key: "outputBucket", label: "Output S3 URI (cleaned)", type: "text", placeholder: "s3://my-team-clean-data/output/", defaultValue: "" },
      { key: "instanceType", label: "Processing Instance", type: "select", options: ["ml.t3.medium", "ml.m5.xlarge", "ml.m5.4xlarge"], defaultValue: "ml.m5.xlarge" },
    ],
  },
  {
    id: "FINE_TUNER",
    name: "FINE TUNER",
    category: "MLOps",
    required: false,
    description: "Managed PEFT/LoRA fine-tuning on Amazon Bedrock Custom Models or SageMaker. Creates team-isolated model weights. Mandatory PII scrub before training.",
    awsServices: ["sagemaker", "s3", "kms"],
    requires: ["DATA_PREP", "EVAL_ENGINE", "MODEL"],
    configFields: [
      { key: "baseModel", label: "Base Model to Fine-Tune", type: "select", options: ["amazon.titan-text-express-v1", "meta.llama3-8b-instruct-v1:0", "meta.llama3-70b-instruct-v1:0"], defaultValue: "amazon.titan-text-express-v1" },
      { key: "epochs", label: "Training Epochs", type: "range", min: 1, max: 10, defaultValue: 3 },
      { key: "loraRank", label: "LoRA Rank (r)", type: "select", options: ["4 (Light)", "8 (Standard)", "16 (Heavy)", "32 (Max)"], defaultValue: "8 (Standard)" },
      { key: "trainingRoleArn", label: "SageMaker Training Role ARN", type: "text", placeholder: "arn:aws:iam::123456789:role/my-team-training-role", hint: "Team-specific role for GPU training jobs. Cost attributed to your team budget.", defaultValue: "" },
      { key: "kmsKeyArn", label: "KMS Key ARN for Model Weights", type: "text", placeholder: "arn:aws:kms:ca-central-1:123456789:key/...", hint: "Customer managed key for encrypting fine-tuned model weights at rest.", defaultValue: "" },
    ],
  },
];

export const REQUIRED_BLOCK_IDS = BUILDING_BLOCKS.filter((b) => b.required).map((b) => b.id);

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
  return BUILDING_BLOCKS.filter((b) => set.has(b.id)).map((b) => b.id);
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

export const USE_CASES: UseCase[] = [
  // LLMOps
  { id: "UC-L1", track: "llmops", name: "Enterprise RAG Chatbot", tagline: "Knowledge base Q&A with semantic retrieval", description: "Embeds documents in OpenSearch, retrieves relevant context at query time, generates governed responses. Exactly 1 LLM call per request.", complexity: "Medium", recommendedBlocks: ["VECTORSTORE", "PIPELINE", "PROMPT_HUB"], bankingExamples: ["Policy & procedure knowledge base", "OSFI regulatory Q&A bot", "Product information assistant"] },
  { id: "UC-L2", track: "llmops", name: "Document Processing Pipeline", tagline: "Batch extraction and summarization at scale", description: "Processes PDFs and unstructured documents to extract structured data, classify content, summarize. Mandatory PII redaction enforced on every output.", complexity: "Low", recommendedBlocks: ["PIPELINE", "PROMPT_HUB"], bankingExamples: ["ISDA agreement clause extraction", "Loan document review", "Earnings transcript structuring"] },
  { id: "UC-L3", track: "llmops", name: "Scoring & Classification", tagline: "Lowest latency — pure inference, no retrieval", description: "Lightweight pattern for classification and scoring. No vector search, no orchestration. Fastest and cheapest pattern on the platform.", complexity: "Low", recommendedBlocks: [], bankingExamples: ["Credit risk pre-screening", "AML transaction flagging", "Sentiment classification from call logs"] },
  { id: "UC-L4", track: "llmops", name: "Conversational Assistant", tagline: "Multi-turn stateful chat with managed context", description: "Stateful multi-turn conversations with context window management and dynamic prompt injection. Every turn is governed and traced.", complexity: "Medium", recommendedBlocks: ["PIPELINE", "PROMPT_HUB"], bankingExamples: ["Wealth advisor assistant", "Client onboarding guide", "Internal HR policy Q&A"] },

  // AgentOps
  { id: "UC-A1", track: "agentops", name: "Autonomous Research Agent", tagline: "Multi-step research with tool use + audit trail", description: "ReAct agent that autonomously invokes tools, reasons across multiple steps, and produces structured outputs. 3–15× higher cost than pipeline patterns. Full trajectory logging.", complexity: "High", recommendedBlocks: ["VECTORSTORE", "AGENT_CORE", "AGENT_TOOLS", "AGENT_GUARDRAILS", "AGENT_TRACE"], bankingExamples: ["Counterparty exposure deep-dive", "Market research synthesis", "Due diligence automation"] },
  { id: "UC-A2", track: "agentops", name: "Compliance Automation Agent", tagline: "Policy monitoring, rule testing, violation detection", description: "Agent specialized in regulatory tasks. Tests rules against live data, flags violations, and produces auditable structured reports.", complexity: "High", recommendedBlocks: ["AGENT_CORE", "AGENT_TOOLS", "AGENT_GUARDRAILS", "AGENT_TRACE"], bankingExamples: ["OSFI B-20 violation detection", "AML typology rule backtesting", "Basel III capital monitoring"] },
  { id: "UC-A3", track: "agentops", name: "Document Intelligence Agent", tagline: "Cross-document reasoning and structured extraction", description: "Retrieves and reasons across multiple documents simultaneously — compares clauses, resolves contradictions, produces structured outputs.", complexity: "Medium", recommendedBlocks: ["VECTORSTORE", "AGENT_CORE", "AGENT_TOOLS", "AGENT_GUARDRAILS"], bankingExamples: ["Cross-contract clause comparison", "Multi-jurisdiction regulatory mapping", "Prospectus risk factor consolidation"] },

  // MLOps
  { id: "UC-M1", track: "mlops", name: "Model Fine-Tuning Pipeline", tagline: "Custom model training on proprietary data", description: "End-to-end: PII-scrubbed data prep → PEFT/LoRA training → evaluation → model registry. Team-isolated model weights.", complexity: "High", recommendedBlocks: ["DATA_PREP", "FINE_TUNER", "EVAL_ENGINE"], bankingExamples: ["Domain-adapted Claude on BMO terminology", "Risk classifier on 10yr credit history", "AML triage model on confirmed SARs"] },
  { id: "UC-M2", track: "mlops", name: "Model Evaluation & Benchmarking", tagline: "RAGAS, LLM-as-judge, shadow testing", description: "Benchmarks models on internal test sets using RAGAS metrics, LLM-as-a-judge, and optional live traffic shadowing. Results in MLflow.", complexity: "Medium", recommendedBlocks: ["EVAL_ENGINE", "PROMPT_HUB"], bankingExamples: ["Claude Haiku vs Sonnet on compliance tasks", "Prompt version A/B with statistical significance", "Shadow test new RAG pipeline before go-live"] },
  { id: "UC-M3", track: "mlops", name: "Synthetic Data Generation", tagline: "PII-safe training datasets at scale", description: "Generates realistic synthetic banking data with mandatory PII scrubbing. RAGAS-based quality validation included.", complexity: "Medium", recommendedBlocks: ["DATA_PREP", "EVAL_ENGINE"], bankingExamples: ["Synthetic transaction histories for AML training", "Augmented mortgage application dataset", "Generated regulatory Q&A pairs for fine-tuning"] },
];

// ─── Static data ──────────────────────────────────────────────────────────────

export const TRACK_META = {
  llmops:   { label: "LLMOps",   color: "text-[hsl(var(--pattern-p1))]", description: "Deterministic pipelines · 1 LLM call/request" },
  agentops: { label: "AgentOps", color: "text-[hsl(var(--pattern-p5))]", description: "Autonomous agents · 3–15+ LLM calls · tool use" },
  mlops:    { label: "MLOps",    color: "text-pattern-p4",                description: "Model lifecycle · fine-tuning · evaluation" },
};

export const COMPLEXITY_COLOR: Record<string, string> = {
  Low:    "bg-success-soft border-success/30 text-success",
  Medium: "bg-warning-soft border-warning/30 text-warning",
  High:   "bg-destructive-soft border-destructive/30 text-destructive",
};

export const TEAMS = [
  "PCB Retail", "PCB Lending", "Risk & Trading", "Compliance & Legal",
  "Capital Markets", "Wealth Management", "BMO Harris", "Enterprise Technology",
  "Finance & Treasury", "AML & Financial Intelligence",
];

export const INITIAL_APPS: DeployedApp[] = [
  { id: "app-001", name: "pcb-rag-bot", team: "PCB Retail", useCaseId: "UC-L1", blockIds: expandWithDependencies(["VECTORSTORE", "PIPELINE", "PROMPT_HUB"]), model: "claude-3-5-sonnet", modelLabel: "Claude 3.5 Sonnet", guardrailProfile: "Confidential", status: "Active", invocations: 847, avgLatencyMs: 1241, totalCost: 12.34 },
  { id: "app-002", name: "risk-agent", team: "Risk & Trading", useCaseId: "UC-A1", blockIds: expandWithDependencies(["VECTORSTORE", "AGENT_CORE", "AGENT_TOOLS", "AGENT_GUARDRAILS", "AGENT_TRACE"]), model: "claude-3-5-sonnet", modelLabel: "Claude 3.5 Sonnet", guardrailProfile: "Confidential", status: "Active", invocations: 234, avgLatencyMs: 4891, totalCost: 18.92 },
  { id: "app-003", name: "loan-scorer", team: "PCB Lending", useCaseId: "UC-L3", blockIds: expandWithDependencies([]), model: "claude-3-haiku", modelLabel: "Claude 3 Haiku", guardrailProfile: "Internal", status: "Active", invocations: 1893, avgLatencyMs: 412, totalCost: 3.21 },
];

export const isAgentApp = (app: Pick<DeployedApp, "blockIds">) => app.blockIds.includes("AGENT_CORE");
export const isRagApp   = (app: Pick<DeployedApp, "blockIds">) => app.blockIds.includes("VECTORSTORE");
export const isMLOpsApp = (app: Pick<DeployedApp, "blockIds">) =>
  app.blockIds.some((id) => ["FINE_TUNER", "EVAL_ENGINE", "DATA_PREP"].includes(id));