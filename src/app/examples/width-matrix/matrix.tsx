"use client";

import { useState } from "react";

import { ActivityFeed, SituationSummary } from "@/components/lark/activity";
import { AgentTaskGrid, type AgentTaskCardProps } from "@/components/lark/agent-task";
import { ApprovalPath } from "@/components/lark/approvals";
import { SectionCard } from "@/components/lark/cards";
import { ChatWelcome, ProactiveTask } from "@/components/lark/chat";
import { PolicyChecks } from "@/components/lark/cpq";
import { DecisionPanel } from "@/components/lark/decision-panel";
import { FactGrid } from "@/components/lark/fact-grid";
import type { SaveState } from "@/components/lark/feedback";
import { Figure, FigureStrip } from "@/components/lark/figure";
import { Segmented } from "@/components/lark/filters";
import { ImpactPreview } from "@/components/lark/impact-preview";
import { DescriptionItem, DescriptionList, List, ListItem } from "@/components/lark/lists";
import { MasterDetail } from "@/components/lark/master-detail";
import { NotificationsPanel } from "@/components/lark/notifications";
import { PageHeader, PageTabs } from "@/components/lark/page-header";
import { RecordDrawer } from "@/components/lark/record-drawer";
import { StatusBadge } from "@/components/lark/status-badge";
import { ClampText, NoBreak, TruncateText } from "@/components/lark/text";
import { VersionCompare } from "@/components/lark/version-compare";
import { Button } from "@/components/ui/button";

/*
  The width matrix (v0.7): the same content in frames at 280, 360, 480, 720 and 1080px.
  tests/e2e/width-matrix.spec.ts fails if anything in a frame is wider than the frame, if a
  tab bar or segmented control takes a second line, and screenshots each frame.
  Fake data, deliberately long.
*/

export const WIDTHS = [280, 360, 480, 720, 1080] as const;

const LONG_NAME = "Consolidated Intercontinental Logistics Holdings (example)";
const NOW = new Date("2026-11-07T15:00:00");
const STAGES = [
  { id: "a", label: "Deal desk", mode: "parallel" as const, approvers: [{ name: "Dana Ito", role: "Deal desk", state: "approved" as const }, { name: LONG_NAME, role: "Regional vice president, enterprise sales", state: "approved" as const, reason: "Over $12,480,000.00" }] },
  { id: "b", label: "Pricing and finance", mode: "parallel" as const, approvers: [{ name: "Priya Raman", role: "Pricing", state: "pending" as const }, { name: "Marcus Bell", role: "Finance", state: "returned" as const, note: "Needs margin at net 60" }] },
  { id: "c", label: "Legal", approvers: [{ name: "Ana Souza", role: "Legal", state: "waiting" as const }] },
];
const ENTRIES = [
  { id: "1", party: "customer" as const, author: `Jordan Lee, ${LONG_NAME}`, title: "Asked to hold 22% for three years", message: "We can sign this month if years two and three hold at 22%.", at: "2026-11-07T10:12:00", reference: "Re: Re: FW: Renewal terms, pricing exhibit B, revision 11" },
  { id: "2", party: "internal" as const, author: "Marcus Bell", title: "Returned the approval", at: "2026-11-06T09:40:00", reference: "#deal-desk" },
];

const TABS = ["Overview", "Quote lines", "Proposed changes", "Approvals", "Work & follow-through", "Documents", "Activity"];

const QUOTES = [
  { id: "r4", title: "Northwind renewal · R4", account: "Northwind Freight", value: "$412,800.00", status: "Awaiting decision" as const },
  { id: "h2", title: "Halvorsen expansion · R2", account: "Halvorsen Group", value: "$188,400.00", status: "Ready" as const },
];

const FACTS = [
  { term: "Account", value: LONG_NAME, hint: "Renewal, enterprise" },
  { term: "Net price", value: "$12,480,000.00", copy: true },
  { term: "Discount", value: 22.5 },
  { term: "Purchase order", value: null },
];

const SIGNALS = [
  { id: "s1", at: "2026-11-07T14:40:00", detail: "Dana Ito approved the 22% discount after the margin check.", kind: "approval" as const, title: "Finance approved R4", unread: true },
  { id: "s2", at: "2026-11-07T09:12:00", detail: "Can you check the margin on line 4?", kind: "mention" as const, mentionsMe: true, title: "Priya mentioned you", unread: true },
  { id: "s3", at: "2026-11-06T16:20:00", kind: "quote" as const, title: "Quote R3 sent" },
];

