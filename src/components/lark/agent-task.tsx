"use client";

import { AlertTriangleIcon, CheckCircle2Icon, CircleDashedIcon, LoaderCircleIcon, XCircleIcon } from "lucide-react";
import { isValidElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AceMark, PersonAvatar } from "./identity";
import { List, ListItem } from "./lists";
import { ActionMenu, type MenuSection } from "./menus";
import { StatusBadge, type StatusTone } from "./status-badge";
import { ClampText } from "./text";

/*
  AgentTaskCard / AgentTaskRow / AgentTaskGrid (v0.8, v0.9 card anatomy): one agent task and a
  set of them. The card is Lark's anatomy in order:

      identity (32px avatar or ACE) · title (16, two lines) with the byline under it ..... ⋯
      description (14, two lines, the card's full width)
      progress with its step in words while running, or "Starts when …" while queued
      footer (pinned, hairline): one action on the left ............... StatusBadge on the right

  The one action is secondary unless this is the page's single most important task. Everything
  else (run, dismiss, retry later, reassign) lives in the ⋯ menu with text labels. The state is
  always a StatusBadge, never a colour alone. AgentTaskGrid lays out by its own width: two cards
  from 36rem, three from 60rem, and a List of rows below that.
*/

export type AgentTaskState = "queued" | "running" | "needs-review" | "done" | "failed";

const TASK_STATE: Record<AgentTaskState, { label: string; tone: StatusTone; icon: typeof CheckCircle2Icon }> = {
  queued: { label: "Queued", tone: "neutral", icon: CircleDashedIcon },
  running: { label: "Running", tone: "progress", icon: LoaderCircleIcon },
  "needs-review": { label: "Needs review", tone: "warning", icon: AlertTriangleIcon },
  done: { label: "Done", tone: "success", icon: CheckCircle2Icon },
  failed: { label: "Failed", tone: "error", icon: XCircleIcon },
};

export type AgentTaskAgent = {
  name: string;
  /** A PersonAvatar, CompanyLogo or another 32px mark. Decorative when omitted. */
  avatar?: ReactNode;
  /** ACE rather than a person: its mark replaces the initials. */
  ai?: boolean;
};

export type AgentTaskProgress = {
  value: number;
  max?: number;
  /** The step's name in words: "Drafting the margin table". */
  step?: ReactNode;
  /** The counter; defaults to "Step <value> of <max>" when `max` is set. */
  stepLabel?: ReactNode;
  /** The progressbar's accessible name. Default "Task progress". */
  label?: string;
};

export type AgentTaskCardProps = {
  /** Stable key when used in AgentTaskGrid. */
  id?: string;
  title: ReactNode;
  agent: AgentTaskAgent;
  state: AgentTaskState;
  /** The task in one or two lines, at the card's full width, never indented under the avatar. */
  description?: ReactNode;
  /** Alias of `description`, kept for callers from 0.8. */
  context?: ReactNode;
  /** When it started or was queued: the second half of the byline ("started 4 min ago"). */
  time?: ReactNode;
  /** Overrides the whole byline. Default "<agent> · <time>", e.g. "ACE · started 4 min ago". */
  byline?: ReactNode;
  /** While queued: what it waits for, in words ("Starts when the 2027 policy is published."). */
  startsWhen?: ReactNode;
  /**
   * The footer's one action. A secondary button; use the brand button only for the single
   * most important task on the page. Failed tasks put Retry here.
   */
  action?: ReactNode;
  /** The ⋯ menu's items, with text labels (run, dismiss, retry later, reassign). */
  menu?: MenuSection[];
  /** The menu button's name. Default "More actions for <title>". */
  menuLabel?: string;
  /** The progressbar while running, with its step said in words. */
  progress?: AgentTaskProgress;
  className?: string;
};

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function AgentMark({ agent, size }: { agent: AgentTaskAgent; size: "sm" | "md" }) {
  if (agent.avatar) return <>{agent.avatar}</>;
  return agent.ai ? <AceMark size={size} /> : <PersonAvatar name={agent.name} size={size} />;
}

function stateBadge(state: AgentTaskState) {
  const s = TASK_STATE[state];
  return <StatusBadge icon={s.icon} status={s.label} tone={s.tone} />;
}

/** "<who> · <when>" as metadata. */
function bylineFor(agent: AgentTaskAgent, time: ReactNode, byline: ReactNode): ReactNode {
  if (byline !== undefined) return byline;
  return time ? (
    <>
      {agent.name} · {time}
    </>
  ) : (
    agent.name
  );
}

function menuName(title: ReactNode, explicit?: string) {
  if (explicit) return explicit;
  const words = textOf(title).trim();
  return words ? `More actions for ${words}` : "More actions";
}

/**
 * The step in words over a sky progress bar: the counter at 12 (metadata), the step's name at
 * 14. `role="progressbar"` with `aria-valuenow` and a `aria-valuetext` that repeats the words.
 */
