import { useMemo } from "react";
import { BUILDING_BLOCKS, AWS_SERVICE_NODES, SERVICE_EDGES } from "@/lib/mockData";

interface Props {
  blockIds: string[];
}

// Layout constants
const NODE_W = 110;
const NODE_H = 42;
const H_GAP = 18;
const V_GAP = 32;
const PAD_X = 16;
const PAD_TOP = 32;

export function ArchDiagram({ blockIds }: Props) {
  const { nodes, edges, svgW, svgH } = useMemo(() => {
    // 1. Collect which service node IDs are active
    const activeServiceIds = new Set<string>();
    // ECS is always present (platform runtime)
    activeServiceIds.add("ecs");

    for (const blockId of blockIds) {
      const block = BUILDING_BLOCKS.find((b) => b.id === blockId);
      block?.awsServices.forEach((s) => activeServiceIds.add(s));
    }

    // 2. Group active nodes by layer
    const byLayer: Record<number, string[]> = {};
    for (const [id, def] of Object.entries(AWS_SERVICE_NODES)) {
      if (activeServiceIds.has(id)) {
        if (!byLayer[def.layer]) byLayer[def.layer] = [];
        byLayer[def.layer].push(id);
      }
    }

    // 3. Compute positions
    const layers = [1, 2, 3, 4].filter((l) => byLayer[l]?.length);
    const maxPerRow = Math.max(...layers.map((l) => byLayer[l]?.length ?? 0));
    const svgW = Math.max(300, maxPerRow * (NODE_W + H_GAP) - H_GAP + PAD_X * 2);

    const positions: Record<string, { x: number; y: number }> = {};
    let y = PAD_TOP;

    // Developer entry node (not a service node, just visual)
    const devY = 4;

    for (const layer of layers) {
      const ids = byLayer[layer];
      const rowW = ids.length * NODE_W + (ids.length - 1) * H_GAP;
      const startX = (svgW - rowW) / 2;
      ids.forEach((id, i) => {
        positions[id] = { x: startX + i * (NODE_W + H_GAP), y };
      });
      y += NODE_H + V_GAP;
    }

    const svgH = y + 16;

    // 4. Filter edges to only those where both endpoints are active
    const activeEdges = SERVICE_EDGES.filter(
      ([a, b]) => activeServiceIds.has(a) && activeServiceIds.has(b)
    );

    return { nodes: positions, activeServiceIds, edges: activeEdges, svgW, svgH, devY };
  }, [blockIds]);

  const ecsPos = nodes["ecs"];
  const devBoxW = 100;
  const devBoxH = 26;
  const devX = ecsPos ? ecsPos.x + NODE_W / 2 - devBoxW / 2 : 0;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgW} ${svgH + 40}`}
        className="w-full h-auto min-h-[200px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#94a3b8" />
          </marker>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* VPC boundary */}
        <rect
          x={4} y={4} width={svgW - 8} height={svgH + 32}
          rx="8" fill="#f0f9ff" stroke="#0079C1"
          strokeWidth="1.2" strokeDasharray="6 4" fillOpacity="0.4"
        />
        <text x={12} y={16} fontSize="8" fill="#0079C1" fontWeight="600" fontFamily="system-ui">
          VPC — Private Subnets Only · All traffic via PrivateLink
        </text>

        {/* Developer entry */}
        {ecsPos && (
          <>
            <rect x={devX} y={PAD_TOP - 46} width={devBoxW} height={devBoxH}
              rx="5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.2" />
            <text x={devX + devBoxW / 2} y={PAD_TOP - 46 + 11} textAnchor="middle"
              fontSize="9" fontWeight="600" fill="#334155" fontFamily="system-ui">
              👤 Developer / API
            </text>
            <text x={devX + devBoxW / 2} y={PAD_TOP - 46 + 21} textAnchor="middle"
              fontSize="7" fill="#94a3b8" fontFamily="system-ui">
              HTTPS via API Gateway
            </text>
            {/* Arrow dev → ecs */}
            <line
              x1={devX + devBoxW / 2} y1={PAD_TOP - 20}
              x2={ecsPos.x + NODE_W / 2} y2={ecsPos.y}
              stroke="#94a3b8" strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
          </>
        )}

        {/* Edges between service nodes */}
        {edges.map(([a, b], i) => {
          const posA = nodes[a];
          const posB = nodes[b];
          if (!posA || !posB) return null;
          const x1 = posA.x + NODE_W / 2;
          const y1 = posA.y + NODE_H;
          const x2 = posB.x + NODE_W / 2;
          const y2 = posB.y;
          // If same layer, draw a curved sibling edge
          const sameLayer = Math.abs(y1 - (posB.y + NODE_H)) < 5 || Math.abs(posA.y - posB.y) < 5;
          if (sameLayer) {
            const midX = (x1 + x2) / 2;
            const midY = Math.min(posA.y, posB.y) - 14;
            return (
              <path key={i}
                d={`M${x1},${posA.y + NODE_H / 2} Q${midX},${midY} ${x2},${posB.y + NODE_H / 2}`}
                fill="none" stroke="#cbd5e1" strokeWidth="1.2"
                strokeDasharray="4 3" markerEnd="url(#arrowhead)"
              />
            );
          }
          return (
            <line key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#cbd5e1" strokeWidth="1.2"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Service nodes */}
        {Object.entries(nodes).map(([id, pos]) => {
          const def = AWS_SERVICE_NODES[id];
          if (!def) return null;
          return (
            <g key={id} filter="url(#shadow)">
              <rect
                x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx="6"
                fill={def.color + "18"} stroke={def.color} strokeWidth="1.8"
              />
              <text x={pos.x + NODE_W / 2} y={pos.y + 15} textAnchor="middle"
                fontSize="9" fontWeight="700" fill={def.color} fontFamily="monospace">
                {def.label}
              </text>
              <text x={pos.x + NODE_W / 2} y={pos.y + 28} textAnchor="middle"
                fontSize="7.5" fill="#64748b" fontFamily="system-ui">
                {def.sublabel}
              </text>
            </g>
          );
        })}

        {/* Empty state */}
        {Object.keys(nodes).length === 0 && (
          <text x={svgW / 2} y={80} textAnchor="middle" fontSize="12" fill="#94a3b8" fontFamily="system-ui">
            Select building blocks to see architecture
          </text>
        )}
      </svg>

      {/* Block count legend */}
      <div className="mt-2 flex items-center gap-3 flex-wrap px-1">
        <span className="text-[10px] text-muted-foreground">
          {Object.keys(nodes).length} AWS services active
        </span>
        <span className="text-[10px] text-muted-foreground">·</span>
        <span className="text-[10px] text-muted-foreground">
          All traffic via VPC PrivateLink · No internet egress to AWS services
        </span>
      </div>
    </div>
  );
}