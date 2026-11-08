"use client";

/*
 * Lark conversation chrome (v0.6): everything around ACE's answers.
 *  - ChatComposer: one rounded surface (Cohere North): the message, then attach, sources, mode and
 *    send. Enter sends, Shift+Enter starts a new line. Stop replaces send while ACE replies.
 *  - Reasoning: "Thought for 6s", closed by default; opens to the steps ACE took and the records
 *    each step looked at (logo + name).
 *  - SuggestionChips: follow-ups after an answer.
 *  - ChatLayout: the full-page thread with the composer docked at the bottom of the column.
 *  - ChatPanel: the same conversation docked beside a page (record, quote) at 400–440px.
 * Built on Lark primitives only (no AI Elements), so every app can use it.
 */

import {
  BrainIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleIcon,
  CopyIcon,
  FileTextIcon,
  LoaderCircleIcon,
  Maximize2Icon,
  PaperclipIcon,
  RefreshCcwIcon,
  SquareIcon,
  SquarePenIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react";
import { type FormEvent, type KeyboardEvent, type ReactNode, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { AceMode } from "./chat";
import { AceMark, ServiceLogo } from "./identity";

/* ================================================================ composer */

const MODE_LABEL: Record<AceMode, { short: string; detail: string }> = {
  guide: { short: "Guide", detail: "ACE explains; you do the work" },
  prepare: { short: "Prepare", detail: "ACE drafts; you approve each change" },
  execute: { short: "Execute", detail: "ACE acts inside the limits you set" },
};

export type ChatComposerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  /** Called with the trimmed message. The composer clears itself when uncontrolled. */
  onSubmit?: (text: string) => void;
  /** "streaming": ACE is replying; send becomes Stop. */
  status?: "ready" | "submitted" | "streaming";
  onStop?: () => void;
  placeholder?: string;
  /** Accessible name of the message field. */
  label?: string;
  mode?: AceMode;
  onModeChange?: (m: AceMode) => void;
  /** Modes above the organization's ceiling stay visible and disabled. */
  modeCeiling?: AceMode;
  /** Records ACE can use for this conversation ("3 sources"); opens the list. */
  sources?: { count: number; onClick?: () => void };
  onAttach?: () => void;
  /** Attachment chips above the message. */
  attachments?: ReactNode;
  disabled?: boolean;
  /** One quiet line under the composer. */
  note?: ReactNode;
  compact?: boolean;
  className?: string;
};

/**
 * The message box. A single rounded surface on its own solid fill: attachments, the message (grows
 * to about eight lines, then scrolls), and a tool row: attach, sources, mode, then send on the right.
 */
export function ChatComposer({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  status = "ready",
  onStop,
  placeholder = "Ask ACE, or tell it what to prepare",
  label = "Message ACE",
  mode,
  onModeChange,
  modeCeiling = "execute",
  sources,
  onAttach,
  attachments,
  disabled,
  note = "ACE can make mistakes. Check the sources before you act.",
  compact,
  className,
}: ChatComposerProps) {
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const setText = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  const id = useId();
  const busy = status === "streaming" || status === "submitted";
  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || disabled || busy) return;
    onSubmit?.(t);
    if (value === undefined) setInner("");
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };
  const order: AceMode[] = ["guide", "prepare", "execute"];
  return (
    <div className={cn("flex flex-col gap-1.5", className)} data-slot="chat-composer">
      <form
        className={cn(
          "flex flex-col rounded-xl border border-outline-strong bg-surface-container-lowest transition-colors dark:bg-surface-container",
          "has-[textarea:focus-visible]:border-primary has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-ring",
          disabled && "opacity-70"
        )}
        onSubmit={send}
      >
        {attachments && <div className="flex flex-wrap gap-2 px-3 pt-3">{attachments}</div>}
        <label className="sr-only" htmlFor={id}>
          {label}
        </label>
        <textarea
          className={cn(
            "max-h-48 w-full resize-none bg-transparent px-3.5 pt-3 text-sm text-on-surface outline-none [field-sizing:content] placeholder:text-on-surface-tertiary pointer-coarse:text-base",
            compact ? "min-h-10" : "min-h-12"
          )}
          disabled={disabled}
          id={id}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          rows={1}
          value={text}
        />
        <div className="flex items-center gap-1 px-2 pt-1 pb-2">
          {onAttach && (
            <Button aria-label="Attach files" disabled={disabled} onClick={onAttach} size="icon-sm" type="button" variant="ghost">
              <PaperclipIcon />
            </Button>
          )}
          {sources && (
            <Button disabled={disabled} onClick={sources.onClick} size="sm" type="button" variant="ghost">
              <FileTextIcon />
              {sources.count} {sources.count === 1 ? "source" : "sources"}
            </Button>
          )}
          {mode && onModeChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label={`Mode: ${MODE_LABEL[mode].short}`} disabled={disabled} size="sm" type="button" variant="ghost">
                  {MODE_LABEL[mode].short}
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel>How much ACE may do</DropdownMenuLabel>
                <DropdownMenuRadioGroup onValueChange={(v) => onModeChange(v as AceMode)} value={mode}>
                  {order.map((m) => {
                    const above = order.indexOf(m) > order.indexOf(modeCeiling);
                    return (
                      <DropdownMenuRadioItem className="items-start" disabled={above} key={m} value={m}>
                        <span className="flex flex-col">
                          <span>{MODE_LABEL[m].short}</span>
                          <span className="text-body-md text-on-surface-variant">{above ? "Not allowed by your organization" : MODE_LABEL[m].detail}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span className="ml-auto" />
          {busy ? (
            <Button aria-label="Stop" onClick={onStop} size="icon" type="button" variant="secondary">
              <SquareIcon className="fill-current" />
            </Button>
          ) : (
            <Button aria-label="Send" disabled={disabled || !text.trim()} size="icon" type="submit">
              <ArrowUpIcon />
            </Button>
          )}
        </div>
      </form>
      {note && <p className="px-2 text-center text-body-md text-on-surface-variant">{note}</p>}
    </div>
  );
}

/* ================================================================ reasoning */

export type ReasoningStep = {
  label: string;
  detail?: string;
  state?: "complete" | "active" | "pending";
  /** Records the step looked at. */
  results?: Array<{ label: string; system?: string }>;
};

/**
 * How ACE got there: "Thought for 6s", closed by default. Opens to the steps in order, each with
 * the records it read. While ACE is still thinking it says so and stays open.
 */
export function Reasoning({ duration, text, steps = [], streaming, defaultOpen }: { duration?: string; text?: string; steps?: ReasoningStep[]; streaming?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? !!streaming);
  const id = useId();
  const label = streaming ? "Thinking" : duration ? `Thought for ${duration}` : "How ACE worked this out";
  return (
    <div className="flex flex-col gap-2" data-slot="reasoning">
      <button
        aria-controls={id}
        aria-expanded={open}
        className="focus-ring inline-flex min-h-6 w-fit items-center gap-1.5 rounded-sm text-body-md text-on-surface-variant outline-none hover:text-on-surface"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {/* The same shape as WorkLog's trigger: what it is, then a trailing chevron. */}
        {streaming ? <AceMark motion="spin" size="xs" /> : <BrainIcon aria-hidden className="size-3.5" />}
        <span aria-live={streaming ? "polite" : undefined}>{label}</span>
        <ChevronRightIcon aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-90")} />
      </button>
      <div className="border-l-2 border-outline-variant pl-3.5" hidden={!open} id={id}>
        {text && <p className="mb-2 text-body-md text-on-surface-variant">{text}</p>}
        {steps.length > 0 && (
          <ol className="flex flex-col gap-2.5">
            {steps.map((s, i) => (
              <li className="flex gap-2.5" key={`${s.label}-${i}`}>
                <span aria-hidden className="mt-0.5 shrink-0 text-on-surface-variant">
                  {s.state === "active" ? <LoaderCircleIcon className="size-3.5 animate-spin motion-reduce:animate-none" /> : s.state === "pending" ? <CircleIcon className="size-3.5" /> : <CheckIcon className="size-3.5 text-success" />}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-body-md text-on-surface">
                    {s.label}
                    <span className="sr-only">, {s.state === "active" ? "in progress" : s.state === "pending" ? "not started" : "done"}</span>
                  </span>
                  {s.detail && <span className="text-body-md text-on-surface-variant">{s.detail}</span>}
                  {s.results?.length ? (
                    <ul aria-label="Records read" className="flex flex-wrap gap-1.5">
                      {s.results.map((r) => (
                        <li className="inline-flex h-6 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-2 text-body-md text-on-surface" key={r.label}>
                          {r.system && <ServiceLogo service={r.system} size={12} />}
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/* ================================================================ suggestions */

/** Follow-ups after an answer: real buttons that send the suggestion. */
export function SuggestionChips({ items, onPick, label = "Suggested follow-ups", className }: { items: string[]; onPick?: (s: string) => void; label?: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-2", className)} data-slot="suggestion-chips">
      {items.map((s) => (
        <li key={s}>
          <button
            className="focus-ring state-layer [--state-hover:0.04] inline-flex min-h-8 items-center rounded-md border border-outline-strong bg-surface-container-lowest px-2.5 py-1 text-left text-label-lg text-on-surface outline-none dark:bg-surface-container"
            onClick={() => onPick?.(s)}
            type="button"
          >
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ================================================================ layouts */

/**
 * Full-page chat: the thread scrolls in a 760px column; the composer is docked at the bottom on
 * its own solid surface and the thread's end clears it. `header` sits above the thread.
 */
export function ChatLayout({ header, children, composer, className }: { header?: ReactNode; children: ReactNode; composer: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col bg-surface", className)} data-slot="chat-layout">
      {header}
      <div aria-label="Conversation" className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-6" role="region" tabIndex={0}>
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8">{children}</div>
      </div>
      <div className="shrink-0 bg-surface px-4 pt-2 pb-3 md:px-6">
        <div className="mx-auto w-full max-w-[760px]">{composer}</div>
      </div>
    </div>
  );
}

/**
 * The conversation docked beside a page: a 400–440px column with its own header (the ACE mark,
 * what it's working on, new chat, open full page, close), the thread and the composer. Answers
 * lay out by their own width, so the same widgets work here.
 */
export function ChatPanel({
  title = "ACE",
  context,
  onNewChat,
  fullPageHref,
  onClose,
  children,
  composer,
  className,
}: {
  title?: string;
  /** What ACE is working on: a record chip. */
  context?: ReactNode;
  onNewChat?: () => void;
  fullPageHref?: string;
  onClose?: () => void;
  children: ReactNode;
  composer: ReactNode;
  className?: string;
}) {
  const headId = useId();
  return (
    <section aria-labelledby={headId} className={cn("flex h-full min-h-0 w-full flex-col bg-surface", className)} data-slot="chat-panel">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
        <AceMark size="sm" />
        <h2 className="text-label-lg" id={headId}>
          {title}
        </h2>
        <span className="ml-auto flex items-center gap-0.5">
          {onNewChat && (
            <Button aria-label="New chat" onClick={onNewChat} size="icon-sm" variant="ghost">
              <SquarePenIcon />
            </Button>
          )}
          {fullPageHref && (
            <Button aria-label="Open in full page" asChild size="icon-sm" variant="ghost">
              <a href={fullPageHref}>
                <Maximize2Icon />
              </a>
            </Button>
          )}
          {onClose && (
            <Button aria-label={`Close ${title}`} onClick={onClose} size="icon-sm" variant="ghost">
              <XIcon />
            </Button>
          )}
        </span>
      </header>
      {context && <div className="flex shrink-0 items-center gap-2 border-b border-outline-faint px-3 py-2 text-body-md text-on-surface-variant">{context}</div>}
      <div aria-label="Conversation" className="min-h-0 flex-1 overflow-y-auto px-3 py-4" role="region" tabIndex={0}>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
      <div className="shrink-0 border-t border-outline-faint bg-surface p-3">{composer}</div>
    </section>
  );
}

/* ================================================================ turn actions */

/** Under an answer: copy, regenerate, good, bad. Votes are toggle buttons; results are announced. */
export function TurnActions({
  onCopy,
  onRegenerate,
  onVote,
  context,
}: {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onVote?: (v: "up" | "down" | null) => void;
  /** The answer these act on, so several turns' controls don't share one name (WCAG 2.4.6). */
  context?: string;
}) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [msg, setMsg] = useState("");
  const name = (action: string) => (context ? `${action} for ${context}` : action);
  const set = (v: "up" | "down") => {
    const next = vote === v ? null : v;
    setVote(next);
    setMsg(next ? "Thanks, your feedback was saved." : "");
    onVote?.(next);
  };
  return (
    <div className="-ml-1.5 flex items-center gap-0.5" data-slot="turn-actions">
      <Button
        aria-label={name("Copy answer")}
        onClick={() => {
          onCopy?.();
          setMsg("Copied");
        }}
        size="icon-sm"
        variant="ghost"
      >
        <CopyIcon />
      </Button>
      {onRegenerate && (
        <Button aria-label={name("Regenerate")} onClick={onRegenerate} size="icon-sm" variant="ghost">
          <RefreshCcwIcon />
        </Button>
      )}
      <Button aria-label={name("Good answer")} aria-pressed={vote === "up"} onClick={() => set("up")} size="icon-sm" variant="ghost">
        <ThumbsUpIcon className={cn(vote === "up" && "fill-current")} />
      </Button>
      <Button aria-label={name("Bad answer")} aria-pressed={vote === "down"} onClick={() => set("down")} size="icon-sm" variant="ghost">
        <ThumbsDownIcon className={cn(vote === "down" && "fill-current")} />
      </Button>
      <span aria-live="polite" className="ml-1 text-body-md text-on-surface-variant" role="status">
        {msg}
      </span>
    </div>
  );
}
