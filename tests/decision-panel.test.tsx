import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DecisionPanel } from "@/components/lark/decision-panel";
import type { SaveState } from "@/components/lark/feedback";

import { axeViolations } from "./axe";

const OPTIONS = [
  {
    consequence: "The quote goes to the buyer at 22% for three years.",
    id: "approve",
    label: "Approve the exception",
  },
  {
    consequence: "Stays within the regional floor; the buyer decides again.",
    id: "counter",
    label: "Counter at 20%",
    recommended: true,
  },
  {
    consequence: "Nothing is sent until Finance reviews the margin.",
    disabled: "Finance has not set a floor for this region.",
    id: "hold",
    label: "Hold for Finance",
  },
];

function Panel({ status = "idle" as SaveState, onSelect = vi.fn() }) {
  return (
    <DecisionPanel
      aside={<p>Net price $12,480,000.00 · discount 22.5%</p>}
      options={OPTIONS}
      primary={{ label: "Send decision", onSelect }}
      question="Approve the discount exception, or counter it?"
      reason={{ label: "Why", required: true }}
      secondary={{ label: "Cancel" }}
      status={status}
      summary="The buyer asked to hold 22% for three years; the regional floor is 15%."
    />
  );
}

describe("DecisionPanel", () => {
  it("is a radio group named by the question with consequences and a recommendation", async () => {
    const { container } = render(<Panel />);
    const group = screen.getByRole("radiogroup", { name: "Approve the discount exception, or counter it?" });
    expect(group).toBeTruthy();
    expect(screen.getByText("The quote goes to the buyer at 22% for three years.")).toBeTruthy();
    expect(screen.getByText("Recommended")).toBeTruthy();
    expect(screen.getByText("Not available: Finance has not set a floor for this region.")).toBeTruthy();
    expect((screen.getByRole("radio", { name: /Hold for Finance/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("needs an option and the required reason before the primary action", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Panel onSelect={onSelect} />);
    const primary = screen.getByRole("button", { name: "Send decision" }) as HTMLButtonElement;
    expect(primary.disabled).toBe(true);
    await user.click(screen.getByRole("radio", { name: /Counter at 20%/ }));
    expect(primary.disabled).toBe(true);
    await user.type(screen.getByRole("textbox", { name: /Why/ }), "Buyer agreed to 20%.");
    expect(primary.disabled).toBe(false);
    await user.click(primary);
    expect(onSelect).toHaveBeenCalledWith({ optionId: "counter", reason: "Buyer agreed to 20%." });
  });

  it("announces the result through SaveStatus", () => {
    render(<Panel status="saved" />);
    expect(screen.getByRole("status").textContent).toContain("Saved");
  });
});
