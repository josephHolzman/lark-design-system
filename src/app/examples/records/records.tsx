"use client";

import { ArrowRightIcon, BellIcon, InboxIcon, ReceiptTextIcon } from "lucide-react";
import { useState } from "react";

import { FactGrid } from "@/components/lark/fact-grid";
import { CompanyLogo } from "@/components/lark/identity";
import { List, ListItem } from "@/components/lark/lists";
import { MasterDetail } from "@/components/lark/master-detail";
import { NotificationsPanel, type NotificationItem } from "@/components/lark/notifications";
import { PageHeader } from "@/components/lark/page-header";
import { RecordDrawer } from "@/components/lark/record-drawer";
import { SectionCard } from "@/components/lark/cards";
import { StatusBadge } from "@/components/lark/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* Every value is fake. The 0.8 record patterns: facts, list + detail, a record drawer and
   deal signals. */

const NOW = new Date("2026-11-07T15:00:00");

type Quote = {
  id: string;
  title: string;
  account: string;
  value: string;
  status: Parameters<typeof StatusBadge>[0]["status"];
  owner: string;
  close: string;
  discount: string;
  po: string | null;
};

const QUOTES: Quote[] = [
  { account: "Northwind Freight", close: "Dec 18, 2026", discount: "22.5%", id: "r4", owner: "Priya Raman", po: null, status: "Awaiting decision", title: "Northwind renewal · R4", value: "$412,800.00" },
  { account: "Halvorsen Group", close: "Nov 28, 2026", discount: "12.0%", id: "h2", owner: "Rui Tanaka", po: "PO-88412", status: "Ready", title: "Halvorsen expansion · R2", value: "$188,400.00" },
  { account: "Marlowe Logistics", close: "Jan 9, 2027", discount: "8.5%", id: "m1", owner: "Dana Ito", po: null, status: "Draft", title: "Marlowe logistics · R1", value: "$96,200.00" },
  { account: "Cedar & Field", close: "Nov 14, 2026", discount: "15.0%", id: "c3", owner: "Ana Souza", po: "PO-11730", status: "Approved", title: "Cedar & Field renewal · R3", value: "$74,500.00" },
];

const SIGNALS: NotificationItem[] = [
  {
    action: (
      <Button size="xs" variant="secondary">
        Open quote <ArrowRightIcon />
      </Button>
    ),
    at: "2026-11-07T14:40:00",
    detail: "Dana Ito approved the 22% discount after the margin check passed.",
    id: "s1",
    kind: "approval",
    title: "Finance approved R4",
    unread: true,
  },
  {
    at: "2026-11-07T09:12:00",
    detail: "Can you check the margin on line 4 before the 3 PM review?",
    id: "s2",
    kind: "mention",
    mentionsMe: true,
    title: "Priya mentioned you in Northwind renewal",
    unread: true,
  },
  {
    at: "2026-11-06T16:20:00",
    detail: "The buyer opened it twice; the pricing exhibit is still attached.",
    id: "s3",
    kind: "quote",
    title: "Quote R3 was sent to Halvorsen Group",
  },
  {
    at: "2026-11-05T11:00:00",
    detail: "ACE prepared it from the quote and the policy checks.",
    id: "s4",
    kind: "task",
    title: "Approval brief is ready",
  },
  {
    at: "2026-10-30T08:00:00",
    detail: "The 2027 discount floors took effect this morning.",
    id: "s5",
    kind: "system",
    title: "Pricing policy updated",
  },
];

function factsFor(quote: Quote) {
  return [
    { hint: "Renewal, enterprise", term: "Account", value: quote.account },
    { copy: true, term: "Net price", value: quote.value },
    { hint: "Against a 15% regional floor", term: "Discount", value: quote.discount },
    { term: "Owner", value: quote.owner },
    { term: "Close date", value: quote.close },
    { hint: quote.po ? "From the buyer's purchase order" : "Waiting for the buyer to send one", term: "Purchase order", value: quote.po },
  ];
}

function quoteDetail(quote: Quote) {
  return (
    <div className="flex flex-col gap-module-gap p-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-title-md text-on-surface">{quote.title}</h2>
          <StatusBadge status={quote.status} />
        </div>
        <p className="text-body-md text-on-surface-variant">
          {quote.account} · closes {quote.close} · owner {quote.owner}
        </p>
      </div>
      <FactGrid items={factsFor(quote)} />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">
          Review quote <ArrowRightIcon />
        </Button>
        <Button size="sm" variant="secondary">
          Open full record
        </Button>
      </div>
    </div>
  );
}

