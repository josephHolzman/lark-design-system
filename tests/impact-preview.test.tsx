import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImpactPreview, type ImpactItem } from "@/components/lark/impact-preview";

import { axeViolations } from "./axe";

const ITEMS: ImpactItem[] = [
  { from: "15%", id: "discount", label: "Discount", to: "22.5%", tone: "increase" },
  { from: "$412,800.00", id: "price", label: "Net price", to: "$421,000.00", tone: "increase" },
  { from: "Dana Ito", id: "approver", label: "Deal desk approver", to: "Legal and Finance", tone: "warning" },
];

function Preview() {
  return (
    <ImpactPreview
      items={ITEMS}
      policyChecks={<p>2 rules checked: 1 within policy, 1 needs approval.</p>}
      summary="Saving this re-prices the quote and adds Legal to the approval route."
    />
  );
}

describe("ImpactPreview", () => {
  it("shows the summary, each from → to value and the policy checks", async () => {
    const { container } = render(<Preview />);
    expect(screen.getByText("Saving this re-prices the quote and adds Legal to the approval route.")).toBeTruthy();
    expect(screen.getByText("Discount")).toBeTruthy();
    expect(screen.getByText("22.5%")).toBeTruthy();
    expect(Array.from(container.querySelectorAll("[data-slot=no-break]")).some((node) => node.textContent === "$421,000.00")).toBe(true);
    expect(container.querySelector("[data-tone=warning]")?.textContent).toContain("needs attention");
    expect(screen.getByText("2 rules checked: 1 within policy, 1 needs approval.")).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("says a missing value is not set", () => {
    const { container } = render(<ImpactPreview items={[{ from: "", label: "Purchase order", to: "PO-88412" }]} />);
    expect(container.querySelector("[data-slot=impact-item]")?.textContent).toContain("Not set");
  });
});
