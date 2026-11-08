"use client";

/*
 * Lark 0.6 surfaces and marks. Shapes taken from Cohere's product UI and adapted to Lark's
 * rules (sentence case, 12px floor, meaning never by colour or line style alone):
 *  - Tray: a stone tray holding white cards, corners concentric (24 outer, 12 padding, 12 inner).
 *  - ProvisionalBadge: dashed edge plus words for anything proposed, unsaved or suggested by AI.
 *  - CompoundTag: one value with a qualifier ("Discount | 92%").
 *  - Freshness: when a computed number was last updated, and when it may be out of date.
 *  - CardStatusFooter: a card's one action beside its state.
 */

import { CircleDashedIcon, ClockIcon, SparklesIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useId, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

import { CardLink } from "./cards";

/* ================================================================ Tray */

export type TrayProps = Omit<ComponentProps<"section">, "title"> & {
  /** Optional label above the cards, inside the tray. */
  title?: ReactNode;
  description?: ReactNode;
  /** Right of the title: icon-only controls (a menu). v0.6: no text buttons; use `footer` or `link`. */
  action?: ReactNode;
  /** One action under the cards (a Button), left-aligned. */
  footer?: ReactNode;
  /** "See more" at the end of the tray. */
  link?: { label: string; href: string };
  as?: "h2" | "h3" | "h4";
  /** Grid columns for the cards from md up. Default 1 (a stack). */
  columns?: 1 | 2 | 3;
};

/**
 * A stone tray that groups related cards: approval lanes, a quote's options, a run's steps.
 * 24px corners and 12px padding, so 12px cards inside stay concentric. Flat: no shadow, no edge.
 * Not a card itself and not for a single card (use SectionCard).
 */
export function Tray({ title, description, action, footer, link, as: H = "h3", columns = 1, className, children, ...props }: TrayProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={title ? id : undefined}
      className={cn("flex min-w-0 flex-col gap-3 rounded-2xl bg-inset p-3", className)}
      data-slot="tray"
      {...props}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-start gap-x-3 gap-y-1 px-1 pt-0.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {title && (
              <H className="text-title-sm text-on-surface" id={id}>
                {title}
              </H>
            )}
            {description && <p className="text-body-md text-on-surface-variant">{description}</p>}
          </div>
          {action && <div className="-my-1 flex shrink-0 items-center gap-1">{action}</div>}
        </header>
      )}
      <div className={cn("grid min-w-0 gap-2", columns === 2 && "md:grid-cols-2", columns === 3 && "md:grid-cols-2 lg:grid-cols-3")}>{children}</div>
      {(footer || link) && (
        <div className="flex flex-wrap items-center gap-2 px-1 pb-0.5">
          {footer}
          {link && <CardLink className={footer ? "ml-auto" : undefined} {...link} />}
        </div>
      )}
    </section>
  );
}

/** A plain card for use inside a Tray: white, 12px corners, hairline edge. */
export function TrayCard({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-col gap-2 rounded-lg border border-outline-faint bg-card p-3 text-card-foreground", className)} data-slot="tray-card" {...props} />;
}

/* ================================================================ Provisional */

const PROVISIONAL = {
  proposed: { word: "Proposed", icon: CircleDashedIcon, cls: "border-outline text-on-surface-variant" },
  unsaved: { word: "Not saved", icon: CircleDashedIcon, cls: "border-outline text-on-surface-variant" },
  ai: { word: "Suggested by ACE", icon: SparklesIcon, cls: "border-ai-border text-on-tertiary-container" },
} as const;

export type ProvisionalKind = keyof typeof PROVISIONAL;

/**
 * Marks something that isn't committed yet. The dashed edge is the visual cue; the word is the
 * meaning (screen readers and people who can't tell dashed from solid get the word).
 */
export function ProvisionalBadge({ kind = "proposed", children, className }: { kind?: ProvisionalKind; children?: ReactNode; className?: string }) {
  const p = PROVISIONAL[kind];
  return (
    <span
      className={cn("inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-full border border-dashed px-2 text-meta-strong whitespace-nowrap", p.cls, className)}
      data-kind={kind}
      data-slot="provisional-badge"
    >
      <p.icon aria-hidden className="size-3" />
      {children ?? p.word}
    </span>
  );
}

/** Classes for a container that holds provisional content: dashed edge, no fill change. */
export const provisionalEdge = "border-dashed border-outline";

/* ================================================================ CompoundTag */

/**
 * One value and its qualifier in one pill, split by a straight rule: "Discount | 92%".
 * For values ACE extracted (with the confidence ACE reports) or a category with a count.
 * The accessible text reads "Discount, 92% confidence".
 */
export function CompoundTag({
  label,
  value,
  valueLabel = "confidence",
  tone = "neutral",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  /** Spoken after the value. "" to say nothing. */
  valueLabel?: string;
  tone?: "neutral" | "ai" | "warning";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-stretch overflow-hidden rounded-full border text-meta-strong whitespace-nowrap",
        tone === "neutral" && "border-outline-strong bg-surface-container-lowest text-on-surface",
        tone === "ai" && "border-ai-border bg-tertiary-container text-on-tertiary-container",
        tone === "warning" && "border-transparent bg-warning-container text-on-warning-container",
        className
      )}
      data-slot="compound-tag"
    >
      <span className="flex items-center px-2">{label}</span>
      <span aria-hidden className="w-px bg-current opacity-25" />
      <span className="flex items-center px-2 font-mono tabular-nums">
        <span className="sr-only">, </span>
        {value}
        {valueLabel && <span className="sr-only"> {valueLabel}</span>}
      </span>
    </span>
  );
}

