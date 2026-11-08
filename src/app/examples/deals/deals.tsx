"use client";

import {
  ChevronDownIcon,
  Columns3Icon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  PencilIcon,
  PlusIcon,
  ScaleIcon,
  SparklesIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

import { AiColumnStatus, AiRunCell, ConfidenceBadge } from "@/components/lark/ai";
import { EntityCard, SectionCard } from "@/components/lark/cards";
import { ActionsCell, AvatarStack, DateCell, MoneyCell, PercentBarCell, ProgressCell, RecordCell, SparklineCell, TagsCell } from "@/components/lark/cells";
import { type ColumnDef, DataGrid } from "@/components/lark/data-grid";
import { Banner, StatePanel } from "@/components/lark/feedback";
import { FilterSearch, Segmented } from "@/components/lark/filters";
import { CompanyLogo } from "@/components/lark/identity";
import { RecordPeek, ListLayout } from "@/components/lark/layouts";
import { DescriptionItem, DescriptionList } from "@/components/lark/lists";
import { ColumnsPanel, CountSegments, FacetFilterMenu, FacetList, SavedViewMenu, SplitButton } from "@/components/lark/menus";
import { PageHeader, PageTabs } from "@/components/lark/page-header";
import { StageProgress } from "@/components/lark/progress";
import { StatusBadge } from "@/components/lark/status-badge";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { DEALS, type Deal, TYPE_TAG, usd } from "../_shared/deals-data";

const COLUMN_OPTIONS = [
  { id: "account", label: "Deal", locked: true },
  { id: "type", label: "Type" },
  { id: "status", label: "Status" },
  { id: "value", label: "Net value" },
  { id: "discount", label: "Platform discount" },
  { id: "trend", label: "Value trend" },
  { id: "approvals", label: "Approvals" },
  { id: "risk", label: "ACE risk check" },
  { id: "owner", label: "Owner" },
  { id: "team", label: "Deal team" },
  { id: "close", label: "Close date" },
  { id: "actions", label: "Actions", locked: true },
];

function RailSection({ title, count, children, defaultOpen = true }: { title: string; count?: number; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <CollapsiblePrimitive.Root className="border-b border-outline-variant" defaultOpen={defaultOpen}>
      <CollapsiblePrimitive.Trigger className="group state-layer [--state-hover:0.03] focus-ring flex h-[52px] w-full items-center gap-2 px-4 text-left text-label-lg outline-none">
        <span className="flex-1">{title}</span>
        {count ? <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-container px-1 tabular-nums leading-none font-medium text-meta text-on-secondary-container">{count}</span> : null}
        <ChevronDownIcon aria-hidden="true" className="size-4 text-on-surface-variant transition-transform group-data-[state=closed]:-rotate-90" />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="px-2 pb-3">{children}</CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

export function DealsList() {
  const router = useRouter();
  const [view, setView] = useState("all");
  const [scope, setScope] = useState("all");
  const [statusFacet, setStatusFacet] = useState("all");
  const [owners, setOwners] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [groupBy, setGroupBy] = useState("");
  const [preview, setPreview] = useState("data");
  const [railOpen, setRailOpen] = useState(true);
  const [visible, setVisible] = useState(COLUMN_OPTIONS.map((c) => c.id).filter((id) => id !== "owner"));
  const [order, setOrder] = useState(COLUMN_OPTIONS.map((c) => c.id));
  const [risk, setRisk] = useState<Record<string, Deal["risk"]>>(() => Object.fromEntries(DEALS.map((d) => [d.id, d.risk])));
  const [peek, setPeek] = useState<Deal | null>(null);
  const [syncBanner, setSyncBanner] = useState(true);

  const run = (ids: string[]) => {
    setRisk((r) => ({ ...r, ...Object.fromEntries(ids.map((id) => [id, { state: "running" as const }])) }));
    window.setTimeout(() => {
      setRisk((r) => ({ ...r, ...Object.fromEntries(ids.map((id, k) => [id, k % 3 === 2 ? { state: "done" as const, value: "Renewal at risk", confidence: "medium" as const } : { state: "done" as const, value: "Low risk", confidence: "high" as const }])) }));
    }, 1400);
  };

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return DEALS.filter(
      (d) =>
        (!s || `${d.account} ${d.id} ${d.owner}`.toLowerCase().includes(s)) &&
        (scope === "all" || (scope === "mine" ? d.owner === "Avery Chen" : d.discount > 20 || risk[d.id].state === "failed")) &&
        (statusFacet === "all" || d.status === statusFacet) &&
        (!owners.length || owners.includes(d.owner)) &&
        (!types.length || types.includes(d.type))
    ).map((d) => ({ ...d, risk: risk[d.id] }));
  }, [q, scope, statusFacet, owners, types, risk]);

  const riskDone = Object.values(risk).filter((r) => r.state === "done").length;
  const riskFailed = Object.values(risk).filter((r) => r.state === "failed").length;
  const riskRunning = Object.values(risk).some((r) => r.state === "running");

  const columns = useMemo<ColumnDef<Deal, unknown>[]>(
    () => [
      {
        id: "account",
        accessorKey: "account",
        header: "Deal",
        meta: { width: 260, sticky: true },
        cell: ({ row }) => (
          <RecordCell
            leading={<CompanyLogo name={row.original.account} size={density === "compact" ? "xs" : "sm"} />}
            meta={density === "comfortable" ? `${row.original.id} · ${row.original.owner}` : undefined}
            name={row.original.account}
            onOpen={() => setPeek(row.original)}
          />
        ),
      },
      {
        id: "type",
        accessorKey: "type",
        header: "Type",
        meta: { width: 170 },
        cell: ({ row }) => <TagsCell tags={[{ label: row.original.type, variant: TYPE_TAG[row.original.type] }]} />,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        meta: { width: 190 },
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "value",
        accessorKey: "value",
        header: "Net value",
        meta: { width: 140, align: "right", description: "latest revision", aggregate: (rs) => usd(rs.reduce((n, r) => n + r.original.value, 0)) },
        cell: ({ row }) => <MoneyCell sub={density === "comfortable" ? `Revision ${row.original.revision}` : undefined} value={row.original.value} />,
      },
      {
        id: "discount",
        accessorKey: "discount",
        header: "Platform discount",
        meta: { width: 180, description: "tick = 20% limit" },
        cell: ({ row }) => <PercentBarCell label="Platform discount against the 20% limit" limit={20} max={40} value={row.original.discount} />,
      },
      {
        id: "trend",
        header: "Value trend",
        enableSorting: false,
        meta: { width: 140, description: "last 8 weeks" },
        cell: ({ row }) => {
          const t = row.original.trend;
          const pct = Math.round(((t[t.length - 1] - t[0]) / t[0]) * 100);
          return <SparklineCell change={`${pct >= 0 ? "+" : "−"}${Math.abs(pct)}%`} points={t} summary={`${pct >= 0 ? "Up" : "Down"} ${Math.abs(pct)}% over 8 weeks`} />;
        },
      },
      {
        id: "approvals",
        accessorFn: (d) => d.approvals[0] / d.approvals[1],
        header: "Approvals",
        meta: { width: 130, description: "given of needed" },
        cell: ({ row }) => <ProgressCell done={row.original.approvals[0]} label="approvals given" total={row.original.approvals[1]} />,
      },
      {
        id: "risk",
        header: "ACE risk check",
        enableSorting: false,
        meta: {
          width: 260,
          description: "AI, with sources",
          headerExtra: <AiColumnStatus done={riskDone} failed={riskFailed} onToggle={() => run(DEALS.filter((d) => risk[d.id].state === "idle").map((d) => d.id))} running={riskRunning} total={DEALS.length} />,
        },
        cell: ({ row }) => {
          const r = row.original.risk;
          return (
            <AiRunCell
              confidence={r.confidence}
              error={r.error}
              evidence={r.state === "done" ? [{ label: "Opportunity", kind: "Salesforce" }, { label: "FY27 discount v3", kind: "Policy", quote: "Platform discounts above 20% need VP Finance." }] : undefined}
              onRun={() => run([row.original.id])}
              state={r.state}
              value={r.value}
            />
          );
        },
      },
      { id: "owner", accessorKey: "owner", header: "Owner", meta: { width: 150 }, cell: ({ row }) => <span className="truncate">{row.original.owner}</span> },
      { id: "team", header: "Deal team", enableSorting: false, meta: { width: 120 }, cell: ({ row }) => <AvatarStack names={row.original.team} /> },
      { id: "close", accessorKey: "close", header: "Close", meta: { width: 110, description: "expected" }, cell: ({ row }) => <DateCell iso={row.original.close} label={row.original.closeLabel} /> },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { width: 150, align: "right", label: "Actions" },
        cell: ({ row }) => (
          <ActionsCell
            label={`Actions for ${row.original.account}`}
            primary={
              <Button onClick={() => setPeek(row.original)} size="xs" variant="secondary">
                Review
              </Button>
            }
            sections={[
              { items: [{ label: "Open deal", icon: <FileTextIcon /> }, { label: "Reassign", icon: <UserRoundIcon /> }, { label: "Ask ACE about this deal", icon: <SparklesIcon /> }] },
              { items: [{ label: "Edit quote", icon: <PencilIcon />, disabledReason: "Approved quotes are locked. Create a revision instead." }] },
              { items: [{ label: "Archive", icon: <Trash2Icon />, destructive: true }] },
            ]}
          />
        ),
      },
    ],
    [density, risk, riskDone, riskFailed, riskRunning]
  );

  const columnVisibility = Object.fromEntries(COLUMN_OPTIONS.map((c) => [c.id, visible.includes(c.id)]));
  const statusCounts = DEALS.reduce<Record<string, number>>((a, d) => ({ ...a, [d.status]: (a[d.status] ?? 0) + 1 }), {});

  return (
    <>
      <ListLayout
        banners={
          <>
            {syncBanner && (
              <Banner action={<a href="#">Reconnect Salesforce</a>} layout="strip" onDismiss={() => setSyncBanner(false)} tone="caution">
                Salesforce sync paused 2 hours ago. Values may be out of date.
              </Banner>
            )}
            <Banner layout="inset" tone="permission">
              You can see deals for the Deal Desk team only. Ask an admin to change your access.
            </Banner>
          </>
        }
        header={
          <PageHeader
            actions={
              <>
                <Button variant="secondary">
                  <DownloadIcon /> Export
                </Button>
                <SplitButton icon={<PlusIcon />} sections={[{ items: [{ label: "Quote revision", icon: <FileTextIcon /> }, { label: "Pricing exception", icon: <ScaleIcon /> }, { label: "Ask ACE to draft", icon: <SparklesIcon /> }] }]}>
                  New deal
                </SplitButton>
              </>
            }
            tabs={
              <PageTabs
                className="border-b-0"
                label="Deal views"
                tabs={[
                  { label: "All deal work", href: "/examples/deals", current: true, count: DEALS.length },
                  { label: "Quotes", href: "#", count: 12 },
                  { label: "Approvals", href: "#", count: 5 },
                  { label: "Renewals", href: "#", count: 4 },
                ]}
              />
            }
            title="All deals"
          />
        }
        rail={
          railOpen && (
            <div className="flex flex-col">
              <div className="border-b border-outline-variant p-3">
                <CountSegments
                  items={[
                    { value: "all", label: "Total", count: String(DEALS.length) },
                    { value: "mine", label: "Mine", count: String(DEALS.filter((d) => d.owner === "Avery Chen").length) },
                    { value: "risk", label: "At risk", count: String(DEALS.filter((d) => d.discount > 20).length + riskFailed) },
                  ]}
                  label="Scope"
                  onChange={setScope}
                  value={scope}
                />
              </div>
              <RailSection title="Status">
                <FacetList
                  facets={[{ value: "all", label: "Any status", count: DEALS.length }, ...Object.entries(statusCounts).map(([k, v]) => ({ value: k, label: k, count: v }))]}
                  label="Status"
                  onChange={setStatusFacet}
                  value={statusFacet}
                />
              </RailSection>
              <RailSection count={types.length} defaultOpen={false} title="Deal type">
                <div className="flex flex-wrap gap-1 px-2">
                  {Object.keys(TYPE_TAG).map((t) => (
                    <button
                      aria-pressed={types.includes(t)}
                      className="state-layer focus-ring h-6 rounded-full border border-outline-strong px-2 text-label-lg outline-none aria-pressed:border-selected-border aria-pressed:bg-secondary-container aria-pressed:text-on-secondary-container"
                      key={t}
                      onClick={() => setTypes((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </RailSection>
              <div className="flex justify-between gap-2 p-3">
                <Button
                  onClick={() => {
                    setScope("all");
                    setStatusFacet("all");
                    setTypes([]);
                    setOwners([]);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )
        }
        toolbar={
          <>
            <SavedViewMenu
              onChange={setView}
              onCreate={() => toast("View saved", { description: "“My renewals” is now in Created by me." })}
              value={view}
              views={[
                { id: "all", name: "Default view", count: "24" },
                { id: "renew", name: "Renewals this quarter", count: "4" },
                { id: "risk", name: "Over discount limit", count: "3" },
                { id: "team", name: "Deal desk queue", owner: "team", count: "8" },
              ]}
            />
            <Button aria-pressed={railOpen} onClick={() => setRailOpen(!railOpen)} variant="ghost">
              <FilterIcon /> {railOpen ? "Hide filters" : "Show filters"}
            </Button>
            <FilterSearch className="sm:w-56" label="Search deals" onValueChange={setQ} placeholder="Search deals" value={q} />
            <FacetFilterMenu
              facets={["Priya Raman", "Marcus Bell", "Avery Chen", "Dana Okafor"].map((o) => ({ value: o, label: o, count: DEALS.filter((d) => d.owner === o).length }))}
              label="Owner"
              onChange={setOwners}
              value={owners}
            />
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                Group by
                <NativeSelect onChange={(e) => setGroupBy(e.target.value)} size="sm" value={groupBy}>
                  <NativeSelectOption value="">None</NativeSelectOption>
                  <NativeSelectOption value="status">Status</NativeSelectOption>
                  <NativeSelectOption value="type">Type</NativeSelectOption>
                  <NativeSelectOption value="owner">Owner</NativeSelectOption>
                </NativeSelect>
              </label>
              <Segmented
                aria-label="Row density"
                onValueChange={(v) => setDensity(v as typeof density)}
                options={[
                  { value: "comfortable", label: "Comfortable" },
                  { value: "compact", label: "Compact" },
                ]}
                value={density}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost">
                    <Columns3Icon /> Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-2">
                  <ColumnsPanel columns={COLUMN_OPTIONS} onOrderChange={setOrder} onVisibleChange={setVisible} order={order} visible={visible} />
                </PopoverContent>
              </Popover>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-1.5 text-body-md text-on-surface-variant md:px-6">
          <span>Preview state</span>
          <Segmented
            aria-label="Preview state"
            onValueChange={setPreview}
            options={[
              { value: "data", label: "Data" },
              { value: "loading", label: "Loading" },
              { value: "empty", label: "Empty" },
              { value: "error", label: "Error" },
            ]}
            size="sm"
            value={preview}
          />
        </div>
        <DataGrid
          bulkActions={(sel, clear) => (
            <>
              <Button onClick={() => toast(`Reassigned ${sel.length} deals`, { action: { label: "Undo", onClick: () => toast("Reassignment undone") } })} size="sm" variant="ghost">
                <UserRoundIcon /> Reassign
              </Button>
              <Button
                onClick={() => {
                  run(sel.map((d) => d.id));
                  clear();
                }}
                size="sm"
                variant="ghost"
              >
                <SparklesIcon /> Run risk check
              </Button>
              <Button size="sm" variant="ghost">
                <DownloadIcon /> Export
              </Button>
            </>
          )}
          caption="All deals"
          className="min-h-0 flex-1"
          columnOrder={order}
          columns={columns}
          columnVisibility={columnVisibility}
          data={preview === "empty" ? [] : rows}
          density={density}
          empty={
            preview === "empty" ? (
              <StatePanel
                actions={<Button>New deal</Button>}
                compact
                description="Deals appear here when a quote is created in Salesforce or someone asks ACE to start one."
                kind="first-run"
                title="No deals yet"
              />
            ) : (
              <StatePanel
                actions={
                  <Button
                    onClick={() => {
                      setQ("");
                      setScope("all");
                      setStatusFacet("all");
                      setOwners([]);
                      setTypes([]);
                    }}
                    variant="secondary"
                  >
                    Clear filters
                  </Button>
                }
                compact
                description="Try a broader search or clear the filters."
                kind="no-results"
                title="No deals match these filters"
              />
            )
          }
          error={preview === "error" ? { message: "The deals service didn't respond. Your filters are kept.", onRetry: () => setPreview("data"), requestId: "req_7f3a91c2" } : undefined}
          footer={
            <tr>
              <td className="h-10 border-t border-outline-variant px-4 text-sm" colSpan={99}>
                {/* Sticky so the total stays in view when the grid scrolls sideways. */}
                <span className="sticky left-4">
                  {rows.length} deals, net value <span className="font-medium tabular-nums">{usd(rows.reduce((n, d) => n + d.value, 0))}</span>
                </span>
              </td>
            </tr>
          }
          getRowId={(d) => d.id}
          getRowLabel={(d) => `${d.type} · ${d.account}`}
          getRowTint={(d) => (d.risk.state === "running" ? "ai" : d.discount > 20 ? "caution" : undefined)}
          groupBy={groupBy || undefined}
          height="100%"
          initialSorting={[{ id: "close", desc: false }]}
          key={groupBy}
          loading={preview === "loading"}
          onRowClick={setPeek}
          pageSize={12}
          renderSubRow={(d) => (
            <table className="w-full max-w-[720px] text-sm">
              <caption className="sr-only">Quote lines for {d.account}</caption>
              <thead className="text-meta-strong text-on-surface-variant">
                <tr>
                  <th className="py-1 text-left font-normal" scope="col">SKU</th>
                  <th className="py-1 text-left font-normal" scope="col">Line</th>
                  <th className="py-1 text-right font-normal" scope="col">List</th>
                  <th className="py-1 text-right font-normal" scope="col">Discount</th>
                  <th className="py-1 text-right font-normal" scope="col">Net</th>
                </tr>
              </thead>
              <tbody>
                {d.lines.map((l) => (
                  <tr className="border-t border-outline-variant" key={l.sku}>
                    <td className="py-1.5 font-mono text-meta">{l.sku}</td>
                    <td className="py-1.5">{l.name}</td>
                    <td className="py-1.5 text-right tabular-nums">{usd(l.list)}</td>
                    <td className="py-1.5 text-right tabular-nums">{l.discount}%</td>
                    <td className="py-1.5 text-right tabular-nums">{usd(Math.round(l.list * (1 - l.discount / 100)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          selectable
        />
      </ListLayout>

      <RecordPeek
        actions={
          <>
            <Button size="sm" variant="secondary">
              Request changes
            </Button>
            <Button size="sm">Approve</Button>
          </>
        }
        aside={
          <SectionCard as="h3" title="ACE risk check">
            {peek && peek.risk.state === "done" ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm">{peek.risk.value}</p>
                {peek.risk.confidence && <ConfidenceBadge level={peek.risk.confidence} />}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Not run yet.</p>
            )}
          </SectionCard>
        }
        description={peek ? `${peek.type} · ${peek.owner} · ${peek.id}` : undefined}
        leading={peek && <CompanyLogo name={peek.account} size="lg" />}
        onExpand={() => router.push("/examples/record")}
        onOpenChange={(o) => !o && setPeek(null)}
        open={!!peek}
        title={peek?.account}
      >
        {peek && (
          <>
            <SectionCard as="h3" title="Progress">
              <StageProgress aria-label="Deal progress" current={2} stages={[{ label: "Understand" }, { label: "Prepare" }, { label: "Approve" }, { label: "Confirm" }]} />
            </SectionCard>
            <SectionCard as="h3" collapsible title="Deal summary">
              <DescriptionList columns={2}>
                <DescriptionItem term="Net value">{usd(peek.value)}</DescriptionItem>
                <DescriptionItem term="Discount">{peek.discount}%</DescriptionItem>
                <DescriptionItem term="Status">
                  <StatusBadge status={peek.status} />
                </DescriptionItem>
                <DescriptionItem term="Close">{peek.closeLabel}</DescriptionItem>
                <DescriptionItem mono term="Quote">
                  R{peek.revision} · {peek.id}
                </DescriptionItem>
                <DescriptionItem term="Owner">{peek.owner}</DescriptionItem>
              </DescriptionList>
            </SectionCard>
            <SectionCard as="h3" title="Account">
              <EntityCard
                facts={[
                  { label: "Industry", value: "Logistics" },
                  { label: "Employees", value: "1,200" },
                  { label: "Customer since", value: "2021" },
                ]}
                leading={<CompanyLogo name={peek.account} size="md" />}
                meta="Enterprise · Seattle, WA"
                name={peek.account}
              />
            </SectionCard>
          </>
        )}
      </RecordPeek>
    </>
  );
}
