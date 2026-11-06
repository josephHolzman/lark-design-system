import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileTextIcon } from "lucide-react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ActionReceipt, ActionReview, AnswerSources, ClarifyQuestion, ConversationListItem, DraftCard, ModeSwitch, ThinkingRow, UserTurn, WorkLog } from "@/components/lark/chat";
import { type ColumnDef, DataGrid } from "@/components/lark/data-grid";
import { InlineEdit } from "@/components/lark/editing";
import { Banner, Callout, StatePanel } from "@/components/lark/feedback";
import { Figure, FigureCard, FigureStrip } from "@/components/lark/figure";
import { safeLogoSrc, ServiceLogo, serviceKey } from "@/components/lark/identity";
import { LOGO_SRC } from "@/components/lark/logos.data";
import { AppShell, AppSidebar, ScopePill, ThemeToggle, UserMenu, UserMenuItem, UserMenuRadioGroup, UserMenuSection, UserMenuSub } from "@/components/lark/shell";
import { themeEventName, themeScriptSource, useTheme } from "@/components/lark/theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
import { FileRow } from "@/components/ui/file-dropzone";
import { NumberInput } from "@/components/ui/number-input";

import { axeViolations } from "./axe";

type Row = { id: string; name: string; value: number };
const rows: Row[] = [
  { id: "a", name: "Northwind", value: 30 },
  { id: "b", name: "Halvorsen", value: 10 },
];
const cols: ColumnDef<Row, unknown>[] = [
  { id: "name", accessorKey: "name", header: "Account" },
  { id: "value", accessorKey: "value", header: "Value", meta: { align: "right" } },
];

