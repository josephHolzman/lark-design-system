"use client";

import {
  BriefcaseBusinessIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  MessageSquareIcon,
  PlayIcon,
  PlusIcon,
  ScaleIcon,
  SearchXIcon,
  SparklesIcon,
  UserRoundCheckIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { toast } from "sonner";

import { IconChip, SectionCard } from "@/components/lark/cards";
import { DashboardGrid, DashboardLayout } from "@/components/lark/layouts";
import { Num, SortableHead, type SortDirection, SourceChip, SourceList, TablePager } from "@/components/lark/data";
import { Figure, FigureStrip, Sparkline } from "@/components/lark/figure";
import { FilterBar, FilterChip, FilterCount, FilterSearch, Segmented } from "@/components/lark/filters";
import { CompanyLogo } from "@/components/lark/identity";
import { DescriptionItem, DescriptionList, List, ListItem } from "@/components/lark/lists";
import { SplitButton } from "@/components/lark/menus";
import { CompoundTag, Freshness, ProvisionalBadge } from "@/components/lark/surfaces";
import { PageHeader, PageTabs } from "@/components/lark/page-header";
import { ApprovalChain, StageProgress, Timeline, TimelineItem } from "@/components/lark/progress";
import { StatusBadge } from "@/components/lark/status-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { ContainedField, ContainedTextarea } from "@/components/ui/contained-field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ------------------------------------------------------------------ data (fictional) */

type Deal = {
  id: string;
  account: string;
  type: "Renewal" | "Expansion" | "New business";
  owner: string;
  task: string;
  status: string;
  value: number;
  discount: number;
  close: string;
  closeLabel: string;
  mine: boolean;
};

const DEALS: Deal[] = [
  { id: "OPP-20431", account: "Northwind Traders", type: "Renewal", owner: "Priya Raman", task: "Approve platform discount", status: "Discount exception", value: 1001710, discount: 24, close: "2026-11-14", closeLabel: "Nov 14", mine: true },
  { id: "OPP-20456", account: "Halvorsen Group", type: "Expansion", owner: "Marcus Bell", task: "Review 36-month term", status: "Awaiting decision", value: 186500, discount: 12, close: "2026-11-18", closeLabel: "Nov 18", mine: true },
  { id: "OPP-20470", account: "Brightline Health", type: "New business", owner: "Avery Chen", task: "Confirm payment terms", status: "In review", value: 248000, discount: 8, close: "2026-11-21", closeLabel: "Nov 21", mine: false },
  { id: "OPP-20488", account: "Meridian Freight", type: "Renewal", owner: "Priya Raman", task: "Approve price hold", status: "Review required", value: 97400, discount: 15, close: "2026-11-25", closeLabel: "Nov 25", mine: true },
  { id: "OPP-20502", account: "Corvid Analytics", type: "Expansion", owner: "Dana Okafor", task: "Check usage tier change", status: "Ready for review", value: 64200, discount: 5, close: "2026-11-28", closeLabel: "Nov 28", mine: false },
  { id: "OPP-20517", account: "Fernwood Energy", type: "New business", owner: "Marcus Bell", task: "Approve multi-year ramp", status: "Awaiting decision", value: 530000, discount: 18, close: "2026-12-03", closeLabel: "Dec 3", mine: false },
  { id: "OPP-20533", account: "Oakline Bank", type: "Renewal", owner: "Avery Chen", task: "Confirm security addendum", status: "Changes requested", value: 142900, discount: 10, close: "2026-12-09", closeLabel: "Dec 9", mine: true },
  { id: "OPP-20541", account: "Pellucid Labs", type: "Expansion", owner: "Dana Okafor", task: "Review seat true-up", status: "Within pricing limits", value: 38600, discount: 4, close: "2026-12-12", closeLabel: "Dec 12", mine: false },
];

// When the example's figures were computed (fixed at load, so the freshness lines have something to say).
const LOADED = Date.now();
const COMPUTED_AT = new Date(LOADED - 2 * 60_000);
const SYNCED_AT = new Date(LOADED - 2 * 60_000);
const BRIEF_AT = new Date(LOADED - 2 * 60_000);
const PIPELINE_AT = new Date(LOADED - 3 * 3_600_000);

/* The Northwind approvals, shown as lanes on the overview and as a chain in the drawer. */
const LANES = [
  { title: "Deal desk review", approver: "Avery Chen", role: "Deal desk", status: "Approved", note: "Term and ramp are standard.", when: "Approved 9:02" },
  { title: "Discount exception", approver: "Rui Tanaka", role: "VP Finance", status: "Awaiting decision", note: "Required because the platform discount is above 20%.", when: "Waiting 3 hr" },
  { title: "Legal sign-off", approver: "Sam Whitfield", role: "Legal", status: "Waiting", note: "Starts after Finance approves.", when: "" },
];

const OWNERS = ["Everyone", ...Array.from(new Set(DEALS.map((d) => d.owner)))];

const usd = (n: number) => "$" + n.toLocaleString("en-US");

const PIPELINE = [
  { stage: "Understand", value: 0.62 },
  { stage: "Prepare", value: 1.14 },
  { stage: "Approve", value: 1.84 },
  { stage: "Confirm", value: 0.71 },
];
const chartConfig = { value: { label: "Pipeline ($M)", color: "var(--primary)" } } satisfies ChartConfig;

const STAGES = [
  { label: "Understand request" },
  { label: "Prepare changes" },
  { label: "Approval decisions", description: "2 of 3 approvals" },
  { label: "Confirm follow-through" },
];

/* ------------------------------------------------------------------ page */

export function Dashboard() {
  const [query, setQuery] = useState("");
  const [mine, setMine] = useState(false);
  const [exceptions, setExceptions] = useState(false);
  const [owner, setOwner] = useState("Everyone");
  const [before, setBefore] = useState<Date | undefined>();
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [sort, setSort] = useState<{ key: "value" | "close"; dir: Exclude<SortDirection, false> }>({ key: "close", dir: "asc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Deal | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const beforeIso = before ? before.toISOString().slice(0, 10) : null;
    return DEALS.filter(
      (d) =>
        (!q || `${d.account} ${d.task} ${d.id} ${d.owner}`.toLowerCase().includes(q)) &&
        (!mine || d.mine) &&
        (!exceptions || d.status === "Discount exception" || d.status === "Review required") &&
        (owner === "Everyone" || d.owner === owner) &&
        (!beforeIso || d.close <= beforeIso)
    ).sort((a, b) => {
      const r = sort.key === "value" ? a.value - b.value : a.close.localeCompare(b.close);
      return sort.dir === "asc" ? r : -r;
    });
  }, [query, mine, exceptions, owner, before, sort]);

  const toggleSort = (key: "value" | "close") =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  const sortOf = (key: "value" | "close"): SortDirection => (sort.key === key ? sort.dir : false);

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = rows.some((r) => selected.has(r.id));
  const clearFilters = () => {
    setQuery("");
    setMine(false);
    setExceptions(false);
    setOwner("Everyone");
    setBefore(undefined);
  };

  return (
    // The dashboard archetype: a white header band (title, actions, tabs on its edge), then the
    // grey body with the cards. Every module on the page is a SectionCard: one radius, one edge.
    <DashboardLayout
      header={
        <PageHeader
          actions={
            <>
              <Button size="sm" variant="outline">
                <DownloadIcon />
                Export
              </Button>
              <SplitButton
                icon={<PlusIcon />}
                menuLabel="More ways to create work"
                sections={[
                  {
                    items: [
                      { label: "Quote revision", icon: <FileTextIcon /> },
                      { label: "Pricing exception", icon: <ScaleIcon /> },
                      { label: "Assign to ACE", icon: <SparklesIcon /> },
                    ],
                  },
                ]}
                size="sm"
              >
                New work
              </SplitButton>
            </>
          }
          description="Quote changes and approvals that need a decision from the desk."
          meta={
            <>
              <span>Q4 FY26</span>
              <span>Example records · Nov 5, 2026</span>
              <Freshness at={COMPUTED_AT} verb="Figures updated" />
            </>
          }
          tabs={
            <PageTabs
              label="Deal desk sections"
              tabs={[
                { label: "Overview", href: "/examples/dashboard", current: true },
                { label: "Queue", href: "#queue", count: 8 },
                { label: "Approvals", href: "#approvals", count: 3 },
                { label: "History", href: "#history" },
              ]}
            />
          }
          title="Deals & approvals"
        />
      }
    >
      <FigureStrip aria-label="Desk summary" columns={4} role="group">
        <Figure
          delta={{ value: "+3", direction: "up", good: false, context: "vs last week" }}
          href="#queue"
          icon={<ClockIcon />}
          label="Needs a decision"
          value="8"
        />
        <Figure caption="Across 5 deals" href="#queue" icon={<BriefcaseBusinessIcon />} label="Awaiting approval" value="$1.84M" />
        <Figure
          delta={{ value: "−0.4 days", direction: "down", good: true, context: "vs Q3" }}
          icon={<UserRoundCheckIcon />}
          label="Median time to decision"
          unit="days"
          value="1.6"
        />
        <Figure
          delta={{ value: "+6 pts", direction: "up", good: true, context: "this quarter" }}
          icon={<ScaleIcon />}
          label="Within pricing limits"
          unit="%"
          value="72"
        >
          <Sparkline points={[61, 63, 62, 66, 65, 69, 70, 72]} />
        </Figure>
      </FigureStrip>

      <DashboardGrid>
        <div className="flex min-w-0 flex-col gap-4">
        {/* ------------------------------------------------ queue */}
        <SectionCard
          action={
            <Segmented
              aria-label="Row density"
              onValueChange={(v) => setDensity(v as typeof density)}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
              value={density}
            />
          }
          description="Sorted by close date. Select rows to reassign or export."
          flush
          footer={
            <TablePager from={rows.length ? 1 : 0} noun="deals" to={rows.length} total={rows.length}>
              {someChecked && (
                <>
                  <span className="text-on-surface">{selected.size} selected</span>
                  <Button onClick={() => setSelected(new Set())} size="xs" variant="ghost">
                    Clear
                  </Button>
                  <Button size="xs" variant="secondary">
                    Reassign
                  </Button>
                </>
              )}
            </TablePager>
          }
          id="queue"
          title="Needs your decision"
        >
          <FilterBar className="px-4 pb-3">
            <FilterSearch label="Search deals" onValueChange={setQuery} placeholder="Search account, task or ID" value={query} />
            <FilterChip onSelectedChange={setMine} selected={mine}>
              Mine
            </FilterChip>
            <FilterChip onSelectedChange={setExceptions} selected={exceptions}>
              Policy exceptions
            </FilterChip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <FilterChip menu value={owner === "Everyone" ? undefined : owner.split(" ")[0]}>
                  Owner
                </FilterChip>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Owner</DropdownMenuLabel>
                <DropdownMenuRadioGroup onValueChange={setOwner} value={owner}>
                  {OWNERS.map((o) => (
                    <DropdownMenuRadioItem key={o} value={o}>
                      {o}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger asChild>
                <FilterChip
                  icon={<CalendarIcon />}
                  menu
                  value={before?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                >
                  Closes by
                </FilterChip>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-2">
                <Calendar defaultMonth={new Date(2026, 10, 1)} mode="single" onSelect={setBefore} selected={before} />
                {before && (
                  <Button className="w-full" onClick={() => setBefore(undefined)} size="sm" variant="ghost">
                    Clear date
                  </Button>
                )}
              </PopoverContent>
            </Popover>
            <FilterCount>
              {rows.length} of {DEALS.length} deals
            </FilterCount>
          </FilterBar>

          {rows.length === 0 ? (
            <Empty className="border-t border-outline-variant py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>No deals match these filters</EmptyTitle>
                <EmptyDescription>Try a broader search, or clear the filters to see the whole queue.</EmptyDescription>
              </EmptyHeader>
              <Button onClick={clearFilters} size="sm" variant="outline">
                Clear filters
              </Button>
            </Empty>
          ) : (
            <Table className="border-t border-outline-variant" density={density}>
              <caption className="sr-only">Deals that need a decision, {rows.length} rows</caption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pr-0">
                    <Checkbox
                      aria-label="Select all deals"
                      checked={allChecked ? true : someChecked ? "indeterminate" : false}
                      onCheckedChange={(v) => setSelected(v ? new Set(rows.map((r) => r.id)) : new Set())}
                    />
                  </TableHead>
                  <TableHead scope="col">Deal</TableHead>
                  <TableHead scope="col">Task</TableHead>
                  <SortableHead align="right" onSort={() => toggleSort("value")} scope="col" sorted={sortOf("value")}>
                    Net value
                  </SortableHead>
                  <TableHead className="hidden text-right lg:table-cell" scope="col">
                    Discount
                  </TableHead>
                  <SortableHead onSort={() => toggleSort("close")} scope="col" sorted={sortOf("close")}>
                    Close
                  </SortableHead>
                  <TableHead className="w-0" scope="col">
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => {
                  const checked = selected.has(d.id);
                  return (
                    <TableRow data-state={checked ? "selected" : undefined} key={d.id}>
                      <TableCell className="pr-0">
                        <Checkbox
                          aria-label={`Select ${d.account}`}
                          checked={checked}
                          onCheckedChange={(v) =>
                            setSelected((s) => {
                              const n = new Set(s);
                              if (v) n.add(d.id);
                              else n.delete(d.id);
                              return n;
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <CompanyLogo name={d.account} size={density === "compact" ? "sm" : "md"} />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">{d.account}</span>
                            {density === "comfortable" && (
                              <span className="truncate text-body-sm text-on-surface-variant">
                                {d.type} · {d.owner}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 flex-col items-start gap-1 group-data-[density=compact]/table:flex-row group-data-[density=compact]/table:items-center group-data-[density=compact]/table:gap-2">
                          <span className="truncate">{d.task}</span>
                          <StatusBadge status={d.status} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Num>{usd(d.value)}</Num>
                      </TableCell>
                      <TableCell className="hidden text-right lg:table-cell">
                        <Num suffix="%">{d.discount}</Num>
                      </TableCell>
                      <TableCell>
                        <time dateTime={d.close}>{d.closeLabel}</time>
                      </TableCell>
                      <TableCell>
                        <Button aria-label={`Review ${d.account}`} onClick={() => setOpen(d)} size="xs" variant="outline">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </SectionCard>

        {/* ------------------------------------------------ approvals in flight */}
        {/* flex-1: the last card in each column fills it, so both columns end on one line. */}
        <SectionCard
          className="flex-1"
          description="Northwind Traders, quote R4. Lanes run in order; Legal starts after Finance approves."
          flush
          footer={
            <Button onClick={() => setOpen(DEALS[0])} size="sm" variant="secondary">
              Open Northwind
            </Button>
          }
          id="approvals"
          title="Approvals in flight"
        >
          <ApprovalChain
            className="flex-1 border-t border-outline-variant"
            layout="lanes"
            steps={LANES.map((l) => ({
              title: l.title,
              approver: l.approver,
              role: l.role,
              status: l.status,
              when: l.when || undefined,
              note: l.status === "Waiting" ? undefined : l.note,
              dependency: l.status === "Waiting" ? l.note : undefined,
              action:
                l.status === "Awaiting decision" ? (
                  <Button onClick={() => toast(`Reminder sent to ${l.approver}`)} size="sm" variant="secondary">
                    Send a reminder
                  </Button>
                ) : undefined,
            }))}
          />
        </SectionCard>
        </div>

        {/* ------------------------------------------------ side column */}
        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard
            description="Work ACE has started on your deals. Nothing is sent or saved until you review it."
            flush
            link={{ label: "Open ACE", href: "/examples/chat" }}
            title="ACE is preparing"
          >
            <List className="border-t border-outline-variant pb-1" density="comfortable" dividers>
              <ListItem
                action={
                  <Button onClick={() => toast("Pricing review started")} size="sm" variant="ai">
                    <PlayIcon />
                    Run pricing review
                  </Button>
                }
                headline="Review pricing and alternatives"
                leading={
                  <IconChip size="sm" tone="ai">
                    <ScaleIcon />
                  </IconChip>
                }
                supporting="Compare the Northwind quote against FY27 policy and two alternatives. Pricing agent, 3 sources."
                wrap
              />
              <ListItem
                action={
                  <>
                    <Button asChild size="sm" variant="secondary">
                      <a href="/examples/chat">Open draft</a>
                    </Button>
                    <ProvisionalBadge kind="ai">Draft by ACE</ProvisionalBadge>
                  </>
                }
                headline="Draft renewal brief"
                leading={
                  <IconChip size="sm" tone="ai">
                    <MessageSquareIcon />
                  </IconChip>
                }
                meta={<Freshness at={BRIEF_AT} verb="Ready" />}
                supporting="Summarise Halvorsen's usage and open issues for the renewal call."
                wrap
              />
            </List>
          </SectionCard>

          <SectionCard description="Open pipeline by deal stage, $M" footer={<Freshness at={PIPELINE_AT} staleAfter={120} verb="Updated" />} title="Pipeline by stage">
            <ChartContainer className="aspect-auto h-44 w-full" config={chartConfig}>
              <BarChart accessibilityLayer data={PIPELINE} margin={{ left: 0, right: 0, top: 20 }}>
                <CartesianGrid stroke="var(--outline-variant)" strokeDasharray="0" vertical={false} />
                <XAxis axisLine={false} dataKey="stage" tickLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} cursor={{ fill: "var(--on-surface)", opacity: 0.04 }} />
                <Bar barSize={28} dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]}>
                  <LabelList className="fill-on-surface-variant" dataKey="value" fontSize={12} formatter={(v: number) => `$${v}M`} position="top" />
                </Bar>
              </BarChart>
            </ChartContainer>
            <table className="sr-only">
              <caption>Open pipeline by stage, millions of dollars</caption>
              <tbody>
                {PIPELINE.map((p) => (
                  <tr key={p.stage}>
                    <th scope="row">{p.stage}</th>
                    <td>{p.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard flush title="Connections">
            <List className="pb-1" density="compact">
              <ListItem headline="Salesforce" leading={<CompanyLogo name="Salesforce" size="sm" />} meta={<Freshness at={SYNCED_AT} verb="Synced" />} />
              <ListItem headline="Slack" leading={<CompanyLogo name="Slack" size="sm" />} meta="#deal-desk" />
              <ListItem
                headline="Contracts"
                leading={<CompanyLogo name="Contracts" size="sm" />}
                trailing={<StatusBadge status="Review required" />}
              />
            </List>
          </SectionCard>

          <SectionCard className="flex-1" id="history" title="Recent activity">
            <Timeline>
              <TimelineItem
                icon={<CheckIcon />}
                meta="Dana Okafor · R2 · Slack"
                time={{ dateTime: "2026-11-05T09:12", label: "9:12" }}
                title="Pellucid seat true-up approved"
                tone="success"
              />
              <TimelineItem
                icon={<SparklesIcon />}
                meta="ACE · Pricing agent"
                time={{ dateTime: "2026-11-05T08:40", label: "8:40" }}
                title="Northwind flagged for discount review"
                tone="primary"
              />
              <TimelineItem
                description="Security addendum needs the updated DPA."
                meta="Legal · R3 · Email"
                time={{ dateTime: "2026-11-04T16:05", label: "Yesterday" }}
                title="Oakline changes requested"
                tone="warning"
              />
            </Timeline>
          </SectionCard>
        </div>
      </DashboardGrid>

      <DealSheet deal={open} onOpenChange={(o) => !o && setOpen(null)} />
    </DashboardLayout>
  );
}

/* ------------------------------------------------------------------ deal drawer */

function DealSheet({ deal, onOpenChange }: { deal: Deal | null; onOpenChange: (o: boolean) => void }) {
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [notify, setNotify] = useState(true);
  const [tab, setTab] = useState("details");
  const d = deal ?? DEALS[0];
  const invalid = tried && note.trim().length === 0;

  const decide = (verb: "Approved" | "Changes requested") => {
    setTried(true);
    if (!note.trim()) {
      // The note lives on the Approvals tab: take the reviewer there and focus it.
      setTab("approvals");
      requestAnimationFrame(() => document.getElementById("note")?.focus());
      return;
    }
    toast(`${verb}: ${d.account}`, { description: notify ? "The owner was notified in Slack." : "No notification sent." });
    setNote("");
    setTried(false);
    setTab("details");
    onOpenChange(false);
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={!!deal}>
      <SheetContent className="w-full gap-0 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <CompanyLogo name={d.account} size="lg" />
            <div className="flex min-w-0 flex-col gap-1">
              <SheetTitle>{d.account}</SheetTitle>
              <SheetDescription>
                {d.type} · {d.owner} · <span className="font-mono text-xs">{d.id}</span>
              </SheetDescription>
            </div>
          </div>
          <StatusBadge className="mt-2" size="md" status={d.status} />
        </SheetHeader>

        <div className="flex flex-col gap-5 p-4">
          <StageProgress aria-label="Deal progress" current={2} orientation="vertical" stages={STAGES} />

          <Tabs onValueChange={setTab} value={tab}>
            <TabsList className="w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger id="approvals" value="approvals">
                Approvals
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent className="flex flex-col gap-4 pt-4" value="details">
              {d.discount > 20 && (
                <Alert variant="warning">
                  <ScaleIcon />
                  <AlertTitle>Above the standard discount limit</AlertTitle>
                  <AlertDescription>
                    {d.discount}% on the platform SKU; the standard limit is 20%. VP Finance approval is required.
                  </AlertDescription>
                </Alert>
              )}
              <DescriptionList>
                <DescriptionItem term="Net value">{usd(d.value)}</DescriptionItem>
                <DescriptionItem term="List value">{usd(Math.round(d.value / (1 - d.discount / 100)))}</DescriptionItem>
                <DescriptionItem term="Effective discount">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    {d.discount}%
                    <CompoundTag label="Desk limit" tone={d.discount > 20 ? "warning" : "neutral"} value="20%" valueLabel="" />
                  </span>
                </DescriptionItem>
                <DescriptionItem term="Term">36 months</DescriptionItem>
                <DescriptionItem term="Payment terms">Net 45, annual in advance</DescriptionItem>
                <DescriptionItem mono term="Quote revision">
                  R4 · {d.id}
                </DescriptionItem>
              </DescriptionList>
              <Accordion collapsible type="single">
                <AccordionItem value="sources">
                  <AccordionTrigger>Supporting records</AccordionTrigger>
                  <AccordionContent>
                    <SourceList>
                      <li>
                        <SourceChip index={1} kind="Salesforce" label="Opportunity" />
                      </li>
                      <li>
                        <SourceChip index={2} kind="Contract" label="MSA 2023" />
                      </li>
                      <li>
                        <SourceChip index={3} kind="Policy" label="FY27 discount v3" />
                      </li>
                    </SourceList>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent className="flex flex-col gap-4 pt-4" value="approvals">
              <ApprovalChain
                steps={[
                  { title: LANES[0].title, approver: LANES[0].approver, role: LANES[0].role, status: "Approved", note: LANES[0].note },
                  { title: LANES[1].title, approver: LANES[1].approver, role: LANES[1].role, sku: "PLT-ENT-36", condition: LANES[1].note, status: "Awaiting decision" },
                  { title: LANES[2].title, approver: LANES[2].approver, role: LANES[2].role, status: "Waiting", dependency: LANES[2].note },
                ]}
              />
              <SectionCard as="h3" title="Record a decision" variant="strip">
                <div className="flex flex-col gap-3">
                  <ContainedField label="Channel" suffix={<ChevronDownIcon aria-hidden className="size-4" />}>
                    {(c) => (
                      <select {...c} className={`${c.className} h-6 cursor-pointer appearance-none`} defaultValue="slack">
                        <option value="slack">Slack · #deal-desk</option>
                        <option value="email">Email</option>
                        <option value="none">Record only</option>
                      </select>
                    )}
                  </ContainedField>
                  <ContainedTextarea
                    description="Shown to the deal owner and kept in the audit trail."
                    error={invalid ? "Add a note so the owner knows why." : undefined}
                    id="note"
                    label="Decision note"
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Why you approved or what needs to change"
                    required
                    value={note}
                  />
                  <label className="flex items-center gap-3 text-sm">
                    <Switch checked={notify} onCheckedChange={setNotify} />
                    Notify the owner
                  </label>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent className="pt-4" value="activity">
              <Timeline>
                <TimelineItem meta="Priya Raman · R4 · Salesforce" time={{ dateTime: "2026-11-05T08:31", label: "8:31" }} title="Quote revision submitted" />
                <TimelineItem icon={<SparklesIcon />} meta="ACE · Pricing agent" time={{ dateTime: "2026-11-05T08:40", label: "8:40" }} title="Discount exception detected" tone="primary" />
                <TimelineItem icon={<CheckIcon />} meta="Avery Chen · Deal desk" time={{ dateTime: "2026-11-05T09:02", label: "9:02" }} title="Deal desk approved" tone="success" />
              </Timeline>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="sticky bottom-0 border-t border-outline-variant bg-surface-container-low">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="sm:mr-auto" variant="ghost">
                Recall request
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recall this approval request?</AlertDialogTitle>
                <AlertDialogDescription>
                  Approvers lose access to the request and the deal returns to Prepare changes. Approvals already given are kept.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep request</AlertDialogCancel>
                <AlertDialogAction className="bg-error text-on-error">Recall request</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => decide("Changes requested")} variant="outline">
            Request changes
          </Button>
          <Button onClick={() => decide("Approved")}>Approve</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
