"use client";

import type { ReactNode } from "react";

import type { AgentTaskCardProps } from "@/components/lark/agent-task";

import { Button } from "@/components/ui/button";

export const LONG_ACCOUNT = "Consolidated Intercontinental Logistics Holdings (example)";
export const LONG_TITLE = "Renewal for the enterprise platform, five regions, 148 trading partners and an open pricing exception";
export const NOW = new Date("2026-11-07T15:00:00");

export const ILLUSTRATION_SRC = {
  coral: "/illustrations/empty-approved.svg",
  evergreen: "/illustrations/empty-draft.svg",
  sky: "/illustrations/empty-approved.svg",
} as const;

export function sampleIllustration(tone: keyof typeof ILLUSTRATION_SRC): ReactNode {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- example art
    <img alt="" className="h-auto max-w-full" height={140} src={ILLUSTRATION_SRC[tone]} width={200} />
  );
}

export const QUOTES = [
  { id: "r4", title: "Northwind renewal with every region, product family and pricing exhibit · R4", account: "Northwind Freight International Holdings", value: "$12,480,000.00", status: "Awaiting decision" as const },
  { id: "h2", title: "Halvorsen expansion · R2", account: "Halvorsen Group", value: "$188,400.00", status: "Ready" as const },
  { id: "a7", title: "Atlas Logistics, three-year term · R1", account: "Atlas Logistics", value: "$6,120,000.00", status: "Draft" as const },
];

export const TASKS: (AgentTaskCardProps & { id: string })[] = [
  {
    action: <Button size="sm" variant="secondary">Review</Button>,
    agent: { ai: true, name: "ACE" },
    context: "Finance asked for the margin breakdown before the review.",
    id: "t1",
    progress: { max: 10, value: 6 },
    state: "running",
    title: `Prepare ${LONG_ACCOUNT} approval brief`,
  },
  {
    action: <Button size="sm" variant="secondary">Open</Button>,
    agent: { name: "Priya Raman" },
    context: "The buyer asked twice about the price book change.",
    id: "t2",
    state: "needs-review",
    title: "Draft a reply about extension pricing for years two and three",
  },
  {
    agent: { name: "Marcus Bell" },
    context: "The pricing service timed out after the third attempt.",
    id: "t3",
    state: "failed",
    title: "Recalculate the net price after the term change",
  },
];

export const VERSION_ROWS = [
  { after: "$421,000.00", before: "$412,800.00", id: "price", label: "Net price" },
  { after: "PO-88412", before: null, id: "po", label: "Purchase order" },
  { after: "", before: "Onsite training", id: "training", label: "Professional services" },
  { after: "Standard", before: "Standard", id: "support", label: "Support tier" },
];
