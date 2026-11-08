"use client";

import { ArrowDownIcon, ArrowUpIcon, CheckIcon, ChevronDownIcon, EllipsisIcon, SearchIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { LarkLink as Link } from "./provider";

/* ================================================================ ActionMenu */

export type MenuAction = {
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onSelect?: () => void;
  /** Disabled items say why in a tooltip instead of disappearing. */
  disabledReason?: string;
  destructive?: boolean;
};
export type MenuSection = { label?: string; items: MenuAction[] };

/**
 * The ⋯ menu for rows, cards and record headers. Sections are separated; destructive
 * actions go in the last section; disabled actions stay visible with the reason.
 */
export function ActionMenu({
  sections,
  label = "More actions",
  align = "end",
  trigger,
}: {
  sections: MenuSection[];
  label?: string;
  align?: "start" | "end";
  trigger?: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button aria-label={label} size="icon-sm" variant="ghost">
            <EllipsisIcon />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-52">
        {sections.map((s, si) => (
          <DropdownMenuGroup key={si}>
            {si > 0 && <DropdownMenuSeparator />}
            {s.label && <DropdownMenuLabel className="text-meta-strong text-on-surface-tertiary">{s.label}</DropdownMenuLabel>}
            {s.items.map((it) =>
              it.disabledReason ? (
                <Tooltip key={it.label}>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenuItem disabled>
                        {it.icon}
                        {it.label}
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">{it.disabledReason}</TooltipContent>
                </Tooltip>
              ) : (
                <DropdownMenuItem key={it.label} onSelect={it.onSelect} variant={it.destructive ? "destructive" : "default"}>
                  {it.icon}
                  {it.label}
                  {it.shortcut && <DropdownMenuShortcut>{it.shortcut}</DropdownMenuShortcut>}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ================================================================ SplitButton */

/**
 * Primary action plus a menu of related actions ("Create ⌄", "Submit for approval ⌄"): two real
 * buttons in one labelled group with a straight 2px seam. v0.6: `disabled` disables both halves,
 * `size`, and the group is named by the action. Use it only when the menu holds real alternatives;
 * a decorative "+" or "→" belongs inside one Button.
 */
export function SplitButton({
  children,
  onClick,
  sections,
  variant = "default",
  menuLabel = "More options",
  icon,
  size = "default",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  sections: MenuSection[];
  variant?: "default" | "secondary";
  menuLabel?: string;
  icon?: ReactNode;
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}) {
  return (
    <ButtonGroup aria-label={typeof children === "string" ? children : undefined} data-slot="split-button">
      <Button disabled={disabled} onClick={onClick} size={size} variant={variant}>
        {icon}
        {children}
      </Button>
      <ActionMenu
        label={menuLabel}
        sections={sections}
        trigger={
          <Button aria-label={menuLabel} disabled={disabled} size={size === "sm" ? "icon-sm" : size === "lg" ? "icon-lg" : "icon"} variant={variant}>
            <ChevronDownIcon />
          </Button>
        }
      />
    </ButtonGroup>
  );
}

/* ================================================================ SavedViewMenu */

export type SavedView = { id: string; name: string; owner?: "me" | "team"; count?: string };

/**
 * Apollo's view switcher: search, Mine / Shared tabs, the current view ticked and tinted,
 * a "Save as new view" action at the bottom.
 */
export function SavedViewMenu({
  views,
  value,
  onChange,
  onCreate,
}: {
  views: SavedView[];
  value: string;
  onChange: (id: string) => void;
  onCreate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"me" | "team">("me");
  const current = views.find((v) => v.id === value);
  const list = views.filter((v) => (v.owner ?? "me") === tab && v.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button aria-label={`View: ${current?.name ?? "none"}`} variant="ghost">
          {current?.name ?? "Choose a view"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-72 flex-col gap-2 p-2">
        <label className="relative flex items-center">
          <span className="sr-only">Search views</span>
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-2 size-4 text-on-surface-variant" />
          <input
            className="focus-ring h-8 w-full rounded-md border border-outline bg-surface-container-lowest pl-7 text-sm outline-none placeholder:text-on-surface-tertiary"
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search views"
            value={q}
          />
        </label>
        <div className="flex gap-4 border-b border-outline-variant px-1" role="tablist">
          {(["me", "team"] as const).map((t) => (
            <button
              aria-selected={tab === t}
              className="focus-ring relative h-8 text-sm text-on-surface-variant outline-none aria-selected:font-semibold aria-selected:text-on-surface aria-selected:after:absolute aria-selected:after:inset-x-0 aria-selected:after:-bottom-px aria-selected:after:h-0.5 aria-selected:after:bg-on-surface"
              key={t}
              onClick={() => setTab(t)}
              role="tab"
              type="button"
            >
              {t === "me" ? "Created by me" : "Shared with team"}
            </button>
          ))}
        </div>
        <ul aria-label="Views" className="flex max-h-64 flex-col gap-0.5 overflow-auto" role="listbox">
          {list.length === 0 && <li className="px-2 py-3 text-body-md text-on-surface-variant">No views match.</li>}
          {list.map((v) => (
            <li
              aria-selected={v.id === value}
              className={cn(
                "state-layer [--state-hover:0.05] flex h-8 cursor-default items-center gap-2 rounded-md px-2 text-sm",
                v.id === value && "bg-selected-strong text-on-secondary-container"
              )}
              key={v.id}
              onClick={() => {
                onChange(v.id);
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(v.id);
                  setOpen(false);
                }
              }}
              role="option"
              tabIndex={0}
            >
              <span className="min-w-0 flex-1 truncate">{v.name}</span>
              {v.count && <span className="font-mono text-meta text-on-surface-variant">{v.count}</span>}
              {v.id === value && <CheckIcon aria-hidden="true" className="size-4" />}
            </li>
          ))}
        </ul>
        {onCreate && (
          <div className="flex justify-end border-t border-outline-variant pt-2">
            <Button onClick={onCreate} size="sm" variant="secondary">
              Save as new view
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/* ================================================================ FacetFilter */

export type Facet = { value: string; label: string; count?: number };

/**
 * Multi-select filter in a popover: search, checkboxes with counts, Clear and Apply.
 * Changes apply on Apply, so a slow table doesn't refetch on every tick.
 */
export function FacetFilterMenu({
  label,
  facets,
  value,
  onChange,
}: {
  label: string;
  facets: Facet[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(value);
  const [q, setQ] = useState("");
  const list = useMemo(() => facets.filter((f) => f.label.toLowerCase().includes(q.toLowerCase())), [facets, q]);
  const applied = value.length;
  return (
    <Popover
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(value);
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <button
          className={cn(
            "state-layer focus-ring hit-area inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-label-lg whitespace-nowrap outline-none",
            applied ? "border-selected-border bg-secondary-container text-on-secondary-container" : "border-outline-strong bg-surface-container-lowest text-on-surface dark:bg-surface-container"
          )}
          type="button"
        >
          {/* Applied filters say what they are ("Type: Renewal", "Type: Renewal +1"), not a bare count. */}
          {applied > 0 ? (
            <span className="inline-flex max-w-56 min-w-0 items-baseline gap-1">
              <span className="text-on-secondary-container/80">{label}:</span>
              <span className="truncate font-semibold">{facets.find((f) => f.value === value[0])?.label ?? value[0]}</span>
              {applied > 1 && <span className="shrink-0 tabular-nums">+{applied - 1}</span>}
            </span>
          ) : (
            label
          )}
          <ChevronDownIcon aria-hidden="true" className="-mr-0.5 size-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-64 flex-col p-0">
        <div className="p-2">
          <label className="relative flex items-center">
            <span className="sr-only">Search {label}</span>
            <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-2 size-4 text-on-surface-variant" />
            <input
              className="focus-ring h-8 w-full rounded-md border border-outline bg-surface-container-lowest pl-7 text-sm outline-none placeholder:text-on-surface-tertiary"
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              value={q}
            />
          </label>
        </div>
        <fieldset className="flex max-h-60 flex-col gap-0.5 overflow-auto px-1 pb-1">
          <legend className="sr-only">{label}</legend>
          {list.map((f) => (
            <label className="state-layer [--state-hover:0.05] flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm" key={f.value}>
              <Checkbox
                checked={draft.includes(f.value)}
                onCheckedChange={(c) => setDraft((d) => (c ? [...d, f.value] : d.filter((x) => x !== f.value)))}
              />
              <span className="min-w-0 flex-1 truncate">{f.label}</span>
              {f.count != null && <span className="font-mono text-meta text-on-surface-variant">{f.count}</span>}
            </label>
          ))}
          {list.length === 0 && <p className="px-2 py-3 text-body-md text-on-surface-variant">No matches.</p>}
        </fieldset>
        <div className="flex justify-between gap-2 border-t border-outline-variant p-2">
          <Button disabled={!draft.length} onClick={() => setDraft([])} size="sm" variant="ghost">
            Clear
          </Button>
          <Button
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
            size="sm"
            variant="secondary"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ================================================================ ColumnsPanel */

export type ColumnOption = { id: string; label: string; group?: string; locked?: boolean };

/**
 * Column chooser (Apollo's View options → Fields): search, grouped checkboxes, and
 * reorder by Move up / Move down buttons (a keyboard-accessible stand-in for drag).
 * Locked columns (the record name) can't be hidden.
 */
export function ColumnsPanel({
  columns,
  visible,
  order,
  onVisibleChange,
  onOrderChange,
}: {
  columns: ColumnOption[];
  visible: string[];
  order: string[];
  onVisibleChange: (ids: string[]) => void;
  onOrderChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const byId = Object.fromEntries(columns.map((c) => [c.id, c]));
  const ordered = order.map((id) => byId[id]).filter(Boolean);
  const shown = ordered.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  const move = (id: string, d: -1 | 1) => {
    const i = order.indexOf(id);
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const n = [...order];
    [n[i], n[j]] = [n[j], n[i]];
    onOrderChange(n);
  };
  return (
    <div className="flex flex-col gap-2" data-slot="columns-panel">
      <label className="relative flex items-center">
        <span className="sr-only">Search columns</span>
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-2 size-4 text-on-surface-variant" />
        <input
          className="focus-ring h-8 w-full rounded-md border border-outline bg-surface-container-lowest pl-7 text-sm outline-none placeholder:text-on-surface-tertiary"
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search columns"
          value={q}
        />
      </label>
      <p className="px-1 text-meta-strong text-on-surface-tertiary" data-meta="count">
        Shown columns <span className="font-mono">{visible.length}</span>
      </p>
      <ul className="flex flex-col gap-0.5" role="list">
        {shown.map((c) => {
          const i = order.indexOf(c.id);
          return (
            <li className="group/col flex h-8 items-center gap-2 rounded-md px-1 hover:bg-surface-container-low" key={c.id}>
              <Checkbox
                aria-label={`Show ${c.label}`}
                checked={visible.includes(c.id)}
                disabled={c.locked}
                onCheckedChange={(v) => onVisibleChange(v ? [...visible, c.id] : visible.filter((x) => x !== c.id))}
              />
              <span className="min-w-0 flex-1 truncate text-sm">
                {c.label}
                {c.locked && <span className="text-on-surface-tertiary"> (always shown)</span>}
              </span>
              <span className="flex opacity-0 group-hover/col:opacity-100 group-focus-within/col:opacity-100">
                <Button aria-label={`Move ${c.label} up`} disabled={i === 0} onClick={() => move(c.id, -1)} size="icon-xs" variant="ghost">
                  <ArrowUpIcon />
                </Button>
                <Button aria-label={`Move ${c.label} down`} disabled={i === order.length - 1} onClick={() => move(c.id, 1)} size="icon-xs" variant="ghost">
                  <ArrowDownIcon />
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ================================================================ FacetList (filter rail) */

/**
 * Apollo's filter-rail facet list (Emails → Status): one choice, the current row tinted
 * tan, counts right-aligned in mono. Radio semantics.
 */
export function FacetList({ label, facets, value, onChange }: { label: string; facets: Facet[]; value: string; onChange: (v: string) => void }) {
  return (
    <div aria-label={label} className="flex flex-col gap-0.5" role="radiogroup">
      {facets.map((f) => (
        <button
          aria-checked={f.value === value}
          className={cn(
            "state-layer [--state-hover:0.05] focus-ring flex h-8 items-center gap-2 rounded-md px-2 text-left text-sm outline-none",
            f.value === value ? "bg-selected-strong text-on-secondary-container" : "text-on-surface"
          )}
          key={f.value}
          onClick={() => onChange(f.value)}
          role="radio"
          type="button"
        >
          <span className="min-w-0 flex-1 truncate">{f.label}</span>
          {f.count != null && <span className="font-mono text-meta text-on-surface-variant tabular-nums">{f.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ================================================================ CountSegments */

/**
 * Apollo's "Total · Net new · Saved" count switch at the top of a filter rail: label over
 * a mono count, one selected. Radio semantics.
 */
export function CountSegments({ label, items, value, onChange }: { label: string; items: { value: string; label: string; count: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div aria-label={label} className="grid grid-flow-col gap-0.5 rounded-lg border border-outline-variant p-0.5" role="radiogroup">
      {items.map((it) => (
        <button
          aria-checked={it.value === value}
          className={cn(
            "state-layer [--state-hover:0.05] focus-ring flex flex-col items-center gap-0.5 rounded-md py-1.5 outline-none",
            it.value === value && "bg-primary-container text-on-primary-container"
          )}
          key={it.value}
          onClick={() => onChange(it.value)}
          role="radio"
          type="button"
        >
          <span className="text-label-lg">{it.label}</span>
          <span className="font-mono text-meta tracking-[-0.4px] text-on-surface-variant">{it.count}</span>
        </button>
      ))}
    </div>
  );
}

/* ================================================================ VerticalNav */

/**
 * Settings-style section navigation: links with aria-current, the current one ink 8%. With
 * `href` an item is a real link (open in a new tab, in the page's parity spec); without one it
 * is a button that switches the section in place.
 */
export function VerticalNav({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { value: string; label: string; icon?: ReactNode; count?: number; href?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-0.5" role="list">
        {items.map((it) => {
          const cls = cn(
            "state-layer [--state-hover:0.05] focus-ring flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-on-surface-variant outline-none [&_svg]:size-4",
            it.value === value && "bg-outline-variant font-medium text-on-surface"
          );
          const body = (
            <>
              {it.icon}
              <span className="flex-1">{it.label}</span>
              {it.count != null && <span className="font-mono text-meta">{it.count}</span>}
            </>
          );
          return (
            <li key={it.value}>
              {it.href ? (
                <Link aria-current={it.value === value ? "page" : undefined} className={cls} href={it.href}>
                  {body}
                </Link>
              ) : (
                <button aria-current={it.value === value ? "page" : undefined} className={cls} onClick={() => onChange(it.value)} type="button">
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
