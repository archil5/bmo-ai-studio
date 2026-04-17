export type PatternId = "P1" | "P2" | "P4" | "P5" | "P6" | "P7";

export interface BuildingBlock {
  id: string;
  name: string;
  category: "Foundation" | "Governance" | "Operations" | "Prompt Management" | "Data & Retrieval" | "LLMOps" | "AgentOps" | "Evaluation" | "Model Customization";
  required: boolean;
  description: string;
  requires?: string[];
}

export const BUILDING_BLOCKS: BuildingBlock[] = [
  // Existing Core Blocks
  { id: "CORE", name: "CORE", category: "Foundation", required: true, description: "Configuration management, structured logging, OSFI E-23 model registry, error handling, distributed cache." },
  { id: "MODEL", name: "MODEL", category: "Foundation", required: true, description: "Amazon Bedrock invocation with mandatory Application Inference Profiles (AIPs) for cost attribution and guardrail enforcement.", requires: ["CORE"] },
  { id: "GUARDRAILS", name: "GUARDRAILS", category: "Governance", required: true, description: "PII detection (8 entity types), prompt injection blocking (5 attack categories), configurable profiles (Public / Internal / Confidential).", requires: ["MODEL"] },
  { id: "OBSERVE", name: "OBSERVE", category: "Operations", required: true, description: "End-to-end request tracing, Amazon CloudWatch metrics emission, SageMaker MLflow experiment logging.", requires: ["CORE"] },
  { id: "COST", name: "COST", category: "Operations", required: true, description: "Real-time token counting, per-model pricing, per-team cost attribution with CloudWatch cost alarms.", requires: ["MODEL"] },
  
  // New: Prompt Management
  { id: "PROMPT_HUB", name: "PROMPT HUB", category: "Prompt Management", required: false, description: "Centralized, version-controlled prompt registry. Enables A/B testing, dynamic injection, and mandatory compliance approval workflows.", requires: ["CORE"] },
  
  // Existing Retrieval & Orchestration
  { id: "VECTORSTORE", name: "VECTORSTORE", category: "Data & Retrieval", required: false, description: "Amazon OpenSearch Serverless client, Titan Embeddings v2 integration, kNN semantic search, document ingestion pipeline.", requires: ["CORE"] },
  { id: "PIPELINE", name: "PIPELINE", category: "LLMOps", required: false, description: "RAG pipeline orchestration with developer hook system (pre_query, post_retrieval, post_response). Deterministic, 1 LLM call per request.", requires: ["MODEL", "GUARDRAILS"] },
  { id: "AGENT_CORE", name: "AGENT CORE", category: "AgentOps", required: false, description: "ReAct (Reason + Act) autonomous reasoning loop. Non-deterministic, 3–15+ LLM calls per request. Extends LLMOps layer.", requires: ["MODEL", "GUARDRAILS"] },
  { id: "AGENT_TOOLS", name: "AGENT TOOLS", category: "AgentOps", required: false, description: "Tool registry with permission scoping, sandboxed executor, 3 built-in tools: knowledge_search, calculator, compliance_check.", requires: ["AGENT_CORE"] },
  { id: "AGENT_GUARDRAILS", name: "AGENT GUARDRAILS", category: "AgentOps", required: false, description: "Token budget enforcement, action boundary policies, emergency kill switch, step-count limits to prevent runaway agents.", requires: ["AGENT_CORE"] },
  { id: "AGENT_TRACE", name: "AGENT TRACE", category: "AgentOps", required: false, description: "Full agent trajectory logging — every ReAct step, tool call, and reasoning trace captured for OSFI audit trail.", requires: ["AGENT_CORE", "OBSERVE"] },

  // New: Full Lifecycle Additions (Eval & Fine-tuning)
  { id: "EVAL_ENGINE", name: "EVAL ENGINE", category: "Evaluation", required: false, description: "Automated offline & online evaluation suite. Runs RAGAS metrics (faithfulness, answer relevance), LLM-as-a-judge, and shadow testing.", requires: ["OBSERVE", "MODEL"] },
  { id: "DATA_PREP", name: "DATA PREP", category: "Model Customization", required: false, description: "Dataset curation pipeline. Auto-generates synthetic data, formats to JSONL, and enforces mandatory PII scrubbing before training.", requires: ["CORE", "GUARDRAILS"] },
  { id: "FINE_TUNER", name: "FINE TUNER", category: "Model Customization", required: false, description: "Managed PEFT/LoRA fine-tuning jobs on Amazon Bedrock Custom Models. Creates strictly isolated, team-specific model weights.", requires: ["DATA_PREP", "EVAL_ENGINE", "MODEL"] },
];
// Keep the rest of the file exactly the same
