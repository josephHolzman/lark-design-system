"use client";

/*
 * Lark CPQ: configure, price, quote, approve, order. The components Deepgrids' deal desk lives in.
 * Principles (from the ACE state library):
 *  - Every number says where it came from: a SourceLine with the service's logo, record and freshness.
 *  - Money is tabular, right-aligned, in the deal's currency, never rounded silently.
 *  - Policy limits are drawn, not just stated: a limit marker on every discount.
 *  - Proposed changes (from ACE or a teammate) show old → new until someone accepts them.
 *  - Approvals show the route: who, why they're needed, in what order, through which channel.
 *  - Order execution compares what was accepted with what was received before anything is created.
 *  - Motion is cinematic but optional: figures count up, bars grow, zones rise in; all still under reduced motion.
 */

import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BanIcon,
  CheckCircle2Icon,
  CheckIcon,
  CircleDashedIcon,
  ClockIcon,
  LoaderCircleIcon,
  LockIcon,
  MinusIcon,
  OctagonAlertIcon,
  PlaneIcon,
  RotateCcwIcon,
  SparklesIcon,
  XCircleIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { cn } from "@/lib/utils";

import { BestFor } from "./cards";
import { PersonAvatar, ServiceLogo } from "./identity";
import { StageProgress } from "./progress";
import { ProvisionalBadge, provisionalEdge } from "./surfaces";

/* ================================================================ formatting */

export type MoneyFormat = { currency?: string; locale?: string; compact?: boolean; fractionDigits?: number };

/**
 * Money in the deal's currency with a real minus sign. Whole units by default; unit prices under
 * 100 that aren't whole (usage pricing, $0.12 per MAU) keep up to 4 decimals instead of rounding to $0.
 */
export function formatMoney(n: number, { currency = "USD", locale = "en-US", compact, fractionDigits }: MoneyFormat = {}) {
  const digits = fractionDigits ?? (!Number.isInteger(n) && Math.abs(n) < 100 ? 4 : 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : digits,
    minimumFractionDigits: compact ? 0 : Math.min(digits, 2),
    signDisplay: "auto",
  })
    .format(n)
    .replace("-", "−");
}

const pct = (n: number, digits = 1) => `${Number(n.toFixed(digits))}%`;

/* ================================================================ sources */

/**
 * Where a number or record came from: logo, service, record, freshness. Put one under every
 * figure, table and answer that shows data from another system.
 */
export function SourceLine({
  service,
  record,
  meta,
  stale,
  className,
}: {
  service: string;
  record?: ReactNode;
  /** "synced 2 min ago", "version 4 of 4" */
  meta?: ReactNode;
  /** Out of date: shown in caution with a clock, so it's not colour alone. */
  stale?: boolean;
  className?: string;
}) {
  return (
    <p data-meta="source" className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-meta text-on-surface-variant", className)} data-slot="source-line">
      <ServiceLogo service={service} size={14} />
      <span className="text-on-surface">{service}</span>
      {record && <span>{record}</span>}
      {meta && (
        <span className={cn("inline-flex items-center gap-1", stale && "text-on-warning-container")}>
          {stale && <ClockIcon aria-hidden className="size-3.5" />}
          {meta}
        </span>
      )}
    </p>
  );
}

/* ================================================================ motion: count up */

function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(m.matches);
    set();
    m.addEventListener("change", set);
    return () => m.removeEventListener("change", set);
  }, []);
  return reduced;
}

/**
 * A number that counts up to its value once, when it first renders (ACE's figures). Screen
 * readers and reduced-motion users get the final value immediately.
 */
