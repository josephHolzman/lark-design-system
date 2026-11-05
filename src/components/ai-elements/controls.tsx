"use client";

import { cn } from "@/lib/utils";
import { Controls as ControlsPrimitive } from "@xyflow/react";
import type { ComponentProps } from "react";

export type ControlsProps = ComponentProps<typeof ControlsPrimitive>;

/** Floating toolbar in Beams' popover style: 28px icon buttons on a bordered white strip. */
export const Controls = ({ className, ...props }: ControlsProps) => (
  <ControlsPrimitive
    className={cn(
      "m-3! flex gap-0.5 overflow-hidden rounded-md border border-outline-variant bg-popover p-0.5 text-on-surface-variant shadow-md!",
      "[&>button]:size-7! [&>button]:rounded-[6px] [&>button]:border-none! [&>button]:bg-transparent! [&>button]:text-on-surface-variant",
      "[&>button:hover]:bg-on-surface/8! [&>button:focus-visible]:outline-3 [&>button:focus-visible]:outline-offset-2 [&>button:focus-visible]:outline-ring",
      "[&>button_svg]:size-3.5! [&>button_svg]:fill-current!",
      className
    )}
    {...props}
  />
);
