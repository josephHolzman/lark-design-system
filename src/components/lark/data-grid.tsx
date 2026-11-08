"use client";

import {
  type ColumnDef,
  type ColumnOrderState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type GroupingState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronRightIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { type CSSProperties, Fragment, type MouseEvent, type ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { StatePanel } from "./feedback";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "right" | "center";
    /** Fixed width in px. Beams uses fixed widths (200–300) and scrolls sideways. */
    width?: number;
    /** Pin to the left while scrolling sideways (the record column). */
    sticky?: boolean;
    /** Extra header content after the label (an AI column's run status). */
    headerExtra?: ReactNode;
    /** A second header line saying what the column measures: "vs 20% limit", "last 8 weeks". */
    description?: ReactNode;
    /** Group header summary for this column, e.g. a sum. */
    aggregate?: (rows: Row<TData>[]) => ReactNode;
    /** Accessible header label when the visual header is an icon or empty. */
    label?: string;
  }
}

export type RowTint = "ai" | "error" | "caution" | "positive" | "selected";
// Opaque mixes, so sticky cells (which inherit the row background) stay solid while scrolling.
/** Dusk containers are deeper, so tints mix in at 28% instead of 45% to keep rows calm. */
const TINT: Record<RowTint, string> = {
  ai: "bg-[color-mix(in_oklch,var(--tertiary-container)_45%,var(--card))] dark:bg-[color-mix(in_oklch,var(--tertiary-container)_28%,var(--card))]",
  error: "bg-[color-mix(in_oklch,var(--error-container)_45%,var(--card))] dark:bg-[color-mix(in_oklch,var(--error-container)_28%,var(--card))]",
  caution: "bg-[color-mix(in_oklch,var(--warning-container)_45%,var(--card))] dark:bg-[color-mix(in_oklch,var(--warning-container)_28%,var(--card))]",
  positive: "bg-[color-mix(in_oklch,var(--success-container)_45%,var(--card))] dark:bg-[color-mix(in_oklch,var(--success-container)_28%,var(--card))]",
  selected: "bg-secondary-container",
};

export type DataGridProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  getRowId: (row: T) => string;
  /** Accessible table name. */
  caption: string;
  density?: "comfortable" | "compact";
  selectable?: boolean;
  /** Row detail under the row (quote lines, history). Adds an expand toggle per row. Off while grouped. */
  renderSubRow?: (row: T) => ReactNode;
  /** Status tint for a row (Beams: AI iris-10, error rust-10, caution ember-10, positive evergreen-10). */
  getRowTint?: (row: T) => RowTint | undefined;
  /** Mouse convenience: click a row to open it. The record cell must also be a link or button. */
  onRowClick?: (row: T) => void;
  /** Group by a column id; group rows show a count and each column's `aggregate`. */
  groupBy?: string;
  loading?: boolean;
  error?: { title?: string; message: ReactNode; onRetry?: () => void; requestId?: string };
  empty?: ReactNode;
  /** Shown in a sticky bar while rows are selected. */
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  pageSize?: number;
  /** v0.8: the rows-per-page choices shown in the pager. Omit to keep a fixed size. */
  pageSizeOptions?: number[];
  /** Max height of the scroll region (the header sticks inside it). Use "100%" inside a flex layout. */
  height?: number | string;
  initialSorting?: SortingState;
  /**
   * Controlled sorting. Pair with `onSortingChange` when a figure or a saved view drives the
   * grid's sort (the grid no longer needs re-keying).
   */
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  /**
   * The row's name for its checkbox and details toggle ("Commercial proposal · Halvorsen").
   * Without it every row's control shares one name (WCAG 2.4.6).
   */
  getRowLabel?: (row: T) => string;
  /** An extra header cell at the end of the header row (an "Add column" button). */
  trailingHeader?: ReactNode;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (v: VisibilityState) => void;
  columnOrder?: ColumnOrderState;
  /** Totals row. */
  footer?: ReactNode;
  className?: string;
};

const CHECK_W = 40;
const EXPAND_W = 36;

