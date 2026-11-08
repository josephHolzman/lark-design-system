"use client";

import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";

import { ApprovalPath, ApprovalPathSkeleton, type ApprovalPathProps } from "@/components/lark/approvals";
import { SectionCard } from "@/components/lark/cards";
import { SourceLine } from "@/components/lark/cpq";
import { DecisionPanel } from "@/components/lark/decision-panel";
import { FactGrid } from "@/components/lark/fact-grid";
import { Callout, type SaveState, StatePanel } from "@/components/lark/feedback";
import { PageHeader } from "@/components/lark/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { type ExampleState, StateSwitcher } from "../_shared/state-switcher";

/* ApprovalPath v2 in every state. All names and amounts are invented. */

type Stages = ApprovalPathProps["stages"];

const BASE: Stages = [
  {
    id: "desk",
    label: "Deal desk",
    mode: "parallel",
    approvers: [
      { name: "Dana Ito", role: "Deal desk", state: "approved", reason: "Every quote over $100k", channel: "Slack", when: "Nov 3, 9:12 AM" },
      { name: "Leo Varga", role: "Sales manager", state: "approved", reason: "Owner's manager signs off first", channel: "Outlook", when: "Nov 3, 2:40 PM" },
    ],
  },
  {
    id: "commercial",
    label: "Pricing and finance",
    mode: "parallel",
    approvers: [
      { name: "Priya Raman", role: "Pricing", state: "pending", reason: "Discount 22% is above the 15% floor", channel: "ACE", when: "6 hr" },
      { name: "Marcus Bell", role: "Finance", state: "pending", reason: "Payment terms net 60", channel: "Slack", when: "6 hr" },
    ],
  },
  { id: "legal", label: "Legal", approvers: [{ name: "Ana Souza", role: "Legal", state: "waiting", reason: "Liability cap changed in clause 7", delegation: "Approving for Sam Whitfield" }] },
  { id: "vp", label: "VP sales", approvers: [{ name: "Tom Becker", role: "VP sales", state: "waiting", reason: "Annual value over $400k" }] },
];

function stagesFor(state: ExampleState): Stages {
  switch (state) {
    case "partial":
      return [
        { id: "desk", label: "Deal desk", approvers: [{ name: "Dana Ito", role: "Deal desk", state: "approved" }] },
        { id: "commercial", label: "Pricing", approvers: [{ name: "Unassigned", role: "Pricing", state: "waiting", note: "No approver is set for this region yet." }] },
        { id: "legal", label: "Legal", approvers: [{ name: "Ana Souza", role: "Role not set", state: "waiting" }] },
      ];
    case "long":
      return [
        {
          id: "desk",
          label: "Regional deal desk review for enterprise renewals (EMEA and APAC)",
          mode: "parallel",
          approvers: [
            { name: "Bartholomew Featherstonehaugh-Montgomery", role: "Regional vice president, enterprise sales (EMEA and APAC)", state: "approved", when: "Nov 3, 9:12 AM", reason: "Annual contract value $12,480,000.00 is over the $10,000,000.00 limit" },
            { name: "Maximiliane Oyelaran-Wiśniewska", role: "Director of commercial excellence", state: "conditional", note: "Approved if the ramp starts at $8,750,000.00 in year one." },
          ],
        },
        { id: "finance", label: "Finance", approvers: [{ name: "Christopherson Abernathy-Delacroix", role: "Chief financial officer", state: "pending", reason: "Total contract value $37,440,000.00 over three years" }] },
        { id: "legal", label: "Legal", approvers: [{ name: "Ana Souza", role: "General counsel", state: "waiting" }] },
      ];
    case "conflict":
      return BASE.map((s) =>
        s.id === "commercial"
          ? { ...s, approvers: s.approvers.map((a) => (a.role === "Finance" ? { ...a, state: "returned" as const, when: "Today, 9:40 AM", note: "Returned in Slack: asks for the margin at net 60 before deciding." } : a)) }
          : s
      );
    case "permission":
      return BASE.map((s) => (s.id === "legal" || s.id === "vp" ? { ...s, approvers: s.approvers.map((a) => ({ ...a, restricted: true, reason: undefined })) } : s));
    case "many":
      return [
        ...BASE,
        { id: "security", label: "Security", approvers: [{ name: "Ivy Chen", role: "Security", state: "waiting", reason: "Customer asked for a data processing addendum" }] },
        {
          id: "ops",
          label: "Revenue operations",
          mode: "parallel",
          approvers: [
            { name: "Omar Haddad", role: "Billing", state: "waiting" },
            { name: "Grace Kim", role: "Order management", state: "waiting" },
            { name: "Rui Santos", role: "Tax", state: "skipped", reason: "No new tax region" },
          ],
        },
        { id: "cro", label: "Chief revenue officer", approvers: [{ name: "Helen Park", role: "CRO", state: "waiting", reason: "Discount above 30% in any year" }] },
      ];
    default:
      return BASE;
  }
}

