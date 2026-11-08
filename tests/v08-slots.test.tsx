import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { RunSteps } from "@/components/lark/ai";
import { IllustratedChoiceCard } from "@/components/lark/bands";
import { ActionCard, PromoCard, SectionCard } from "@/components/lark/cards";
import { ActionReview, AnswerSources, ChatWelcome, ConversationListItem, StoppedNotice } from "@/components/lark/chat";
import { ApprovalRoute, CpqStages, PolicyChecks } from "@/components/lark/cpq";
import { DataGrid } from "@/components/lark/data-grid";
import { Banner, StatePanel, UnsavedChangesBar } from "@/components/lark/feedback";
import { CompanyLogo } from "@/components/lark/identity";
import { Illustration } from "@/components/lark/illustration";
import { List, ListItem } from "@/components/lark/lists";
import { VerticalNav } from "@/components/lark/menus";
import { splitOverflow } from "@/components/lark/overflow";
import { AppShell } from "@/components/lark/shell";
import { StepList } from "@/components/lark/steps";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CommandDialog, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { NumberInput } from "@/components/ui/number-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { axeViolations } from "./axe";

const JPEG = "/illustrations/empty-draft.svg";

describe("Illustration", () => {
  it("reserves its box, keeps the brief, and is decorative unless alt is given", async () => {
    const { container } = render(<Illustration brief="An empty draft" size={200} src={JPEG} />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("alt")).toBe("");
    expect(img.getAttribute("aria-hidden")).toBe("true");
    expect(img.getAttribute("width")).toBe("200");
    expect(img.getAttribute("height")).toBe("200");
    expect(img.className).toContain("size-[12.5rem]");
    expect(img.className).toContain("@max-[20rem]/illustration:size-[8.75rem]");
    expect(container.querySelector("[data-slot=illustration]")?.getAttribute("data-brief")).toBe("An empty draft");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("is an image with its own name when alt carries meaning", () => {
    render(<Illustration alt="An empty draft" size="wide" src={JPEG} />);
    expect(screen.getByRole("img", { name: "An empty draft" }).className).toContain("w-full");
  });

  it("appears above an empty module, state, banner and promo", () => {
    const { container } = render(
      <div>
        <SectionCard illustration={{ src: JPEG, size: 140 }} title="No drafts" />
        <StatePanel illustration={{ src: JPEG, size: 96 }} kind="first-run" title="Nothing yet" />
        <Banner illustration={{ src: JPEG, size: 48 }}>No mailbox is linked.</Banner>
        <PromoCard illustration={{ src: JPEG, size: 96 }} title="Try ACE" />
      </div>
    );
    expect(container.querySelectorAll("[data-slot=illustration]")).toHaveLength(4);
  });

  it("does not crowd a module that has content", () => {
    const { container } = render(
      <SectionCard illustration={{ src: JPEG }} title="Drafts">
        <p>One draft</p>
      </SectionCard>
    );
    expect(container.querySelector("[data-slot=illustration]")).toBeNull();
  });

  it("keeps a compact state text-only and left-aligned (a sheet is a small container)", () => {
    const { container } = render(<StatePanel compact illustration={{ src: JPEG, size: 140 }} kind="first-run" title="No signals yet" />);
    const panel = container.querySelector("[data-slot=state-panel]") as HTMLElement;
    expect(container.querySelector("[data-slot=illustration]")).toBeNull();
    expect(panel.className).toContain("text-left");
    expect(panel.className).not.toContain("text-center");
  });

  it("sizes a promo's media by the promo's own width, not the viewport", () => {
    const { container } = render(<PromoCard media={<span className="block size-12" />} title="Try ACE" />);
    const promo = container.querySelector("[data-slot=promo-card]") as HTMLElement;
    expect(promo.className).toContain("@container/promo");
    expect(promo.firstElementChild?.className).toContain("@[24rem]/promo:block");
  });
});

describe("CompanyLogo fallback", () => {
  it("shows initials on an inset tile when the image fails, and keeps its name", () => {
    const { container } = render(<CompanyLogo decorative={false} name="Northwind Freight" size="lg" src="/missing/northwind.svg" />);
    const tile = screen.getByRole("img", { name: "Northwind Freight" });
    expect(container.querySelector("img")).toBeTruthy();
    fireEvent.error(container.querySelector("img")!);
    expect(tile.textContent).toBe("NF");
    expect(tile.className).toContain("bg-inset");
    expect(tile.className).toContain("text-on-surface-variant");
  });

  it("uses initials when src is missing", () => {
    render(<CompanyLogo decorative={false} name="Cedar & Field" />);
    expect(screen.getByRole("img", { name: "Cedar & Field" }).textContent).toBe("CF");
  });

  it("falls back when the image failed before hydration", async () => {
    // A 404 that fires before React attaches onError: the mounted image is complete and empty.
    const complete = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "complete");
    const naturalWidth = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "naturalWidth");
    Object.defineProperty(HTMLImageElement.prototype, "complete", { configurable: true, get: () => true });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", { configurable: true, get: () => 0 });
    try {
      render(<CompanyLogo decorative={false} name="Northwind Freight" src="/customers/missing.svg" />);
      await waitFor(() => expect(screen.getByRole("img", { name: "Northwind Freight" }).textContent).toBe("NF"));
    } finally {
      if (complete) Object.defineProperty(HTMLImageElement.prototype, "complete", complete);
      if (naturalWidth) Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", naturalWidth);
    }
  });
});

