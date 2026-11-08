"use client";

import { MinusIcon, PencilLineIcon, PlusIcon } from "lucide-react";
import { isValidElement, useId, useState, type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { NoBreak } from "./text";

/*
  VersionCompare (v0.8): two versions of a document, quote or record. The left and right
  headers say which version, who made it and when. Each row shows the value before and after;
  the change is marked by a word and an icon, never colour alone. Wide (40rem of its own
  width): the before and after values sit in two columns. Narrow: one column per row, before
  then after. "Only changes" hides rows that did not change.
*/

export type VersionChangeKind = "added" | "removed" | "changed";

export type VersionSide = {
  version: ReactNode;
  author?: ReactNode;
  time?: Date | ReactNode;
};

export type VersionRow = {
  id?: string;
  label: ReactNode;
  before: ReactNode;
  after: ReactNode;
  /** Overrides the change inferred from the two values. */
  kind?: VersionChangeKind;
};

export type VersionCompareProps = {
  left: VersionSide;
  right: VersionSide;
  rows: VersionRow[];
  /** Start with only the rows that changed. */
  defaultOnlyChanges?: boolean;
  className?: string;
};

const CHANGE = {
  added: { icon: PlusIcon, word: "Added", tone: "text-success" },
  removed: { icon: MinusIcon, word: "Removed", tone: "text-error" },
  changed: { icon: PencilLineIcon, word: "Changed", tone: "text-on-surface-variant" },
} as const;

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/** The row's change: its own kind, or one inferred from the two values. */
function changeOf(row: VersionRow): VersionChangeKind | undefined {
  if (row.kind) return row.kind;
  const before = textOf(row.before).trim();
  const after = textOf(row.after).trim();
  if (!before && after) return "added";
  if (before && !after) return "removed";
  if (before !== after) return "changed";
  return undefined;
}

const NUMERIC = /^[\s$€£¥+\-–—.,0-9%()]+$/;

function Value({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const text = textOf(children);
  if (text.trim() === "") return <span className="block text-body-lg text-on-surface-variant">Not set</span>;
  const whole = typeof children === "number" || (/\d/.test(text) && NUMERIC.test(text));
  return (
    <span className={cn("block min-w-0 text-body-lg [overflow-wrap:break-word]", muted ? "text-on-surface-variant" : "text-on-surface")}>
      {whole ? <NoBreak>{children}</NoBreak> : children}
    </span>
  );
}

function ChangeMark({ kind }: { kind: VersionChangeKind }) {
  const change = CHANGE[kind];
  const Icon = change.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-body-md", change.tone)}>
      <Icon aria-hidden="true" className="size-3.5" />
      {change.word}
    </span>
  );
}

function SideHeader({ side, heading }: { side: VersionSide; heading: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-edge bg-inset p-3">
      <p className="text-meta text-on-surface-variant" data-meta="column-head">
        {heading}
      </p>
      <p className="mt-0.5 text-title-sm text-on-surface">{side.version}</p>
      {side.author && (
        <p className="text-meta text-on-surface-variant" data-meta="byline">
          {side.author}
        </p>
      )}
      {side.time != null && (
        <p className="text-meta text-on-surface-variant tabular-nums" data-meta="timestamp">
          {side.time instanceof Date ? (
            <time dateTime={side.time.toISOString()}>
              {side.time.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ·{" "}
              {side.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </time>
          ) : (
            side.time
          )}
        </p>
      )}
    </div>
  );
}

export function VersionCompare({ left, right, rows, defaultOnlyChanges = false, className }: VersionCompareProps) {
  const switchId = useId();
  const [onlyChanges, setOnlyChanges] = useState(defaultOnlyChanges);
  const changed = rows.filter((row) => changeOf(row) !== undefined);
  const shown = onlyChanges ? changed : rows;

  return (
    <div className={cn("@container/compare flex min-w-0 flex-col gap-3", className)} data-slot="version-compare">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-meta text-on-surface-variant tabular-nums" data-meta="count">
          {changed.length} of {rows.length} rows changed
        </span>
        <div className="flex items-center gap-2">
          <Switch checked={onlyChanges} id={switchId} onCheckedChange={setOnlyChanges} />
          <Label className="text-body-md" htmlFor={switchId}>
            Only changes
          </Label>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-2 @[24rem]/compare:grid-cols-2">
        <SideHeader heading="Before" side={left} />
        <SideHeader heading="After" side={right} />
      </div>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-edge bg-card p-4 text-body-md text-on-surface-variant">No changes between these versions.</p>
      ) : (
        <dl className="flex min-w-0 flex-col divide-y divide-outline-faint rounded-lg border border-edge bg-card">
          {shown.map((row, index) => {
            const change = changeOf(row);
            return (
              <div
                className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-1.5 px-3.5 py-3 @[40rem]/compare:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_minmax(0,1fr)]"
                data-change={change}
                data-slot="version-row"
                key={row.id ?? index}
              >
                <dt className="flex min-w-0 flex-wrap items-center gap-2 text-body-md text-on-surface-variant">
                  {row.label}
                  {change && <ChangeMark kind={change} />}
                </dt>
                <dd className="min-w-0" data-slot="version-before">
                  <span aria-hidden="true" className="text-meta text-on-surface-variant @[40rem]/compare:hidden">
                    Before
                  </span>
                  <span className="sr-only">Before: </span>
                  <Value muted>{row.before}</Value>
                </dd>
                <dd className="min-w-0" data-slot="version-after">
                  <span aria-hidden="true" className="text-meta text-on-surface-variant @[40rem]/compare:hidden">
                    After
                  </span>
                  <span className="sr-only">After: </span>
                  <Value>{row.after}</Value>
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}
