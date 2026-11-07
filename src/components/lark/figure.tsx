import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import { LarkLink as Link } from "./provider";
import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";

import { type ChipTone, IconChip } from "./cards";
import { Freshness, type FreshnessProps } from "./surfaces";

export type FigureDelta = {
  /** Printed as-is, e.g. "+12%" or "−3 deals". */
  value: string;
  direction: "up" | "down" | "flat";
  /** Whether this direction is good news. Sets the tone; the arrow carries direction. */
  good?: boolean;
  /** Comparison period, e.g. "vs last quarter". */
  context?: string;
};

export type FigureProps = Omit<ComponentProps<"div">, "children"> & {
  label: ReactNode;
  value: ReactNode;
  /** Small unit after the value ("days", "%"). */
  unit?: ReactNode;
  delta?: FigureDelta;
  /** One line under the value, 12/18 tertiary ("Continue a draft"). */
  caption?: ReactNode;
  /** Shown in a 32px round tinted tile beside the label. Decorative. */
  icon?: ReactNode;
  /** Tile tint. Default "neutral". */
  tone?: ChipTone;
  /** Makes the whole figure one link (to the filtered list it summarises). */
  href?: string;
  /**
   * The link's name when label or value aren't plain text. Default "<label>: <value> <unit>".
   */
  linkLabel?: string;
  /** Extra visual (sparkline, meter) under the value. */
  children?: ReactNode;
  /** v0.6: when the value was computed ("Updated 2 min ago"); flags it past `staleAfter`. */
  updated?: FreshnessProps;
  /**
   * v0.6.1. "lg" (default): a headline number, display size (40/48) when its content box is 14rem or
   * wider, 30/36 below. Headline values are short ($1.84M); put the exact amount in `caption`. "md": 24/32 for figures inside
   * comparisons, tables and answers' secondary rows.
   */
  size?: "md" | "lg";
};

const DeltaIcon = { up: ArrowUpRightIcon, down: ArrowDownRightIcon, flat: MinusIcon };

function Delta({ value, direction, good, context }: FigureDelta) {
  const Icon = DeltaIcon[direction];
  const tone =
    direction === "flat" || good === undefined
      ? "bg-outline-variant text-on-surface-variant"
      : good
        ? "bg-success-container text-on-success-container"
        : "bg-error-container text-on-error-container";
  return (
    <span className="inline-flex items-center gap-1.5 text-meta">
      <span className={cn("inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-meta-strong tabular-nums", tone)}>
        <Icon aria-hidden="true" className="size-3.5" />
        {value}
      </span>
      {context && <span className="text-on-surface-variant">{context}</span>}
    </span>
  );
}

const text = (n: ReactNode) => (typeof n === "string" || typeof n === "number" ? String(n) : undefined);

/**
 * Metric: label 14 ink, value display-size at regular weight, tabular (size, not weight, makes it
 * the headline), delta as a tinted badge with an
 * arrow and a signed value, so direction never depends on colour. With `href` the whole figure is
 * one link named "<label>: <value>", with an arrow on hover and focus.
 */
export function Figure({ label, value, unit, delta, caption, icon, tone = "neutral", href, linkLabel, updated, size = "lg", className, children, ...props }: FigureProps) {
  const captionId = useId();
  const content = (
    <>
      <div className="flex items-start gap-1.5 text-sm text-on-surface">
        {/* Wraps, never cut: a narrow column must still show the whole label. */}
        <span className="min-w-0">{label}</span>
        {href && <ArrowRightIcon aria-hidden="true" className="mt-0.5 ml-auto size-3.5 shrink-0 opacity-0 transition-opacity group-hover/figure:opacity-100 group-focus-visible/figure:opacity-100" />}
      </div>
      <div className={cn("flex flex-wrap items-baseline gap-x-1.5", size === "lg" && "pt-1")}>
        {/* v0.7: a number never breaks mid-figure; it steps down a size in a narrow column instead. */}
        <span className={cn("min-w-0 whitespace-nowrap tabular-nums", size === "lg" ? "text-title-md @[10rem]/figure:text-title-lg @[14rem]/figure:text-display-sm" : "text-title-sm @[10rem]/figure:text-title-md")} data-slot="figure-value">
          {value}
        </span>
        {unit && <span className={cn("text-on-surface-variant", size === "lg" ? "text-title-sm" : "text-sm")}>{unit}</span>}
      </div>
      {delta && <Delta {...delta} />}
      {caption && (
        <div className="text-meta text-on-surface-tertiary" id={captionId}>
          {caption}
        </div>
      )}
      {children}
      {updated && <Freshness {...updated} />}
    </>
  );
  const body = icon ? (
    <div className="flex min-w-0 items-start gap-3">
      <IconChip size="md" tone={tone}>
        {icon}
      </IconChip>
      <div className="flex min-w-0 flex-1 flex-col gap-1">{content}</div>
    </div>
  ) : (
    content
  );
  const cls = cn("group/figure @container/figure flex min-w-0 flex-col gap-1 bg-card p-4", className);
  if (href) {
    const l = text(label);
    const v = text(value);
    const u = text(unit);
    const name = linkLabel ?? (l && v ? `${l}: ${v}${u ? ` ${u}` : ""}` : undefined);
    return (
      <Link
        aria-describedby={caption ? captionId : undefined}
        aria-label={name}
        className={cn(cls, "state-layer focus-ring relative outline-none")}
        data-slot="figure"
        href={href}
      >
        {body}
      </Link>
    );
  }
  return (
    <div className={cls} data-slot="figure" {...props}>
      {body}
    </div>
  );
}

