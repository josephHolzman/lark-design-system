"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
  MasterDetail (v0.8): a record list beside the record it opens, following the component's own
  width (48rem, not the viewport). Wide: the list is a fixed 22rem and both panes scroll on
  their own. Narrow: one pane at a time, the detail with a "Back to <listLabel>" button.
  Opening the detail moves focus to its heading; going back returns focus to the selected row.
*/

const WIDE = 48 * 16;

export type MasterDetailProps = {
  list: ReactNode;
  detail: ReactNode;
  /** The open record. When set, the list's selected row should announce it (`selected`). */
  selected?: string;
  /** Back from the detail on narrow widths. */
  onBack?: () => void;
  /** Names the list and the back button: "Back to <listLabel>". */
  listLabel: string;
  /** Names the detail region for screen readers. */
  detailLabel?: string;
  /** Override the back button's words. */
  backLabel?: string;
  className?: string;
};

/** True while the component itself is narrower than 48rem (jsdom has no layout: treat it as narrow). */
function isNarrow(el: HTMLElement | null) {
  if (!el) return true;
  return el.clientWidth === 0 || el.clientWidth < WIDE;
}

export function MasterDetail({ list, detail, selected, onBack, listLabel, detailLabel = "Details", backLabel, className }: MasterDetailProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  // The row that was open: by the time Back runs, the caller has usually cleared `selected`,
  // so the row no longer says aria-pressed. Remember the element while it still does.
  const openRow = useRef<HTMLElement | null>(null);
  const previous = useRef<string | undefined>(selected);
  const mounted = useRef(false);

  useEffect(() => {
    const selectedRow = () =>
      listRef.current?.querySelector<HTMLElement>('[aria-current]:not([aria-current="false"])') ??
      listRef.current?.querySelector<HTMLElement>('[aria-selected="true"], [aria-pressed="true"], [data-selected] a, [data-selected] button');
    const was = previous.current;
    previous.current = selected;
    if (selected && (was !== selected || openRow.current === null)) openRow.current = selectedRow() ?? openRow.current;
    // A page that deep-links to a record keeps focus where it is until the record changes.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!isNarrow(rootRef.current) || was === selected) return;
    if (selected) {
      // The detail's own heading is the reading position after a record opens.
      const heading = detailRef.current?.querySelector<HTMLElement>("h1, h2, h3, h4, h5, h6, [data-detail-heading]");
      const target = heading ?? detailRef.current;
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus();
    } else if (was) {
      // Back: the row that was open, not the top of the list.
      const remembered = openRow.current?.isConnected ? openRow.current : null;
      openRow.current = null;
      const target = remembered ?? selectedRow() ?? listRef.current;
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus();
    }
  }, [selected]);

  return (
    <div
      className={cn("@container/master-detail flex h-full min-h-0 min-w-0", className)}
      data-selected={selected || undefined}
      data-slot="master-detail"
      ref={rootRef}
    >
      <div
        aria-label={listLabel}
        className={cn(
          "min-h-0 w-full shrink-0 overflow-auto border-outline-variant bg-surface",
          "@[48rem]/master-detail:w-[22rem] @[48rem]/master-detail:border-r",
          selected && "hidden @[48rem]/master-detail:block"
        )}
        data-slot="master-detail-list"
        role="region"
        ref={listRef}
        tabIndex={-1}
      >
        {list}
      </div>
      <div
        aria-label={detailLabel}
        className={cn("min-h-0 min-w-0 flex-1 overflow-auto bg-canvas", !selected && "hidden @[48rem]/master-detail:block")}
        data-slot="master-detail-detail"
        ref={detailRef}
        role="region"
        tabIndex={-1}
      >
        {selected && onBack && (
          <div className="border-b border-outline-variant p-2 @[48rem]/master-detail:hidden">
            <Button onClick={onBack} size="sm" variant="ghost">
              <ArrowLeftIcon />
              {backLabel ?? `Back to ${listLabel}`}
            </Button>
          </div>
        )}
        {detail}
      </div>
    </div>
  );
}
