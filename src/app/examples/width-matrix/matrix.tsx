"use client";

import { useState } from "react";

import { ActivityFeed, SituationSummary } from "@/components/lark/activity";
import { ApprovalPath } from "@/components/lark/approvals";
import { SectionCard } from "@/components/lark/cards";
import { ChatWelcome, ProactiveTask } from "@/components/lark/chat";
import { Figure, FigureStrip } from "@/components/lark/figure";
import { Segmented } from "@/components/lark/filters";
import { DescriptionItem, DescriptionList, List, ListItem } from "@/components/lark/lists";
import { PageHeader, PageTabs } from "@/components/lark/page-header";
import { StatusBadge } from "@/components/lark/status-badge";
import { ClampText, NoBreak, TruncateText } from "@/components/lark/text";

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

function Frame({ width }: { width: number }) {
  const [filter, setFilter] = useState("all");
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
      </div>
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
