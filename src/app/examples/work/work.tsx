"use client";

import { useState } from "react";

import { AgentTaskGrid, type AgentTaskCardProps } from "@/components/lark/agent-task";
import { SectionCard } from "@/components/lark/cards";
import { PolicyChecks, type PolicyCheck } from "@/components/lark/cpq";
import { DecisionPanel } from "@/components/lark/decision-panel";
import { FactGrid } from "@/components/lark/fact-grid";
import type { SaveState } from "@/components/lark/feedback";
import { ImpactPreview } from "@/components/lark/impact-preview";
import { PageHeader } from "@/components/lark/page-header";
import { VersionCompare } from "@/components/lark/version-compare";
import { Button } from "@/components/ui/button";

/* Every value is fake. The 0.8 work and decisions: agent tasks, the decision a reader makes,
   two versions of a record, and what a change will do before it is saved. */

const TASKS: (AgentTaskCardProps & { id: string })[] = [
  {
    action: (
      <Button size="sm" variant="secondary">
        Review brief
      </Button>
    ),
    agent: { ai: true, name: "ACE" },
    description: "Finance asked for the margin breakdown before the 3 PM review, with the policy checks cited.",
    id: "t1",
    menu: [
      {
        items: [
          { label: "Pause while it runs" },
          { label: "Reassign to Dana Ito" },
          { disabledReason: "The brief is still being written.", label: "Copy a link" },
        ],
      },
      { items: [{ destructive: true, label: "Dismiss task" }] },
    ],
    progress: { max: 4, step: "Drafting the margin table", value: 2 },
    state: "running",
    time: "started 4 min ago",
    title: "Prepare the approval brief for Northwind renewal revision 4",
  },
  {
    action: (
      <Button size="sm" variant="secondary">
        Open draft
      </Button>
    ),
    agent: { name: "Priya Raman" },
    description: "The buyer asked twice about the price book change, so the reply cites the 2027 floors.",
    id: "t2",
    menu: [{ items: [{ label: "Regenerate the draft" }, { label: "Reassign to Marcus Bell" }, { label: "Dismiss task" }] }],
    state: "needs-review",
    time: "drafted 12 min ago",
    title: "Draft a reply to the buyer about extension pricing for years two and three",
  },
  {
    agent: { ai: true, name: "ACE" },
    description: "Checks every renewal line against the regional floors before the quote can be priced.",
    id: "t3",
    menu: [{ items: [{ label: "Run now" }, { label: "Reassign to Priya Raman" }, { label: "Dismiss task" }] }],
    startsWhen: "Starts when the 2027 pricing policy is published.",
    state: "queued",
    time: "queued 2 min ago",
    title: "Check the renewal against the 2027 regional discount floors",
  },
  {
    action: (
      <Button size="sm" variant="secondary">
        Open result
      </Button>
    ),
    agent: { name: "Dana Ito" },
    description: "The margin breakdown and the pricing exhibits are attached to the approval packet.",
    id: "t4",
    menu: [{ items: [{ label: "Open the deal" }, { label: "Dismiss task" }] }],
    state: "done",
    time: "finished 1 hr ago",
    title: "Collect the pricing exhibits for the approval packet",
  },
  {
    action: (
      <Button size="sm" variant="secondary">
        Retry
      </Button>
    ),
    agent: { ai: true, name: "ACE" },
    description: "The pricing service timed out after the third attempt; nothing was written to the quote.",
    id: "t5",
    menu: [{ items: [{ label: "Retry later" }, { label: "View the error log" }, { label: "Dismiss task" }] }],
    state: "failed",
    time: "failed 8 min ago",
    title: "Recalculate the net price after the term change",
  },
  {
    agent: { name: "Marcus Bell" },
    description: "The buyer accepted the 24-month term and the new ramp, so the record now matches the buyer's note.",
    id: "t6",
    menu: [{ items: [{ label: "Open the quote" }, { label: "Dismiss task" }] }],
    state: "done",
    time: "finished yesterday",
    title: "Update the renewal term in the quote record",
  },
];

