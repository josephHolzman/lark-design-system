"use client";

/*
 * Lark chat states. Built from the ACE state library (deepgrids-ACE, 404 states): every state a
 * conversation with ACE can be in, as composable parts that sit on top of AI Elements
 * (Conversation, Message, PromptInput). Rules carried over from ACE:
 *  - Status is words, coloured by tone, with an icon when it is a warning or a stop.
 *  - One place to act: decisions sit in a tray with at most one primary button.
 *  - Sources appear once, at the end of an answer; each opens its excerpt in place.
 *  - Nothing is silently dropped: stopped, failed and uncertain work says what was kept.
 */

import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpRightIcon,
  BanIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDashedIcon,
  CircleHelpIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  FileWarningIcon,
  GitBranchIcon,
  HistoryIcon,
  LoaderCircleIcon,
  LockIcon,
  OctagonAlertIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  SquareIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";
import { type ComponentProps, type ReactNode, useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import { Callout } from "./feedback";
import { AceMark, PersonAvatar, ServiceLogo } from "./identity";
import { Illustration, type IllustrationSpec } from "./illustration";

/* ================================================================ shared */

/** A service ACE reads from or writes to: its logo (or a neutral mark), always beside its name. */
export function SystemMark({ system, className, size = 16 }: { system: string; className?: string; size?: number }) {
  return <ServiceLogo className={className} service={system} size={size} />;
}

/** The 720px conversation column. Answers may run wider (`wide`) for tables and drafts. */
export function ChatColumn({ wide, className, ...props }: ComponentProps<"div"> & { wide?: boolean }) {
  return <div className={cn("mx-auto flex w-full flex-col gap-6", wide ? "max-w-[960px]" : "max-w-[720px]", className)} data-slot="chat-column" {...props} />;
}

/** "Today 9:41 AM" between turns. */
export function TimeDivider({ children }: { children: ReactNode }) {
  return (
    <p data-meta="divider" className="flex items-center gap-3 text-meta-strong text-on-surface-tertiary before:h-px before:flex-1 before:bg-outline-faint after:h-px after:flex-1 after:bg-outline-faint" role="separator">
      {children}
    </p>
  );
}

/* ================================================================ turns */

export type UserTurnStatus = "sending" | "sent" | "failed" | "queued";

/**
 * The person's message: right-aligned, in a sky bubble (radius 24) with who and when inside it,
 * Cohere's shape. Sky is the person's colour (sky acts); ACE speaks in stone blocks. 16/24 text,
 * like ACE's words. Delivery status only when it isn't simply sent. Editing an earlier message
 * starts a branch (see BranchSwitcher).
 */
export function UserTurn({
  children,
  status = "sent",
  author = "You",
  time,
  attachments,
  onRetry,
  onEdit,
  branch,
  className,
}: {
  children: ReactNode;
  status?: UserTurnStatus;
  /** Who wrote it. "You" by default; a name in shared conversations. */
  author?: string;
  time?: string;
  attachments?: ReactNode;
  onRetry?: () => void;
  onEdit?: () => void;
  branch?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group/user flex flex-col items-end gap-1.5", className)} data-slot="user-turn" data-status={status}>
      {attachments && <div className="flex max-w-[85%] flex-wrap justify-end gap-2">{attachments}</div>}
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-0.5 rounded-2xl px-4 py-3",
          status === "queued" ? "border border-dashed border-outline text-on-surface" : "bg-primary-container text-on-primary-container",
          status === "failed" && "ring-1 ring-error"
        )}
        data-slot="user-bubble"
      >
        <p data-meta="timestamp" className="flex items-baseline gap-2 text-meta">
          <span className="text-meta-strong">{author}</span>
          {time && status === "sent" && <time className="text-on-surface-variant">{time}</time>}
        </p>
        <div className={cn("text-body-lg whitespace-pre-wrap", status === "sending" && "text-on-surface-variant")}>{children}</div>
      </div>
      {(branch || status !== "sent" || onEdit) && (
        <div className="flex min-h-6 items-center gap-1.5 text-meta text-on-surface-variant">
          {branch}
          {status === "sending" && (
            <span className="inline-flex items-center gap-1" role="status">
              <LoaderCircleIcon aria-hidden className="size-3.5 animate-spin motion-reduce:animate-none" /> Sending
            </span>
          )}
          {status === "queued" && (
            <span className="inline-flex items-center gap-1">
              <ClockIcon aria-hidden className="size-3.5" /> Queued, sends when ACE finishes
            </span>
          )}
          {status === "failed" && (
            <span className="inline-flex items-center gap-1.5 text-error" role="alert">
              <XCircleIcon aria-hidden className="size-3.5" /> Not sent.
              {onRetry && (
                <button className="link-default focus-ring rounded-[2px] text-error outline-none" onClick={onRetry} type="button">
                  Try again
                </button>
              )}
            </span>
          )}
          {onEdit && status === "sent" && (
            <Button aria-label="Edit message" className="opacity-0 group-focus-within/user:opacity-100 group-hover/user:opacity-100 pointer-coarse:opacity-100" onClick={onEdit} size="icon-xs" variant="ghost">
              <PencilIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * One of ACE's blocks: stone fill, radius 24, no edge (Cohere: elevation by fill, not lines).
 * ACE always speaks in these; the person speaks in a sky bubble. AnswerView is the same block
 * holding white cards. Use it for anything ACE says outside an answer (a thinking state, a note).
 */
export function TurnBlock({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-col gap-2 rounded-2xl bg-inset px-4 py-3", className)} data-slot="turn-block" {...props} />;
}

/**
 * ACE's turn, built like Cohere's agent replies but on the left: a stack of stone blocks.
 *  1. The first block says who and how: the mark, "ACE", an "AI" badge so nobody mistakes it for
 *     a colleague, the time; then `process` (Reasoning, WorkLog) closed; then `lead`, ACE's
 *     words at 16/24 (one sentence before an answer, or the whole reply when there's no answer).
 *  2. `children`: the answer (AnswerView, itself a block), drafts, sources.
 *  3. `actions` (copy, feedback) under the blocks.
 * Don't write "Here's what I found": say what ACE checked or concluded.
 */
export function AssistantTurn({
  children,
  actions,
  agent,
  process,
  lead,
  className,
}: {
  children?: ReactNode;
  actions?: ReactNode;
  agent?: { name?: string; time?: string; mark?: ReactNode };
  /** How ACE worked it out: Reasoning and WorkLog, closed by default. */
  process?: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 text-body-md text-on-surface", className)} data-slot="assistant-turn">
      {(agent || process || lead) && (
        <TurnBlock>
          {agent && (
            <div className="flex min-h-6 items-center gap-2 text-meta" data-slot="assistant-turn-header">
              {agent.mark ?? <AceMark size="sm" />}
              <span className="text-label-lg text-on-surface">{agent.name ?? "ACE"}</span>
              <Badge variant="ai">AI</Badge>
              {agent.time && <time className="text-on-surface-variant">{agent.time}</time>}
            </div>
          )}
          {process && <div className="flex flex-col gap-0.5" data-slot="assistant-turn-process">{process}</div>}
          {lead && (
            <div className="flex flex-col gap-2 text-body-lg text-on-surface" data-slot="assistant-turn-lead">
              {lead}
            </div>
          )}
        </TurnBlock>
      )}
      {children}
      {actions && <div className="-ml-1.5 flex items-center gap-0.5">{actions}</div>}
    </div>
  );
}

/** "2 of 3" for a message that was edited: each edit is a branch; older branches stay readable. */
export function BranchSwitcher({ index, total, onPrevious, onNext }: { index: number; total: number; onPrevious?: () => void; onNext?: () => void }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-meta text-on-surface-variant" data-slot="branch-switcher">
      <GitBranchIcon aria-hidden className="mr-1 size-3.5" />
      <Button aria-label="Previous version" disabled={index <= 1} onClick={onPrevious} size="icon-xs" variant="ghost">
        <ChevronLeftIcon />
      </Button>
      <span aria-live="polite" className="tabular-nums">
        {index} of {total}
      </span>
      <Button aria-label="Next version" disabled={index >= total} onClick={onNext} size="icon-xs" variant="ghost">
        <ChevronRightIcon />
      </Button>
    </span>
  );
}

/* ================================================================ working */

/**
 * ACE is working: the mark breathes beside a word. Static under reduced motion. Say what is
 * happening when it is known ("Reading the Northwind quote"), not just "Thinking".
 */
export function ThinkingRow({ label = "Thinking", detail, className }: { label?: ReactNode; detail?: ReactNode; className?: string }) {
  return (
    <div aria-live="polite" className={cn("flex items-center gap-2 text-body-md", className)} data-slot="thinking" role="status">
      <AceMark motion="spin" size="xs" />
      <span className="text-on-surface-variant">{label}</span>
      {detail && <span className="text-on-surface-tertiary">{detail}</span>}
    </div>
  );
}

export type ToolCallState = "queued" | "running" | "done" | "failed" | "awaiting-approval" | "skipped";

const TOOL_WORD: Record<ToolCallState, string> = {
  queued: "Waiting",
  running: "Running",
  done: "Done",
  failed: "Failed",
  "awaiting-approval": "Needs your OK",
  skipped: "Skipped",
};

export type ToolCall = {
  id: string;
  /** What ran, in words: "Read quote", "Search mail", "Check approval policy". */
  name: string;
  system?: string;
  state: ToolCallState;
  input?: ReactNode;
  output?: ReactNode;
  /** Failed: what happened and whether anything was kept. Skipped: why. */
  note?: ReactNode;
  duration?: string;
};

function ToolStateIcon({ state }: { state: ToolCallState }) {
  if (state === "running") return <LoaderCircleIcon aria-hidden className="size-3.5 animate-spin text-tertiary motion-reduce:animate-none" />;
  if (state === "done") return <CheckIcon aria-hidden className="size-3.5 text-on-surface-variant" />;
  if (state === "failed") return <XCircleIcon aria-hidden className="size-3.5 text-error" />;
  if (state === "awaiting-approval") return <ShieldAlertIcon aria-hidden className="size-3.5 text-warning" />;
  if (state === "skipped") return <BanIcon aria-hidden className="size-3.5 text-on-surface-tertiary" />;
  return <CircleDashedIcon aria-hidden className="size-3.5 text-on-surface-tertiary" />;
}

/** One tool call: service, what ran, its state in words; opens to show what was asked and what came back. */
export function ToolCallRow({ call }: { call: ToolCall }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const canOpen = !!(call.input || call.output || call.note);
  return (
    <li className="flex flex-col gap-1.5" data-slot="tool-call" data-state={call.state}>
      <button
        aria-controls={canOpen ? id : undefined}
        aria-expanded={canOpen ? open : undefined}
        className={cn(
          "focus-ring inline-flex min-h-6 w-fit max-w-full items-start gap-2 rounded-sm py-0.5 text-left text-body-md outline-none [&>svg]:mt-0.5 [&>[data-slot=service-logo]]:mt-0.5",
          canOpen ? "cursor-pointer hover:text-on-surface" : "cursor-default"
        )}
        onClick={() => canOpen && setOpen((o) => !o)}
        type="button"
      >
        <ToolStateIcon state={call.state} />
        {call.system && <SystemMark system={call.system} />}
        <span className="min-w-0 text-on-surface">{call.name}</span>
        <span
          className={cn(
            "shrink-0",
            call.state === "failed" ? "text-error" : call.state === "awaiting-approval" ? "text-on-warning-container" : call.state === "running" ? "text-tertiary" : "text-on-surface-tertiary"
          )}
        >
          {TOOL_WORD[call.state]}
          {call.duration && call.state === "done" ? `, ${call.duration}` : ""}
        </span>
        {canOpen && <ChevronRightIcon aria-hidden className={cn("size-3.5 shrink-0 text-on-surface-tertiary transition-transform", open && "rotate-90")} />}
      </button>
      {canOpen && (
        <dl className="ml-5.5 flex flex-col gap-2 rounded-lg bg-inset px-3 py-2.5 text-body-md" hidden={!open} id={id}>
          {call.input && (
            <div className="flex flex-col gap-0.5">
              <dt className="text-label-lg text-on-surface-tertiary">Asked</dt>
              <dd className="text-on-surface-variant">{call.input}</dd>
            </div>
          )}
          {call.output && (
            <div className="flex flex-col gap-0.5">
              <dt className="text-label-lg text-on-surface-tertiary">Result</dt>
              <dd className="text-on-surface-variant">{call.output}</dd>
            </div>
          )}
          {call.note && (
            <div className="flex flex-col gap-0.5">
              <dt className="text-label-lg text-on-surface-tertiary">{call.state === "skipped" ? "Why" : "What happened"}</dt>
              <dd className={call.state === "failed" ? "text-error" : "text-on-surface-variant"}>{call.note}</dd>
            </div>
          )}
        </dl>
      )}
    </li>
  );
}

/**
 * The public work log (ACE's "Compact / Expanded public work log"): collapsed to one line that
 * counts what happened, expandable to every tool call. Open while running so people can watch.
 */
export function WorkLog({ calls, title, defaultOpen, className }: { calls: ToolCall[]; title?: ReactNode; defaultOpen?: boolean; className?: string }) {
  const running = calls.some((c) => c.state === "running" || c.state === "queued");
  const failed = calls.filter((c) => c.state === "failed").length;
  const waiting = calls.filter((c) => c.state === "awaiting-approval").length;
  const done = calls.filter((c) => c.state === "done").length;
  const [open, setOpen] = useState(defaultOpen ?? running);
  const id = useId();
  const summary =
    title ??
    [
      running ? `Working, ${done} of ${calls.length} steps done` : `${done} of ${calls.length} steps done`,
      failed ? `${failed} failed` : null,
      waiting ? `${waiting} needs your OK` : null,
    ]
      .filter(Boolean)
      .join(", ");
  return (
    <div className={cn("flex flex-col gap-2", className)} data-slot="work-log">
      <button
        aria-controls={id}
        aria-expanded={open}
        className="focus-ring inline-flex min-h-6 w-fit items-center gap-1.5 rounded-sm text-body-md text-on-surface-variant outline-none hover:text-on-surface"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {running ? (
          <LoaderCircleIcon aria-hidden className="size-3.5 animate-spin text-tertiary motion-reduce:animate-none" />
        ) : failed ? (
          <AlertTriangleIcon aria-hidden className="size-3.5 text-error" />
        ) : (
          <HistoryIcon aria-hidden className="size-3.5" />
        )}
        {summary}
        <ChevronRightIcon aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-90")} />
      </button>
      <ol className="flex flex-col gap-1.5 border-l border-outline-variant pl-3" hidden={!open} id={id}>
        {calls.map((c) => (
          <ToolCallRow call={c} key={c.id} />
        ))}
      </ol>
    </div>
  );
}

/**
 * Text arriving token by token. While streaming, screen readers are not fed every token
 * (aria-busy); a polite "ACE finished" is announced once at the end.
 */
export function StreamingText({ children, streaming, className }: { children: ReactNode; streaming?: boolean; className?: string }) {
  return (
    <div aria-busy={streaming || undefined} className={cn("text-body-md text-on-surface [&_p+p]:mt-3", className)} data-slot="streaming-text">
      {children}
      {streaming && <span aria-hidden className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-[lark-caret_1s_steps(1)_infinite] bg-on-surface motion-reduce:animate-none" />}
      <span aria-live="polite" className="sr-only">
        {streaming ? "" : "ACE finished replying."}
      </span>
    </div>
  );
}

/**
 * After Stop: what was finished and kept, and how to pick it back up. `note` replaces the fixed
 * "Nothing was saved or sent" sentence when that isn't true (the server may finish and save the
 * answer after the person stops waiting); `onRetry` retries the same request ID.
 */
export function StoppedNotice({
  kept,
  note = "Nothing was saved or sent after that point.",
  onContinue,
  onRetry,
  retryLabel = "Try again",
  onDiscard,
}: {
  kept?: ReactNode[];
  /** The truth about what happened after Stop. */
  note?: ReactNode;
  onContinue?: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  onDiscard?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-inset px-4 py-3 text-sm" data-slot="stopped-notice" role="status">
      <p className="flex items-center gap-2 text-label-lg font-semibold">
        <SquareIcon aria-hidden className="size-3.5 fill-current" /> You stopped ACE
      </p>
      {kept && kept.length > 0 && (
        <>
          <p className="text-on-surface-variant">Finished before you stopped, and kept:</p>
          <ul className="list-disc pl-5 text-on-surface">
            {kept.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </>
      )}
      {note && <p className="text-on-surface-variant">{note}</p>}
      {(onContinue || onRetry || onDiscard) && (
        <div className="mt-1 flex flex-wrap gap-2">
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="secondary">
              <RotateCcwIcon /> {retryLabel}
            </Button>
          )}
          {onContinue && (
            <Button onClick={onContinue} size="sm" variant="secondary">
              <PlayIcon /> Continue from here
            </Button>
          )}
          {onDiscard && (
            <Button onClick={onDiscard} size="sm" variant="ghost">
              Discard partial work
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A reply that failed. Three parts, always: what happened, what is kept, what to do. Show the
 * request ID for support. Use `partial` when some steps finished (ACE "Partial run failure").
 */
export function ReplyError({
  title = "ACE couldn't finish this reply",
  children,
  kept,
  onRetry,
  requestId,
  partial,
  actions,
}: {
  title?: ReactNode;
  children: ReactNode;
  kept?: ReactNode;
  onRetry?: () => void;
  requestId?: string;
  partial?: boolean;
  actions?: ReactNode;
}) {
  return (
    <Callout
      actions={
        (onRetry || actions || requestId) && (
          <>
            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="secondary">
                <RotateCcwIcon /> {partial ? "Retry the failed step" : "Try again"}
              </Button>
            )}
            {actions}
            {requestId && <span className="font-mono text-meta text-on-surface-variant">Request {requestId}</span>}
          </>
        )
      }
      tone={partial ? "caution" : "critical"}
      title={title}
    >
      <p>{children}</p>
      {kept && <p className="mt-1 text-on-surface-variant">{kept}</p>}
    </Callout>
  );
}

/* ================================================================ evidence */

export type ChatSource = {
  id: string;
  /** "Opportunity OPP-20431" */
  label: string;
  system?: string;
  /** What this source contributed to the answer. */
  usedFor?: string;
  excerpt?: ReactNode;
  /** "Updated 2 min ago", "Version 3 of 4". */
  meta?: string;
  state?: "ok" | "stale" | "superseded" | "inaccessible" | "deleted";
  /**
   * v0.8: open the saved record somewhere else (the deal details) instead of its excerpt here.
   * Without it a source with an excerpt opens the excerpt in place.
   */
  onOpen?: () => void;
};

const SOURCE_STATE: Record<NonNullable<ChatSource["state"]>, { word: string; icon?: typeof LockIcon; cls: string }> = {
  ok: { word: "", cls: "" },
  stale: { word: "Out of date", icon: ClockIcon, cls: "text-on-warning-container" },
  superseded: { word: "Newer version exists", icon: FileWarningIcon, cls: "text-on-warning-container" },
  inaccessible: { word: "You can't open this", icon: LockIcon, cls: "text-on-surface-variant" },
  deleted: { word: "Deleted at the source", icon: Trash2Icon, cls: "text-error" },
};

/**
 * An inline citation, [1]. A button (not a hover-only card) that opens the source's excerpt,
 * so it works by keyboard and touch. The accessible name says which source it is.
 */
export function Cite({ n, source }: { n: number; source: ChatSource }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`Source ${n}: ${source.label}`}
          className="focus-ring hit-area mx-0.5 inline-flex h-5 min-w-5 -translate-y-px items-center justify-center rounded-[4px] bg-surface-container-high px-1 align-middle font-mono text-meta leading-none text-on-surface-variant outline-none hover:bg-surface-container-highest hover:text-on-surface"
          type="button"
        >
          {n}
        </button>
      </PopoverTrigger>
      <SourceDetail source={source} />
    </Popover>
  );
}

function SourceDetail({ source }: { source: ChatSource }) {
  const st = SOURCE_STATE[source.state ?? "ok"];
  return (
    <PopoverContent align="start" className="flex w-80 flex-col gap-2 p-3">
      <p className="flex items-center gap-2 text-label-lg">
        {source.system && <SystemMark system={source.system} />}
        {source.label}
      </p>
      {(source.system || source.meta) && <p data-meta="source" className="text-meta text-on-surface-variant">{[source.usedFor, source.system, source.meta].filter(Boolean).join(", ")}</p>}
      {st.word && <p data-meta="source" className={cn("inline-flex items-center gap-1.5 text-meta", st.cls)}>{st.icon && <st.icon aria-hidden className="size-3.5" />}{st.word}</p>}
      {source.excerpt && <blockquote className="border-l-2 border-outline pl-3 text-sm text-on-surface">{source.excerpt}</blockquote>}
    </PopoverContent>
  );
}

/**
 * A highlighted claim tied to its source (v0.6, from Cohere's cited answers). The claim's words
 * get an iris tint (iris marks what ACE claims and where it came from) and end in the source
 * number, which is the cue that doesn't rely on colour; the whole claim is one button
 * that opens the source's excerpt, so it works by keyboard and touch. Use it for every figure
 * and decision-relevant fact in an answer (discount, ARR change, policy limit): a number with no
 * Claim around it has no source. The numbers come from the pricing engine, never from the model.
 */
export function Claim({ n, source, children }: { n: number; source: ChatSource; children: ReactNode }) {
  const problem = source.state && source.state !== "ok" ? SOURCE_STATE[source.state].word : "";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "focus-ring hit-area inline rounded-[4px] bg-tertiary-container/70 px-1 py-px text-left text-on-surface outline-none [box-decoration-break:clone] hover:bg-tertiary-container",
            problem && "bg-warning-container/70 hover:bg-warning-container"
          )}
          data-slot="claim"
          type="button"
        >
          {children}
          <sup className="ml-0.5 font-mono text-meta text-on-surface-variant">{n}</sup>
          <span className="sr-only">
            {`, source ${n}: ${source.label}`}
            {problem && `, ${problem}`}
          </span>
        </button>
      </PopoverTrigger>
      <SourceDetail source={source} />
    </Popover>
  );
}

/**
 * Sources, once, at the end of the answer (Cohere's citations): a stone block labelled
 * "Sources (3)", each source an iris-tinted card (iris marks what ACE claims and where it came
 * from, the same tint as a Claim). A card names the record, what it contributed and its service,
 * and opens its excerpt in place. Problems with a source are stated on its card in words.
 * Inside an AnswerView pass `className="bg-card"`: one step of fill per level.
 */
export function AnswerSources({
  sources,
  label = "Sources",
  collapsible,
  defaultOpen = false,
  className,
}: {
  sources: ChatSource[];
  label?: string;
  /** A disclosure ("Sources (3)" ▸), closed by default, so the answer reads first. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [shown, setShown] = useState(defaultOpen);
  const listId = useId();
  const visible = !collapsible || shown;
  return (
    // A group, not a region: an answer list can hold many of these, and landmarks must be unique.
    <div
      aria-label={`${label} (${sources.length})`}
      className={cn("flex min-w-0 flex-col gap-2 rounded-2xl bg-inset p-3", className)}
      data-slot="answer-sources"
      role="group"
    >
      {/* Not a heading: the group is labelled, and a fixed level would break the host page's outline. */}
      {collapsible ? (
        <button
          aria-controls={listId}
          aria-expanded={shown}
          className="focus-ring flex min-h-8 w-fit items-center gap-1.5 rounded-sm px-1 text-left text-label-lg text-on-surface outline-none hover:text-on-surface-variant"
          onClick={() => setShown(!shown)}
          type="button"
        >
          <ChevronRightIcon aria-hidden className={cn("size-4 text-on-surface-variant transition-transform", shown && "rotate-90")} />
          {label} ({sources.length})
        </button>
      ) : (
        <p aria-hidden className="flex min-h-8 items-center px-1 text-label-lg text-on-surface">
          {label} ({sources.length})
        </p>
      )}
      <ol className={cn("flex flex-col gap-2", !visible && "hidden")} id={listId}>
        {sources.map((s, i) => {
          const st = SOURCE_STATE[s.state ?? "ok"];
          const isOpen = open === s.id;
          const gone = s.state === "inaccessible" || s.state === "deleted";
          const canOpen = (!!s.excerpt || !!s.onOpen) && !gone;
          return (
            <li
              className={cn("flex flex-col rounded-lg", gone ? "bg-surface-container-high" : "bg-tertiary-container/60", canOpen && "has-[button:hover]:bg-tertiary-container")}
              data-slot="source-card"
              key={s.id}
            >
              <button
                aria-expanded={s.excerpt ? isOpen : undefined}
                className="focus-ring flex min-h-14 w-full items-start gap-3 rounded-lg p-3 text-left outline-none disabled:cursor-default"
                disabled={!canOpen}
                onClick={() => {
                  if (s.onOpen) s.onOpen();
                  else setOpen(isOpen ? null : s.id);
                }}
                type="button"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-container-lowest" data-slot="source-tile">
                  {s.system ? <SystemMark system={s.system} /> : <span className="font-mono text-meta text-on-surface-variant">{i + 1}</span>}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={cn("text-label-lg", gone ? "text-on-surface-variant" : "text-on-tertiary-container", s.state === "deleted" && "line-through")}>
                    <span className="mr-1.5 font-mono text-meta text-on-surface-variant">{i + 1}</span>
                    {s.label}
                  </span>
                  <span className="text-meta text-on-surface-variant">{[s.usedFor, s.system, s.meta].filter(Boolean).join(", ")}</span>
                  {st.word && (
                    <span className={cn("mt-1 inline-flex items-center gap-1 text-meta", st.cls)}>
                      {st.icon && <st.icon aria-hidden className="size-3.5" />}
                      {st.word}
                    </span>
                  )}
                </span>
                {canOpen &&
                  (s.onOpen ? (
                    <ArrowUpRightIcon aria-hidden className="mt-2 size-4 shrink-0 text-on-surface-variant" />
                  ) : (
                    <ChevronRightIcon aria-hidden className={cn("mt-2 size-4 shrink-0 text-on-surface-variant transition-transform", isOpen && "rotate-90")} />
                  ))}
              </button>
              {s.excerpt && isOpen && <blockquote className="mx-3 mb-3 ml-14 border-l-2 border-ai-border pl-3 text-sm text-on-surface">{s.excerpt}</blockquote>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Two sources disagree. Both values are shown with where they came from, a ≠ between them
 * and "Needs a decision", never a quiet footnote (ACE "Conflicting facts").
 */
export function ConflictCompare({
  label,
  items,
  footer,
  actions,
}: {
  label: ReactNode;
  items: { value: ReactNode; source: string; system?: string; detail?: ReactNode }[];
  footer?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-warning-container/60 p-3.5" data-slot="conflict">
      <p className="flex items-center gap-2 text-label-lg font-semibold text-on-warning-container">
        <AlertTriangleIcon aria-hidden className="size-4" /> {label}: needs a decision
      </p>
      <div className="grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
        {items.slice(0, 2).map((it, i) => (
          <div className="contents" key={i}>
            {i === 1 && (
              <span aria-label="does not match" className="mx-auto inline-flex size-7 items-center justify-center self-center rounded-full bg-warning text-on-warning" role="img">
                ≠
              </span>
            )}
            <div className="flex flex-col gap-1 rounded-md bg-surface-container-lowest p-3 ring-1 ring-warning/60">
              <span className="text-title-sm text-on-surface">{it.value}</span>
              <span className="flex items-center gap-1.5 text-meta text-on-surface-variant">
                {it.system && <SystemMark system={it.system} />}
                {it.source}
              </span>
              {it.detail && <span className="text-body-md text-on-surface-tertiary">{it.detail}</span>}
            </div>
          </div>
        ))}
      </div>
      {footer && <p className="text-sm text-on-surface-variant">{footer}</p>}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** ACE refused an instruction it found inside a document ("Ignored instruction in document"). */
export function InjectionNotice({ source, instruction, className }: { source: ReactNode; instruction: ReactNode; className?: string }) {
  return (
    <Callout className={className} icon={<ShieldAlertIcon />} tone="caution" title="I ignored an instruction inside a document">
      <p>
        {source} contains text that tried to tell ACE what to do: <q className="italic">{instruction}</q>
      </p>
      <p className="mt-1 text-on-surface-variant">ACE only takes instructions from you. The document was still used as evidence for the facts in it.</p>
    </Callout>
  );
}

/* ================================================================ asking and deciding */

/**
 * ACE needs one fact before it can continue. Choices are a radio list, never a sentence to
 * retype. "Ask later" defers without blocking other work. Answered and deferred states stay
 * in the thread so the record shows what was decided.
 */
export function ClarifyQuestion({
  prompt,
  options,
  state = "open",
  answer,
  onAnswer,
  onDefer,
  addressee,
  channel,
  why,
}: {
  prompt: ReactNode;
  options: string[];
  state?: "open" | "answered" | "deferred";
  answer?: string;
  onAnswer?: (value: string) => void;
  onDefer?: () => void;
  /** When the question goes to someone else (the deal owner). */
  addressee?: { name: string; role?: string };
  channel?: string;
  /** Why ACE is asking: what changes with the answer. */
  why?: ReactNode;
}) {
  const [value, setValue] = useState<string | undefined>(answer);
  const id = useId();
  if (state === "answered")
    return (
      <div className="flex items-start gap-2.5 rounded-lg bg-inset p-3 text-sm" data-slot="clarify" data-state="answered">
        <CheckCircle2Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
        <div className="flex flex-col gap-0.5">
          <p className="text-on-surface-variant">{prompt}</p>
          <p className="text-on-surface">
            Answered: <strong className="font-semibold">{answer}</strong>
          </p>
        </div>
      </div>
    );
  if (state === "deferred")
    return (
      <div className="flex items-start gap-2.5 rounded-lg bg-inset p-3 text-sm" data-slot="clarify" data-state="deferred">
        <ClockIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-on-surface-variant" />
        <div className="flex flex-col gap-0.5">
          <p className="text-on-surface-variant">{prompt}</p>
          <p className="text-on-surface">Asked later. ACE is working on the parts that don&apos;t depend on it.</p>
        </div>
      </div>
    );
  return (
    <fieldset className="flex flex-col gap-3 rounded-lg bg-primary-container/60 p-3.5" data-slot="clarify" data-state="open">
      <legend className="sr-only">{typeof prompt === "string" ? prompt : "Question from ACE"}</legend>
      <div className="flex items-start gap-2.5">
        <CircleHelpIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="flex flex-col gap-1">
          {addressee && (
            <p className="flex items-center gap-1.5 text-body-md text-on-surface-variant">
              <PersonAvatar name={addressee.name} size="xs" /> To {addressee.name}
              {addressee.role ? `, ${addressee.role}` : ""}
              {channel ? ` in ${channel}` : ""}
            </p>
          )}
          <p aria-hidden className="text-label-lg font-semibold" id={`${id}-q`}>
            {prompt}
          </p>
          {why && <p className="text-body-md text-on-surface-variant">{why}</p>}
        </div>
      </div>
      <RadioGroup aria-labelledby={`${id}-q`} className="gap-1 pl-6.5" onValueChange={setValue} value={value ?? ""}>
        {options.map((o, i) => (
          <label className="flex min-h-8 cursor-pointer items-center gap-2.5 rounded-md px-2 text-sm hover:bg-surface-container-lowest" htmlFor={`${id}-${i}`} key={o}>
            <RadioGroupItem id={`${id}-${i}`} value={o} />
            {o}
          </label>
        ))}
      </RadioGroup>
      <div className="flex flex-wrap items-center gap-2 pl-6.5">
        <Button disabled={!value} onClick={() => value && onAnswer?.(value)} size="sm">
          {addressee ? "Send question" : "Answer"}
        </Button>
        {onDefer && (
          <Button onClick={onDefer} size="sm" variant="ghost">
            Ask later
          </Button>
        )}
      </div>
    </fieldset>
  );
}

export type ReviewState = "pending" | "approved" | "declined" | "expired" | "duplicate";

/**
 * A gate before ACE acts on something outside the chat (save, send, create an order). Shows what
 * will happen and where; one primary. Expired (the record changed) and duplicate (already
 * decided elsewhere) are explicit states, not silent no-ops.
 */
export function ActionReview({
  title,
  children,
  state = "pending",
  approveLabel = "Approve",
  declineLabel = "Don't do this",
  onApprove,
  onDecline,
  onRefresh,
  decidedBy,
  system,
  approveDisabled,
  declineDisabled,
  describedBy,
  fields,
}: {
  title: ReactNode;
  children?: ReactNode;
  state?: ReviewState;
  approveLabel?: string;
  declineLabel?: string;
  onApprove?: () => void;
  onDecline?: () => void;
  onRefresh?: () => void;
  decidedBy?: string;
  system?: string;
  /** v0.8: the decision waits for prerequisites; the button stays visible and disabled. */
  approveDisabled?: boolean;
  declineDisabled?: boolean;
  /** Points both buttons at the field or note that explains what's missing. */
  describedBy?: string;
  /** A form slot below the explanation (the note a "Request changes" decision requires). */
  fields?: ReactNode;
}) {
  const decided = state !== "pending";
  const word = {
    pending: null,
    approved: { icon: CheckCircle2Icon, text: `Approved${decidedBy ? ` by ${decidedBy}` : ""}`, cls: "text-success" },
    declined: { icon: XCircleIcon, text: `Declined${decidedBy ? ` by ${decidedBy}` : ""}. Nothing was changed.`, cls: "text-on-surface-variant" },
    expired: { icon: ClockIcon, text: "This request is out of date: the record changed after ACE prepared it.", cls: "text-on-warning-container" },
    duplicate: { icon: CheckIcon, text: `Already decided${decidedBy ? ` by ${decidedBy}` : ""}. Nothing ran twice.`, cls: "text-on-surface-variant" },
  }[state];
  return (
    <div
      className={cn("flex flex-col gap-3 rounded-lg p-3.5", state === "pending" ? "bg-primary-container/60" : "bg-surface-container")}
      data-slot="action-review"
      data-state={state}
    >
      <p className="flex items-center gap-2 text-label-lg font-semibold">
        {system && <SystemMark system={system} />}
        {title}
      </p>
      {children && <div className="text-sm text-on-surface-variant">{children}</div>}
      {fields && <div className="flex flex-col gap-2">{fields}</div>}
      {decided && word ? (
        <div className="flex flex-col items-start gap-2">
          <p aria-live="polite" className={cn("flex items-start gap-1.5 text-sm", word.cls)}>
            <word.icon aria-hidden className="mt-0.5 size-4 shrink-0" /> {word.text}
          </p>
          {state === "expired" && onRefresh && (
            <Button onClick={onRefresh} size="sm" variant="secondary">
              Prepare it again
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button aria-describedby={describedBy} disabled={approveDisabled} onClick={onApprove} size="sm">
            {approveLabel}
          </Button>
          <Button aria-describedby={describedBy} disabled={declineDisabled} onClick={onDecline} size="sm" variant="ghost">
            {declineLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ================================================================ acting */

export type ReceiptState = "queued" | "running" | "saved" | "verifying" | "verified" | "uncertain" | "mismatch" | "failed";

const RECEIPT: Record<ReceiptState, { word: string; icon: typeof CheckIcon; cls: string; step: number; spin?: boolean }> = {
  queued: { word: "Queued", icon: ClockIcon, cls: "text-on-surface-variant", step: 0 },
  running: { word: "Saving", icon: LoaderCircleIcon, cls: "text-tertiary", step: 1, spin: true },
  saved: { word: "Saved, not yet checked", icon: CheckIcon, cls: "text-on-surface", step: 2 },
  verifying: { word: "Checking the saved record", icon: LoaderCircleIcon, cls: "text-tertiary", step: 2, spin: true },
  verified: { word: "Saved and verified", icon: CheckCircle2Icon, cls: "text-success", step: 3 },
  uncertain: { word: "Result unknown", icon: CircleHelpIcon, cls: "text-on-warning-container", step: 1 },
  mismatch: { word: "Saved, but it doesn't match", icon: AlertTriangleIcon, cls: "text-on-warning-container", step: 2 },
  failed: { word: "Not saved", icon: XCircleIcon, cls: "text-error", step: 1 },
};

/**
 * What happened when ACE wrote to another system: Sent → Saved → Verified (read back). The
 * uncertain state (the request went out, no answer came back) never retries on its own: it
 * tells people to check before trying again, so nothing is created twice.
 */
export function ActionReceipt({
  title,
  system,
  state,
  children,
  actions,
  time,
}: {
  title: ReactNode;
  system?: string;
  state: ReceiptState;
  children?: ReactNode;
  actions?: ReactNode;
  time?: string;
}) {
  const r = RECEIPT[state];
  const steps = ["Sent", "Saved", "Verified"];
  const bad = state === "failed" || state === "uncertain" || state === "mismatch";
  return (
    <div
      className={cn("flex flex-col gap-2.5 rounded-lg border p-3.5", bad ? (state === "failed" ? "border-error/70" : "border-warning") : "border-outline-variant", "bg-surface-container-lowest")}
      data-slot="action-receipt"
      data-state={state}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="flex min-w-0 flex-1 items-center gap-2 text-label-lg font-semibold">
          {system && <SystemMark system={system} />}
          <span className="min-w-0">{title}</span>
        </p>
        <p aria-live="polite" className={cn("flex items-center gap-1.5 text-sm", r.cls)}>
          <r.icon aria-hidden className={cn("size-4", r.spin && "animate-spin motion-reduce:animate-none")} /> {r.word}
        </p>
      </div>
      <ol aria-label="Progress" className="flex items-center gap-1.5 text-body-md">
        {steps.map((s, i) => {
          const reached = r.step > i || (state === "verified" && i === 2);
          const here = !reached && r.step === i && (state === "running" || state === "verifying");
          return (
            <li className="flex items-center gap-1.5" key={s}>
              {i > 0 && <span aria-hidden className={cn("h-px w-6", reached ? "bg-on-surface" : "bg-outline-variant")} />}
              <span className={cn(reached ? "text-on-surface" : here ? "text-tertiary" : "text-on-surface-tertiary")}>
                {reached ? <CheckIcon aria-hidden className="mr-0.5 inline size-3.5" /> : null}
                {s}
                <span className="sr-only">{reached ? ", done" : here ? ", in progress" : ", not yet"}</span>
              </span>
            </li>
          );
        })}
        {time && <li className="ml-auto text-on-surface-tertiary">{time}</li>}
      </ol>
      {children && <div className="text-sm text-on-surface-variant">{children}</div>}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export type DraftState = "draft" | "saving" | "saved" | "sending" | "sent" | "failed";

/**
 * A message ACE drafted (Outlook, Slack, Teams). Editable fields, the people it goes to,
 * external recipients flagged before send, and the send result in words.
 */
export function DraftCard({
  app,
  to,
  cc,
  subject,
  children,
  state = "draft",
  onSend,
  onSave,
  sendLabel,
  note,
}: {
  app: string;
  to: { name: string; email?: string; external?: boolean }[];
  cc?: { name: string; external?: boolean }[];
  subject?: string;
  children: ReactNode;
  state?: DraftState;
  onSend?: () => void;
  onSave?: () => void;
  sendLabel?: string;
  note?: ReactNode;
}) {
  const external = [...to, ...(cc ?? [])].filter((p) => p.external);
  const word: Partial<Record<DraftState, { text: string; cls: string; icon: typeof CheckIcon; spin?: boolean }>> = {
    saving: { text: "Saving draft", cls: "text-tertiary", icon: LoaderCircleIcon, spin: true },
    saved: { text: `Saved in ${app} drafts, not sent`, cls: "text-on-surface-variant", icon: CheckIcon },
    sending: { text: `Sending via ${app}`, cls: "text-tertiary", icon: LoaderCircleIcon, spin: true },
    sent: { text: `Sent via ${app}`, cls: "text-success", icon: CheckCircle2Icon },
    failed: { text: `${app} didn't accept it. Still a draft.`, cls: "text-error", icon: XCircleIcon },
  };
  const w = word[state];
  const locked = state === "sending" || state === "sent";
  return (
    <article aria-label={`Draft in ${app}${subject ? `: ${subject}` : ""}`} className="flex flex-col overflow-hidden rounded-lg border border-edge bg-surface-container-lowest" data-slot="draft-card" data-state={state}>
      <header className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-3.5 py-2 text-meta text-on-surface-variant">
        <SystemMark system={app} /> Draft in {app}
        {w && (
          <span aria-live="polite" className={cn("ml-auto inline-flex items-center gap-1", w.cls)}>
            <w.icon aria-hidden className={cn("size-3.5", w.spin && "animate-spin motion-reduce:animate-none")} /> {w.text}
          </span>
        )}
      </header>
      <dl className="grid grid-cols-[4rem_1fr] gap-x-2 gap-y-1.5 border-b border-outline-faint px-3.5 py-2.5 text-sm">
        <dt className="text-on-surface-tertiary">To</dt>
        <dd className="flex flex-wrap gap-1.5">
          {to.map((p) => (
            <span className={cn("inline-flex items-center gap-1 rounded-sm px-1.5", p.external ? "bg-warning-container text-on-warning-container" : "bg-surface-container")} key={p.name}>
              {p.name}
              {p.external && <span className="text-body-md">(external)</span>}
            </span>
          ))}
        </dd>
        {cc && cc.length > 0 && (
          <>
            <dt className="text-on-surface-tertiary">Cc</dt>
            <dd className="flex flex-wrap gap-1.5">
              {cc.map((p) => (
                <span className="rounded-sm bg-surface-container px-1.5" key={p.name}>
                  {p.name}
                </span>
              ))}
            </dd>
          </>
        )}
        {subject && (
          <>
            <dt className="text-on-surface-tertiary">Subject</dt>
            <dd className="text-on-surface">{subject}</dd>
          </>
        )}
      </dl>
      <div className="flex flex-col gap-3 px-3.5 py-3 text-sm text-on-surface">{children}</div>
      {external.length > 0 && !locked && (
        <div className="px-3.5 pb-3">
          <Callout tone="caution" title={`${external.length === 1 ? `${external[0].name} is` : `${external.length} people are`} outside your company`}>
            Check that nothing internal (margins, approval notes) is in the message before you send it.
          </Callout>
        </div>
      )}
      {!locked && (onSend || onSave || note) && (
        <footer className="flex flex-wrap items-center gap-2 border-t border-outline-variant bg-surface-container-low px-3.5 py-2.5">
          {note && <span className="mr-auto text-body-md text-on-surface-variant">{note}</span>}
          {onSave && (
            <Button disabled={state === "saving"} onClick={onSave} size="sm" variant="secondary">
              Save draft
            </Button>
          )}
          {onSend && (
            <Button onClick={onSend} size="sm">
              {sendLabel ?? `Send via ${app}`}
            </Button>
          )}
        </footer>
      )}
    </article>
  );
}

/* ================================================================ composer and around it */

/** Follow-ups typed while ACE is busy. They send in order; each can be edited or removed first. */
export function QueuedFollowUps({ items, onEdit, onRemove }: { items: { id: string; text: string }[]; onEdit?: (id: string) => void; onRemove?: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <section aria-label="Queued messages" className="flex flex-col gap-1 rounded-lg border border-dashed border-outline bg-surface-container-lowest p-2" data-slot="queued">
      <p className="px-1.5 text-label-lg text-on-surface-tertiary">Sends after ACE finishes ({items.length})</p>
      <ol className="flex flex-col">
        {items.map((it, i) => (
          <li className="flex min-h-8 items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-surface-container-low" key={it.id}>
            <span className="w-4 font-mono text-meta text-on-surface-tertiary">{i + 1}</span>
            <span className="min-w-0 flex-1">{it.text}</span>
            {onEdit && (
              <Button aria-label={`Edit: ${it.text}`} onClick={() => onEdit(it.id)} size="icon-xs" variant="ghost">
                <PencilIcon />
              </Button>
            )}
            {onRemove && (
              <Button aria-label={`Remove: ${it.text}`} onClick={() => onRemove(it.id)} size="icon-xs" variant="ghost">
                <Trash2Icon />
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export type AceMode = "guide" | "prepare" | "execute";

const MODES: { value: AceMode; label: string; detail: string }[] = [
  { value: "guide", label: "Guide", detail: "ACE explains; you do the work" },
  { value: "prepare", label: "Prepare for review", detail: "ACE drafts; you approve each change" },
  { value: "execute", label: "Execute within policy", detail: "ACE acts inside the limits you set" },
];

/**
 * How much ACE may do (ACE "Choose how ACE works"). Modes above the organisation's ceiling stay
 * visible, disabled, with the reason, so people know the option exists and who controls it.
 */
export function ModeSwitch({
  value,
  onValueChange,
  ceiling = "execute",
  ceilingReason = "Your organization doesn't allow this for this system.",
}: {
  value: AceMode;
  onValueChange: (m: AceMode) => void;
  ceiling?: AceMode;
  ceilingReason?: string;
}) {
  const order: AceMode[] = ["guide", "prepare", "execute"];
  const id = useId();
  return (
    <fieldset className="flex flex-col gap-1.5" data-slot="mode-switch">
      <legend className="mb-1 text-label-lg text-on-surface-variant">How ACE works here</legend>
      <RadioGroup className="gap-1" onValueChange={(v) => onValueChange(v as AceMode)} value={value}>
        {MODES.map((m) => {
          const blocked = order.indexOf(m.value) > order.indexOf(ceiling);
          return (
            <label
              className={cn(
                "flex items-start gap-2.5 rounded-md border px-2.5 py-2 text-sm",
                value === m.value ? "border-selected-border bg-secondary-container" : "border-transparent hover:bg-surface-container-low",
                blocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              )}
              htmlFor={`${id}-${m.value}`}
              key={m.value}
            >
              <RadioGroupItem className="mt-0.5" disabled={blocked} id={`${id}-${m.value}`} value={m.value} />
              <span className="flex flex-col">
                <span className="text-on-surface">{m.label}</span>
                <span className="text-body-md text-on-surface-variant">{blocked ? ceilingReason : m.detail}</span>
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}

const NOTICE_TONE = {
  info: "bg-surface-container text-on-surface",
  caution: "bg-warning-container text-on-warning-container",
  critical: "bg-error-container text-on-error-container",
  ai: "bg-tertiary-container text-on-tertiary-container",
} as const;

/**
 * One line above the composer about the conversation's situation: offline, rate limited,
 * read-only, ACE reading your screen, work continuing in the background.
 */
export function ComposerNotice({
  tone = "info",
  icon,
  children,
  action,
  live = true,
}: {
  tone?: keyof typeof NOTICE_TONE;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  live?: boolean;
}) {
  return (
    <div
      aria-live={live ? "polite" : undefined}
      className={cn("flex min-h-9 items-center gap-2 rounded-lg px-3 py-1.5 text-body-md", NOTICE_TONE[tone])}
      data-slot="composer-notice"
      role={live ? "status" : undefined}
    >
      {icon && <span aria-hidden className="shrink-0 [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {action}
    </div>
  );
}

/** ACE is reading the page in the person's browser. Always visible, always pausable. */
export function ScreenSessionNotice({ site, state, onPause, onResume, onStop }: { site: string; state: "reading" | "paused"; onPause?: () => void; onResume?: () => void; onStop?: () => void }) {
  return (
    <ComposerNotice
      action={
        <span className="flex gap-1">
          {state === "reading" ? (
            <Button onClick={onPause} size="xs" variant="secondary">
              <PauseIcon /> Pause
            </Button>
          ) : (
            <Button onClick={onResume} size="xs" variant="secondary">
              <PlayIcon /> Resume
            </Button>
          )}
          {onStop && (
            <Button onClick={onStop} size="xs" variant="ghost">
              Stop sharing
            </Button>
          )}
        </span>
      }
      icon={state === "reading" ? <EyeIcon /> : <EyeOffIcon />}
      tone={state === "reading" ? "ai" : "info"}
    >
      {state === "reading" ? (
        <>
          ACE can see <strong className="font-semibold">{site}</strong>. It reads; it doesn&apos;t click or type.
        </>
      ) : (
        <>Screen reading paused. ACE can&apos;t see {site}.</>
      )}
    </ComposerNotice>
  );
}

/** New messages arrived below while the person was reading higher up. Never jump the scroll. */
export function JumpToLatest({ count, onClick, className }: { count?: number; onClick?: () => void; className?: string }) {
  return (
    <Button className={cn("shadow-raised", className)} onClick={onClick} size="sm" variant="secondary">
      <ArrowDownIcon /> {count ? `${count} new ${count === 1 ? "update" : "updates"}` : "Jump to latest"}
    </Button>
  );
}

/* ================================================================ conversation list */

export type ConversationStatus = "running" | "needs-you" | "done" | "failed" | "idle" | "paused";

const CONV: Record<ConversationStatus, { word: string; icon?: typeof CheckIcon; cls: string; spin?: boolean }> = {
  running: { word: "Working", icon: LoaderCircleIcon, cls: "text-tertiary", spin: true },
  "needs-you": { word: "Needs you", icon: CircleHelpIcon, cls: "text-primary" },
  done: { word: "Done", cls: "text-on-surface-tertiary" },
  failed: { word: "Stopped with an error", icon: OctagonAlertIcon, cls: "text-error" },
  idle: { word: "", cls: "text-on-surface-tertiary" },
  paused: { word: "Paused", icon: PauseIcon, cls: "text-on-surface-variant" },
};

/**
 * A conversation in Recent (ACE "Recent conversations and live status"): title, account, live
 * status in words, and an unread dot for answers that arrived while away.
 */
export function ConversationListItem({
  title,
  meta,
  status = "idle",
  unread,
  current,
  href = "#",
  time,
  onSelect,
  disabled,
}: {
  title: string;
  meta?: string;
  status?: ConversationStatus;
  unread?: boolean;
  current?: boolean;
  href?: string;
  time?: string;
  /** v0.8: switch threads in place without a page load (the href stays for open-in-new-tab). */
  onSelect?: () => void;
  /** Block the switch (an answer is running); the row stays readable and the link is announced. */
  disabled?: boolean;
}) {
  const c = CONV[status];
  return (
    <a
      aria-current={current ? "page" : undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "focus-ring group flex min-h-12 items-start gap-2.5 rounded-md px-2.5 py-2 outline-none",
        current ? "bg-secondary-container" : "hover:bg-surface-container-low",
        disabled && "cursor-default opacity-60"
      )}
      data-slot="conversation-item"
      href={href}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        if (onSelect) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <span className="mt-1.5 flex size-2 shrink-0 items-center justify-center">
        {unread && <span className="size-2 rounded-full bg-primary" />}
        {unread && <span className="sr-only">Unread. </span>}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline gap-2">
          <span className={cn("min-w-0 flex-1 truncate text-sm", unread ? "font-semibold text-on-surface" : "text-on-surface")} title={title}>
            {title}
          </span>
          {time && <span className="shrink-0 text-meta text-on-surface-tertiary">{time}</span>}
        </span>
        <span className="flex items-center gap-1.5 text-meta">
          {meta && <span className="truncate text-on-surface-variant">{meta}</span>}
          {c.word && (
            <span className={cn("inline-flex shrink-0 items-center gap-1", c.cls)}>
              {c.icon && <c.icon aria-hidden className={cn("size-3.5", c.spin && "animate-spin motion-reduce:animate-none")} />}
              {c.word}
            </span>
          )}
        </span>
      </span>
    </a>
  );
}

/* ================================================================ start */

/**
 * The start of a conversation: what ACE can do here, suggested requests that are real buttons,
 * and work ACE already prepared (proactive tasks).
 */
export function ChatWelcome({
  title = "What do you need to prepare?",
  description,
  suggestions,
  onSuggestion,
  tasks,
  illustration,
  titleAs: Title = "h2",
}: {
  title?: ReactNode;
  description?: ReactNode;
  suggestions?: string[];
  onSuggestion?: (s: string) => void;
  tasks?: ReactNode;
  /** v0.8: a picture above the welcome. Decorative unless `alt`. */
  illustration?: IllustrationSpec;
  /** The new chat's title is the page h1; inside a panel it stays h2. Default "h2". */
  titleAs?: "h1" | "h2" | "h3";
  /**
   * No longer rendered (v0.9): Lark has no eyebrow above a title. Kept so callers from 0.8
   * still compile; the shell's breadcrumb says where you are.
   */
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center" data-slot="chat-welcome">
      {illustration && <Illustration {...illustration} className="max-w-96" />}
      <AceMark size="lg" />
      <div className="flex flex-col gap-1.5">
        <Title className="text-title-md text-on-surface">{title}</Title>
        {description && <p className="mx-auto max-w-[52ch] text-sm text-on-surface-variant">{description}</p>}
      </div>
      {suggestions && suggestions.length > 0 && (
        <ul aria-label="Suggested requests" className="flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <li key={s}>
              <Button onClick={() => onSuggestion?.(s)} size="sm" variant="secondary">
                {s}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {/* v0.7: sized by the space it has, not the viewport. Under 28rem (a side panel) the tasks
          are rows of one list; from 28rem they are cards, two up. */}
      {tasks && (
        <div className="@container/welcome w-full">
          <div className="grid w-full gap-2 text-left @max-[28rem]/welcome:gap-0 @max-[28rem]/welcome:divide-y @max-[28rem]/welcome:divide-outline-variant @max-[28rem]/welcome:border-y @max-[28rem]/welcome:border-outline-variant @[28rem]/welcome:grid-cols-2" data-slot="chat-welcome-tasks">
            {tasks}
          </div>
        </div>
      )}
    </div>
  );
}

/** A proactive task ACE prepared: what it is, why now, one action. */
export function ProactiveTask({ title, reason, meta, action, onAction, tone = "default" }: { title: string; reason: ReactNode; meta?: string; action: string; onAction?: () => void; tone?: "default" | "urgent" }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-edge bg-card p-4 @max-[28rem]/welcome:rounded-none @max-[28rem]/welcome:border-0 @max-[28rem]/welcome:bg-transparent @max-[28rem]/welcome:px-1 @max-[28rem]/welcome:py-3"
      data-slot="proactive-task"
    >
      <div className="flex items-start gap-2">
        <p className="line-clamp-2 min-w-0 flex-1 text-title-sm [overflow-wrap:break-word]">{title}</p>
        {tone === "urgent" && <Badge variant="warning">Due today</Badge>}
      </div>
      <p className="text-body-md text-on-surface-variant @max-[28rem]/welcome:line-clamp-2">{reason}</p>
      <div className="mt-auto flex items-center gap-2 pt-1">
        {meta && <span className="mr-auto text-meta text-on-surface-tertiary">{meta}</span>}
        <Button className="ml-auto" onClick={onAction} size="sm" variant="secondary">
          {action}
        </Button>
      </div>
    </div>
  );
}
