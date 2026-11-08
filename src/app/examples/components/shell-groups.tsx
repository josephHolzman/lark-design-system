"use client";

import { BellIcon, BriefcaseBusinessIcon, CircleHelpIcon, HouseIcon, InboxIcon, LayoutGridIcon, SettingsIcon, SparklesIcon, SunIcon, UserPlusIcon } from "lucide-react";

import {
  AppShell,
  AppSidebar,
  AskAceButton,
  ScopePill,
  SearchCommand,
  ThemeToggle,
  Topbar,
  TopbarIconButton,
  UserMenu,
  UserMenuItem,
  UserMenuRadioGroup,
  UserMenuSection,
  UserMenuSub,
} from "@/components/lark/shell";
import { ThemeScript, themeScriptSource } from "@/components/lark/theme";
import { DropdownMenu, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { SidebarProvider } from "@/components/ui/sidebar";

import type { Group } from "./catalog";

const noop = () => {};

const GROUPS = [
  {
    items: [
      { current: true, href: "/examples/components", icon: <HouseIcon />, label: "Component matrix" },
      { badge: 12, badgeLabel: "12 need action", href: "#inbox", icon: <InboxIcon />, label: "Work inbox" },
      { href: "#ace", icon: <SparklesIcon />, label: "Ask ACE" },
    ],
  },
  {
    items: [
      { badge: 8, badgeLabel: "8 awaiting decision", href: "#deals", icon: <BriefcaseBusinessIcon />, label: "Deal desk" },
      { count: 24, countLabel: "24 deals", href: "#all", icon: <LayoutGridIcon />, label: "All deals" },
      { href: "#team", icon: <UserPlusIcon />, label: "Accounts" },
    ],
    label: "Revenue",
  },
  {
    collapsible: true,
    items: [
      { href: "#settings", icon: <SettingsIcon />, label: "Settings" },
      { href: "#help", icon: <CircleHelpIcon />, label: "Help" },
    ],
    label: "Operate",
  },
];

const SEARCH = [
  { heading: "Work & decisions", items: [{ hint: "Awaiting decision", label: "Northwind renewal · discount exception" }, { hint: "In review", label: "Halvorsen expansion · term change" }] },
  { heading: "Accounts", items: [{ hint: "Enterprise", label: "Northwind Traders" }, { hint: "Mid-market", label: "Halvorsen Group" }] },
];

function SidebarSample({ withShell }: { withShell?: boolean }) {
  const sidebar = (
    <AppSidebar
      footerItems={[{ href: "#team", icon: <UserPlusIcon />, label: "Add teammates" }, { href: "#spaces", icon: <LayoutGridIcon />, label: "All spaces" }]}
      groups={GROUPS}
      scope={<ScopePill href="#scope" label="Example data · as of Oct 21" tone="caution" />}
      workspace={{ name: "Deepgrids", subtitle: "Revenue workspace" }}
    />
  );
  if (withShell)
    return (
      <div className="h-[28rem] overflow-hidden rounded-lg border border-edge [transform:translateZ(0)]">
        <AppShell compactBelow={0} defaultOpen topbar={<Topbar actions={<><TopbarIconButton badge={3} label="Deal signals"><BellIcon /></TopbarIconButton><ThemeToggle /><UserMenu name="Avery Chen" /></>} crumbs={[{ href: "#lark", label: "Lark" }, { label: "Component matrix" }]} search={<SearchCommand groups={SEARCH} />} />} sidebar={sidebar}>
          <div className="p-4 text-body-md">The page&apos;s content is the main landmark.</div>
        </AppShell>
      </div>
    );
  return (
    <div className="h-[28rem] overflow-hidden rounded-lg border border-edge [transform:translateZ(0)]">
      <SidebarProvider defaultOpen>
        {sidebar}
      </SidebarProvider>
    </div>
  );
}

function MenuParts({ part }: { part: "section" | "item" | "sub" | "radio" }) {
  return (
    <DropdownMenu modal={false} open>
      <DropdownMenuContent align="start" className="w-64" forceMount>
        {part === "section" && (
          <UserMenuSection label="Workspace">
            <UserMenuItem icon={<BriefcaseBusinessIcon />} shortcut="Ctrl ,">Profile and preferences</UserMenuItem>
            <UserMenuItem>Admin settings</UserMenuItem>
          </UserMenuSection>
        )}
        {part === "item" && <UserMenuItem icon={<UserPlusIcon />} onSelect={noop} shortcut="Ctrl K">Invite a teammate</UserMenuItem>}
        {part === "sub" && (
          <UserMenuSub icon={<LayoutGridIcon />} label="Switch workspace">
            <UserMenuItem>Platform</UserMenuItem>
            <UserMenuItem>AI Studio</UserMenuItem>
            <UserMenuItem>Company ontology</UserMenuItem>
          </UserMenuSub>
        )}
        {part === "radio" && (
          <UserMenuRadioGroup label="Theme" onValueChange={noop} options={[{ description: "Follow the system", label: "System", value: "system" }, { label: "Light", value: "light" }, { label: "Dusk", value: "dusk" }]} value="system" />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const SHELL_GROUPS: Group[] = [
  {
    file: "shell.tsx",
    title: "Shell and identity",
    note: "The page shell, the top bar and the person's menu. The shell is page-scale: it is framed here with a transform so the fixed sidebar stays inside its frame.",
    samples: [
      { name: "AppShell", node: <SidebarSample withShell /> },
      { name: "AppSidebar", node: <SidebarSample /> },
      { name: "ScopePill", node: <div className="flex flex-col items-start gap-2"><ScopePill href="#scope" label="Example data · as of Oct 21" tone="caution" /><ScopePill label="Production · synced 2 min ago" tone="positive" /></div> },
      { name: "Topbar", node: <div className="overflow-hidden rounded-lg border border-edge"><Topbar actions={<><TopbarIconButton badge={3} label="Deal signals"><BellIcon /></TopbarIconButton><TopbarIconButton label="Help"><CircleHelpIcon /></TopbarIconButton><ThemeToggle /><UserMenu email="avery.chen@example.com" name="Avery Chen" /></>} crumbs={[{ href: "#lark", label: "Lark" }, { href: "#examples", label: "Examples" }, { label: "Component matrix" }]} search={<SearchCommand groups={SEARCH} />} /></div> },
      { name: "TopbarIconButton", node: <div className="flex items-center gap-1"><TopbarIconButton badge={3} label="Deal signals"><BellIcon /></TopbarIconButton><TopbarIconButton label="Help"><CircleHelpIcon /></TopbarIconButton><TopbarIconButton label="Light theme" pressed><SunIcon /></TopbarIconButton></div> },
      { name: "SearchCommand", node: <SearchCommand groups={SEARCH} /> },
      { name: "AskAceButton", node: <div className="flex flex-wrap items-center gap-2"><AskAceButton /><AskAceButton busy /><AskAceButton expanded /></div> },
      { name: "ThemeToggle", node: <div className="flex items-center gap-1"><ThemeToggle /></div> },
      { name: "UserMenu", node: <div className="flex items-center gap-2"><UserMenu detail="Viewer · Deal desk view" email="avery.chen@example.com" name="Avery Chen"><UserMenuSection label="Avery Chen"><UserMenuItem icon={<BriefcaseBusinessIcon />}>Profile and preferences</UserMenuItem></UserMenuSection></UserMenu></div> },
      { name: "UserMenuSection", node: <MenuParts part="section" /> },
      { name: "UserMenuItem", node: <MenuParts part="item" /> },
      { name: "UserMenuSub", node: <MenuParts part="sub" /> },
      { name: "UserMenuRadioGroup", node: <MenuParts part="radio" /> },
    ],
  },
  {
    file: "theme.tsx",
    title: "Theme",
    note: "Light and dusk are stored under a key the app chooses; the boot script sets the marker before first paint.",
    samples: [
      { name: "ThemeScript", node: <div className="flex min-w-0 flex-col gap-2"><ThemeScript /><span data-meta="details" className="overflow-hidden rounded-md bg-inset p-2 font-mono text-meta whitespace-pre-wrap text-on-surface-variant">{themeScriptSource().slice(0, 220)}…</span></div> },
    ],
  },
];
