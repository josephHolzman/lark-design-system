"use client";

import {
  ChevronRightIcon,
  ChevronsUpDownIcon,
  LoaderCircleIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";
import { LarkLink as Link } from "./provider";
import { type ThemeOptions, useTheme } from "./theme";
import { Fragment, type ReactNode, useEffect, useId, useState } from "react";

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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { AceMark, PersonAvatar } from "./identity";
import { CountPill } from "./lists";

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
  onOpenChange,
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
  /** The rail's state changed (a toggle, Ctrl/⌘ B, the phone sheet). Apps that remember it can hear it. */
  onOpenChange?: (open: boolean) => void;
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
    <SidebarProvider
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
      open={open}
    >
      {sidebar}
      {/* Beams: the shell is exactly the viewport; the document never scrolls. Each page
          layout decides which region scrolls (see layouts.tsx). The page content, not the
          whole inset, is the main landmark, so the top bar's header stays a banner. */}
      <SidebarInset asChild className="h-svh min-w-0 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {topbar}
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto outline-none" tabIndex={0}>{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/* ---------------------------------------------------------------- AppSidebar */

export type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  /** A count that needs attention (Approvals 3): a CountPill, a dot on the rail. */
  badge?: number;
  /** Accessible meaning of the badge, e.g. "3 waiting". Default "<n> waiting". */
  badgeLabel?: string;
  /** Quiet count (no pill), e.g. a list's size. Prefer `badge` for things to act on. */
  count?: number;
  /** Accessible meaning of the count, e.g. "12 need action". */
  countLabel?: string;
  current?: boolean;
  items?: { label: string; href: string; current?: boolean }[];
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
  /** The label becomes a button that shows and hides the items (needs a label). */
  collapsible?: boolean;
  /** Starting state when uncontrolled. Default true. */
  defaultOpen?: boolean;
  /** Controlled state, for apps that remember it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const SCOPE_DOT = {
  neutral: "bg-on-surface-variant",
  info: "bg-primary",
  caution: "bg-warning",
  positive: "bg-success",
  ai: "bg-on-tertiary-container",
} as const;
export type ScopeTone = keyof typeof SCOPE_DOT;

/**
 * Which data the app is showing ("Example data · as of Oct 21"): a dot and words, 24px tall.
 * With `href` it is a link to an explanation.
 */
export function ScopePill({ label, href, tone = "neutral", className }: { label: string; href?: string; tone?: ScopeTone; className?: string }) {
  const cls = cn(
    "inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-full border border-outline-variant bg-surface px-2 text-meta-strong text-on-surface-variant",
    href && "state-layer [--state-hover:0.05] focus-ring outline-none",
    className
  );
  const body = (
    <>
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", SCOPE_DOT[tone])} />
      <span className="truncate">{label}</span>
    </>
  );
  return href ? (
    <Link className={cls} data-slot="scope-pill" href={href}>
      {body}
    </Link>
  ) : (
    <span className={cls} data-slot="scope-pill">
      {body}
    </span>
  );
}

function NavLinkItem({ item }: { item: NavItem }) {
  const badgeText = item.badge != null ? (item.badgeLabel ?? `${item.badge} waiting`) : undefined;
  const tooltip = badgeText ? `${item.label} · ${badgeText}` : item.label;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={item.current} tooltip={tooltip}>
        <Link
          aria-current={item.current ? "page" : undefined}
          // A name, not an sr-only span: flex children would read "Approvals , 3 waiting".
          aria-label={badgeText ? `${item.label}, ${badgeText}` : undefined}
          className="relative"
          href={item.href}
        >
          {item.icon}
          <span>{item.label}</span>
          {!badgeText && item.count != null && item.countLabel && <span className="sr-only">, {item.countLabel}</span>}
          {item.badge != null && item.badge > 0 && (
            // On the rail the pill can't fit: a dot on the icon (the count stays in the name).
            <span aria-hidden="true" className="absolute top-1 right-1 hidden size-1.5 rounded-full bg-on-surface group-data-[collapsible=icon]:block" />
          )}
        </Link>
      </SidebarMenuButton>
      {item.badge != null ? (
        <SidebarMenuBadge aria-hidden="true">
          <CountPill value={item.badge} variant="pill" />
        </SidebarMenuBadge>
      ) : (
        item.count != null && <SidebarMenuBadge aria-hidden="true">{item.count}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

function NavItems({ items }: { items: NavItem[] }) {
  return (
    <SidebarMenu>
      {items.map((item) =>
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
          <NavLinkItem item={item} key={item.label} />
        )
      )}
    </SidebarMenu>
  );
}

function NavGroupSection({ group }: { group: NavGroup }) {
  const { state, isMobile } = useSidebar();
  const [inner, setInner] = useState(group.defaultOpen ?? true);
  if (!group.collapsible || !group.label) {
    return (
      <SidebarGroup>
        {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
        <NavItems items={group.items} />
      </SidebarGroup>
    );
  }
  const open = group.open ?? inner;
  const setOpen = (next: boolean) => {
    if (group.open === undefined) setInner(next);
    group.onOpenChange?.(next);
  };
  // On the rail the labels are hidden, so every group shows its icons.
  const rail = state === "collapsed" && !isMobile;
  return (
    <Collapsible asChild onOpenChange={setOpen} open={rail || open}>
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="group/label state-layer [--state-hover:0.05] w-full text-left">
            <span className="flex-1">{group.label}</span>
            <ChevronRightIcon aria-hidden="true" className="transition-transform group-data-[state=open]/label:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <NavItems items={group.items} />
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar({
  workspace,
  workspaces,
  scope,
  groups,
  footerItems,
  footer,
}: {
  workspace: { name: string; subtitle: string; mark?: ReactNode };
  /** The workspace switcher's entries. Defaults to this workspace and "All spaces". */
  workspaces?: { name: string; href?: string; current?: boolean }[];
  /** Under the logo, usually a ScopePill. Hidden on the rail. */
  scope?: ReactNode;
  groups: NavGroup[];
  /** Links pinned to the bottom (Add teammates, Admin settings, All spaces). */
  footerItems?: NavItem[];
  footer?: ReactNode;
}) {
  const workspaceMenu = workspaces ?? [{ name: workspace.name, current: true }, { name: "All spaces" }];
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
                    <span className="truncate text-meta text-on-surface-variant">{workspace.subtitle}</span>
                  </span>
                  <ChevronsUpDownIcon aria-hidden="true" className="ml-auto text-on-surface-variant" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                {workspaceMenu.map((w) =>
                  w.href ? (
                    <DropdownMenuItem asChild key={w.name}>
                      <Link aria-current={w.current ? "page" : undefined} href={w.href}>
                        {w.name}
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem key={w.name}>{w.name}</DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        {scope && <div className="flex min-w-0 px-2 pb-1 group-data-[collapsible=icon]:hidden">{scope}</div>}
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g, gi) => (
          <NavGroupSection group={g} key={g.label ?? gi} />
        ))}
      </SidebarContent>
      {(footerItems?.length || footer) && (
        <SidebarFooter>
          {footerItems && footerItems.length > 0 && <NavItems items={footerItems} />}
          {footer}
        </SidebarFooter>
      )}
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
    <header className="@container/topbar z-20 flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface px-2 md:px-3">
      <SidebarTrigger aria-label="Toggle sidebar" className="text-on-surface-variant" />
      <Separator className="mx-1 hidden data-[orientation=vertical]:h-4 @[32rem]/topbar:block" orientation="vertical" />
      <Breadcrumb className="hidden min-w-0 @[32rem]/topbar:block">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((c, i) => (
            <Fragment key={c.label}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {c.href && i < crumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link className="hit-area inline-flex min-h-6 items-center truncate" href={c.href}>
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
      <div className="flex min-w-0 flex-1 justify-center px-2 @max-[20rem]/topbar:hidden">{search}</div>
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
              className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-meta leading-none font-medium tabular-nums text-on-error"
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
          // A narrow top bar gets an icon button; the dialog is the same.
          "@max-[30rem]/topbar:ml-auto @max-[30rem]/topbar:size-8 @max-[30rem]/topbar:justify-center @max-[30rem]/topbar:px-0",
          "dark:bg-surface-container dark:shadow-none"
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        <SearchIcon aria-hidden="true" className="size-4 shrink-0" />
        <span className="truncate @max-[30rem]/topbar:sr-only">{placeholder}</span>
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
                // A result goes somewhere, so with `href` it is a real link (open in a new tab);
                // cmdk still owns the arrow keys and Enter.
                <CommandItem asChild key={it.label} onSelect={() => setOpen(false)}>
                  {it.href ? (
                    <Link className="flex min-w-0 items-center gap-2" href={it.href}>
                      {it.icon}
                      <span>{it.label}</span>
                      {it.hint && <span className="ml-auto text-meta text-on-surface-variant">{it.hint}</span>}
                    </Link>
                  ) : (
                    <span className="flex min-w-0 items-center gap-2">
                      {it.icon}
                      <span>{it.label}</span>
                      {it.hint && <span className="ml-auto text-meta text-on-surface-variant">{it.hint}</span>}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div aria-hidden="true" className="flex items-center gap-4 border-t border-outline-variant px-3 py-2 text-meta text-on-surface-variant">
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

/**
 * Ask ACE (v0.7): the primary action, so sky (Lark's colour for the primary action), not reversed.
 * v0.8: `busy` while a request is in flight (the button says so and cannot be pressed twice);
 * `expanded` and `controls` announce the dock it opens or closes (WCAG 4.1.2).
 */
export function AskAceButton({
  onClick,
  label = "Ask ACE",
  busy,
  disabled,
  expanded,
  controls,
}: {
  onClick?: () => void;
  label?: string;
  /** A request is in flight: a spinner replaces the mark and the button is disabled. */
  busy?: boolean;
  disabled?: boolean;
  /** Whether the dock this opens is open. */
  expanded?: boolean;
  /** The id of the dock this controls. */
  controls?: string;
}) {
  const text = busy ? "Asking…" : label;
  return (
    <Button
      aria-busy={busy || undefined}
      aria-controls={controls}
      aria-expanded={expanded}
      className="gap-1.5 pl-1.5"
      disabled={disabled || busy}
      onClick={onClick}
      variant="default"
    >
      {busy ? <LoaderCircleIcon aria-hidden className="animate-spin motion-reduce:animate-none" /> : <AceMark size="sm" />}
      {text}
    </Button>
  );
}

/** Light / dusk switch (see theme.tsx). Remembered per browser; follows the system until used. */
export function ThemeToggle(options: ThemeOptions = {}) {
  const { resolved, setTheme } = useTheme(options);
  const dark = resolved === "dusk";
  return (
    <TopbarIconButton label="Dusk theme" onClick={() => setTheme(dark ? "light" : "dusk")} pressed={dark}>
      {dark ? <MoonIcon /> : <SunIcon />}
    </TopbarIconButton>
  );
}

/* ---------------------------------------------------------------- UserMenu */

/**
 * The person's menu, opened from their avatar at the right of the top bar. Compose it from
 * `UserMenuSection`, `UserMenuItem`, `UserMenuSub` and `UserMenuRadioGroup`; with no children it
 * shows Profile, Admin and Sign out. Escape closes it and returns focus to the avatar.
 */
export function UserMenu({
  name,
  detail,
  email,
  avatar,
  children,
  modal = true,
  className,
}: {
  name: string;
  /** Second line under the name, e.g. "Viewer · Deal Desk view". */
  detail?: ReactNode;
  /** Shown in mono under the name (and detail). */
  email?: string;
  /** Replaces the initials avatar in the trigger. */
  avatar?: ReactNode;
  children?: ReactNode;
  /**
   * v0.8: `false` for a non-modal menu. A modal menu sets aria-hidden on the page without making
   * it inert (axe aria-hidden-focus); a non-modal one leaves the page reachable.
   */
  modal?: boolean;
  className?: string;
}) {
  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Account: ${name}`}
          className="focus-ring hit-area ml-1 inline-flex rounded-full outline-none"
          type="button"
        >
          {avatar ?? <PersonAvatar name={name} size="md" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-64", className)}>
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-title-sm">{name}</span>
          {detail && <span className="text-body-md font-normal text-on-surface-variant">{detail}</span>}
          {email && <span className="font-mono text-meta font-normal text-on-surface-variant">{email}</span>}
        </DropdownMenuLabel>
        {children ?? (
          <UserMenuSection>
            <UserMenuItem>Profile</UserMenuItem>
            <UserMenuItem>Admin</UserMenuItem>
            <UserMenuItem>Sign out</UserMenuItem>
          </UserMenuSection>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A ruled group of items, with an optional label (sentence case, 12/18). */
export function UserMenuSection({ label, children }: { label?: string; children: ReactNode }) {
  const id = useId();
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuGroup aria-labelledby={label ? id : undefined}>
        {label && (
          <DropdownMenuLabel className="text-meta-strong font-normal text-on-surface-variant" id={id}>
            {label}
          </DropdownMenuLabel>
        )}
        {children}
      </DropdownMenuGroup>
    </>
  );
}

/** One menu item: a link (href) or an action (onSelect), with an optional icon and shortcut. */
export function UserMenuItem({
  icon,
  href,
  onSelect,
  shortcut,
  destructive,
  disabled,
  children,
}: {
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
  /** Shown right-aligned, e.g. "Ctrl ,". Display only; bind the key yourself. */
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1 truncate" title={typeof children === "string" ? children : undefined}>
        {children}
      </span>
      {shortcut && <DropdownMenuShortcut className="tracking-normal">{shortcut}</DropdownMenuShortcut>}
    </>
  );
  if (href && !disabled) {
    return (
      <DropdownMenuItem asChild onSelect={onSelect} variant={destructive ? "destructive" : "default"}>
        <Link href={href}>{body}</Link>
      </DropdownMenuItem>
    );
  }
  return (
    <DropdownMenuItem disabled={disabled} onSelect={onSelect} variant={destructive ? "destructive" : "default"}>
      {body}
    </DropdownMenuItem>
  );
}

/** An item that opens a submenu (right arrow, or Enter / Space / → from the keyboard). */
export function UserMenuSub({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-48 rounded-md border-outline-variant shadow-md">{children}</DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export type UserMenuOption = { value: string; label: string; description?: string };

/**
 * Pick one (role, theme). Items are menuitemradio with aria-checked, and the chosen one shows a
 * dot, so the state is both announced and visible.
 */
export function UserMenuRadioGroup({
  label,
  value,
  onValueChange,
  options,
}: {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: UserMenuOption[];
}) {
  const id = useId();
  return (
    <DropdownMenuRadioGroup aria-labelledby={label ? id : undefined} onValueChange={onValueChange} value={value}>
      {label && (
        <DropdownMenuLabel className="text-meta-strong font-normal text-on-surface-variant" id={id}>
          {label}
        </DropdownMenuLabel>
      )}
      {options.map((o) => (
        <DropdownMenuRadioItem className="items-start" key={o.value} value={o.value}>
          <span className="flex min-w-0 flex-col">
            <span className={cn(o.value === value && "font-medium text-on-surface")}>{o.label}</span>
            {o.description && <span className="text-body-md text-on-surface-variant">{o.description}</span>}
          </span>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