function TaskProgress({ progress }: { progress: AgentTaskProgress }) {
  const { value, max, step, label = "Task progress" } = progress;
  const stepLabel = progress.stepLabel ?? (max != null ? `Step ${value} of ${max}` : `${Math.round((value / (max ?? 100)) * 100)}%`);
  const words = step ? `${textOf(stepLabel)} · ${textOf(step)}` : textOf(stepLabel);
  const pct = max != null && max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : Math.min(100, Math.max(0, value));
  return (
    <div className="flex min-w-0 flex-col gap-1.5" data-slot="agent-task-progress">
      <p className="flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5" data-meta="progress">
        <span className="text-meta text-on-surface-variant tabular-nums">{stepLabel}</span>
        {step && <span className="text-body-md text-on-surface">{step}</span>}
      </p>
      <div
        aria-label={label}
        aria-valuemax={max ?? 100}
        aria-valuemin={0}
        aria-valuenow={value}
        aria-valuetext={words}
        className="h-1.5 w-full overflow-hidden rounded-full bg-outline-variant"
        data-slot="agent-task-bar"
        role="progressbar"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * One agent task as a card: 32px identity, a 16px title with its "<who> · <when>" byline, the
 * ⋯ menu, a two-line description at the full width, progress in words while it runs, and a
 * pinned footer with one action on the left and the state badge on the right.
 */
export function AgentTaskCard({
  title,
  agent,
  state,
  description,
  context,
  time,
  byline,
  startsWhen,
  action,
  menu,
  menuLabel,
  progress,
  className,
}: AgentTaskCardProps) {
  const running = state === "running";
  const body = description ?? context;
  const bylineText = bylineFor(agent, time, byline);
  return (
    <article
      className={cn("group/row flex h-full min-w-0 flex-col gap-3 rounded-lg border border-edge bg-card p-4 text-on-surface", className)}
      data-slot="agent-task-card"
      data-state={state}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="shrink-0">
          <AgentMark agent={agent} size="md" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-start gap-1">
            <h3 className="min-w-0 flex-1">
              <ClampText className="text-title-sm text-on-surface" lines={2}>
                {title}
              </ClampText>
            </h3>
            {menu && <ActionMenu align="end" label={menuName(title, menuLabel)} sections={menu} />}
          </div>
          <p className="text-meta text-on-surface-variant" data-meta="byline">
            {bylineText}
          </p>
        </div>
      </div>

      {body && (
        <ClampText className="text-body-md text-on-surface-variant" data-slot="agent-task-description" lines={2}>
          {body}
        </ClampText>
      )}

      {running && progress && <TaskProgress progress={progress} />}
      {state === "queued" && startsWhen && (
        <p className="text-body-md text-on-surface-variant" data-slot="agent-task-starts-when">
          {startsWhen}
        </p>
      )}

      <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-outline-variant pt-3" data-slot="agent-task-footer">
        {action}
        <span className="ml-auto flex shrink-0 items-center gap-1">{stateBadge(state)}</span>
      </footer>
    </article>
  );
}

/**
 * The same task as a dense list row (the narrow form in AgentTaskGrid): avatar · title with its
 * byline · the state badge · its one action · the ⋯ menu. The menu is always visible, so touch
 * users never need hover to reach it.
 */
export function AgentTaskRow({ title, agent, state, time, byline, action, menu, menuLabel, className }: AgentTaskCardProps) {
  const bylineText = bylineFor(agent, time, byline);
  return (
    <ListItem
      className={cn("group/row", className)}
      data-slot="agent-task-row"
      data-state={state}
      headline={title}
      leading={<AgentMark agent={agent} size="sm" />}
      supporting={
        <span className="text-meta" data-meta="byline">
          {bylineText}
        </span>
      }
      trailing={
        <span className="flex items-center gap-2">
          {stateBadge(state)}
          {action}
          {menu && <ActionMenu align="end" label={menuName(title, menuLabel)} sections={menu} />}
        </span>
      }
    />
  );
}

export type AgentTaskGridProps = {
  tasks: (AgentTaskCardProps & { id: string })[];
  /** Names the set for screen readers. */
  label?: string;
  className?: string;
};

/**
 * A set of agent tasks at its own width: equal-width cards, two from 36rem and three from
 * 60rem, every card `h-full` so their footers line up. Below 36rem the same tasks are a List of
 * AgentTaskRows. Both forms are in the DOM; the container query hides the one that does not fit
 * (display: none keeps it out of the accessibility tree).
 */
export function AgentTaskGrid({ tasks, label, className }: AgentTaskGridProps) {
  return (
    <div className={cn("@container/tasks min-w-0", className)} data-slot="agent-task-grid">
      <ul
        aria-label={label}
        className="hidden list-none grid-cols-1 gap-item @[36rem]/tasks:grid @[36rem]/tasks:grid-cols-2 @[60rem]/tasks:grid-cols-3"
        data-slot="agent-task-grid-cards"
      >
        {tasks.map(({ id, ...task }) => (
          <li className="flex min-w-0" key={id}>
            <AgentTaskCard {...task} />
          </li>
        ))}
      </ul>
      <List aria-label={label} className="@[36rem]/tasks:hidden" data-slot="agent-task-grid-rows" dividers>
        {tasks.map(({ id, ...task }) => (
          <AgentTaskRow key={id} {...task} />
        ))}
      </List>
    </div>
  );
}