describe("NumberInput commit and stepper names", () => {
  it("commits every valid keystroke with commit=change", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Host() {
      const [v, setV] = useState<number | undefined>(undefined);
      return (
        <NumberInput
          aria-label="Quantity"
          commit="change"
          onValueChange={(n) => {
            setV(n);
            onValueChange(n);
          }}
          value={v}
        />
      );
    }
    render(<Host />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    await user.type(input, "42");
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([4, 42]);
  });

  it("names the steppers after the field and right-aligns its quantity", () => {
    render(<NumberInput aria-label="Discount" onValueChange={() => {}} value={20} />);
    expect(screen.getByRole("button", { name: "Increase Discount" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Decrease Discount" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Discount" }).className).toContain("text-right");
  });
});

describe("Tabs overflow", () => {
  it("still renders and switches tabs when overflow is on", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Sections" overflow="menu">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lines">Lines</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="lines">Lines panel</TabsContent>
        <TabsContent value="approvals">Approvals panel</TabsContent>
      </Tabs>
    );
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    await user.click(screen.getByRole("tab", { name: "Approvals" }));
    expect(screen.getByText("Approvals panel")).toBeTruthy();
  });

  it("never scrolls by default: tabs fold into More without asking", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Sections">
          <TabsTrigger value="a">Overview</TabsTrigger>
          <TabsTrigger value="b">Quote lines</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const list = container.querySelector("[data-slot=tabs-list]") as HTMLElement;
    expect(list.getAttribute("data-overflow")).toBe("menu");
    expect(list.className).not.toContain("overflow-x-auto");
  });

  it("splits around the visible count and keeps the pinned trigger", () => {
    const a = { id: "a" },
      b = { id: "b" },
      c = { id: "c" },
      d = { id: "d" };
    expect(splitOverflow([a, b, c, d], 4, 0)).toEqual({ shown: [a, b, c, d], hidden: [] });
    expect(splitOverflow([a, b, c, d], 2, 2)).toEqual({ shown: [a, c], hidden: [b, d] });
    expect(splitOverflow([a, b, c, d], 3)).toEqual({ shown: [a, b, c], hidden: [d] });
  });
});

