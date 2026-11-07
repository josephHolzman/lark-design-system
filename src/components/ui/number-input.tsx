"use client"

import * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Number field with a unit (Beams "Number input"): $, %, months, seats. Typing is free (so
 * "1,200" and "12.5" work); the value is parsed on blur and clamped to min/max. Up/Down step,
 * Shift+Up/Down step ×10, Page Up/Down too. Step buttons are 24×24 targets and hidden from the
 * tab order (the field already handles the keys), so keyboard users don't tab through three stops.
 */
function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  locale = "en-US",
  maximumFractionDigits = 2,
  steppers = true,
  invalid,
  disabled,
  className,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "prefix" | "size" | "type"> & {
  value: number | undefined
  onValueChange: (v: number | undefined) => void
  min?: number
  max?: number
  step?: number
  /** "$" */
  prefix?: React.ReactNode
  /** "%", "months" */
  suffix?: React.ReactNode
  locale?: string
  maximumFractionDigits?: number
  steppers?: boolean
  invalid?: boolean
  size?: "sm" | "default"
}) {
  const format = React.useCallback(
    (n: number | undefined) =>
      n === undefined || Number.isNaN(n) ? "" : new Intl.NumberFormat(locale, { maximumFractionDigits }).format(n),
    [locale, maximumFractionDigits]
  )
  const [draft, setDraft] = React.useState(format(value))
  const [editing, setEditing] = React.useState(false)
  const shown = editing ? draft : format(value)

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
  const parse = (s: string) => {
    const n = Number(s.replace(/[^\d.-]/g, ""))
    return s.trim() === "" || Number.isNaN(n) ? undefined : clamp(n)
  }
  const nudge = (dir: 1 | -1, mult = 1) => {
    const next = clamp(Number(((value ?? min ?? 0) + dir * step * mult).toFixed(10)))
    onValueChange(next)
    setDraft(format(next))
  }

  return (
    <div
      aria-disabled={disabled || undefined}
      className={cn(
        "flex w-full min-w-0 items-center rounded-md border border-outline bg-surface-container-lowest transition-colors focus-within:border-primary hover:border-on-surface-variant",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
        invalid && "border-destructive",
        disabled && "pointer-events-none opacity-50",
        size === "sm" ? "h-7" : "h-8",
        className
      )}
      data-slot="number-input"
    >
      {prefix && <span className="pl-2.5 text-sm text-on-surface-variant" aria-hidden>{prefix}</span>}
      <input
        aria-invalid={invalid || undefined}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        aria-valuetext={value !== undefined && (typeof prefix === "string" || typeof suffix === "string") ? `${typeof prefix === "string" ? prefix : ""}${format(value)}${typeof suffix === "string" ? ` ${suffix}` : ""}` : undefined}
        className="h-full w-full min-w-0 flex-1 bg-transparent px-2.5 text-sm tabular-nums outline-none pointer-coarse:text-base"
        disabled={disabled}
        inputMode="decimal"
        onBlur={() => {
          setEditing(false)
          const n = parse(draft)
          onValueChange(n)
          setDraft(format(n))
        }}
        onChange={(e) => {
          setEditing(true)
          setDraft(e.target.value)
        }}
        onFocus={() => {
          setEditing(true)
          setDraft(format(value))
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "PageUp") {
            e.preventDefault()
            nudge(1, e.shiftKey || e.key === "PageUp" ? 10 : 1)
          } else if (e.key === "ArrowDown" || e.key === "PageDown") {
            e.preventDefault()
            nudge(-1, e.shiftKey || e.key === "PageDown" ? 10 : 1)
          } else if (e.key === "Enter") {
            const n = parse(draft)
            onValueChange(n)
            setDraft(format(n))
          }
        }}
        role="spinbutton"
        type="text"
        value={shown}
        {...props}
      />
      {suffix && <span className="pr-2 text-sm whitespace-nowrap text-on-surface-variant" aria-hidden>{suffix}</span>}
      {steppers && (
        <span className="flex h-full items-center gap-0.5 border-l border-outline-variant px-1">
          <button
            aria-label="Decrease"
            className="hit-area inline-flex size-6 items-center justify-center rounded-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface disabled:text-on-surface-tertiary disabled:hover:bg-transparent"
            disabled={disabled || (min !== undefined && (value ?? min) <= min)}
            onClick={() => nudge(-1)}
            tabIndex={-1}
            type="button"
          >
            <MinusIcon className="size-3.5" />
          </button>
          <button
            aria-label="Increase"
            className="hit-area inline-flex size-6 items-center justify-center rounded-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface disabled:text-on-surface-tertiary disabled:hover:bg-transparent"
            disabled={disabled || (max !== undefined && (value ?? max) >= max)}
            onClick={() => nudge(1)}
            tabIndex={-1}
            type="button"
          >
            <PlusIcon className="size-3.5" />
          </button>
        </span>
      )}
    </div>
  )
}

export { NumberInput }