export type FigureStripProps = ComponentProps<"div"> & { columns?: 2 | 3 | 4 | 5 };

/**
 * Several figures in one card, split by hairlines (the Apollo pattern). The 1px gap over
 * an outline-variant background draws the rules at every breakpoint. v0.6.1: columns follow the
 * strip's own width (a container), not the window's, so the same strip works on a dashboard, in
 * an answer and in a side panel: 1 column under 24rem, 2 from 24rem, then `columns` from 40rem
 * (3), 52rem (4) or 64rem (5).
 */
export function FigureStrip({ columns = 4, className, ...props }: FigureStripProps) {
  return (
    <div className="@container/strip min-w-0" data-slot="figure-strip-frame">
      <div
        className={cn(
          "grid gap-px overflow-hidden rounded-lg border border-edge bg-outline-variant",
          // One size for every value in a strip: display only once each column has room for it.
          "[&_[data-slot=figure-value]]:text-title-lg",
          columns === 2 && "@[32rem]/strip:[&_[data-slot=figure-value]]:text-display-sm",
          columns === 3 && "@[48rem]/strip:[&_[data-slot=figure-value]]:text-display-sm",
          columns === 4 && "@[64rem]/strip:[&_[data-slot=figure-value]]:text-display-sm",
          columns === 5 && "@[80rem]/strip:[&_[data-slot=figure-value]]:text-display-sm",
          "grid-cols-1 @[24rem]/strip:grid-cols-2",
          // In two columns an odd last figure spans both, so no empty grey cell is left over.
          columns === 2 && "@[24rem]/strip:[&>:last-child:nth-child(odd)]:col-span-2",
          columns === 3 && "@[24rem]/strip:@max-[40rem]/strip:[&>:last-child:nth-child(odd)]:col-span-2 @[40rem]/strip:grid-cols-3",
          columns === 4 && "@[24rem]/strip:@max-[52rem]/strip:[&>:last-child:nth-child(odd)]:col-span-2 @[52rem]/strip:grid-cols-4",
          columns === 5 && "@[24rem]/strip:@max-[64rem]/strip:[&>:last-child:nth-child(odd)]:col-span-2 @[64rem]/strip:grid-cols-5",
          className
        )}
        data-slot="figure-strip"
        {...props}
      />
    </div>
  );
}

export type FigureCardProps = FigureProps;

/** A single figure as its own card. */
export function FigureCard({ className, ...props }: FigureCardProps) {
  return <Figure className={cn("rounded-lg border border-edge", className)} {...props} />;
}

/** A tiny inline sparkline (decorative; the figure's value carries the meaning). */
export function Sparkline({ points, className }: { points: number[]; className?: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * 100},${28 - ((p - min) / span) * 24}`)
    .join(" ");
  return (
    <svg aria-hidden="true" className={cn("mt-1 h-8 w-full text-primary", className)} preserveAspectRatio="none" viewBox="0 0 100 30">
      <path d={`${d} L100,30 L0,30 Z`} fill="currentColor" opacity="0.08" />
      <path d={d} fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** A labelled meter (credits, capacity). Uses role="meter" with a text equivalent. */
export function Meter({ value, max = 100, label, className }: { value: number; max?: number; label: string; className?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      aria-valuetext={`${pct}%`}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-outline-strong", className)}
      role="meter"
    >
      <div className="h-full rounded-full bg-on-surface" style={{ width: `${pct}%` }} />
    </div>
  );
}
