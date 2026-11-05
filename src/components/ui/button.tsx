import * as React from "react"
import { Slot as SlotPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Beams buttons. 32px, 8px corners, label 14/20 450 (Beams 13 at Hanken's optical size).
 * One `default` (the sky brand button) per view; `secondary` is the everyday button.
 * Disabled is a grey fill with a muted label, never a faded colour.
 * Order in a group: ghost → secondary → default (rightmost).
 */
const buttonVariants = cva(
  "state-layer focus-ring hit-area inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-label-lg transition-[color,background-color,border-color] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Beams primary, in Lark sky. Explicit hover/pressed fills instead of the ink overlay.
        default:
          "bg-brand text-on-brand [--state-hover:0] [--state-pressed:0] hover:bg-brand-hover active:bg-brand-pressed disabled:bg-surface-container-high disabled:text-on-surface-tertiary",
        // Beams secondary: near-white with a 12% ink edge.
        secondary:
          "border border-outline-strong bg-surface-container-lowest text-on-surface dark:bg-surface-container [&_svg]:text-on-surface-variant disabled:bg-surface-container-low disabled:text-on-surface-tertiary",
        outline:
          "border border-outline-strong bg-surface-container-lowest text-on-surface dark:bg-surface-container [&_svg]:text-on-surface-variant disabled:bg-surface-container-low disabled:text-on-surface-tertiary",
        // Beams tertiary.
        ghost: "bg-transparent text-on-surface [&_svg]:text-on-surface-variant disabled:text-on-surface-tertiary",
        // Beams reversed: the dark button (top bar's AI entry point).
        reversed:
          "bg-inverse-surface text-inverse-on-surface [&_svg]:text-inverse-on-surface disabled:bg-surface-container-high disabled:text-on-surface-tertiary",
        // Beams AI: iris tint and edge. For ACE actions inside a page.
        ai: "border border-ai-border bg-tertiary-container text-on-tertiary-container [&_svg]:text-on-tertiary-container disabled:border-transparent disabled:bg-surface-container-high disabled:text-on-surface-tertiary",
        destructive: "bg-error text-on-error disabled:bg-surface-container-high disabled:text-on-surface-tertiary",
        // A real link that looks like Beams' default link (ink text, light underline).
        link: "link-default h-auto px-0 has-[>svg]:px-0 before:hidden",
      },
      size: {
        xs: "h-6 gap-1 rounded-[6px] px-2 text-label-md has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-7 gap-1 px-2.5 has-[>svg]:px-2",
        default: "h-8 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-4 has-[>svg]:px-3.5",
        "icon-xs": "size-6 rounded-[6px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-7",
        icon: "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