describe("accessibility (axe, structure only)", () => {
  it("core components have no violations", async () => {
    const { container } = render(
      <main>
        <h1>Lark</h1>
        <Button>Save</Button>
        <Badge variant="success">Approved</Badge>
        <Banner tone="caution">Salesforce sync paused.</Banner>
        <Callout title="Credit review is old" tone="caution">
          It predates the expansion.
        </Callout>
        <StatePanel kind="no-results" title="No deals match" />
        <label>
          Discount <NumberInput max={40} min={0} onValueChange={() => {}} suffix="%" value={20} />
        </label>
        <Combobox aria-label="Account" onValueChange={() => {}} options={[{ value: "nw", label: "Northwind" }]} />
        <FileRow file={{ id: "f", name: "PO.pdf", state: "uploading", progress: 40 }} onRemove={() => {}} />
        <DataGrid caption="Deals" columns={cols} data={rows} getRowId={(r) => r.id} selectable />
      </main>
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it("chat states have no violations", async () => {
    const { container } = render(
      <main>
        <h1>Chat</h1>
        <UserTurn status="failed" onRetry={() => {}}>
          Draft the email
        </UserTurn>
        <ThinkingRow detail="Reading the quote" />
        <WorkLog calls={[{ id: "1", name: "Read quote", state: "done" }, { id: "2", name: "Get PO", state: "failed", note: "503" }]} defaultOpen />
        <AnswerSources sources={[{ id: "s", label: "Quote R4", system: "Salesforce", excerpt: "24%" }, { id: "t", label: "Channel", state: "inaccessible" }]} />
        <ClarifyQuestion options={["Users", "Events"]} prompt="What does 180,000 measure?" />
        <ActionReview title="Save quote R5">Replaces R4.</ActionReview>
        <ActionReceipt state="uncertain" system="Salesforce" title="Create the order" />
        <DraftCard app="Outlook" onSend={() => {}} subject="Terms" to={[{ name: "Jordan Lee", external: true }]}>
          <p>Hi Jordan</p>
        </DraftCard>
        <nav aria-label="Recent">
          <ConversationListItem status="needs-you" title="Payment terms" unread />
        </nav>
        <ModeSwitch ceiling="prepare" onValueChange={() => {}} value="guide" />
      </main>
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("behaviour", () => {
  it("NumberInput steps with arrows and clamps on blur", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [v, setV] = useState<number | undefined>(20);
      return <NumberInput aria-label="Discount" max={40} min={0} onValueChange={setV} suffix="%" value={v} />;
    }
    render(<Harness />);
    const input = screen.getByRole("spinbutton", { name: "Discount" });
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveProperty("value", "21");
    await user.clear(input);
    await user.type(input, "55");
    await user.tab();
    expect(input).toHaveProperty("value", "40");
    expect(input.getAttribute("aria-valuetext")).toBe("40 %");
  });

  it("InlineEdit saves on Enter and cancels on Escape", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<InlineEdit label="Term" onCommit={onCommit} value="36 months" />);
    await user.click(screen.getByRole("button", { name: "Edit Term: 36 months" }));
    await user.clear(screen.getByRole("textbox", { name: "Term" }));
    await user.type(screen.getByRole("textbox", { name: "Term" }), "48 months{Enter}");
    expect(onCommit).toHaveBeenCalledWith("48 months");
    onCommit.mockClear();
    await user.click(screen.getByRole("button", { name: /Edit Term/ }));
    await user.type(screen.getByRole("textbox", { name: "Term" }), "x{Escape}");
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("an indeterminate checkbox shows a dash, not a check", () => {
    render(<Checkbox aria-label="Select all" checked="indeterminate" />);
    const box = screen.getByRole("checkbox", { name: "Select all" });
    expect(box.getAttribute("aria-checked")).toBe("mixed");
    expect(box.querySelector(".lucide-minus")).not.toBeNull();
  });

  it("DataGrid sorting is announced with aria-sort", async () => {
    const user = userEvent.setup();
    render(<DataGrid caption="Deals" columns={cols} data={rows} getRowId={(r) => r.id} />);
    const header = await screen.findByRole("columnheader", { name: /Value/ });
    expect(header.getAttribute("aria-sort")).toBe("none");
    await user.click(within(header).getByRole("button"));
    expect(header.getAttribute("aria-sort")).not.toBe("none");
  });

  it("ClarifyQuestion keeps Answer disabled until a choice is made", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<ClarifyQuestion onAnswer={onAnswer} options={["Users", "Events"]} prompt="What does it measure?" />);
    const answer = screen.getByRole("button", { name: "Answer" });
    expect(answer).toHaveProperty("disabled", true);
    await user.click(screen.getByRole("radio", { name: "Events" }));
    await user.click(answer);
    expect(onAnswer).toHaveBeenCalledWith("Events");
  });

  it("ModeSwitch keeps modes above the ceiling visible but disabled, with the reason", () => {
    render(<ModeSwitch ceiling="prepare" ceilingReason="Not allowed for Salesforce." onValueChange={() => {}} value="guide" />);
    expect(screen.getByRole("radio", { name: /Execute within policy/ })).toHaveProperty("disabled", true);
    expect(screen.getByText("Not allowed for Salesforce.")).toBeTruthy();
  });

  it("Combobox picks an option and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Account" onValueChange={onValueChange} options={[{ value: "nw", label: "Northwind" }, { value: "hg", label: "Halvorsen" }]} />);
    await user.click(screen.getByRole("combobox", { name: "Account" }));
    await user.click(await screen.findByRole("option", { name: /Halvorsen/ }));
    expect(onValueChange).toHaveBeenCalledWith("hg");
  });
});

describe("date pickers", () => {
  it("DatePicker opens a calendar, picks a day and names the value", async () => {
    const user = userEvent.setup();
    function Host() {
      const [d, setD] = useState<Date | undefined>(new Date(2026, 10, 14));
      return <DatePicker aria-label="Close date" onValueChange={setD} value={d} />;
    }
    render(<Host />);
    await user.click(screen.getByRole("button", { name: "Close date, Nov 14, 2026" }));
    const grid = await screen.findByRole("grid");
    expect(await axeViolations(grid)).toEqual([]);
    await user.click(within(grid).getByRole("button", { name: /November 20/ }));
    expect(screen.getByRole("button", { name: "Close date, Nov 20, 2026" })).toBeTruthy();
  });

  it("DateRangePicker applies a preset and picks a range", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const range = { from: new Date(2026, 9, 1), to: new Date(2026, 11, 31) };
    render(<DateRangePicker aria-label="Period" onValueChange={onValueChange} presets={[{ label: "This quarter", range: () => range }]} value={{ from: new Date(2026, 9, 1) }} />);
    await user.click(screen.getByRole("button", { name: /Period, Oct 1, 2026 – pick an end date/ }));
    await user.click(screen.getAllByRole("button", { name: /October 9/ })[0]);
    expect(onValueChange.mock.lastCall?.[0]).toEqual({ from: new Date(2026, 9, 1), to: new Date(2026, 9, 9) });
    await user.click(screen.getByRole("button", { name: "This quarter" }));
    expect(onValueChange).toHaveBeenLastCalledWith(range);
  });
});

describe("UserMenu", () => {
  function Menu({ onRole = () => {} }: { onRole?: (v: string) => void }) {
    const [role, setRole] = useState("viewer");
    return (
      <UserMenu detail="Viewer · Deal Desk view" name="Avery Chen">
        <UserMenuSection>
          <UserMenuItem href="/profile" shortcut="Ctrl ,">
            Profile and preferences
          </UserMenuItem>
          <UserMenuSub label="Switch workspace">
            <UserMenuItem href="/studio">AI Studio</UserMenuItem>
          </UserMenuSub>
        </UserMenuSection>
        <UserMenuSection label="Working role">
          <UserMenuRadioGroup
            onValueChange={(v) => {
              setRole(v);
              onRole(v);
            }}
            options={[
              { value: "seller", label: "Seller", description: "Quote with ACE" },
              { value: "viewer", label: "Viewer" },
            ]}
            value={role}
          />
        </UserMenuSection>
      </UserMenu>
    );
  }

  it("announces the checked role, switches it and has no axe violations", async () => {
    const user = userEvent.setup();
    const onRole = vi.fn();
    render(<Menu onRole={onRole} />);
    await user.click(screen.getByRole("button", { name: "Account: Avery Chen" }));
    const menu = await screen.findByRole("menu");
    expect(screen.getByText("Viewer · Deal Desk view")).toBeTruthy();
    expect(within(menu).getByRole("menuitemradio", { name: "Viewer" }).getAttribute("aria-checked")).toBe("true");
    expect(within(menu).getByRole("menuitemradio", { name: /Seller/ }).getAttribute("aria-checked")).toBe("false");
    expect(within(menu).getByRole("group", { name: "Working role" })).toBeTruthy();
    expect(within(menu).getByRole("menuitem", { name: /Profile and preferences/ }).getAttribute("href")).toBe("/profile");
    expect(await axeViolations(menu)).toEqual([]);
    await user.click(within(menu).getByRole("menuitemradio", { name: /Seller/ }));
    expect(onRole).toHaveBeenCalledWith("seller");
  });

  it("opens the submenu from the keyboard and Escape returns focus to the avatar", async () => {
    const user = userEvent.setup();
    render(<Menu />);
    const trigger = screen.getByRole("button", { name: "Account: Avery Chen" });
    trigger.focus();
    await user.keyboard("{Enter}");
    const sub = await screen.findByRole("menuitem", { name: "Switch workspace" });
    sub.focus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "AI Studio" })).toBeTruthy();
    await user.keyboard("{Escape}");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("still renders the default items for callers without children", async () => {
    const user = userEvent.setup();
    render(<UserMenu email="avery@example.com" name="Avery Chen" />);
    await user.click(screen.getByRole("button", { name: "Account: Avery Chen" }));
    expect(await screen.findByRole("menuitem", { name: "Sign out" })).toBeTruthy();
  });
});

