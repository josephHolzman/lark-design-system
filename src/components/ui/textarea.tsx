import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-surface-container-lowest px-2.5 py-1.5 text-sm pointer-coarse:text-base transition-[color,border-color] hover:border-on-surface-variant focus-visible:border-primary outline-none focus-ring disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant disabled:border-outline-variant",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
