"use client";

import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";

import { type ActivityEntry, ActivityFeed, ActivityFeedSkeleton, SituationSummary } from "@/components/lark/activity";
import { SectionCard } from "@/components/lark/cards";
import { SourceLine } from "@/components/lark/cpq";
import { Callout, StatePanel } from "@/components/lark/feedback";
import { PageHeader } from "@/components/lark/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { type ExampleState, StateSwitcher } from "../_shared/state-switcher";

/* ActivityFeed + SituationSummary in every state. Every person, company and message is invented. */

const NOW = new Date("2026-11-07T15:00:00");
const at = (daysAgo: number, h: number, m = 0) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const BASE: ActivityEntry[] = [
  { id: "1", party: "customer", author: "Jordan Lee, Northwind Freight (example)", object: "the Northwind renewal", title: "Asked to keep the 22% discount for all three years", message: "We can sign this month if year two and three hold at 22%. Otherwise we need to take it back to procurement.", at: at(0, 10, 12), reference: "Re: Renewal terms" },
  { id: "2", party: "seller", author: "Priya Raman", object: "quote R4", title: "Sent revision 4", message: "Attached R4 with the three-year ramp. Happy to walk through it tomorrow.", at: at(0, 11, 5), reference: "Quote R4" },
  { id: "3", party: "internal", author: "Marcus Bell, Finance", object: "the discount", title: "Asked for margin at net 60 before approving", message: "Need to see margin with net 60 terms before I can approve.", at: at(0, 9, 40), reference: "#deal-desk" },
  { id: "8", party: "ace", author: "ACE", object: "quote R4", title: "Drafted a reply to Jordan Lee", message: "The draft holds 22% for years two and three and cites the ramp. It is not sent.", at: at(0, 8, 55), reference: "Draft in Outlook" },
  { id: "9", party: "system", author: "Salesforce sync", object: "the opportunity", title: "updated 14 fields", noise: true, detail: "Amount, close date, stage and 11 other fields changed. The quote and approval route were not touched.", at: at(0, 8, 30), reference: "Sync 8841" },
  { id: "4", party: "system", author: "Approval service", object: "the route", title: "Started pricing and finance review", at: at(1, 16, 20), reference: "Route v3" },
  { id: "5", party: "customer", author: "Jordan Lee, Northwind Freight (example)", object: "the start date", title: "Confirmed it", message: "January 1 works for us.", at: at(1, 14, 2), reference: "Re: Start date" },
  { id: "6", party: "internal", author: "Dana Ito, Deal desk", object: "quote R4", title: "Approved the quote over $100k", at: at(4, 9, 12), reference: "Approval 1 of 6" },
  { id: "7", party: "seller", author: "Priya Raman", object: "the procurement call", title: "Logged the notes", message: "Procurement will not accept net 30. Net 60 is their standard.", at: at(4, 8, 30), reference: "Call notes" },
];

function entriesFor(state: ExampleState): ActivityEntry[] {
  switch (state) {
    case "empty":
      return [];
    case "partial":
      return BASE.map((e, i) => (i % 2 ? { ...e, message: undefined, reference: undefined } : { ...e, author: i === 0 ? "Unknown sender" : e.author }));
    case "long":
      return [
        {
          id: "L1",
          party: "customer",
          author: "Bartholomew Featherstonehaugh-Montgomery, Consolidated Intercontinental Logistics Holdings (example)",
          title: "Asked to cap the three-year total at $37,440,000.00 including all professional services and support",
          message: "Our board approved $37,440,000.00 as the ceiling. Anything above that, including the $1,248,000.00 in services, needs another round with the audit committee, which meets quarterly.",
          at: at(0, 10, 12),
          reference: "Re: Re: Re: FW: Consolidated Intercontinental Logistics: master services agreement renewal, pricing exhibit B, revision 11",
        },
        ...BASE,
      ];
    case "conflict":
      return [
        { id: "C1", party: "system", author: "Salesforce sync", title: "Marked Finance as approved", at: at(0, 9, 12), reference: "Opportunity history" },
        ...BASE,
      ];
    case "permission":
      return BASE.filter((e) => e.party !== "customer");
    case "many":
      return Array.from({ length: 120 }, (_, i) => {
        const e = BASE[i % BASE.length];
        return { ...e, id: `M${i}`, at: at(Math.floor(i / 6), 17 - (i % 6), (i * 7) % 60) };
      });
    default:
      return BASE;
  }
}

function Body({ state }: { state: ExampleState }) {
  const [extra, setExtra] = useState<ActivityEntry[]>([]);
  if (state === "loading") return <ActivityFeedSkeleton />;
  if (state === "error")
    return (
      <StatePanel
        actions={
          <Button size="sm" variant="secondary">
            <RefreshCwIcon /> Try again
          </Button>
        }
        description="Email and Slack history couldn't be loaded. Quote and approval events are unaffected."
        details="Request 2b91-04ce"
        kind="error"
        title="Couldn't load activity"
      />
    );
  return (
    <div className="flex flex-col gap-4">
      {state === "conflict" && (
        <Callout title="Two sources disagree about Finance" tone="caution">
          Salesforce marked Finance approved at 9:12 AM; in Slack, Marcus Bell asked for more at 9:40 AM. Treat Finance as not approved until he decides.
        </Callout>
      )}
      {state === "permission" && (
        <Callout title="Customer messages are hidden" tone="info">
          Your role doesn&apos;t include customer email. Seller, internal and system activity is shown.
        </Callout>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body-md text-on-surface-variant">New activity waits behind a count, so the feed does not move under the reader.</p>
        <Button
          onClick={() =>
            setExtra((prev) => [
              ...prev,
              {
                id: `new-${prev.length + 1}`,
                party: "internal",
                author: "Dana Ito, Deal desk",
                object: "the exception",
                title: "Asked Rui Tanaka to review the 22% discount",
                at: at(0, 15, 0),
                reference: "#deal-desk",
              },
            ])
          }
          size="xs"
          variant="secondary"
        >
          Show how a new update arrives
        </Button>
      </div>
      <ActivityFeed
        empty={<StatePanel compact description="Emails, calls, approvals and quote changes show up here as they happen." kind="first-run" title="No activity on this deal yet" />}
        entries={[...entriesFor(state), ...extra]}
        now={NOW}
        provenance={
          <>
            <Badge variant="outline">Example data</Badge>
            <SourceLine meta="synced 2 min ago" service="Gmail" />
            <SourceLine service="Slack" />
            <SourceLine service="Salesforce" />
          </>
        }
      />
    </div>
  );
}

export function DealActivityExample() {
  return (
    <div className="flex flex-col gap-module-gap">
      <PageHeader description="SituationSummary over ActivityFeed, in every state. Parties are coded by mark, colour and word." title="Deal activity" />
      <StateSwitcher>
        {(state) => (
          <div className="flex flex-col gap-module-gap">
            {state !== "loading" && state !== "error" && state !== "empty" && (
              <SituationSummary
                action={{ label: "Open approval" }}
                next="Finance decides on net 60 margin; Priya sends the numbers today."
                problem="The buyer won't sign until the 22% discount holds for all three years."
                since="9:40 AM, when Finance asked for margin at net 60"
                status={state === "conflict" ? "attention" : "blocked"}
                statusLabel={state === "conflict" ? "Needs attention: sources disagree" : "Blocked on approval"}
              />
            )}
            <SectionCard title="What has been said and done on this deal?">
              <Body state={state} />
            </SectionCard>
          </div>
        )}
      </StateSwitcher>
    </div>
  );
}
