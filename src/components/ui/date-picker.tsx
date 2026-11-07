"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const fmt = (d: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale ?? "en-US", { month: "short", day: "numeric", year: "numeric" }).format(d)

const triggerCls =
  "focus-ring flex h-8 w-full min-w-0 items-center gap-2 rounded-md border border-outline bg-surface-container-lowest px-2.5 text-left text-sm pointer-coarse:text-base outline-none transition-colors hover:border-on-surface-variant disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant disabled:border-outline-variant data-invalid:border-destructive data-[state=open]:border-primary"

/**
 * Date field (Beams "Date picker"): a button showing the date ("Nov 14, 2026", never 11/14 in a
 * shared product), a calendar in a popover. `disabled` dates stay visible; say why in `help`.
 */
function DatePicker({
  value,
  onValueChange,
  placeholder = "Pick a date",
  locale,
  disabledDays,
  invalid,
  disabled,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
  id,
}: {
  value?: Date
  onValueChange: (d: Date | undefined) => void
  placeholder?: string
  locale?: string
  disabledDays?: React.ComponentProps<typeof Calendar>["disabled"]
  /** Styles the field as invalid; point aria-describedby at the error message. */
  invalid?: boolean
  disabled?: boolean
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
  id?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          aria-describedby={describedBy}
          data-invalid={invalid || undefined}
          aria-label={ariaLabel ? `${ariaLabel}${value ? `, ${fmt(value, locale)}` : ""}` : undefined}
          className={cn(triggerCls, className)}
          data-slot="date-picker"
          disabled={disabled}
          id={id}
          type="button"
        >
          <CalendarIcon aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
          <span className={cn("min-w-0 flex-1 truncate", !value && "text-on-surface-tertiary")}>
            {value ? fmt(value, locale) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          autoFocus
          defaultMonth={value}
          disabled={disabledDays}
          mode="single"
          onSelect={(d) => {
            onValueChange(d)
            setOpen(false)
          }}
          selected={value}
        />
      </PopoverContent>
    </Popover>
  )
}

function useMinWidth(px: number) {
  return React.useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(`(min-width: ${px}px)`)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(`(min-width: ${px}px)`).matches,
    () => true
  )
}

export type DatePreset = { label: string; range: () => DateRange }

/**
 * Date range (reporting periods, service windows). Two months from md up, one on phones;
 * presets on the left for the ranges people actually use.
 */
function DateRangePicker({
  value,
  onValueChange,
  placeholder = "Pick a date range",
  presets,
  locale,
  invalid,
  disabled,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
  id,
}: {
  value?: DateRange
  onValueChange: (r: DateRange | undefined) => void
  placeholder?: string
  presets?: DatePreset[]
  locale?: string
  /** Styles the field as invalid; point aria-describedby at the error message. */
  invalid?: boolean
  disabled?: boolean
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
  id?: string
}) {
  const [open, setOpen] = React.useState(false)
  const twoMonths = useMinWidth(640)
  const label = value?.from
    ? value.to
      ? `${fmt(value.from, locale)} – ${fmt(value.to, locale)}`
      : `${fmt(value.from, locale)} – pick an end date`
    : undefined
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          aria-describedby={describedBy}
          data-invalid={invalid || undefined}
          aria-label={ariaLabel ? `${ariaLabel}${label ? `, ${label}` : ""}` : undefined}
          className={cn(triggerCls, className)}
          data-slot="date-range-picker"
          disabled={disabled}
          id={id}
          type="button"
        >
          <CalendarIcon aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
          <span className={cn("min-w-0 flex-1 truncate", !label && "text-on-surface-tertiary")}>{label ?? placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col p-0 sm:flex-row">
        {presets && presets.length > 0 && (
          <ul aria-label="Presets" className="flex flex-wrap gap-1 border-b border-outline-variant p-2 sm:w-40 sm:flex-col sm:border-r sm:border-b-0" role="list">
            {presets.map((p) => (
              <li key={p.label}>
                <Button
                  className="w-full justify-start"
                  onClick={() => {
                    onValueChange(p.range())
                    setOpen(false)
                  }}
                  size="sm"
                  variant="ghost"
                >
                  {p.label}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Calendar
          autoFocus
          className="[--cell-size:--spacing(8)]"
          defaultMonth={value?.from}
          mode="range"
          numberOfMonths={twoMonths ? 2 : 1}
          onSelect={onValueChange}
          selected={value}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateRangePicker }
