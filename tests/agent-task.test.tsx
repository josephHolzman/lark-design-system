import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
  description: "Finance asked for the margin breakdown before the 3 PM review.",
  menu: [{ items: [{ label: "Dismiss" }, { label: "Reassign to Priya Raman" }] }],
  progress: { max: 4, step: "Drafting the margin table", value: 2 },
  state: "running" as const,
  time: "started 4 min ago",
  title: "Prepare the approval brief for Northwind renewal revision 4",
};

describe("AgentTaskCard", () => {
  it("shows identity, title, byline, description, state and one action in the card order", async () => {
    const { container } = render(<AgentTaskCard {...TASK} />);
    const card = container.querySelector("[data-slot=agent-task-card]") as HTMLElement;
    expect(within(card).getByRole("heading", { name: TASK.title })).toBeTruthy();
    expect(within(card).getByText("ACE · started 4 min ago")).toBeTruthy();
    expect(within(card).getByText(TASK.description)).toBeTruthy();
    expect(within(card).getByText("Running")).toBeTruthy();
    expect(within(card).getByRole("button", { name: "Review draft" })).toBeTruthy();
    expect(within(card).getByRole("button", { name: `More actions for ${TASK.title}` })).toBeTruthy();
    // One visible action in the footer, and the menu holds the rest with text labels.
    const footer = card.querySelector("[data-slot=agent-task-footer]") as HTMLElement;
    expect(within(footer).getByRole("button", { name: "Review draft" })).toBeTruthy();
    expect(within(footer).queryByRole("button", { name: "Dismiss" })).toBeNull();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("puts the description at the card's full width, not under the avatar", () => {
    const { container } = render(<AgentTaskCard {...TASK} />);
    const card = container.querySelector("[data-slot=agent-task-card]") as HTMLElement;
    const description = card.querySelector("[data-slot=agent-task-description]") as HTMLElement;
    expect(description.parentElement).toBe(card);
    expect(description.className).toContain("text-body-md");
  });

  it("shows a progressbar with its step in words while running, and nothing once done", () => {
    const { rerender } = render(<AgentTaskCard {...TASK} />);
    const bar = screen.getByRole("progressbar", { name: `Task progress: ${TASK.title}` });
    expect(bar.getAttribute("aria-valuenow")).toBe("2");
    expect(bar.getAttribute("aria-valuemax")).toBe("4");
    expect(bar.getAttribute("aria-valuetext")).toBe("Step 2 of 4 · Drafting the margin table");
    expect(screen.getByText("Step 2 of 4")).toBeTruthy();
    expect(screen.getByText("Drafting the margin table")).toBeTruthy();
    rerender(<AgentTaskCard {...TASK} state="done" progress={undefined} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("says what a queued task waits for instead of showing a bar", () => {
    render(<AgentTaskCard {...TASK} progress={undefined} state="queued" startsWhen="Starts when the 2027 pricing policy is published." />);
    expect(screen.getByText("Starts when the 2027 pricing policy is published.")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("keeps the footer and the state badge when there is no action", () => {
    const { container } = render(<AgentTaskCard {...TASK} action={undefined} menu={undefined} state="done" />);
    const footer = container.querySelector("[data-slot=agent-task-footer]") as HTMLElement;
    expect(footer).toBeTruthy();
    expect(within(footer).getByText("Done")).toBeTruthy();
  });

  it("names every state for the reader", () => {
    const states: [AgentTaskState, string][] = [
      ["queued", "Queued"],
      ["paused", "Paused"],
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

  it("gives every running task pause and stop in one action", async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();
    const onStop = vi.fn();
    render(<AgentTaskCard {...TASK} onPause={onPause} onStop={onStop} />);
    const more = screen.getByRole("button", { name: `More actions for ${TASK.title}` });
    await user.click(more);
    await user.click(screen.getByRole("menuitem", { name: "Pause task" }));
    expect(onPause).toHaveBeenCalled();
    await user.click(more);
    await user.click(screen.getByRole("menuitem", { name: "Stop task" }));
    expect(onStop).toHaveBeenCalled();
  });

  it("says resume when paused and keeps the step in words", async () => {
    const user = userEvent.setup();
    render(<AgentTaskCard {...TASK} onPause={() => {}} state="paused" />);
    expect(screen.getByText("Paused")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: `Task progress: ${TASK.title}` })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: `More actions for ${TASK.title}` }));
    expect(screen.getByRole("menuitem", { name: "Resume task" })).toBeTruthy();
  });

  it("names what a failed task needs, and what is done and next while it runs", () => {
    const { rerender } = render(<AgentTaskCard {...TASK} needs="the pricing service to answer" state="failed" />);
    expect(screen.getByText("Needs:")).toBeTruthy();
    expect(screen.getByText("the pricing service to answer")).toBeTruthy();
    rerender(
      <AgentTaskCard
        {...TASK}
        progress={{ completed: "Read R4 and the FY27 policy", max: 4, next: "Send the brief to Finance", step: "Drafting the margin table", value: 2 }}
        state="running"
      />
    );
    expect(screen.getByText("Done:")).toBeTruthy();
    expect(screen.getByText("Next:")).toBeTruthy();
    expect(screen.getByText("Read R4 and the FY27 policy")).toBeTruthy();
    expect(screen.getByText("Send the brief to Finance")).toBeTruthy();
  });
});

describe("AgentTaskGrid", () => {
  const tasks = [
    { ...TASK, id: "t1", title: "Prepare the approval brief" },
    { ...TASK, id: "t2", state: "done" as const, title: "Check the discount against policy", progress: undefined },
    { ...TASK, id: "t3", state: "needs-review" as const, title: "Draft a reply to the buyer", progress: undefined },
  ];

  it("renders equal-width cards for wide frames and rows for narrow ones", async () => {
    const { container } = render(<AgentTaskGrid label="Agent work" tasks={tasks} />);
    const cards = container.querySelector("[data-slot=agent-task-grid-cards]")!;
    const rows = container.querySelector("[data-slot=agent-task-grid-rows]")!;
    expect(cards.tagName).toBe("UL");
    expect(cards.className).toContain("@[36rem]/tasks:grid");
    expect(cards.className).toContain("@[60rem]/tasks:grid-cols-3");
    expect(cards.querySelectorAll("[data-slot=agent-task-card]").length).toBe(3);
    expect(cards.querySelectorAll("[data-slot=agent-task-card]")[0].className).toContain("h-full");
    expect(rows.className).toContain("@[36rem]/tasks:hidden");
    expect(rows.querySelectorAll("[data-slot=agent-task-row]").length).toBe(3);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("AgentTaskRow", () => {
  it("keeps the avatar, title, byline, state, action and menu in one dense row", async () => {
    const { container } = render(
      <ul>
        <AgentTaskRow {...TASK} state="failed" time="failed 12 min ago" />
      </ul>
    );
    const row = container.querySelector("[data-slot=agent-task-row]")!;
    expect(row.tagName).toBe("LI");
    expect(within(row as HTMLElement).getByText("ACE · failed 12 min ago")).toBeTruthy();
    expect(within(row as HTMLElement).getByText("Failed")).toBeTruthy();
    expect(within(row as HTMLElement).getByRole("button", { name: "Review draft" })).toBeTruthy();
    expect(within(row as HTMLElement).getByRole("button", { name: `More actions for ${TASK.title}` })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});
