import { LarkLink as Link } from "./provider";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { CountPill } from "./lists";

export type PageHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  /** Small line above the title: a parent section or a breadcrumb. */
  eyebrow?: ReactNode;
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
 * Beams page header: title 22/28 450 (Apollo's 20px Inter at Hanken's optical size), an
 * optional one-line description (12/18 tertiary; tool and settings pages only), meta, and
 * actions on the right that wrap below on narrow screens. The one h1 on the page.
 */
export function PageHeader({
  eyebrow,
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
            {eyebrow && <div className="text-label-md text-on-surface-variant">{eyebrow}</div>}
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-title-md text-on-surface">{title}</h1>
              {status}
            </div>
            {description && <p className="max-w-[68ch] text-body-sm font-medium text-on-surface-tertiary">{description}</p>}
            {meta && (
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-body-sm text-on-surface-variant [&>*:not(:last-child)]:after:ml-1.5 [&>*:not(:last-child)]:after:content-['·']">
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

/**
 * Section navigation in Beams' underline style (2px ink, selected 550) that is a
 * list of links with aria-current="page", because each tab changes the URL. For panels
 * that swap in place, use ui/tabs (real ARIA tabs) instead.
 */
export function PageTabs({ tabs, label, className }: { tabs: PageTab[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("-mb-px min-w-0 overflow-x-auto border-b border-outline-variant", className)}>
      <ul className="flex w-max items-stretch gap-5" role="list">
        {tabs.map((t) => (
          <li className="flex" key={t.label}>
            <Link
              aria-current={t.current ? "page" : undefined}
              className={cn(
                "focus-ring relative inline-flex h-10 items-center gap-1.5 rounded-sm text-sm whitespace-nowrap text-on-surface-variant outline-none hover:text-on-surface",
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
      </ul>
    </nav>
  );
}