/**
 * Lark's data grid (TanStack Table under Beams styling): header 40 / rows 55 (compact 40),
 * ink 8% row rules, no column rules, fixed widths, sticky header and record column,
 * sorting with aria-sort, selection with a bulk bar, expandable rows, grouping with
 * summaries, row tints, pagination ("1 – 25 of 132"), and loading, empty and error states
 * in the body. Real <table> semantics throughout.
 */
/**
 * TanStack Table reads Date.now() for its dev-only memo timing. Under Next's cacheComponents
 * that is an "unstable value" during prerender, so the grid sits behind its own Suspense
 * boundary. In production builds nothing suspends and the table prerenders as usual.
 */
export function DataGrid<T>(props: DataGridProps<T>) {
  return (
    <Suspense fallback={<DataGridFallback caption={props.caption} rows={Math.min(props.pageSize ?? 8, 8)} />}>
      <DataGridInner {...props} />
    </Suspense>
  );
}

function DataGridFallback({ caption, rows }: { caption?: string; rows: number }) {
  return (
    <div aria-busy="true" aria-label={caption ? `Loading ${caption}` : "Loading table"} className="flex flex-col" role="status">
      <div className="h-10 border-b border-outline-variant bg-surface-container-low" />
      {Array.from({ length: rows }, (_, i) => (
        <div className="flex h-[55px] items-center gap-4 border-b border-outline-faint px-4" key={i}>
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/6" />
          <Skeleton className="h-3 w-1/5" />
        </div>
      ))}
    </div>
  );
}

