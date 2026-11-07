import { cn } from "@/lib/utils";
import { Handle, Position } from "@xyflow/react";
import {
  AlertCircleIcon,
  CheckIcon,
  CircleIcon,
  LoaderCircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

/**
 * Lark workflow node.
 *
 * A Beams result card on the canvas (radius 12, hairline, elevation-2). The node's kind
 * sets the hue of the 28px round icon (Beams hues: blue trigger, iris AI, ember
 * decision, neutral tool, green output), the way Google's Opal colour-codes step types, so a graph can be scanned by role before it is read. Kind is never the
 * only cue: every node also carries a title, and status is an icon plus a word.
 */
export type NodeKind = "trigger" | "ai" | "decision" | "tool" | "output" | "default";
export type NodeStatus = "idle" | "queued" | "running" | "done" | "error";

export type NodeProps = ComponentProps<"div"> & {
  handles: {
    target: boolean;
    source: boolean;
  };
  kind?: NodeKind;
  status?: NodeStatus;
};

const handleClass = cn(
  // 12px visible dot; the ::after extends the pointer target to 28px (WCAG 2.5.8).
  "size-3! min-h-0! min-w-0! rounded-full! border-2! border-outline! bg-card!",
  "transition-[border-color,background-color] duration-150",
  "after:absolute after:-inset-2 after:rounded-full after:content-['']",
  "group-hover/node:border-primary! [.connectingfrom]:border-primary! [.connectingto]:border-primary! [.valid]:bg-primary!"
);

export const Node = ({
  handles,
  kind = "default",
  status,
  className,
  children,
  ...props
}: NodeProps) => (
  <div
    className={cn(
      "node-container group/node relative flex w-64 flex-col rounded-lg border border-edge bg-card text-card-foreground shadow-raised",
      "transition-[box-shadow,border-color] duration-150",
      "in-[.selected]:border-primary in-[.selected]:shadow-raised-focus",
      "data-[status=running]:border-primary/50 data-[status=error]:border-error",
      className
    )}
    data-kind={kind}
    data-slot="node"
    data-status={status}
    {...props}
  >
    {handles.target && (
      <Handle className={handleClass} position={Position.Left} type="target" />
    )}
    {handles.source && (
      <Handle className={handleClass} position={Position.Right} type="source" />
    )}
    {children}
  </div>
);

export type NodeHeaderProps = ComponentProps<"div">;
export const NodeHeader = ({ className, ...props }: NodeHeaderProps) => (
  <div
    className={cn("flex min-h-12 items-center gap-2.5 px-3 pt-3 pb-2", className)}
    data-slot="node-header"
    {...props}
  />
);

const KIND_CHIP: Record<NodeKind, string> = {
  trigger: "bg-primary-container text-on-primary-container",
  ai: "bg-tertiary-container text-on-tertiary-container",
  decision: "bg-warning-container text-on-warning-container",
  tool: "bg-surface-container-high text-on-surface-variant",
  output: "bg-success-container text-on-success-container",
  default: "bg-surface-container-high text-on-surface-variant",
};

export type NodeIconProps = ComponentProps<"span"> & { kind?: NodeKind };
/** 28px tonal chip. Pass the same kind as the Node (or omit for neutral). */
export const NodeIcon = ({ kind = "default", className, ...props }: NodeIconProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
      KIND_CHIP[kind],
      className
    )}
    data-slot="node-icon"
    {...props}
  />
);

export type NodeHeadingProps = ComponentProps<"div">;
/** Title and description stacked; takes the free width in the header. */
export const NodeHeading = ({ className, ...props }: NodeHeadingProps) => (
  <div className={cn("flex min-w-0 flex-1 flex-col", className)} {...props} />
);

export type NodeTitleProps = ComponentProps<"div">;
export const NodeTitle = ({ className, ...props }: NodeTitleProps) => (
  <div className={cn("truncate text-label-lg", className)} data-slot="node-title" {...props} />
);

export type NodeDescriptionProps = ComponentProps<"div">;
export const NodeDescription = ({ className, ...props }: NodeDescriptionProps) => (
  <div
    className={cn("truncate text-body-sm text-on-surface-variant", className)}
    data-slot="node-description"
    {...props}
  />
);

export type NodeActionProps = ComponentProps<"div">;
export const NodeAction = ({ className, ...props }: NodeActionProps) => (
  <div className={cn("ml-auto flex shrink-0 items-center gap-1", className)} {...props} />
);

const STATUS: Record<NodeStatus, { label: string; icon: ReactNode; tone: string }> = {
  idle: { label: "Idle", icon: <CircleIcon />, tone: "text-on-surface-variant" },
  queued: { label: "Queued", icon: <CircleIcon />, tone: "text-on-surface-variant" },
  running: {
    label: "Running",
    icon: <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" />,
    tone: "text-primary",
  },
  done: { label: "Done", icon: <CheckIcon />, tone: "text-success" },
  error: { label: "Failed", icon: <AlertCircleIcon />, tone: "text-error" },
};

export type NodeStatusBadgeProps = ComponentProps<"span"> & { status: NodeStatus };
/** Icon and word, never colour alone. */
export const NodeStatusBadge = ({ status, className, ...props }: NodeStatusBadgeProps) => {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 text-label-md [&_svg]:size-3.5",
        s.tone,
        className
      )}
      data-slot="node-status"
      {...props}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

export type NodeContentProps = ComponentProps<"div">;
export const NodeContent = ({ className, ...props }: NodeContentProps) => (
  <div
    className={cn("flex flex-col gap-1.5 px-3 pb-3 text-sm text-on-surface", className)}
    data-slot="node-content"
    {...props}
  />
);

export type NodeFieldProps = ComponentProps<"div"> & { label: ReactNode; mono?: boolean };
/** One key-value row inside NodeContent. */
export const NodeField = ({ label, mono, className, children, ...props }: NodeFieldProps) => (
  <div
    className={cn("flex min-w-0 items-baseline justify-between gap-3 text-body-sm", className)}
    {...props}
  >
    <span className="shrink-0 text-on-surface-variant">{label}</span>
    <span className={cn("min-w-0 truncate text-right", mono && "font-mono text-xs")}>{children}</span>
  </div>
);

export type NodeFooterProps = ComponentProps<"div">;
export const NodeFooter = ({ className, ...props }: NodeFooterProps) => (
  <div
    className={cn(
      "flex items-center gap-2 border-t border-outline-variant px-3 py-2 text-body-sm text-on-surface-variant",
      className
    )}
    data-slot="node-footer"
    {...props}
  />
);
