import { useMemo } from "react";
import { USE_CASE_FLOWS, BUILDING_BLOCKS, type FlowNode, type FlowEdge } from "@/lib/mockData";

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_W = 152;
const NODE_H = 48;
const LAYER_GAP = 38;   // vertical space between layers
const NODE_GAP = 14;    // horizontal space between parallel nodes in same layer
const PAD_X = 20;
const PAD_Y = 28;

interface Props {
  ucId?: string;
  blockIds: string[];
}

export function ArchDiagram({ ucId, blockIds }: Props) {
  const flow = ucId ? USE_CASE_FLOWS[ucId] : null;

  // ── Determine visible nodes ────────────────────────────────────────────────
  const visibleNodes = useMemo<FlowNode[]>(() => {
    if (!flow) return [];
    return flow.nodes.filter(
      (n) => n.blockId === null || blockIds.includes(n.blockId)
    );
  }, [flow, blockIds]);

  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // ── Determine visible edges ────────────────────────────────────────────────
  const visibleEdges = useMemo<FlowEdge[]>(() => {
    if (!flow) return [];
    return flow.edges.filter((e) => {
      if (!visibleIds.has(e.from) || !visibleIds.has(e.to)) return false;
      if (e.requiresBlocks?.some((b) => !blockIds.includes(b))) return false;
      if (e.showWhenAbsent?.some((b) => blockIds.includes(b))) return false;
      return true;
    });
  }, [flow?.edges, visibleIds, blockIds]);

  // ── Compute top-to-bottom layout ──────────────────────────────────────────
  const { positions, svgW, svgH } = useMemo(() => {
    if (visibleNodes.length === 0) return { positions: {}, svgW: 240, svgH: 120 };

    // Group nodes by layer
    const byLayer = new Map<number, FlowNode[]>();
    visibleNodes.forEach((n) => {
      if (!byLayer.has(n.layer)) byLayer.set(n.layer, []);
      byLayer.get(n.layer)!.push(n);
    });

    const layers = Array.from(byLayer.keys()).sort((a, b) => a - b);
    const layerIndex = new Map(layers.map((l, i) => [l, i]));

    // Max width determined by widest layer
    const maxNodesInLayer = Math.max(...layers.map((l) => byLayer.get(l)!.length));
    const contentW = maxNodesInLayer * NODE_W + (maxNodesInLayer - 1) * NODE_GAP;
    const svgW = contentW + PAD_X * 2;

    // SVG height
    const numLayers = layers.length;
    const svgH = PAD_Y * 2 + numLayers * NODE_H + (numLayers - 1) * LAYER_GAP;

    // Compute positions (top-to-bottom, centered horizontally per layer)
    const positions: Record<string, { x: number; y: number }> = {};
    for (const [layer, nodes] of byLayer.entries()) {
      const li = layerIndex.get(layer)!;
      const y = PAD_Y + li * (NODE_H + LAYER_GAP);
      const rowW = nodes.length * NODE_W + (nodes.length - 1) * NODE_GAP;
      const startX = (svgW - rowW) / 2;
      nodes.forEach((n, ni) => {
        positions[n.id] = { x: startX + ni * (NODE_W + NODE_GAP), y };
      });
    }

    return { positions, svgW, svgH };
  }, [visibleNodes]);

  // ── No use case selected ──────────────────────────────────────────────────
  if (!flow) {
    return (
      <div className="flex items-center justify-center h-32 border border-dashed border-border rounded text-[12px] text-muted-foreground text-center px-4">
        Select a use case to see its architecture diagram, or compose custom blocks above to see active services.
      </div>
    );
  }

  // ── Removed block hint ────────────────────────────────────────────────────
  const totalFlowNodes = flow.nodes.length;
  const missingCount = totalFlowNodes - visibleNodes.length;

  return (
    <div className="w-full">
      <div className="overflow-auto max-h-[520px] rounded border border-border bg-[#f8fafc]">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ width: svgW, height: svgH, minWidth: "100%" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker id="ah-solid" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#94a3b8" />
            </marker>
            <marker id="ah-dashed" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#cbd5e1" />
            </marker>
            <filter id="card-shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Platform boundary box */}
          <rect
            x={4} y={PAD_Y - 18} width={svgW - 8} height={svgH - PAD_Y + 14}
            rx="8" fill="#f0f9ff" stroke="#0079C1"
            strokeWidth="1" strokeDasharray="6 4" fillOpacity="0.5"
          />
          <text x={10} y={PAD_Y - 6} fontSize="8" fill="#0079C1" fontWeight="600" fontFamily="system-ui">
            VPC Private Subnets — All traffic via PrivateLink · No internet egress
          </text>

          {/* Edges (draw before nodes so nodes sit on top) */}
          {visibleEdges.map((edge, i) => {
            const src = positions[edge.from];
            const dst = positions[edge.to];
            if (!src || !dst) return null;

            const isDashed = edge.dashed;
            const markerUrl = isDashed ? "url(#ah-dashed)" : "url(#ah-solid)";
            const strokeColor = isDashed ? "#cbd5e1" : "#94a3b8";
            const strokeWidth = isDashed ? 1.2 : 1.8;

            // Source: bottom center of source node
            const x1 = src.x + NODE_W / 2;
            const y1 = src.y + NODE_H;

            // Destination: top center of destination node
            const x2 = dst.x + NODE_W / 2;
            const y2 = dst.y;

            // Same layer → sibling edge (arc to the side)
            if (src.y === dst.y) {
              const midX = (x1 + x2) / 2;
              const arcY = src.y + NODE_H + 10;
              return (
                <path
                  key={i}
                  d={`M${src.x + NODE_W},${src.y + NODE_H / 2} Q${midX},${arcY} ${dst.x},${dst.y + NODE_H / 2}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isDashed ? "4 3" : undefined}
                  markerEnd={markerUrl}
                />
              );
            }

            // Normal: bezier from bottom center to top center
            const cpY = (y1 + y2) / 2;
            return (
              <path
                key={i}
                d={`M${x1},${y1} C${x1},${cpY} ${x2},${cpY} ${x2},${y2}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isDashed ? "4 3" : undefined}
                markerEnd={markerUrl}
              />
            );
          })}

          {/* Nodes */}
          {visibleNodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const isRequired = node.blockId === null ||
              BUILDING_BLOCKS.find((b) => b.id === node.blockId)?.required;

            return (
              <g key={node.id} filter="url(#card-shadow)">
                {/* Card background */}
                <rect
                  x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx="7"
                  fill="white" stroke={node.color} strokeWidth={isRequired ? 2 : 1.5}
                />
                {/* Color accent bar at top */}
                <rect
                  x={pos.x} y={pos.y} width={NODE_W} height={4} rx="5"
                  fill={node.color}
                />
                {/* Top label */}
                <text
                  x={pos.x + NODE_W / 2} y={pos.y + 20}
                  textAnchor="middle" fontSize="9.5" fontWeight="700"
                  fill={node.color} fontFamily="monospace"
                  style={{ letterSpacing: "0.02em" }}
                >
                  {node.label}
                </text>
                {/* Sublabel */}
                <text
                  x={pos.x + NODE_W / 2} y={pos.y + 34}
                  textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="system-ui"
                >
                  {node.sublabel.length > 32 ? node.sublabel.slice(0, 30) + "…" : node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend strip */}
      <div className="flex items-center justify-between mt-2 px-0.5">
        <div className="text-[10px] text-muted-foreground">
          {visibleNodes.length} service nodes active
          {missingCount > 0 && (
            <span className="ml-2 text-warning">
              · {missingCount} hidden (block not selected)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span style={{ display: "inline-block", width: 16, borderTop: "2px solid #94a3b8" }} />
            data flow
          </span>
          <span className="flex items-center gap-1">
            <span style={{ display: "inline-block", width: 16, borderTop: "2px dashed #cbd5e1" }} />
            optional / bypass
          </span>
        </div>
      </div>
    </div>
  );
}
