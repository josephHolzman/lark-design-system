import { CheckIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PersonAvatar } from "./identity";
import { StatusBadge } from "./status-badge";

/* ---------------------------------------------------------------- StageProgress */

export type Stage = { label: string; description?: ReactNode };

export type StageProgressProps = Omit<ComponentProps<"ol">, "children"> & {
  stages: Stage[];
  /** Index of the current stage. Earlier stages are complete. Use stages.length when all are done. */
  current: number;
  orientation?: "horizontal" | "vertical";
};

/**
 * A stepper for a deal's journey (Understand → Prepare → Approve → Confirm). 24px
 * markers: filled with a check when complete, ringed when current (aria-current="step"),
 * hairline when not started. State is also given in words for screen readers.
 */
export function StageProgress({ stages, current, orientation = "horizontal", className, ...props }: StageProgressProps) {
  const vertical = orientation === "vertical";
  return (
    <ol
      className={cn("flex min-w-0", vertical ? "flex-col" : "flex-col gap-3 sm:flex-row sm:gap-0", className)}
      data-slot="stage-progress"
      {...props}
    >
      {stages.map((s, i) => {
        const state = i < current ? "complete" : i === current ? "current" : "upcoming";
        const last = i === stages.length - 1;
        return (
          <li
            aria-current={state === "current" ? "step" : undefined}
            className={cn("group/stage relative flex min-w-0 gap-2.5", !vertical && "sm:flex-1 sm:flex-col sm:gap-2 sm:pr-3")}
            data-state={state}
            key={s.label}
          >
            <div className={cn("flex items-center", vertical ? "flex-col self-stretch" : "sm:w-full")}>
              <span
                aria-hidden="true"
                className={cn(
                  "relative z-10 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-label-md tabular-nums",
                  state === "complete" && "bg-on-surface text-surface",
                  state === "current" && "border-2 border-on-surface bg-card text-on-surface",
                  state === "upcoming" && "border border-outline bg-card text-on-surface-variant"
                )}
              >
                {state === "complete" ? <CheckIcon className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "rounded-full",
                    vertical ? "my-1 w-0.5 flex-1" : "hidden h-0.5 flex-1 sm:mx-2 sm:block",
                    i < current ? "bg-on-surface" : "bg-outline-strong"
                  )}
                />
              )}
            </div>
            <div className={cn("flex min-w-0 flex-col pt-0.5", vertical ? !last && "pb-4" : "sm:pt-0")}>
              <span className={cn("text-label-lg", state === "upcoming" && "text-on-surface-variant")}>
                {s.label}
                <span className="sr-only">
                  {state === "complete" ? ", complete" : state === "current" ? ", current step" : ", not started"}
                </span>
              </span>
              {s.description && <span className="text-body-sm text-on-surface-variant">{s.description}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------------------------------------------------------- Timeline */

export type TimelineProps = ComponentProps<"ol">;

export function Timeline({ className, ...props }: TimelineProps) {
  return <ol className={cn("flex min-w-0 flex-col", className)} data-slot="timeline" {...props} />;
}

const DOT = {
  neutral: "bg-surface-container-highest text-on-surface-variant",
  primary: "bg-primary-container text-on-primary-container",
  success: "bg-success-container text-on-success-container",
  warning: "bg-warning-container text-on-warning-container",
  error: "bg-error-container text-on-error-container",
} as const;

export type TimelineItemProps = Omit<ComponentProps<"li">, "title"> & {
  icon?: ReactNode;
  tone?: keyof typeof DOT;
  title: ReactNode;
  description?: ReactNode;
  /** actor · revision · channel */
  meta?: ReactNode;
  /** ISO datetime and its printed form. */
  time?: { dateTime: string; label: string };
};

/** One event: 24px tonal icon on a rail, title, description, meta line, time. */
export function TimelineItem({ icon, tone = "neutral", title, description, meta, time, className, ...props }: TimelineItemProps) {
  return (
    <li className={cn("group/tl relative flex gap-3 pb-4 last:pb-0", className)} {...props}>
      <span
        aria-hidden="true"
        className="absolute top-7 bottom-1 left-3 w-px -translate-x-1/2 bg-outline-variant group-last/tl:hidden"
      />
      <span
        aria-hidden="true"
        className={cn("relative inline-flex size-6 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5", DOT[tone])}
      >
        {icon ?? <span className="size-1.5 rounded-full bg-current" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="min-w-0 flex-1 text-sm font-medium">{title}</span>
          {time && (
            <time className="shrink-0 text-body-sm text-on-surface-variant tabular-nums" dateTime={time.dateTime}>
              {time.label}
            </time>
          )}
        </div>
        {description && <p className="text-body-sm text-on-surface">{description}</p>}
        {meta && <p className="text-body-sm text-on-surface-variant">{meta}</p>}
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------- ApprovalChain */

export type ApprovalStepData = {
  title: string;
  approver: string;
  role: string;
  condition?: ReactNode;
  status: string;
  note?: ReactNode;
  /** e.g. "After Finance approves" */
  dependency?: ReactNode;
  sku?: string;
};

/** Numbered, ordered approvals with who, why and where each stands. */
export function ApprovalChain({ steps, className }: { steps: ApprovalStepData[]; className?: string }) {
  return (
    <ol className={cn("flex min-w-0 flex-col gap-2", className)} data-slot="approval-chain">
      {steps.map((s, i) => (
        <li className="flex min-w-0 gap-3 rounded-lg border border-outline-variant bg-card p-3" key={s.title}>
          <span
            aria-hidden="true"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-container tabular-nums leading-none font-medium text-xs text-on-surface-variant"
          >
            {i + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-title-sm">{s.title}</span>
              {s.sku && (
                <span className="rounded-md bg-surface-container-high px-1.5 py-0.5 font-mono text-[11px] leading-4 text-on-surface-variant">
                  {s.sku}
                </span>
              )}
              <StatusBadge className="ml-auto" status={s.status} />
            </div>
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <PersonAvatar name={s.approver} size="xs" />
              <span>
                <span className="text-on-surface">{s.approver}</span> · {s.role}
              </span>
            </div>
            {s.condition && <p className="text-body-sm text-on-surface-variant">{s.condition}</p>}
            {s.note && (
              <p className="rounded-md bg-surface-container-low px-2.5 py-1.5 text-body-sm text-on-surface">{s.note}</p>
            )}
            {s.dependency && <p className="text-body-sm text-on-surface-variant">{s.dependency}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
