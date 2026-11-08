"use client";

import { Maximize2Icon, ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/*
  Page archetypes (Beams). Every one is full bleed: no centred max-width columns. The
  shell is exactly the viewport; each archetype decides what scrolls:
    List       header + toolbar fixed; the rail and the table scroll on their own.
    Record     white header band fixed; the grey body scrolls.
    Dashboard  white header band; the grey body scrolls; cards in a responsive grid.
    Settings   section nav fixed on the left; the grey body scrolls.
    Split      list and detail scroll independently.
*/

const gutter = "px-4 md:px-6";

/** White band at the top of a page: the PageHeader and its tabs. */
export function HeaderBand({ children, className, bordered = true }: { children: ReactNode; className?: string; bordered?: boolean }) {
  return <div className={cn("shrink-0 bg-surface pt-3", gutter, bordered && "border-b border-outline-variant", className)}>{children}</div>;
}

/** List page: header, optional banners, a 48px toolbar, an optional 300px filter rail, the table. */
export function ListLayout({
  header,
  banners,
  toolbar,
  rail,
  railLabel = "Filters",
  children,
  className,
}: {
  header: ReactNode;
  banners?: ReactNode;
  toolbar?: ReactNode;
  rail?: ReactNode;
  railLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    // Desktop: the page never scrolls; the grid scrolls inside its own region (Beams).
    // Phone: there is no room for a fixed frame, so the layout grows and the shell scrolls.
    <div className={cn("flex min-h-0 flex-col bg-surface max-md:flex-none md:flex-1", className)} data-slot="list-layout">
      <div className={cn("shrink-0 pt-3", gutter)}>{header}</div>
      {banners && <div className="flex shrink-0 flex-col gap-2 pt-2">{banners}</div>}
      {toolbar && <div className={cn("flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-outline-variant py-2", gutter)}>{toolbar}</div>}
      {rail && (
        // Below lg the rail becomes a disclosure above the results, so filters stay reachable
        // and the grid keeps the full width.
        <details className="group/rail border-b border-outline-variant lg:hidden">
          <summary className="focus-ring flex h-12 cursor-pointer list-none items-center justify-between px-4 text-label-lg [&::-webkit-details-marker]:hidden">
            {railLabel}
            <ChevronDownIcon aria-hidden className="size-4 text-on-surface-variant transition-transform group-open/rail:rotate-180" />
          </summary>
          <div className="max-h-[60svh] overflow-auto">{rail}</div>
        </details>
      )}
      <div className="flex min-h-0 max-md:flex-none md:flex-1">
        {rail && (
          <aside aria-label={railLabel} className="hidden w-[260px] shrink-0 overflow-auto border-r border-outline-variant lg:block xl:w-[300px]">
            {rail}
          </aside>
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

/** Record page: white header band, then a grey body with a 360px left column and the main column. */
export function RecordLayout({
  header,
  aside,
  children,
  className,
  asideOnSmall = "before",
}: {
  header: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Below 1280 the aside stacks: before the main column (record details) or after it (a workbench where the main content matters most). */
  asideOnSmall?: "before" | "after";
}) {
  return (
    // Phones: the page scrolls as one (a fixed header would eat half the screen). md+: the body scrolls under the header.
    <div className={cn("flex min-h-0 flex-col max-md:flex-none md:flex-1", className)} data-slot="record-layout">
      <HeaderBand>{header}</HeaderBand>
      <div className="bg-canvas max-md:flex-none md:min-h-0 md:flex-1 md:overflow-auto">
        {/* The aside sits beside the main column from 1280 (where the sidebar is expanded and the
            main column still gets ~800px); below that it stacks, so tables keep their width. */}
        <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-module-gap p-4 md:p-6", aside && "xl:grid-cols-[360px_minmax(0,1fr)]")}>
          {aside && <div className={cn("flex min-w-0 flex-col gap-module-gap", asideOnSmall === "after" && "max-xl:order-2")}>{aside}</div>}
          <div className="flex min-w-0 flex-col gap-module-gap">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Dashboard: white header band, grey body, full width. Lay cards out with DashboardGrid. */
export function DashboardLayout({ header, children, className }: { header: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-0 flex-col max-md:flex-none md:flex-1", className)} data-slot="dashboard-layout">
      <HeaderBand bordered={false}>{header}</HeaderBand>
      <div className="bg-canvas max-md:flex-none md:min-h-0 md:flex-1 md:overflow-auto">
        <div className="flex flex-col gap-module-gap p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

/**
 * Responsive card grid: `main` + `side` (side column 360), or equal columns. v0.6: cards in a
 * row share one height (the grid stretches them); put stacks of cards in a column wrapper.
 */
export function DashboardGrid({ variant = "main-side", children, className }: { variant?: "main-side" | "halves" | "thirds"; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-module-gap",
        variant === "main-side" && "xl:grid-cols-[minmax(0,1fr)_360px]",
        variant === "halves" && "lg:grid-cols-2",
        variant === "thirds" && "md:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Settings: section nav on the left (220), grey body on the right. */
export function SettingsLayout({
  nav,
  header,
  children,
  className,
  navLabel = "Sections",
}: {
  nav: ReactNode;
  header: ReactNode;
  children: ReactNode;
  className?: string;
  /** Names the section list on phones, where it becomes a disclosure above the page. */
  navLabel?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1", className)} data-slot="settings-layout">
      <aside className="hidden w-[220px] shrink-0 overflow-auto border-r border-outline-variant bg-surface p-2 md:block">{nav}</aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <details className="group/nav border-b border-outline-variant bg-surface md:hidden">
          <summary className="focus-ring flex h-12 cursor-pointer list-none items-center justify-between px-4 text-label-lg [&::-webkit-details-marker]:hidden">
            {navLabel}
            <ChevronDownIcon aria-hidden className="size-4 text-on-surface-variant transition-transform group-open/nav:rotate-180" />
          </summary>
          <div className="p-2">{nav}</div>
        </details>
        <HeaderBand>{header}</HeaderBand>
        <div className="min-h-0 flex-1 overflow-auto bg-canvas">
          <div className="flex flex-col gap-module-gap p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Master–detail (Work inbox): a scrolling list and a scrolling detail. */
export function SplitView({
  list,
  detail,
  listWidth = 360,
  listLabel = "List",
  detailLabel = "Details",
  className,
}: {
  list: ReactNode;
  detail: ReactNode;
  listWidth?: number;
  /** Names the list pane's focusable scroll region (WCAG 2.1.1, 4.1.2). */
  listLabel?: string;
  detailLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1", className)} data-slot="split-view">
      <div
        aria-label={listLabel}
        className="hidden shrink-0 overflow-auto border-r border-outline-variant bg-surface focus-ring outline-none md:block"
        role="region"
        style={{ width: listWidth }}
        tabIndex={0}
      >
        {list}
      </div>
      <div aria-label={detailLabel} className="min-h-0 min-w-0 flex-1 overflow-auto bg-canvas focus-ring outline-none" role="region" tabIndex={0}>
        {detail}
      </div>
    </div>
  );
}

/**
 * Record peek (Apollo's record drawer, Attio's side peek): opens a record over the list
 * at 64% width so the list keeps its place. Header: title, meta, then actions with the
 * primary rightmost and Expand / Close after it. Body: grey, main plus a 360 context column.
 */
export function RecordPeek({
  open,
  onOpenChange,
  title,
  description,
  leading,
  actions,
  onExpand,
  aside,
  footer,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  onExpand?: () => void;
  aside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full gap-0 sm:max-w-none md:w-[64vw] md:min-w-[640px]">
        <SheetHeader className="flex-row items-center gap-3 pr-24">
          {leading}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <SheetTitle className="truncate">{title}</SheetTitle>
            {description && <SheetDescription className="truncate">{description}</SheetDescription>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          {onExpand && (
            <Button aria-label="Open full page" className="absolute top-3 right-12" onClick={onExpand} size="icon" variant="ghost">
              <Maximize2Icon />
            </Button>
          )}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-auto bg-canvas">
          <div className={cn("grid gap-module-gap p-4 sm:p-6", aside && "lg:grid-cols-[minmax(0,1fr)_360px]")}>
            <div className="flex min-w-0 flex-col gap-module-gap">{children}</div>
            {aside && <div className="flex min-w-0 flex-col gap-module-gap">{aside}</div>}
          </div>
        </div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Create drawer (Apollo's New List): 480 wide, stacked fields, footer with Cancel and the
 * primary at 40px. Create flows use this, not a centred modal; dialogs are for confirmations.
 */
export function CreateDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitLabel = "Create",
  onSubmit,
  submitting,
  submitDisabled,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  submitLabel?: string;
  onSubmit: () => void;
  submitting?: boolean;
  submitDisabled?: boolean;
}) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full gap-0 sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-module-gap overflow-auto p-4 sm:p-6">{children}</div>
          <SheetFooter>
            <Button onClick={() => onOpenChange(false)} size="lg" type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={submitting || submitDisabled} size="lg" type="submit">
              {submitting ? "Creating…" : submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