const TASKS: (AgentTaskCardProps & { id: string })[] = [
  {
    action: <Button size="sm" variant="secondary">Review brief</Button>,
    agent: { ai: true, name: "ACE" },
    description: "Finance asked for the margin breakdown before the review, with every policy check cited.",
    id: "t1",
    menu: [{ items: [{ label: "Pause while it runs" }, { label: "Reassign to Dana Ito" }, { label: "Dismiss task" }] }],
    progress: { max: 4, step: "Drafting the margin table", value: 2 },
    state: "running",
    time: "started 4 min ago",
    title: `Prepare ${LONG_NAME} approval brief`,
  },
  {
    action: <Button size="sm" variant="secondary">Open draft</Button>,
    agent: { name: "Priya Raman" },
    description: "The buyer asked twice about the price book change.",
    id: "t2",
    menu: [{ items: [{ label: "Regenerate the draft" }, { label: "Dismiss task" }] }],
    state: "needs-review",
    time: "drafted 12 min ago",
    title: "Draft a reply about extension pricing for years two and three",
  },
  {
    action: <Button size="sm" variant="secondary">Retry</Button>,
    agent: { name: "Marcus Bell" },
    description: "The pricing service timed out after the third attempt; nothing was saved.",
    id: "t3",
    menu: [{ items: [{ label: "Retry later" }, { label: "View the error log" }, { label: "Dismiss task" }] }],
    state: "failed",
    time: "failed 8 min ago",
    title: "Recalculate the net price after the term change",
  },
];

const DECISION_OPTIONS = [
  { consequence: "The quote goes to the buyer at 22% for three years.", id: "approve", label: "Approve the exception" },
  { consequence: "Stays within the regional floor; the buyer decides again.", id: "counter", label: "Counter at 20%", recommended: true },
  { consequence: "Nothing is sent until Finance reviews the margin.", disabled: "Finance has not set a floor for this region.", id: "hold", label: "Hold for Finance" },
];

const VERSION_ROWS = [
  { after: "$421,000.00", before: "$412,800.00", id: "price", label: "Net price" },
  { after: "PO-88412", before: null, id: "po", label: "Purchase order" },
  { after: "", before: "Onsite training", id: "training", label: "Professional services" },
  { after: "Standard", before: "Standard", id: "support", label: "Support tier" },
];

