"use client";

import {
  BellIcon,
  Building2Icon,
  CheckIcon,
  FileTextIcon,
  InboxIcon,
  LayersIcon,
  ListChecksIcon,
  SearchIcon,
  SparklesIcon,
  UserPlusIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { ActivityFeed, ActivityFeedSkeleton, SituationSummary } from "@/components/lark/activity";
import { AgentTaskCard, AgentTaskGrid, AgentTaskRow } from "@/components/lark/agent-task";
import { ApprovalPath, ApprovalPathSkeleton } from "@/components/lark/approvals";
import { HeroBand, IllustratedChoiceCard } from "@/components/lark/bands";
import {
  ActionCard,
  BestFor,
  CardLink,
  ChecklistCard,
  ChoiceCard,
  EntityCard,
  IconChip,
  ObjectCard,
  ObjectFact,
  PromoCard,
  SectionCard,
  TemplateCard,
} from "@/components/lark/cards";
import {
  ActionsCell,
  AvatarStack,
  DateCell,
  HoverActions,
  MoneyCell,
  PercentBarCell,
  ProgressCell,
  RecordCell,
  SparklineCell,
  TagsCell,
  TextCell,
} from "@/components/lark/cells";
import { Num, SortableHead, SourceChip, SourceList, TablePager } from "@/components/lark/data";
import { type ColumnDef, DataGrid } from "@/components/lark/data-grid";
import { DecisionPanel } from "@/components/lark/decision-panel";
import { ChangeReview, DiffValue, InlineEdit } from "@/components/lark/editing";
import { FactGrid } from "@/components/lark/fact-grid";
import {
  Banner,
  Callout,
  DirtyMark,
  SaveStatus,
  SkeletonCard,
  SkeletonFigure,
  SkeletonLines,
  StatePanel,
  UnsavedChangesBar,
} from "@/components/lark/feedback";
import { Figure, FigureCard, FigureStrip, Meter, Sparkline } from "@/components/lark/figure";
import { FilterBar, FilterChip, FilterCount, FilterSearch, Segmented } from "@/components/lark/filters";
import { GraphEdgeLabel, GraphNode } from "@/components/lark/graph";
import { AceMark, CompanyLogo, PersonAvatar, ServiceLogo, ServiceStack } from "@/components/lark/identity";
import { Illustration } from "@/components/lark/illustration";
import { ImpactPreview } from "@/components/lark/impact-preview";
import {
  CreateDrawer,
  DashboardGrid,
  DashboardLayout,
  HeaderBand,
  ListLayout,
  RecordLayout,
  RecordPeek,
  SettingsLayout,
  SplitView,
} from "@/components/lark/layouts";
import { CountPill, DescriptionItem, DescriptionList, List, ListItem } from "@/components/lark/lists";
import { MasterDetail } from "@/components/lark/master-detail";
import {
  ActionMenu,
  ColumnsPanel,
  CountSegments,
  FacetFilterMenu,
  FacetList,
  SavedViewMenu,
  SplitButton,
  VerticalNav,
} from "@/components/lark/menus";
import { NotificationsPanel } from "@/components/lark/notifications";
import { MoreLabel, OverflowMeasure } from "@/components/lark/overflow";
import { PageHeader, PageTabs } from "@/components/lark/page-header";
import { ApprovalChain, StageProgress, Timeline, TimelineItem } from "@/components/lark/progress";
import { LarkLink, LarkProvider } from "@/components/lark/provider";
import { RecordDrawer } from "@/components/lark/record-drawer";
import { StatusBadge } from "@/components/lark/status-badge";
import { StepList } from "@/components/lark/steps";
import { CardStatusFooter, CompoundTag, Freshness, ProvisionalBadge, Tray, TrayCard } from "@/components/lark/surfaces";
import { ClampText, NoBreak, TruncateText } from "@/components/lark/text";
import { Transcript, TranscriptLine } from "@/components/lark/transcript";
import { VersionCompare } from "@/components/lark/version-compare";

import type { Group } from "./catalog";
import { ILLUSTRATION_SRC, LONG_ACCOUNT, LONG_TITLE, NOW, QUOTES, TASKS, VERSION_ROWS, sampleIllustration } from "./fixtures";
import { Button } from "@/components/ui/button";

const noop = () => {};

const FACT_ITEMS = [
  { term: "Account", value: LONG_ACCOUNT, hint: "Renewal, enterprise" },
  { term: "Net price", value: "$12,480,000.00", copy: true },
  { term: "Discount", value: "22.5%" },
  { term: "Purchase order", value: null },
];

const ACTIVITY = [
  { id: "1", party: "customer" as const, author: `Jordan Lee, ${LONG_ACCOUNT}`, title: "Asked to hold 22% for three years", message: "We can sign this month if years two and three hold at 22%.", at: "2026-11-07T10:12:00", reference: "Re: Re: FW: Renewal terms, pricing exhibit B, revision 11" },
  { id: "2", party: "internal" as const, author: "Marcus Bell", title: "Returned the approval", at: "2026-11-06T09:40:00", reference: "#deal-desk" },
];

const STAGES = [
  { id: "a", label: "Deal desk", mode: "parallel" as const, approvers: [{ name: "Dana Ito", role: "Deal desk", state: "approved" as const }, { name: LONG_ACCOUNT, role: "Regional vice president, enterprise sales", state: "approved" as const, reason: "Over $12,480,000.00" }] },
  { id: "b", label: "Pricing and finance", mode: "parallel" as const, approvers: [{ name: "Priya Raman", role: "Pricing", state: "pending" as const }, { name: "Marcus Bell", role: "Finance", state: "returned" as const, note: "Needs margin at net 60" }] },
  { id: "c", label: "Legal", approvers: [{ name: "Ana Souza", role: "Legal", state: "waiting" as const }] },
];

const CHAIN = [
  { title: "Manager", approver: "Dana Ito", role: "Regional vice president, enterprise sales", status: "Approved", when: "Approved 9:02", condition: "Any discount above 15% for the region." },
  { title: "Finance", approver: "Marcus Bell", role: "Finance", status: "Changes requested", note: "Needs margin at net 60 before it can go to Legal.", action: <Button size="sm" variant="secondary">Send a reminder</Button> },
  { title: "Legal", approver: "Ana Souza", role: "Legal", status: "Waiting", dependency: <>After Finance approves</> },
];

type Deal = { id: string; account: string; status: string; value: number; discount: number; owner: string; close: string };

const DEALS: Deal[] = [
  { id: "OPP-20431", account: LONG_ACCOUNT, status: "Awaiting decision", value: 12480000, discount: 22.5, owner: "Priya Raman", close: "2026-11-14" },
  { id: "OPP-19877", account: "Halvorsen Group International Holdings", status: "Ready for review", value: 188400, discount: 18, owner: "Marcus Bell", close: "2026-12-02" },
  { id: "OPP-19902", account: "Northwind Freight (example)", status: "Approved", value: 412800, discount: 12, owner: "Dana Ito", close: "2026-11-21" },
];

const DEAL_COLUMNS: ColumnDef<Deal, unknown>[] = [
  {
    id: "account",
    accessorKey: "account",
    header: "Deal",
    meta: { width: 260, sticky: true },
    cell: ({ row }) => <RecordCell leading={<CompanyLogo name={row.original.account} size="sm" />} meta={`${row.original.id} · ${row.original.owner}`} name={row.original.account} onOpen={noop} />,
  },
  { id: "status", accessorKey: "status", header: "Status", meta: { width: 190 }, cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { id: "value", accessorKey: "value", header: "Net value", meta: { width: 150, align: "right" }, cell: ({ row }) => <MoneyCell value={row.original.value} /> },
  { id: "discount", accessorKey: "discount", header: "Discount", meta: { width: 170 }, cell: ({ row }) => <PercentBarCell label={`Discount for ${row.original.account}`} limit={20} value={row.original.discount} /> },
];

function SampleTable() {
  return (
    <table className="w-full min-w-0 border-collapse text-left text-sm">
      <thead>
        <tr>
          <SortableHead onSort={noop} sorted={false}>
            Deal
          </SortableHead>
          <SortableHead align="right" onSort={noop} sorted="desc">
            Net value
          </SortableHead>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-outline-faint">
          <td className="py-2">Halvorsen Group</td>
          <td className="py-2 text-right">$188,400.00</td>
        </tr>
      </tbody>
    </table>
  );
}

function MenusSample() {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ActionMenu sections={[{ label: "Open", items: [{ label: "Open quote", onSelect: noop }, { label: "Duplicate" }] }, { items: [{ label: "Delete", destructive: true, disabledReason: "The quote is already sent." }] }]} />
        <SplitButton onClick={noop} sections={[{ items: [{ label: "Save and route" }, { label: "Save as draft" }] }]}>
          Send for approval
        </SplitButton>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SavedViewMenu onChange={noop} value="mine" views={[{ id: "mine", name: "My renewals, this quarter", count: "12", owner: "me" }, { id: "team", name: "Deal desk queue", owner: "team", count: "8" }]} />
        <FacetFilterMenu facets={[{ value: "renewal", label: "Renewal", count: 12 }, { value: "expansion", label: "Expansion", count: 7 }]} label="Type" onChange={noop} value={["renewal"]} />
      </div>
      <ColumnsPanel columns={[{ id: "deal", label: "Deal", locked: true }, { id: "status", label: "Status" }, { id: "value", label: "Net value" }]} onOrderChange={noop} onVisibleChange={noop} order={["deal", "status", "value"]} visible={["deal", "status"]} />
      <div className="flex flex-wrap gap-4">
        <div className="w-44">
          <FacetList facets={[{ value: "all", label: "All deals", count: 24 }, { value: "risk", label: "Over discount limit", count: 3 }]} label="Deal status" onChange={noop} value="all" />
        </div>
        <div className="w-64">
          <CountSegments items={[{ value: "total", label: "Total", count: "24" }, { value: "new", label: "Net new", count: "6" }]} label="Counts" onChange={noop} value="total" />
        </div>
      </div>
      <VerticalNav items={[{ value: "profile", label: "Profile and preferences", icon: <Building2Icon /> }, { value: "billing", label: "Billing and usage", icon: <FileTextIcon />, count: 2 }]} label="Settings sections" onChange={noop} value="profile" />
    </div>
  );
}

function ShellScaleSample({ kind }: { kind: "list" | "record" | "dashboard" | "settings" | "split" }) {
  const header = <PageHeader description="A full-bleed page without a centred column." title={LONG_TITLE} />;
  const cards = (
    <>
      <SectionCard title="What is at risk?"><p className="text-body-md">Six checks passed; one needs Finance.</p></SectionCard>
      <SectionCard title="What happens next?"><p className="text-body-md">Legal reviews clause 7 before the order form is sent.</p></SectionCard>
    </>
  );
  if (kind === "list")
    return (
      <div className="h-96 min-h-0 overflow-hidden rounded-lg border border-edge">
        <ListLayout header={header} rail={<FacetList facets={[{ value: "all", label: "All", count: 24 }, { value: "risk", label: "At risk", count: 3 }]} label="Filters" onChange={noop} value="all" />} toolbar={<FilterBar><FilterChip selected>At risk</FilterChip><FilterCount>24 deals</FilterCount></FilterBar>}>
          <div className="p-4">{cards}</div>
        </ListLayout>
      </div>
    );
  if (kind === "record")
    return (
      <div className="h-96 min-h-0 overflow-hidden rounded-lg border border-edge">
        <RecordLayout aside={<SectionCard title="Facts"><FactGrid items={FACT_ITEMS.slice(0, 2)} /></SectionCard>} header={header}>
          {cards}
        </RecordLayout>
      </div>
    );
  if (kind === "dashboard")
    return (
      <div className="h-96 min-h-0 overflow-hidden rounded-lg border border-edge">
        <DashboardLayout header={header}>
          <DashboardGrid variant="halves">{cards}</DashboardGrid>
        </DashboardLayout>
      </div>
    );
  if (kind === "settings")
    return (
      <div className="h-96 min-h-0 overflow-hidden rounded-lg border border-edge">
        <SettingsLayout header={header} nav={<VerticalNav items={[{ value: "profile", label: "Profile" }, { value: "billing", label: "Billing" }]} label="Sections" onChange={noop} value="profile" />}>
          {cards}
        </SettingsLayout>
      </div>
    );
  return (
    <div className="h-96 min-h-0 overflow-hidden rounded-lg border border-edge">
      <SplitView
        detail={<div className="p-4"><h3 className="text-title-md">{LONG_TITLE}</h3><p className="mt-2 text-body-md">The selected quote opens here.</p></div>}
        list={<List dividers>{QUOTES.map((q) => <ListItem key={q.id} headline={q.title} meta={q.value} supporting={q.account} />)}</List>}
      />
    </div>
  );
}

export const CORE_GROUPS: Group[] = [
  {
    file: "activity.tsx",
    title: "Activity",
    note: "Where a deal stands and what was said. Party colour always comes with its word.",
    samples: [
      { name: "ActivityFeed", node: <ActivityFeed entries={ACTIVITY} now={NOW} provenance={<span data-meta="source" className="text-meta text-on-surface-variant">Example data</span>} /> },
      { name: "ActivityFeedSkeleton", node: <ActivityFeedSkeleton /> },
      { name: "SituationSummary", node: <SituationSummary action={{ label: "Open approval" }} next="Finance decides on net 60." problem="The buyer won't sign until the 22% discount holds for three years." status="blocked" /> },
    ],
  },
  {
    file: "agent-task.tsx",
    title: "Agent work",
    note: "One agent task, its state in words, and the grid that becomes a list by its own width.",
    samples: [
      { name: "AgentTaskCard", node: <AgentTaskCard agent={{ ai: true, name: "ACE" }} description="Finance asked for the margin breakdown before the review, with every policy check cited." menu={[{ items: [{ label: "Pause while it runs" }, { label: "Reassign to Dana Ito" }, { label: "Dismiss task" }] }]} progress={{ max: 4, step: "Drafting the margin table", value: 2 }} state="running" time="started 4 min ago" title={`Prepare ${LONG_TITLE} approval brief`} /> },
      { name: "AgentTaskRow", node: <ul className="flex flex-col"><AgentTaskRow agent={{ name: "Priya Raman" }} menu={[{ items: [{ label: "Regenerate the draft" }, { label: "Dismiss task" }] }]} state="needs-review" time="drafted 12 min ago" title="Draft a reply about extension pricing for years two and three" /></ul> },
      { name: "AgentTaskGrid", node: <AgentTaskGrid label="Agent work" tasks={TASKS} /> },
    ],
  },
  {
    file: "approvals.tsx",
    title: "Approval path",
    note: "Who still has to approve, in order, with parallel reviewers side by side.",
    samples: [
      { name: "ApprovalPath", node: <ApprovalPath stages={STAGES} /> },
      { name: "ApprovalPathSkeleton", node: <ApprovalPathSkeleton /> },
    ],
  },
  {
    file: "bands.tsx",
    title: "Page leads",
    note: "A hero band and the role choices on the entry page. One brand button at most.",
    samples: [
      {
        name: "HeroBand",
        node: (
          <HeroBand
            actions={<><Button>Rewrite with ACE</Button><Button variant="secondary">Open the quote</Button></>}
            description="The buyer asked for 22% for three years; the regional floor is 15% and Finance has not set a floor for this region."
            eyebrow="Deal desk"
            media={sampleIllustration("sky")}
            title={`Review ${LONG_TITLE} and clear the pricing exception`}
            tone="sky"
          />
        ),
      },
      {
        name: "IllustratedChoiceCard",
        node: (
          <div className="grid gap-3 sm:grid-cols-2">
            <IllustratedChoiceCard description="Quote with ACE, keep the buyer moving, and send for approval without leaving the deal." href="#seller" media={sampleIllustration("coral")} title="Seller" tone="coral" />
            <IllustratedChoiceCard current description="Review quotes and approvals, clear exceptions, and keep the desk queue under a day." href="#desk" media={sampleIllustration("evergreen")} title="Deal desk" tone="evergreen" />
          </div>
        ),
      },
    ],
  },
  {
    file: "cards.tsx",
    title: "Cards",
    note: "Modules, browse cards, next steps and promotions. Cards in a row share one height.",
    samples: [
      { name: "SectionCard", node: <SectionCard action={<StatusBadge status="Awaiting decision" />} description="Discount is 22% against a 15% floor for the region." footer={<Button size="sm" variant="secondary">Review</Button>} link={{ href: "#", label: "View all approvals" }} title="Who still has to approve?"><p className="text-body-md">Finance and Legal both have to approve this quote.</p></SectionCard> },
      { name: "IconChip", node: <div className="flex items-center gap-2"><IconChip size="sm" tone="primary"><CheckIcon /></IconChip><IconChip size="md" tone="ai" variant="solid"><SparklesIcon /></IconChip><IconChip shape="circle" size="lg" tone="success"><UserPlusIcon /></IconChip></div> },
      { name: "ActionCard", node: <ActionCard action={<Button size="sm" variant="secondary">Open</Button>} description="Two lines about what this step does and why it matters now." href="#quote" icon={<FileTextIcon />} title={`Open the ${LONG_TITLE} quote`} tone="primary" /> },
      { name: "TemplateCard", node: <div className="grid gap-3 sm:grid-cols-2"><TemplateCard description="Ask for the missing PO, the billing contact and the delivery address in one message." tags={<StatusBadge status="Ready for review" />} title="Renewal follow-up" /><TemplateCard description="A counteroffer within the regional floor, with the term held at three years." onSelect={noop} selected tags={<StatusBadge status="Draft" />} title="Counter at 20%" /></div> },
      { name: "ChecklistCard", node: <ChecklistCard description="Three steps before the renewal can be sent." items={[{ id: "1", title: "Connect the mailbox", done: true }, { id: "2", title: "Check the pricing policy", description: "The regional floor is 15%.", action: <Button size="sm" variant="secondary">Open</Button> }, { id: "3", title: "Send the first draft" }]} title="Prepare the renewal" /> },
      { name: "BestFor", node: <BestFor items={["Renewals under 50 seats", "A single invoice per year", "Buyers who need one signature"]} /> },
      { name: "ChoiceCard", node: <ChoiceCard choices={[{ value: "hold", label: "Hold the 22%", description: "Sends the exception to Finance.", bestFor: ["Three-year terms", "Buyers who sign this month"] }, { value: "counter", label: "Counter at 20%", recommended: true, description: "Stays within the regional floor." }]} prompt="How should ACE respond to the buyer's request?" /> },
      { name: "PromoCard", node: <PromoCard action={<Button size="sm" variant="secondary">Connect Slack</Button>} description="Get approvals and deal signals where the team already talks." onDismiss={noop} title="Bring the deal desk into Slack" /> },
      { name: "EntityCard", node: <EntityCard actions={<Button size="sm" variant="secondary">Open account</Button>} facts={[{ label: "Owner", value: "Priya Raman" }, { label: "ARR", value: "$12,480,000.00" }]} leading={<CompanyLogo name={LONG_ACCOUNT} size="lg" />} meta="Renewal · enterprise" name={LONG_ACCOUNT} status={<StatusBadge status="Awaiting decision" />} /> },
      { name: "CardLink", node: <CardLink href="#" label="View all 24 deals" /> },
      { name: "ObjectCard", node: <ObjectCard byline="By Priya Raman" description="Checks the renewal for policy exceptions and drafts the approval brief." facts={<><ObjectFact kind="version">v2.0.2</ObjectFact><ObjectFact>43 users</ObjectFact></>} footerEnd={<StatusBadge status="Approved" />} href="#agent" identity={<IconChip size="lg" tone="ai" variant="solid"><SparklesIcon /></IconChip>} starred onStarredChange={noop} title="Renewal policy checker" /> },
      { name: "ObjectFact", node: <div className="flex items-center gap-2"><ObjectFact kind="version">v2.0.2</ObjectFact><ObjectFact icon={<ListChecksIcon />} label="tasks">1,240</ObjectFact></div> },
    ],
  },
  {
    file: "cells.tsx",
    title: "Grid cells",
    note: "Every cell keeps to one line plus one meta line, and carries its meaning in text.",
    samples: [
      { name: "RecordCell", node: <RecordCell leading={<CompanyLogo name={LONG_ACCOUNT} size="sm" />} meta="OPP-20431 · Priya Raman" name={LONG_ACCOUNT} onOpen={noop} /> },
      { name: "TextCell", node: <TextCell preview="We can sign this month if years two and three hold at 22%." title="Re: Re: FW: Renewal terms, pricing exhibit B, revision 11" /> },
      { name: "MoneyCell", node: <MoneyCell sub="Revision 4" value={12480000} /> },
      { name: "PercentBarCell", node: <PercentBarCell label="Discount" limit={20} value={22.5} /> },
      { name: "SparklineCell", node: <SparklineCell change="+12%" points={[4, 6, 5, 8, 9, 7, 11]} summary="Up 12% over the last eight weeks" /> },
      { name: "ProgressCell", node: <ProgressCell done={2} label="approved" total={3} /> },
      { name: "AvatarStack", node: <AvatarStack names={["Priya Raman", "Marcus Bell", "Dana Ito", "Ana Souza", "Rui Tanaka"]} /> },
      { name: "TagsCell", node: <TagsCell max={2} tags={[{ label: "Renewal", variant: "teal" }, { label: "Enterprise", variant: "olive" }, { label: "Discount exception", variant: "warning" }]} /> },
      { name: "DateCell", node: <DateCell iso="2026-11-14T17:00:00Z" label="Nov 14, 2026" relative="in 7 days" /> },
      { name: "ActionsCell", node: <ActionsCell label="Deal actions" primary={<Button size="sm" variant="secondary">Open</Button>} sections={[{ items: [{ label: "Duplicate" }, { label: "Archive", destructive: true }] }]} /> },
      { name: "HoverActions", node: <div className="group/row flex items-center gap-2 rounded-md border border-edge p-2"><span className="text-body-md">Hover this row</span><HoverActions><Button aria-label="Open quote" size="icon-xs" variant="ghost"><FileTextIcon /></Button><Button aria-label="Remind the reviewer" size="icon-xs" variant="ghost"><BellIcon /></Button></HoverActions></div> },
    ],
  },
  {
    file: "data.tsx",
    title: "Table furniture",
    note: "Sortable heads, pagers, numbers and source chips.",
    samples: [
      { name: "SortableHead", node: <SampleTable /> },
      { name: "TablePager", node: <TablePager from={1} onNext={noop} onPrevious={noop} to={8} total={132} noun="deals" /> },
      { name: "Num", node: <Num suffix=" seats">1,240</Num> },
      { name: "SourceChip", node: <div className="flex flex-wrap gap-2"><SourceChip href="#source" index={1} kind="Salesforce CPQ" label="Quote R4, revision 4" /><SourceChip index={2} kind="SharePoint" label="Pricing policy, section 4.2" /></div> },
      { name: "SourceList", node: <SourceList><li><SourceChip index={1} kind="Outlook" label="Dana Whitfield, Oct 29" /></li><li><SourceChip index={2} kind="Salesforce CPQ" label="Quote R4" /></li></SourceList> },
    ],
  },
  {
    file: "data-grid.tsx",
    title: "Data grid",
    note: "Header 40, rows 55, sticky record column; the grid scrolls inside its own region.",
    samples: [{ name: "DataGrid", node: <div className="h-72 overflow-hidden rounded-lg border border-edge"><DataGrid caption="Deals at risk" columns={DEAL_COLUMNS} data={DEALS} getRowId={(row) => row.id} selectable /></div> }],
  },
  {
    file: "decision-panel.tsx",
    title: "Decisions",
    note: "The decision a reader makes: options, a reason, facts and the primary action.",
    samples: [
      {
        name: "DecisionPanel",
        node: (
          <DecisionPanel
            aside={<FactGrid items={FACT_ITEMS} />}
            options={[
              { consequence: "The quote goes to the buyer at 22% for three years.", id: "approve", label: "Approve the exception" },
              { consequence: "Stays within the regional floor; the buyer decides again.", id: "counter", label: "Counter at 20%", recommended: true },
              { consequence: "Nothing is sent until Finance reviews the margin.", disabled: "Finance has not set a floor for this region.", id: "hold", label: "Hold for Finance" },
            ]}
            primary={{ label: "Send decision" }}
            question="Approve the discount exception, or counter it?"
            reason={{ label: "Why", required: true }}
            secondary={{ label: "Save for later" }}
            summary="The buyer asked to hold 22% for three years; the regional floor is 15%."
          />
        ),
      },
    ],
  },
  {
    file: "editing.tsx",
    title: "Editing and change review",
    note: "Old to new in text, never colour alone; nothing applies until reviewed.",
    samples: [
      { name: "InlineEdit", node: <div className="max-w-64"><InlineEdit label="Purchase order" onCommit={noop} value="PO-88412 · revision 4" /></div> },
      { name: "DiffValue", node: <DiffValue from="$412,800.00" to="$421,000.00" /> },
      { name: "ChangeReview", node: <ChangeReview changes={[{ id: "1", field: "Net price", from: "$412,800.00", to: "$421,000.00", reason: "Term changed to 36 months", by: "ACE" }, { id: "2", field: "Approval route", from: "Deal desk", to: "Deal desk and Legal" }]} /> },
    ],
  },
  {
    file: "fact-grid.tsx",
    title: "Facts",
    note: "A definition list whose columns follow its own width.",
    samples: [{ name: "FactGrid", node: <FactGrid items={FACT_ITEMS} /> }],
  },
  {
    file: "feedback.tsx",
    title: "Banners, states and saving",
    note: "Say what happened, whether anything was lost, and what to do next.",
    samples: [
      { name: "Banner", node: <div className="flex flex-col gap-2"><Banner layout="inset" tone="caution">The mailbox sync is paused; approvals still work.</Banner><Banner onDismiss={noop} tone="negative">The price book expired Friday. Requote before sending.</Banner></div> },
      { name: "Callout", node: <Callout actions={<Button size="sm" variant="secondary">Review the clause</Button>} title="Legal review needed" tone="caution">Clause 7.2 changes the payment terms; Legal reviews it before the order form goes out.</Callout> },
      { name: "StatePanel", node: <StatePanel actions={<Button size="sm">Clear filters</Button>} description="No deal matches these filters. Clear one to see the rest." kind="no-results" title="No deals match" /> },
      { name: "SkeletonLines", node: <SkeletonLines lines={4} /> },
      { name: "SkeletonCard", node: <SkeletonCard /> },
      { name: "SkeletonFigure", node: <SkeletonFigure /> },
      { name: "SaveStatus", node: <div className="flex flex-wrap gap-3"><SaveStatus state="dirty" /><SaveStatus state="saving" /><SaveStatus state="saved" /><SaveStatus onRetry={noop} state="error" /></div> },
      { name: "UnsavedChangesBar", node: <div className="relative h-24 overflow-hidden rounded-lg border border-edge"><div className="absolute inset-x-0 bottom-0"><UnsavedChangesBar count={2} onDiscard={noop} onSave={noop} open /></div></div> },
      { name: "DirtyMark", node: <DirtyMark /> },
    ],
  },
  {
    file: "figure.tsx",
    title: "Figures",
    note: "Large numbers with their labels, captions and freshness.",
    samples: [
      { name: "Figure", node: <Figure caption="Continue a draft" href="#quotes" icon={<FileTextIcon />} label="Quotes to work on" tone="primary" value="36" /> },
      { name: "FigureStrip", node: <FigureStrip columns={2}><Figure label="Annual contract value" value="$12,480,000" /><Figure label="Discount" unit="%" value="22.5" /></FigureStrip> },
      { name: "FigureCard", node: <FigureCard caption="Continue a draft" label="Quotes to work on" value="36" /> },
      { name: "Sparkline", node: <div className="w-40"><Sparkline points={[4, 6, 5, 8, 9, 7, 11]} /></div> },
      { name: "Meter", node: <div className="w-48"><Meter label="ACE credits used" max={10000} value={6240} /></div> },
    ],
  },
  {
    file: "filters.tsx",
    title: "Filters",
    note: "The toolbar and the segmented control. Segments never wrap; overflow goes to More.",
    samples: [
      { name: "FilterBar", node: <FilterBar><FilterChip icon={<SearchIcon />} selected>At risk</FilterChip><FilterChip menu value="Priya Raman">Owner</FilterChip><FilterCount>24 deals</FilterCount></FilterBar> },
      { name: "FilterSearch", node: <FilterSearch label="Search deals" onValueChange={noop} value="Northwind renewal with a long account name" /> },
      { name: "FilterChip", node: <div className="flex flex-wrap gap-2"><FilterChip onClick={noop} selected>Renewal</FilterChip><FilterChip onClick={noop}>Expansion</FilterChip><FilterChip icon={<LayersIcon />} onClick={noop}>Type</FilterChip></div> },
      { name: "FilterCount", node: <FilterCount>1,240 deals</FilterCount> },
      { name: "Segmented", node: <Segmented aria-label="Deal stage" onValueChange={noop} options={[{ value: "all", label: "All", count: 48 }, { value: "customer", label: "Customer", count: 12 }, { value: "seller", label: "Seller", count: 19 }, { value: "internal", label: "Internal", count: 11 }, { value: "system", label: "System", count: 6 }, { value: "other", label: "Other", count: 4 }]} value="all" /> },
    ],
  },
  {
    file: "graph.tsx",
    title: "Graph",
    note: "React Flow nodes and edge labels, styled by category tone plus words.",
    samples: [
      { name: "GraphNode", node: <div className="relative h-40 overflow-hidden rounded-lg bg-canvas p-3"><GraphNode icon={<Building2Icon />} meta="Account · 12 contacts" selected title={LONG_ACCOUNT} tone="sky" /><div className="mt-3"><GraphNode dimmed icon={<ListChecksIcon />} meta="Opportunity · 3 quotes" title="Renewal 2027, enterprise" tone="iris" /></div></div> },
      { name: "GraphEdgeLabel", node: <div className="relative h-16"><GraphEdgeLabel style={{ left: 0, top: 8 }}>renews</GraphEdgeLabel></div> },
    ],
  },
  {
    file: "identity.tsx",
    title: "Identity marks",
    note: "Companies are squares, people are circles, ACE is iris. Service names always sit beside their mark.",
    samples: [
      { name: "CompanyLogo", node: <div className="flex items-center gap-2"><CompanyLogo decorative={false} name={LONG_ACCOUNT} size="lg" /><CompanyLogo name="Halvorsen" size="sm" /><CompanyLogo name="Northwind Freight" size="xs" /></div> },
      { name: "PersonAvatar", node: <div className="flex items-center gap-2"><PersonAvatar decorative={false} name="Priya Raman" size="lg" /><PersonAvatar name="Marcus Bell" size="md" /><PersonAvatar name="Dana Ito" size="sm" /></div> },
      { name: "AceMark", node: <div className="flex items-center gap-3"><AceMark size="lg" /><AceMark motion="spin" size="md" /><AceMark size="sm" variant="bare" /></div> },
      { name: "ServiceLogo", node: <div className="flex flex-wrap items-center gap-3 text-body-md"><ServiceLogo service="Salesforce" size={20} /><ServiceLogo service="Snowflake" size={20} /><ServiceLogo service="MCP server" size={20} /><ServiceLogo service="Email" size={20} /><ServiceLogo service="Slack" size={20} /><ServiceLogo service="Outlook" size={20} /><ServiceLogo service="Zoom" size={20} /><ServiceLogo service="Teams" size={20} /></div> },
      { name: "ServiceStack", node: <ServiceStack services={["Salesforce", "Snowflake", "Slack", "Outlook", "Email"]} /> },
    ],
  },
  {
    file: "illustration.tsx",
    title: "Illustration",
    note: "Reserves its box; decorative unless it carries information.",
    samples: [
      { name: "Illustration", node: <div className="flex flex-wrap items-end gap-4"><Illustration alt="An empty deal desk queue" size={96} src={ILLUSTRATION_SRC.sky} /><Illustration size={140} src={ILLUSTRATION_SRC.coral} /><Illustration size={200} src={ILLUSTRATION_SRC.evergreen} /></div> },
    ],
  },
  {
    file: "impact-preview.tsx",
    title: "Impact preview",
    note: "What a change does before it is applied; direction is an icon and a word.",
    samples: [
      { name: "ImpactPreview", node: <ImpactPreview items={[{ from: "22.5%", id: "discount", label: "Discount", to: "25.0%", tone: "increase" }, { from: "$412,800.00", id: "price", label: "Net price", to: "$421,000.00", tone: "increase" }, { from: "Deal desk", id: "route", label: "Approval route", to: "Deal desk and Legal", tone: "warning" }]} summary="Saving re-prices the renewal and adds Legal to the approval route." /> },
    ],
  },
  {
    file: "layouts.tsx",
    title: "Page layouts",
    note: "Full-bleed archetypes: each region scrolls on its own.",
    samples: [
      { name: "HeaderBand", node: <div className="overflow-hidden rounded-lg border border-edge"><HeaderBand><PageHeader title="Deals" /></HeaderBand></div> },
      { name: "ListLayout", node: <ShellScaleSample kind="list" /> },
      { name: "RecordLayout", node: <ShellScaleSample kind="record" /> },
      { name: "DashboardLayout", node: <ShellScaleSample kind="dashboard" /> },
      { name: "DashboardGrid", node: <DashboardGrid variant="thirds"><SectionCard title="One" /><SectionCard title="Two" /><SectionCard title="Three" /></DashboardGrid> },
      { name: "SettingsLayout", node: <ShellScaleSample kind="settings" /> },
      { name: "SplitView", node: <ShellScaleSample kind="split" /> },
      { name: "RecordPeek", node: <RecordPeek onOpenChange={noop} open={false} title={LONG_TITLE}><p>Body</p></RecordPeek> },
      { name: "CreateDrawer", node: <CreateDrawer onOpenChange={noop} onSubmit={noop} open={false} title="New deal"><p>Fields</p></CreateDrawer> },
    ],
  },
  {
    file: "lists.tsx",
    title: "Lists and details",
    note: "Key and value rows, list rows and counts.",
    samples: [
      { name: "DescriptionList", node: <DescriptionList><DescriptionItem term="Account">{LONG_ACCOUNT}</DescriptionItem><DescriptionItem term="Net price">$12,480,000.00</DescriptionItem></DescriptionList> },
      { name: "DescriptionItem", node: <DescriptionList layout="stacked"><DescriptionItem mono term="Quote">R4-2027-ENTERPRISE-REVISION-4</DescriptionItem><DescriptionItem term="Owner">Priya Raman</DescriptionItem></DescriptionList> },
      { name: "List", node: <List dividers><ListItem headline="Finance review" meta="Waiting" supporting="Needs margin above 38%" trailing={<StatusBadge status="Pending" />} /><ListItem headline={LONG_ACCOUNT} meta="2 hr ago" supporting="Approved by Dana Ito after the margin check passed" /></List> },
      { name: "ListItem", node: <List inset><ListItem href="#quote" leading={<FileTextIcon />} headline="Quote R4" meta="$412,800" selected supporting="Northwind Freight" /></List> },
      { name: "CountPill", node: <div className="flex items-center gap-2 text-sm">Approvals <CountPill label="6 waiting" value={6} variant="pill" /></div> },
    ],
  },
  {
    file: "master-detail.tsx",
    title: "Master and detail",
    note: "Both panes from 48rem of its own width; one pane with Back below that.",
    samples: [
      {
        name: "MasterDetail",
        node: (
          <div className="h-80 overflow-hidden rounded-lg border border-edge">
            <MasterDetail
              detail={<div className="p-4"><h3 className="text-title-md" data-detail-heading>{QUOTES[0].title}</h3><FactGrid className="mt-3" items={FACT_ITEMS.slice(0, 2)} /></div>}
              detailLabel="Quote record"
              list={<List dividers>{QUOTES.map((q) => <ListItem key={q.id} headline={q.title} meta={q.value} supporting={q.account} />)}</List>}
              listLabel="Quotes"
              onBack={noop}
              selected={QUOTES[0].id}
            />
          </div>
        ),
      },
    ],
  },
  {
    file: "menus.tsx",
    title: "Menus and navigation",
    note: "Triggers shown closed; each opens a labelled menu or popover.",
    samples: [
      { name: "ActionMenu", node: <MenusSample /> },
      { name: "SplitButton", node: <SplitButton onClick={noop} sections={[{ items: [{ label: "Save and route" }, { label: "Save as draft" }] }]}>Send for approval</SplitButton> },
      { name: "SavedViewMenu", node: <SavedViewMenu onChange={noop} value="mine" views={[{ id: "mine", name: "My renewals", count: "12" }, { id: "team", name: "Deal desk queue", owner: "team", count: "8" }]} /> },
      { name: "FacetFilterMenu", node: <FacetFilterMenu facets={[{ value: "renewal", label: "Renewal", count: 12 }, { value: "expansion", label: "Expansion", count: 7 }]} label="Type" onChange={noop} value={["renewal"]} /> },
      { name: "ColumnsPanel", node: <div className="max-w-72"><ColumnsPanel columns={[{ id: "deal", label: "Deal", locked: true }, { id: "status", label: "Status" }, { id: "value", label: "Net value" }]} onOrderChange={noop} onVisibleChange={noop} order={["deal", "status", "value"]} visible={["deal", "status"]} /></div> },
      { name: "FacetList", node: <div className="w-48"><FacetList facets={[{ value: "all", label: "All deals", count: 24 }, { value: "risk", label: "Over discount limit", count: 3 }]} label="Deal status" onChange={noop} value="all" /></div> },
      { name: "CountSegments", node: <div className="w-64"><CountSegments items={[{ value: "total", label: "Total", count: "24" }, { value: "new", label: "Net new", count: "6" }]} label="Counts" onChange={noop} value="total" /></div> },
      { name: "VerticalNav", node: <div className="w-56"><VerticalNav items={[{ value: "profile", label: "Profile and preferences", icon: <Building2Icon /> }, { value: "billing", label: "Billing and usage", icon: <FileTextIcon />, count: 2 }]} label="Settings sections" onChange={noop} value="profile" /></div> },
    ],
  },
  {
    file: "notifications.tsx",
    title: "Deal signals",
    note: "Rendered closed; opens as a sheet from the bell.",
    samples: [
      { name: "NotificationsPanel", node: <NotificationsPanel items={[{ id: "1", at: "2026-11-07T14:40:00", kind: "approval", title: "Finance approved R4", unread: true }, { id: "2", at: "2026-11-07T09:12:00", kind: "mention", mentionsMe: true, title: "Priya mentioned you", unread: true }]} now={NOW} onOpenChange={noop} open={false} /> },
    ],
  },
  {
    file: "overflow.tsx",
    title: "Overflow",
    note: "The measuring row is invisible and out of the tab order; the More label says how many.",
    samples: [
      { name: "OverflowMeasure", node: <div className="relative h-10"><OverflowMeasure measureRef={{ current: null }}><span className="px-2 text-label-lg">One</span><span className="px-2 text-label-lg">Two</span><MoreLabel count={3} /></OverflowMeasure></div> },
      { name: "MoreLabel", node: <span className="inline-flex h-8 items-center gap-1 rounded-md border border-outline-strong px-2 text-label-lg"><MoreLabel count={4} /></span> },
    ],
  },
  {
    file: "page-header.tsx",
    title: "Page header and tabs",
    note: "The page's one h1; tabs pin the current one and send the rest to More.",
    samples: [
      { name: "PageHeader", node: <PageHeader actions={<><Button variant="secondary">Edit</Button><Button>Send for approval</Button></>} back={{ href: "#deals", label: "Back to deals" }} description="Discount is 22% against a 15% floor for this region, so Finance and Legal both have to approve." meta={<><span>Priya Raman</span><span>Revision 4</span><span>Salesforce CPQ</span></>} status={<StatusBadge status="Awaiting decision" />} title={`Renewal for ${LONG_ACCOUNT}`} /> },
      { name: "PageTabs", node: <PageTabs label="Record sections" tabs={[{ label: "Overview", href: "#", current: true }, { label: "Quote lines", href: "#", count: 12 }, { label: "Proposed changes", href: "#" }, { label: "Approvals", href: "#", count: 6 }, { label: "Work and follow-through", href: "#" }, { label: "Documents", href: "#" }, { label: "Activity", href: "#" }]} /> },
    ],
  },
  {
    file: "progress.tsx",
    title: "Progress and time",
    note: "State in words beside every mark.",
    samples: [
      { name: "StageProgress", node: <StageProgress current={2} stages={[{ label: "Understand request" }, { label: "Prepare changes" }, { label: "Approval decisions", description: "Finance and Legal" }, { label: "Confirm follow-through" }]} /> },
      { name: "Timeline", node: <Timeline><TimelineItem description="Approved the 22% discount after the margin check." meta="Dana Ito · Revision 4" time={{ dateTime: "2026-11-07T14:40:00Z", label: "2:40 PM" }} title="Finance approved R4" tone="success" /><TimelineItem description="Returned the approval with a margin question." meta="Marcus Bell · #deal-desk" time={{ dateTime: "2026-11-06T09:40:00Z", label: "Yesterday" }} title="Finance returned the approval" tone="warning" /></Timeline> },
      { name: "TimelineItem", node: <Timeline><TimelineItem description="Quote R4 was created from last year's terms." meta="ACE · Salesforce CPQ" title="Quote drafted" /></Timeline> },
      { name: "ApprovalChain", node: <ApprovalChain steps={CHAIN} /> },
    ],
  },
  {
    file: "provider.tsx",
    title: "Links",
    note: "Components use the app's link component when one is provided.",
    samples: [
      { name: "LarkProvider", node: <LarkProvider><span className="text-body-md">Children render inside the provider.</span></LarkProvider> },
      { name: "LarkLink", node: <LarkLink className="link-default text-body-md" href="#deal">Open the deal</LarkLink> },
    ],
  },
  {
    file: "record-drawer.tsx",
    title: "Record drawer",
    note: "Rendered closed; opens over the page from a trigger at 32, 44 or 60rem.",
    samples: [{ name: "RecordDrawer", node: <RecordDrawer onOpenChange={noop} open={false} title={LONG_TITLE}><p>Body</p></RecordDrawer> }],
  },
  {
    file: "status-badge.tsx",
    title: "Status",
    note: "One tone and one icon per word, so the same status always looks the same.",
    samples: [
      { name: "StatusBadge", node: <div className="flex flex-wrap gap-2"><StatusBadge status="Awaiting decision" /><StatusBadge status="Approved" /><StatusBadge status="Changes requested" /><StatusBadge size="md" status="Discount exception" /><StatusBadge status="A status from the app" tone="ai" /></div> },
    ],
  },
  {
    file: "steps.tsx",
    title: "Steps",
    note: "State is spoken after the title; the current step is aria-current.",
    samples: [
      { name: "StepList", node: <StepList steps={[{ id: "1", state: "done", title: "Connect the mailbox" }, { id: "2", state: "current", title: "Select the deal", description: "The renewal for the enterprise account.", action: <Button size="sm" variant="secondary">Choose a deal</Button> }, { id: "3", state: "blocked", title: "Check and resolve", description: "Blocked: Finance has not set a margin floor." }, { id: "4", state: "todo", title: "Send for approval" }]} /> },
    ],
  },
  {
    file: "surfaces.tsx",
    title: "Surfaces and marks",
    note: "Trays, provisional marks, compound tags and freshness.",
    samples: [
      { name: "Tray", node: <Tray columns={2} footer={<Button size="sm" variant="secondary">Review all</Button>} title="Before you send"><TrayCard><span className="text-title-sm">Quote lines</span><span className="text-body-md text-on-surface-variant">24 lines, two over the desk limit.</span></TrayCard><TrayCard><span className="text-title-sm">Approvals</span><span className="text-body-md text-on-surface-variant">Finance has not decided.</span></TrayCard></Tray> },
      { name: "TrayCard", node: <TrayCard><span className="text-title-sm">One card in a tray</span><span className="text-body-md text-on-surface-variant">White, 12px corners, hairline.</span></TrayCard> },
      { name: "ProvisionalBadge", node: <div className="flex flex-wrap gap-2"><ProvisionalBadge kind="proposed" /><ProvisionalBadge kind="unsaved" /><ProvisionalBadge kind="ai" /></div> },
      { name: "CompoundTag", node: <div className="flex flex-wrap gap-2"><CompoundTag label="Discount" value="92%" /><CompoundTag label="Term" tone="ai" value="36 months" valueLabel="extracted by ACE" /></div> },
      { name: "Freshness", node: <Freshness at={new Date(NOW.getTime() - 2 * 60_000)} now={NOW} staleAfter={5} /> },
      { name: "CardStatusFooter", node: <CardStatusFooter action={<Button size="sm" variant="secondary">Open quote</Button>} status={<StatusBadge status="Awaiting decision" />} /> },
    ],
  },
  {
    file: "text.tsx",
    title: "Text that gives way",
    note: "One line or a clamp, with the full text one hover or Tab away.",
    samples: [
      { name: "TruncateText", node: <div className="w-48"><TruncateText>{LONG_ACCOUNT}</TruncateText></div> },
      { name: "ClampText", node: <div className="w-56"><ClampText>{LONG_TITLE}</ClampText></div> },
      { name: "NoBreak", node: <NoBreak>$12,480,000.00</NoBreak> },
    ],
  },
  {
    file: "transcript.tsx",
    title: "Transcript",
    note: "Speaker, time and flags; long lines wrap.",
    samples: [
      { name: "Transcript", node: <Transcript label="Northwind renewal call, Nov 3"><TranscriptLine flag="Commitment" speaker="Dana Whitfield" time="12:31">We can sign this month if years two and three hold at 22%.</TranscriptLine><TranscriptLine flag="Risk" speaker="Priya Raman" time="12:44">The regional floor is 15%, so this needs Finance and Legal.</TranscriptLine></Transcript> },
      { name: "TranscriptLine", node: <ol><TranscriptLine flag="Question" speaker="Marcus Bell" time="13:02">Can you share the margin breakdown before Thursday?</TranscriptLine></ol> },
    ],
  },
  {
    file: "version-compare.tsx",
    title: "Version compare",
    note: "Two columns wide, before then after per row narrow; change is an icon and a word.",
    samples: [
      { name: "VersionCompare", node: <VersionCompare left={{ author: "Priya Raman", time: new Date("2026-11-06T15:20:00Z"), version: "Revision 3" }} right={{ author: "Dana Ito", time: new Date("2026-11-07T11:15:00Z"), version: "Revision 4" }} rows={VERSION_ROWS} /> },
    ],
  },
];

export const CORE_CONSTANTS = ["PARTY", "BAND_TONE", "STATUSES", "STEP_STATE_LABEL", "provisionalEdge"];
export const CORE_ICONS: ReactNode[] = [<InboxIcon key="inbox" />, <CheckIcon key="check" />];
