"use client";

import { Canvas } from "@/components/ai-elements/canvas";
import { Connection } from "@/components/ai-elements/connection";
import { Controls } from "@/components/ai-elements/controls";
import { Edge } from "@/components/ai-elements/edge";
import {
  Node,
  NodeContent,
  NodeDescription,
  NodeField,
  NodeFooter,
  NodeHeader,
  NodeHeading,
  NodeIcon,
  type NodeKind,
  type NodeStatus,
  NodeStatusBadge,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Panel } from "@/components/ai-elements/panel";
import { Toolbar } from "@/components/ai-elements/toolbar";
import { Button } from "@/components/ui/button";
import {
  CopyIcon,
  FileCheck2Icon,
  GitBranchIcon,
  PlayIcon,
  SendIcon,
  SparklesIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type StepData = {
  kind: NodeKind;
  label: string;
  description: string;
  status: NodeStatus;
  fields?: [string, string, boolean?][];
  footer?: string;
  handles: { target: boolean; source: boolean };
};

const ICON: Record<NodeKind, ReactNode> = {
  trigger: <ZapIcon />,
  ai: <SparklesIcon />,
  decision: <GitBranchIcon />,
  tool: <SendIcon />,
  output: <FileCheck2Icon />,
  default: <ZapIcon />,
};

const step = (
  id: string,
  x: number,
  y: number,
  data: StepData
) => ({ id, position: { x, y }, type: "step", data });

export const workflowNodes = [
  step("wf-trigger", 0, 40, {
    kind: "trigger",
    label: "Quote revision submitted",
    description: "Salesforce · Northwind renewal",
    status: "done",
    fields: [["Revision", "R4", true], ["Net value", "$1,001,710"]],
    handles: { source: true, target: false },
  }),
  step("wf-policy", 300, 40, {
    kind: "ai",
    label: "Check pricing policy",
    description: "Pricing agent",
    status: "running",
    fields: [["Lines checked", "6 of 9"], ["Policy", "FY27 discount v3", true]],
    footer: "3 sources · started 12s ago",
    handles: { source: true, target: true },
  }),
  step("wf-decision", 600, 40, {
    kind: "decision",
    label: "Discount above 20%?",
    description: "Effective discount on platform SKU",
    status: "queued",
    handles: { source: true, target: true },
  }),
  step("wf-notify", 900, -100, {
    kind: "tool",
    label: "Request approval",
    description: "Slack · #deal-desk",
    status: "idle",
    fields: [["Approver", "VP Finance"]],
    handles: { source: true, target: true },
  }),
  step("wf-output", 900, 170, {
    kind: "output",
    label: "Mark within limits",
    description: "Update the quote record",
    status: "idle",
    handles: { source: false, target: true },
  }),
];

export const workflowEdges = [
  { id: "e1", source: "wf-trigger", target: "wf-policy", type: "animated" },
  { id: "e2", source: "wf-policy", target: "wf-decision", type: "running" },
  { id: "e3", source: "wf-decision", target: "wf-notify", type: "default", label: "Yes" },
  { id: "e4", source: "wf-decision", target: "wf-output", type: "temporary", label: "No" },
];

const nodeTypes = {
  step: ({ data, selected }: { data: StepData; selected?: boolean }) => (
    <Node handles={data.handles} kind={data.kind} status={data.status}>
      <NodeHeader>
        <NodeIcon kind={data.kind}>{ICON[data.kind]}</NodeIcon>
        <NodeHeading>
          <NodeTitle>{data.label}</NodeTitle>
          <NodeDescription>{data.description}</NodeDescription>
        </NodeHeading>
      </NodeHeader>
      <NodeContent>
        {data.fields?.map(([k, v, mono]) => (
          <NodeField key={k} label={k} mono={mono}>
            {v}
          </NodeField>
        ))}
        <NodeStatusBadge className="mt-0.5" status={data.status} />
      </NodeContent>
      {data.footer && <NodeFooter>{data.footer}</NodeFooter>}
      <Toolbar isVisible={selected}>
        <Button aria-label="Run this step" size="icon-sm" variant="ghost">
          <PlayIcon />
        </Button>
        <Button aria-label="Duplicate step" size="icon-sm" variant="ghost">
          <CopyIcon />
        </Button>
        <Button aria-label="Delete step" size="icon-sm" variant="ghost">
          <Trash2Icon />
        </Button>
      </Toolbar>
    </Node>
  ),
};

export const edgeTypes = {
  animated: Edge.Animated,
  default: Edge.Default,
  running: Edge.Running,
  temporary: Edge.Temporary,
};

export function DealWorkflow({ panel = true }: { panel?: boolean }) {
  return (
    <Canvas
      connectionLineComponent={Connection}
      edges={workflowEdges}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ maxZoom: 1, padding: 0.08 }}
      nodes={workflowNodes}
      nodeTypes={nodeTypes}
    >
      <Controls showInteractive={false} />
      {panel && (
        <Panel position="top-left">
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="text-title-sm">Discount exception review</span>
            <span className="text-body-sm text-on-surface-variant">Run 3 · step 2 of 4</span>
          </div>
        </Panel>
      )}
    </Canvas>
  );
}

export default function Example() {
  return <DealWorkflow />;
}
