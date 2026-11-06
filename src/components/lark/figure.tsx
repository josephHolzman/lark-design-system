import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import { LarkLink as Link } from "./provider";
import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";

import { type ChipTone, IconChip } from "./cards";

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
    <span className="inline-flex items-center gap-1.5 text-body-sm">
      <span className={cn("inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-label-md tabular-nums", tone)}>
        <Icon aria-hidden="true" className="size-3.5" />
        {value}
      </span>
      {context && <span className="text-on-surface-variant">{context}</span>}
    </span>
  );
}

const text = (n: ReactNode) => (typeof n === "string" || typeof n === "number" ? String(n) : undefined);

/**
 * Beams metric: label 14 ink, value 22/28 450 tabular, delta as a tinted badge with an
 * arrow and a signed value, so direction never depends on colour. With `href` the whole figure is
 * one link named "<label>: <value>", with an arrow on hover and focus.
 */
export function Figure({ label, value, unit, delta, caption, icon, tone = "neutral", href, linkLabel, className, children, ...props }: FigureProps) {
  const captionId = useId();
  const content = (
    <>
      <div className="flex items-center gap-1.5 text-sm text-on-surface">
        <span className="truncate">{label}</span>
        {href && <ArrowRightIcon aria-hidden="true" className="ml-auto size-3.5 shrink-0 opacity-0 transition-opacity group-hover/figure:opacity-100 group-focus-visible/figure:opacity-100" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-medium tabular-nums">{value}</span>
        {unit && <span className="text-sm text-on-surface-variant">{unit}</span>}
      </div>
      {delta && <Delta {...delta} />}
      {caption && (
        <div className="text-body-sm text-on-surface-tertiary" id={captionId}>
          {caption}
        </div>
      )}
      {children}
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
  const cls = cn("group/figure flex min-w-0 flex-col gap-1 bg-card p-4", className);
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
 * an outline-variant background draws the rules at every breakpoint.
 */
export function FigureStrip({ columns = 4, className, ...props }: FigureStripProps) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-lg border border-outline-variant bg-outline-variant",
        "grid-cols-1 min-[480px]:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        columns === 5 && "lg:grid-cols-5",
        className
      )}
      data-slot="figure-strip"
      {...props}
    />
  );
}

export type FigureCardProps = FigureProps;

/** A single figure as its own card. */
export function FigureCard({ className, ...props }: FigureCardProps) {
  return <Figure className={cn("rounded-lg border border-outline-variant", className)} {...props} />;
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
