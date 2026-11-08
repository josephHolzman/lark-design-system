"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { MoreLabel, OverflowMeasure, splitOverflow, useOverflow } from "@/components/lark/overflow"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type TabsContextValue = { value?: string; setValue: (value: string) => void }
const TabsContext = React.createContext<TabsContextValue | null>(null)

/**
 * Tabs with `TabsList overflow="menu"`: the list never scrolls or wraps; triggers that don't fit
 * go into a More menu and the active one stays visible. The context tracks the current value for
 * the overflow logic whether the tabs are controlled or not.
 */
function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value !== undefined ? value : inner
  const setValue = React.useCallback(
    (next: string) => {
      if (value === undefined) setInner(next)
      onValueChange?.(next)
    },
    [value, onValueChange]
  )
  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={setValue}
        {...props}
      />
    </TabsContext.Provider>
  )
}

const triggerClass =
  "focus-ring text-on-surface-variant hover:text-on-surface data-[state=active]:text-on-surface data-[state=active]:font-semibold relative -mb-px inline-flex h-full items-center justify-center gap-1.5 rounded-sm px-0 text-sm whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-on-surface after:opacity-0 data-[state=active]:after:opacity-100 disabled:pointer-events-none disabled:text-on-surface-tertiary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-[variant=segmented]/tabs-list:h-full group-data-[variant=segmented]/tabs-list:mb-0 group-data-[variant=segmented]/tabs-list:rounded-[6px] group-data-[variant=segmented]/tabs-list:px-3 group-data-[variant=segmented]/tabs-list:after:hidden group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-surface-container-lowest group-data-[variant=segmented]/tabs-list:data-[state=active]:text-on-surface group-data-[variant=segmented]/tabs-list:data-[state=active]:font-medium group-data-[variant=segmented]/tabs-list:data-[state=active]:ring-1 group-data-[variant=segmented]/tabs-list:data-[state=active]:ring-outline-strong dark:group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-surface-container-highest group-data-[variant=segmented]/tabs-list:hover:bg-on-surface/5"

/**
 * variant "underline" (default): Beams page and card tabs, 2px ink line, selected 550.
 * variant "segmented": Beams' record-page switch (recessed track, selected = ink fill).
 * Both are real ARIA tabs; use them when the panel swaps in place.
 *
 * Tabs never wrap or scroll (v0.9): when the list is narrower than its items, the ones that
 * don't fit move into a "More" menu, the active trigger is pinned, and roving focus still runs
 * through the visible tabs. This is the default; `overflow="menu"` remains as an explicit opt-in.
 */
function TabsList({
  className,
  variant = "underline",
  overflow = "menu",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: "underline" | "segmented"
  overflow?: "menu"
}) {
  const ctx = React.useContext(TabsContext)
  const items = React.Children.toArray(children).filter(
    React.isValidElement
  ) as React.ReactElement<{ value?: string; children?: React.ReactNode }>[]
  const activeIndex =
    overflow === "menu" && ctx?.value !== undefined
      ? items.findIndex((item) => item.props.value === ctx.value)
      : -1
  const { containerRef, measureRef, visible } = useOverflow(
    items.length,
    overflow === "menu" ? activeIndex : -1
  )
  const split =
    overflow === "menu" && items.length > 0 && visible < items.length
      ? splitOverflow(items, visible, activeIndex)
      : null

  // The More trigger is a sibling of the tablist, never a child: a tablist may hold only tabs
  // (axe aria-required-children). It matches the list's height so the row stays one line.
  const moreClass = cn(
    triggerClass,
    "px-2 text-on-surface-variant data-[state=active]:font-normal data-[state=active]:text-on-surface-variant",
    variant === "underline" ? "h-10" : "h-[34px]"
  )

  const focusActive = () => {
    // The chosen trigger was in the menu; once the list re-renders it is visible and focusable.
    requestAnimationFrame(() => {
      containerRef.current
        ?.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]')
        ?.focus()
    })
  }

  return (
    // The frame takes the width it is given; the tab list itself hugs its triggers. Measuring
    // the hugging list would always report "fits", so the overflow is measured on the frame,
    // and the measuring row is always present (it is hidden and out of the tab order).
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className="relative min-w-0 w-full" data-slot="tabs-list-frame">
      <div className="flex min-w-0 items-stretch">
        <TabsPrimitive.List
          data-slot="tabs-list"
          data-variant={variant}
          data-overflow={overflow}
          className={cn(
            "group/tabs-list text-on-surface-variant inline-flex w-fit items-center justify-start",
            variant === "underline" && "h-10 gap-5 border-b border-outline-variant",
            variant === "segmented" &&
              "h-[34px] max-w-full gap-0.5 rounded-md bg-surface-container-high p-0.5",
            overflow === "menu" && "relative flex-nowrap overflow-x-hidden",
            className
          )}
          {...props}
        >
          {split ? split.shown : children}
        </TabsPrimitive.List>
        {split && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={moreClass} type="button">
                <MoreLabel count={split.hidden.length} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {split.hidden.map((item, i) => (
                <DropdownMenuItem
                  key={item.key ?? i}
                  onSelect={() => {
                    if (item.props.value !== undefined) ctx?.setValue(item.props.value)
                    focusActive()
                  }}
                >
                  {item.props.children}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {/* Hidden measuring row: every trigger at its selected width, then the More control. */}
      <OverflowMeasure measureRef={measureRef} className={cn(variant === "underline" ? "gap-5" : "gap-0.5")}>
        {items.map((item, i) => (
          <span className={cn(triggerClass, "pointer-events-none")} data-state="active" key={item.key ?? i}>
            {item.props.children}
          </span>
        ))}
        <span className={moreClass}>
          <MoreLabel count={items.length} />
        </span>
      </OverflowMeasure>
    </div>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(triggerClass, className)}
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
