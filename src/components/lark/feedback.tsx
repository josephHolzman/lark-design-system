"use client";

import {
  AlertTriangleIcon,
  OctagonAlertIcon,
  CheckCircle2Icon,
  CloudOffIcon,
  InboxIcon,
  InfoIcon,
  LoaderCircleIcon,
  LockIcon,
  RotateCcwIcon,
  SearchXIcon,
  SparklesIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ================================================================ Banner */

const BANNER = {
  info: { cls: "bg-surface-container-high text-on-surface", icon: InfoIcon, role: "status" },
  caution: { cls: "bg-warning-container text-on-warning-container", icon: AlertTriangleIcon, role: "status" },
  negative: { cls: "bg-error-container text-on-error-container", icon: XCircleIcon, role: "alert" },
  positive: { cls: "bg-success-container text-on-success-container", icon: CheckCircle2Icon, role: "status" },
  ai: { cls: "bg-tertiary-container text-on-tertiary-container", icon: SparklesIcon, role: "status" },
  permission: { cls: "bg-surface-container-high text-on-surface", icon: LockIcon, role: "status" },
} as const;

export type BannerTone = keyof typeof BANNER;

/**
 * Beams banners. `strip` runs full width with no radius between the page header and the
 * toolbar (account-level problems: "No mailbox linked"); `inset` sits 8px in with radius 8
 * (page-level notes: permissions, tips). One line, link inline, dismiss at the far right.
 * Negative banners use role="alert"; the rest are polite.
 */
export function Banner({
  tone = "info",
  layout = "inset",
  children,
  action,
  onDismiss,
  icon,
  className,
}: {
  tone?: BannerTone;
  layout?: "inset" | "strip";
  children: ReactNode;
  /** Inline link or a small button. */
  action?: ReactNode;
  onDismiss?: () => void;
  icon?: ReactNode;
  className?: string;
}) {
  const t = BANNER[tone];
  const Icon = t.icon;
  return (
    <div
      className={cn(
        "flex min-h-11 items-start gap-2.5 px-3 py-3 text-sm",
        layout === "inset" ? "mx-2 rounded-md" : "rounded-none px-4",
        t.cls,
        className
      )}
      data-slot="banner"
      data-tone={tone}
      role={t.role}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0 [&_svg]:size-4">
        {icon ?? <Icon />}
      </span>
      <div className="min-w-0 flex-1 [&_a]:underline [&_a]:underline-offset-3">
        {children} {action}
      </div>
      {onDismiss && (
        <button
          aria-label="Dismiss"
          className="state-layer focus-ring -my-1 -mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-[6px] outline-none"
          onClick={onDismiss}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

/* ================================================================ Callout */

/* v0.6.1: callouts are tinted fills with no edge (Cohere): the icon and the title carry the
   meaning; the tint only groups. */
const CALLOUT = {
  info: { ring: "bg-surface-container", title: "text-on-surface", icon: InfoIcon, role: undefined },
  caution: { ring: "bg-warning-container/70", title: "text-on-warning-container", icon: AlertTriangleIcon, role: undefined },
  critical: { ring: "bg-error-container/70", title: "text-on-error-container", icon: OctagonAlertIcon, role: "alert" },
  positive: { ring: "bg-success-container/60", title: "text-on-success-container", icon: CheckCircle2Icon, role: undefined },
  ai: { ring: "bg-tertiary-container/60", title: "text-on-tertiary-container", icon: SparklesIcon, role: undefined },
} as const;

export type CalloutTone = keyof typeof CALLOUT;

/**
 * A note about the content beside it, with a title and actions (ACE's "note" section: the most
 * used block in the state library). Unlike Banner (one line, page-level), a Callout can hold
 * a paragraph, a list and buttons, and sits inside the thing it is about.
 *
 * Caution and critical are ringed in their tone with a warning or stop icon, so danger never
 * depends on colour alone (WCAG 1.4.1). Use `critical` for holds and things that must not
 * happen; it is role="alert" only when `live` is set (don't alert on page load).
 */
export function Callout({
  tone = "info",
  title,
  children,
  actions,
  icon,
  live,
  className,
}: {
  tone?: CalloutTone;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  /** Announce when it appears (it was caused by something the person just did). */
  live?: boolean;
  className?: string;
}) {
  const t = CALLOUT[tone];
  const Icon = t.icon;
  return (
    <div
      className={cn("flex gap-3 rounded-lg p-3.5 text-sm", t.ring, className)}
      data-slot="callout"
      data-tone={tone}
      role={live ? (tone === "critical" ? "alert" : "status") : undefined}
    >
      <span aria-hidden="true" className={cn("mt-0.5 shrink-0 [&_svg]:size-4", t.title)}>
        {icon ?? <Icon />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {title && <p className={cn("text-label-lg font-semibold", t.title)}>{title}</p>}
        {children && <div className="min-w-0 text-on-surface [&_a]:underline [&_a]:underline-offset-3 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>}
        {actions && <div className="mt-1.5 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/* ================================================================ States */

const STATE_ICON = {
  "first-run": InboxIcon,
  "no-results": SearchXIcon,
  "no-permission": LockIcon,
  error: XCircleIcon,
  offline: CloudOffIcon,
} as const;

export type StateKind = keyof typeof STATE_ICON;

/**
 * Empty, no-results, no-permission, error and offline states (Beams: centred, no card,
 * title 16/24, one line of help at most 480 wide, then secondary + primary buttons).
 * Pick the kind that tells the truth: "no results" means filters hid things; "first-run"
 * means nothing exists yet; "no-permission" says who can grant access.
 */
export function StatePanel({
  kind,
  title,
  description,
  illustration,
  actions,
  details,
  compact,
  titleAs: T = "p",
  className,
}: {
  kind: StateKind;
  title: ReactNode;
  /** Make the title a heading when the state is the page's or section's content (an empty list, a not-found page). Default a paragraph. */
  titleAs?: "p" | "h1" | "h2" | "h3";
  description?: ReactNode;
  /** Illustration slot (first-run states). Decorative. */
  illustration?: ReactNode;
  actions?: ReactNode;
  /** Technical detail for errors (request ID), shown in mono. */
  details?: ReactNode;
  /** For table bodies and cards: less padding. */
  compact?: boolean;
  className?: string;
}) {
  const Icon = STATE_ICON[kind];
  return (
    <div
      className={cn("flex flex-col items-center justify-start gap-3 text-center", compact ? "px-4 py-8" : "px-6 py-16", className)}
      data-kind={kind}
      data-slot="state-panel"
      role={kind === "error" || kind === "offline" ? "alert" : undefined}
    >
      {illustration ? (
        <div aria-hidden="true" className="mb-1">
          {illustration}
        </div>
      ) : (
        Icon && (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full [&_svg]:size-5",
              kind === "error" ? "bg-error-container text-on-error-container" : "bg-surface-container-high text-on-surface-variant"
            )}
          >
            <Icon />
          </span>
        )
      )}
      <div className="flex max-w-[480px] flex-col gap-1">
        <T className="text-title-sm">{title}</T>
        {description && <p className="text-sm text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
      {details && <p className="font-mono text-xs text-on-surface-tertiary">{details}</p>}
    </div>
  );
}

/* ================================================================ Skeletons */

/** Loading placeholders shaped like what will arrive. Announced once via aria-busy on the region. */
export function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton className="h-3.5" key={i} style={{ width: `${[92, 76, 84, 60, 70][i % 5]}%` }} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-4 rounded-lg border border-edge bg-card p-4", className)}>
      <Skeleton className="h-4 w-40" />
      <SkeletonLines />
    </div>
  );
}

export function SkeletonFigure({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-2 bg-card p-4", className)}>
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/* ================================================================ Save status */

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

/**
 * "Unsaved changes" · "Saving…" · "Saved" · "Couldn't save · Retry". Lives next to the
 * page or card title. Polite live region, so screen readers hear the outcome.
 */
export function SaveStatus({ state, onRetry, savedLabel = "Saved", className }: { state: SaveState; onRetry?: () => void; savedLabel?: string; className?: string }) {
  return (
    <span aria-live="polite" className={cn("inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant", className)} role="status">
      {state === "dirty" && (
        <>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" /> Unsaved changes
        </>
      )}
      {state === "saving" && (
        <>
          <LoaderCircleIcon aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" /> Saving…
        </>
      )}
      {state === "saved" && (
        <>
          <CheckCircle2Icon aria-hidden="true" className="size-3.5 text-success" /> {savedLabel}
        </>
      )}
      {state === "error" && (
        <span className="inline-flex items-center gap-1.5 text-error">
          <XCircleIcon aria-hidden="true" className="size-3.5" /> Couldn&apos;t save
          {onRetry && (
            <Button className="h-auto px-1 text-error" onClick={onRetry} size="xs" variant="ghost">
              <RotateCcwIcon /> Retry
            </Button>
          )}
        </span>
      )}
    </span>
  );
}

/* ================================================================ Dirty state */

/** Tracks a form's dirty state against its last saved value. */
export function useDirtyState<T>(saved: T) {
  const [value, setValue] = useState<T>(saved);
  const [base, setBase] = useState<T>(saved);
  const dirty = JSON.stringify(value) !== JSON.stringify(base);
  return {
    value,
    setValue,
    dirty,
    reset: () => setValue(base),
    commit: () => setBase(value),
  };
}

/** Warns before the tab closes or reloads while there are unsaved changes. */
export function useLeaveGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onBefore = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [active]);
}

/**
 * Sticky bar that appears while a page or drawer has unsaved changes: what changed,
 * Discard (asks first when `confirmDiscard`), Save. Keyboard: it is a region with a
 * heading; Save keeps focus order last. Pair with useLeaveGuard.
 */
export function UnsavedChangesBar({
  open,
  count,
  saving,
  onDiscard,
  onSave,
  className,
}: {
  open: boolean;
  count?: number;
  saving?: boolean;
  onDiscard: () => void;
  onSave: () => void;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  if (!open) return null;
  return (
    <div
      aria-label="Unsaved changes"
      className={cn(
        "sticky bottom-0 z-20 flex flex-wrap items-center gap-3 border-t border-outline-variant bg-surface px-4 py-3 shadow-[0_-8px_16px_-12px_rgb(30_27_24/0.12)]",
        className
      )}
      data-slot="unsaved-bar"
      role="region"
    >
      <span className="flex items-center gap-2 text-sm">
        <span aria-hidden="true" className="size-2 rounded-full bg-warning" />
        {count ? `${count} unsaved ${count === 1 ? "change" : "changes"}` : "Unsaved changes"}
      </span>
      <div className="ml-auto flex items-center gap-2">
        {confirming ? (
          <>
            <span className="text-body-sm text-on-surface-variant">Discard your changes?</span>
            <Button onClick={() => setConfirming(false)} size="sm" variant="ghost">
              Keep editing
            </Button>
            <Button
              onClick={() => {
                setConfirming(false);
                onDiscard();
              }}
              size="sm"
              variant="destructive"
            >
              Discard
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setConfirming(true)} size="sm" variant="ghost">
              Discard
            </Button>
            <Button disabled={saving} onClick={onSave} size="sm">
              {saving && <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/** Marks a field or row whose value differs from the saved one. Not colour alone: it has a text label. */
export function DirtyMark({ label = "Edited" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-label-md text-on-warning-container">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />
      {label}
    </span>
  );
}