function DataGridInner<T>({
  data,
  columns,
  getRowId,
  caption,
  density = "comfortable",
  selectable,
  renderSubRow: renderSubRowProp,
  getRowTint,
  onRowClick,
  groupBy,
  loading,
  error,
  empty,
  bulkActions,
  pageSize = 25,
  pageSizeOptions,
  height,
  initialSorting = [],
  sorting: sortingProp,
  onSortingChange,
  getRowLabel,
  trailingHeader,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  footer,
  className,
}: DataGridProps<T>) {
  const [sortingState, setSortingState] = useState<SortingState>(initialSorting);
  const sorting = sortingProp ?? sortingState;
  const setSorting = (u: SortingState | ((old: SortingState) => SortingState)) => {
    const next = typeof u === "function" ? u(sorting) : u;
    setSortingState(next);
    onSortingChange?.(next);
  };
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    check();
    return () => ro.disconnect();
  }, []);
  const [expanded, setExpanded] = useState<ExpandedState>(groupBy ? true : {});
  const [visibilityState, setVisibilityState] = useState<VisibilityState>({});
  const grouping: GroupingState = useMemo(() => (groupBy ? [groupBy] : []), [groupBy]);
  // Grouped views expand their groups; row details are off while grouped (one kind of
  // expansion at a time keeps the hierarchy legible).
  const renderSubRow = groupBy ? undefined : renderSubRowProp;
  const [prevGroupBy, setPrevGroupBy] = useState(groupBy);
  if (prevGroupBy !== groupBy) {
    setPrevGroupBy(groupBy);
    setExpanded(groupBy ? true : {});
  }

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting,
      rowSelection,
      expanded,
      grouping,
      columnVisibility: columnVisibility ?? visibilityState,
      ...(columnOrder ? { columnOrder } : {}),
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: (u) => {
      const next = typeof u === "function" ? u(columnVisibility ?? visibilityState) : u;
      setVisibilityState(next);
      onColumnVisibilityChange?.(next);
    },
    enableRowSelection: selectable,
    getRowCanExpand: (r) => !!renderSubRow && !r.getIsGrouped(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: groupBy ? getGroupedRowModel() : undefined,
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: groupBy ? undefined : getPaginationRowModel(),
    initialState: { pagination: { pageSize, pageIndex: 0 } },
    groupedColumnMode: false,
    autoResetExpanded: false,
  });

  const leafCols = table.getVisibleLeafColumns();
  const lead = (selectable ? CHECK_W : 0) + (renderSubRow ? EXPAND_W : 0);
  // Left offsets for sticky columns.
  const stickyLeft: Record<string, number> = {};
  {
    let x = lead;
    for (const c of leafCols) {
      if (c.columnDef.meta?.sticky) {
        stickyLeft[c.id] = x;
        x += c.columnDef.meta?.width ?? 240;
      }
    }
  }
  const lastSticky = [...leafCols].reverse().find((c) => c.columnDef.meta?.sticky)?.id;
  const colCount = leafCols.length + (selectable ? 1 : 0) + (renderSubRow ? 1 : 0) + (trailingHeader ? 1 : 0);
  const rows = table.getRowModel().rows;
  const selected = table.getSelectedRowModel().flatRows.map((r) => r.original);
  const rowH = density === "compact" ? "h-10" : "h-[55px]";

  const cellStyle = (id: string, width?: number): CSSProperties => ({
    width,
    minWidth: width,
    maxWidth: width,
    ...(id in stickyLeft ? { left: stickyLeft[id] } : {}),
  });
  // Body cells inherit the row's tint; header cells keep the card colour (inherit would make them
  // transparent, and scrolled columns would show through).
  const stickyCls = (id: string, header = false) =>
    id in stickyLeft ? cn("sticky z-[1]", header ? "bg-card" : "bg-inherit", id === lastSticky && "shadow-[inset_-1px_0_0_var(--outline-variant)]") : "";
  const leadSticky = (left: number) => ({ left, width: left === 0 && selectable ? CHECK_W : EXPAND_W, minWidth: left === 0 && selectable ? CHECK_W : EXPAND_W });

  const onTrClick = (e: MouseEvent, row: Row<T>) => {
    if (!onRowClick) return;
    if ((e.target as HTMLElement).closest("button, a, input, label, [role=checkbox], [role=menuitem]")) return;
    onRowClick(row.original);
  };

  const total = data.length;
  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
  const from = total === 0 ? 0 : pageIndex * currentPageSize + 1;
  const to = groupBy ? total : Math.min(total, (pageIndex + 1) * currentPageSize);

  return (
    <div className={cn("relative flex min-h-0 min-w-0 flex-col", className)} data-density={density} data-slot="data-grid">
      {/* When the grid scrolls and its rows hold nothing focusable, keyboard users still need to
          scroll it: the region becomes a named tab stop only while it overflows (WCAG 2.1.1). */}
      <div
        aria-label={scrolls ? caption : undefined}
        // scroll-pt keeps a focused row clear of the sticky header (WCAG 2.4.11).
        className={cn("relative min-h-0 flex-1 scroll-pt-10 overflow-auto", scrolls && "focus-ring outline-none")}
        ref={scrollRef}
        role={scrolls ? "region" : undefined}
        style={{ maxHeight: height }}
        tabIndex={scrolls ? 0 : -1}
      >
        <table aria-busy={loading || undefined} className="w-max min-w-full border-separate border-spacing-0 text-sm tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-[2] bg-card">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {selectable && (
                  <th className="sticky z-[1] h-10 border-b border-outline-variant bg-card pl-3" scope="col" style={leadSticky(0)}>
                    <Checkbox
                      aria-label="Select all rows on this page"
                      checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
                      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    />
                  </th>
                )}
                {renderSubRow && (
                  <th className="sticky z-[1] h-10 border-b border-outline-variant bg-card" scope="col" style={leadSticky(selectable ? CHECK_W : 0)}>
                    <span className="sr-only">Expand</span>
                  </th>
                )}
                {hg.headers.map((h) => {
                  const meta = h.column.columnDef.meta;
                  const sort = h.column.getIsSorted();
                  const canSort = h.column.getCanSort();
                  const label = h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext());
                  return (
                    <th
                      aria-sort={canSort ? (sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none") : undefined}
                      className={cn(
                        "h-10 border-b border-outline-variant bg-card px-3 py-1.5 text-left align-bottom text-meta-strong whitespace-nowrap text-on-surface-variant",
                        meta?.align === "right" && "text-right",
                        meta?.align === "center" && "text-center",
                        stickyCls(h.column.id, true)
                      )}
                      key={h.id}
                      scope="col"
                      style={cellStyle(h.column.id, meta?.width)}
                    >
                      <span className={cn("flex flex-col gap-0.5", meta?.align === "right" && "items-end")}>
                      <span className={cn("inline-flex items-center gap-2", meta?.align === "right" && "flex-row-reverse")}>
                        {canSort ? (
                          <button
                            className={cn(
                              "state-layer [--state-hover:0.05] focus-ring -mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 outline-none",
                              meta?.align === "right" && "flex-row-reverse",
                              sort && "text-on-surface"
                            )}
                            onClick={h.column.getToggleSortingHandler()}
                            type="button"
                          >
                            {label}
                            {sort === "asc" ? (
                              <ArrowUpIcon aria-hidden="true" className="size-3.5" />
                            ) : sort === "desc" ? (
                              <ArrowDownIcon aria-hidden="true" className="size-3.5" />
                            ) : (
                              <ChevronsUpDownIcon aria-hidden="true" className="size-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          <span className="inline-flex h-7 items-center">{label ?? <span className="sr-only">{meta?.label}</span>}</span>
                        )}
                        {meta?.headerExtra}
                      </span>
                      {meta?.description && <span className="text-body-md font-normal text-on-surface-tertiary">{meta.description}</span>}
                      </span>
                    </th>
                  );
                })}
                {trailingHeader && (
                  <th className="h-10 border-b border-outline-variant bg-card px-3 py-1.5 text-right align-bottom" scope="col">
                    {trailingHeader}
                  </th>
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 8 }, (_, i) => (
                <tr aria-hidden="true" className={rowH} key={`sk-${i}`}>
                  <td className="border-b border-outline-variant px-3" colSpan={colCount}>
                    <div className="flex items-center gap-6">
                      <Skeleton className="size-6 rounded-md" />
                      <Skeleton className="h-3.5 w-48" />
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="ml-auto h-3.5 w-16" />
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && error && (
              <tr>
                <td colSpan={colCount}>
                  <StatePanel
                    actions={error.onRetry && <Button onClick={error.onRetry} variant="secondary">Try again</Button>}
                    compact
                    description={error.message}
                    details={error.requestId && `Request ${error.requestId}`}
                    kind="error"
                    title={error.title ?? "Couldn't load these rows"}
                  />
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={colCount}>{empty ?? <StatePanel compact kind="no-results" title="No rows match" />}</td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.map((row) => {
                if (row.getIsGrouped()) {
                  const open = row.getIsExpanded();
                  return (
                    <tr className="bg-surface-container-low" key={row.id}>
                      <th className="h-9 border-b border-outline-variant px-3 text-left font-normal" colSpan={colCount} scope="rowgroup">
                        <span className="flex items-center gap-3">
                          <Button aria-expanded={open} aria-label={`${open ? "Collapse" : "Expand"} ${String(row.groupingValue)}`} onClick={row.getToggleExpandedHandler()} size="icon-xs" variant="ghost">
                            <ChevronRightIcon className={cn("transition-transform", open && "rotate-90")} />
                          </Button>
                          <span className="text-label-lg">{String(row.groupingValue)}</span>
                          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-container px-1 tabular-nums leading-none font-medium text-meta text-on-surface-variant">{row.subRows.length}</span>
                          {leafCols
                            .filter((c) => c.columnDef.meta?.aggregate)
                            .map((c) => (
                              <span className="text-meta text-on-surface-variant" key={c.id}>
                                {typeof c.columnDef.header === "string" ? `${c.columnDef.header}: ` : ""}
                                <span className="text-on-surface">{c.columnDef.meta!.aggregate!(row.subRows)}</span>
                              </span>
                            ))}
                        </span>
                      </th>
                    </tr>
                  );
                }
                const tint = row.getIsSelected() ? "selected" : getRowTint?.(row.original);
                return (
                  <Fragment key={row.id}>
                    <tr
                      aria-selected={selectable ? row.getIsSelected() : undefined}
                      className={cn(
                        "group/row bg-card transition-colors",
                        tint ? TINT[tint] : "hover:bg-surface-container-low",
                        onRowClick && "cursor-pointer"
                      )}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                      onClick={(e) => onTrClick(e, row)}
                    >
                      {selectable && (
                        <td className={cn("sticky z-[1] border-b border-outline-variant bg-inherit pl-3", rowH)} style={leadSticky(0)}>
                          <Checkbox
                            aria-label={getRowLabel ? `Select ${getRowLabel(row.original)}` : `Select row ${row.index + 1}`}
                            checked={row.getIsSelected()}
                            onCheckedChange={(v) => row.toggleSelected(!!v)}
                          />
                        </td>
                      )}
                      {renderSubRow && (
                        <td className={cn("sticky z-[1] border-b border-outline-variant bg-inherit", rowH)} style={leadSticky(selectable ? CHECK_W : 0)}>
                          <Button
                            aria-expanded={row.getIsExpanded()}
                            aria-label={`${row.getIsExpanded() ? "Hide" : "Show"} details${getRowLabel ? ` for ${getRowLabel(row.original)}` : ""}`}
                            onClick={row.getToggleExpandedHandler()}
                            size="icon-xs"
                            variant="ghost"
                          >
                            <ChevronRightIcon className={cn("transition-transform", row.getIsExpanded() && "rotate-90")} />
                          </Button>
                        </td>
                      )}
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta;
                        return (
                          <td
                            className={cn(
                              "border-b border-outline-variant px-3 py-1.5 align-middle",
                              rowH,
                              meta?.align === "right" && "text-right",
                              meta?.align === "center" && "text-center",
                              stickyCls(cell.column.id)
                            )}
                            key={cell.id}
                            style={cellStyle(cell.column.id, meta?.width)}
                          >
                            <div className={cn("flex min-w-0 items-center", meta?.align === "right" && "justify-end", meta?.align === "center" && "justify-center")}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        );
                      })}
                      {trailingHeader && <td className={cn("border-b border-outline-variant", rowH)} />}
                    </tr>
                    {row.getIsExpanded() && renderSubRow && (
                      <tr>
                        <td className="border-b border-outline-variant bg-surface-container-low p-0" colSpan={colCount}>
                          <div className="py-3 pr-4" style={{ paddingLeft: lead + 12 }}>
                            {renderSubRow(row.original)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
          </tbody>
          {footer && !loading && !error && rows.length > 0 && <tfoot className="sticky bottom-0 z-[2] bg-surface-container-low font-medium">{footer}</tfoot>}
        </table>
      </div>

      {bulkActions && selected.length > 0 && (
        <div
          aria-label="Bulk actions"
          className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-inverse-surface py-1.5 pr-1.5 pl-3 text-inverse-on-surface shadow-lg"
          data-slot="bulk-bar"
          role="region"
        >
          <span aria-live="polite" className="text-sm whitespace-nowrap">
            {selected.length} selected
          </span>
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-inverse-on-surface/25" />
          <div className="flex items-center gap-1 [&_[data-slot=button]]:text-inverse-on-surface [&_[data-slot=button]_svg]:text-inverse-on-surface">{bulkActions(selected, () => table.resetRowSelection())}</div>
          <Button aria-label="Clear selection" className="text-inverse-on-surface" onClick={() => table.resetRowSelection()} size="icon-sm" variant="ghost">
            <XIcon />
          </Button>
        </div>
      )}

      {!groupBy && (
        <div className="flex h-12 shrink-0 items-center gap-2 border-t border-outline-variant px-3 text-sm text-on-surface-variant" data-slot="data-grid-pager">
          <label className="flex items-center gap-2">
            <span className="sr-only">Page</span>
            <select
              className="focus-ring h-7 rounded-md border border-outline bg-surface-container-lowest pr-6 pl-2 text-sm text-on-surface outline-none"
              disabled={table.getPageCount() <= 1}
              onChange={(e) => table.setPageIndex(Number(e.target.value))}
              value={pageIndex}
            >
              {Array.from({ length: Math.max(1, table.getPageCount()) }, (_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
          <Button aria-label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} size="icon-sm" variant="ghost">
            <ChevronRightIcon className="rotate-180" />
          </Button>
          <Button aria-label="Next page" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} size="icon-sm" variant="ghost">
            <ChevronRightIcon />
          </Button>
          <span aria-live="polite" className="whitespace-nowrap tabular-nums">
            {from} – {to} of {total.toLocaleString("en-US")}
          </span>
          {pageSizeOptions && pageSizeOptions.length > 0 && (
            <label className="ml-auto flex items-center gap-2 whitespace-nowrap">
              <span>Rows per page</span>
              <select
                aria-label="Rows per page"
                className="focus-ring h-7 rounded-md border border-outline bg-surface-container-lowest pr-6 pl-2 text-sm text-on-surface outline-none"
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                value={currentPageSize}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
}

export type { ColumnDef } from "@tanstack/react-table";
