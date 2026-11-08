import { BanIcon, CheckIcon, MinusIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StepState = "todo" | "current" | "done" | "blocked" | "skipped";

export type Step = {
  id: string;
  title: ReactNode;
  /** One or two lines. For a blocked step, say why it's blocked and what unblocks it. */
  description?: ReactNode;
  state: StepState;
  /** A button or link for this step (usually only on the current one). */
  action?: ReactNode;
  /** v0.8: makes the step's title a button (a working bench picks the step it shows). */
  onSelect?: () => void;
};

export type StepListProps = Omit<ComponentProps<"ol">, "children"> & {
  steps: Step[];
  /** Default "vertical". Horizontal steps stack vertically under 640. */
  orientation?: "vertical" | "horizontal";
  /** Show the step number in the marker. Default true. */
  numbered?: boolean;
};

/** What a screen reader hears after the title. Visible state is the marker and the tone. */
export const STEP_STATE_LABEL: Record<StepState, string> = {
  todo: "Not started",
  current: "Current step",
  done: "Done",
  blocked: "Blocked",
  skipped: "Skipped",
};

const MARKER: Record<StepState, string> = {
  todo: "border border-outline bg-surface text-on-surface-variant",
  current: "bg-inverse-surface text-inverse-on-surface",
  done: "bg-success-container text-on-success-container",
  blocked: "bg-error-container text-on-error-container",
  skipped: "border border-dashed border-outline bg-surface text-on-surface-tertiary",
};

function Marker({ state, n, numbered }: { state: StepState; n: number; numbered: boolean }) {
  const glyph =
    state === "done" ? <CheckIcon className="size-3.5" /> : state === "blocked" ? <BanIcon className="size-3.5" /> : state === "skipped" ? <MinusIcon className="size-3.5" /> : numbered ? n : null;
  return (
    <span
      aria-hidden="true"
      className={cn("relative z-[1] inline-flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-meta leading-4 tabular-nums", MARKER[state])}
      data-slot="step-marker"
    >
      {glyph ?? <span className={cn("size-2 rounded-full", state === "current" ? "bg-inverse-on-surface" : "bg-outline")} />}
    </span>
  );
}

/**
 * Numbered steps with state: setup, onboarding, a check's stages. An ordered list; each step's
 * state is in words for screen readers ("Done", "Blocked"…), the current one has
 * aria-current="step". Done steps show a check and are never styled as current; blocked steps
 * show their reason in the description.
 */
export function StepList({ steps, orientation = "vertical", numbered = true, className, ...props }: StepListProps) {
  const horizontal = orientation === "horizontal";
  return (
    <ol
      className={cn("flex min-w-0 flex-col", horizontal ? "gap-4 sm:flex-row sm:gap-0" : "gap-0", className)}
      data-orientation={orientation}
      data-slot="step-list"
      {...props}
    >
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const muted = step.state === "todo" || step.state === "skipped";
        return (
          <li
            aria-current={step.state === "current" ? "step" : undefined}
            className={cn("relative flex min-w-0 gap-3", horizontal ? "sm:flex-1 sm:flex-col sm:gap-2 sm:pr-4" : "pb-5 last:pb-0")}
            data-state={step.state}
            key={step.id}
          >
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute bg-outline-variant",
                  horizontal ? "hidden sm:top-3 sm:left-8 sm:block sm:h-px sm:w-[calc(100%-40px)]" : "top-7 bottom-1 left-3 w-px",
                  step.state === "done" && "bg-success"
                )}
              />
            )}
            <Marker n={i + 1} numbered={numbered} state={step.state} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5 sm:pt-0">
              <span className={cn("text-title-sm", step.state === "current" ? "text-on-surface" : step.state === "skipped" ? "text-on-surface-tertiary" : muted ? "text-on-surface-variant" : "text-on-surface")}>
                {step.onSelect ? (
                  <button
                    aria-current={step.state === "current" ? "step" : undefined}
                    className="focus-ring rounded-sm text-left outline-none hover:underline"
                    onClick={step.onSelect}
                    type="button"
                  >
                    {step.title}
                    <span className="sr-only">, {STEP_STATE_LABEL[step.state]}</span>
                  </button>
                ) : (
                  <>
                    {step.title}
                    <span className="sr-only">, {STEP_STATE_LABEL[step.state]}</span>
                  </>
                )}
              </span>
              {step.description && (
                <span className={cn("text-body-md", step.state === "blocked" ? "text-on-error-container" : "text-on-surface-variant")}>{step.description}</span>
              )}
              {step.action && <div className="mt-2 flex flex-wrap items-center gap-2">{step.action}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
