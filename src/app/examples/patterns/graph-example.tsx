"use client";

import "@xyflow/react/dist/style.css";
import "../../../../packages/lark/src/graph.css";

import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  Handle,
  MiniMap,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import { Building2Icon, FileTextIcon, UserIcon, UsersIcon } from "lucide-react";
import type { ReactNode } from "react";

import { GraphEdgeLabel, GraphNode, type GraphTone } from "@/components/lark/graph";

type RecordData = { title: string; meta: string; tone: GraphTone; icon: ReactNode; dimmed?: boolean };

function RecordNode({ data, selected }: NodeProps<Node<RecordData>>) {
  return (
    <GraphNode dimmed={data.dimmed} icon={data.icon} meta={data.meta} selected={selected} title={data.title} tone={data.tone}>
      <Handle position={Position.Left} type="target" />
      <Handle position={Position.Right} type="source" />
    </GraphNode>
  );
}

function LabelledEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, selected }: EdgeProps) {
  const [path, x, y] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={path} />
      {label && (
        <EdgeLabelRenderer>
          <GraphEdgeLabel className={selected ? "border-primary text-on-surface" : undefined} style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}>
            {label}
          </GraphEdgeLabel>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = { record: RecordNode };
const edgeTypes = { labelled: LabelledEdge };

const nodes: Node<RecordData>[] = [
  { id: "acct", type: "record", position: { x: 0, y: 80 }, data: { title: "Northwind Traders", meta: "Account · Renewal", tone: "sky", icon: <Building2Icon /> } },
  { id: "opp", type: "record", position: { x: 300, y: 0 }, data: { title: "FY27 renewal", meta: "Opportunity · $412,800", tone: "sand", icon: <FileTextIcon /> }, selected: true },
  { id: "contact", type: "record", position: { x: 300, y: 160 }, data: { title: "Dana Whitfield", meta: "Contact · Procurement", tone: "evergreen", icon: <UserIcon /> } },
  { id: "team", type: "record", position: { x: 600, y: 80 }, data: { title: "Analytics team", meta: "Group · 1,200 seats", tone: "iris", icon: <UsersIcon />, dimmed: true } },
];

const edges: Edge[] = [
  { id: "e1", source: "acct", target: "opp", type: "labelled", label: "renews" },
  { id: "e2", source: "acct", target: "contact", type: "labelled", label: "employs" },
  { id: "e3", source: "opp", target: "team", type: "labelled", label: "covers" },
];

/** The patterns page's live ontology graph: GraphNode + GraphEdgeLabel on graph.css. */
export function GraphExample() {
  return (
    <div className="h-[340px] overflow-hidden rounded-lg border border-outline-variant">
      <ReactFlow edgeTypes={edgeTypes} edges={edges} fitView nodeTypes={nodeTypes} nodes={nodes} proOptions={{ hideAttribution: true }}>
        <Background gap={16} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