export function Records() {
  const [selected, setSelected] = useState<string | undefined>("r4");
  const [drawer, setDrawer] = useState(false);
  const [signals, setSignals] = useState(false);
  const [emptySignals, setEmptySignals] = useState(false);
  const [items, setItems] = useState(SIGNALS);

  const quote = QUOTES.find((q) => q.id === selected) ?? QUOTES[0];
  const unread = items.filter((item) => item.unread).length;

  return (
    <div className="flex flex-col gap-module-gap p-4 md:p-6">
      <PageHeader
        description="Facts about a record, a list beside the record it opens, a record over the page, and deal signals. Example data throughout."
        title="Record patterns"
      />

      <SectionCard description="A definition list that reads as one column in an aside, two in a card and four across a full page. Amounts never break." title="Facts about a record">
        <FactGrid items={factsFor(quote)} />
      </SectionCard>

      <div className="grid gap-module-gap lg:grid-cols-[minmax(0,1fr)_22rem]">
        <SectionCard description="22rem of list beside the record it opens, both scrolling on their own. Narrow the card: one pane at a time, with Back to above the record." title="Quotes and the open quote">
          <div className="h-[30rem] overflow-hidden rounded-lg border border-edge">
            <MasterDetail
              detail={quoteDetail(quote)}
              detailLabel="Quote record"
              list={
                <List dividers>
                  {QUOTES.map((q) => (
                    <ListItem
                      key={q.id}
                      headline={q.title}
                      meta={<span className="text-body-md tabular-nums">{q.value}</span>}
                      onClick={() => setSelected(q.id)}
                      selected={q.id === quote.id}
                      supporting={`${q.account} · ${q.status}`}
                    />
                  ))}
                </List>
              }
              listLabel="Quotes"
              onBack={() => setSelected(undefined)}
              selected={quote.id === selected ? selected : undefined}
            />
          </div>
        </SectionCard>

        <SectionCard description="The same facts in a 22rem column: one column, because the container is under 24rem." title="Facts in a narrow aside">
          <div className="rounded-lg border border-edge bg-card p-3">
            <FactGrid items={factsFor(quote)} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-module-gap lg:grid-cols-2">
        <SectionCard description="The record opens over the page at 44rem with its tabs, body and actions; under 640 it takes the whole screen and Escape returns to this button." title="A record over the page">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setDrawer(true)} variant="secondary">
              <ReceiptTextIcon /> Open {quote.title}
            </Button>
            <span className="text-body-md text-on-surface-variant">Focus is trapped, then returned to this button.</span>
          </div>
        </SectionCard>

        <SectionCard description="Signals grouped by day with unread counts, All/Unread/Mentions, and a text-only empty state for a narrow panel." title="Deal signals">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setSignals(true)} variant="secondary">
              <BellIcon /> Deal signals
              {unread > 0 && <Badge variant="info">{unread}</Badge>}
            </Button>
            <Button onClick={() => setEmptySignals(true)} variant="ghost">
              <InboxIcon /> Show the empty panel
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard description="One record's facts at 2 or 3 columns explicitly; each is a maximum, so a narrow container still reads." title="Explicit columns">
        <div className="grid gap-module-gap @container lg:grid-cols-2">
          <div className="rounded-lg border border-edge bg-card p-3">
            <FactGrid columns={2} items={factsFor(quote)} />
          </div>
          <div className="rounded-lg border border-edge bg-card p-3">
            <FactGrid columns={3} items={factsFor(QUOTES[1])} />
          </div>
        </div>
      </SectionCard>

      <RecordDrawer
        badges={
          <>
            <StatusBadge status={quote.status} />
            <Badge variant="selected">Revision 4</Badge>
          </>
        }
        footer={
          <>
            <Button onClick={() => setDrawer(false)} size="lg" variant="secondary">
              Close
            </Button>
            <Button size="lg">
              Send for approval <ArrowRightIcon />
            </Button>
          </>
        }
        logo={<CompanyLogo name={quote.account} size="lg" />}
        onOpenChange={setDrawer}
        open={drawer}
        size="lg"
        subtitle={`${quote.account} · ${quote.value} · closes ${quote.close}`}
        tabs={[
          { current: true, href: "#overview", label: "Overview" },
          { count: 12, href: "#lines", label: "Quote lines" },
          { count: 3, href: "#approvals", label: "Approvals" },
          { href: "#changes", label: "Proposed changes" },
          { href: "#documents", label: "Documents" },
          { href: "#activity", label: "Activity" },
        ]}
        title={quote.title}
      >
        <div className="flex flex-col gap-module-gap p-4">
          <FactGrid items={factsFor(quote)} />
          <div className="rounded-lg bg-inset p-4">
            <h2 className="text-title-module text-on-surface">What needs a decision</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Finance is the only approval left. The discount is 22.5% against a 15% floor, so the approval brief and the margin breakdown travel with it.
            </p>
          </div>
        </div>
      </RecordDrawer>

      <NotificationsPanel
        items={items}
        now={NOW}
        onMarkAllRead={() => setItems((current) => current.map((item) => ({ ...item, unread: false })))}
        onOpenChange={setSignals}
        open={signals}
      />

      <NotificationsPanel
        items={[]}
        now={NOW}
        onOpenChange={setEmptySignals}
        open={emptySignals}
      />
    </div>
  );
}
