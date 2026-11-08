"use client";

import { useRef, type ReactNode } from "react";

import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { PageTabs, type PageTab } from "./page-header";

/*
  RecordDrawer (v0.8): a record opened over the page. A right sheet at 32, 44 or 60rem; full
  screen under 640. The header carries the record's mark, title, subtitle and badges, then its
  section tabs (which overflow into More like PageTabs). The body scrolls; the footer holds the
  record's actions. Radix gives the focus trap and Escape; the opener gets focus back on close.
*/

const SIZES = {
  md: "sm:w-[32rem]",
  lg: "sm:w-[44rem]",
  xl: "sm:w-[60rem]",
} as const;

export type RecordDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** A small mark for the record (a lucide icon or an IconChip). Ignored when `logo` is set. */
  icon?: ReactNode;
  /** A company logo or other full-size mark. */
  logo?: ReactNode;
  /** Status badges beside the subtitle. */
  badges?: ReactNode;
  /** Section links, in the PageTabs underline style. Overflow goes into More. */
  tabs?: PageTab[];
  tabsLabel?: string;
  children: ReactNode;
  /** The record's actions, ruled off at the bottom. */
  footer?: ReactNode;
  size?: keyof typeof SIZES;
  className?: string;
};

export function RecordDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  logo,
  badges,
  tabs,
  tabsLabel = "Record sections",
  children,
  footer,
  size = "lg",
  className,
}: RecordDrawerProps) {
  // Radix returns focus to a DialogTrigger; a controlled drawer has none, so remember the
  // element that opened it and put focus back there ourselves. onOpenAutoFocus runs before
  // Radix moves focus into the drawer, so the opener is still the active element.
  const opener = useRef<HTMLElement | null>(null);

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className={cn("w-full gap-0 sm:max-w-full", SIZES[size], className)}
        data-size={size}
        data-slot="record-drawer"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          const target = opener.current;
          opener.current = null;
          if (target?.isConnected) target.focus();
        }}
        onOpenAutoFocus={() => {
          opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
      >
        <SheetHeader className="flex-row items-start gap-3">
          {(logo || icon) && (
            <div className="shrink-0" data-slot="record-drawer-mark">
              {logo ?? (
                <span className="inline-flex size-10 items-center justify-center rounded-md bg-inset text-on-surface-variant [&_svg]:size-5">{icon}</span>
              )}
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <SheetTitle className="line-clamp-2 [overflow-wrap:break-word]">{title}</SheetTitle>
            {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
            {badges && <div className="flex flex-wrap items-center gap-2 pt-1">{badges}</div>}
          </div>
        </SheetHeader>
        {tabs && tabs.length > 0 && (
          <div className="px-4" data-slot="record-drawer-tabs">
            <PageTabs label={tabsLabel} tabs={tabs} />
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-auto bg-canvas" data-slot="record-drawer-body">
          {children}
        </div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
