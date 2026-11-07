import { LarkLink as Link } from "./provider";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- DescriptionList */

export type DescriptionListProps = ComponentProps<"dl"> & {
  /** "inline": term left, value right, ruled rows (record details). "stacked": term above value, in a grid. */
  layout?: "inline" | "stacked";
  columns?: 1 | 2 | 3 | 4;
};

/**
 * Key-value details as a real <dl>. `columns` is a maximum, not a promise: columns size
 * to the container (not the viewport), so the same list works in a full page, a 360px
 * aside and a side peek. Inline items need about 280px each, stacked items 180px.
 */
export function DescriptionList({ layout = "inline", columns = 1, className, style, ...props }: DescriptionListProps) {
  const min = layout === "inline" ? "280px" : "180px";
  const gap = "1.5rem";
  return (
    <dl
      className={cn("group/dl grid min-w-0", layout === "stacked" ? "gap-x-6 gap-y-4" : "gap-x-6", className)}
      data-layout={layout}
      data-slot="description-list"
      style={{
        gridTemplateColumns:
          columns > 1
            ? `repeat(auto-fill, minmax(max(min(100%, ${min}), calc((100% - ${columns - 1} * ${gap}) / ${columns})), 1fr))`
            : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

export type DescriptionItemProps = Omit<ComponentProps<"div">, "children"> & {
  term: ReactNode;
  children: ReactNode;
  /** IDs, emails, SKUs: monospace so I/l/1 are distinct. */
  mono?: boolean;
};

export function DescriptionItem({ term, mono, className, children, ...props }: DescriptionItemProps) {
  return (
    <div
      className={cn(
        "min-w-0",
        "group-data-[layout=stacked]/dl:flex group-data-[layout=stacked]/dl:flex-col group-data-[layout=stacked]/dl:gap-0.5",
        "group-data-[layout=inline]/dl:grid group-data-[layout=inline]/dl:grid-cols-[minmax(7rem,min(40%,14rem))_1fr] group-data-[layout=inline]/dl:items-baseline group-data-[layout=inline]/dl:gap-3 group-data-[layout=inline]/dl:border-b group-data-[layout=inline]/dl:border-outline-variant group-data-[layout=inline]/dl:py-2 group-data-[layout=inline]/dl:last:border-0",
        className
      )}
      {...props}
    >
      <dt className="text-label-md text-on-surface-tertiary">{term}</dt>
      <dd className={cn("min-w-0 text-sm break-words text-on-surface", mono && "font-mono text-[13px]")}>{children}</dd>
    </div>
  );
}

/* ---------------------------------------------------------------- List / ListItem */

export type ListProps = ComponentProps<"ul"> & {
  /** compact 40 · default 48 · comfortable 64 (two-line). */
  density?: "compact" | "default" | "comfortable";
  dividers?: boolean;
  /** Inset items with rounded selection (nav-like lists) instead of edge-to-edge rows. */
  inset?: boolean;
};

export function List({ density = "default", dividers, inset, className, ...props }: ListProps) {
  return (
    <ul
      className={cn(
        "group/list flex min-w-0 flex-col",
        inset && "gap-0.5 p-1",
        dividers && "divide-y divide-outline-variant",
        className
      )}
      data-density={density}
      data-inset={inset || undefined}
      data-slot="list"
      role="list"
      {...props}
    />
  );
}

export type ListItemProps = Omit<ComponentProps<"li">, "onClick"> & {
  leading?: ReactNode;
  headline: ReactNode;
  supporting?: ReactNode;
  /** Small text above or beside the headline: a time, a count. */
  meta?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  href?: string;
  onClick?: () => void;
  /**
   * v0.6: let the headline and supporting text wrap instead of truncating, and align the row to
   * its first line (answers, anything whose full text matters). Default rows stay one line.
   */
  wrap?: boolean;
  /**
   * v0.6: the row's one next step (a Button, a badge beside it), under the supporting text.
   * Static rows only: a row that is itself a link or button can't hold another control, so
   * use `trailing` there.
   */
  action?: ReactNode;
};

/**
 * M3 list item, sized for dense screens. With href it is a link (aria-current when
 * selected); with onClick a button (aria-pressed when selected). Trailing controls sit
 * outside the link so they stay separately focusable.
 */
export function ListItem({
  leading,
  headline,
  supporting,
  meta,
  trailing,
  selected,
  href,
  onClick,
  wrap,
  action,
  className,
  ...props
}: ListItemProps) {
  const content = (
    <>
      {leading && <span className="flex shrink-0 items-center text-on-surface-variant [&_svg]:size-[18px]">{leading}</span>}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className={cn("text-sm font-medium", !wrap && "truncate")}>{headline}</span>
          {meta && <span className="ml-auto shrink-0 text-body-sm text-on-surface-variant tabular-nums">{meta}</span>}
        </span>
        {supporting && (
          <span className={cn("text-body-sm text-on-surface-variant", !wrap && "truncate group-data-[density=comfortable]/list:line-clamp-2 group-data-[density=comfortable]/list:whitespace-normal")}>
            {supporting}
          </span>
        )}
        {action && !href && !onClick && (
          <span className="mt-2 flex flex-wrap items-center gap-2" data-slot="list-action">
            {action}
          </span>
        )}
      </span>
    </>
  );
  const row = cn(
    "flex w-full min-w-0 flex-1 gap-3 px-3 text-left",
    wrap ? "items-start" : "items-center",
    "min-h-12 py-1.5 group-data-[density=compact]/list:min-h-10 group-data-[density=compact]/list:py-1 group-data-[density=comfortable]/list:min-h-16 group-data-[density=comfortable]/list:py-2.5",
    "group-data-[inset]/list:rounded-md"
  );
  const interactive = "state-layer [--state-hover:0.04] focus-ring relative outline-none";
  return (
    <li
      className={cn(
        "relative flex min-w-0 group-data-[inset]/list:rounded-md",
        wrap ? "items-start [&>[data-slot=list-trailing]]:pt-1.5" : "items-center",
        // Links inside a selected row take its text colour too, or they fail contrast on the tan fill.
        selected && "bg-selected-strong text-on-secondary-container [&_.text-on-surface-variant]:text-on-secondary-container [&_a]:text-on-secondary-container",
        className
      )}
      data-selected={selected || undefined}
      {...props}
    >
      {href ? (
        <Link aria-current={selected ? "true" : undefined} className={cn(row, interactive)} href={href}>
          {content}
        </Link>
      ) : onClick ? (
        <button aria-pressed={selected} className={cn(row, interactive)} onClick={onClick} type="button">
          {content}
        </button>
      ) : (
        <div className={row}>{content}</div>
      )}
      {trailing && (
        <span className="flex shrink-0 items-center gap-1 pr-3" data-slot="list-trailing">
          {trailing}
        </span>
      )}
    </li>
  );
}

/* ---------------------------------------------------------------- CountPill */

/** Monospace count. "plain" beside labels (tabs, nav); "pill" when it must stand alone. */
export function CountPill({
  value,
  variant = "plain",
  label,
  className,
}: {
  value: number | string;
  variant?: "plain" | "pill";
  /** Accessible text, e.g. "12 open". Defaults to the number. */
  label?: string;
  className?: string;
}) {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex items-center font-mono text-xs tabular-nums",
        variant === "plain" && "text-on-surface-variant",
        variant === "pill" && "h-4 min-w-4 justify-center rounded-full bg-surface-container px-1 leading-4 tracking-[-0.4px] text-on-surface-variant",
        className
      )}
      data-slot="count-pill"
    >
      {value}
    </span>
  );
}
