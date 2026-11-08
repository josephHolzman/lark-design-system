"use client";

import { AlertTriangleIcon, CheckCircle2Icon, CircleDashedIcon, LoaderCircleIcon, XCircleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { HoverActions } from "./cells";
import { Meter } from "./figure";
import { AceMark, PersonAvatar } from "./identity";
import { List, ListItem } from "./lists";
import { StatusBadge, type StatusTone } from "./status-badge";
import { ClampText } from "./text";

/*
  AgentTaskCard / AgentTaskRow / AgentTaskGrid (v0.8): one agent task and a set of them.
  A task shows who acts (a person's avatar or ACE), what it does in one line, its state in
  words, one line of context, one primary action and the rest on hover. AgentTaskGrid lays
  out by its own width: one card per row under 36rem (a List of AgentTaskRows), two cards to
  60rem and three above. The state is always a StatusBadge, never a colour alone.
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
  /** A PersonAvatar, CompanyLogo or another 24/32px mark. Decorative when omitted. */
  avatar?: ReactNode;
  /** ACE rather than a person: its mark replaces the initials. */
  ai?: boolean;
};

export type AgentTaskCardProps = {
  /** Stable key when used in AgentTaskGrid. */
  id?: string;
  title: ReactNode;
  agent: AgentTaskAgent;
  state: AgentTaskState;
  /** One line of context: what the task is working on, or why it stopped. */
  context?: ReactNode;
  /** The task's one primary action. */
  action?: ReactNode;
  /** The rest of the row actions; revealed on hover or keyboard focus. */
  actions?: ReactNode;
  /** A Meter under the title while running (0–max). */
  progress?: { value: number; max?: number; label?: string };
  className?: string;
};

function AgentMark({ agent, size }: { agent: AgentTaskAgent; size: "sm" | "md" }) {
  if (agent.avatar) return <>{agent.avatar}</>;
  return agent.ai ? <AceMark size={size} /> : <PersonAvatar name={agent.name} size={size} />;
}

function stateBadge(state: AgentTaskState) {
  const s = TASK_STATE[state];
  return <StatusBadge icon={s.icon} status={s.label} tone={s.tone} />;
}

/**
 * One agent task as a card: agent (avatar or ACE mark) and name, a 16px title (two lines at
 * most), the state badge, one line of context, a meter while it runs, its primary action and
 * its other actions on hover.
 */
export function AgentTaskCard({ title, agent, state, context, action, actions, progress, className }: AgentTaskCardProps) {
  const running = state === "running";
  return (
    <article
      className={cn("group/row flex h-full min-w-0 flex-col gap-3 rounded-lg border border-edge bg-card p-4 text-on-surface", className)}
      data-slot="agent-task-card"
      data-state={state}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 shrink-0">
          <AgentMark agent={agent} size="md" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1">
            <p className="min-w-0 flex-1 text-meta text-on-surface-variant" data-meta="byline">
              {agent.name}
            </p>
            {stateBadge(state)}
          </div>
          <ClampText className="text-title-sm text-on-surface" lines={2}>
            {title}
          </ClampText>
          {context && (
            <ClampText className="text-body-md text-on-surface-variant" lines={1}>
              {context}
            </ClampText>
          )}
        </div>
      </div>
      {running && progress && <Meter label={progress.label ?? "Task progress"} max={progress.max} value={progress.value} />}
      {(action || actions) && (
        <div className="mt-auto flex flex-wrap items-center justify-end gap-1 pt-1">
          {action}
          {actions && <HoverActions>{actions}</HoverActions>}
        </div>
      )}
    </article>
  );
}

/**
 * The same task as a dense list row (the narrow form in AgentTaskGrid): avatar · title ·
 * state badge · action. The extra actions wait for hover or focus.
 */
export function AgentTaskRow({ title, agent, state, context, action, actions, className }: AgentTaskCardProps) {
  return (
    <ListItem
      className={cn("group/row", className)}
      data-slot="agent-task-row"
      data-state={state}
      headline={title}
      leading={<AgentMark agent={agent} size="sm" />}
      supporting={context}
      trailing={
        <span className="flex items-center gap-1">
          {actions && <HoverActions>{actions}</HoverActions>}
          {stateBadge(state)}
          {action}
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
 * A set of agent tasks at its own width: a grid of two cards from 36rem and three from 60rem;
 * below 36rem the same tasks become a List of AgentTaskRows. Both forms are in the DOM and the
 * container query hides the one that does not fit (display: none keeps it out of the
 * accessibility tree).
 */
export function AgentTaskGrid({ tasks, label, className }: AgentTaskGridProps) {
  return (
    <div className={cn("@container/tasks min-w-0", className)} data-slot="agent-task-grid">
      <ul aria-label={label} className="hidden list-none grid-cols-1 gap-item @[36rem]/tasks:grid @[36rem]/tasks:grid-cols-2 @[60rem]/tasks:grid-cols-3" data-slot="agent-task-grid-cards">
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
