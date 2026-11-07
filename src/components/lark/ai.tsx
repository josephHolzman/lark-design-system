"use client";

import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CircleIcon,
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { SourceChip } from "./data";

/* ================================================================ Confidence */

export type Confidence = "high" | "medium" | "low";

/**
 * Words, not percentages (people over-read "87%"). Three bars echo the word for scanning;
 * the word carries the meaning.
 */
export function ConfidenceBadge({ level, className }: { level: Confidence; className?: string }) {
  const n = level === "high" ? 3 : level === "medium" ? 2 : 1;
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1.5 rounded-full px-2 text-label-md whitespace-nowrap",
        level === "low" ? "bg-warning-container text-on-warning-container" : "bg-outline-variant text-on-surface-variant",
        className
      )}
      data-slot="confidence"
    >
      <span aria-hidden="true" className="flex items-end gap-px">
        {[1, 2, 3].map((i) => (
          <span className={cn("w-[3px] rounded-[1px]", i <= n ? "bg-current" : "bg-current/25")} key={i} style={{ height: 3 + i * 2 }} />
        ))}
      </span>
      {level === "high" ? "High confidence" : level === "medium" ? "Medium confidence" : "Low confidence"}
    </span>
  );
}

/* ================================================================ Evidence */

export type Evidence = { label: string; kind?: string; href?: string; quote?: ReactNode };

/**
 * "Why?" on any AI-derived value: opens the sources behind it. This is Deepgrids' trust
 * mechanism, so every AI value in a table or card should offer it.
 */
