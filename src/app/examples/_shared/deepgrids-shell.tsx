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
  LayersIcon,
  MessagesSquareIcon,
  ReceiptTextIcon,
  SettingsIcon,
  SparklesIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Meter } from "@/components/lark/figure";
import {
  AppShell,
  AppSidebar,
  AskAceButton,
  type Crumb,
  type NavGroup,
  SearchCommand,
  ThemeToggle,
  Topbar,
  TopbarIconButton,
  UserMenu,
} from "@/components/lark/shell";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type Section = "home" | "inbox" | "deals" | "deals-list" | "quote" | "ace" | "settings" | "patterns" | "chat-states";

const nav = (current: Section): NavGroup[] => [
  {
    items: [
      { label: "Home", href: "#", icon: <HouseIcon />, current: current === "home" },
      { label: "Work inbox", href: "#", icon: <InboxIcon />, count: 12, countLabel: "12 need action", current: current === "inbox" },
      { label: "Ask ACE", href: "/examples/chat", icon: <SparklesIcon />, current: current === "ace" },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Deal desk", href: "/examples/dashboard", icon: <BriefcaseBusinessIcon />, count: 8, countLabel: "8 awaiting decision", current: current === "deals" },
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
    items: [
      { label: "Agent studio", href: "#", icon: <BotIcon /> },
      { label: "Connections", href: "#", icon: <CableIcon /> },
      { label: "Settings", href: "/examples/settings", icon: <SettingsIcon />, current: current === "settings" },
      { label: "Lark patterns", href: "/examples/patterns", icon: <LayersIcon />, current: current === "patterns" },
      { label: "Chat states", href: "/examples/chat-states", icon: <MessagesSquareIcon />, current: current === "chat-states" },
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
      <div className="flex items-baseline justify-between text-body-sm">
        <span className="text-on-surface">ACE credits</span>
        <span className="font-mono text-xs text-on-surface-variant">6,240 / 10k</span>
      </div>
      <Meter label="ACE credits used" max={10000} value={6240} />
      <Button asChild className="mt-1 justify-start" size="xs" variant="ghost">
        <Link href="#">
          <UserPlusIcon />
          Add teammates
        </Link>
      </Button>
    </div>
  );
}

export function DeepgridsShell({
  current,
  crumbs,
  children,
}: {
  current: Section;
  crumbs: Crumb[];
  children: ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <AppShell
        sidebar={
          <AppSidebar
            footer={<SidebarFooterCard />}
            groups={nav(current)}
            workspace={{ name: "Deepgrids", subtitle: "Revenue workspace" }}
          />
        }
        topbar={
          <Topbar
            actions={
              <>
                <span className="hidden md:inline-flex">
                  <AskAceButton />
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
