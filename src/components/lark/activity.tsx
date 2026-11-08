"use client";

import { ArrowRightIcon, BriefcaseBusinessIcon, Building2Icon, CircleAlertIcon, CircleCheckIcon, CogIcon, InfoIcon, TriangleAlertIcon, UsersIcon } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { Segmented } from "./filters";

/*
  ActivityFeed (v0.7): one job, "What has been said and done on this deal, by whom?".
  · Each entry is coded by party (customer, seller, internal, system) with a mark, a colour
    and the word, so the party never depends on colour (WCAG 1.4.1).
  · The message is a quote; under it one meta line (time, reference). Grouped by day.
  · Filters are a Segmented control with counts. Provenance is said once, at the top.
  SituationSummary is the lead band that goes above it: status, the problem in one line, and
  the next step.
*/

export type ActivityParty = "customer" | "seller" | "internal" | "system";

export type ActivityEntry = {
  id: string;
  party: ActivityParty;
  /** Who: a person, a team, or the system that acted. */
  author: string;
  /** What happened, in one line: "Asked for a 3-year term". */
  title: string;
  /** Their words, shown as a quote. */
  message?: string;
  /** ISO date-time. */
  at: string;
  /** Email subject, ticket, quote revision… one short reference. */
  reference?: string;
};

export const PARTY: Record<ActivityParty, { word: string; plural: string; icon: LucideIcon; mark: string; quote: string }> = {
  customer: { word: "Customer", plural: "Customer", icon: Building2Icon, mark: "bg-tag-teal text-on-tag-teal", quote: "border-on-tag-teal/50" },
  seller: { word: "Seller", plural: "Seller", icon: BriefcaseBusinessIcon, mark: "bg-tag-pink text-on-tag-pink", quote: "border-on-tag-pink/50" },
  internal: { word: "Internal", plural: "Internal", icon: UsersIcon, mark: "bg-tag-olive text-on-tag-olive", quote: "border-on-tag-olive/50" },
  system: { word: "System", plural: "System", icon: CogIcon, mark: "bg-surface-container-high text-on-surface-variant", quote: "border-outline" },
};