const OPTIONS = [
  {
    consequence: "The quote goes to the buyer at 22% for three years; Finance and Legal both review it.",
    id: "approve",
    label: "Approve the 22% exception",
  },
  {
    consequence: "Stays inside the regional floor; the buyer decides whether to accept 20%.",
    id: "counter",
    label: "Counter at 20%",
    recommended: true,
  },
  {
    consequence: "Nothing is sent until Finance confirms a floor for the region.",
    disabled: "Finance has not set a 2027 floor for this region yet.",
    id: "hold",
    label: "Hold for Finance",
  },
];

const CHECKS: PolicyCheck[] = [
  { detail: "22.5% is 7.5 points above the 15% floor.", id: "p1", rule: "Discount within the regional floor", status: "pass" },
  { approver: "Deal desk", detail: "Anything above 20% needs the deal desk to approve.", id: "p2", rule: "Discount above 20%", status: "needs-approval" },
  { detail: "The pricing exhibit changed in revision 4.", id: "p3", rule: "Legal review for a changed exhibit", status: "needs-approval", statusLabel: "Ready for review" },
];

export function Work() {
  const [status, setStatus] = useState<SaveState>("idle");

  return (
    <div className="flex flex-col gap-module-gap">
      <PageHeader
        description="Agent tasks, the decision a seller makes, two versions of a quote, and what a save will change. Example data throughout."
        title="Work and decisions"
      />

      <SectionCard description="Who acts, what the task is, its state in words and one action. Three across on a wide page; below 36rem the same tasks become rows." title="Agent work">
        <AgentTaskGrid label="Agent work on Northwind renewal" tasks={TASKS} />
      </SectionCard>

      <DecisionPanel
        aside={
          <FactGrid
            items={[
              { hint: "Renewal, enterprise", term: "Account", value: "Northwind Freight" },
              { term: "Net price", value: "$12,480,000.00" },
              { hint: "Against a 15% regional floor", term: "Discount", value: "22.5%" },
              { term: "Owner", value: "Priya Raman" },
            ]}
          />
        }
        onRetry={() => setStatus("saved")}
        options={OPTIONS}
        primary={{ label: "Send decision", onSelect: () => setStatus("saved") }}
        question="Approve the 22% discount, counter at 20%, or hold for Finance?"
        reason={{ label: "Why this decision", placeholder: "What the buyer and Finance should know", required: true }}
        secondary={{ label: "Save for later" }}
        status={status}
        summary="The buyer asked to hold 22% for three years. The regional floor is 15%, so either answer goes to Finance with this note."
      />

      <SectionCard description="Two revisions side by side, each change named and marked. Under 40rem each row reads before then after; Only changes hides what stayed the same." title="Compare revision 3 with revision 4">
        <VersionCompare
          left={{ author: "Priya Raman", time: new Date("2026-11-06T15:20:00Z"), version: "Revision 3" }}
          right={{ author: "Dana Ito", time: new Date("2026-11-07T11:15:00Z"), version: "Revision 4" }}
          rows={[
            { after: "$421,000.00", before: "$412,800.00", id: "price", label: "Net price" },
            { after: "PO-88412", before: null, id: "po", label: "Purchase order" },
            { after: "24 months", before: "36 months", id: "term", label: "Renewal term" },
            { after: "Standard", before: "Standard", id: "support", label: "Support tier" },
            { after: "", before: "Onsite training", id: "training", label: "Professional services" },
          ]}
        />
      </SectionCard>

      <SectionCard description="The sentence, the values that move and the checks behind them: what a seller sees before saving a change that re-prices and re-routes a quote." title="What saving this change will do">
        <ImpactPreview
          items={[
            { from: "22.5%", id: "discount", label: "Discount", to: "25.0%", tone: "increase" },
            { from: "$412,800.00", id: "price", label: "Net price", to: "$421,000.00", tone: "increase" },
            { from: "Deal desk", id: "route", label: "Approval route", to: "Deal desk and Legal", tone: "warning" },
          ]}
          policyChecks={<PolicyChecks checks={CHECKS} />}
          summary="Saving re-prices the renewal and adds Legal to the approval route before anything is sent to the buyer."
        />
      </SectionCard>
    </div>
  );
}
