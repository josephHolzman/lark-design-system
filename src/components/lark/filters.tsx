"use client";

import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

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
    <span aria-live="polite" className={cn("ml-auto text-body-sm whitespace-nowrap text-on-surface-variant tabular-nums", className)}>
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Segmented */

export type SegmentedOption = { value: string; label: ReactNode; icon?: ReactNode; ariaLabel?: string };

export type SegmentedProps = {
  options: SegmentedOption[];
  value: string;
  onValueChange: (v: string) => void;
  "aria-label": string;
  size?: "sm" | "default";
  className?: string;
};

/**
 * Beams segmented control: a recessed track with 6px-cornered items; the selected item
 * is filled ink with white text (a luminance change, not a hue). Single choice, so Radix
 * renders radio semantics.
 */
export function Segmented({ options, value, onValueChange, size = "sm", className, ...aria }: SegmentedProps) {
  return (
    <ToggleGroupPrimitive.Root
      aria-label={aria["aria-label"]}
      className={cn("inline-flex shrink-0 items-stretch gap-0.5 rounded-md border border-outline-variant bg-surface-container-low p-0.5", size === "sm" ? "h-8" : "h-[34px]", className)}
      onValueChange={(v) => v && onValueChange(v)}
      type="single"
      value={value}
    >
      {options.map((o) => (
        <ToggleGroupPrimitive.Item
          aria-label={o.ariaLabel}
          className={cn(
            "state-layer [--state-hover:0.05] focus-ring relative inline-flex h-full items-center justify-center gap-1.5 rounded-[6px] px-3 text-label-lg text-on-surface-variant outline-none focus-visible:z-10",
            "data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-on-surface data-[state=on]:[--state-hover:0]",
            "[&_svg]:size-4"
          )}
          key={o.value}
          value={o.value}
        >
          {o.icon && <span aria-hidden="true">{o.icon}</span>}
          {o.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