function Body({ state }: { state: ExampleState }) {
  if (state === "loading") return <ApprovalPathSkeleton stages={4} />;
  if (state === "error")
    return (
      <StatePanel
        actions={
          <Button size="sm" variant="secondary">
            <RefreshCwIcon /> Try again
          </Button>
        }
        description="The approval service didn't answer. Nothing has changed on the quote."
        details="Request 7f3a-21c9"
        kind="error"
        title="Couldn't load the approval route"
      />
    );
  if (state === "empty") return <ApprovalPath stages={[]} />;
  return (
    <div className="flex flex-col gap-4">
      {state === "conflict" && (
        <Callout title="Two sources disagree about Finance" tone="caution">
          Salesforce shows Finance approved at 9:12 AM; Slack shows Marcus Bell returned it at 9:40 AM. The route shows the later one.
        </Callout>
      )}
      {state === "permission" && (
        <Callout title="Some approvers are hidden" tone="info">
          Your role can see the route and each decision, not who decides for Legal and the VP.
        </Callout>
      )}
      <ApprovalPath stages={stagesFor(state)} />
    </div>
  );
}

const DECISIONS = [
  {
    id: "approve",
    label: "Approve",
    consequence: "Records R4 at 22% and releases it to the buyer. The route closes and nothing else changes.",
    recommended: true,
  },
  {
    id: "changes",
    label: "Request changes",
    consequence: "Returns R4 to Priya with your note; the route pauses until she resubmits.",
    requiresReason: true,
  },
  {
    id: "reject",
    label: "Reject",
    consequence: "Closes the exception. R4 stays unsent and the platform line returns to list price.",
    requiresReason: true,
  },
];

const DECISION_FACTS = [
  { hint: "36 months, 5 lines", term: "Quote", value: "Northwind renewal, R4" },
  { hint: "Policy limit 15% for this region", term: "Discount", value: "22%" },
  { hint: "Floor 65%", term: "Margin", value: "71.2%" },
  { hint: "Annual recurring", term: "Net per year", value: "$333,903" },
  { hint: "The platform line; 2 points", term: "Changed since R3", value: "22% → 24%" },
  { hint: "Discount above 15% routes to Pricing and Finance", term: "Why routed here", value: "FY27 pricing policy, §2.1" },
];

function DecisionExample({ nonApprover }: { nonApprover?: boolean }) {
  const [status, setStatus] = useState<SaveState>("idle");
  return (
    <DecisionPanel
      actingFor={nonApprover ? undefined : "Dana Lee"}
      aside={nonApprover ? undefined : <FactGrid items={DECISION_FACTS} />}
      ask="Priya Raman (Pricing)"
      canDecide={!nonApprover}
      onRetry={() => setStatus("saved")}
      options={DECISIONS}
      primary={{ label: "Record decision", onSelect: () => setStatus("saved") }}
      question="Approve the 22% discount on Northwind renewal, quote R4?"
      reason={{ label: "Note", placeholder: "Add a comment, or say what needs to change" }}
      status={status}
      summary="Approving releases R4 to the buyer at 22% for three years. Requesting changes or rejecting needs a note Priya can act on."
    />
  );
}

export function ApprovalsExample() {
  return (
    <div className="flex flex-col gap-module-gap">
      <PageHeader description="ApprovalPath v2 in every state it has to handle. Open an approver to see why they're on the route." title="Approvals" />
      <StateSwitcher>
        {(state) => (
          <SectionCard
            footer={
              <span className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Example data</Badge>
                <SourceLine meta="synced 2 min ago" service="Salesforce" />
              </span>
            }
            title="Who still has to approve, and what's blocking?"
          >
            <Body state={state} />
          </SectionCard>
        )}
      </StateSwitcher>

      <SectionCard description="What the current approver sees: the figures the rule turns on, what changed since the last revision, and the three decisions. Approve takes an optional note; requesting changes or rejecting needs one." title="The decision, as the current approver sees it">
        <DecisionExample />
      </SectionCard>

      <SectionCard description="Everyone else sees the same facts as status, who to ask, and no buttons they cannot use." title="The same decision, for someone who is not the approver">
        <DecisionExample nonApprover />
      </SectionCard>
    </div>
  );
}
