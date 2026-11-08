import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApprovalRoute, DealFigures, InvoiceSchedule, OrderMatch, PolicyChecks, PriceWaterfall, QuoteLines, ScenarioCompare, SourceLine, formatMoney } from "@/components/lark/cpq";
import { ServiceLogo } from "@/components/lark/identity";

import { axeViolations } from "./axe";

describe("CPQ components", () => {
  it("have no structural accessibility violations", async () => {
    const { container } = render(
      <main>
        <h1>Quote</h1>
        <SourceLine meta="synced 2 min ago" record="Quote R4" service="Salesforce CPQ" />
        <DealFigures items={[{ label: "Total contract value", value: 1_001_710, format: "money", source: { service: "Salesforce CPQ" } }]} />
        <QuoteLines
          discountLimit={20}
          lines={[
            { id: "a", product: "Platform", quantity: 1, listPrice: 1000, discount: 24, proposed: { discount: 20, by: "ACE" } },
            { id: "b", product: "Support", quantity: 1, listPrice: 500, discount: 0, status: "locked", note: "Protected" },
          ]}
        />
        <PriceWaterfall start={{ label: "List", value: 1500 }} steps={[{ label: "Discount", value: -240 }]} />
        <PolicyChecks checks={[{ id: "1", rule: "Discount at most 20%", status: "needs-approval", approver: "VP Finance" }]} />
        <ApprovalRoute steps={[{ id: "s", label: "Finance", approvers: [{ name: "Rui Tanaka", role: "VP Finance", state: "pending", channel: "Slack" }] }]} />
        <ScenarioCompare scenarios={[{ id: "a", title: "Ramp", metrics: [{ label: "Net", value: "$1" }], approvals: "None", policy: { ok: true, text: "Within policy" } }]} />
        <InvoiceSchedule contractTotal={100} rows={[{ id: "1", period: "2027", due: "Feb 15", amount: 100 }]} />
        <OrderMatch accepted={{ service: "Salesforce CPQ", record: "R5" }} received={{ service: "Outlook", record: "PO.pdf" }} rows={[{ id: "1", field: "Start", accepted: "Apr 1", received: "Jan 1", status: "differs" }]} />
      </main>
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it("states totals, proposed changes and limits in text", () => {
    render(<QuoteLines discountLimit={20} lines={[{ id: "a", product: "Platform", quantity: 2, listPrice: 1000, discount: 24, proposed: { discount: 20, by: "ACE" } }]} />);
    // Both the table and the phone cards are in the DOM (CSS decides which shows; jsdom has no CSS).
    expect(screen.getAllByText(/Proposed by ACE/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Proposed 20%").length).toBeGreaterThan(0);
    // Totals: list, net per year, and the effect of the proposal.
    expect(screen.getAllByText("$2,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/With proposed changes/).length).toBeGreaterThan(0);
  });

  it("names the discount unit, counts exceptions with links and pins the summary", () => {
    const { container } = render(
      <QuoteLines
        discountLimit={20}
        lines={[
          { id: "a", product: "Platform", quantity: 2, listPrice: 1000, discount: 24 },
          { id: "b", product: "Support", quantity: 1, listPrice: 500, discount: 0, status: "error", note: "Missing list price" },
          { id: "c", product: "Analytics", quantity: 10, listPrice: 50, discount: 5 },
        ]}
      />
    );
    expect(screen.getByRole("columnheader", { name: /Discount \(%\)/ })).toBeTruthy();
    // Both layouts are in the DOM; each gets its own count and links to its own rows.
    expect(screen.getAllByText(/1 line is above the 20% limit and needs approval/).length).toBe(2);
    expect(screen.getAllByText(/1 line can't be priced/).length).toBe(2);
    expect(screen.getAllByRole("link", { name: "Platform" }).length).toBeGreaterThan(0);
    const bars = container.querySelectorAll("[data-slot=quote-totals-bar]");
    expect(bars).toHaveLength(2);
    bars.forEach((bar) => expect(bar.className).toContain("sticky"));
  });

  it("makes quantity and discount editable in both layouts, with their units", () => {
    render(
      <QuoteLines
        discountLimit={20}
        editable
        lines={[{ id: "a", product: "Platform", quantity: 1, unit: "seats", listPrice: 100, discount: 10 }]}
        onChange={() => {}}
      />
    );
    expect(screen.getAllByRole("spinbutton", { name: "Quantity for Platform in seats" })).toHaveLength(2);
    expect(screen.getAllByRole("spinbutton", { name: "Discount for Platform" })).toHaveLength(2);
    expect(screen.getByRole("columnheader", { name: /Discount \(%\)/ })).toBeTruthy();
  });

  it("says Recalculating instead of a stale total, and locks a submitted quote", () => {
    const { rerender } = render(<QuoteLines discountLimit={20} lines={[{ id: "a", product: "Platform", quantity: 2, listPrice: 1000, discount: 24 }]} recalculating />);
    expect(screen.getAllByText("Recalculating…").length).toBe(2);
    expect(screen.queryByText("$2,000")).toBeNull();
    rerender(
      <QuoteLines
        discountLimit={20}
        editable
        lines={[{ id: "a", product: "Platform", quantity: 2, listPrice: 1000, discount: 24 }]}
        locked={{ onRecall: () => {}, reason: "Quote R4 was submitted for approval.", waitingOn: "Rui Tanaka (VP Finance)" }}
      />
    );
    expect(screen.getAllByText(/Locked for approval/).length).toBe(2);
    expect(screen.getAllByRole("button", { name: "Recall" }).length).toBe(2);
    // A locked quote is not editable even when the caller asks for the editor.
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });

  it("says whether the invoice schedule balances", () => {
    render(<InvoiceSchedule contractTotal={300} rows={[{ id: "1", period: "Y1", due: "Feb", amount: 100 }, { id: "2", period: "Y2", due: "Feb", amount: 150 }]} />);
    expect(screen.getByText(/\$50 less than the contract value/)).toBeTruthy();
  });

  it("counts order differences", () => {
    render(
      <OrderMatch
        accepted={{ service: "Salesforce CPQ", record: "R5" }}
        received={{ service: "Outlook", record: "PO" }}
        rows={[
          { id: "1", field: "Total", accepted: "$1", received: "$1", status: "match" },
          { id: "2", field: "Start", accepted: "Apr", received: "Jan", status: "differs" },
        ]}
      />
    );
    expect(screen.getByText("1 difference blocks the order")).toBeTruthy();
  });

  it("formats money with a real minus and known services get logos", () => {
    expect(formatMoney(-56364)).toBe("−$56,364");
    const { container } = render(<ServiceLogo service="Salesforce CPQ" />);
    expect(container.querySelector("img")?.getAttribute("src")).toMatch(/^data:image\/svg\+xml,/);
    const { container: c2 } = render(<ServiceLogo service="NetSuite" />);
    expect(c2.textContent).toBe("NS");
  });
});
