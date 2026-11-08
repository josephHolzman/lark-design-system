"use client";

import { PauseIcon, PlayIcon, XIcon } from "lucide-react";
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
    actions: (
      <Button aria-label="Pause the approval brief" size="icon-xs" variant="ghost">
        <PauseIcon />
      </Button>
    ),
    agent: { ai: true, name: "ACE" },
    context: "Finance asked for the margin breakdown before the 3 PM review.",
    id: "t1",
    progress: { label: "Approval brief progress", max: 8, value: 5 },
    state: "running",
    title: "Prepare the approval brief for Northwind renewal revision 4",
  },
  {
    action: (
      <Button size="sm" variant="secondary">
        Open draft
      </Button>
    ),
    actions: (
      <>
        <Button aria-label="Regenerate the buyer reply" size="icon-xs" variant="ghost">
          <PlayIcon />
        </Button>
        <Button aria-label="Discard the buyer reply" size="icon-xs" variant="ghost">
          <XIcon />
        </Button>
      </>
    ),
    agent: { name: "Priya Raman" },
    context: "The buyer asked twice about the price book change.",
    id: "t2",
    state: "needs-review",
    title: "Draft a reply to the buyer about extension pricing for years two and three",
  },
  {
    agent: { ai: true, name: "ACE" },
    context: "Starts once the 2027 pricing policy is published.",
    id: "t3",
    state: "queued",
    title: "Check the renewal against the 2027 regional discount floors",
  },
  {
    agent: { name: "Dana Ito" },
    context: "The margin breakdown and the pricing exhibits are attached.",
    id: "t4",
    state: "done",
    title: "Collect the pricing exhibits for the approval packet",
  },
  {
    action: (
      <Button size="sm" variant="secondary">
        Retry
      </Button>
    ),
    agent: { ai: true, name: "ACE" },
    context: "The pricing service timed out after the third attempt.",
    id: "t5",
    state: "failed",
    title: "Recalculate the net price after the term change",
  },
  {
    agent: { name: "Marcus Bell" },
    context: "The buyer accepted the 24-month term and the new ramp.",
    id: "t6",
    state: "done",
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
