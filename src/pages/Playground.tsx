import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/portal/PageHeader";
import { useApps } from "@/context/AppsContext";
import { 
  ShieldAlert, ShieldCheck, Terminal, Send, AlertTriangle, 
  Fingerprint, Activity, StopCircle, Lock
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "standard" | "intercept" | "kill-switch" | "trace";
}

export default function Playground() {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get("app");
  const { apps } = useApps();
  
  const app = apps.find(a => a.id === appId) || apps[0];
  const isAgent = app?.blockIds.includes("AGENT_CORE");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: `Connected to ${app?.name || "Global Testing Sandbox"}. OSFI E-23 Guardrails ACTIVE. Target: AWS Bedrock Enterprise Profile.`,
      type: "trace"
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSimulate = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    // 1. PII & Data Leakage Intercept Simulation
    const lowerInput = userMsg.content.toLowerCase();
    if (lowerInput.match(/\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/)) { // Mock SIN regex
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "system",
          type: "intercept",
          content: "[GUARDRAIL INTERCEPT] PII detected (Social Insurance Number). Request blocked before LLM transmission. Incident logged to Security Hub."
        }]);
        setIsProcessing(false);
      }, 600);
      return;
    }

    // 2. Prompt Injection Intercept Simulation
    if (lowerInput.includes("ignore previous") || lowerInput.includes("system prompt")) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "system",
          type: "intercept",
          content: "[GUARDRAIL INTERCEPT] Malicious intent detected (Prompt Injection Attack). Request blocked. Confidence: 0.98."
        }]);
        setIsProcessing(false);
      }, 600);
      return;
    }

    // 3. Agentic Runaway Loop (Kill-Switch) Simulation
    if (isAgent && (lowerInput.includes("research") || lowerInput.includes("calculate"))) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "system", type: "trace", content: "ReAct Loop Started. Step 1: Tool [WebSearch] dispatched..." }]);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "system", type: "trace", content: "ReAct Loop Step 2: Tool [DataCalculator] dispatched..." }]);
      }, 1200);

      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "system", type: "trace", content: "ReAct Loop Step 3: Tool [WebSearch] dispatched..." }]);
      }, 2400);

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "system",
          type: "kill-switch",
          content: "[AGENT GUARDRAIL] Maximum iteration depth reached (Token Budget Exceeded). ReAct loop forcefully terminated to prevent runaway API costs."
        }]);
        setIsProcessing(false);
      }, 3600);
      return;
    }

    // 4. Standard Response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        type: "standard",
        content: "Request processed successfully. No policy violations detected."
      }]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <PageHeader
        title="Guardrail Penetration Testing"
        subtitle="Validate AWS Bedrock safety profiles, PII redaction, and agent kill-switches before production deployment."
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 min-h-0">
        
        {/* Left Column: Simulation Console */}
        <div className="lg:col-span-2 panel flex flex-col overflow-hidden">
          <div className="bg-[#1e1e1e] p-3 border-b border-[#333] flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70 text-[12px] font-mono">
              <Terminal className="h-4 w-4" />
              platform-simulator // {app?.name || "sandbox"}
            </div>
            <div className="flex items-center gap-2">
               <span className="pill bg-success/20 text-success border-success/30 font-mono text-[10px]">E-23 Active</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-[#0d1117] space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-md p-3 text-[13px] font-mono ${
                  msg.role === "user" 
                    ? "bg-[#1f6feb] text-white" 
                    : msg.type === "trace"
                    ? "bg-transparent text-[#8b949e] border border-[#30363d]"
                    : msg.type === "intercept"
                    ? "bg-[#490202] text-[#ff7b72] border border-[#8e1519]"
                    : msg.type === "kill-switch"
                    ? "bg-[#4a3600] text-[#e3b341] border border-[#9e6a03]"
                    : "bg-[#21262d] text-[#c9d1d9] border border-[#30363d]"
                }`}>
                  {msg.type === "intercept" && <ShieldAlert className="h-4 w-4 mb-1.5" />}
                  {msg.type === "kill-switch" && <StopCircle className="h-4 w-4 mb-1.5" />}
                  {msg.content}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="text-[#8b949e] font-mono text-[12px] animate-pulse pl-2">
                Evaluating safety policies...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
                placeholder="Type a test payload (e.g., '123-456-789' or 'ignore previous instructions')..."
                className="w-full bg-[#0d1117] text-[#c9d1d9] border border-[#30363d] rounded-md pl-4 pr-12 py-3 text-[13px] font-mono focus:outline-none focus:border-[#1f6feb] placeholder:text-[#484f58]"
                disabled={isProcessing}
              />
              <button 
                onClick={handleSimulate}
                disabled={isProcessing || !input.trim()}
                className="absolute right-2 top-2 p-1.5 text-[#1f6feb] hover:bg-[#1f6feb]/10 rounded disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Telemetry */}
        <div className="space-y-6 overflow-y-auto">
          <div className="panel p-0 overflow-hidden">
            <div className="bg-muted/30 p-3 border-b border-border">
              <h3 className="text-[13px] font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Active Guardrails
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Fingerprint className="h-3.5 w-3.5" /> PII Redaction</span>
                <span className="font-semibold text-success">BLOCK</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1.5 text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5" /> Prompt Injection</span>
                <span className="font-semibold text-success">BLOCK</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Data Exfiltration</span>
                <span className="font-semibold text-success">BLOCK</span>
              </div>
            </div>
          </div>

          {isAgent && (
            <div className="panel p-0 overflow-hidden border-warning/30">
              <div className="bg-warning-soft/30 p-3 border-b border-warning/20">
                <h3 className="text-[13px] font-semibold text-warning flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Agentic Flight Controls
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Token Budget</span>
                    <span className="font-mono">0 / 10,000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-warning h-1.5 rounded-full w-[0%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">ReAct Iteration Depth</span>
                    <span className="font-mono">0 / 3 MAX</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-warning h-1.5 rounded-full w-[0%]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}