export function EvidencePopover({ evidence, summary, children, label = "Why?" }: { evidence: Evidence[]; summary?: ReactNode; children?: ReactNode; label?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ?? (
          <button className="link-default hit-area rounded-sm text-body-sm focus-ring outline-none" type="button">
            {label}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-80 flex-col gap-3 p-3">
        {summary && <p className="text-sm">{summary}</p>}
        <ul className="flex flex-col gap-2" role="list">
          {evidence.map((e, i) => (
            <li className="flex flex-col gap-1" key={e.label}>
              <SourceChip href={e.href} index={i + 1} kind={e.kind} label={e.label} />
              {e.quote && <blockquote className="border-l-2 border-outline-strong pl-2 text-body-sm text-on-surface-variant">{e.quote}</blockquote>}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/* ================================================================ AI run cell */

export type RunState = "idle" | "queued" | "running" | "done" | "failed" | "skipped";

/**
 * An AI column cell (Apollo's "Click to run", Clay's run states). Idle offers Run; queued
 * and running say so in words; done shows the value (with an optional confidence and
 * "Why?"); failed says why and offers Retry. Each state is text + icon, never colour alone.
 */
export function AiRunCell({
  state,
  value,
  error,
  confidence,
  evidence,
  onRun,
  runLabel = "Click to run",
}: {
  state: RunState;
  value?: ReactNode;
  error?: string;
  confidence?: Confidence;
  evidence?: Evidence[];
  onRun?: () => void;
  runLabel?: string;
}) {
  if (state === "idle")
    return (
      <Button className="-ml-2 text-on-surface-variant" onClick={onRun} size="xs" variant="ghost">
        <PlayIcon /> {runLabel}
      </Button>
    );
  if (state === "queued")
    return (
      <span className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant">
        <CircleIcon aria-hidden="true" className="size-3.5" /> Queued
      </span>
    );
  if (state === "running")
    return (
      <span className="inline-flex items-center gap-1.5 text-body-sm text-on-tertiary-container">
        <LoaderCircleIcon aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" /> Running…
      </span>
    );
  if (state === "failed")
    return (
      <span className="inline-flex min-w-0 items-center gap-1.5 text-body-sm text-error">
        <AlertCircleIcon aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="min-w-0">{error ?? "Failed"}</span>
        <Button aria-label="Retry" className="text-error" onClick={onRun} size="icon-xs" variant="ghost">
          <RotateCcwIcon />
        </Button>
      </span>
    );
  if (state === "skipped") return <span className="text-body-sm text-on-surface-tertiary">Not run: condition not met</span>;
  // The value wraps rather than truncating (it is the answer); confidence and "Why?" sit on
  // their own line so neither squeezes the value in a narrow column.
  const meta = (confidence && confidence !== "high") || evidence;
  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <span className="min-w-0 text-sm text-on-surface">{value}</span>
      {meta && (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {confidence && confidence !== "high" && <ConfidenceBadge level={confidence} />}
          {evidence && <EvidencePopover evidence={evidence} />}
        </span>
      )}
    </span>
  );
}

/**
 * Column-header progress for an AI column: how many rows have run, in words and as a
 * thin meter, plus a Run all / Pause control.
 */
export function AiColumnStatus({ done, failed = 0, total, running, onToggle }: { done: number; failed?: number; total: number; running?: boolean; onToggle?: () => void }) {
  const pct = total ? Math.round(((done + failed) / total) * 100) : 0;
  return (
    <span className="inline-flex items-center gap-2 font-normal normal-case">
      <span
        aria-label={`${done} of ${total} run${failed ? `, ${failed} failed` : ""}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={pct}
        className="relative h-1 w-12 overflow-hidden rounded-full bg-outline-strong"
        role="meter"
      >
        <span className="absolute inset-y-0 left-0 bg-tertiary" style={{ width: `${(done / Math.max(total, 1)) * 100}%` }} />
        <span className="absolute inset-y-0 bg-error" style={{ left: `${(done / Math.max(total, 1)) * 100}%`, width: `${(failed / Math.max(total, 1)) * 100}%` }} />
      </span>
      <span className="tabular-nums whitespace-nowrap">
        {done} of {total}
        {failed ? <span className="text-error">, {failed} failed</span> : null}
      </span>
      {onToggle && (
        <Button aria-label={running ? "Pause column" : "Run all rows"} onClick={onToggle} size="icon-xs" variant="ghost">
          {running ? <PauseIcon /> : <PlayIcon />}
        </Button>
      )}
    </span>
  );
}

/* ================================================================ Plan review */

export type PlanStep = { id: string; title: string; detail?: string; risky?: boolean };

/**
 * Plan-and-execute preview: ACE shows its steps before acting; people can reorder or
 * remove steps, then approve. Steps that touch other people or money are marked so the
 * approval is informed.
 */
export function PlanReview({ steps: initial, onApprove, onCancel, className }: { steps: PlanStep[]; onApprove?: (steps: PlanStep[]) => void; onCancel?: () => void; className?: string }) {
  const [steps, setSteps] = useState(initial);
  const move = (i: number, d: -1 | 1) =>
    setSteps((s) => {
      const n = [...s];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  return (
    <section className={cn("flex flex-col rounded-lg border border-edge bg-card", className)} data-slot="plan-review">
      <header className="flex items-center gap-2 px-4 pt-3 pb-2">
        <SparklesIcon aria-hidden="true" className="size-4 text-tertiary" />
        <h3 className="text-title-sm">ACE&apos;s plan</h3>
        <span className="text-body-sm text-on-surface-variant">{steps.length} steps. Nothing runs until you approve.</span>
      </header>
      <ol className="flex flex-col px-2 pb-2">
        {steps.map((s, i) => (
          <li className="group/step flex items-start gap-3 rounded-md px-2 py-2 hover:bg-surface-container-low" key={s.id}>
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-container tabular-nums leading-none font-medium text-xs text-on-surface-variant">{i + 1}</span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="flex flex-wrap items-center gap-2 text-sm">
                {s.title}
                {s.risky && <span className="rounded-full bg-warning-container px-2 text-label-md text-on-warning-container">Needs your OK</span>}
              </span>
              {s.detail && <span className="text-body-sm text-on-surface-variant">{s.detail}</span>}
            </div>
            <span className="flex items-center gap-0.5 opacity-60 group-hover/step:opacity-100 group-focus-within/step:opacity-100">
              <Button aria-label={`Move step ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)} size="icon-xs" variant="ghost">
                <ArrowUpIcon />
              </Button>
              <Button aria-label={`Move step ${i + 1} down`} disabled={i === steps.length - 1} onClick={() => move(i, 1)} size="icon-xs" variant="ghost">
                <ArrowDownIcon />
              </Button>
              <Button aria-label={`Remove step ${i + 1}`} disabled={steps.length === 1} onClick={() => setSteps((x) => x.filter((y) => y.id !== s.id))} size="icon-xs" variant="ghost">
                <Trash2Icon />
              </Button>
            </span>
          </li>
        ))}
      </ol>
      <footer className="flex justify-end gap-2 border-t border-outline-variant px-4 py-2.5">
        <Button onClick={onCancel} size="sm" variant="ghost">
          Cancel
        </Button>
        <Button onClick={() => onApprove?.(steps)} size="sm">
          Approve and run
        </Button>
      </footer>
    </section>
  );
}

/* ================================================================ Run steps */

export type RunStep = { id: string; title: string; state: "done" | "running" | "queued" | "failed"; detail?: ReactNode };

/** A run's progress, collapsed to "3 of 7 steps", expanding to each step. */
export function RunSteps({ title, steps, className }: { title: ReactNode; steps: RunStep[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const done = steps.filter((s) => s.state === "done").length;
  const failed = steps.some((s) => s.state === "failed");
  return (
    <div className={cn("rounded-lg border border-edge bg-card", className)} data-slot="run-steps">
      <button aria-expanded={open} className="state-layer [--state-hover:0.03] focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left outline-none" onClick={() => setOpen(!open)} type="button">
        {failed ? (
          <AlertCircleIcon aria-hidden="true" className="size-4 text-error" />
        ) : done === steps.length ? (
          <CheckIcon aria-hidden="true" className="size-4 text-success" />
        ) : (
          <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin text-tertiary motion-reduce:animate-none" />
        )}
        <span className="text-label-lg">{title}</span>
        <span className="ml-auto text-body-sm text-on-surface-variant tabular-nums">
          {failed ? "Stopped: " : ""}
          {done} of {steps.length} steps
        </span>
      </button>
      {open && (
        <ol className="flex flex-col gap-1 border-t border-outline-variant px-3 py-2">
          {steps.map((s) => (
            <li className="flex items-start gap-2 py-1 text-sm" key={s.id}>
              <span aria-hidden="true" className="mt-0.5">
                {s.state === "done" && <CheckIcon className="size-3.5 text-success" />}
                {s.state === "running" && <LoaderCircleIcon className="size-3.5 animate-spin text-tertiary motion-reduce:animate-none" />}
                {s.state === "queued" && <CircleIcon className="size-3.5 text-on-surface-tertiary" />}
                {s.state === "failed" && <AlertCircleIcon className="size-3.5 text-error" />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className={cn(s.state === "queued" && "text-on-surface-variant")}>
                  {s.title}
                  <span className="sr-only">, {s.state}</span>
                </span>
                {s.detail && <span className="text-body-sm text-on-surface-variant">{s.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
