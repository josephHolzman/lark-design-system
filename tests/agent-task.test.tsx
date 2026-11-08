import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AgentTaskCard, AgentTaskGrid, AgentTaskRow, type AgentTaskState } from "@/components/lark/agent-task";
import { Button } from "@/components/ui/button";

import { axeViolations } from "./axe";

const TASK = {
  action: (
    <Button size="sm" variant="secondary">
      Review draft
    </Button>
  ),
  agent: { ai: true, name: "ACE" },
  context: "Finance asked for the margin breakdown before the 3 PM review.",
  progress: { label: "Brief progress", max: 10, value: 6 },
  state: "running" as const,
  title: "Prepare the approval brief for Northwind renewal revision 4",
};

describe("AgentTaskCard", () => {
  it("shows who acts, the title, the state in words and one action", async () => {
    const { container } = render(<AgentTaskCard {...TASK} />);
    expect(screen.getByText("ACE")).toBeTruthy();
    expect(screen.getByText(TASK.title)).toBeTruthy();
    expect(screen.getByText("Running")).toBeTruthy();
    expect(screen.getByText(TASK.context)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Review draft" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("shows a labelled meter only while running", () => {
    const { rerender } = render(<AgentTaskCard {...TASK} />);
    const meter = screen.getByRole("meter", { name: "Brief progress" });
    expect(meter.getAttribute("aria-valuenow")).toBe("6");
    expect(meter.getAttribute("aria-valuemax")).toBe("10");
    rerender(<AgentTaskCard {...TASK} state="done" />);
    expect(screen.queryByRole("meter")).toBeNull();
  });

  it("names every state for the reader", () => {
    const states: [AgentTaskState, string][] = [
      ["queued", "Queued"],
      ["running", "Running"],
      ["needs-review", "Needs review"],
      ["done", "Done"],
      ["failed", "Failed"],
    ];
    for (const [state, word] of states) {
      const { container, unmount } = render(<AgentTaskCard {...TASK} state={state} />);
      expect(within(container).getByText(word)).toBeTruthy();
      unmount();
    }
  });
});

describe("AgentTaskGrid", () => {
  const tasks = [
    { ...TASK, id: "t1", title: "Prepare the approval brief" },
    { ...TASK, id: "t2", state: "done" as const, title: "Check the discount against policy", progress: undefined },
    { ...TASK, id: "t3", state: "needs-review" as const, title: "Draft a reply to the buyer", progress: undefined },
  ];

  it("renders cards for wide frames and rows for narrow ones", async () => {
    const { container } = render(<AgentTaskGrid label="Agent work" tasks={tasks} />);
    const cards = container.querySelector("[data-slot=agent-task-grid-cards]")!;
    const rows = container.querySelector("[data-slot=agent-task-grid-rows]")!;
    expect(cards.tagName).toBe("UL");
    expect(cards.className).toContain("@[36rem]/tasks:grid");
    expect(cards.className).toContain("@[60rem]/tasks:grid-cols-3");
    expect(cards.querySelectorAll("[data-slot=agent-task-card]").length).toBe(3);
    expect(rows.className).toContain("@[36rem]/tasks:hidden");
    expect(rows.querySelectorAll("[data-slot=agent-task-row]").length).toBe(3);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("AgentTaskRow", () => {
  it("keeps the avatar, title, state and action in one dense row", async () => {
    const { container } = render(
      <ul>
        <AgentTaskRow {...TASK} state="failed" context="The pricing service timed out." />
      </ul>
    );
    const row = container.querySelector("[data-slot=agent-task-row]")!;
    expect(row.tagName).toBe("LI");
    expect(within(row as HTMLElement).getByText("Failed")).toBeTruthy();
    expect(within(row as HTMLElement).getByRole("button", { name: "Review draft" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});
