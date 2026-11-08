import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { FactGrid } from "@/components/lark/fact-grid";

import { axeViolations } from "./axe";

vi.mock("sonner", () => ({ toast: vi.fn() }));

const FACTS = [
  { term: "Account", value: "Northwind Freight", hint: "Renewal, enterprise" },
  { term: "Net price", value: "$412,800.00", copy: true },
  { term: "Discount", value: 22.5 },
  { term: "Purchase order", value: null },
  { term: "Quote", value: "R4", href: "#quote-r4" },
];

describe("FactGrid", () => {
  it("renders facts as a definition list and keeps amounts whole", async () => {
    const { container } = render(<FactGrid items={FACTS} />);
    const grid = container.querySelector("[data-slot=fact-grid]")!;
    expect(grid.tagName).toBe("DL");
    expect(grid.className).toContain("@container/facts");
    expect(grid.className).toContain("@[24rem]/facts:grid-cols-2");
    expect(screen.getByText("Northwind Freight")).toBeTruthy();
    expect(screen.getByText("Renewal, enterprise").getAttribute("data-meta")).toBe("hint");
    expect(container.querySelector("[data-slot=no-break]")?.textContent).toBe("$412,800.00");
    expect(screen.getByRole("link", { name: "R4" }).getAttribute("href")).toBe("#quote-r4");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("says Not set in words when the value is missing", () => {
    const { container } = render(<FactGrid items={FACTS} />);
    const missing = container.querySelector("[data-not-set]")!;
    expect(missing.querySelector("[aria-hidden=true]")?.textContent).toBe("Not set");
    expect(missing.querySelector(".sr-only")?.textContent).toBe("not set");
  });

  it("copies a value from a button named after its term", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<FactGrid items={FACTS} />);
    await user.click(screen.getByRole("button", { name: "Copy Net price" }));
    expect(writeText).toHaveBeenCalledWith("$412,800.00");
    expect(vi.mocked(toast)).toHaveBeenCalledWith("Copied");
  });

  it("treats an explicit column count as a maximum", () => {
    const { container } = render(<FactGrid columns={4} items={FACTS} />);
    const grid = container.querySelector("[data-slot=fact-grid]")!;
    expect(grid.getAttribute("data-columns")).toBe("4");
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("@[56rem]/facts:grid-cols-4");
  });
});
