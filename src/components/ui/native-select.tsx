import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A styled native <select>: native keyboard, typeahead and mobile pickers for free.
 * Prefer it for filters and forms; use Select only when options need icons.
 */
function NativeSelect({
  className,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & { size?: "default" | "sm" }) {
  return (
    <div className={cn("relative inline-flex w-fit min-w-0", className)} data-slot="native-select-wrapper">
      <select
        className={cn(
          "focus-ring w-full min-w-0 appearance-none rounded-md border border-outline bg-surface-container-lowest hover:border-on-surface-variant pr-8 pl-3 text-sm pointer-coarse:text-base text-on-surface outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
          size === "default" ? "h-8 pl-2.5" : "h-7 pl-2",
          "[&>option]:bg-popover [&>option]:text-popover-foreground"
        )}
        data-size={size}
        data-slot="native-select"
        {...props}
      />
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-on-surface-variant"
      />
    </div>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" {...props} />
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
