"use client";

import { AtSignIcon, BadgeCheckIcon, BellIcon, FileTextIcon, InfoIcon, ListChecksIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { IconChip } from "./cards";
import { StatePanel } from "./feedback";
import { Segmented } from "./filters";
import type { IllustrationSpec } from "./illustration";

/*
  NotificationsPanel (v0.8): deal signals in a sheet from the top-bar bell. Items are grouped
  by day and carry a kind icon, a title, a clamped detail, a time, an unread dot with the word
  "Unread", and an optional action. The header counts what is unread and can mark all read;
  the segmented filter counts All, Unread and Mentions. Empty states keep an illustration.
*/

export type NotificationKind = "approval" | "mention" | "quote" | "task" | "system";

const KIND = {
  approval: { icon: BadgeCheckIcon, label: "Approval" },
  mention: { icon: AtSignIcon, label: "Mention" },
  quote: { icon: FileTextIcon, label: "Quote" },
  task: { icon: ListChecksIcon, label: "Task" },
  system: { icon: InfoIcon, label: "System" },
} as const;

export type NotificationItem = {
  id: string;
  /** Chooses the tile's icon. Default "system". */
  kind?: NotificationKind;
  title: ReactNode;
  /** One or two lines of context under the title. */
  detail?: ReactNode;
  at: Date | string;
  unread?: boolean;
  /** Counts under Mentions: the signal names the reader. */
  mentionsMe?: boolean;
  /** A button or link under the detail. */
  action?: ReactNode;
};

export type NotificationsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NotificationItem[];
  onMarkAllRead?: () => void;
  /** The empty state's picture: a spec or your own node. */
  illustration?: ReactNode | IllustrationSpec;
  /** Fixed "now" for grouping and tests. */
  now?: Date;
  /** The sheet's heading. Default "Deal signals". */
  title?: string;
  className?: string;
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "mentions", label: "Mentions" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

const DAY = 86_400_000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayLabel(date: Date, now: Date) {
  const distance = Math.round((startOfDay(now) - startOfDay(date)) / DAY);
  if (distance === 0) return "Today";
  if (distance === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

export function NotificationsPanel({
  open,
  onOpenChange,
  items,
  onMarkAllRead,
  illustration,
  now = new Date(),
  title = "Deal signals",
  className,
}: NotificationsPanelProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const unread = items.filter((item) => item.unread).length;
  const counts = {
    all: items.length,
    unread,
    mentions: items.filter((item) => item.mentionsMe).length,
  };
  const shown = items
    .filter((item) => (filter === "unread" ? item.unread : filter === "mentions" ? item.mentionsMe : true))
    .slice()
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  // Group in the sorted order, so the newest day is first.
  const groups: { key: string; label: string; items: NotificationItem[] }[] = [];
  for (const item of shown) {
    const date = new Date(item.at);
    const key = date.toDateString();
    const group = groups[groups.length - 1];
    if (group?.key === key) group.items.push(item);
    else groups.push({ key, label: dayLabel(date, now), items: [item] });
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className={cn("w-full gap-0 sm:max-w-[26rem]", className)} data-slot="notifications-panel">
        <SheetHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <SheetTitle className="flex items-center gap-2">
                <BellIcon aria-hidden className="size-4 text-on-surface-variant" />
                {title}
              </SheetTitle>
              <SheetDescription className="tabular-nums">
                {unread === 0 ? "No unread signals" : `${unread} unread`}
              </SheetDescription>
            </div>
            <Button disabled={unread === 0 || !onMarkAllRead} onClick={onMarkAllRead} size="sm" variant="ghost">
              Mark all as read
            </Button>
          </div>
          <Segmented
            aria-label="Filter signals"
            onValueChange={(value) => setFilter(value as Filter)}
            options={FILTERS.map((option) => ({ ...option, count: counts[option.value] }))}
            value={filter}
          />
        </SheetHeader>
        <div className="@container/notifications min-h-0 flex-1 overflow-auto">
          {groups.length === 0 ? (
            <StatePanel
              compact
              description={filter === "all" ? "Approvals, mentions and quote updates will collect here." : "Nothing matches this filter. Try All."}
              illustration={illustration}
              kind={filter === "all" ? "first-run" : "no-results"}
              title={filter === "all" ? "No signals yet" : filter === "unread" ? "Nothing unread" : "No mentions"}
            />
          ) : (
            <div className="flex flex-col">
              {groups.map((group, index) => (
                <section aria-labelledby={`notifications-group-${index}`} className="flex flex-col" key={group.key}>
                  <h3 className="bg-surface px-4 pt-3 pb-1 text-meta-strong text-on-surface-variant" data-meta="eyebrow" id={`notifications-group-${index}`}>
                    {group.label}
                  </h3>
                  <ul className="flex flex-col">
                    {group.items.map((item) => {
                      const kind = KIND[item.kind ?? "system"];
                      const Icon = kind.icon;
                      const at = new Date(item.at);
                      return (
                        <li
                          className={cn(
                            "flex gap-3 border-b border-outline-faint px-4 py-3",
                            item.unread ? "bg-secondary-container/40" : "bg-transparent"
                          )}
                          data-slot="notification"
                          data-unread={item.unread || undefined}
                          key={item.id}
                        >
                          <IconChip size="sm" tone="neutral">
                            <Icon />
                          </IconChip>
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <div className="flex min-w-0 items-start gap-2">
                              <span className="min-w-0 flex-1 text-title-sm [overflow-wrap:break-word]">
                                <span className="sr-only">{kind.label}: </span>
                                <span>{item.title}</span>
                                {item.unread && <span className="sr-only"> Unread</span>}
                              </span>
                              {item.unread && <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                              <time className="shrink-0 text-meta whitespace-nowrap text-on-surface-variant tabular-nums" dateTime={at.toISOString()}>
                                {at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </time>
                            </div>
                            {item.detail && <p className="line-clamp-2 text-body-md text-on-surface-variant">{item.detail}</p>}
                            {item.action && <div className="mt-1 flex flex-wrap items-center gap-2">{item.action}</div>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
