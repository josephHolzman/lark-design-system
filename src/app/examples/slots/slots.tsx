"use client";

import { ArrowRightIcon, InboxIcon } from "lucide-react";
import { useState } from "react";

import { RunSteps } from "@/components/lark/ai";
import { IllustratedChoiceCard } from "@/components/lark/bands";
import { PromoCard, SectionCard } from "@/components/lark/cards";
import { ActionReview, AnswerSources, ChatWelcome, ConversationListItem, StoppedNotice } from "@/components/lark/chat";
import { ApprovalRoute, CpqStages, PolicyChecks } from "@/components/lark/cpq";
import { DataGrid } from "@/components/lark/data-grid";
import { Banner, StatePanel, UnsavedChangesBar } from "@/components/lark/feedback";
import { CompanyLogo } from "@/components/lark/identity";
import { Illustration } from "@/components/lark/illustration";
import { VerticalNav } from "@/components/lark/menus";
import { PageHeader } from "@/components/lark/page-header";
import { AskAceButton } from "@/components/lark/shell";
import { StatusBadge } from "@/components/lark/status-badge";
import { StepList } from "@/components/lark/steps";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { NumberInput } from "@/components/ui/number-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* Every value is fake. This page shows the 0.8 slots and the small §3 fixes. */

const ROWS = [
  { id: "1", account: "Northwind Freight", value: "$412,800" },
  { id: "2", account: "Halvorsen Group", value: "$188,400" },
  { id: "3", account: "Marlowe Logistics", value: "$96,200" },
  { id: "4", account: "Cedar & Field", value: "$74,500" },
  { id: "5", account: "Tidewater Mills", value: "$52,100" },
  { id: "6", account: "Ardent Supply", value: "$48,900" },
  { id: "7", account: "Olive & Pine", value: "$31,400" },
  { id: "8", account: "Juniper Works", value: "$28,700" },
  { id: "9", account: "Kestrel Foods", value: "$24,300" },
  { id: "10", account: "Linden Health", value: "$19,800" },
  { id: "11", account: "Marchmont Labs", value: "$14,200" },
  { id: "12", account: "Sefton Rail", value: "$9,600" },
];

const GRID_COLUMNS = [
  { id: "account", accessorKey: "account" as const, header: "Account", meta: { width: 240 } },
  { id: "value", accessorKey: "value" as const, header: "Proposal value", meta: { align: "right" as const, width: 160 } },
];

