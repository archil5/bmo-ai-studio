import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";

interface Props {
  appName: string;
  blockIds: string[];
}

export function IaCGenerator({ appName, blockIds }: Props) {
  const [copied, setCopied] = useState(false);

  // Dynamically generate the AWS CDK code based on selected blocks
  const generateCDK = () => {
    const safeName = appName.replace(/[^a-zA-Z0-9]/g, "") || "BmoApp";
    const lowerName = safeName.toLowerCase();

    let code = `import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as opensearchserverless from 'aws-cdk-lib/aws-opensearchserverless';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';

export class ${safeName}Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==========================================
    // BMO AI Studio - Auto-Generated Scaffold
    // Target Environment: AWS (Enterprise Landing Zone)
    // ==========================================
`;

    if (blockIds.includes("COST") || blockIds.includes("OBSERVE")) {
      code += `
    // 🔒 MANDATORY GOVERNANCE: AIP Tagging & CloudWatch Metrics
    cdk.Tags.of(this).add('bmo:aip-cost-center', '${lowerName}-aip-001');
    cdk.Tags.of(this).add('bmo:observability-tier', 'mission-critical');
`;
    }

    if (blockIds.includes("VECTORSTORE")) {
      code += `
    // 📦 DATA & RETRIEVAL: OpenSearch Serverless (Vector)
    const vectorCollection = new opensearchserverless.CfnCollection(this, '${safeName}VectorStore', {
      name: '${lowerName}-docs',
      type: 'VECTORSEARCH'
    });
`;
    }

    if (blockIds.includes("MODEL")) {
      code += `
    // 🧠 FOUNDATION MODEL: OSFI E-23 Approved Model Binding
    const modelExecutionRole = new iam.Role(this, 'ModelExecRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
      ]
    });
`;
    }

    if (blockIds.includes("GUARDRAILS")) {
      code += `
    // 🛡️ SECURITY: Global PII & Prompt Injection Guardrails
    const strictGuardrail = new bedrock.CfnGuardrail(this, 'EnterpriseGuardrail', {
      name: '${lowerName}-safety-profile',
      contentPolicyConfig: {
        filtersConfig: [
          { type: 'PROMPT_ATTACK', inputStrength: 'HIGH' },
          { type: 'PII', inputStrength: 'HIGH' }
        ]
      },
      guardrailAction: 'BLOCK'
    });
`;
    }

    code += `  }
}
`;
    return code;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCDK());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-md border border-border bg-[#1e1e1e] overflow-hidden flex flex-col shadow-lg mt-6">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-2 text-white/70 text-[12px] font-mono">
          <Terminal className="h-3.5 w-3.5" />
          lib/{appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-stack.ts
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-white/70 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy CDK Scaffold"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[12px] font-mono leading-relaxed text-[#d4d4d4]">
        <pre>
          <code>{generateCDK()}</code>
        </pre>
      </div>
    </div>
  );
}