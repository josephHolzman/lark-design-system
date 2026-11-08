"use client";

import {
  BellIcon,
  BotIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CableIcon,
  ChartColumnIcon,
  CircleHelpIcon,
  FileTextIcon,
  HouseIcon,
  InboxIcon,
  LayoutGridIcon,
  LayersIcon,
  PanelRightIcon,
  MessagesSquareIcon,
  ReceiptTextIcon,
  SettingsIcon,
  SparklesIcon,
  UserPlusIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Meter } from "@/components/lark/figure";
import {
  AppShell,
  AppSidebar,
  AskAceButton,
  type Crumb,
  type NavGroup,
  ScopePill,
  SearchCommand,
  ThemeToggle,
  Topbar,
  TopbarIconButton,
  UserMenu,
} from "@/components/lark/shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type Section = "home" | "inbox" | "deals" | "deals-list" | "quote" | "ace" | "settings" | "patterns" | "chat-states" | "widgets" | "chat-panel" | "foundations" | "width-matrix" | "approvals" | "deal-activity" | "slots";

const nav = (current: Section): NavGroup[] => [
  {
    items: [
      { label: "Home", href: "#", icon: <HouseIcon />, current: current === "home" },
      { label: "Work inbox", href: "#", icon: <InboxIcon />, badge: 12, badgeLabel: "12 need action", current: current === "inbox" },
      { label: "Ask ACE", href: "/examples/chat", icon: <SparklesIcon />, current: current === "ace" },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Deal desk", href: "/examples/dashboard", icon: <BriefcaseBusinessIcon />, badge: 8, badgeLabel: "8 awaiting decision", current: current === "deals" },
      { label: "All deals", href: "/examples/deals", icon: <ChartColumnIcon />, count: 24, countLabel: "24 deals", current: current === "deals-list" },
      { label: "Quote workbench", href: "/examples/quote", icon: <ReceiptTextIcon />, current: current === "quote" },
      { label: "Accounts", href: "#", icon: <Building2Icon /> },
      {
        label: "Documents",
        href: "#documents",
        icon: <FileTextIcon />,
        items: [
          { label: "Contracts", href: "#contracts" },
          { label: "Pricing policies", href: "#policies" },
          { label: "Order forms", href: "#orders" },
        ],
      },

    ],
  },
  {
    label: "Operate",
    collapsible: true,
    items: [
      { label: "Agent studio", href: "#", icon: <BotIcon /> },
      { label: "Connections", href: "#", icon: <CableIcon /> },
      { label: "Settings", href: "/examples/settings", icon: <SettingsIcon />, current: current === "settings" },
      { label: "Lark foundations", href: "/examples/foundations", icon: <LayersIcon />, current: current === "foundations" },
      { label: "Slots and fixes", href: "/examples/slots", icon: <LayersIcon />, current: current === "slots" },
      { label: "Width matrix", href: "/examples/width-matrix", icon: <LayoutGridIcon />, current: current === "width-matrix" },
      { label: "Approvals", href: "/examples/approvals", icon: <LayersIcon />, current: current === "approvals" },
      { label: "Deal activity", href: "/examples/deal-activity", icon: <MessagesSquareIcon />, current: current === "deal-activity" },
      { label: "Lark patterns", href: "/examples/patterns", icon: <LayersIcon />, current: current === "patterns" },
      { label: "Chat states", href: "/examples/chat-states", icon: <MessagesSquareIcon />, current: current === "chat-states" },
      { label: "Answer widgets", href: "/examples/widgets", icon: <LayoutGridIcon />, current: current === "widgets" },
      { label: "Chat side panel", href: "/examples/chat-panel", icon: <PanelRightIcon />, current: current === "chat-panel" },
    ],
  },
];

const searchGroups = [
  {
    heading: "Work & decisions",
    items: [
      { label: "Northwind renewal · discount exception", hint: "Awaiting decision" },
      { label: "Halvorsen expansion · term change", hint: "In review" },
    ],
  },
  {
    heading: "Accounts",
    items: [
      { label: "Northwind Traders", hint: "Enterprise" },
      { label: "Halvorsen Group", hint: "Mid-market" },
    ],
  },
  {
    heading: "Go to",
    items: [
      { label: "Deals & approvals" },
      { label: "Pricing policies" },
    ],
  },
];

function SidebarFooterCard() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-3 group-data-[collapsible=icon]:hidden">
      <div className="flex items-baseline justify-between text-body-md">
        <span className="text-on-surface">ACE credits</span>
        <span className="font-mono text-meta text-on-surface-variant">6,240 / 10k</span>
      </div>
      <Meter label="ACE credits used" max={10000} value={6240} />
    </div>
  );
}

export function DeepgridsShell({
  current,
  crumbs,
  children,
  onAskAce,
}: {
  current: Section;
  crumbs: Crumb[];
  children: ReactNode;
  /** Makes the top bar's Ask ACE open something on this page (the side panel). */
  onAskAce?: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <AppShell
        sidebar={
          <AppSidebar
            footer={<SidebarFooterCard />}
            footerItems={[
              { label: "Add teammates", href: "#", icon: <UserPlusIcon /> },
              { label: "All spaces", href: "#", icon: <LayoutGridIcon /> },
            ]}
            groups={nav(current)}
            scope={<ScopePill href="/examples/patterns#shell" label="Example data · as of Oct 21" tone="caution" />}
            workspace={{ name: "Deepgrids", subtitle: "Revenue workspace" }}
          />
        }
        topbar={
          <Topbar
            actions={
              <>
                <span className="hidden md:inline-flex">
                  <AskAceButton onClick={onAskAce} />
                </span>
                <TopbarIconButton badge={3} label="Deal signals">
                  <BellIcon />
                </TopbarIconButton>
                <span className="hidden sm:inline-flex">
                  <TopbarIconButton label="Help">
                    <CircleHelpIcon />
                  </TopbarIconButton>
                </span>
                <ThemeToggle />
                <UserMenu email="avery.chen@example.com" name="Avery Chen" />
              </>
            }
            crumbs={crumbs}
            search={<SearchCommand groups={searchGroups} />}
          />
        }
      >
        {children}
      </AppShell>
      <Toaster position="bottom-center" />
    </TooltipProvider>
  );
}