/* ================================================================ Freshness */

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

/** "2 minutes ago", "3 hours ago", "just now". */
export function relativeTime(at: Date, now: Date = new Date(), locale = "en-US") {
  const diff = at.getTime() - now.getTime();
  if (Math.abs(diff) < 45_000) return "just now";
  const fmt = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "long" });
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms || unit === "minute") return fmt.format(Math.round(diff / ms), unit);
  }
  return "just now";
}

/* A shared 30-second clock, so relative times stay current without each badge running a timer.
   The server snapshot is 0: the server renders the exact time, the client then the phrase. */
let clockNow = 0;
let clockTimer: ReturnType<typeof setInterval> | undefined;
const clockListeners = new Set<() => void>();
function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  if (!clockTimer) {
    clockNow = Date.now();
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    clockListeners.delete(cb);
    if (!clockListeners.size && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}
function getClock() {
  if (!clockNow) clockNow = Date.now();
  return clockNow;
}
/** The current time, updated every 30 seconds; 0 during server rendering. */
export function useNow() {
  return useSyncExternalStore(subscribeClock, getClock, () => 0);
}

export type FreshnessProps = {
  /** When the number was computed. */
  at: Date | string;
  /** Overrides the computed phrase, e.g. a server-rendered "2 min ago". */
  label?: string;
  /** Minutes after which the value is called out as possibly out of date. */
  staleAfter?: number;
  /** Fixed "now" for tests and server rendering. */
  now?: Date;
  /** Default "Updated". */
  verb?: string;
  className?: string;
};

/**
 * When a computed value was last updated ("Updated 2 min ago"), as a <time> with the exact
 * timestamp. Past `staleAfter` it says so in words with a clock, in the warning tone.
 */
export function Freshness({ at, label, staleAfter, now, verb = "Updated", className }: FreshnessProps) {
  const clock = useNow();
  const date = typeof at === "string" ? new Date(at) : at;
  const ref = now?.getTime() ?? clock;
  if (Number.isNaN(date.getTime())) return null;
  const known = ref > 0;
  const stale = known && staleAfter !== undefined && ref - date.getTime() > staleAfter * 60_000;
  const phrase = label ?? (known ? relativeTime(date, new Date(ref)) : `at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`);
  return (
    <span className={cn("inline-flex items-center gap-1 text-meta", stale ? "text-on-warning-container" : "text-on-surface-tertiary", className)} data-slot="freshness" data-stale={stale || undefined}>
      {stale && <ClockIcon aria-hidden className="size-3.5" />}
      {verb}{" "}
      {/* The server can't know the reader's clock or time zone: it renders the exact time, and the
          client replaces it with the phrase right after hydrating. */}
      <time dateTime={date.toISOString()} suppressHydrationWarning title={date.toLocaleString("en-US")}>
        {phrase}
      </time>
      {stale && <span className="-ml-1">, may be out of date</span>}
    </span>
  );
}

/* ================================================================ CardStatusFooter */

/**
 * A card's footer: its one action on the left, its state on the right
 * ("Open quote · Awaiting finance"). Pass a Button or link as `action`, a StatusBadge as `status`.
 */
export function CardStatusFooter({ action, status, className }: { action?: ReactNode; status?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-10 flex-wrap items-center justify-between gap-2", className)} data-slot="card-status-footer">
      <div className="flex items-center gap-2">{action}</div>
      {status && <div className="flex items-center gap-2">{status}</div>}
    </div>
  );
}
