"use client";

import { type ComponentProps, type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/*
  Narrow behaviour (v0.7). Text that may not fit says how it gives way:
  · TruncateText: one line with an ellipsis (names in rows, chips, tabs).
  · ClampText: n lines, then an ellipsis (titles and descriptions: 2).
  When the text is actually cut, the full text is one hover or one Tab away (a tooltip on a
  focusable span), so nothing is lost for a sighted keyboard user (WCAG 1.4.13, 2.1.1).
  Screen readers always read the full text: clipping is visual only.
  Names and numbers never break mid-word: use NoBreak (or `whitespace-nowrap tabular-nums`).
*/

function useClipped<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [clipped, setClipped] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => setClipped(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, clipped] as const;
}

type TextProps = Omit<ComponentProps<"span">, "children"> & {
  children: ReactNode;
  /** The full text for the tooltip when `children` isn't a string. */
  full?: string;
};

function withTooltip(clipped: boolean, full: ReactNode, node: ReactNode) {
  if (!clipped) return node;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent className="max-w-80 text-body-md">{full}</TooltipContent>
    </Tooltip>
  );
}

/** One line, ellipsis; the full text in a tooltip when cut. Needs a width (min-w-0 in flex). */
export function TruncateText({ children, full, className, ...props }: TextProps) {
  const [ref, clipped] = useClipped<HTMLSpanElement>();
  return withTooltip(
    clipped,
    full ?? children,
    <span className={cn("block min-w-0 truncate", clipped && "focus-ring rounded-xs outline-none", className)} data-slot="truncate-text" ref={ref} tabIndex={clipped ? 0 : undefined} {...props}>
      {children}
    </span>
  );
}

const CLAMP = { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" } as const;

/** `lines` lines (default 2), ellipsis; the full text in a tooltip when cut. */
export function ClampText({ children, full, lines = 2, className, ...props }: TextProps & { lines?: 1 | 2 | 3 | 4 }) {
  const [ref, clipped] = useClipped<HTMLSpanElement>();
  return withTooltip(
    clipped,
    full ?? children,
    <span className={cn("block min-w-0 [overflow-wrap:break-word]", CLAMP[lines], clipped && "focus-ring rounded-xs outline-none", className)} data-slot="clamp-text" ref={ref} tabIndex={clipped ? 0 : undefined} {...props}>
      {children}
    </span>
  );
}

/** Names, amounts, IDs and dates: never broken mid-word. Tabular figures. */
export function NoBreak({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("whitespace-nowrap tabular-nums", className)} data-slot="no-break" {...props} />;
}
