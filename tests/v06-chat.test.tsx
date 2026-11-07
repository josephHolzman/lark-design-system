import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActionTray, type AnswerDoc, AnswerView } from "@/components/lark/answer";
import { ChatComposer, ChatPanel, Reasoning, SuggestionChips } from "@/components/lark/conversation";

import { axeViolations } from "./axe";

describe("ChatComposer", () => {
  it("sends on Enter, keeps Shift+Enter for new lines, clears, and swaps send for Stop while replying", async () => {
    const onSubmit = vi.fn();
    const { container, rerender } = render(<ChatComposer onSubmit={onSubmit} />);
    const box = screen.getByLabelText("Message ACE") as HTMLTextAreaElement;
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(box, { target: { value: "  Why VP approval?  " } });
    fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("Why VP approval?");
    expect(box.value).toBe("");
    rerender(<ChatComposer onStop={() => {}} onSubmit={onSubmit} status="streaming" />);
    expect(screen.getByRole("button", { name: "Stop" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Reasoning, suggestions and the panel", () => {
  it("opens to steps and the records they read; suggestions are buttons; the panel is a labelled region", async () => {
    const pick = vi.fn();
    const { container } = render(
      <main>
        <ChatPanel composer={<ChatComposer />} onClose={() => {}}>
          <Reasoning duration="6s" steps={[{ label: "Read quote R4", results: [{ label: "Quote R4", system: "Salesforce CPQ" }] }]} />
          <SuggestionChips items={["Show the price"]} onPick={pick} />
        </ChatPanel>
      </main>
    );
    const toggle = screen.getByRole("button", { name: "Thought for 6s" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getByText("Quote R4")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show the price" }));
    expect(pick).toHaveBeenCalledWith("Show the price");
    expect(screen.getByRole("region", { name: "ACE" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close ACE" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});

const DOC: AnswerDoc = {
  headline: "Three ways to schedule the invoices",
  tag: { label: "Northwind Traders", detail: "Renewal" },
  sections: [
    { type: "options", name: "Schedule", variant: true, options: [{ key: "a", title: "Annual" }, { key: "q", title: "Quarterly", selected: true }] },
    { type: "note", id: "later", hidden: true, text: "Finance review requested." },
    { type: "table", title: "Lines", columns: [{ label: "Product" }, { label: "Net", numeric: true }], rows: [{ cells: ["Platform", "$1.00"], status: { text: "Over limit", tone: "attention" } }] },
  ],
  prompt: "Save the quarterly schedule.",
  actions: [{ label: "Save", primary: true, effect: { message: "Saved.", reveal: "later" } }],
  sources: { items: [{ label: "Quote R4", system: "Salesforce CPQ" }] },
  variants: { a: { prompt: "Annual needs no review." } },
};

describe("AnswerView", () => {
  it("renders the answer with its headline level, switches variants, runs effects and reveals sections", async () => {
    const { container } = render(
      <main>
        <h1>Chat</h1>
        <AnswerView doc={DOC} level={2} />
      </main>
    );
    expect(screen.getByRole("heading", { level: 2, name: "Three ways to schedule the invoices" })).toBeTruthy();
    expect(screen.getByRole("article", { name: "Three ways to schedule the invoices" })).toBeTruthy();
    expect(screen.queryByText("Finance review requested.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Saved.")).toBeTruthy();
    expect(screen.getByText("Finance review requested.")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Annual" }));
    expect(screen.getByText("Annual needs no review.")).toBeTruthy();
    expect(screen.getAllByText("Over limit").length).toBeGreaterThan(0);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("Send via a service shows sending, then sent", async () => {
    vi.useFakeTimers();
    render(<ActionTray actions={[{ send: "Slack", primary: true, effect: { message: "Sent to Rui." } }]} />);
    fireEvent.click(screen.getByRole("button", { name: /Send via Slack/ }));
    expect(screen.getByRole("button", { name: /Sending via Slack/ })).toBeTruthy();
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("button", { name: /Sent via Slack/ })).toBeTruthy();
    expect(screen.getByText("Sent to Rui.")).toBeTruthy();
    vi.useRealTimers();
  });
});

describe("Answer edge cases", () => {
  it("keeps empty sections' titles, pads short table rows, and the skeleton is one busy status", async () => {
    const { AnswerSkeleton } = await import("@/components/lark/answer");
    const { container } = render(
      <main>
        <h1>Chat</h1>
        <AnswerView
          doc={{
            headline: "Edge cases",
            sections: [
              { type: "table", title: "Open purchase orders", columns: [{ label: "PO" }, { label: "Amount", numeric: true }], rows: [] },
              { type: "list", rows: [] },
              { type: "table", title: "Short rows", columns: [{ label: "A" }, { label: "B" }, { label: "C" }], rows: [{ cells: ["only one"] }] },
              { type: "chart", kind: "bar", title: "No data", xKey: "x", series: [{ key: "y", label: "Y" }], data: [] },
            ],
          }}
          level={2}
        />
        <AnswerSkeleton />
      </main>
    );
    expect(screen.getByText("Open purchase orders")).toBeTruthy();
    expect(screen.getAllByText(/Nothing to show/).length).toBe(2);
    expect(container.querySelectorAll('[data-slot="table-widget"] tbody tr td').length).toBe(3);
    expect(screen.getByText("ACE is preparing the answer")).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});
