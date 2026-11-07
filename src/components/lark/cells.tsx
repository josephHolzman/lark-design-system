"use client";

import { AlertTriangleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { PersonAvatar } from "./identity";
import { type MenuSection, ActionMenu } from "./menus";
import { LarkLink } from "./provider";

/*
  Cell renderers for DataGrid. Each keeps to one line plus at most one meta line
  (Beams: a cell is never a paragraph), truncates with a title, and carries its meaning
  in text so colour is never the only cue.
*/

/** The record column: logo, the name as Beams' secondary underlined link, one meta line. */
export function RecordCell({ leading, name, href, onOpen, meta }: { leading?: ReactNode; name: string; href?: string; onOpen?: () => void; meta?: ReactNode }) {
  const nameCls = "truncate text-on-surface-variant underline decoration-outline-strong underline-offset-3 hover:text-on-surface hover:decoration-on-surface-variant focus-ring rounded-sm outline-none";
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {leading}
      <span className="flex min-w-0 flex-col">
        {href ? (
          <LarkLink className={nameCls} href={href} title={name}>
            {name}
          </LarkLink>
        ) : (
          <button className={cn(nameCls, "text-left")} onClick={onOpen} title={name} type="button">
            {name}
          </button>
        )}
        {meta && <span className="truncate text-body-sm text-on-surface-tertiary">{meta}</span>}
      </span>
    </span>
  );
}

/** Two-line text: a title and a muted preview (Apollo Emails: subject + body). */
export function TextCell({ title, preview }: { title: ReactNode; preview?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate">{title}</span>
      {preview && <span className="truncate text-body-sm text-on-surface-variant">{preview}</span>}
    </span>
  );
}

/** Money, right-aligned, with an optional meta line ("Revision 4"). */
export function MoneyCell({ value, currency = "USD", sub, compact }: { value: number; currency?: string; sub?: ReactNode; compact?: boolean }) {
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0, notation: compact ? "compact" : "standard" });
  return (
    <span className="flex flex-col items-end">
      <span className="tabular-nums">{fmt.format(value)}</span>
      {sub && <span className="text-body-sm text-on-surface-tertiary">{sub}</span>}
    </span>
  );
}

/**
 * A percentage with a bar against a limit. Over the limit, the bar and number turn
 * caution AND a warning icon plus "over limit" text appear.
 */
export function PercentBarCell({ value, limit, max = 100, label }: { value: number; limit?: number; max?: number; label?: string }) {
  const over = limit != null && value > limit;
  return (
    <span className="flex w-full items-center gap-2" title={label}>
      <span aria-hidden="true" className="relative h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-outline-variant">
        <span className={cn("absolute inset-y-0 left-0 rounded-full", over ? "bg-warning" : "bg-on-surface-variant")} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
        {limit != null && <span className="absolute inset-y-0 w-0.5 bg-on-surface" style={{ left: `${(limit / max) * 100}%` }} />}
      </span>
      <span className={cn("inline-flex w-14 items-center justify-end gap-1 tabular-nums", over && "font-medium text-warning")}>
        {over && <AlertTriangleIcon aria-hidden="true" className="size-3.5" />}
        {value}%
      </span>
      {over && <span className="sr-only">, over the {limit}% limit</span>}
    </span>
  );
}

/** An inline trend line with its text summary for screen readers ("up 12% over 8 weeks"). */
export function SparklineCell({ points, summary, width = 64, change }: { points: number[]; summary: string; width?: number; /** Visible change, e.g. "+12%". The line alone doesn't say how much. */ change?: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * width},${18 - ((p - min) / span) * 16}`).join(" ");
  const up = points[points.length - 1] >= points[0];
  return (
    <span className="inline-flex items-center gap-2">
      <svg aria-hidden="true" className={up ? "text-primary" : "text-warning"} height="20" viewBox={`0 0 ${width} 20`} width={width}>
        <path d={d} fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx={width} cy={18 - ((points[points.length - 1] - min) / span) * 16} fill="currentColor" r="2" />
      </svg>
      {change && (
        <span aria-hidden="true" className={cn("text-body-sm tabular-nums", up ? "text-on-surface-variant" : "text-on-warning-container")}>
          {change}
        </span>
      )}
      <span className="sr-only">{summary}</span>
    </span>
  );
}

/** Steps done of total as segments (approvals 2 of 3), with the count in text. */
export function ProgressCell({ done, total, label }: { done: number; total: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" title={label}>
      <span aria-hidden="true" className="flex gap-0.5">
        {Array.from({ length: total }, (_, i) => (
          <span className={cn("h-1.5 w-4 rounded-full", i < done ? "bg-success" : "bg-outline-strong")} key={i} />
        ))}
      </span>
      <span className="text-body-sm whitespace-nowrap text-on-surface-variant tabular-nums">
        {done} of {total}
        <span className="sr-only"> {label ?? "complete"}</span>
      </span>
    </span>
  );
}

/** Overlapping initials, +N for the rest; the full list in a tooltip and for screen readers. */
export function AvatarStack({ names, max = 3 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span aria-label={names.join(", ")} className="inline-flex items-center" role="img" tabIndex={0}>
          {shown.map((n) => (
            <PersonAvatar className="-ml-1.5 ring-2 ring-card first:ml-0" key={n} name={n} size="sm" />
          ))}
          {rest > 0 && (
            <span aria-hidden="true" className="-ml-1.5 inline-flex size-6 items-center justify-center rounded-full bg-surface-container-high text-xs leading-none font-medium tabular-nums text-on-surface-variant ring-2 ring-card">
              +{rest}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>{names.join(", ")}</TooltipContent>
    </Tooltip>
  );
}

export type Tag = { label: string; variant?: "default" | "info" | "success" | "warning" | "destructive" | "ai" | "selected" | "teal" | "pink" | "olive" };

/** Badges that fit on one line, then "+N" with the rest in a tooltip. */
export function TagsCell({ tags, max = 2 }: { tags: Tag[]; max?: number }) {
  const shown = tags.slice(0, max);
  const rest = tags.slice(max);
  return (
    <span className="flex min-w-0 items-center gap-1">
      {shown.map((t) => (
        <Badge key={t.label} variant={t.variant}>
          {t.label}
        </Badge>
      ))}
      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="focus-ring inline-flex h-5 items-center rounded-full bg-surface-container px-1.5 text-xs leading-none font-medium tabular-nums text-on-surface-variant outline-none" type="button">
              +{rest.length}
              <span className="sr-only"> more: {rest.map((r) => r.label).join(", ")}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{rest.map((r) => r.label).join(", ")}</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

/** A date with its relative form, the exact value in a tooltip and <time>. */
export function DateCell({ iso, label, relative }: { iso: string; label: string; relative?: string }) {
  return (
    <span className="flex flex-col">
      <time dateTime={iso} title={iso}>
        {label}
      </time>
      {relative && <span className="text-body-sm text-on-surface-tertiary">{relative}</span>}
    </span>
  );
}

/** Row actions: one visible action (a secondary button) plus the ⋯ menu. */
export function ActionsCell({ primary, sections, label }: { primary?: ReactNode; sections?: MenuSection[]; label?: string }) {
  return (
    <span className="flex items-center justify-end gap-1">
      {primary}
      {sections && <ActionMenu label={label ?? "Row actions"} sections={sections} />}
    </span>
  );
}

/** A cell that only shows content on row hover or focus (quick actions), always reachable by keyboard. */
export function HoverActions({ children }: { children: ReactNode }) {
  return <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">{children}</span>;
}
