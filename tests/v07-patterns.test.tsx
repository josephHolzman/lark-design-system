import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ActivityEntry, ActivityFeed, SituationSummary } from "@/components/lark/activity";
import { ApprovalPath, summarizeApprovals } from "@/components/lark/approvals";
import type { ApprovalStep } from "@/components/lark/cpq";

import { axeViolations } from "./axe";

const STAGES: ApprovalStep[] = [
  { id: "a", label: "Deal desk", mode: "parallel", approvers: [{ name: "Dana Ito", role: "Deal desk", state: "approved" }, { name: "Leo Varga", role: "Sales manager", state: "approved" }] },
  { id: "b", label: "Pricing and finance", mode: "parallel", approvers: [{ name: "Priya Raman", role: "Pricing", state: "pending", reason: "Discount above 15%" }, { name: "Marcus Bell", role: "Finance", state: "pending" }] },
  { id: "c", label: "Legal", approvers: [{ name: "Ana Souza", role: "Legal", state: "waiting" }] },
  { id: "d", label: "Tax", approvers: [{ name: "Rui Santos", role: "Tax", state: "skipped" }] },
];

describe("ApprovalPath v2", () => {
  it("answers who still has to approve", () => {
    expect(summarizeApprovals(STAGES).sentence).toBe("2 of 5 approved · waiting on Pricing, Finance and Legal");
  });
  it("says what's blocking first", () => {
    const blocked = STAGES.map((s) => (s.id === "b" ? { ...s, approvers: [{ ...s.approvers[0] }, { ...s.approvers[1], state: "returned" as const }] } : s));
    expect(summarizeApprovals(blocked).sentence).toBe("Blocked: Finance returned it · 2 of 5 approved");
    expect(summarizeApprovals([]).sentence).toBe("No approvals needed");
  });
  it("names each stage's state, and keeps the reason one click away", async () => {
    const { container } = render(<ApprovalPath stages={STAGES} />);
    expect(screen.getByRole("listitem", { name: "Stage 1 of 4: Deal desk, done" })).toBeTruthy();
    expect(screen.getByRole("listitem", { name: "Stage 2 of 4: Pricing and finance, in progress" })).toBeTruthy();
    const row = screen.getByRole("button", { name: /Priya Raman, Pricing, Deciding/ });
    expect(row.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText(/discount above 15%/).closest("[hidden]")).not.toBeNull();
    fireEvent.click(row);
    expect(row.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/discount above 15%/).closest("[hidden]")).toBeNull();
    expect(await axeViolations(container)).toEqual([]);
  });
});

const NOW = new Date("2026-11-07T15:00:00");
const ENTRIES: ActivityEntry[] = [
  { id: "1", party: "customer", author: "Jordan Lee", title: "Asked for a 3-year term", message: "Can we hold 22%?", at: new Date("2026-11-07T10:00:00").toISOString(), reference: "Re: Terms" },
  { id: "2", party: "internal", author: "Marcus Bell", title: "Asked for margin", at: new Date("2026-11-06T09:00:00").toISOString() },
  { id: "3", party: "system", author: "Approval service", title: "Started review", at: new Date("2026-11-03T09:00:00").toISOString() },
];

describe("ActivityFeed", () => {
  it("groups by day, names the party in words, and filters with counts", async () => {
    const { container } = render(<ActivityFeed entries={ENTRIES} now={NOW} provenance={<span>Example data</span>} />);
    expect(screen.getAllByText("Example data")).toHaveLength(1);
    expect(screen.getByRole("region", { name: "Today" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Yesterday" })).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Today" })).getByText("Customer")).toBeTruthy();
    expect(container.querySelector("blockquote")?.textContent).toBe("Can we hold 22%?");
    fireEvent.click(screen.getByRole("radio", { name: /Internal/ }));
    expect(screen.queryByText("Jordan Lee")).toBeNull();
    expect(screen.getByText("Marcus Bell")).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("has an empty state", () => {
    render(<ActivityFeed empty={<p>Nothing yet</p>} entries={[]} />);
    expect(screen.getByText("Nothing yet")).toBeTruthy();
  });
});

describe("SituationSummary", () => {
  it("says the status in words, the problem and the next step", async () => {
    const { container } = render(<SituationSummary next="Finance decides" problem="Buyer won't sign" status="blocked" />);
    expect(screen.getByRole("region", { name: "Current situation" }).textContent).toContain("Blocked");
    expect(screen.getByText("Finance decides")).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});
