"use client";

import { ArrowLeftIcon, ChevronDownIcon } from "lucide-react";

import { LarkLink as Link } from "./provider";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { CountPill } from "./lists";
import { MoreLabel, OverflowMeasure, splitOverflow, useOverflow } from "./overflow";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type PageHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  /**
   * Deprecated: the shell's breadcrumb already says where the page sits, and Lark has no
   * eyebrow over a title (§1, §5). Any value is folded into the meta line under the title, so
   * 0.5 callers keep their words without the eyebrow.
   */
  eyebrow?: ReactNode;
  /** v0.6: "← Back to deals" above the title, for pages reached from a list or a flow. */
  back?: { label: string; href: string };
  /** Leading mark (CompanyLogo for a deal or account). */
  leading?: ReactNode;
  title: ReactNode;
  /** Status next to the title. */
  status?: ReactNode;
  description?: ReactNode;
  /** One line of facts: owner · revision · source. */
  meta?: ReactNode;
  actions?: ReactNode;
  /** PageTabs go here so they sit on the header's bottom edge. */
  tabs?: ReactNode;
};

/**
 * Page header (v0.6.1): title 30/36 at regular weight with tight tracking (size carries the
 * hierarchy, Cohere; section titles are 24, card titles 16), a lifecycle or status badge beside it, one or two lines of description in
 * 14/20 secondary text, a meta line, and the page's text actions on the right (the only header
 * in Lark that holds text buttons). Tabs sit on its bottom edge. The one h1 on the page.
 */
export function PageHeader({
  eyebrow,
  back,
  leading,
  title,
  status,
  description,
  meta,
  actions,
  tabs,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cn("flex min-w-0 flex-col gap-4", className)} data-slot="page-header" {...props}>
      {/* Container-driven, not viewport-driven: actions sit beside the title while the title keeps
          at least 28rem, and wrap below it otherwise (sidebars, peeks and split views included). */}
      <div className="flex min-w-0 flex-wrap items-start gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-[1_1_min(100%,28rem)] items-start gap-3">
          {leading && <div className="shrink-0 pt-0.5">{leading}</div>}
          <div className="flex min-w-0 flex-col gap-1">
            {back && (
              <Link className="focus-ring hit-area mb-1 inline-flex min-h-6 w-fit items-center gap-1.5 rounded-sm text-sm text-on-surface-variant outline-none hover:text-on-surface" href={back.href}>
                <ArrowLeftIcon aria-hidden className="size-4" />
                {back.label}
              </Link>
            )}
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-title-md text-on-surface md:text-title-lg">{title}</h1>
              {status}
            </div>
            {description && <p className="max-w-[68ch] text-sm text-on-surface-variant">{description}</p>}
            {(meta || eyebrow) && (
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-meta text-on-surface-variant [&>*:not(:last-child)]:after:ml-1.5 [&>*:not(:last-child)]:after:content-['·']">
                {eyebrow}
                {meta}
              </div>
            )}
          </div>
        </div>
        {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {tabs}
    </header>
  );
}

export type PageTab = { label: string; href: string; count?: number; current?: boolean };

const TAB =
  "focus-ring relative inline-flex h-10 items-center gap-1.5 rounded-sm text-sm whitespace-nowrap text-on-surface-variant outline-none hover:text-on-surface";

/**
 * Section navigation in Beams' underline style (2px ink, selected 550) that is a
 * list of links with aria-current="page", because each tab changes the URL. For panels
 * that swap in place, use ui/tabs (real ARIA tabs) instead.
 * v0.7: never wraps or scrolls. Tabs that don't fit go into a "More" menu; the current tab
 * always stays in the bar.
 */
export function PageTabs({ tabs, label, className }: { tabs: PageTab[]; label: string; className?: string }) {
  const pinned = tabs.findIndex((t) => t.current);
  const { containerRef, measureRef, visible } = useOverflow(tabs.length, pinned);
  const { shown, hidden } = splitOverflow(tabs, visible, pinned);
  return (
    <nav aria-label={label} className={cn("relative -mb-px min-w-0 overflow-hidden border-b border-outline-variant", className)} data-slot="page-tabs" ref={containerRef as React.RefObject<HTMLElement>}>
      <ul className="flex items-stretch gap-5" role="list">
        {shown.map((t) => (
          <li className="flex" key={t.label}>
            <Link
              aria-current={t.current ? "page" : undefined}
              className={cn(
                TAB,
                "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-on-surface after:opacity-0",
                "aria-[current=page]:font-semibold aria-[current=page]:text-on-surface aria-[current=page]:after:opacity-100"
              )}
              href={t.href}
            >
              {t.label}
              {t.count != null && <CountPill value={t.count} variant="pill" />}
            </Link>
          </li>
        ))}
        {hidden.length > 0 && (
          <li className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger className={TAB} data-slot="tabs-more">
                <MoreLabel count={hidden.length} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hidden.map((t) => (
                  <DropdownMenuItem asChild key={t.label}>
                    <Link href={t.href}>
                      {t.label}
                      {t.count != null && <CountPill className="ml-auto" value={t.count} variant="pill" />}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )}
      </ul>
      <OverflowMeasure className="gap-5" measureRef={measureRef}>
        {tabs.map((t) => (
          <span className={cn(TAB, "font-semibold")} key={t.label}>
            {t.label}
            {t.count != null && <CountPill value={t.count} variant="pill" />}
          </span>
        ))}
        <span className={TAB}>
          More <ChevronDownIcon className="size-4" />
        </span>
      </OverflowMeasure>
    </nav>
  );
}
