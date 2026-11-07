"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type ComboboxOption = {
  value: string
  label: string
  /** Second line: owner, region, ID. Searched too. */
  description?: string
  /** Leading mark (CompanyLogo, PersonAvatar, icon). */
  leading?: React.ReactNode
  /** Kept visible but not selectable; say why in the description. */
  disabled?: boolean
  group?: string
}

type BaseProps = {
  options: ComboboxOption[]
  /** Accessible name when there is no visible <label for>. */
  "aria-label"?: string
  id?: string
  placeholder?: string
  searchPlaceholder?: string
  /** Shown when nothing matches. Say what to try next, not just "No results". */
  empty?: React.ReactNode
  disabled?: boolean
  invalid?: boolean
  className?: string
  /** Popover width follows the trigger by default. */
  contentClassName?: string
}

function groupsOf(options: ComboboxOption[]) {
  const map = new Map<string, ComboboxOption[]>()
  for (const o of options) {
    const k = o.group ?? ""
    map.set(k, [...(map.get(k) ?? []), o])
  }
  return [...map.entries()]
}

const triggerCls =
  "focus-ring flex h-8 w-full min-w-0 items-center gap-2 rounded-md border border-outline bg-surface-container-lowest px-2.5 text-left text-sm pointer-coarse:text-base outline-none transition-colors hover:border-on-surface-variant disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant disabled:border-outline-variant aria-invalid:border-destructive data-[state=open]:border-primary"

