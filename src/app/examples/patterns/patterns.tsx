"use client";

import { ArchiveIcon, CircleHelpIcon, CoinsIcon, CopyIcon, FileTextIcon, LayoutDashboardIcon, LayoutGridIcon, PencilIcon, PlusIcon, RefreshCwIcon, ScaleIcon, SparklesIcon, Trash2Icon, UserIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { AiRunCell, ConfidenceBadge, EvidencePopover, PlanReview, RunSteps } from "@/components/lark/ai";
import { ActionCard, ChecklistCard, ChoiceCard, EntityCard, PromoCard, SectionCard, TemplateCard } from "@/components/lark/cards";
import { HeroBand, IllustratedChoiceCard } from "@/components/lark/bands";
import { ChangeReview, DiffValue, InlineEdit } from "@/components/lark/editing";
import { Banner, DirtyMark, SaveStatus, SkeletonCard, SkeletonFigure, StatePanel, UnsavedChangesBar } from "@/components/lark/feedback";
import { FigureCard } from "@/components/lark/figure";
import { Segmented } from "@/components/lark/filters";
import { CompanyLogo, ServiceLogo } from "@/components/lark/identity";
import { DashboardLayout } from "@/components/lark/layouts";
import { ActionMenu, ColumnsPanel, CountSegments, FacetFilterMenu, FacetList, SavedViewMenu, SplitButton, VerticalNav } from "@/components/lark/menus";
import { PageHeader } from "@/components/lark/page-header";
import { ScopePill, ThemeToggle, UserMenu, UserMenuItem, UserMenuRadioGroup, UserMenuSection, UserMenuSub } from "@/components/lark/shell";
import { type LarkTheme, useTheme } from "@/components/lark/theme";
import { StepList } from "@/components/lark/steps";
import { Transcript, TranscriptLine } from "@/components/lark/transcript";
import { GraphExample } from "./graph-example";
import { StatusBadge } from "@/components/lark/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Combobox, MultiCombobox, Tag } from "@/components/ui/combobox";
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
import { type FileItem, FileDropzone, FileRow } from "@/components/ui/file-dropzone";
import { CopyButton, IconButton, ProgressRing, TextLink } from "@/components/ui/icon-button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const roles = [
  { value: "seller", label: "Seller", description: "Quote with ACE" },
  { value: "deal-desk", label: "Deal desk", description: "Review quotes and approvals" },
  { value: "revops", label: "RevOps" },
  { value: "sales-ops", label: "Sales ops" },
];

function Group({ id, title, use, children }: { id: string; title: string; use: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex scroll-mt-4 flex-col gap-5 pt-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-title-md" id={id}>
          {title}
        </h2>
        <p className="max-w-[80ch] text-sm text-on-surface-variant">{use}</p>
      </div>
      {children}
    </section>
  );
}

function Spec({ name, when, children }: { name: string; when: string; children: ReactNode }) {
  // The pattern's name is a heading; the example below it is grouped tighter than the heading
  // is to it, so a field label inside the example never reads as the pattern's name.
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-title-sm">{name}</h3>
        <p className="max-w-[60ch] text-body-sm text-on-surface-variant">{when}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">{children}</div>
    </div>
  );
}

/** Placeholder art for the examples: a few soft shapes in the tone's hue. */
function Illustration({ tone }: { tone: "sky" | "sand" | "evergreen" | "ember" | "iris" }) {
  const hue = { sky: "var(--lark-sky-500)", sand: "var(--lark-sand-500)", evergreen: "var(--lark-evergreen-50)", ember: "var(--lark-ember-50)", iris: "var(--lark-iris-50)" }[tone];
  return (
    <svg fill="none" height="120" viewBox="0 0 200 120" width="200">
      <rect fill={hue} height="72" opacity="0.18" rx="12" width="120" x="16" y="28" />
      <rect fill={hue} height="10" opacity="0.5" rx="5" width="72" x="32" y="48" />
      <rect fill={hue} height="10" opacity="0.3" rx="5" width="88" x="32" y="68" />
      <circle cx="156" cy="44" fill={hue} opacity="0.35" r="28" />
      <circle cx="156" cy="44" fill={hue} opacity="0.7" r="10" />
    </svg>
  );
}

