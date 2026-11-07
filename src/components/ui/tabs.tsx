"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

/**
 * variant "underline" (default): Beams page and card tabs, 2px ink line, selected 550.
 * variant "segmented": Beams' record-page switch (recessed track, selected = ink fill).
 * Both are real ARIA tabs; use them when the panel swaps in place.
 */
function TabsList({
  className,
  variant = "underline",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: "underline" | "segmented" }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "group/tabs-list text-on-surface-variant inline-flex w-fit items-center justify-start",
        variant === "underline" && "h-10 gap-5 border-b border-outline-variant",
        variant === "segmented" && "h-[34px] max-w-full gap-0.5 overflow-x-auto rounded-md bg-surface-container-high p-0.5",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-ring text-on-surface-variant hover:text-on-surface data-[state=active]:text-on-surface data-[state=active]:font-semibold relative -mb-px inline-flex h-full items-center justify-center gap-1.5 rounded-sm px-0 text-sm whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-on-surface after:opacity-0 data-[state=active]:after:opacity-100 disabled:pointer-events-none disabled:text-on-surface-tertiary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-[variant=segmented]/tabs-list:h-full group-data-[variant=segmented]/tabs-list:mb-0 group-data-[variant=segmented]/tabs-list:rounded-[6px] group-data-[variant=segmented]/tabs-list:px-3 group-data-[variant=segmented]/tabs-list:after:hidden group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-surface-container-lowest group-data-[variant=segmented]/tabs-list:data-[state=active]:text-on-surface group-data-[variant=segmented]/tabs-list:data-[state=active]:font-medium group-data-[variant=segmented]/tabs-list:data-[state=active]:ring-1 group-data-[variant=segmented]/tabs-list:data-[state=active]:ring-outline-strong dark:group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-surface-container-highest group-data-[variant=segmented]/tabs-list:hover:bg-on-surface/5",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("focus-ring flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
