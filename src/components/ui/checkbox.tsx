"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { CheckIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer focus-ring hit-area size-4 shrink-0 rounded-sm border border-outline bg-surface-container-lowest transition-colors outline-none hover:border-on-surface-variant data-[state=checked]:border-on-surface data-[state=checked]:bg-on-surface data-[state=checked]:text-surface data-[state=indeterminate]:border-on-surface data-[state=indeterminate]:bg-on-surface data-[state=indeterminate]:text-surface aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator grid place-content-center text-current transition-none"
      >
        {/* Mixed state reads as a dash, never a check: "some rows" must not look like "all rows". */}
        <CheckIcon className="size-3 group-data-[state=indeterminate]/indicator:hidden" strokeWidth={3} />
        <MinusIcon className="hidden size-3 group-data-[state=indeterminate]/indicator:block" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
