"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
  CircleDashedIcon,
  ClockIcon,
  LockIcon,
  MinusIcon,
  PlaneIcon,
  RotateCcwIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useId, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { ApprovalStep, Approver, ApproverState } from "./cpq";
import { PersonAvatar, ServiceLogo } from "./identity";
import { StatusBadge, type StatusTone } from "./status-badge";

/*
  ApprovalPath (v0.7): one job, "Who still has to approve, and what's blocking?".
  · The answer first, in words: "2 of 6 approved · waiting on Pricing, Finance" or
    "Blocked: Legal returned it for context".
  · A segmented progress bar, one segment per approver (decorative; the sentence carries it).
  · Stages as a horizontal track with connectors once the path has 48rem; parallel approvers
    stack inside their stage. Narrower (a side panel, a phone), a vertical stepper.
  · Each approver is a compact row: avatar, name, role, status badge. The reason, note, channel
    and time are one click away (a disclosure on the row), not printed under every name.
*/

const STATE: Record<ApproverState, { word: string; tone: StatusTone; icon: LucideIcon; bar: string }> = {
  approved: { word: "Approved", tone: "success", icon: CheckCircle2Icon, bar: "bg-success" },
  conditional: { word: "Approved with conditions", tone: "success", icon: CheckCircle2Icon, bar: "bg-success" },
  pending: { word: "Deciding", tone: "progress", icon: ClockIcon, bar: "bg-primary" },
  waiting: { word: "Not started", tone: "neutral", icon: CircleDashedIcon, bar: "bg-surface-container-highest" },
  returned: { word: "Returned", tone: "warning", icon: RotateCcwIcon, bar: "bg-warning" },
  away: { word: "Out of office", tone: "warning", icon: PlaneIcon, bar: "bg-warning" },
  declined: { word: "Declined", tone: "error", icon: XCircleIcon, bar: "bg-error" },
  skipped: { word: "Not needed", tone: "neutral", icon: MinusIcon, bar: "bg-surface-container-highest" },
};

const DONE: ApproverState[] = ["approved", "conditional", "skipped"];
const BLOCKING: ApproverState[] = ["declined", "returned"];

export type ApprovalSummary = {
  approved: number;
  total: number;
  /** Roles still to decide, in route order (deduplicated). */
  waitingOn: string[];
  /** The approvers stopping the route (declined or returned), if any. */
  blockedBy: Approver[];
  complete: boolean;
  /** One sentence: the header's answer. */
  sentence: string;
};

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : xs.length === 2 ? `${xs[0]} and ${xs[1]}` : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

/** The answer to "who still has to approve, and what's blocking?" */
export function summarizeApprovals(stages: ApprovalStep[]): ApprovalSummary {
  const all = stages.flatMap((s) => s.approvers).filter((a) => a.state !== "skipped");
  const approved = all.filter((a) => a.state === "approved" || a.state === "conditional").length;
  const waitingOn = [...new Set(all.filter((a) => !DONE.includes(a.state) && !BLOCKING.includes(a.state)).map((a) => a.role))];
  const blockedBy = all.filter((a) => BLOCKING.includes(a.state));
  const complete = all.length > 0 && approved === all.length;
  let sentence: string;
  if (all.length === 0) sentence = "No approvals needed";
  else if (complete) sentence = `All ${all.length} approved`;
  else if (blockedBy.length) {
    const b = blockedBy[0];
    sentence = `Blocked: ${b.role} ${b.state === "declined" ? "declined" : "returned it"} · ${approved} of ${all.length} approved`;
  } else sentence = `${approved} of ${all.length} approved · waiting on ${list(waitingOn)}`;
  return { approved, total: all.length, waitingOn, blockedBy, complete, sentence };
}

type StageState = "done" | "current" | "blocked" | "upcoming";
function stageState(s: ApprovalStep, isCurrent: boolean): StageState {
  if (s.approvers.some((a) => BLOCKING.includes(a.state))) return "blocked";
  if (s.approvers.every((a) => DONE.includes(a.state))) return "done";
  return isCurrent ? "current" : "upcoming";
}

const STAGE_WORD: Record<StageState, string> = { done: "done", current: "in progress", blocked: "blocked", upcoming: "not started" };