export function CountUp({ value, format, duration = 900, className }: { value: number; format: (n: number) => string; duration?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const started = useRef(false);
  useEffect(() => {
    if (reduced || started.current) return;
    started.current = true;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, value, duration]);
  return (
    <span className={cn("tabular-nums", className)}>
      <span aria-hidden>{format(reduced ? value : shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}

/* ================================================================ figures */

export type DealFigure = {
  label: string;
  value: number;
  format: "money" | "percent" | "number";
  /** "+$12,400 vs R3", with whether that's good. */
  delta?: { text: string; good?: boolean };
  /** A verdict in words: "Above the 20% limit". */
  status?: { text: string; tone: "positive" | "caution" | "critical" | "neutral" };
  source?: { service: string; record?: string; meta?: string };
};

/**
 * The deal in three or four numbers (TCV, ARR, effective discount, margin), Swiss-style: large,
 * light, flush left, small sentence-case labels, a source under each. Figures count up once.
 */
export function DealFigures({ items, money, className }: { items: DealFigure[]; money?: MoneyFormat; className?: string }) {
  const fmt = (f: DealFigure) => (n: number) =>
    f.format === "money" ? formatMoney(n, money) : f.format === "percent" ? pct(n) : Math.round(n).toLocaleString(money?.locale ?? "en-US");
  return (
    <dl className={cn("lark-stagger grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4", className)} data-slot="deal-figures">
      {items.map((f) => (
        <div className="flex min-w-0 flex-col gap-1" key={f.label}>
          <dt className="text-label-lg text-on-surface-variant">{f.label}</dt>
          <dd className="flex flex-col gap-1">
            <span className="text-[1.875rem] leading-9 font-light tracking-[-0.02em] text-on-surface">
              <CountUp format={fmt(f)} value={f.value} />
            </span>
            {f.status && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-meta",
                  f.status.tone === "critical" ? "text-error" : f.status.tone === "caution" ? "text-on-warning-container" : f.status.tone === "positive" ? "text-success" : "text-on-surface-variant"
                )}
              >
                {f.status.tone === "critical" ? <OctagonAlertIcon aria-hidden className="size-3.5" /> : f.status.tone === "caution" ? <AlertTriangleIcon aria-hidden className="size-3.5" /> : f.status.tone === "positive" ? <CheckIcon aria-hidden className="size-3.5" /> : null}
                {f.status.text}
              </span>
            )}
            {f.delta && <span className={cn("text-meta whitespace-nowrap", f.delta.good === undefined ? "text-on-surface-variant" : f.delta.good ? "text-success" : "text-error")}>{f.delta.text}</span>}
            {f.source && <SourceLine meta={f.source.meta} record={f.source.record} service={f.source.service} />}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ================================================================ stages */

export type CpqStage = "configure" | "price" | "approve" | "order" | "done";

/**
 * Configure → Price → Approve → Order, with what is happening in each. `labels` lets a record
 * keep its own step names (a deal record's "Understand request", "Prepare changes"…).
 */
export function CpqStages({
  current,
  details,
  labels,
  className,
}: {
  current: CpqStage;
  details?: Partial<Record<Exclude<CpqStage, "done">, string>>;
  labels?: Partial<Record<Exclude<CpqStage, "done">, string>>;
  className?: string;
}) {
  const order: Exclude<CpqStage, "done">[] = ["configure", "price", "approve", "order"];
  const label = { configure: "Configure", price: "Price and quote", approve: "Approve", order: "Order" };
  return (
    <StageProgress
      aria-label="Deal progress"
      className={className}
      current={current === "done" ? 4 : order.indexOf(current)}
      stages={order.map((s) => ({ label: labels?.[s] ?? label[s], description: details?.[s] }))}
    />
  );
}

/* ================================================================ quote lines */

export type QuoteLineStatus = "ok" | "above-limit" | "validating" | "error" | "locked";

export type QuoteLine = {
  id: string;
  product: string;
  sku?: string;
  /** "Platform", "Services": lines group under it. */
  family?: string;
  quantity: number;
  unit?: string;
  /** Per unit, per year for recurring lines. */
  listPrice: number;
  /** Percent. */
  discount: number;
  charge?: "recurring" | "one-time";
  start?: string;
  /** A change someone proposed and nobody has accepted yet. */
  proposed?: { quantity?: number; discount?: number; start?: string; by: string; reason?: string };
  status?: QuoteLineStatus;
  /** Validating: what is being checked. Error: what's wrong. Locked: why (protected price). */
  note?: string;
};

const netOf = (l: Pick<QuoteLine, "quantity" | "listPrice" | "discount">) => l.quantity * l.listPrice * (1 - l.discount / 100);

const LINE_STATUS: Record<QuoteLineStatus, { word: string; icon: typeof CheckIcon; cls: string; spin?: boolean }> = {
  ok: { word: "Within policy", icon: CheckIcon, cls: "text-on-surface-variant" },
  "above-limit": { word: "Above limit", icon: AlertTriangleIcon, cls: "text-on-warning-container" },
  validating: { word: "Checking", icon: LoaderCircleIcon, cls: "text-tertiary", spin: true },
  error: { word: "Can't price", icon: XCircleIcon, cls: "text-error" },
  locked: { word: "Protected price", icon: LockIcon, cls: "text-on-surface-variant" },
};

/** Discount with the policy limit drawn on a track: the value, a bar, and a tick at the limit. */
export function DiscountMeter({ value, limit, max = 40, className }: { value: number; limit?: number; max?: number; className?: string }) {
  const over = limit !== undefined && value > limit;
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <span aria-hidden className="relative h-1.5 w-14 shrink-0 rounded-full bg-surface-container-highest">
        <span className={cn("lark-bar-grow absolute inset-y-0 left-0 rounded-full", over ? "bg-warning" : "bg-on-surface")} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
        {limit !== undefined && <span className="absolute -inset-y-1 w-0.5 rounded-full bg-on-surface" style={{ left: `${(limit / max) * 100}%` }} />}
      </span>
      <span className={cn("tabular-nums", over && "font-semibold text-on-warning-container")}>{pct(value)}</span>
      {over && <span className="sr-only">, above the {limit}% limit</span>}
    </span>
  );
}

/**
 * The quote's lines. Built to be read in one pass:
 *  - each column says its unit in the header (per year, limit), numbers are right-aligned and close together;
 *  - every cell shows what the quote is now, and a proposal (ACE's or a teammate's) sits directly
 *    under it in iris, labelled "Proposed", never mixed into the current value;
 *  - status is one word with an icon, the reason on the line below;
 *  - totals are a summary under the table (list, discounts, net per year, one-time, and the
 *    effect of pending proposals), not squeezed into table columns.
 * Phones get one card per line. Editable discounts and quantities use NumberInput.
 */
export function QuoteLines({
  lines,
  caption = "Quote lines",
  discountLimit,
  editable,
  onChange,
  money,
  className,
}: {
  lines: QuoteLine[];
  caption?: string;
  discountLimit?: number;
  editable?: boolean;
  onChange?: (id: string, patch: Partial<Pick<QuoteLine, "quantity" | "discount">>) => void;
  money?: MoneyFormat;
  className?: string;
}) {
  const m = (n: number) => formatMoney(n, money);
  const isOneTime = (l: QuoteLine) => l.charge === "one-time";
  const proposedOf = (l: QuoteLine) => (l.proposed ? { ...l, quantity: l.proposed.quantity ?? l.quantity, discount: l.proposed.discount ?? l.discount } : l);
  const sum = (ls: QuoteLine[], f: (l: QuoteLine) => number) => ls.reduce((acc, l) => acc + f(l), 0);
  const recurring = lines.filter((l) => !isOneTime(l));
  const oneTime = lines.filter(isOneTime);
  const listTotal = sum(lines, (l) => l.quantity * l.listPrice);
  const netTotal = sum(lines, netOf);
  const netRecurring = sum(recurring, netOf);
  const netOneTime = sum(oneTime, netOf);
  const proposedRecurring = sum(recurring, (l) => netOf(proposedOf(l)));
  const hasProposals = lines.some((l) => l.proposed);
  const discountTotal = listTotal - netTotal;
  const effective = listTotal ? (discountTotal / listTotal) * 100 : 0;
  const families = [...new Set(lines.map((l) => l.family ?? ""))];
  const statusOf = (l: QuoteLine) => LINE_STATUS[l.status ?? (discountLimit !== undefined && l.discount > discountLimit ? "above-limit" : "ok")];

  const th = "px-3 py-2 text-left align-bottom text-meta-strong font-normal text-on-surface-variant";
  const sub = "block text-meta text-on-surface-tertiary";
  const td = "border-t border-outline-faint px-3 py-3 align-top";
  const proposedLine = "mt-1 flex items-center justify-end gap-1 text-meta font-semibold text-on-tertiary-container";

  const summary = (
    <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 text-sm sm:min-w-72" data-slot="quote-totals">
      <dt className="text-on-surface-variant">List price</dt>
      <dd className="text-right tabular-nums">{m(listTotal)}</dd>
      <dt className="text-on-surface-variant">Discounts</dt>
      <dd className="text-right tabular-nums">
        {m(-discountTotal)} <span className="text-on-surface-variant">({pct(effective)})</span>
      </dd>
      <div aria-hidden className="col-span-2 my-0.5 border-t border-outline-variant" />
      <dt className="font-semibold text-on-surface">Net per year</dt>
      <dd className="text-right font-semibold tabular-nums">{m(netRecurring)}</dd>
      {oneTime.length > 0 && (
        <>
          <dt className="text-on-surface-variant">One-time</dt>
          <dd className="text-right tabular-nums">{m(netOneTime)}</dd>
        </>
      )}
      {hasProposals && (
        <>
          <dt className="inline-flex items-center gap-1 text-on-tertiary-container">
            <SparklesIcon aria-hidden className="size-3.5" /> With proposed changes
          </dt>
          <dd className="text-right font-semibold tabular-nums text-on-tertiary-container">
            {m(proposedRecurring)} <span className="font-normal">per year ({proposedRecurring - netRecurring >= 0 ? "+" : ""}{m(proposedRecurring - netRecurring)})</span>
          </dd>
        </>
      )}
    </dl>
  );

  return (
    <>
      {/* Phones: one card per line (ACE "Small-screen task surface"); the table needs the width. */}
      <div aria-label={caption} className={cn("flex flex-col gap-2 md:hidden", className)} data-slot="quote-lines-compact" role="group">
        {lines.map((l) => {
          const st = statusOf(l);
          const p = l.proposed;
          return (
            <article
              aria-label={l.product}
              className={cn("flex flex-col gap-2 rounded-lg border border-edge bg-card p-3 text-sm", p && "border-ai-border bg-[color-mix(in_oklch,var(--tertiary-container)_35%,var(--card))]")}
              key={l.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="text-on-surface">{l.product}</span>
                  <span className="text-meta text-on-surface-variant">{[l.sku, isOneTime(l) ? "One-time" : "Per year"].filter(Boolean).join(", ")}</span>
                </div>
                <span className="flex flex-col items-end text-right">
                  <span className="font-semibold tabular-nums">{m(netOf(l))}</span>
                  {p && <span className="text-meta font-semibold text-on-tertiary-container tabular-nums">Proposed {m(netOf(proposedOf(l)))}</span>}
                </span>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-md">
                <dt className="text-on-surface-variant">Quantity</dt>
                <dd className="tabular-nums">
                  {l.quantity.toLocaleString()}
                  {l.unit ? ` ${l.unit}` : ""} at {m(l.listPrice)}
                  {l.unit ? ` per ${l.unit}` : ""}
                </dd>
                <dt className="text-on-surface-variant">Discount</dt>
                <dd className="flex flex-col gap-0.5">
                  <DiscountMeter limit={discountLimit} value={l.discount} />
                  {p?.discount !== undefined && <span className="font-semibold text-on-tertiary-container">Proposed {pct(p.discount)}</span>}
                </dd>
              </dl>
              <p className={cn("inline-flex items-start gap-1.5 text-body-md", st.cls)}>
                <st.icon aria-hidden className={cn("mt-0.5 size-3.5 shrink-0", st.spin && "animate-spin motion-reduce:animate-none")} />
                <span>
                  {st.word}
                  {l.note ? `: ${l.note}` : ""}
                </span>
              </p>
              {p && (
                <p className="inline-flex items-start gap-1.5 text-body-md text-on-tertiary-container">
                  <SparklesIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  Proposed by {p.by}
                  {p.reason ? `: ${p.reason}` : ""}
                </p>
              )}
            </article>
          );
        })}
        <div className="rounded-lg bg-inset px-3 py-2.5">{summary}</div>
      </div>

      <div className={cn("flex flex-col max-md:hidden", className)} data-slot="quote-lines">
        <div aria-label={caption} className="overflow-x-auto" role="region" tabIndex={0}>
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
            <caption className="sr-only">{caption}</caption>
            <colgroup>
              <col />
              <col className="w-24" />
              <col className="w-32" />
              <col className="w-40" />
              <col className="w-36" />
            </colgroup>
            <thead className="bg-surface-container-low">
              <tr>
                <th className={cn(th, "sticky left-0 z-[1] min-w-56 bg-surface-container-low")} scope="col">
                  Product
                </th>
                <th className={cn(th, "text-right")} scope="col">
                  Quantity
                </th>
                <th className={cn(th, "text-right")} scope="col">
                  List price
                  <span className={sub}>per unit, per year</span>
                </th>
                <th className={th} scope="col">
                  Discount
                  {discountLimit !== undefined && <span className={sub}>limit {discountLimit}%</span>}
                </th>
                <th className={cn(th, "text-right")} scope="col">
                  Net
                  <span className={sub}>per year</span>
                </th>
              </tr>
            </thead>
            {families.map((fam) => (
              <tbody key={fam || "_"}>
                {fam && (
                  <tr>
                    <th className="sticky left-0 border-t border-outline-variant bg-card px-3 pt-4 pb-1.5 text-left text-label-lg font-semibold text-on-surface" colSpan={5} scope="rowgroup">
                      {fam}
                    </th>
                  </tr>
                )}
                {lines
                  .filter((l) => (l.family ?? "") === fam)
                  .map((l) => {
                    const st = statusOf(l);
                    const p = l.proposed;
                    const pl = proposedOf(l);
                    const tint = p ? "bg-[color-mix(in_oklch,var(--tertiary-container)_30%,var(--card))]" : l.status === "error" ? "bg-[color-mix(in_oklch,var(--error-container)_30%,var(--card))]" : "bg-card";
                    return (
                      <tr className={tint} data-status={l.status} key={l.id}>
                        <th className={cn(td, "sticky left-0 z-[1] text-left font-normal", tint, p && "shadow-[inset_3px_0_0_var(--tertiary)]")} scope="row">
                          <span className="flex flex-col gap-0.5">
                            <span className="text-on-surface">{l.product}</span>
                            <span className="text-meta text-on-surface-variant">
                              {[l.sku, isOneTime(l) ? "one-time" : null, l.start ? `starts ${l.start}` : null].filter(Boolean).join(", ")}
                            </span>
                            {/* Status lives with the product: one column fewer, and the reason reads with the line it's about. */}
                            <span className={cn("mt-1 inline-flex items-start gap-1.5 text-body-md", st.cls)}>
                              <st.icon aria-hidden className={cn("mt-0.5 size-3.5 shrink-0", st.spin && "animate-spin motion-reduce:animate-none")} />
                              <span>
                                <span className="font-medium">{st.word}</span>
                                {l.note && <span className="text-on-surface-variant">: {l.note}</span>}
                              </span>
                            </span>
                            {p && (
                              <span className="inline-flex items-start gap-1.5 text-body-md text-on-tertiary-container">
                                <SparklesIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                                <span>
                                  <span className="font-medium">{p.by} proposes a change</span>
                                  {p.reason ? `: ${p.reason}` : ""}
                                </span>
                              </span>
                            )}
                          </span>
                        </th>
                        <td className={cn(td, "text-right tabular-nums")}>
                          {editable && l.status !== "locked" ? (
                            <NumberInput aria-label={`Quantity, ${l.product}`} className="ml-auto w-24" min={0} onValueChange={(v) => onChange?.(l.id, { quantity: v ?? 0 })} size="sm" steppers={false} value={l.quantity} />
                          ) : (
                            <>
                              {l.quantity.toLocaleString()}
                              {l.unit && <span className="block text-meta text-on-surface-variant">{l.unit}</span>}
                              {p?.quantity !== undefined && <span className={proposedLine}>Proposed {p.quantity.toLocaleString()}</span>}
                            </>
                          )}
                        </td>
                        <td className={cn(td, "text-right tabular-nums")}>
                          {m(l.listPrice)}
                          {l.unit && <span className="block text-meta text-on-surface-variant">per {l.unit}</span>}
                        </td>
                        <td className={td}>
                          {editable && l.status !== "locked" ? (
                            <NumberInput aria-label={`Discount, ${l.product}`} className="w-28" max={100} min={0} onValueChange={(v) => onChange?.(l.id, { discount: v ?? 0 })} size="sm" steppers={false} suffix="%" value={l.discount} />
                          ) : (
                            <>
                              <DiscountMeter limit={discountLimit} value={l.discount} />
                              {p?.discount !== undefined && <span className={cn(proposedLine, "justify-start")}>Proposed {pct(p.discount)}</span>}
                            </>
                          )}
                        </td>
                        <td className={cn(td, "text-right tabular-nums")}>
                          <span className={cn(p && "text-on-surface-variant")}>{m(netOf(l))}</span>
                          {isOneTime(l) && <span className="block text-meta text-on-surface-variant">one-time</span>}
                          {p && <span className={proposedLine}>Proposed {m(netOf(pl))}</span>}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            ))}
          </table>
        </div>
        <div className="flex justify-end border-t border-outline-variant bg-surface-container-low px-4 py-3">{summary}</div>
      </div>
    </>
  );
}

/** old → new, with "was"/"now" for screen readers. */
function Change({ from, to }: { from: ReactNode; to: ReactNode }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1 tabular-nums">
      <del className="text-on-surface-tertiary decoration-1">
        <span className="sr-only">was </span>
        {from}
      </del>
      <ArrowRightIcon aria-hidden className="size-3 text-on-surface-tertiary" />
      <ins className="font-semibold text-on-tertiary-container no-underline">
        <span className="sr-only">now </span>
        {to}
      </ins>
    </span>
  );
}

/* ================================================================ price waterfall */

export type WaterfallStep = { label: string; value: number; detail?: string; source?: string; kind?: "discount" | "credit" | "uplift" | "fee" };

/**
 * List price to net, one adjustment per row (Amendment financial bridge, Discount allocation).
 * Each row states its amount in text; the bars are a picture of the same numbers. Bars grow in.
 */
export function PriceWaterfall({
  start,
  steps,
  endLabel = "Net",
  money,
  className,
}: {
  start: { label: string; value: number };
  steps: WaterfallStep[];
  endLabel?: string;
  money?: MoneyFormat;
  className?: string;
}) {
  const m = (n: number) => formatMoney(n, money);
  const end = steps.reduce((s, x) => s + x.value, start.value);
  // Each step starts where the previous one ended (computed up front, no mutation during render).
  const ends = steps.reduce<number[]>((acc, s) => [...acc, (acc.at(-1) ?? start.value) + s.value], []);
  const rows = [
    { label: start.label, from: 0, to: start.value, value: start.value, total: true as const },
    ...steps.map((s, i) => {
      const from = i === 0 ? start.value : ends[i - 1];
      return { ...s, from: Math.min(from, ends[i]), to: Math.max(from, ends[i]), total: false as const };
    }),
    { label: endLabel, from: 0, to: end, value: end, total: true as const },
  ];
  const max = Math.max(start.value, end, ...ends);
  return (
    <ol aria-label={`${start.label} to ${endLabel}`} className={cn("lark-stagger flex flex-col", className)} data-slot="price-waterfall">
      {rows.map((r, i) => (
        <li className="grid grid-cols-[minmax(8rem,14rem)_1fr_auto] items-center gap-3 border-b border-outline-faint py-2 last:border-0" key={i}>
          <span className="flex min-w-0 flex-col">
            <span className={cn("text-sm", r.total ? "font-semibold text-on-surface" : "text-on-surface")}>{r.label}</span>
            {"detail" in r && r.detail && <span className="text-body-md text-on-surface-variant">{r.detail}</span>}
            {"source" in r && r.source && (
              <span className="mt-0.5 inline-flex items-center gap-1 text-meta text-on-surface-variant">
                <ServiceLogo service={r.source} size={12} />
                {r.source}
              </span>
            )}
          </span>
          <span aria-hidden className="relative h-5 min-w-24">
            <span
              className={cn(
                "lark-bar-grow absolute inset-y-0 rounded-[3px]",
                r.total ? "bg-on-surface" : r.value < 0 ? "bg-warning/80" : "bg-success/80"
              )}
              style={{ left: `${(r.from / max) * 100}%`, width: `${Math.max(0.5, ((r.to - r.from) / max) * 100)}%`, animationDelay: `${i * 80}ms` }}
            />
          </span>
          <span className={cn("text-right text-sm tabular-nums", r.total ? "font-semibold" : r.value < 0 ? "text-on-warning-container" : "text-success")}>
            {r.total ? m(r.value) : `${r.value > 0 ? "+" : ""}${m(r.value)}`}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ================================================================ policy checks */

export type PolicyCheck = {
  id: string;
  rule: string;
  status: "pass" | "exceeds" | "needs-approval" | "unknown" | "blocked";
  detail?: ReactNode;
  approver?: string;
  source?: { service: string; record?: string };
  /** The record's own status words ("Ready for review", "Waiting"), when they differ. */
  statusLabel?: string;
};

const POLICY: Record<PolicyCheck["status"], { word: string; icon: typeof CheckIcon; cls: string }> = {
  pass: { word: "Within policy", icon: CheckCircle2Icon, cls: "text-success" },
  exceeds: { word: "Exceeds limit", icon: AlertTriangleIcon, cls: "text-on-warning-container" },
  "needs-approval": { word: "Needs approval", icon: ClockIcon, cls: "text-on-warning-container" },
  unknown: { word: "Can't check yet", icon: CircleDashedIcon, cls: "text-on-surface-variant" },
  blocked: { word: "Not allowed", icon: OctagonAlertIcon, cls: "text-error" },
};

/** Each pricing rule applied to the quote, the result in words, who must approve, and the rule's source. */
export function PolicyChecks({ checks, className }: { checks: PolicyCheck[]; className?: string }) {
  const counts = checks.reduce<Record<string, number>>((a, c) => ({ ...a, [c.status]: (a[c.status] ?? 0) + 1 }), {});
  return (
    <section aria-label="Policy checks" className={cn("flex flex-col gap-2", className)} data-slot="policy-checks">
      <p className="text-body-md text-on-surface-variant">
        {checks.length} rules checked: {counts.pass ?? 0} within policy
        {counts["needs-approval"] ? `, ${counts["needs-approval"]} need approval` : ""}
        {counts.exceeds ? `, ${counts.exceeds} over a limit` : ""}
        {counts.blocked ? `, ${counts.blocked} not allowed` : ""}
        {counts.unknown ? `, ${counts.unknown} can't be checked yet` : ""}.
      </p>
      <ul className="lark-stagger flex flex-col divide-y divide-outline-faint rounded-lg border border-edge bg-card">
        {checks.map((c) => {
          const p = POLICY[c.status];
          return (
            <li className="flex flex-wrap items-start gap-x-3 gap-y-1 px-3.5 py-3" key={c.id}>
              <p.icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", p.cls)} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm text-on-surface">{c.rule}</p>
                {c.detail && <p className="text-body-md text-on-surface-variant">{c.detail}</p>}
                {c.source && <SourceLine record={c.source.record} service={c.source.service} />}
              </div>
              <div className="flex flex-col items-end gap-0.5 text-right">
                <span className={cn("text-body-md", p.cls)}>{c.statusLabel ?? p.word}</span>
                {c.approver && <span className="text-body-md text-on-surface-variant">{c.approver}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================ approval route */

export type ApproverState = "approved" | "conditional" | "pending" | "waiting" | "returned" | "declined" | "skipped" | "away";

export type Approver = {
  name: string;
  role: string;
  state: ApproverState;
  /** Why they're on the route: "Discount above 20%". */
  reason?: string;
  /** Where they decide: Slack, Outlook, Teams, ACE. */
  channel?: string;
  /** "Oct 31", "waiting 6 h". */
  when?: string;
  /** Conditions, the reason for return or decline, or who is covering. */
  note?: string;
  /** The record's own status words, when they differ from Lark's defaults ("Ready for review"). */
  stateLabel?: string;
};

const APPROVER: Record<ApproverState, { word: string; icon: typeof CheckIcon; cls: string; ring: string }> = {
  approved: { word: "Approved", icon: CheckCircle2Icon, cls: "text-success", ring: "border-success/50" },
  conditional: { word: "Approved with conditions", icon: CheckCircle2Icon, cls: "text-success", ring: "border-success/50" },
  pending: { word: "Deciding", icon: ClockIcon, cls: "text-primary", ring: "border-primary/60 bg-primary-container/30" },
  waiting: { word: "Not started", icon: CircleDashedIcon, cls: "text-on-surface-variant", ring: "border-outline-variant" },
  returned: { word: "Returned for context", icon: RotateCcwIcon, cls: "text-on-warning-container", ring: "border-warning" },
  declined: { word: "Declined", icon: XCircleIcon, cls: "text-error", ring: "border-error/70" },
  skipped: { word: "Not needed", icon: MinusIcon, cls: "text-on-surface-tertiary", ring: "border-outline-faint" },
  away: { word: "Out of office", icon: PlaneIcon, cls: "text-on-warning-container", ring: "border-warning" },
};

export type ApprovalStep = { id: string; label: string; mode?: "sequential" | "parallel"; approvers: Approver[] };

/**
 * The approval route (Named route with reason, Parallel and sequential review). Steps run left
 * to right; approvers inside a parallel step decide at the same time. Each approver card says
 * why they're needed, where they decide (logo) and their state in words. Only the affected
 * decisions reopen when a quote changes, so each card carries its own state.
 */
export function ApprovalRoute({ steps, className }: { steps: ApprovalStep[]; className?: string }) {
  return (
    // Steps sit side by side once the route's own box has room (36rem), not the window's: in a
    // 360px aside they stack, so approver names aren't cut.
    <div className="@container/route min-w-0">
      <ol aria-label="Approval route" className={cn("lark-stagger grid gap-3 @xl/route:auto-cols-fr @xl/route:grid-flow-col", className)} data-slot="approval-route">
        {steps.map((s, i) => (
          <li className="flex min-w-0 flex-col gap-2" key={s.id}>
            <p className="flex items-center gap-2 text-label-lg text-on-surface-variant">
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-surface-container-high text-meta leading-none font-medium tabular-nums text-on-surface">{i + 1}</span>
              <span>
                {s.label}
                {s.mode === "parallel" && s.approvers.length > 1 && <span className="text-on-surface-tertiary">, at the same time</span>}
              </span>
            </p>
            <ul className="flex flex-col gap-2">
              {s.approvers.map((a) => {
                const st = APPROVER[a.state];
                return (
                  <li className={cn("flex flex-col gap-1.5 rounded-lg border bg-card p-3", st.ring)} key={a.name}>
                    <div className="flex items-start gap-2.5">
                      <PersonAvatar name={a.name} size="md" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm text-on-surface">{a.name}</span>
                        <span className="truncate text-meta text-on-surface-variant">{a.role}</span>
                      </div>
                      {a.channel && (
                        <span className="inline-flex items-center gap-1 text-meta text-on-surface-variant">
                          <ServiceLogo service={a.channel} size={14} />
                          <span className="sr-only">Decides in </span>
                          {a.channel}
                        </span>
                      )}
                    </div>
                    <p className={cn("inline-flex items-center gap-1.5 text-body-md", st.cls)}>
                      <st.icon aria-hidden className="size-3.5" />
                      <span>
                        {a.stateLabel ?? st.word}
                        {a.when && <span className="text-on-surface-variant">, {a.when}</span>}
                      </span>
                    </p>
                    {a.reason && <p className="text-body-md text-on-surface-variant">Needed because: {a.reason}</p>}
                    {a.note && <p className="rounded-md bg-inset px-2 py-1.5 text-body-md text-on-surface">{a.note}</p>}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ================================================================ scenarios */

export type Scenario = {
  id: string;
  title: string;
  summary?: string;
  recommended?: boolean;
  metrics: { label: string; value: string; delta?: string; better?: boolean }[];
  /** "VP Finance", "None", "Legal and Finance". */
  approvals: string;
  /** Within policy, or why not. */
  policy: { ok: boolean; text: string };
  /** v0.6: what this option suits ("Best for" checklist). */
  bestFor?: string[];
  /** v0.6: a preview that isn't saved as a quote yet: dashed edge and "Not saved". */
  provisional?: boolean;
};

/**
 * Options side by side (Option comparison, Equal totals different cash). From md up it is one
 * table, so every metric sits on the same line across options and people read across; on phones
 * each option is a card. Deltas are against the current quote and say whether they're better.
 */
export function ScenarioCompare({ scenarios, current = "Compared with quote R4", onChoose, chosen, className }: { scenarios: Scenario[]; current?: string; onChoose?: (id: string) => void; chosen?: string; className?: string }) {
  const labels = scenarios[0]?.metrics.map((m) => m.label) ?? [];
  const colTone = (s: Scenario) => (chosen === s.id ? "bg-secondary-container" : s.recommended ? "bg-primary-container/30" : undefined);
  const Delta = ({ mt }: { mt?: Scenario["metrics"][number] }) =>
    mt?.delta ? <span className={cn("block text-meta", mt.better === undefined ? "text-on-surface-variant" : mt.better ? "text-success" : "text-error")}>{mt.delta}</span> : null;
  const Policy = ({ s }: { s: Scenario }) => (
    <span className={cn("inline-flex items-start gap-1.5 text-body-md", s.policy.ok ? "text-success" : "text-on-warning-container")}>
      {s.policy.ok ? <CheckIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" /> : <AlertTriangleIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />}
      {s.policy.text}
    </span>
  );
  const Choose = ({ s }: { s: Scenario }) =>
    onChoose ? (
      <Button aria-pressed={chosen === s.id} onClick={() => onChoose(s.id)} size="sm" variant={chosen === s.id ? "default" : "secondary"}>
        {chosen === s.id ? "Chosen" : "Use this option"}
        <span className="sr-only">: {s.title}</span>
      </Button>
    ) : null;
  return (
    <section aria-label="Pricing options" className={cn("@container flex flex-col gap-3", className)} data-slot="scenario-compare">
      <p className="text-body-md text-on-surface-variant">{current}</p>

      {/* Wide containers (42rem+): one table, rows aligned across options. Decided by the
          container, not the viewport, so it also works in a side column or a peek. */}
      <div className="overflow-x-auto rounded-lg border border-edge @max-2xl:hidden">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Pricing options. {current}</caption>
          <colgroup>
            <col className="w-40" />
            {scenarios.map((s) => (
              <col key={s.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td className="border-b border-outline-variant" />
              {scenarios.map((s) => (
                <th className={cn("border-b border-l border-outline-variant px-4 pt-3.5 pb-3 text-left align-top font-normal", colTone(s))} key={s.id} scope="col">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-label-lg font-semibold text-on-surface">{s.title}</span>
                    {s.recommended && <Badge variant="info">Recommended</Badge>}
                    {s.provisional && <ProvisionalBadge kind="unsaved" />}
                  </span>
                  {s.summary && <span className="mt-1 block text-body-md text-on-surface-variant">{s.summary}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label) => (
              <tr key={label}>
                <th className="border-b border-outline-faint px-4 py-2.5 text-left align-top font-normal text-on-surface-variant" scope="row">
                  {label}
                </th>
                {scenarios.map((s) => {
                  const mt = s.metrics.find((x) => x.label === label);
                  return (
                    <td className={cn("border-b border-l border-outline-faint px-4 py-2.5 text-right align-top tabular-nums", colTone(s))} key={s.id}>
                      {mt?.value ?? "—"}
                      <Delta mt={mt} />
                    </td>
                  );
                })}
              </tr>
            ))}
            {scenarios.some((s) => s.bestFor?.length) && (
              <tr>
                <th className="border-b border-outline-faint px-4 py-2.5 text-left align-top font-normal text-on-surface-variant" scope="row">
                  Best for
                </th>
                {scenarios.map((s) => (
                  <td className={cn("border-b border-l border-outline-faint px-4 py-2.5 align-top", colTone(s))} key={s.id}>
                    {s.bestFor?.length ? <BestFor className="mt-0 border-t-0 pt-0 [&>span]:sr-only" items={s.bestFor} /> : "—"}
                  </td>
                ))}
              </tr>
            )}
            <tr>
              <th className="border-b border-outline-faint px-4 py-2.5 text-left align-top font-normal text-on-surface-variant" scope="row">
                Approvals
              </th>
              {scenarios.map((s) => (
                <td className={cn("border-b border-l border-outline-faint px-4 py-2.5 text-right align-top", colTone(s))} key={s.id}>
                  {s.approvals}
                </td>
              ))}
            </tr>
            <tr>
              <th className="px-4 py-2.5 text-left align-top font-normal text-on-surface-variant" scope="row">
                Policy
              </th>
              {scenarios.map((s) => (
                <td className={cn("border-l border-outline-faint px-4 py-2.5 align-top", colTone(s))} key={s.id}>
                  <Policy s={s} />
                </td>
              ))}
            </tr>
          </tbody>
          {onChoose && (
            <tfoot>
              <tr>
                <td className="border-t border-outline-variant" />
                {scenarios.map((s) => (
                  <td className={cn("border-t border-l border-outline-variant px-4 py-3", colTone(s))} key={s.id}>
                    <Choose s={s} />
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Narrow containers: a card per option */}
      <div aria-label="Pricing options" className="grid gap-3 @md:grid-cols-2 @2xl:hidden" role="group">
        {scenarios.map((s) => (
          <article aria-label={s.title} className={cn("flex flex-col gap-3 rounded-lg border p-3.5", chosen === s.id ? "border-selected-border bg-secondary-container" : s.recommended ? "border-primary/60 bg-card" : "border-outline-variant bg-card", s.provisional && chosen !== s.id && provisionalEdge)} key={s.id}>
            <header className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-label-lg font-semibold">{s.title}</p>
                {s.recommended && <Badge variant="info">Recommended</Badge>}
                {s.provisional && <ProvisionalBadge kind="unsaved" />}
              </div>
              {s.summary && <p className="text-body-md text-on-surface-variant">{s.summary}</p>}
              {s.bestFor && s.bestFor.length > 0 && <BestFor items={s.bestFor} />}
            </header>
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-sm">
              {s.metrics.map((mt) => (
                <div className="contents" key={mt.label}>
                  <dt className="text-on-surface-variant">{mt.label}</dt>
                  <dd className="text-right tabular-nums">
                    {mt.value}
                    <Delta mt={mt} />
                  </dd>
                </div>
              ))}
              <dt className="text-on-surface-variant">Approvals</dt>
              <dd className="text-right">{s.approvals}</dd>
            </dl>
            <Policy s={s} />
            <div>
              <Choose s={s} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ================================================================ billing */

export type InvoiceRow = { id: string; period: string; due: string; amount: number; kind?: "ramp" | "standard" | "one-time"; changed?: { from: number }; note?: string };

/**
 * The invoice schedule (Invoice schedule, Ramp result, Schedule balances exactly). States whether
 * the schedule adds up to the contract value, and by how much it's off when it doesn't.
 */
export function InvoiceSchedule({ rows, contractTotal, money, className }: { rows: InvoiceRow[]; contractTotal: number; money?: MoneyFormat; className?: string }) {
  const m = (n: number) => formatMoney(n, money);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const diff = Math.round((total - contractTotal) * 100) / 100;
  return (
    <div className={cn("flex flex-col gap-2", className)} data-slot="invoice-schedule">
      <div className="overflow-x-auto rounded-lg border border-edge bg-card" role="region" aria-label="Invoice schedule" tabIndex={0}>
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Invoice schedule</caption>
          <thead className="bg-surface-container-low">
            <tr>
              {["Invoice", "Service period", "Due", "Amount"].map((h, i) => (
                <th className={cn("h-10 px-3 text-meta-strong font-normal text-on-surface-variant", i === 3 ? "text-right" : "text-left")} key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr className={r.changed ? "bg-[color-mix(in_oklch,var(--tertiary-container)_35%,var(--card))]" : undefined} key={r.id}>
                <th className="border-t border-outline-faint px-3 py-2.5 text-left font-normal" scope="row">
                  {i + 1}
                  {r.kind === "ramp" && <Badge className="ml-2" variant="ai">Ramp</Badge>}
                  {r.kind === "one-time" && <Badge className="ml-2">One-time</Badge>}
                </th>
                <td className="border-t border-outline-faint px-3 py-2.5">
                  {r.period}
                  {r.note && <span className="block text-body-md text-on-surface-variant">{r.note}</span>}
                </td>
                <td className="border-t border-outline-faint px-3 py-2.5 whitespace-nowrap">{r.due}</td>
                <td className="border-t border-outline-faint px-3 py-2.5 text-right tabular-nums">{r.changed ? <Change from={m(r.changed.from)} to={m(r.amount)} /> : m(r.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-surface-container-low">
            <tr>
              <th className="border-t border-outline-variant px-3 py-2.5 text-left font-normal text-on-surface-variant" colSpan={3} scope="row">
                Total of {rows.length} invoices
              </th>
              <td className="border-t border-outline-variant px-3 py-2.5 text-right font-semibold tabular-nums">{m(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p aria-live="polite" className={cn("inline-flex items-center gap-1.5 text-body-md", diff === 0 ? "text-success" : "text-on-warning-container")}>
        {diff === 0 ? <CheckCircle2Icon aria-hidden className="size-3.5" /> : <AlertTriangleIcon aria-hidden className="size-3.5" />}
        {diff === 0 ? `Balances exactly with the contract value, ${m(contractTotal)}.` : `${m(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than the contract value (${m(contractTotal)}). Fix before saving.`}
      </p>
    </div>
  );
}

/* ================================================================ order matching */

export type MatchRow = { id: string; field: string; accepted: ReactNode; received: ReactNode; status: "match" | "differs" | "missing"; resolution?: ReactNode };

/**
 * Accepted quote against the received PO, field by field (Order differences found, Line matching
 * preview). Differences are ringed with a ≠ and say how to resolve them; the summary says whether
 * the order can be created.
 */
export function OrderMatch({
  rows,
  accepted,
  received,
  actions,
  className,
}: {
  rows: MatchRow[];
  accepted: { service: string; record: string };
  received: { service: string; record: string };
  actions?: ReactNode;
  className?: string;
}) {
  const blocking = rows.filter((r) => r.status !== "match").length;
  return (
    <section aria-label="Order matching" className={cn("flex flex-col gap-3", className)} data-slot="order-match">
      <p className={cn("inline-flex items-center gap-2 text-label-lg font-semibold", blocking ? "text-on-warning-container" : "text-success")}>
        {blocking ? <AlertTriangleIcon aria-hidden className="size-4" /> : <CheckCircle2Icon aria-hidden className="size-4" />}
        {blocking ? `${blocking} ${blocking === 1 ? "difference blocks" : "differences block"} the order` : "Everything matches. Ready for order creation."}
      </p>
      <div className="overflow-x-auto rounded-lg border border-edge bg-card" role="region" aria-label="Accepted quote compared with the purchase order" tabIndex={0}>
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Accepted quote compared with the purchase order</caption>
          <thead className="bg-surface-container-low">
            <tr>
              <th className="h-10 px-3 text-left text-meta-strong font-normal text-on-surface-variant" scope="col">
                Field
              </th>
              <th className="h-10 px-3 text-left text-meta-strong font-normal text-on-surface-variant" scope="col">
                <span className="inline-flex items-center gap-1.5">
                  <ServiceLogo service={accepted.service} size={14} />
                  Accepted: {accepted.record}
                </span>
              </th>
              <th className="w-10" scope="col">
                <span className="sr-only">Match</span>
              </th>
              <th className="h-10 px-3 text-left text-meta-strong font-normal text-on-surface-variant" scope="col">
                <span className="inline-flex items-center gap-1.5">
                  <ServiceLogo service={received.service} size={14} />
                  Received: {received.record}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="lark-stagger">
            {rows.map((r) => (
              <tr key={r.id}>
                <th className="border-t border-outline-faint px-3 py-2.5 text-left align-top font-normal text-on-surface-variant" scope="row">
                  {r.field}
                </th>
                <td className="border-t border-outline-faint px-3 py-2.5 align-top">{r.accepted}</td>
                <td className="border-t border-outline-faint py-2.5 text-center align-top">
                  {r.status === "match" ? (
                    <CheckIcon aria-label="matches" className="mx-auto size-4 text-success" role="img" />
                  ) : (
                    <span aria-label={r.status === "missing" ? "missing from the PO" : "does not match"} className="mx-auto inline-flex size-6 items-center justify-center rounded-full bg-warning text-[13px] text-on-warning" role="img">
                      ≠
                    </span>
                  )}
                </td>
                <td className="border-t border-outline-faint px-3 py-2.5 align-top">
                  <span className={cn(r.status !== "match" && "rounded-sm px-1 ring-1 ring-warning")}>{r.status === "missing" ? <em className="text-on-surface-variant">Not on the PO</em> : r.received}</span>
                  {r.resolution && <span className="mt-1 block text-meta text-on-surface-variant">{r.resolution}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}

/* ================================================================ apply blocked */

/** Why an action can't run right now, and the one thing that unblocks it (Apply blocked, Self-approval denied). */
export function BlockedReason({ title, children, action, className }: { title: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg bg-inset p-3 text-sm", className)} data-slot="blocked-reason">
      <BanIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-on-surface-variant" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold text-on-surface">{title}</p>
        {children && <div className="text-on-surface-variant">{children}</div>}
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}

/* ================================================================ approval matrix */

export type ApprovalMatrixRow = { id: string; label: string; description?: string };
export type ApprovalMatrixLevel = { id: string; label: string };

/**
 * Who approves what (v0.6, the shape of Cohere's classify table). Each row is a condition (a
 * discount band, a term, a region) and picks one approver level. Every row is a native radio
 * group, so arrows move within a row and Tab moves between rows. The chosen cell is tan and
 * says the approver's name inside it, so the choice never rests on colour; each radio's name
 * reads "10–20% discount: Deal desk". Read-only shows the same grid without inputs.
 */
export function ApprovalMatrix({
  caption,
  rows,
  levels,
  value,
  onChange,
  readOnly,
  changed,
  className,
}: {
  /** What the matrix decides, e.g. "Approver by discount band, EMEA". */
  caption: string;
  rows: ApprovalMatrixRow[];
  levels: ApprovalMatrixLevel[];
  /** Row id → level id. */
  value: Record<string, string>;
  onChange?: (rowId: string, levelId: string) => void;
  readOnly?: boolean;
  /** Row ids edited since the last publish: marked "Changed". */
  changed?: string[];
  className?: string;
}) {
  const name = useId();
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-edge bg-card", className)} data-slot="approval-matrix">
      <table className="w-full min-w-[30rem] border-separate border-spacing-0 text-sm">
        <caption className="px-4 pt-3 pb-2 text-left text-meta text-on-surface-variant">{caption}</caption>
        <thead>
          <tr>
            <th className="w-[1%] border-b border-outline-variant px-4 py-2 text-left text-meta-strong font-normal whitespace-nowrap text-on-surface-variant" scope="col">
              Condition
            </th>
            {levels.map((l) => (
              <th className="border-b border-outline-variant px-1 py-2 text-center text-meta-strong font-normal whitespace-nowrap text-on-surface-variant" key={l.id} scope="col">
                {l.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isChanged = changed?.includes(r.id);
            return (
              <tr key={r.id}>
                <th className="border-b border-outline-faint px-4 py-2 text-left align-middle font-normal whitespace-nowrap" scope="row">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-on-surface">{r.label}</span>
                    {isChanged && <Badge variant="warning">Changed</Badge>}
                  </span>
                  {r.description && <span className="block text-body-md text-on-surface-variant">{r.description}</span>}
                </th>
                {levels.map((l) => {
                  const on = value[r.id] === l.id;
                  const cell = cn(
                    "flex h-8 w-full items-center justify-center gap-1.5 rounded-md border px-1.5 text-meta-strong whitespace-nowrap transition-colors",
                    on ? "border-selected-border bg-secondary-container text-on-secondary-container" : "border-transparent bg-surface-container text-on-surface-tertiary"
                  );
                  return (
                    <td className="border-b border-outline-faint px-1 py-1.5 align-middle" key={l.id}>
                      {readOnly ? (
                        <span className={cell}>
                          {on ? (
                            <>
                              <span aria-hidden className="size-1.5 rounded-full bg-current" />
                              {l.label}
                            </>
                          ) : (
                            <span className="sr-only">Not {l.label}</span>
                          )}
                        </span>
                      ) : (
                        <label className="block cursor-pointer">
                          <input
                            aria-label={`${r.label}: ${l.label}`}
                            checked={on}
                            className="peer sr-only"
                            name={`${name}-${r.id}`}
                            onChange={() => onChange?.(r.id, l.id)}
                            type="radio"
                            value={l.id}
                          />
                          <span className={cn(cell, "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring", !on && "hover:bg-surface-container-high hover:text-on-surface-variant")}>
                            {on ? (
                              <>
                                <span aria-hidden className="size-1.5 rounded-full bg-current" />
                                {l.label}
                              </>
                            ) : (
                              <span aria-hidden className="opacity-0 transition-opacity [label:hover_&]:opacity-100">
                                {l.label}
                              </span>
                            )}
                          </span>
                        </label>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