export function Patterns() {
  const [promo, setPromo] = useState(true);
  const [view, setView] = useState("all");
  const [facets, setFacets] = useState<string[]>(["renewal"]);
  const [facet, setFacet] = useState("all");
  const [scope, setScope] = useState("all");
  const [nav, setNav] = useState("users");
  const [seg, setSeg] = useState("week");
  const [vis, setVis] = useState(["deal", "status", "value", "owner"]);
  const [order, setOrder] = useState(["deal", "status", "value", "owner", "close"]);
  const [po, setPo] = useState("PO-88412");
  const [owner, setOwner] = useState("Priya Raman");
  const [tmpl, setTmpl] = useState("t1");
  const [acct, setAcct] = useState<string | undefined>();
  const [owners, setOwners] = useState<string[]>(["priya", "rui"]);
  const [close, setClose] = useState<Date | undefined>(new Date(2026, 10, 14));
  const [period, setPeriod] = useState<{ from?: Date; to?: Date } | undefined>({ from: new Date(2026, 9, 1), to: new Date(2026, 11, 31) });
  const [discount, setDiscount] = useState<number | undefined>(20);
  const [seats, setSeats] = useState<number | undefined>(1200);
  const [files, setFiles] = useState<FileItem[]>([
    { id: "f1", name: "Northwind PO 88412.pdf", size: 482_000, state: "ready", detail: "4 pages" },
    { id: "f2", name: "Usage forecast.xlsx", state: "uploading", progress: 62 },
    { id: "f3", name: "Contracts.zip", state: "refused", detail: "archives aren't supported. Upload the files inside it." },
  ]);
  const [pinned, setPinned] = useState(false);
  const [role, setRole] = useState("deal-desk");
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout header={<PageHeader className="pb-4" description="Every Lark pattern with when to use it. Live components; interact with them." title="Patterns" />}>
      <nav aria-label="Pattern groups" className="flex flex-wrap gap-2">
        {[
          ["cards", "Cards"],
          ["banners", "Banners"],
          ["states", "Empty, loading, error"],
          ["editing", "Editing and dirty state"],
          ["menus", "Menus"],
          ["fields", "Fields and inputs"],
          ["tabs", "Tabs and switches"],
          ["ai", "AI patterns"],
          ["shell", "Shell and identity"],
          ["leads", "Page leads"],
          ["sequences", "Steps, transcripts, graphs"],
          ["layouts", "Layouts"],
        ].map(([id, label]) => (
          <Button asChild key={id} size="sm" variant="secondary">
            <a href={`#${id}`}>{label}</a>
          </Button>
        ))}
      </nav>

      <Group id="cards" title="Cards" use="Cards hold one subject. White, 12px corners, ink 8% edge, no shadow, except result cards and the onboarding checklist. Lists, toolbars, page headers and empty states are not cards.">
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Spec name="Section card" when="The default container on record, dashboard and settings pages.">
            <SectionCard action={<ActionMenu sections={[{ items: [{ label: "Edit" }, { label: "Copy link" }] }]} />} description="Title 16/24, actions right, body at a 16px inset." title="Deal summary">
              <p className="text-sm">Renew at the current price with a three-year term.</p>
            </SectionCard>
          </Spec>
          <Spec name="Collapsible section card" when="Long record pages: people collapse what they don't need; the summary shows while closed.">
            <SectionCard collapsedSummary="3 open" collapsible defaultOpen={false} title="Questions before approval">
              <p className="text-sm">Three questions are waiting on the seller.</p>
            </SectionCard>
          </Spec>
          <Spec name="Section card with tabs" when="Several views of one subject that swap in place (insights: overview, news, technologies).">
            <SectionCard
              flush
              tabs={
                <Tabs defaultValue="overview">
                  <TabsList aria-label="Insights">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="news">News</TabsTrigger>
                    <TabsTrigger value="tech">Technologies</TabsTrigger>
                  </TabsList>
                  <TabsContent className="py-3 text-sm" value="overview">
                    Score 88 / 100 <Badge variant="success">Excellent</Badge>
                  </TabsContent>
                  <TabsContent className="py-3 text-sm" value="news">No recent news.</TabsContent>
                  <TabsContent className="py-3 text-sm" value="tech">149 technologies detected.</TabsContent>
                </Tabs>
              }
              title="Company insights"
            >
              {null}
            </SectionCard>
          </Spec>
          <Spec name="Chart card, no data yet" when="A chart that has nothing to plot: say why and what fills it, with skeleton bars behind.">
            <SectionCard action={<ActionMenu sections={[{ items: [{ label: "Edit chart" }, { label: "Remove" }] }]} />} title="Email funnel">
              <div className="relative flex h-36 items-end justify-center gap-2" role="img" aria-label="No data yet">
                {[70, 55, 30, 18].map((h) => (
                  <span className="w-8 rounded-t-sm bg-outline-variant" key={h} style={{ height: `${h}%` }} />
                ))}
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
                  <span className="text-label-lg">No data yet</span>
                  <span className="text-body-sm text-on-surface-variant">Connect a mailbox to start tracking.</span>
                </span>
              </div>
            </SectionCard>
          </Spec>
          <Spec name="Action card" when="Something to do next. The whole card is one link, or it carries one button.">
            <div className="grid gap-2 sm:grid-cols-2">
              <ActionCard href="#" icon={<LayoutDashboardIcon />} title="Create dashboard" />
              <ActionCard action={<Button size="sm" variant="ai"><SparklesIcon /> Run</Button>} description="Compare against FY27 policy." icon={<SparklesIcon />} title="Review pricing" tone="ai" />
            </div>
          </Spec>
          <Spec name="Promo card" when="An offer or integration, inline in the page and dismissible. Never a floating box over content.">
            {promo ? (
              <PromoCard action={<Button size="sm" variant="secondary">Connect Slack</Button>} description="DM ACE or mention it in any channel." onDismiss={() => setPromo(false)} title="Get ACE in Slack" />
            ) : (
              <Button onClick={() => setPromo(true)} size="sm" variant="ghost">
                Show promo again
              </Button>
            )}
          </Spec>
        </div>
        <Spec name="Template cards in a band" when="Starting points (workflows, deal templates). Category badges keep a stable hue; AI is always iris. Two-line clamp.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { id: "t1", tags: [<Badge key="a" variant="teal">Renewal</Badge>, <Badge key="b" variant="ai"><SparklesIcon /> AI</Badge>], title: "Renewal with a price hold", d: "Holds this year's price and asks ACE to draft the approval note when the discount rises." },
              { id: "t2", tags: [<Badge key="a" variant="warning">Pricing exception</Badge>], title: "Discount above policy", d: "Routes to VP Finance with the policy check attached." },
              { id: "t3", tags: [<Badge key="a" variant="pink">Counteroffer</Badge>], title: "Customer counteroffer", d: "Compares the counter to the last revision and lists what changed." },
              { id: "t4", tags: [<Badge key="a" variant="olive">Order & billing</Badge>], title: "Order handoff", d: "Checks billing details before the order goes to finance operations." },
            ].map((t) => (
              <TemplateCard description={t.d} key={t.id} onSelect={() => setTmpl(t.id)} selected={tmpl === t.id} tags={t.tags} title={t.title} />
            ))}
          </div>
        </Spec>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Spec name="Checklist card" when="First-run onboarding. One primary per card, on the first open item.">
            <ChecklistCard
              description="Connect your systems so ACE can prepare deals."
              items={[
                { id: "1", title: "Connect Salesforce", done: true },
                { id: "2", title: "Import your pricing policy", description: "PDF or a link to your wiki", action: <Button size="sm">Import</Button> },
                { id: "3", title: "Invite your approvers", action: <Button size="sm" variant="secondary">Invite</Button> },
              ]}
              reward={<Badge variant="selected">Unlocks ACE drafts</Badge>}
              title="Set up the deal desk"
            />
          </Spec>
          <Spec name="Choice card" when="When ACE needs a decision: a bordered radio list, one recommended, Continue stays disabled until a choice.">
            <ChoiceCard
              choices={[
                { value: "save", label: "Save these companies to a list", description: "Keep this set to come back to", recommended: true },
                { value: "people", label: "Find the right people at these companies" },
                { value: "narrow", label: "Narrow the results", description: "Filter by size, location or other criteria" },
              ]}
              prompt="Select one of the following"
            />
          </Spec>
        </div>
        <Spec name="Entity card in a hover card" when="Preview a record from a link without leaving the page. Keyboard users get it on focus.">
          <p className="text-sm">
            Waiting on{" "}
            <HoverCard>
              <HoverCardTrigger asChild>
                <a className="link-default" href="#">
                  Northwind Traders
                </a>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <EntityCard
                  actions={<Button size="sm" variant="secondary">Open</Button>}
                  facts={[
                    { label: "Net value", value: "$1,001,710" },
                    { label: "Owner", value: "Priya Raman" },
                  ]}
                  leading={<CompanyLogo name="Northwind Traders" />}
                  meta="Renewal · OPP-20431"
                  name="Northwind Traders"
                  status={<StatusBadge status="Discount exception" />}
                />
              </HoverCardContent>
            </HoverCard>{" "}
            to approve the discount.
          </p>
        </Spec>
      </Group>

      <Group id="banners" title="Banners" use="Strips run full width between the page header and the toolbar for account problems; inset banners note something about this page. One line, link inline, dismiss right. Errors are role=alert.">
        <div className="-mx-4 flex flex-col gap-2 bg-surface py-3">
          <Banner action={<a href="#">Link mailbox</a>} layout="strip" tone="caution">
            You have no mailboxes linked.
          </Banner>
          <Banner action={<a href="#">Read more</a>} onDismiss={() => {}} tone="permission">
            You&apos;re part of a permission set that limits what you can see on this page.
          </Banner>
          <Banner tone="info">Deepgrids sets up approval policies by default. Changes apply to new requests.</Banner>
          <Banner tone="ai">ACE prepared 3 drafts while you were away.</Banner>
          <Banner tone="positive">All lines are within pricing limits.</Banner>
          <Banner action={<a href="#">Retry</a>} tone="negative">
            We couldn&apos;t save the quote. Your changes are kept.
          </Banner>
        </div>
      </Group>

      <Group id="states" title="Empty, loading and error states" use="Say which situation this is: nothing exists yet, filters hid everything, you can't see it, it broke, or you're offline. Loading placeholders take the shape of what's coming.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["first-run", "No deals yet", "Deals appear when a quote is created in Salesforce.", <Button key="a">New deal</Button>],
              ["no-results", "No deals match these filters", "Try a broader search or clear the filters.", <Button key="b" variant="secondary">Clear filters</Button>],
              ["no-permission", "You don't have access to Approvals", "Ask Avery Chen (admin) to add you to the Deal desk team.", <Button key="c" variant="secondary">Request access</Button>],
              ["error", "Couldn't load approvals", "The approvals service didn't respond. Nothing was lost.", <Button key="d" variant="secondary">Try again</Button>],
              ["offline", "You're offline", "Changes are saved on this device and sync when you reconnect.", null],
            ] as const
          ).map(([kind, title, desc, action]) => (
            <div className="rounded-lg border border-outline-variant bg-card" key={kind}>
              <StatePanel actions={action} compact description={desc} details={kind === "error" ? "Request req_7f3a91c2" : undefined} kind={kind} title={title} />
            </div>
          ))}
          <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-3" role="status">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-outline-variant bg-outline-variant">
              <SkeletonFigure />
              <SkeletonFigure />
            </div>
            <SkeletonCard />
          </div>
        </div>
      </Group>

      <Group id="editing" title="Editing and dirty state" use="Values edit in place. Edited fields carry a mark; the page shows its save state; a sticky bar offers Discard and Save while anything is unsaved, and leaving warns.">
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <SectionCard title="Inline edit">
            <dl className="grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-1">
              <dt className="text-label-md text-on-surface-tertiary">PO number</dt>
              <dd>
                <InlineEdit dirty={po !== "PO-88412"} label="PO number" mono onCommit={setPo} validate={(v) => (/^PO-\d{4,}$/.test(v) ? undefined : "Use the format PO-12345.")} value={po} />
              </dd>
              <dt className="text-label-md text-on-surface-tertiary">Owner</dt>
              <dd>
                <InlineEdit dirty={owner !== "Priya Raman"} label="Owner" onCommit={setOwner} value={owner} />
              </dd>
              <dt className="text-label-md text-on-surface-tertiary">Billing contact</dt>
              <dd>
                <InlineEdit label="Billing contact" onCommit={() => {}} placeholder="Add a billing contact" value="" />
              </dd>
            </dl>
          </SectionCard>
          <SectionCard title="Save states">
            <div className="flex flex-col gap-2">
              <SaveStatus state="dirty" />
              <SaveStatus state="saving" />
              <SaveStatus savedLabel="Saved 2 min ago" state="saved" />
              <SaveStatus onRetry={() => {}} state="error" />
              <DirtyMark />
            </div>
          </SectionCard>
        </div>
        <div className="overflow-hidden rounded-lg border border-outline-variant">
          <UnsavedChangesBar count={2} onDiscard={() => {}} onSave={() => {}} open />
        </div>
      </Group>

      <Group id="menus" title="Menus" use="Menus are anchored to their trigger, 8px corners, items 32. Destructive last and separated; disabled items stay visible and say why.">
        <div className="flex flex-wrap items-start gap-3">
          <Spec name="Action menu" when="Row, card and header ⋯">
            <ActionMenu
              sections={[
                { items: [{ label: "Edit", icon: <PencilIcon />, shortcut: "E" }, { label: "Duplicate", icon: <CopyIcon />, shortcut: "⌘D" }] },
                { label: "Move", items: [{ label: "Archive", icon: <ArchiveIcon />, disabledReason: "Open approvals block archiving." }] },
                { items: [{ label: "Delete", icon: <Trash2Icon />, destructive: true }] },
              ]}
            />
          </Spec>
          <Spec name="Split button" when="One main action with alternatives">
            <SplitButton icon={<PlusIcon />} sections={[{ items: [{ label: "Quote revision", icon: <FileTextIcon /> }, { label: "Pricing exception", icon: <ScaleIcon /> }] }]}>
              New work
            </SplitButton>
          </Spec>
          <Spec name="Saved views" when="List pages">
            <SavedViewMenu onChange={setView} onCreate={() => {}} value={view} views={[{ id: "all", name: "Default view", count: "24" }, { id: "r", name: "Renewals this quarter", count: "4" }, { id: "t", name: "Deal desk queue", owner: "team", count: "8" }]} />
          </Spec>
          <Spec name="Facet filter" when="Multi-select with counts, applies on Apply">
            <FacetFilterMenu facets={[{ value: "renewal", label: "Renewal", count: 4 }, { value: "expansion", label: "Expansion", count: 4 }, { value: "new", label: "New deal request", count: 4 }]} label="Type" onChange={setFacets} value={facets} />
          </Spec>
          <Spec name="Context menu" when="Right-click on rows or canvas items; mirrors the ⋯ menu">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-16 w-56 items-center justify-center rounded-lg border border-dashed border-outline-strong text-body-sm text-on-surface-variant">
                Right-click here
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem>Open</ContextMenuItem>
                <ContextMenuItem>Copy link</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Spec>
        </div>
        <div className="max-w-xs rounded-lg border border-outline-variant bg-card p-2">
          <Spec name="Columns panel" when="View options → columns. Reorder with Move up / Move down (keyboard-friendly drag).">
            <ColumnsPanel
              columns={[{ id: "deal", label: "Deal", locked: true }, { id: "status", label: "Status" }, { id: "value", label: "Net value" }, { id: "owner", label: "Owner" }, { id: "close", label: "Close" }]}
              onOrderChange={setOrder}
              onVisibleChange={setVis}
              order={order}
              visible={vis}
            />
          </Spec>
        </div>
      </Group>

      <Group id="fields" title="Fields and inputs" use="Every field is 32 tall (28 small), radius 8, a 3:1 edge, and shows its value in words. Search beats scrolling past ~10 options. Text is 14px with a mouse and 16px on touch, so phones never zoom the page.">
        <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Spec name="Combobox" when="One choice from many: accounts, owners, products. Disabled options stay visible and say why.">
            <Label htmlFor="pat-acct">Account</Label>
            <Combobox
              clearable
              id="pat-acct"
              onValueChange={setAcct}
              options={[
                { value: "nw", label: "Northwind Traders", description: "Enterprise, Seattle", leading: <CompanyLogo name="Northwind Traders" size="xs" /> },
                { value: "hg", label: "Halvorsen Group", description: "Mid-market, Oslo", leading: <CompanyLogo name="Halvorsen Group" size="xs" /> },
                { value: "mf", label: "Meridian Freight", description: "You don't have access", disabled: true },
              ]}
              placeholder="Choose an account"
              value={acct}
            />
          </Spec>
          <Spec name="Multi-select with tags" when="Several values from many. Each tag removes itself; Backspace removes the last.">
            <Label htmlFor="pat-owners">Approvers</Label>
            <MultiCombobox
              id="pat-owners"
              max={3}
              onValueChange={setOwners}
              options={[
                { value: "priya", label: "Priya Raman", description: "Seller" },
                { value: "rui", label: "Rui Tanaka", description: "VP Finance" },
                { value: "sam", label: "Sam Whitfield", description: "Legal" },
                { value: "avery", label: "Avery Chen", description: "Deal desk" },
              ]}
              placeholder="Add approvers"
              value={owners}
            />
          </Spec>
          <Spec name="Tags" when="Values someone chose, removable. Not statuses (use StatusBadge).">
            <div className="flex flex-wrap gap-1.5">
              <Tag onRemove={() => {}}>Renewal</Tag>
              <Tag onRemove={() => {}}>EMEA</Tag>
              <Tag>Read-only tag</Tag>
            </div>
          </Spec>
          <Spec name="Date" when="A single date, written out (Nov 14, 2026), never 11/14 in a shared product.">
            <Label htmlFor="pat-close">Close date</Label>
            <DatePicker id="pat-close" onValueChange={setClose} value={close} />
          </Spec>
          <Spec name="Date range" when="Periods and service windows. Presets for the ranges people use; one month on phones.">
            <Label htmlFor="pat-period">Service period</Label>
            <DateRangePicker
              id="pat-period"
              onValueChange={(r) => setPeriod(r)}
              presets={[
                { label: "This quarter", range: () => ({ from: new Date(2026, 9, 1), to: new Date(2026, 11, 31) }) },
                { label: "Next 12 months", range: () => ({ from: new Date(2026, 10, 5), to: new Date(2027, 10, 4) }) },
              ]}
              value={period?.from ? { from: period.from, to: period.to } : undefined}
            />
          </Spec>
          <Spec name="Number with a unit" when="Discounts, seats, terms. Arrow keys step, Shift steps ×10; the value is clamped on blur.">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pat-disc">Discount</Label>
                <NumberInput id="pat-disc" max={40} min={0} onValueChange={setDiscount} suffix="%" value={discount} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pat-seats">Seats</Label>
                <NumberInput id="pat-seats" min={1} onValueChange={setSeats} step={50} value={seats} />
              </div>
            </div>
          </Spec>
          <Spec name="File upload" when="Say what's accepted before anyone tries. Every file shows its state; refusals say what to send instead.">
            <FileDropzone
              accept=".pdf,.xlsx,.docx,.eml"
              hint="PDF, Excel, Word or email, up to 25 MB each"
              onFiles={(fs) => setFiles((cur) => [...cur, ...fs.map((f, i) => ({ id: `${f.name}-${i}-${cur.length}`, name: f.name, size: f.size, state: "ready" as const }))])}
            />
            <div className="flex flex-col gap-2">
              {files.map((f) => (
                <FileRow file={f} key={f.id} onRemove={() => setFiles((cur) => cur.filter((x) => x.id !== f.id))} />
              ))}
              <FileRow file={{ id: "f4", name: "Call notes.docx", state: "failed", detail: "the connection dropped at 80%." }} onRetry={() => {}} />
            </div>
          </Spec>
          <Spec name="Icon buttons, copy and links" when="Icon-only buttons always have a name, shown as their tooltip. Links: ink by default, blue in running text.">
            <div className="flex flex-wrap items-center gap-1">
              <IconButton label="Pin deal" onClick={() => setPinned((p) => !p)} pressed={pinned} shortcut="Ctrl P">
                <ScaleIcon />
              </IconButton>
              <IconButton label="Duplicate">
                <CopyIcon />
              </IconButton>
              <CopyButton label="Copy deal ID" value="OPP-20431" />
            </div>
            <p className="text-sm">
              Read the <TextLink href="#">pricing policy</TextLink> or the <TextLink external href="https://example.com" variant="hyper">FY27 announcement</TextLink>.
            </p>
          </Spec>
          <Spec name="Progress ring" when="Counts in tight spots. Always with the words next to it.">
            <div className="flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-2"><ProgressRing value={3} max={5} /> 3 of 5 approvals</span>
              <span className="flex items-center gap-2"><ProgressRing tone="ai" value={18} max={24} /> ACE checked 18 of 24 deals</span>
              <span className="flex items-center gap-2"><ProgressRing tone="error" value={2} max={24} /> 2 checks failed</span>
            </div>
          </Spec>
        </div>
      </Group>

      <Group id="tabs" title="Tabs and switches" use="Pick by behaviour: links that change the URL are PageTabs; panels that swap in place are Tabs (underline or segmented); filters over the same content are Segmented or facet lists.">
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <Spec name="Segmented tabs" when="Record page sections">
            <Tabs defaultValue="a">
              <TabsList aria-label="Example" variant="segmented">
                <TabsTrigger value="a">Overview</TabsTrigger>
                <TabsTrigger value="b">People</TabsTrigger>
                <TabsTrigger value="c">Locations</TabsTrigger>
              </TabsList>
            </Tabs>
          </Spec>
          <Spec name="Segmented control" when="Switch a view: density, chart or table">
            <Segmented aria-label="Range" onValueChange={setSeg} options={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "quarter", label: "Quarter" }]} value={seg} />
          </Spec>
          <Spec name="Count segments" when="Top of a filter rail">
            <CountSegments items={[{ value: "all", label: "Total", count: "8.6M" }, { value: "new", label: "Net new", count: "8.6M" }, { value: "saved", label: "Saved", count: "2.1K" }]} label="Scope" onChange={setScope} value={scope} />
          </Spec>
          <Spec name="Facet list" when="One-choice filter in a rail">
            <FacetList facets={[{ value: "all", label: "Total", count: 298 }, { value: "sent", label: "Sent", count: 7 }, { value: "not", label: "Not sent", count: 291 }]} label="Status" onChange={setFacet} value={facet} />
          </Spec>
          <Spec name="Vertical nav" when="Settings sections">
            <VerticalNav items={[{ value: "general", label: "General" }, { value: "users", label: "Users", count: 5 }, { value: "policies", label: "Approval policies" }]} label="Settings" onChange={setNav} value={nav} />
          </Spec>
        </div>
      </Group>

      <Group id="ai" title="AI patterns" use="AI work is visible, reviewable and reversible: plans before action, progress while running, sources behind every value, confidence in words, and changes reviewed before they apply. Iris always means AI.">
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceBadge level="high" />
          <ConfidenceBadge level="medium" />
          <ConfidenceBadge level="low" />
          <span className="text-sm">
            Discount above policy <EvidencePopover evidence={[{ label: "FY27 discount v3", kind: "Policy", quote: "Platform discounts above 20% need VP Finance." }, { label: "Quote R4", kind: "Salesforce" }]} summary="The platform line is at 24%; the policy limit for 36-month renewals is 20%." />
          </span>
          <DiffValue from="24%" to="20%" />
        </div>
        <div className="flex flex-wrap gap-6 rounded-lg border border-outline-variant bg-card p-4">
          <AiRunCell onRun={() => {}} state="idle" />
          <AiRunCell state="queued" />
          <AiRunCell state="running" />
          <AiRunCell confidence="medium" evidence={[{ label: "Opportunity", kind: "Salesforce" }]} state="done" value="Renewal at risk" />
          <AiRunCell error="Contract not found" onRun={() => {}} state="failed" />
          <AiRunCell state="skipped" />
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <PlanReview steps={[{ id: "1", title: "Re-price the platform line" }, { id: "2", title: "Re-run the policy check" }, { id: "3", title: "Send to VP Finance", risky: true }]} />
          <div className="flex flex-col gap-4">
            <RunSteps steps={[{ id: "a", title: "Read quote R4", state: "done" }, { id: "b", title: "Check policy", state: "done" }, { id: "c", title: "Check MSA", state: "failed", detail: "Contract not found in Drive" }]} title="Pricing review" />
            <ChangeReview changes={[{ id: "1", field: "Platform discount", from: "24%", to: "20%", by: "ACE" }, { id: "2", field: "Payment terms", from: "Net 45", to: "Net 30", by: "Priya Raman" }]} />
          </div>
        </div>
      </Group>

      <Group id="shell" title="Shell, identity and figures" use="The frame around every page: theme, the person's menu, the sidebar, headline figures and the marks of the services Lark connects to.">
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Spec name="Theme" when="ThemeScript in <head>, then useTheme or ThemeToggle. Apps with their own stored theme pass storageKey and attribute (class, data-theme or both) to all three.">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <code className="font-mono text-body-sm text-on-surface-variant">{`<ThemeScript storageKey="app-theme" attribute="both" />`}</code>
            </div>
          </Spec>
          <Spec name="User menu" when="The person, their role and everything about their session: profile, workspaces, working role, theme, help. Sections are ruled; one-of-many choices are radio items that say which is on.">
            <div className="flex items-center gap-2">
              <UserMenu detail={`${roles.find((r) => r.value === role)?.label} · Deal Desk view`} name="Avery Chen">
                <UserMenuSection>
                  <UserMenuItem href="#shell" icon={<UserIcon />} shortcut="Ctrl ,">
                    Profile and preferences
                  </UserMenuItem>
                  <UserMenuSub icon={<LayoutGridIcon />} label="Switch workspace">
                    {["Platform", "AI Studio", "Company ontology", "ACE Calls", "Companion", "All spaces"].map((w) => (
                      <UserMenuItem href="#shell" key={w}>
                        {w}
                      </UserMenuItem>
                    ))}
                  </UserMenuSub>
                </UserMenuSection>
                <UserMenuSection>
                  <UserMenuRadioGroup label="Working role" onValueChange={setRole} options={roles} value={role} />
                </UserMenuSection>
                <UserMenuSection>
                  <UserMenuRadioGroup
                    label="Theme"
                    onValueChange={(v) => setTheme(v as LarkTheme)}
                    options={[
                      { value: "light", label: "Light" },
                      { value: "dusk", label: "Dark" },
                      { value: "system", label: "System" },
                    ]}
                    value={theme}
                  />
                </UserMenuSection>
                <UserMenuSection>
                  <UserMenuItem href="#shell" icon={<CircleHelpIcon />}>
                    Help and documentation
                  </UserMenuItem>
                  <UserMenuItem href="#shell" icon={<CoinsIcon />}>
                    Usage and credits
                  </UserMenuItem>
                  <UserMenuItem icon={<RefreshCwIcon />} onSelect={() => {}}>
                    Refresh workspace
                  </UserMenuItem>
                </UserMenuSection>
              </UserMenu>
              <span className="text-body-sm text-on-surface-variant">Open the avatar</span>
            </div>
          </Spec>
          <Spec name="Sidebar: scope, badges, collapsible groups, footer" when="AppSidebar takes scope (a ScopePill under the logo), groups that collapse (collapsible, defaultOpen, or open + onOpenChange to remember), item badges for things waiting (CountPill, a dot on the rail, the count always in the name) and footerItems. The sidebar on this page uses all four.">
            <div className="flex flex-wrap items-center gap-2">
              <ScopePill href="#shell" label="Example data · as of Oct 21" tone="caution" />
              <ScopePill label="Live · Salesforce" tone="positive" />
              <ScopePill label="Sandbox" />
            </div>
          </Spec>
          <Spec name="Figure with icon and caption" when="A home page's next steps as numbers: icon tile (tone), label, value, one caption line. With href the whole card is one link named by label and value; the arrow shows on hover and focus.">
            <div className="grid gap-3 sm:grid-cols-2">
              <FigureCard caption="Continue a draft" href="#shell" icon={<FileTextIcon />} label="Quotes to work on" tone="primary" value={36} />
              <FigureCard caption="See who needs to review" href="#shell" icon={<ScaleIcon />} label="Waiting for approval" tone="warning" value={3} />
            </div>
          </Spec>
          <Spec name="Service logos" when="Identify a connected service, always beside its name, never as decoration. MCP servers get a neutral plug and generic email an envelope; pass src for a mark your app provides (https, data:image or a relative path).">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {["Snowflake", "Salesforce", "Slack", "Outlook", "Zoom", "MCP server", "Email"].map((s) => (
                <li className="inline-flex items-center gap-1.5" key={s}>
                  <ServiceLogo service={s} />
                  {s}
                </li>
              ))}
              <li className="inline-flex items-center gap-1.5">
                <ServiceLogo service="Lark" src="/file.svg" />
                App-provided mark
              </li>
            </ul>
          </Spec>
        </div>
      </Group>

      <Group id="leads" title="Page leads" use="How a home or entry page opens: one tinted HeroBand, then the work. Entry pages offer a few big choices as IllustratedChoiceCards. Tints come from five tones; illustrations are decorative unless they carry information.">
        <Spec name="Hero band" when="A role's home: eyebrow, title, one line, one or two actions (at most one brand button) and an illustration. Stacks under 640 with the illustration first; never sticky.">
          <HeroBand
            actions={
              <>
                <Button>Start a quote</Button>
                <Button variant="secondary">See open quotes</Button>
              </>
            }
            as="h2"
            description="Draft, price and send quotes with ACE checking policy as you go."
            eyebrow="Seller"
            media={<Illustration tone="sky" />}
            title="Quote with ACE"
            tone="sky"
          />
        </Spec>
        <Spec name="Illustrated choice cards" when="A few big options on an entry page (the four roles). The whole card is one link named by its title; the current one says so (aria-current). Equal heights in a grid; hover lifts the edge.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(
              [
                ["seller", "Seller", "Draft and price quotes with ACE, then send them for approval.", "sky"],
                ["deal-desk", "Deal desk", "Review quotes and approvals, with policy checks and the price waterfall.", "sand"],
                ["revops", "RevOps", "Watch pipeline health and fix the data behind the forecast.", "evergreen"],
                ["sales-ops", "Sales ops", "Set pricing rules, approval routes and the guardrails ACE follows.", "ember"],
              ] as const
            ).map(([id, title, description, tone]) => (
              <IllustratedChoiceCard current={id === role} description={description} href="#leads" key={id} media={<Illustration tone={tone} />} title={title} tone={tone} />
            ))}
          </div>
        </Spec>
      </Group>

      <Group id="sequences" title="Steps, transcripts and graphs" use="Things that happen in order or connect: steps with state, what was said in a meeting, records and how they relate.">
        <Spec name="Step list" when="Numbered steps with state: setup, onboarding, a check's stages. State is in words for screen readers; the current step is aria-current=step; a blocked step says why in its description. Horizontal for 3–5 short steps, vertical otherwise.">
          <div className="grid gap-6 lg:grid-cols-2">
            <StepList
              aria-label="Companion setup"
              steps={[
                { id: "install", title: "Install Companion", description: "Added to Chrome on Nov 3.", state: "done" },
                { id: "deal", title: "Select the deal", description: "Pick the opportunity you're working on.", state: "current", action: <Button size="sm">Choose a deal</Button> },
                { id: "check", title: "Check and resolve", description: "Needs a deal first.", state: "blocked" },
                { id: "share", title: "Share with your manager", state: "skipped" },
              ]}
            />
            <StepList
              aria-label="Here's what you can try"
              orientation="horizontal"
              steps={[
                { id: "a", title: "Try a quote", state: "done" },
                { id: "b", title: "Review approvals", state: "current" },
                { id: "c", title: "Send to customer", state: "todo" },
              ]}
            />
          </div>
        </Spec>
        <Spec name="Transcript" when="What was said in a call or a deal room: speaker, time (an offset or a clock time) and the words; flags mark commitments, risks and questions. An ordered list, so position is announced; long lines wrap.">
          <Transcript className="max-w-[720px]" label="Northwind renewal call, Nov 3">
            <TranscriptLine speaker="Dana Whitfield" time="02:14">
              Thanks for sending the revised quote. Procurement has a few questions before Friday.
            </TranscriptLine>
            <TranscriptLine flag="Question" speaker="Dana Whitfield" time="03:40">
              Can the 1,200 analytics seats start in January instead of December, without changing the annual price?
            </TranscriptLine>
            <TranscriptLine flag="Commitment" speaker="Avery Chen" time="04:05">
              Yes. I&apos;ll send an updated schedule with a January start by Wednesday.
            </TranscriptLine>
            <TranscriptLine flag="Risk" speaker="Dana Whitfield" time="1:02:31">
              If legal can&apos;t review the data processing addendum this month, signature slips to Q1.
            </TranscriptLine>
          </Transcript>
        </Spec>
        <Spec name="Graph (React Flow)" when="Records and how they relate (the ontology graph). GraphNode from @deepgrids/lark/graph inside a custom node, GraphEdgeLabel on edges, and @deepgrids/lark/graph.css for the canvas, edges, handles, controls and minimap. The meta line names each category in words; dimmed nodes are off the selected path.">
          <GraphExample />
        </Spec>
      </Group>

      <Group id="layouts" title="Layouts" use="Full bleed, always. The shell is the viewport; each archetype decides what scrolls.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <ActionCard description="Header, toolbar, filter rail, data grid. Rail and grid scroll." href="/examples/deals" icon={<FileTextIcon />} title="List page" />
          <ActionCard description="Header band, 360 details column, segmented sections." href="/examples/record" icon={<FileTextIcon />} title="Record page" />
          <ActionCard description="Header band, grey body, card grid." href="/examples/dashboard" icon={<LayoutDashboardIcon />} title="Dashboard" />
          <ActionCard description="Section nav, settings cards, dirty bar." href="/examples/settings" icon={<FileTextIcon />} title="Settings" />
          <ActionCard description="Conversation, work canvas, context panel." href="/examples/chat" icon={<SparklesIcon />} title="Assistant" tone="ai" />
        </div>
      </Group>
    </DashboardLayout>
  );
}
