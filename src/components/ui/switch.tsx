"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer focus-ring hit-area inline-flex h-[18px] w-8 shrink-0 items-center rounded-full p-0.5 transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-on-surface data-[state=unchecked]:bg-outline",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-3.5 rounded-full bg-surface-container-lowest transition-transform data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-3.5"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
