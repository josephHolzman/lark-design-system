"use client";

import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

/*
  Overflow (v0.7): tabs and segmented controls never wrap and never scroll sideways.
  Items that don't fit go into a "More" menu at the end; the current item is pinned so it
  always stays visible. A hidden measuring row (visibility: hidden, so out of the tab order
  and the accessibility tree) holds every item at its widest (selected) weight.
*/

/** `inset`: px the items lose to the container (a track's padding). */
export function useOverflow(count: number, pinned = -1, inset = 0) {
  const containerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(count);
  useLayoutEffect(() => {
    const c = containerRef.current;
    const m = measureRef.current;
    if (!c || !m || typeof ResizeObserver === "undefined") return;
    const calc = () => {
      // Not laid out (display: none, a closed panel, jsdom): show everything rather than guess.
      if (c.clientWidth === 0) return setVisible(count);
      const kids = Array.from(m.children) as HTMLElement[];
      const more = kids.pop();
      if (!more) return;
      const gap = parseFloat(getComputedStyle(m).columnGap) || 0;
      const widths = kids.map((k) => k.getBoundingClientRect().width);
      // A shrink-to-fit control (w-fit) reports its content width, so its own clientWidth can
      // never overflow. Compare with the space its parent gives it as well.
      const avail = Math.min(c.clientWidth, c.parentElement?.clientWidth ?? c.clientWidth) - inset;
      const total = widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, widths.length - 1);
      if (total <= avail + 0.5) return setVisible(count);
      let used = more.getBoundingClientRect().width;
      let n = 0;
      if (pinned >= 0 && pinned < widths.length) {
        used += widths[pinned] + gap;
        n = 1;
      }
      for (let i = 0; i < widths.length; i++) {
        if (i === pinned) continue;
        if (used + widths[i] + gap > avail) break;
        used += widths[i] + gap;
        n++;
      }
      setVisible(Math.max(pinned >= 0 ? 1 : 0, n));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(c);
    return () => ro.disconnect();
  }, [count, pinned, inset]);
  return { containerRef, measureRef, visible };
}

/** Splits items into the ones shown (in order, the pinned one kept) and the ones in "More". */
export function splitOverflow<T>(items: T[], visible: number, pinned = -1): { shown: T[]; hidden: T[] } {
  if (visible >= items.length) return { shown: items, hidden: [] };
  const order = items.map((_, i) => i);
  const free = order.filter((i) => i !== pinned).slice(0, pinned >= 0 ? visible - 1 : visible);
  const keep = new Set(pinned >= 0 ? [...free, pinned] : free);
  return { shown: items.filter((_, i) => keep.has(i)), hidden: items.filter((_, i) => !keep.has(i)) };
}

/** The measuring row: render every item (at its widest) and the More trigger, last. */
export function OverflowMeasure({ measureRef, className, children }: { measureRef: React.RefObject<HTMLDivElement | null>; className?: string; children: ReactNode }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none invisible absolute top-0 left-0 flex w-max ${className ?? ""}`} data-slot="overflow-measure" ref={measureRef}>
      {children}
    </div>
  );
}

export function MoreLabel({ count }: { count: number }) {
  return (
    <>
      More
      <span className="sr-only">, {count} more</span>
      <ChevronDownIcon aria-hidden="true" className="size-4" />
    </>
  );
}
