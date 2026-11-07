"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type ButtonProps = React.ComponentProps<typeof Button>

/**
 * Icon-only button. `label` is required: it is the accessible name and the tooltip, so the
 * two never drift apart. Use `pressed` for toggles (bold, pin, like); it sets aria-pressed.
 */
function IconButton({
  label,
  children,
  size = "icon",
  variant = "ghost",
  pressed,
  tooltipSide,
  shortcut,
  ...props
}: Omit<ButtonProps, "aria-label" | "size"> & {
  label: string
  size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg"
  pressed?: boolean
  tooltipSide?: React.ComponentProps<typeof TooltipContent>["side"]
  /** Shown in the tooltip, e.g. "Ctrl B". Not announced twice: aria-keyshortcuts carries it. */
  shortcut?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-keyshortcuts={shortcut?.replace(/\s+/g, "+")}
          aria-label={label}
          aria-pressed={pressed}
          data-slot="icon-button"
          size={size}
          variant={variant}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        {label}
        {shortcut && <span className="ml-2 font-mono text-xs opacity-70">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

/** Copies text, shows a check for 1.5s and announces "Copied" politely. */
function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  size = "icon-sm",
  className,
  ...props
}: Omit<ButtonProps, "size" | "onClick" | "value"> & {
  value: string | (() => string)
  label?: string
  copiedLabel?: string
  size?: "icon-xs" | "icon-sm" | "icon"
}) {
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(t)
  }, [copied])
  return (
    <>
      <IconButton
        className={className}
        label={copied ? copiedLabel : label}
        onClick={() => {
          const text = typeof value === "function" ? value() : value
          void navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false))
        }}
        size={size}
        {...props}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </IconButton>
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  )
}

/**
 * Progress ring for "3 of 5" in tight spots (step counts, upload totals, AI column runs).
 * Always pair it with the words; the ring is decorative unless `label` is given.
 */
function ProgressRing({
  value,
  max = 100,
  size = 20,
  stroke = 2.5,
  tone = "neutral",
  label,
  className,
}: {
  value: number
  max?: number
  size?: number
  stroke?: number
  tone?: "neutral" | "ai" | "success" | "warning" | "error"
  /** When set, the ring is a role="progressbar" with this name. */
  label?: string
  className?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / max))
  const color = {
    neutral: "stroke-on-surface",
    ai: "stroke-tertiary",
    success: "stroke-success",
    warning: "stroke-warning",
    error: "stroke-error",
  }[tone]
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      aria-valuemax={label ? max : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuenow={label ? value : undefined}
      className={cn("shrink-0 -rotate-90", className)}
      data-slot="progress-ring"
      height={size}
      role={label ? "progressbar" : undefined}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
    >
      <circle className="stroke-surface-container-highest" cx={size / 2} cy={size / 2} fill="none" r={r} strokeWidth={stroke} />
      <circle
        className={cn(color, "transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none")}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        strokeWidth={stroke}
      />
    </svg>
  )
}

/** Inline text link in Lark's two styles: `default` ink with a light underline, `hyper` action blue. */
function TextLink({
  variant = "default",
  className,
  external,
  children,
  ...props
}: React.ComponentProps<"a"> & { variant?: "default" | "hyper"; external?: boolean }) {
  return (
    <a
      className={cn(variant === "hyper" ? "link-hyper" : "link-default", "focus-ring rounded-[2px] outline-none", className)}
      data-slot="text-link"
      rel={external ? "noreferrer noopener" : props.rel}
      target={external ? "_blank" : props.target}
      {...props}
    >
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}

export { CopyButton, IconButton, ProgressRing, TextLink }