const ORDER: ActivityParty[] = ["customer", "seller", "internal", "system"];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d: Date, now: Date) {
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (dayKey(d) === dayKey(now)) return "Today";
  if (dayKey(d) === dayKey(y)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", ...(d.getFullYear() !== now.getFullYear() && { year: "numeric" }) });
}

const time = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function Entry({ e }: { e: ActivityEntry }) {
  const p = PARTY[e.party];
  const at = new Date(e.at);
  return (
    // scroll-mt keeps a focused row clear of the sticky day heading (WCAG 2.4.11).
    <li className="flex min-w-0 scroll-mt-8 gap-3 py-3" data-party={e.party}>
      <span aria-hidden="true" className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-md [&>svg]:size-4", p.mark)}>
        <p.icon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span className="text-label-lg text-on-surface [overflow-wrap:break-word]">{e.author}</span>
          <span className="text-meta-strong text-on-surface-variant">{p.word}</span>
        </p>
        <p className="text-body-md text-on-surface [overflow-wrap:break-word]">{e.title}</p>
        {e.message && <blockquote className={cn("border-l-2 pl-3 text-body-md text-on-surface-variant [overflow-wrap:break-word]", p.quote)}>{e.message}</blockquote>}
        <p className="flex min-w-0 flex-wrap gap-x-1.5 text-meta text-on-surface-variant" data-meta="meta">
          <time dateTime={e.at} title={at.toLocaleString("en-US")}>
            {time(at)}
          </time>
          {e.reference && (
            <>
              <span aria-hidden="true">·</span>
              <span className="min-w-0 truncate" title={e.reference}>
                {e.reference}
              </span>
            </>
          )}
        </p>
      </div>
    </li>
  );
}

export type ActivityFeedProps = {
  entries: ActivityEntry[];
  /** Said once, above the entries: an "Example data" badge, a SourceLine. */
  provenance?: ReactNode;
  /** Shown before "Show older" (default 20). */
  initialCount?: number;
  /** For day labels ("Today"); defaults to now. */
  now?: Date;
  /** Shown when there are no entries at all. */
  empty?: ReactNode;
  className?: string;
};

export function ActivityFeed({ entries, provenance, initialCount = 20, now: nowProp, empty, className }: ActivityFeedProps) {
  const [filter, setFilter] = useState<"all" | ActivityParty>("all");
  const [limit, setLimit] = useState(initialCount);
  const now = useMemo(() => nowProp ?? new Date(), [nowProp]);
  const sorted = useMemo(() => [...entries].sort((a, b) => +new Date(b.at) - +new Date(a.at)), [entries]);
  const counts = useMemo(() => Object.fromEntries(ORDER.map((p) => [p, entries.filter((e) => e.party === p).length])) as Record<ActivityParty, number>, [entries]);
  const shown = sorted.filter((e) => filter === "all" || e.party === filter);
  const visible = shown.slice(0, limit);
  const groups: { key: string; label: string; items: ActivityEntry[] }[] = [];
  for (const e of visible) {
    const d = new Date(e.at);
    const k = dayKey(d);
    if (groups.at(-1)?.key !== k) groups.push({ key: k, label: dayLabel(d, now), items: [] });
    groups.at(-1)!.items.push(e);
  }

  if (entries.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)} data-slot="activity-feed">
        {provenance}
        {empty ?? <p className="text-body-md text-on-surface-variant">No activity yet.</p>}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-4", className)} data-slot="activity-feed">
      {provenance && <div className="flex flex-wrap items-center gap-2">{provenance}</div>}
      <Segmented
        aria-label="Show activity from"
        onValueChange={(v) => {
          setFilter(v as typeof filter);
          setLimit(initialCount);
        }}
        options={[{ value: "all", label: "All", count: entries.length }, ...ORDER.filter((p) => counts[p] > 0).map((p) => ({ value: p, label: PARTY[p].plural, count: counts[p] }))]}
        value={filter}
      />
      {groups.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">No {PARTY[filter as ActivityParty].word.toLowerCase()} activity.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((g) => (
            <section aria-label={g.label} className="flex flex-col" key={g.key}>
              <h3 className="sticky top-0 z-[1] bg-module py-1 text-meta-strong text-on-surface-variant">{g.label}</h3>
              <ol className="flex flex-col divide-y divide-outline-variant">
                {g.items.map((e) => (
                  <Entry e={e} key={e.id} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
      {shown.length > limit && (
        <Button className="self-start" onClick={() => setLimit(limit + initialCount)} size="sm" variant="secondary">
          Show older ({shown.length - limit})
        </Button>
      )}
    </div>
  );
}

export function ActivityFeedSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading activity" className="flex flex-col gap-4" role="status">
      <Skeleton className="h-8 w-72 max-w-full" />
      {Array.from({ length: rows }, (_, i) => (
        <div className="flex gap-3" key={i}>
          <Skeleton className="size-8 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- SituationSummary */

const SITUATION = {
  blocked: { icon: CircleAlertIcon, band: "bg-tint-coral border-error/40", icon_cls: "bg-error-container text-on-error-container", word: "Blocked" },
  attention: { icon: TriangleAlertIcon, band: "bg-tint-ember border-warning/50", icon_cls: "bg-warning-container text-on-warning-container", word: "Needs attention" },
  on_track: { icon: CircleCheckIcon, band: "bg-tint-evergreen border-success/40", icon_cls: "bg-success-container text-on-success-container", word: "On track" },
  info: { icon: InfoIcon, band: "bg-tint-sky border-primary/30", icon_cls: "bg-primary-container text-on-primary-container", word: "Update" },
} as const;

export type SituationSummaryProps = {
  status: keyof typeof SITUATION;
  /** Override the status word ("Waiting on customer"). */
  statusLabel?: string;
  /** The problem, in one line. */
  problem: ReactNode;
  /** The next step, in one line. */
  next?: ReactNode;
  /** One button for the next step. */
  action?: { label: string; onClick?: () => void };
  className?: string;
};

/** The lead band above a feed or a record: where things stand, what's wrong, what's next. */
export function SituationSummary({ status, statusLabel, problem, next, action, className }: SituationSummaryProps) {
  const s = SITUATION[status];
  return (
    // The band is the size container; the row inside lays out by the band's width.
    <section aria-label="Current situation" className={cn("@container/situation min-w-0 rounded-module border p-4", s.band, className)} data-slot="situation-summary" data-status={status}>
      <div className="flex min-w-0 flex-col gap-3 @[36rem]/situation:flex-row @[36rem]/situation:items-center @[36rem]/situation:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span aria-hidden="true" className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-md [&>svg]:size-4", s.icon_cls)}>
            <s.icon />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-label-lg text-on-surface">{statusLabel ?? s.word}</p>
            <p className="text-title-sm text-on-surface [overflow-wrap:break-word]">{problem}</p>
            {next && (
              <p className="text-body-md text-on-surface-variant">
                <span className="text-on-surface">Next: </span>
                {next}
              </p>
            )}
          </div>
        </div>
        {action && (
          <Button className="ml-11 shrink-0 self-start @[36rem]/situation:ml-0 @[36rem]/situation:self-center" onClick={action.onClick} size="sm">
            {action.label}
            <ArrowRightIcon />
          </Button>
        )}
      </div>
    </section>
  );
}
