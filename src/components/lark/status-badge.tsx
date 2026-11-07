import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleDotIcon,
  ClockIcon,
  type LucideIcon,
  PencilLineIcon,
  RotateCcwIcon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "info" | "progress" | "success" | "warning" | "error" | "ai";

const TONE: Record<StatusTone, string> = {
  neutral: "bg-outline-variant text-on-surface-variant",
  info: "bg-outline-variant text-on-surface",
  progress: "bg-primary-container text-on-primary-container",
  ai: "bg-tertiary-container text-on-tertiary-container",
  success: "bg-success-container text-on-success-container",
  warning: "bg-warning-container text-on-warning-container",
  error: "bg-error-container text-on-error-container",
};

/**
 * Deepgrids domain statuses mapped to one tone and one icon each, so the same word is
 * always the same colour everywhere. Unknown statuses fall back to neutral.
 */
export const STATUSES = {
  "Not submitted": { tone: "neutral", icon: CircleDashedIcon },
  Draft: { tone: "neutral", icon: PencilLineIcon },
  Waiting: { tone: "neutral", icon: ClockIcon },
  Pending: { tone: "neutral", icon: ClockIcon },
  "Ready for review": { tone: "progress", icon: CircleDotIcon },
  "In review": { tone: "progress", icon: CircleDotIcon },
  "Awaiting decision": { tone: "warning", icon: ClockIcon },
  "Review required": { tone: "warning", icon: AlertTriangleIcon },
  "Changes requested": { tone: "warning", icon: RotateCcwIcon },
  "Discount exception": { tone: "error", icon: AlertTriangleIcon },
  Rejected: { tone: "error", icon: XCircleIcon },
  Approved: { tone: "success", icon: CheckCircle2Icon },
  "Within pricing limits": { tone: "success", icon: CheckCircle2Icon },
} satisfies Record<string, { tone: StatusTone; icon: LucideIcon }>;

export type KnownStatus = keyof typeof STATUSES;

export type StatusBadgeProps = Omit<ComponentProps<"span">, "children"> & {
  status: KnownStatus | (string & {});
  /** Override the mapped tone (for statuses outside the map). */
  tone?: StatusTone;
  icon?: LucideIcon;
  /** "sm" 20px (tables, lists), "md" 24px (headers). */
  size?: "sm" | "md";
};

/** Tone + icon + word. Never colour alone (WCAG 1.4.1). */
export function StatusBadge({ status, tone, icon, size = "sm", className, ...props }: StatusBadgeProps) {
  const mapped = (STATUSES as Record<string, { tone: StatusTone; icon: LucideIcon }>)[status];
  const t = tone ?? mapped?.tone ?? "neutral";
  const Icon = icon ?? mapped?.icon ?? CircleDotIcon;
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full whitespace-nowrap",
        size === "sm" ? "h-5 px-2 text-meta-strong [&>svg]:size-3" : "h-6 px-2.5 text-label-lg [&>svg]:size-3.5",
        TONE[t],
        className
      )}
      data-slot="status-badge"
      data-tone={t}
      {...props}
    >
      <Icon aria-hidden="true" />
      {status}
    </span>
  );
}
