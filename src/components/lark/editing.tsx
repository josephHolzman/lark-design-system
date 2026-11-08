"use client";

import { ArrowRightIcon, CheckIcon, PencilIcon, UndoIcon, XIcon } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ================================================================ InlineEdit */

/**
 * Beams' editable value: reads as text, hover shows a 32px box, click or Enter edits in
 * place. Enter or blur saves, Escape cancels. Validation errors stay in edit mode and are
 * announced. `dirty` shows the edited mark until the parent saves.
 */
export function InlineEdit({
  label,
  value,
  onCommit,
  validate,
  placeholder = "Add a value",
  format,
  mono,
  dirty,
  readOnly,
  className,
}: {
  /** Accessible name, e.g. the key in a key–value row. */
  label: string;
  value: string;
  onCommit: (next: string) => void;
  /** Return an error message to block the commit. */
  validate?: (next: string) => string | undefined;
  placeholder?: string;
  format?: (v: string) => ReactNode;
  mono?: boolean;
  dirty?: boolean;
  readOnly?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string>();
  const errId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    if (readOnly) return;
    setDraft(value);
    setError(undefined);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };
  const commit = () => {
    const err = validate?.(draft);
    if (err) {
      setError(err);
      return;
    }
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setEditing(false);
      setError(undefined);
    }
  };

  if (editing) {
    return (
      <span className={cn("flex min-w-0 flex-col gap-1", className)}>
        <input
          aria-describedby={error ? errId : undefined}
          aria-invalid={!!error || undefined}
          aria-label={label}
          className={cn(
            "h-8 w-full min-w-0 rounded-md border border-primary bg-surface-container-lowest px-2 text-sm outline-1 outline-primary aria-invalid:border-error aria-invalid:outline-error",
            mono && "font-mono text-[13px]"
          )}
          onBlur={commit}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          ref={inputRef}
          value={draft}
        />
        {error && (
          <span className="text-body-md text-error" id={errId} role="alert">
            {error}
          </span>
        )}
      </span>
    );
  }
  return (
    <button
      aria-label={readOnly ? undefined : `Edit ${label}: ${value || "empty"}`}
      className={cn(
        "group/edit state-layer [--state-hover:0.04] focus-ring -mx-2 flex min-h-8 w-[calc(100%+1rem)] min-w-0 items-center gap-2 rounded-md px-2 text-left text-sm outline-none",
        readOnly && "pointer-events-none",
        mono && "font-mono text-[13px]",
        className
      )}
      disabled={readOnly}
      onClick={start}
      type="button"
    >
      <span className={cn("min-w-0 flex-1 truncate", !value && "text-on-surface-tertiary")} title={!format && value ? value : undefined}>
        {value ? (format ? format(value) : value) : placeholder}
      </span>
      {dirty && <span aria-label="edited" className="size-1.5 shrink-0 rounded-full bg-warning" role="img" />}
      {!readOnly && <PencilIcon aria-hidden="true" className="size-3.5 shrink-0 text-on-surface-variant opacity-0 group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100" />}
    </button>
  );
}

/* ================================================================ DiffValue */

/** Old → new, the old value struck through. Text, not colour, says what changed. */
export function DiffValue({ from, to, className }: { from: ReactNode; to: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-1.5 tabular-nums", className)}>
      <del className="text-on-surface-tertiary decoration-on-surface-tertiary">
        <span className="sr-only">was </span>
        {from}
      </del>
      <ArrowRightIcon aria-hidden="true" className="size-3 self-center text-on-surface-tertiary" />
      <ins className="font-medium no-underline">
        <span className="sr-only">now </span>
        {to}
      </ins>
    </span>
  );
}

/* ================================================================ ChangeReview */

export type ProposedChange = {
  id: string;
  field: ReactNode;
  from: ReactNode;
  to: ReactNode;
  reason?: ReactNode;
  /** Who proposed it: a person or ACE. */
  by?: ReactNode;
};

const fieldText = (field: ReactNode) => (typeof field === "string" ? field : "this change");

