"use client";

import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { MoreLabel, OverflowMeasure, splitOverflow, useOverflow } from "./overflow";

/* ---------------------------------------------------------------- FilterBar */

export type FilterBarProps = ComponentProps<"div">;

/** Search, filter chips, selects, then the result count pushed right. Wraps on narrow screens. */
export function FilterBar({ className, ...props }: FilterBarProps) {
  return (
    <div
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      data-slot="filter-bar"
      {...props}
    />
  );
}

export type FilterSearchProps = Omit<ComponentProps<"input">, "size" | "onChange"> & {
  value: string;
  onValueChange: (v: string) => void;
  label: string;
};

/** 32px search field with a clear button. The label is visually hidden but always present. */
export function FilterSearch({ value, onValueChange, label, placeholder, className, ...props }: FilterSearchProps) {
  return (
    <div className={cn("relative flex h-8 w-full min-w-0 items-center sm:w-64", className)}>
      <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-2.5 size-4 text-on-surface-variant" />
      <input
        aria-label={label}
        className="focus-ring h-8 w-full min-w-0 rounded-md border border-outline bg-surface-container-lowest pr-8 pl-8 hover:border-on-surface-variant text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary"
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder ?? label}
        type="search"
        value={value}
        {...props}
      />
      {value && (
        <button
          aria-label="Clear search"
          className="state-layer focus-ring absolute right-1 inline-flex size-6 items-center justify-center rounded-full text-on-surface-variant outline-none after:absolute after:-inset-1 after:content-['']"
          onClick={() => onValueChange("")}
          type="button"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export type FilterChipProps = Omit<ComponentProps<"button">, "onChange"> & {
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Shows a chevron; use as a DropdownMenu/Popover trigger via asChild on the trigger. */
  menu?: boolean;
  icon?: ReactNode;
  /** Selected value shown after the label on menu chips, e.g. "Owner: Priya". */
  value?: ReactNode;
};

/**
 * Beams toolbar filter: a 32px secondary button. Applied = the tan "selected" fill and edge
 * AND a check (or the chosen value), so the state is not colour alone. Toggle chips expose aria-pressed; menu chips don't (the
 * menu trigger owns aria-expanded).
 */
export function FilterChip({
  selected,
  onSelectedChange,
  menu,
  icon,
  value,
  className,
  children,
  onClick,
  ...props
}: FilterChipProps) {
  const on = selected || (menu && value != null);
  return (
    <button
      aria-pressed={menu ? undefined : !!selected}
      className={cn(
        "state-layer focus-ring hit-area inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-label-lg whitespace-nowrap outline-none",
        on
          ? "border-selected-border bg-secondary-container text-on-secondary-container"
          : "border-outline-strong bg-surface-container-lowest text-on-surface dark:bg-surface-container [&_svg]:text-on-surface-variant",
        (on || icon) && "pl-2",
        className
      )}
      data-selected={on || undefined}
      onClick={(e) => {
        onClick?.(e);
        if (!menu) onSelectedChange?.(!selected);
      }}
      type="button"
      {...props}
    >
      {on && !menu ? (
        <CheckIcon aria-hidden="true" className="size-4" />
      ) : (
        icon && <span aria-hidden="true" className="[&_svg]:size-4">{icon}</span>
      )}
      <span>
        {children}
        {value != null && (
          <>
            : <span className="font-semibold">{value}</span>
          </>
        )}
      </span>
      {menu && <ChevronDownIcon aria-hidden="true" className="-mr-1 size-4" />}
    </button>
  );
}

/** "24 deals" pushed to the end of the bar and announced politely when it changes. */
export function FilterCount({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span aria-live="polite" className={cn("ml-auto text-meta whitespace-nowrap text-on-surface-variant tabular-nums", className)}>
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Segmented */

export type SegmentedOption = { value: string; label: ReactNode; icon?: ReactNode; ariaLabel?: string; /** v0.7: a count after the label (filters). */ count?: number };

export type SegmentedProps = {
  options: SegmentedOption[];
  value: string;
  onValueChange: (v: string) => void;
  "aria-label": string;
  size?: "sm" | "default";
  className?: string;
};

/**
 * Segmented control (v0.6, one style everywhere): a grey track with 6px-cornered items; the
 * selected item is a white segment with a hairline edge and ink text (Cohere/North), not a
 * black fill, so it never outweighs the page's main action. Single choice, so Radix
 * renders radio semantics.
 */
const SEG_ITEM =
  "state-layer [--state-hover:0.05] focus-ring relative inline-flex h-full shrink-0 items-center justify-center gap-1.5 rounded-[6px] px-3 text-label-lg whitespace-nowrap text-on-surface-variant outline-none focus-visible:z-10 [&_svg]:size-4";
const SEG_ON =
  "bg-surface-container-lowest text-on-surface ring-1 ring-outline-strong [--state-hover:0] dark:bg-surface-container-highest";

function SegLabel({ o }: { o: SegmentedOption }) {
  return (
    <>
      {o.icon && <span aria-hidden="true">{o.icon}</span>}
      {o.label}
      {o.count != null && <span className="font-mono text-meta tabular-nums text-on-surface-variant">{o.count}</span>}
    </>
  );
}

export function Segmented({ options, value, onValueChange, size = "sm", className, ...aria }: SegmentedProps) {
  // v0.7: never wraps. Options that don't fit go into "More"; the selected one stays in the track.
  const pinned = options.findIndex((o) => o.value === value);
  const { containerRef, measureRef, visible } = useOverflow(options.length, pinned, 4);
  const { shown, hidden } = splitOverflow(options, visible, pinned);
  return (
    // The outer box takes the width it's given (the track inside is only as wide as its items),
    // so what fits is measured against the space, not against what is already shown.
    <div className={cn("relative flex w-full min-w-0 overflow-x-clip", className)} data-slot="segmented" ref={containerRef as React.RefObject<HTMLDivElement>}>
    <div className={cn("inline-flex max-w-full min-w-0 items-stretch gap-0.5 rounded-md bg-surface-container-high p-0.5", size === "sm" ? "h-8" : "h-[34px]")}>
      <ToggleGroupPrimitive.Root
        aria-label={aria["aria-label"]}
        className="flex min-w-0 items-stretch gap-0.5"
        onValueChange={(v) => v && onValueChange(v)}
        type="single"
        value={value}
      >
        {shown.map((o) => (
          <ToggleGroupPrimitive.Item aria-label={o.ariaLabel} className={cn(SEG_ITEM, "data-[state=on]:bg-surface-container-lowest data-[state=on]:text-on-surface data-[state=on]:ring-1 data-[state=on]:ring-outline-strong data-[state=on]:[--state-hover:0] dark:data-[state=on]:bg-surface-container-highest")} key={o.value} value={o.value}>
            <SegLabel o={o} />
          </ToggleGroupPrimitive.Item>
        ))}
      </ToggleGroupPrimitive.Root>
      {hidden.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger aria-label={`More options for ${aria["aria-label"]}`} className={SEG_ITEM} data-slot="segmented-more">
            <MoreLabel count={hidden.length} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup onValueChange={onValueChange} value={value}>
              {hidden.map((o) => (
                <DropdownMenuRadioItem key={o.value} value={o.value}>
                  <SegLabel o={o} />
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
      <OverflowMeasure className="gap-0.5" measureRef={measureRef}>
        {options.map((o) => (
          <span className={cn(SEG_ITEM, SEG_ON)} key={o.value}>
            <SegLabel o={o} />
          </span>
        ))}
        <span className={SEG_ITEM}>
          More <ChevronDownIcon className="size-4" />
        </span>
      </OverflowMeasure>
    </div>
  );
}
