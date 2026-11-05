import { cn } from "@/lib/utils";
import { NodeToolbar, Position } from "@xyflow/react";
import type { ComponentProps } from "react";

type ToolbarProps = ComponentProps<typeof NodeToolbar>;

/** Floating toolbar under a selected node (M3 floating toolbar, no border). */
export const Toolbar = ({ className, ...props }: ToolbarProps) => (
  <NodeToolbar
    className={cn(
      "flex items-center gap-0.5 rounded-md border border-outline-variant bg-popover p-0.5 text-on-surface-variant shadow-md",
      className
    )}
    offset={12}
    position={Position.Bottom}
    {...props}
  />
);
