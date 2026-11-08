"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useId, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { SaveStatus, type SaveState } from "./feedback";

/*
  DecisionPanel (v0.8): the decision the reader makes. The question at 20, a summary at 14,
  options as radio cards (label, consequence, Recommended, or why one is unavailable), an
  optional reason, and the actions. The panel is a sky feature module: sky means a decision.
  At wide widths the facts sit beside the options; narrow stacks them, and the actions stay
  at the bottom of the panel. The outcome is announced through SaveStatus.
*/

export type DecisionOption = {
  id: string;
  label: ReactNode;
  /** What choosing this does, in one sentence. */
  consequence: ReactNode;
  recommended?: boolean;
  /** Why this option can't be chosen. The words are shown; the radio is disabled. */
  disabled?: string;
};

export type DecisionResult = { optionId: string; reason?: string };

export type DecisionPanelProps = {
  question: ReactNode;
  summary?: ReactNode;
  options: DecisionOption[];
  /** A note the reader can leave with the decision. `required` gates the primary action. */
  reason?: { label: string; required?: boolean; placeholder?: string };
  primary: { label: ReactNode; onSelect?: (result: DecisionResult) => void };
  secondary?: { label: ReactNode; onClick?: () => void };
  /** The result of the decision: idle, saving, saved or error. Announced politely. */
  status?: SaveState;
  onRetry?: () => void;
  /** Facts beside the options at wide widths (a FactGrid, a list of checks). */
  aside?: ReactNode;
  /** The question's heading level. */
  as?: "h2" | "h3";
  className?: string;
};

export function DecisionPanel({
  question,
  summary,
  options,
  reason,
  primary,
  secondary,
  status = "idle",
  onRetry,
  aside,
  as: H = "h2",
  className,
}: DecisionPanelProps) {
  const questionId = useId();
  const reasonId = useId();
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const blocked = options.find((option) => option.id === value)?.disabled;
  const reasonMissing = !!reason?.required && note.trim() === "";
  const canDecide = value !== "" && !blocked && !reasonMissing;

  return (
    // The container is the wrapper: `.lark-module` already names its own container, so a
    // container query on the module itself would query the wrong name.
    <div className={cn("@container/decision min-w-0", className)} data-slot="decision-panel">
    <section
      aria-labelledby={questionId}
      className="lark-module flex min-w-0 flex-col rounded-module border border-primary/30 bg-module-feature-sky text-on-surface"
    >
      <div className="flex flex-col gap-1 px-module pt-module">
        <H className="text-title-module text-on-surface" id={questionId}>
          {question}
        </H>
        {summary && <p className="text-body-md text-on-surface-variant">{summary}</p>}
      </div>

      <div
        className="grid min-w-0 grid-cols-1 gap-module p-module @[40rem]/decision:grid-cols-[minmax(0,1fr)_18rem]"
        data-slot="decision-panel-grid"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <RadioGroupPrimitive.Root aria-labelledby={questionId} className="flex flex-col gap-2" onValueChange={setValue} value={value}>
            {options.map((option) => (
              <label
                className={cn(
                  "state-layer [--state-hover:0.03] flex cursor-pointer items-start gap-3 rounded-lg border bg-module p-3 text-on-surface has-[[data-state=checked]]:border-selected-border has-[[data-state=checked]]:bg-secondary-container",
                  option.disabled ? "cursor-default bg-inset text-on-surface-variant" : "border-edge"
                )}
                data-disabled={option.disabled ? "" : undefined}
                key={option.id}
              >
                <RadioGroupPrimitive.Item
                  className="focus-ring mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-outline bg-surface-container-lowest data-[state=checked]:border-on-surface"
                  disabled={!!option.disabled}
                  value={option.id}
                >
                  <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-on-surface" />
                </RadioGroupPrimitive.Item>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2 text-title-sm">
                    {option.label}
                    {option.recommended && <Badge variant="success">Recommended</Badge>}
                  </span>
                  <span className="text-body-md text-on-surface-variant">{option.consequence}</span>
                  {option.disabled && <span className="text-body-md text-on-surface-variant">Not available: {option.disabled}</span>}
                </span>
              </label>
            ))}
          </RadioGroupPrimitive.Root>

          {reason && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-body-md" htmlFor={reasonId}>
                {reason.label}
                {reason.required && (
                  <>
                    {" "}
                    <span className="font-normal text-on-surface-variant">Required</span>
                  </>
                )}
              </Label>
              <Textarea
                id={reasonId}
                onChange={(event) => setNote(event.target.value)}
                placeholder={reason.placeholder}
                required={reason.required}
                value={note}
              />
            </div>
          )}
        </div>

        {/* Inside the sky module, elevation is a change of fill: no edge on the nested block. */}
        {aside && (
          <aside className="relative min-w-0 self-start rounded-lg bg-module p-3" data-slot="decision-panel-aside">
            {aside}
          </aside>
        )}
      </div>

      <div
        className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-primary/20 bg-module-feature-sky px-module py-3"
        data-slot="decision-panel-actions"
      >
        <SaveStatus className="mr-auto" onRetry={onRetry} state={status} />
        {secondary && (
          <Button onClick={secondary.onClick} size="sm" type="button" variant="secondary">
            {secondary.label}
          </Button>
        )}
        <Button
          disabled={!canDecide}
          onClick={() => primary.onSelect?.({ optionId: value, reason: note.trim() || undefined })}
          size="sm"
          type="button"
        >
          {primary.label}
        </Button>
      </div>
    </section>
    </div>
  );
}