export function Slots() {
  const [amount, setAmount] = useState<number | undefined>(24);
  const [date, setDate] = useState<Date>();
  const [step, setStep] = useState("b");
  const [palette, setPalette] = useState(false);

  return (
    <div className="flex flex-col gap-module-gap">
      <PageHeader
        description="Illustrations in empty modules, the company-logo fallback, number fields that commit as you type, tabs that fold into More, and the small fixes from the gap list. Example data throughout."
        title="Slots and fixes"
      />

      <SectionCard description="Fixed sizes reserve their box before the file loads. Size wide fills the container at 140 high." title="Illustration">
        <div className="flex flex-wrap items-end gap-6">
          <figure className="flex w-24 flex-col gap-2">
            <Illustration brief="An empty draft" src="/illustrations/empty-draft.svg" size={96} />
            <figcaption className="text-meta text-on-surface-variant">96</figcaption>
          </figure>
          <figure className="flex w-40 flex-col gap-2">
            <Illustration brief="An empty draft" src="/illustrations/empty-draft.svg" size={140} />
            <figcaption className="text-meta text-on-surface-variant">140 (96 under 20rem)</figcaption>
          </figure>
          <figure className="flex w-56 flex-col gap-2">
            <Illustration alt="An empty draft with an add mark" src="/illustrations/empty-draft.svg" size={200} />
            <figcaption className="text-meta text-on-surface-variant">200, informative alt</figcaption>
          </figure>
          <figure className="flex min-w-64 flex-1 flex-col gap-2">
            <Illustration brief="An approved set" src="/illustrations/empty-approved.svg" size="wide" />
            <figcaption className="text-meta text-on-surface-variant">wide</figcaption>
          </figure>
        </div>
      </SectionCard>

      <div className="grid gap-module-gap lg:grid-cols-2">
        <SectionCard description="A module with no content yet shows the picture above its empty body." illustration={{ src: "/illustrations/empty-approved.svg", size: 140 }} title="Nothing approved today" />

        <SectionCard title="Empty states, banners and promos">
          <div className="flex flex-col gap-item">
            <StatePanel
              description="When a quote is ready to send, it appears here with its approval path."
              illustration={{ src: "/illustrations/empty-draft.svg", size: 140 }}
              kind="first-run"
              title="No drafts yet"
            />
            <Banner illustration={{ src: "/illustrations/empty-approved.svg", size: 48 }} tone="info">
              No mailbox is linked, so replies stay in Draft.
            </Banner>
            <div className="rounded-lg border border-edge bg-card p-3">
              <p className="text-title-sm">Promo card with a picture</p>
              <Illustration className="mt-2 max-w-40" src="/illustrations/empty-draft.svg" size={96} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-module-gap lg:grid-cols-2">
        <SectionCard description="A missing or failed file becomes initials on a quiet inset tile, at the same size." title="Company logos">
          <div className="flex flex-wrap items-center gap-6">
            {[
              { name: "Northwind Freight", src: "/illustrations/empty-draft.svg" },
              { name: "Halvorsen Group", src: "/illustrations/does-not-exist.svg" },
              { name: "Marlowe Logistics" },
            ].map((c) => (
              <div className="flex items-center gap-2" key={c.name}>
                <CompanyLogo name={c.name} size="xl" src={c.src} />
                <span className="text-body-md">{c.name}</span>
              </div>
            ))}
            <CompanyLogo decorative={false} name="Cedar & Field" size="lg" src="/missing/cedar.svg" />
          </div>
        </SectionCard>

        <SectionCard description="commit=&quot;change&quot; reports each valid keystroke; the steppers carry the field's name." title="Number input">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-label-lg">
              Quantity
              <NumberInput commit="change" aria-label="Quantity" max={500} min={0} onValueChange={setAmount} value={amount} />
            </label>
            <span className="pb-1 text-body-md text-on-surface-variant tabular-nums">{amount ?? "—"} units</span>
          </div>
        </SectionCard>
      </div>

      <SectionCard description="A narrow list keeps the current tab and folds the rest into More, never scrolling." title="Tabs that fold">
        <div className="max-w-md rounded-lg border border-edge bg-card">
          <Tabs defaultValue="overview">
            <TabsList aria-label="Deal sections" className="px-2" overflow="menu">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lines">Quote lines</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="history">Version history</TabsTrigger>
            </TabsList>
            {["overview", "lines", "approvals", "documents", "activity", "billing", "history"].map((v) => (
              <TabsContent className="p-3 text-body-md text-on-surface-variant" key={v} value={v}>
                The {v} panel. Narrow the card: the other tabs move into More and this one stays.
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SectionCard>

      <div className="grid gap-module-gap lg:grid-cols-2">
        <SectionCard title="Small fixes: chat">
          <div className="flex flex-col gap-item">
            <ChatWelcome
              description="Pick up a quote, check an approval or ask about an account."
              eyebrow="New chat"
              illustration={{ src: "/illustrations/empty-draft.svg", size: 140 }}
              suggestions={["Draft a renewal email", "Who approves this quote?"]}
              title="What do you need to prepare?"
              titleAs="h2"
            />
            <StoppedNotice
              kept={["Read the quote", "Listed the approvers"]}
              note="The server may still finish the answer and save it; check the deal before retrying."
              onRetry={() => {}}
            />
            <ActionReview
              approveDisabled
              declineDisabled
              describedBy="review-note"
              fields={
                <label className="flex flex-col gap-1 text-label-lg" id="review-note">
                  What needs changing?
                  <textarea className="min-h-16 rounded-md border border-outline bg-surface-container-lowest p-2 text-sm" />
                </label>
              }
              title="Request changes on quote R4"
            >
              The discount needs a reason before this can be approved.
            </ActionReview>
            <AnswerSources
              sources={[
                { id: "a", label: "Quote R4", meta: "Salesforce · updated 2 min ago", onOpen: () => {}, system: "Salesforce" },
                { id: "b", label: "Pricing policy", excerpt: "Discounts above 15% need Finance.", system: "SharePoint" },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title="Small fixes: work">
          <div className="flex flex-col gap-item">
            <RunSteps
              idle
              steps={[
                { id: "a", title: "Check the line items", state: "idle" },
                { id: "b", title: "Compare with the PO", state: "queued", action: <Button size="xs" variant="secondary">Assign</Button> },
                { id: "c", title: "Tax check", state: "skipped" },
              ]}
              title="Order check (not started)"
            />
            <StepList
              aria-label="Accounting bench"
              steps={[
                { id: "a", title: "Match the invoice", state: "done" },
                { id: "b", title: "Post the journal", state: step === "b" ? "current" : "todo", onSelect: () => setStep("b") },
                { id: "c", title: "Confirm the ledger", state: step === "c" ? "current" : "todo", onSelect: () => setStep("c") },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <AskAceButton busy />
              <AskAceButton />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-module-gap lg:grid-cols-2">
        <SectionCard title="Small fixes: approvals and stages">
          <div className="flex flex-col gap-item">
            <CpqStages current="approve" labels={{ configure: "Understand request", price: "Prepare changes", approve: "Approval decisions", order: "Confirm follow-through" }} />
            <ApprovalRoute
              steps={[
                {
                  id: "s",
                  label: "Finance",
                  approvers: [
                    { name: "Rui Tanaka", role: "VP Finance", state: "pending", stateLabel: "Ready for review", channel: "Slack" },
                    { name: "Dana Ito", role: "Deal desk", state: "waiting", stateLabel: "Waiting" },
                  ],
                },
              ]}
            />
            <PolicyChecks
              checks={[
                { id: "1", rule: "Discount at most 15%", status: "needs-approval", statusLabel: "Ready for review", approver: "Finance" },
                { id: "2", rule: "Margin at least 35%", status: "pass", statusLabel: "Approved" },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title="Small fixes: navigation and tables">
          <div className="flex flex-col gap-item">
            <VerticalNav
              items={[
                { value: "profile", label: "Profile", href: "#profile" },
                { value: "notifications", label: "Notifications", href: "#notifications", count: 3 },
                { value: "security", label: "Security", href: "#security" },
              ]}
              label="Settings"
              onChange={() => {}}
              value="profile"
            />
            <div className="flex flex-wrap items-center gap-3">
              <NativeSelect aria-label="Region" className="w-40" defaultValue="emea">
                <NativeSelectOption value="emea">EMEA</NativeSelectOption>
                <NativeSelectOption value="amer">Americas</NativeSelectOption>
              </NativeSelect>
              <DatePicker aria-label="Close date" onValueChange={setDate} placeholder="Pick a close date" value={date} />
            </div>
            <ScrollArea className="h-24 rounded-md border border-outline-variant">
              <div className="flex flex-col gap-1 p-2 text-body-md">
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i}>Audit line {i + 1}: price recalculated</span>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SectionCard>
      </div>

      <SectionCard description="The pager can offer rows-per-page. The scroll region is a named tab stop when it overflows." title="Grid with rows per page">
        <DataGrid
          caption="Quotes by account"
          columns={GRID_COLUMNS}
          data={ROWS}
          getRowId={(r) => r.id}
          pageSize={5}
          pageSizeOptions={[5, 10, 25]}
        />
      </SectionCard>

      <div className="grid gap-module-gap lg:grid-cols-2">
        <SectionCard title="Choices and conversations">
          <div className="flex flex-col gap-item">
            <IllustratedChoiceCard description="Draft and price quotes." href="#seller" media={<Illustration src="/illustrations/empty-draft.svg" size={96} />} title="Seller" tone="sky" />
            <nav aria-label="Recent conversations" className="flex flex-col gap-1">
              <ConversationListItem current onSelect={() => {}} status="done" time="9:12 AM" title="Renewal terms for Northwind" />
              <ConversationListItem disabled meta="Halvorsen Group" onSelect={() => {}} status="running" time="8:40 AM" title="Check the PO against R4" />
            </nav>
            <div className="flex items-center gap-2">
              <Button onClick={() => setPalette(true)} variant="secondary">
                Open command palette
              </Button>
              <StatusBadge status="Ready" />
            </div>
          </div>
        </SectionCard>

        <SectionCard description="Discard says what it throws away; extra actions sit before Save." title="Unsaved changes">
          <div className="relative overflow-hidden rounded-lg border border-edge">
            <div className="p-4 text-body-md text-on-surface-variant">Discount changed from 12% to 15%.</div>
            <UnsavedChangesBar count={1} discardLabel="Discard edits" onDiscard={() => {}} onSave={() => {}} open>
              <Button size="sm" variant="secondary">
                Review approvals
                <ArrowRightIcon />
              </Button>
            </UnsavedChangesBar>
          </div>
        </SectionCard>
      </div>

      <PromoCard
        action={
          <Button size="sm" variant="secondary">
            <InboxIcon /> Show an example
          </Button>
        }
        description="A promo card can carry a picture above its words; the picture is decorative unless it has alt text."
        illustration={{ src: "/illustrations/empty-draft.svg", size: 96 }}
        title="Promo card with an illustration"
      />

      <CommandDialog onOpenChange={setPalette} open={palette} title="Search">
        <CommandInput placeholder="Search deals, accounts and pages" />
        <CommandList>
          <CommandItem onSelect={() => setPalette(false)}>Northwind Freight</CommandItem>
          <CommandItem onSelect={() => setPalette(false)}>Halvorsen Group</CommandItem>
          <CommandItem onSelect={() => setPalette(false)}>Pricing policies</CommandItem>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
