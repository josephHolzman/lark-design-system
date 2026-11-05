import * as React from "react"
import { Slot as SlotPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Beams badge: 20px pill, 12/18 450, a pale fill (hue-20) with the label in the same
 * hue's dark step (hue-70). Never clickable; use a FilterChip for that.
 */
const badgeVariants = cva(
  "inline-flex h-5 items-center justify-center rounded-full border border-transparent px-2 text-label-md w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-ring aria-invalid:border-destructive transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-outline-variant text-on-surface-variant",
        secondary: "bg-outline-variant text-on-surface-variant",
        outline: "border-outline-strong text-on-surface-variant",
        info: "bg-primary-container text-on-primary-container",
        success: "bg-success-container text-on-success-container",
        warning: "bg-warning-container text-on-warning-container",
        destructive: "bg-error-container text-on-error-container",
        ai: "bg-tertiary-container text-on-tertiary-container",
        selected: "bg-secondary-container text-on-secondary-container",
        teal: "bg-tag-teal text-on-tag-teal",
        pink: "bg-tag-pink text-on-tag-pink",
        olive: "bg-tag-olive text-on-tag-olive",
        inverse: "bg-inverse-surface text-inverse-on-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
