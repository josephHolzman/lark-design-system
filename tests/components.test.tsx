import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ActionReceipt, ActionReview, AnswerSources, ClarifyQuestion, ConversationListItem, DraftCard, ModeSwitch, ThinkingRow, UserTurn, WorkLog } from "@/components/lark/chat";
import { type ColumnDef, DataGrid } from "@/components/lark/data-grid";
import { InlineEdit } from "@/components/lark/editing";
import { Banner, Callout, StatePanel } from "@/components/lark/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
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