function Frame({ width }: { width: number }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | undefined>("r4");
  const [drawer, setDrawer] = useState(false);
  const [signals, setSignals] = useState(false);
  const [decision, setDecision] = useState<SaveState>("idle");
  const quote = QUOTES.find((q) => q.id === selected) ?? QUOTES[0];
  return (
    <section aria-label={`${width}px frame`} className="flex shrink-0 flex-col gap-2" data-frame={width} style={{ width }}>
      <h2 className="text-meta-strong text-on-surface-variant">{width}px</h2>
      <div className="flex flex-col gap-module-gap rounded-lg bg-canvas p-2" data-frame-body>
        <PageHeader title={<ClampText>{`Renewal for ${LONG_NAME}`}</ClampText>} />
        <PageTabs label={`Record sections at ${width}px`} tabs={TABS.map((t, i) => ({ label: t, href: `#${width}-${i}`, current: i === 2, count: i === 3 ? 6 : undefined }))} />
        <SectionCard
          action={<StatusBadge status="Awaiting decision" />}
          description="Discount is 22% against a 15% floor for the region, so Finance and Legal both have to approve."
          title="Who still has to approve, and what's blocking?"
        >
          <div className="flex flex-col gap-item">
            <Segmented
              aria-label={`Filter activity at ${width}px`}
              onValueChange={setFilter}
              options={[
                { value: "all", label: "All", count: 48 },
                { value: "customer", label: "Customer", count: 12 },
                { value: "seller", label: "Seller", count: 19 },
                { value: "internal", label: "Internal", count: 11 },
                { value: "system", label: "System", count: 6 },
              ]}
              value={filter}
            />
            <div className="rounded-lg bg-inset p-4">
              <DescriptionList>
                <DescriptionItem term="Account">
                  <TruncateText>{LONG_NAME}</TruncateText>
                </DescriptionItem>
                <DescriptionItem term="Net price">
                  <NoBreak>$12,480,000.00</NoBreak> per year
                </DescriptionItem>
                <DescriptionItem term="Owner">Bartholomew Featherstonehaugh-Montgomery</DescriptionItem>
              </DescriptionList>
            </div>
            <List dividers>
              <ListItem headline={LONG_NAME} meta="2 hr ago" supporting="Approved by Dana Ito after the margin check passed on revision 4" />
              <ListItem headline="Finance review" meta="Waiting" supporting="Needs margin above 38%" trailing={<StatusBadge status="Pending" />} />
            </List>
          </div>
        </SectionCard>
        <FigureStrip columns={2}>
          <Figure label="Annual contract value" value="$12,480,000" />
          <Figure label="Discount" unit="%" value="22.5" />
        </FigureStrip>
        <SituationSummary action={{ label: "Open approval" }} next="Finance decides on net 60." problem="The buyer won't sign until the 22% discount holds for three years." status="blocked" />
        <SectionCard title="Who still has to approve?">
          <ApprovalPath stages={STAGES} />
        </SectionCard>
        <SectionCard title="What has been said and done?">
          <ActivityFeed entries={ENTRIES} now={NOW} provenance={<span className="text-meta text-on-surface-variant">Example data</span>} />
        </SectionCard>
        <SectionCard flush title="Ask ACE">
          <ChatWelcome
            tasks={
              <>
                <ProactiveTask action="Prepare" meta="Due today" reason="Finance asked for the margin breakdown before the 3 PM review." title="Prepare approval brief" tone="urgent" />
                <ProactiveTask action="Draft" reason="The buyer asked twice about the price book change." title="Draft a reply to the buyer" />
              </>
            }
          />
        </SectionCard>
        <SectionCard title="Facts about the renewal">
          <FactGrid items={FACTS} />
        </SectionCard>
        <SectionCard title="Agent work">
          <AgentTaskGrid label={`Agent work at ${width}px`} tasks={TASKS} />
        </SectionCard>
        <DecisionPanel
          aside={<FactGrid items={FACTS} />}
          options={DECISION_OPTIONS}
          primary={{ label: "Send decision", onSelect: () => setDecision("saved") }}
          question="Approve the discount exception, or counter it?"
          reason={{ label: "Why", required: true }}
          secondary={{ label: "Save for later" }}
          status={decision}
          summary="The buyer asked to hold 22% for three years; the regional floor is 15%."
        />
        <SectionCard title="Compare revisions">
          <VersionCompare
            left={{ author: "Priya Raman", time: new Date("2026-11-06T15:20:00Z"), version: "Revision 3" }}
            right={{ author: "Dana Ito", time: new Date("2026-11-07T11:15:00Z"), version: "Revision 4" }}
            rows={VERSION_ROWS}
          />
        </SectionCard>
        <SectionCard title="What saving does">
          <ImpactPreview
            items={[
              { from: "22.5%", id: "discount", label: "Discount", to: "25.0%", tone: "increase" },
              { from: "$412,800.00", id: "price", label: "Net price", to: "$421,000.00", tone: "increase" },
              { from: "Deal desk", id: "route", label: "Approval route", to: "Deal desk and Legal", tone: "warning" },
            ]}
            policyChecks={<PolicyChecks checks={[{ id: "p1", rule: "Discount within the regional floor", status: "pass" }, { id: "p2", rule: "Legal review for a changed exhibit", status: "needs-approval" }]} />}
            summary="Saving re-prices the renewal and adds Legal to the approval route."
          />
        </SectionCard>
        <SectionCard title="The quote list and the open quote">
          <div className="h-80 overflow-hidden rounded-lg border border-edge">
            <MasterDetail
              detail={
                <div className="flex flex-col gap-3 p-4">
                  <h2 className="text-title-md text-on-surface">{quote.title}</h2>
                  <FactGrid columns={2} items={FACTS} />
                </div>
              }
              detailLabel="Quote record"
              list={
                <List>
                  {QUOTES.map((q) => (
                    <ListItem key={q.id} headline={q.title} meta={q.value} onClick={() => setSelected(q.id)} selected={q.id === quote.id} supporting={q.account} />
                  ))}
                </List>
              }
              listLabel="Quotes"
              onBack={() => setSelected(undefined)}
              selected={selected}
            />
          </div>
        </SectionCard>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setDrawer(true)} size="sm" variant="secondary">
            Open record
          </Button>
          <Button onClick={() => setSignals(true)} size="sm" variant="secondary">
            Deal signals
          </Button>
        </div>
      </div>
      <RecordDrawer
        footer={
          <Button onClick={() => setDrawer(false)} size="lg" variant="secondary">
            Close
          </Button>
        }
        onOpenChange={setDrawer}
        open={drawer}
        size="lg"
        subtitle={`${quote.account} · ${quote.value}`}
        tabs={[
          { current: true, href: "#overview", label: "Overview" },
          { count: 12, href: "#lines", label: "Quote lines" },
          { href: "#approvals", label: "Approvals" },
        ]}
        title={quote.title}
      >
        <div className="p-4">
          <FactGrid items={FACTS} />
        </div>
      </RecordDrawer>
      <NotificationsPanel items={SIGNALS} now={NOW} onOpenChange={setSignals} open={signals} />
    </section>
  );
}

export function WidthMatrix() {
  return (
    <div className="flex flex-col gap-module-gap">
      <PageHeader description="One set of content at five widths. Nothing may overflow its frame; tabs and segmented controls never wrap." title="Width matrix" />
      <div className="flex items-start gap-6 overflow-x-auto pb-4" data-slot="width-matrix" role="region" aria-label="Frames" tabIndex={0}>
        {WIDTHS.map((w) => (
          <Frame key={w} width={w} />
        ))}
      </div>
    </div>
  );
}