describe("§3 small fixes", () => {
  it("CommandDialog returns focus to the button that opened it", async () => {
    const user = userEvent.setup();
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            Open palette
          </button>
          <CommandDialog onOpenChange={setOpen} open={open} title="Search">
            <CommandInput placeholder="Search" />
            <CommandList>
              <CommandItem>Northwind</CommandItem>
            </CommandList>
          </CommandDialog>
        </>
      );
    }
    render(<Host />);
    const opener = screen.getByRole("button", { name: "Open palette" });
    await user.click(opener);
    await screen.findByPlaceholderText("Search");
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(opener);
  });

  it("SheetContent can hide its close button", () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>The drawer carries its own close.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("NativeSelect puts className on the select", () => {
    const { container } = render(
      <NativeSelect aria-label="Region" className="w-40" wrapperClassName="block" defaultValue="emea">
        <NativeSelectOption value="emea">EMEA</NativeSelectOption>
      </NativeSelect>
    );
    expect(screen.getByRole("combobox", { name: "Region" }).className).toContain("w-40");
    expect(container.querySelector("[data-slot=native-select-wrapper]")?.className).toContain("block");
  });

  it("ScrollArea's viewport is a tab stop", () => {
    const { container } = render(
      <ScrollArea className="h-24">
        <div>Long content</div>
      </ScrollArea>
    );
    expect(container.querySelector("[data-slot=scroll-area-viewport]")?.getAttribute("tabindex")).toBe("0");
  });

  it("Calendar day names contain the visible number", async () => {
    render(<Calendar defaultMonth={new Date(2026, 10, 1)} mode="single" />);
    expect(screen.getByRole("button", { name: /November 14, 2026/ })).toBeTruthy();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("ListItem and ActionCard links carry a reset hook", () => {
    const { container } = render(
      <div>
        <List>
          <ListItem headline="Northwind" href="/deals/northwind" />
        </List>
        <ActionCard href="/deals/new" title="Create a deal" />
      </div>
    );
    expect(container.querySelector('[data-slot="list-item-link"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="action-card-link"]')).toBeTruthy();
  });

  it("IllustratedChoiceCard is named by everything it shows", () => {
    render(<IllustratedChoiceCard cta="Explore this role" description="Draft and price quotes." href="/seller" media={<span />} title="Seller" tone="sky" />);
    const link = screen.getByRole("link", { name: "Seller. Draft and price quotes. Explore this role" });
    expect(link.getAttribute("href")).toBe("/seller");
  });

  it("DatePicker's name carries the visible placeholder while empty", () => {
    render(<DatePicker aria-label="Close date" onValueChange={() => {}} placeholder="Pick a close date" />);
    expect(screen.getByRole("button", { name: "Close date, Pick a close date" })).toBeTruthy();
  });

  it("ApprovalRoute and PolicyChecks can use the record's words", () => {
    render(
      <div>
        <ApprovalRoute steps={[{ id: "s", label: "Finance", approvers: [{ name: "Rui Tanaka", role: "VP Finance", state: "pending", stateLabel: "Ready for review" }] }]} />
        <PolicyChecks checks={[{ id: "1", rule: "Discount at most 15%", status: "needs-approval", statusLabel: "Ready for review" }]} />
      </div>
    );
    expect(screen.getAllByText("Ready for review")).toHaveLength(2);
  });

  it("UnsavedChangesBar takes a discard label and extra actions", () => {
    render(
      <UnsavedChangesBar count={1} discardLabel="Discard edits" onDiscard={() => {}} onSave={() => {}} open>
        <Button size="sm" variant="secondary">
          Review approvals
        </Button>
      </UnsavedChangesBar>
    );
    expect(screen.getByRole("button", { name: "Discard edits" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Review approvals" })).toBeTruthy();
  });

  it("UnsavedChangesBar keeps Save focusable while it saves", () => {
    render(<UnsavedChangesBar onDiscard={() => {}} onSave={() => {}} open saving />);
    const save = screen.getByRole("button", { name: /Saving/ });
    // A disabled button drops keyboard focus mid-Tab; aria-disabled blocks the press instead.
    expect(save).toHaveProperty("disabled", false);
    expect(save.getAttribute("aria-disabled")).toBe("true");
    expect(save.getAttribute("aria-busy")).toBe("true");
  });

  it("ActionReview can disable its buttons and hold a field", () => {
    render(
      <ActionReview approveDisabled declineDisabled describedBy="note" fields={<label htmlFor="note">What needs changing?</label>} title="Request changes">
        A note is needed.
      </ActionReview>
    );
    const approve = screen.getByRole("button", { name: "Approve" });
    const decline = screen.getByRole("button", { name: "Don't do this" });
    expect(approve).toHaveProperty("disabled", true);
    expect(decline).toHaveProperty("disabled", true);
    expect(approve.getAttribute("aria-describedby")).toBe("note");
    expect(screen.getByText("What needs changing?")).toBeTruthy();
  });

  it("RunSteps is still when idle and says skipped", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RunSteps
        idle
        steps={[
          { id: "a", title: "Check lines", state: "idle" },
          { id: "b", title: "Tax", state: "skipped" },
        ]}
        title="Order check"
      />
    );
    expect(container.querySelector(".animate-spin")).toBeNull();
    await user.click(screen.getByRole("button", { name: /Order check/ }));
    expect(screen.getByText(/skipped/, { exact: false })).toBeTruthy();
  });

  it("StepList titles can be buttons", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <StepList
        aria-label="Bench"
        steps={[
          { id: "a", title: "Match the invoice", state: "done" },
          { id: "b", title: "Post the journal", state: "current", onSelect },
        ]}
      />
    );
    await user.click(screen.getByRole("button", { name: /Post the journal/ }));
    expect(onSelect).toHaveBeenCalled();
  });

  it("StoppedNotice takes the true note and a retry", () => {
    render(<StoppedNotice note="The server may still save the answer." onRetry={() => {}} />);
    expect(screen.getByText("The server may still save the answer.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });

  it("ConversationListItem switches in place and can be blocked", () => {
    const onSelect = vi.fn();
    const View = ({ disabled }: { disabled?: boolean }) => (
      <nav aria-label="Recent">
        <ConversationListItem disabled={disabled} onSelect={onSelect} title="Renewal terms" />
      </nav>
    );
    const { rerender } = render(<View />);
    fireEvent.click(screen.getByRole("link", { name: /Renewal terms/ }));
    expect(onSelect).toHaveBeenCalled();
    onSelect.mockClear();
    rerender(<View disabled />);
    const link = screen.getByRole("link", { name: /Renewal terms/ });
    expect(link.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(link);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("ChatWelcome takes a title level and never puts an eyebrow over the title", () => {
    render(<ChatWelcome eyebrow="New chat" title="What do you need to prepare?" titleAs="h1" />);
    expect(screen.getByRole("heading", { level: 1, name: "What do you need to prepare?" })).toBeTruthy();
    expect(screen.queryByText("New chat")).toBeNull();
  });

  it("AnswerSources can open the saved record", () => {
    const onOpen = vi.fn();
    render(<AnswerSources sources={[{ id: "a", label: "Quote R4", onOpen }]} />);
    fireEvent.click(screen.getByRole("button", { name: /Quote R4/ }));
    expect(onOpen).toHaveBeenCalled();
  });

  it("DataGrid can offer rows per page", () => {
    render(
      <DataGrid
        caption="Quotes"
        columns={[
          { id: "account", accessorKey: "account", header: "Account" },
          { id: "value", accessorKey: "value", header: "Value" },
        ]}
        data={Array.from({ length: 12 }, (_, i) => ({ id: String(i), account: `Account ${i + 1}`, value: `$${i}` }))}
        getRowId={(r) => r.id}
        pageSize={5}
        pageSizeOptions={[5, 10, 25]}
      />
    );
    const select = screen.getByRole("combobox", { name: "Rows per page" });
    expect(select).toHaveProperty("value", "5");
  });

  it("VerticalNav items can be links", () => {
    render(<VerticalNav items={[{ value: "profile", label: "Profile", href: "#profile" }]} label="Settings" onChange={() => {}} value="profile" />);
    const link = screen.getByRole("link", { name: "Profile" });
    expect(link.getAttribute("href")).toBe("#profile");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("CpqStages takes the record's step names", () => {
    render(<CpqStages current="configure" labels={{ configure: "Understand request" }} />);
    expect(screen.getByText("Understand request")).toBeTruthy();
  });
});

describe("AppShell", () => {
  it("makes the page region the main landmark and the top bar a banner", () => {
    render(
      <AppShell sidebar={<div />} topbar={<header>Top bar</header>}>
        <h1>Page content</h1>
      </AppShell>
    );
    const main = screen.getByRole("main");
    expect(main.contains(screen.getByRole("heading", { name: "Page content" }))).toBe(true);
    expect(screen.getByRole("banner").textContent).toBe("Top bar");
  });

  it("reports a rail toggle through onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(
      <AppShell onOpenChange={onOpenChange} sidebar={<div />}>
        <h1>Page content</h1>
      </AppShell>
    );
    fireEvent.keyDown(window, { ctrlKey: true, key: "b" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
