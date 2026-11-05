import { cn } from "@/lib/utils";
import { Panel as PanelPrimitive } from "@xyflow/react";
import type { ComponentProps } from "react";

type PanelProps = ComponentProps<typeof PanelPrimitive>;

/** Floating panel over the canvas: surface-container, radius 16, level-2 shadow. */
export const Panel = ({ className, ...props }: PanelProps) => (
  <PanelPrimitive
    className={cn(
      "m-3! overflow-hidden rounded-lg border border-outline-variant bg-popover p-1 text-on-surface shadow-md",
      className
    )}
    {...props}
  />
);