function OptionRows({
  options,
  isSelected,
  onPick,
}: {
  options: ComboboxOption[]
  isSelected: (v: string) => boolean
  onPick: (v: string) => void
}) {
  return (
    <>
      {groupsOf(options).map(([group, items]) => (
        <CommandGroup heading={group || undefined} key={group || "_"}>
          {items.map((o) => (
            <CommandItem
              disabled={o.disabled}
              key={o.value}
              keywords={[o.label, o.description ?? ""]}
              onSelect={() => onPick(o.value)}
              value={o.value}
            >
              {o.leading}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{o.label}</span>
                {o.description && <span className="truncate text-body-sm text-on-surface-variant">{o.description}</span>}
              </span>
              <CheckIcon aria-hidden className={cn("size-4", isSelected(o.value) ? "opacity-100" : "opacity-0")} />
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  )
}

/**
 * Searchable single select (Beams "Select with search"). Use over Select when there are more
 * than ~10 options or people know what they're looking for (accounts, owners, products).
 * The trigger is a button with aria-haspopup; the list is cmdk (arrow keys, type to filter).
 */
function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search",
  empty = "Nothing matches. Check the spelling or try a shorter name.",
  disabled,
  invalid,
  className,
  contentClassName,
  clearable,
  ...rest
}: BaseProps & {
  value?: string
  onValueChange: (value: string | undefined) => void
  /** Adds a clear button when something is chosen. */
  clearable?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const listId = React.useId()
  const selected = options.find((o) => o.value === value)
  return (
    <div className={cn("relative w-full min-w-0", className)} data-slot="combobox">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <button
            aria-controls={listId}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={invalid || undefined}
            aria-label={rest["aria-label"]}
            className={cn(triggerCls, clearable && selected && "pr-14")}
            role="combobox"
            disabled={disabled}
            id={rest.id}
            type="button"
          >
            {selected?.leading}
            <span className={cn("min-w-0 flex-1 truncate", !selected && "text-on-surface-tertiary")}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronsUpDownIcon aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className={cn("w-(--radix-popover-trigger-width) min-w-60 p-0", contentClassName)}>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList id={listId}>
              <CommandEmpty>{empty}</CommandEmpty>
              <OptionRows
                isSelected={(v) => v === value}
                onPick={(v) => {
                  onValueChange(v === value ? undefined : v)
                  setOpen(false)
                }}
                options={options}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {clearable && selected && !disabled && (
        <button
          aria-label={`Clear ${selected.label}`}
          className="focus-ring hit-area absolute top-1/2 right-7 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-on-surface-variant outline-none hover:text-on-surface"
          onClick={() => onValueChange(undefined)}
          type="button"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  )
}

/**
 * Searchable multi-select with removable tags in the field (Beams "Multi select").
 * Each tag has its own remove button; Backspace in the search removes the last one.
 */
function MultiCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search",
  empty = "Nothing matches. Check the spelling or try a shorter name.",
  disabled,
  invalid,
  className,
  contentClassName,
  max,
  ...rest
}: BaseProps & {
  value: string[]
  onValueChange: (value: string[]) => void
  /** Optional limit; options beyond it are disabled with a reason. */
  max?: number
}) {
  const [open, setOpen] = React.useState(false)
  const listId = React.useId()
  const [query, setQuery] = React.useState("")
  const chosen = value.map((v) => options.find((o) => o.value === v)).filter(Boolean) as ComboboxOption[]
  const full = max !== undefined && value.length >= max
  const toggle = (v: string) =>
    onValueChange(value.includes(v) ? value.filter((x) => x !== v) : full ? value : [...value, v])
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <div
        className={cn(
          "flex min-h-8 w-full min-w-0 flex-wrap items-center gap-1 rounded-md border border-outline bg-surface-container-lowest p-1 pr-1.5 transition-colors hover:border-on-surface-variant",
          invalid && "border-destructive",
          open && "border-primary",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        data-slot="multi-combobox"
      >
        {chosen.map((o) => (
          <Tag key={o.value} onRemove={() => toggle(o.value)} size="sm">
            {o.label}
          </Tag>
        ))}
        <PopoverTrigger asChild>
          <button
            aria-controls={listId}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={invalid || undefined}
            aria-label={rest["aria-label"]}
            role="combobox"
            className="focus-ring flex h-6 min-w-24 flex-1 items-center justify-between gap-2 rounded-sm px-1.5 text-left text-sm pointer-coarse:text-base text-on-surface-tertiary outline-none"
            disabled={disabled}
            id={rest.id}
            type="button"
          >
            <span className="truncate">{chosen.length ? (full ? `${chosen.length} of ${max}` : "Add") : placeholder}</span>
            <ChevronsUpDownIcon aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="start" className={cn("w-72 p-0", contentClassName)}>
        <Command>
          <CommandInput
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !query && value.length) onValueChange(value.slice(0, -1))
            }}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
            value={query}
          />
          <CommandList id={listId}>
            <CommandEmpty>{empty}</CommandEmpty>
            <OptionRows
              isSelected={(v) => value.includes(v)}
              onPick={toggle}
              options={options.map((o) =>
                full && !value.includes(o.value)
                  ? { ...o, disabled: true, description: `Limit of ${max} reached` }
                  : o
              )}
            />
          </CommandList>
        </Command>
        <p aria-live="polite" className="border-t border-outline-variant px-3 py-2 text-body-sm text-on-surface-variant">
          {value.length} selected{max !== undefined ? ` of up to ${max}` : ""}
        </p>
      </PopoverContent>
    </Popover>
  )
}

/**
 * A removable tag (Beams "Input chip"): a value someone chose. Not a status — use Badge or
 * StatusBadge for that. The remove button names what it removes.
 */
function Tag({
  children,
  onRemove,
  size = "md",
  className,
  removeLabel,
  ...props
}: React.ComponentProps<"span"> & {
  onRemove?: () => void
  size?: "sm" | "md"
  removeLabel?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1 rounded-sm bg-surface-container-high text-on-surface",
        size === "sm" ? "h-6 pr-0.5 pl-2 text-label-md" : "h-7 pr-1 pl-2.5 text-sm",
        !onRemove && (size === "sm" ? "pr-2" : "pr-2.5"),
        className
      )}
      data-slot="tag"
      {...props}
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          aria-label={removeLabel ?? `Remove ${typeof children === "string" ? children : "tag"}`}
          className="focus-ring hit-area inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] text-on-surface-variant outline-none hover:bg-surface-container-highest hover:text-on-surface"
          onClick={onRemove}
          type="button"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </span>
  )
}

export { Combobox, MultiCombobox, Tag }
