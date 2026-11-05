"use client";

import {
  ChevronRightIcon,
  ChevronsUpDownIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";
import { LarkLink as Link } from "./provider";
import { useTheme } from "./theme";
import { Fragment, type ReactNode, useEffect, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { AceMark, PersonAvatar } from "./identity";

/* ---------------------------------------------------------------- AppShell */

/**
 * Beams frame: a flush 240px white sidebar with a hairline, the page beside it. Built on
 * shadcn's sidebar, so collapse to a rail, the mobile sheet and Ctrl/⌘ B come for free.
 */
export function AppShell({
  sidebar,
  topbar,
  children,
  defaultOpen = true,
  compactBelow = 1280,
}: {
  sidebar: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /**
   * Below this width (and above the phone sheet) the sidebar starts as a 48px icon rail, so
   * tablets and small laptops keep room for full-bleed tables. The person can still expand it.
   * Pass 0 to turn this off.
   */
  compactBelow?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (!compactBelow) return;
    const mql = window.matchMedia(`(max-width: ${compactBelow - 1}px)`);
    const apply = () => setOpen(mql.matches ? false : defaultOpen);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [compactBelow, defaultOpen]);
  return (
    <SidebarProvider onOpenChange={setOpen} open={open}>
      {sidebar}
      {/* Beams: the shell is exactly the viewport; the document never scrolls. Each page
          layout decides which region scrolls (see layouts.tsx). */}
      <SidebarInset className="h-svh min-w-0 overflow-hidden">
        {topbar}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/* ---------------------------------------------------------------- AppSidebar */

export type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  count?: number;
  /** Accessible meaning of the count, e.g. "12 need action". */
  countLabel?: string;
  current?: boolean;
  items?: { label: string; href: string; current?: boolean }[];
};

export type NavGroup = { label?: string; items: NavItem[] };

export function AppSidebar({
  workspace,
  groups,
  footer,
}: {
  workspace: { name: string; subtitle: string; mark?: ReactNode };
  groups: NavGroup[];
  footer?: ReactNode;
}) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-brand text-on-brand">
                    {workspace.mark ?? <span className="text-sm font-semibold">{workspace.name[0]}</span>}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-label-lg text-on-surface">{workspace.name}</span>
                    <span className="truncate text-body-sm text-on-surface-variant">{workspace.subtitle}</span>
                  </span>
                  <ChevronsUpDownIcon aria-hidden="true" className="ml-auto text-on-surface-variant" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuItem>{workspace.name}</DropdownMenuItem>
                <DropdownMenuItem>Northwind sandbox</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All spaces</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g, gi) => (
          <SidebarGroup key={g.label ?? gi}>
            {g.label && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {g.items.map((item) =>
                item.items ? (
                  <Collapsible asChild defaultOpen={item.items.some((s) => s.current)} key={item.label}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="group/collapsible" tooltip={item.label}>
                          {item.icon}
                          <span>{item.label}</span>
                          <ChevronRightIcon
                            aria-hidden="true"
                            className="ml-auto text-on-surface-variant transition-transform group-data-[state=open]/collapsible:rotate-90"
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((s) => (
                            <SidebarMenuSubItem key={s.label}>
                              <SidebarMenuSubButton asChild isActive={s.current}>
                                <Link aria-current={s.current ? "page" : undefined} href={s.href}>
                                  <span>{s.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={item.current} tooltip={item.label}>
                      <Link aria-current={item.current ? "page" : undefined} href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                        {item.count != null && item.countLabel && <span className="sr-only">, {item.countLabel}</span>}
                      </Link>
                    </SidebarMenuButton>
                    {item.count != null && <SidebarMenuBadge aria-hidden="true">{item.count}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {footer && <SidebarFooter>{footer}</SidebarFooter>}
      <SidebarRail />
    </Sidebar>
  );
}

/* ---------------------------------------------------------------- Topbar */

export type Crumb = { label: string; href?: string };

/**
 * Beams top bar: 48px, white, a hairline below. Sidebar toggle and breadcrumb left, the
 * search field centred, actions right.
 */
export function Topbar({ crumbs, search, actions }: { crumbs: Crumb[]; search?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="z-20 flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface px-2 md:px-3">
      <SidebarTrigger aria-label="Toggle sidebar" className="text-on-surface-variant" />
      <Separator className="mx-1 hidden h-4! sm:block" orientation="vertical" />
      <Breadcrumb className="hidden min-w-0 sm:block">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((c, i) => (
            <Fragment key={c.label}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {c.href && i < crumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link className="truncate" href={c.href}>
                      {c.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex min-w-0 flex-1 justify-center px-2">{search}</div>
      <div className="flex shrink-0 items-center gap-1">{actions}</div>
    </header>
  );
}

/** Icon button with a tooltip that repeats its accessible name. */
export function TopbarIconButton({
  label,
  children,
  badge,
  onClick,
  pressed,
}: {
  label: string;
  children: ReactNode;
  /** Unread count; announced as part of the name. */
  badge?: number;
  onClick?: () => void;
  pressed?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={badge ? `${label}, ${badge} unread` : label}
          aria-pressed={pressed}
          className="relative"
          onClick={onClick}
          size="icon"
          variant="ghost"
        >
          {children}
          {badge ? (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-error px-1 tabular-nums leading-none font-medium text-[10px] leading-none text-on-error"
            >
              {badge}
            </span>
          ) : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/* ---------------------------------------------------------------- Search */

export type SearchGroup = { heading: string; items: { label: string; hint?: string; icon?: ReactNode; href?: string }[] };

/**
 * The top-bar search field (hairline, faint lift) that opens the command palette.
 * Ctrl/⌘ K opens it from anywhere on the page.
 */
export function SearchCommand({
  placeholder = "Search or ask ACE",
  groups,
  shortcut = "Ctrl K",
}: {
  placeholder?: string;
  groups: SearchGroup[];
  shortcut?: string;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={placeholder}
        className={cn(
          "state-layer [--state-hover:0.03] focus-ring relative flex h-8 w-full max-w-[480px] min-w-0 items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-2.5 text-sm text-on-surface-tertiary shadow-raised outline-none",
          // Phones: an icon button; the dialog is the same.
          "max-sm:ml-auto max-sm:size-8 max-sm:justify-center max-sm:px-0",
          "dark:bg-surface-container dark:shadow-none"
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        <SearchIcon aria-hidden="true" className="size-4 shrink-0" />
        <span className="truncate max-sm:sr-only">{placeholder}</span>
        <Kbd className="ml-auto hidden lg:inline-flex">{shortcut}</Kbd>
      </button>
      <CommandDialog
        className="rounded-xl sm:max-w-[624px]"
        description="Search deals, accounts, records and pages"
        onOpenChange={setOpen}
        open={open}
        title="Search"
      >
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>Nothing matches. Try an account name, an OPP number or a page.</CommandEmpty>
          {groups.map((g) => (
            <CommandGroup heading={g.heading} key={g.heading}>
              {g.items.map((it) => (
                <CommandItem key={it.label} onSelect={() => setOpen(false)}>
                  {it.icon}
                  <span>{it.label}</span>
                  {it.hint && <span className="ml-auto text-body-sm text-on-surface-variant">{it.hint}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div aria-hidden="true" className="flex items-center gap-4 border-t border-outline-variant px-3 py-2 text-body-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to move
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>Enter</Kbd> to open
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <Kbd>Esc</Kbd> to close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}

/* ---------------------------------------------------------------- Actions */

/** Beams reversed (dark) button: the top bar's AI entry point. */
export function AskAceButton({ onClick, label = "Ask ACE" }: { onClick?: () => void; label?: string }) {
  return (
    <Button className="gap-1.5 pl-1.5" onClick={onClick} variant="reversed">
      <AceMark size="sm" />
      {label}
    </Button>
  );
}

/** Light / dusk switch (see theme.tsx). Remembered per browser; follows the system until used. */
export function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const dark = resolved === "dusk";
  return (
    <TopbarIconButton label="Dusk theme" onClick={() => setTheme(dark ? "light" : "dusk")} pressed={dark}>
      {dark ? <MoonIcon /> : <SunIcon />}
    </TopbarIconButton>
  );
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Account: ${name}`}
          className="focus-ring hit-area ml-1 inline-flex rounded-full outline-none"
          type="button"
        >
          <PersonAvatar name={name} size="md" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-title-sm">{name}</span>
          <span className="font-mono text-xs font-normal text-on-surface-variant">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Admin</DropdownMenuItem>
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

