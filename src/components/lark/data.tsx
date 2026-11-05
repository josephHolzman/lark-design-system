"use client";

import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon, ExternalLinkIcon, FileTextIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- SortableHead */

export type SortDirection = "asc" | "desc" | false;

/**
 * Column header that sorts. aria-sort lives on the <th>; the button inside carries the
 * click and focus. The icon shows the current direction, or both arrows when unsorted.
 */
export function SortableHead({
  sorted,
  onSort,
  align = "left",
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof TableHead>, "onClick"> & {
  sorted: SortDirection;
  onSort: () => void;
  align?: "left" | "right";
}) {
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ChevronsUpDownIcon;
  return (
    <TableHead
      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
      className={cn(align === "right" && "text-right", className)}
      {...props}
    >
      <button
        className={cn(
          "state-layer focus-ring -mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 outline-none",
          align === "right" && "flex-row-reverse",
          sorted && "text-on-surface"
        )}
        onClick={onSort}
        type="button"
      >
        {children}
        <Icon aria-hidden="true" className={cn("size-3.5", !sorted && "opacity-60")} />
      </button>
    </TableHead>
  );
}

/* ---------------------------------------------------------------- TablePager */

export type TablePagerProps = {
  from: number;
  to: number;
  total: number;
  noun?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
  children?: ReactNode;
};

/** "1–8 of 132 deals" with previous / next icon buttons. Sits in a SectionCard footer. */
export function TablePager({ from, to, total, noun = "rows", onPrevious, onNext, className, children }: TablePagerProps) {
  return (
    <div className={cn("flex w-full items-center gap-2 text-body-sm text-on-surface-variant", className)}>
      {children}
      <span className="ml-auto tabular-nums">
        {total === 0 ? `0 ${noun}` : `${from}–${to} of ${total} ${noun}`}
      </span>
      <Button aria-label="Previous page" disabled={from <= 1} onClick={onPrevious} size="icon-xs" variant="ghost">
        <ChevronLeftIcon />
      </Button>
      <Button aria-label="Next page" disabled={to >= total} onClick={onNext} size="icon-xs" variant="ghost">
        <ChevronRightIcon />
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------- Money / Num */

/** Tabular, right-aligned-friendly number with optional muted suffix. */
export function Num({ children, suffix, className }: { children: ReactNode; suffix?: ReactNode; className?: string }) {
  return (
    <span className={cn("tabular-nums", className)}>
      {children}
      {suffix && <span className="text-on-surface-variant">{suffix}</span>}
    </span>
  );
}

/* ---------------------------------------------------------------- SourceChip */

export type SourceChipProps = {
  label: string;
  /** Citation number, shown in mono before the label. */
  index?: number;
  /** System the record came from: "Salesforce", "Contract", "Slack"… */
  kind?: string;
  href?: string;
  icon?: ReactNode;
  className?: string;
};

/**
 * Evidence chip, 24px. It is Deepgrids' trust mechanism, so it is always the same shape:
 * index, icon, label; a link when the record can be opened.
 */
export function SourceChip({ label, index, kind, href, icon, className }: SourceChipProps) {
  const inner = (
    <>
      {index != null && <span className="font-mono text-[11px] text-on-surface-variant">{index}</span>}
      <span aria-hidden="true" className="text-on-surface-variant [&_svg]:size-3.5">
        {icon ?? <FileTextIcon />}
      </span>
      <span className="truncate">{label}</span>
      {kind && <span className="text-on-surface-variant">· {kind}</span>}
      {href && <ExternalLinkIcon aria-hidden="true" className="size-3 text-on-surface-variant" />}
    </>
  );
  const cls = cn(
    "inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-md bg-surface-container-high px-2 text-xs text-on-surface",
    className
  );
  return href ? (
    <a className={cn(cls, "state-layer focus-ring relative outline-none")} href={href} rel="noreferrer" target="_blank">
      {inner}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

export function SourceList({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex min-w-0 flex-wrap gap-1.5", className)} role="list" {...props} />;
}