function StageMarker({ state, n }: { state: StageState; n: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-[1] inline-flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-meta tabular-nums [&>svg]:size-3.5",
        state === "done" && "bg-success text-on-success",
        state === "current" && "bg-primary text-on-primary",
        state === "blocked" && "bg-error text-on-error",
        state === "upcoming" && "border border-outline bg-module text-on-surface-variant"
      )}
    >
      {state === "done" ? <CheckIcon /> : state === "blocked" ? <XIcon /> : n}
    </span>
  );
}

function ApproverRow({ a }: { a: Approver & { restricted?: boolean } }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const st = STATE[a.state];
  const hasDetail = Boolean(a.reason || a.note || a.channel || a.when);
  const name = a.restricted ? "Restricted approver" : a.name;
  const row = (
    <>
      {a.restricted ? (
        <span aria-hidden="true" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <LockIcon className="size-3.5" />
        </span>
      ) : (
        <PersonAvatar name={a.name} size="sm" />
      )}
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 @[48rem]/path:flex-col @[48rem]/path:items-start">
        <span className="flex min-w-0 flex-1 flex-col @[48rem]/path:w-full">
          <span className="line-clamp-2 text-label-lg text-on-surface [overflow-wrap:break-word]">{name}</span>
          <span className="line-clamp-2 text-meta text-on-surface-variant [overflow-wrap:break-word]">{a.role}</span>
        </span>
        <StatusBadge icon={st.icon} status={a.stateLabel ?? st.word} tone={st.tone} />
      </span>
      {hasDetail && <ChevronDownIcon aria-hidden="true" className={cn("mt-1.5 size-4 shrink-0 text-on-surface-variant transition-transform", open && "rotate-180")} />}
    </>
  );
  return (
    <li className="min-w-0" data-state={a.state}>
      {hasDetail ? (
        <button
          aria-controls={id}
          aria-expanded={open}
          aria-label={`${name}, ${a.role}, ${a.stateLabel ?? st.word}. ${open ? "Hide" : "Show"} details`}
          className="state-layer [--state-hover:0.04] focus-ring flex w-full min-w-0 items-start gap-2.5 rounded-md px-2 py-2 text-left outline-none"
          onClick={() => setOpen(!open)}
          type="button"
        >
          {row}
        </button>
      ) : (
        <div className="flex min-w-0 items-start gap-2.5 px-2 py-2">{row}</div>
      )}
      {hasDetail && (
        <div className="mx-2 mb-2 flex flex-col gap-1.5 rounded-md bg-inset px-3 py-2.5 text-body-md" hidden={!open} id={id}>
          {/* The row clamps long names and roles; the details always carry them in full. */}
          <p className="text-on-surface [overflow-wrap:break-word]">
            {name}
            <span className="text-on-surface-variant">, {a.role}</span>
          </p>
          {a.reason && (
            <p>
              <span className="text-on-surface-variant">Needed because </span>
              {a.reason.charAt(0).toLowerCase() + a.reason.slice(1)}
            </p>
          )}
          {a.note && <p className="text-on-surface">{a.note}</p>}
          {(a.channel || a.when) && (
            <p className="inline-flex flex-wrap items-center gap-1.5 text-meta text-on-surface-variant" data-meta="meta">
              {a.channel && (
                <>
                  <ServiceLogo service={a.channel} size={14} />
                  Decides in {a.channel}
                </>
              )}
              {a.channel && a.when && <span aria-hidden="true">·</span>}
              {a.when && <span>{a.when}</span>}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

export type ApprovalPathProps = {
  stages: (Omit<ApprovalStep, "approvers"> & { approvers: (Approver & { restricted?: boolean })[] })[];
  /** Hide the summary sentence and bar when the surrounding module already says it. */
  hideSummary?: boolean;
  className?: string;
};

export function ApprovalPath({ stages, hideSummary, className }: ApprovalPathProps) {
  const summary = summarizeApprovals(stages);
  const firstOpen = stages.findIndex((s) => !s.approvers.every((a) => DONE.includes(a.state)));
  const segments = stages.flatMap((s) => s.approvers).filter((a) => a.state !== "skipped");
  const blocked = summary.blockedBy.length > 0;
  return (
    <div className={cn("@container/path flex min-w-0 flex-col gap-4", className)} data-slot="approval-path">
      {!hideSummary && (
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-start gap-2 text-title-sm text-on-surface" data-slot="approval-summary" role="status">
            {blocked ? (
              <AlertTriangleIcon aria-hidden="true" className="mt-1 size-4 shrink-0 text-error" />
            ) : summary.complete ? (
              <CheckCircle2Icon aria-hidden="true" className="mt-1 size-4 shrink-0 text-success" />
            ) : null}
            <span className="min-w-0 [overflow-wrap:break-word]">{summary.sentence}</span>
          </p>
          {segments.length > 0 && (
            <div aria-hidden="true" className="flex h-1.5 gap-0.5" data-slot="approval-progress">
              {segments.map((a, i) => (
                <span className={cn("h-full flex-1 rounded-full", STATE[a.state].bar)} key={`${a.name}-${i}`} />
              ))}
            </div>
          )}
        </div>
      )}
      <ol aria-label="Approval stages" className="flex min-w-0 flex-col @[48rem]/path:grid @[48rem]/path:auto-cols-fr @[48rem]/path:grid-flow-col @[48rem]/path:gap-4">
        {stages.map((s, i) => {
          const state = stageState(s, i === firstOpen);
          const last = i === stages.length - 1;
          const parallel = s.mode === "parallel" && s.approvers.length > 1;
          return (
            <li
              aria-label={`Stage ${i + 1} of ${stages.length}: ${s.label}, ${STAGE_WORD[state]}`}
              className="relative grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 pb-4 last:pb-0 @[48rem]/path:flex @[48rem]/path:flex-col @[48rem]/path:gap-2 @[48rem]/path:pb-0"
              data-stage-state={state}
              key={s.id}
            >
              {/* Connector: down the marker column when vertical, across to the next stage when horizontal. */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-7 bottom-1 left-[11px] w-0.5 rounded-full @[48rem]/path:top-[11px] @[48rem]/path:right-[-1rem] @[48rem]/path:bottom-auto @[48rem]/path:left-8 @[48rem]/path:h-0.5 @[48rem]/path:w-auto",
                    state === "done" ? "bg-success" : "bg-outline-variant"
                  )}
                  data-slot="approval-connector"
                />
              )}
              <div className="contents @[48rem]/path:flex @[48rem]/path:items-center @[48rem]/path:gap-2">
                <StageMarker n={i + 1} state={state} />
                <div className="flex min-w-0 flex-col pt-0.5 @[48rem]/path:hidden">
                  <span className="text-title-sm text-on-surface">{s.label}</span>
                  {parallel && <span className="text-meta text-on-surface-variant">{s.approvers.length} at the same time</span>}
                </div>
              </div>
              <div className="col-start-2 flex min-w-0 flex-col @[48rem]/path:col-auto">
                <div className="hidden min-w-0 flex-col @[48rem]/path:flex">
                  <span className="line-clamp-2 text-title-sm text-on-surface [overflow-wrap:break-word]">{s.label}</span>
                  {parallel && <span className="text-meta text-on-surface-variant">{s.approvers.length} at the same time</span>}
                </div>
                <ul className={cn("-mx-2 mt-1 flex min-w-0 flex-col", parallel && "@[48rem]/path:rounded-lg @[48rem]/path:bg-inset @[48rem]/path:mx-0 @[48rem]/path:py-1")}>
                  {s.approvers.map((a) => (
                    <ApproverRow a={a} key={a.name + a.role} />
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ApprovalPathSkeleton({ stages = 3 }: { stages?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading approvals" className="@container/path flex flex-col gap-4" role="status">
      <Skeleton className="h-6 w-3/5" />
      <Skeleton className="h-1.5 w-full" />
      <div className="flex flex-col gap-4 @[48rem]/path:grid @[48rem]/path:grid-flow-col @[48rem]/path:auto-cols-fr">
        {Array.from({ length: stages }, (_, i) => (
          <div className="flex gap-3" key={i}>
            <Skeleton className="size-6 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
