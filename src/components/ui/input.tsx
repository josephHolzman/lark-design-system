import * as React from "react"

import { cn } from "@/lib/utils"

/** size: "default" 36px (forms), "sm" 32px (toolbars and filter bars in dense screens). */
function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & { size?: "default" | "sm" }) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input bg-surface-container-lowest h-8 w-full min-w-0 rounded-md border px-2.5 py-1 text-sm pointer-coarse:text-base transition-[color,border-color] hover:border-on-surface-variant outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant disabled:border-outline-variant",
        "data-[size=sm]:h-7 data-[size=sm]:px-2 data-[size=sm]:text-sm pointer-coarse:data-[size=sm]:text-base",
        "focus-visible:border-primary focus-ring",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
