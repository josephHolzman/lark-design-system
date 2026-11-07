"use client"

import * as React from "react"
import { AlertCircleIcon, LockIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Contained field (v0.6): the label sits inside the box, top left, and the whole box is the
 * target. Use it for labelled form fields (quote terms, deal desk forms, settings). Bare `Input`
 * stays for toolbars, filters and table cells, where the label is the column or the placeholder.
 *
 * - Label 12/18 450 sentence case, value 14/20 (16 on touch so phones never zoom).
 * - One 2px focus ring around the box, not the inner control.
 * - Error: tinted fill, error edge, an icon and the message, linked by aria-describedby;
 *   the control gets aria-invalid.
 * - Disabled: filled, with the reason underneath (never a faded box with no explanation).
 */
export type ContainedControlProps = {
  id: string
  "aria-describedby"?: string
  "aria-invalid"?: true
  "aria-required"?: true
  disabled?: boolean
  className: string
}

export type ContainedFieldProps = {
  label: React.ReactNode
  /** Help under the box, e.g. "Months, from the start date". */
  description?: React.ReactNode
  /** The problem and how to fix it. Turns the box into its error state. */
  error?: React.ReactNode
  /** Why the field can't be changed. Disables the control and says so. */
  disabledReason?: React.ReactNode
  required?: boolean
  /** Text after the value inside the box: a unit ("months", "USD"). */
  suffix?: React.ReactNode
  id?: string
  className?: string
  children: (control: ContainedControlProps) => React.ReactNode
}

/** Shared classes for the control inside the box: no edge, no ring, transparent. */
export const containedControlClass =
  "w-full min-w-0 border-0 bg-transparent p-0 text-sm text-on-surface outline-none placeholder:text-on-surface-tertiary pointer-coarse:text-base disabled:cursor-not-allowed disabled:text-on-surface-variant"

function ContainedField({ label, description, error, disabledReason, required, suffix, id: idProp, className, children }: ContainedFieldProps) {
  const auto = React.useId()
  const id = idProp ?? `cf${auto}`
  const descId = `${id}-desc`
  const errId = `${id}-err`
  const reasonId = `${id}-reason`
  const disabled = !!disabledReason
  const describedBy = [error ? errId : null, disabled ? reasonId : null, description ? descId : null].filter(Boolean).join(" ") || undefined
  const boxRef = React.useRef<HTMLDivElement>(null)

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)} data-slot="contained-field">
      <div
        className={cn(
          "relative flex min-h-14 cursor-text flex-col justify-center gap-0.5 rounded-md border border-input bg-surface-container-lowest px-3 py-2 transition-[border-color,background-color] hover:border-on-surface-variant",
          "has-[:focus-visible]:border-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
          error && "border-error bg-error-container/40 hover:border-error",
          disabled && "cursor-not-allowed border-outline-variant bg-surface-container hover:border-outline-variant"
        )}
        data-invalid={error ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        onPointerDown={(e) => {
          // Clicking anywhere in the box (padding, unit, chevron) focuses the control, so the whole
          // box is the target. The control and the label handle their own clicks.
          const t = e.target as HTMLElement
          if (!t.closest("input, textarea, select, button, label")) {
            e.preventDefault()
            boxRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.focus()
          }
        }}
        ref={boxRef}
      >
        <label className={cn("flex items-center gap-1 text-label-md", error ? "text-on-error-container" : "text-on-surface-variant")} htmlFor={id}>
          {label}
          {required && <span className="text-on-surface-tertiary">(required)</span>}
          {disabled && <LockIcon aria-hidden className="size-3" />}
        </label>
        <div className="flex items-baseline gap-2">
          {children({
            id,
            "aria-describedby": describedBy,
            "aria-invalid": error ? true : undefined,
            "aria-required": required ? true : undefined,
            disabled,
            className: containedControlClass,
          })}
          {suffix && <span className="shrink-0 text-sm text-on-surface-variant">{suffix}</span>}
        </div>
      </div>
      {error && (
        <p className="flex items-start gap-1.5 text-body-sm text-error" id={errId}>
          <AlertCircleIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {disabled && (
        <p className="text-body-sm text-on-surface-variant" id={reasonId}>
          {disabledReason}
        </p>
      )}
      {description && (
        <p className="text-body-sm text-on-surface-variant" id={descId}>
          {description}
        </p>
      )}
    </div>
  )
}

type ContainedInputProps = Omit<ContainedFieldProps, "children"> &
  Omit<React.ComponentProps<"input">, "id" | "className" | "disabled" | "required"> & { inputClassName?: string }

/** A contained text, number or email field. */
function ContainedInput({ label, description, error, disabledReason, required, suffix, id, className, inputClassName, ...input }: ContainedInputProps) {
  return (
    <ContainedField className={className} description={description} disabledReason={disabledReason} error={error} id={id} label={label} required={required} suffix={suffix}>
      {(c) => <input data-slot="input" {...input} {...c} className={cn(c.className, "h-6", input.type === "number" && "tabular-nums", inputClassName)} />}
    </ContainedField>
  )
}

type ContainedTextareaProps = Omit<ContainedFieldProps, "children" | "suffix"> &
  Omit<React.ComponentProps<"textarea">, "id" | "className" | "disabled" | "required"> & { textareaClassName?: string }

/** A contained multi-line field. */
function ContainedTextarea({ label, description, error, disabledReason, required, id, className, textareaClassName, ...textarea }: ContainedTextareaProps) {
  return (
    <ContainedField className={className} description={description} disabledReason={disabledReason} error={error} id={id} label={label} required={required}>
      {(c) => <textarea data-slot="textarea" rows={3} {...textarea} {...c} className={cn(c.className, "min-h-12 resize-y", textareaClassName)} />}
    </ContainedField>
  )
}

export { ContainedField, ContainedInput, ContainedTextarea }