describe("AppSidebar extras", () => {
  function Shell({ defaultOpen = true, onDocs = () => {} }: { defaultOpen?: boolean; onDocs?: (o: boolean) => void }) {
    return (
      <AppShell
        compactBelow={0}
        defaultOpen={defaultOpen}
        sidebar={
          <AppSidebar
            footerItems={[{ label: "Add teammates", href: "/team" }]}
            groups={[
              { items: [{ label: "Approvals", href: "/approvals", badge: 3, current: true }] },
              { label: "Documents", collapsible: true, onOpenChange: onDocs, items: [{ label: "Quotes", href: "/quotes" }] },
              { label: "More tools", collapsible: true, defaultOpen: false, items: [{ label: "Exports", href: "/exports", badge: 2, badgeLabel: "2 ready" }] },
            ]}
            scope={<ScopePill href="/about-data" label="Example data · as of Oct 21" tone="caution" />}
            workspace={{ name: "Deepgrids", subtitle: "Deal desk" }}
          />
        }
      >
        <h1>Home</h1>
      </AppShell>
    );
  }

  it("shows the scope, badges in the name, collapsible groups and footer items", async () => {
    const user = userEvent.setup();
    const onDocs = vi.fn();
    const { container } = render(<Shell onDocs={onDocs} />);
    expect(screen.getByRole("link", { name: "Example data · as of Oct 21" }).getAttribute("href")).toBe("/about-data");
    expect(screen.getByRole("link", { name: "Approvals, 3 waiting" }).getAttribute("aria-current")).toBe("page");
    const docs = screen.getByRole("button", { name: "Documents" });
    expect(docs.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "Quotes" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "More tools" }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: /Exports/ })).toBeNull();
    expect(screen.getByRole("link", { name: "Add teammates" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
    await user.click(docs);
    expect(onDocs).toHaveBeenCalledWith(false);
    expect(docs.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: "Quotes" })).toBeNull();
  });

  it("on the rail keeps every group's items and the count in the name", async () => {
    const { container } = render(<Shell defaultOpen={false} />);
    expect(screen.getByRole("link", { name: "Exports, 2 ready" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Approvals, 3 waiting" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Figure with icon and caption", () => {
  it("is one link named by label and value, described by the caption", async () => {
    const { container } = render(
      <main>
        <h1>Home</h1>
        <FigureStrip columns={2}>
          <Figure caption="Continue a draft" href="/quotes" icon={<FileTextIcon />} label="Quotes to work on" tone="primary" value={36} />
          <FigureCard caption="See who needs to review" icon={<FileTextIcon />} label="Waiting for approval" value="3" />
        </FigureStrip>
      </main>
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Quotes to work on: 36" }).getAttribute("href")).toBe("/quotes");
    expect(screen.getByRole("link", { description: "Continue a draft" })).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="figure"] span[aria-hidden="true"].size-8')).toHaveLength(2);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("service logos", () => {
  it("maps Snowflake, MCP and email names to their marks", () => {
    expect(serviceKey("Snowflake warehouse")).toBe("snowflake");
    expect(serviceKey("MCP server")).toBe("mcp");
    expect(serviceKey("Model Context Protocol")).toBe("mcp");
    expect(serviceKey("Email")).toBe("email");
    expect(serviceKey("Shared mail")).toBe("email");
    expect(serviceKey("Outlook")).toBe("outlook");
    for (const k of ["snowflake", "mcp", "email"]) expect(LOGO_SRC[k]).toMatch(/^data:image\/svg\+xml,/);
  });

  it("shows an app-provided src only when it is https, data:image or relative", async () => {
    const { container } = render(
      <p>
        <ServiceLogo label="Acme CRM" service="Acme CRM" src="https://cdn.example.com/acme.svg" />
        <ServiceLogo label="Local" service="Local" src="/logos/local.svg" />
        <ServiceLogo label="Bad" service="Bad" src="javascript:alert(1)" />
        <ServiceLogo label="Snowflake" service="Snowflake" />
      </p>
    );
    expect(screen.getByRole("img", { name: "Acme CRM" }).getAttribute("src")).toBe("https://cdn.example.com/acme.svg");
    expect(screen.getByRole("img", { name: "Local" }).getAttribute("src")).toBe("/logos/local.svg");
    expect(screen.getByRole("img", { name: "Bad" }).tagName).toBe("SPAN");
    expect(screen.getByRole("img", { name: "Snowflake" }).getAttribute("src")).toBe(LOGO_SRC.snowflake);
    expect(safeLogoSrc("//evil.example/x.svg")).toBeUndefined();
    expect(safeLogoSrc("http://example.com/x.svg")).toBeUndefined();
    expect(safeLogoSrc("data:text/html,<b>")).toBeUndefined();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("theme options", () => {
  const html = document.documentElement;
  const reset = () => {
    localStorage.clear();
    html.className = "";
    html.removeAttribute("data-theme");
  };

  it("ThemeScript (class, default key) reads lark-theme and sets .dark only", () => {
    reset();
    localStorage.setItem("lark-theme", "dusk");
    new Function(themeScriptSource())();
    expect(html.classList.contains("dark")).toBe(true);
    expect(html.hasAttribute("data-theme")).toBe(false);
  });

  it("ThemeScript with data-theme and a custom key writes the attribute, not the class", () => {
    reset();
    localStorage.setItem("deepgrids-intelligence-theme", "dark");
    new Function(themeScriptSource({ storageKey: "deepgrids-intelligence-theme", attribute: "data-theme" }))();
    expect(html.getAttribute("data-theme")).toBe("dark");
    expect(html.classList.contains("dark")).toBe(false);
    localStorage.setItem("deepgrids-intelligence-theme", "light");
    new Function(themeScriptSource({ storageKey: "deepgrids-intelligence-theme", attribute: "both" }))();
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(html.classList.contains("dark")).toBe(false);
  });

  it("ThemeScript escapes the key so it can't close the script", () => {
    expect(themeScriptSource({ storageKey: "</script><b>" })).not.toContain("</script>");
  });

  it("ThemeToggle with attribute both and a custom key stores under that key and fires its event", async () => {
    reset();
    const user = userEvent.setup();
    const onChange = vi.fn();
    window.addEventListener(themeEventName("app-theme"), onChange);
    render(<ThemeToggle attribute="both" storageKey="app-theme" />);
    const toggle = screen.getByRole("button", { name: "Dusk theme" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    await user.click(toggle);
    expect(localStorage.getItem("app-theme")).toBe("dusk");
    expect(localStorage.getItem("lark-theme")).toBeNull();
    expect(html.classList.contains("dark")).toBe(true);
    expect(html.getAttribute("data-theme")).toBe("dark");
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Dusk theme" }).getAttribute("aria-pressed")).toBe("true");
    window.removeEventListener(themeEventName("app-theme"), onChange);
    reset();
  });

  it("useTheme in data-theme mode resolves from the attribute", async () => {
    reset();
    const user = userEvent.setup();
    function Probe() {
      const { theme, resolved, setTheme } = useTheme({ attribute: "data-theme", storageKey: "k" });
      return (
        <button onClick={() => setTheme("dusk")} type="button">
          {theme}/{resolved}
        </button>
      );
    }
    render(<Probe />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button").textContent).toBe("dusk/dusk");
    expect(html.classList.contains("dark")).toBe(false);
    expect(themeEventName()).toBe("lark-theme-change");
    reset();
  });
});