/**
 * Review a set of proposed changes (an ACE revision, a counteroffer): accept or reject
 * each, or all, then apply. Decisions are reversible until applied. Nothing changes the
 * record until Apply.
 */
export function ChangeReview({
  title = "Proposed changes",
  changes,
  onApply,
  className,
}: {
  title?: ReactNode;
  changes: ProposedChange[];
  onApply?: (accepted: string[]) => void;
  className?: string;
}) {
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "rejected" | undefined>>({});
  const accepted = changes.filter((c) => decisions[c.id] === "accepted").map((c) => c.id);
  const pending = changes.filter((c) => !decisions[c.id]).length;
  const set = (id: string, d: "accepted" | "rejected" | undefined) => setDecisions((s) => ({ ...s, [id]: d }));
  return (
    <section className={cn("@container/change flex flex-col rounded-lg border border-edge bg-card", className)} data-slot="change-review">
      <header className="flex flex-wrap items-center gap-2 px-4 py-3">
        <h3 className="text-title-sm">{title}</h3>
        <span className="text-meta text-on-surface-variant">
          {pending ? `${pending} to review` : "All reviewed"}
        </span>
      </header>
      <ul className="divide-y divide-outline-variant border-t border-outline-variant" role="list">
        {changes.map((c) => {
          const d = decisions[c.id];
          return (
            <li
              className={cn(
                "grid gap-x-4 gap-y-1 px-4 py-3 @[36rem]/change:grid-cols-[10rem_1fr_auto] @[36rem]/change:items-center",
                d === "accepted" && "bg-success-container/40",
                d === "rejected" && "bg-surface-container-low"
              )}
              key={c.id}
            >
              <span className="text-label-lg text-on-surface-tertiary">{c.field}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <DiffValue from={c.from} to={c.to} />
                {(c.reason || c.by) && (
                  <span className="text-meta text-on-surface-variant">
                    {c.by}
                    {c.by && c.reason && " · "}
                    {c.reason}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1 justify-self-start @[36rem]/change:justify-self-end">
                {d ? (
                  <>
                    <span className={cn("inline-flex items-center gap-1 text-label-lg", d === "accepted" ? "text-success" : "text-on-surface-variant")}>
                      {d === "accepted" ? <CheckIcon className="size-3.5" /> : <XIcon className="size-3.5" />}
                      {d === "accepted" ? "Accepted" : "Rejected"}
                    </span>
                    <Button aria-label={`Undo decision on ${fieldText(c.field)}`} onClick={() => set(c.id, undefined)} size="icon-xs" variant="ghost">
                      <UndoIcon />
                    </Button>
                  </>
                ) : (
                  <>
                    {/* The same two actions repeat per row: each names its field (WCAG 2.4.6). */}
                    <Button aria-label={`Reject ${fieldText(c.field)}`} onClick={() => set(c.id, "rejected")} size="xs" variant="ghost">
                      Reject
                    </Button>
                    <Button aria-label={`Accept ${fieldText(c.field)}`} onClick={() => set(c.id, "accepted")} size="xs" variant="secondary">
                      Accept
                    </Button>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <footer className="flex flex-wrap items-center gap-2 border-t border-outline-variant px-4 py-2.5">
        <span className="text-meta text-on-surface-variant">
          {accepted.length} of {changes.length} accepted
        </span>
        {/* v0.6: bulk decisions sit with the apply action in the footer, not in the header. */}
        <Button className="ml-auto" onClick={() => setDecisions(Object.fromEntries(changes.map((c) => [c.id, "rejected"])))} size="sm" variant="ghost">
          Reject all
        </Button>
        <Button onClick={() => setDecisions(Object.fromEntries(changes.map((c) => [c.id, "accepted"])))} size="sm" variant="secondary">
          Accept all
        </Button>
        <Button disabled={pending > 0} onClick={() => onApply?.(accepted)} size="sm">
          Apply {accepted.length ? accepted.length : ""} {accepted.length === 1 ? "change" : "changes"}
        </Button>
      </footer>
    </section>
  );
}
