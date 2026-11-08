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
  it("answers who it waits on now, with their role and why", () => {
    const summary = summarizeApprovals(STAGES);
    expect(summary.sentence).toBe("2 of 5 approved · Waiting on Priya Raman (Pricing) and Marcus Bell (Finance) · Discount above 15%");
    // It names the current stage, not everyone in later steps.
    expect(summary.waiting.map((a) => a.name)).toEqual(["Priya Raman", "Marcus Bell"]);
    expect(summary.currentStage?.id).toBe("b");
  });
  it("says what's blocking first", () => {
    const blocked = STAGES.map((s) => (s.id === "b" ? { ...s, approvers: [{ ...s.approvers[0] }, { ...s.approvers[1], state: "returned" as const }] } : s));
    expect(summarizeApprovals(blocked).sentence).toBe("Blocked: Marcus Bell (Finance) returned it · 2 of 5 approved");
    expect(summarizeApprovals([]).sentence).toBe("No approvals needed");
  });
  it("shows delegation in the open", () => {
    const delegated = STAGES.map((s) =>
      s.id === "b" ? { ...s, approvers: [{ ...s.approvers[0], delegation: "Approving for Dana Lee" }, s.approvers[1]] } : s
    );
    render(<ApprovalPath stages={delegated} />);
    expect(screen.getByText("Approving for Dana Lee")).toBeTruthy();
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
  it("describes an empty feed when the caller gives no copy", () => {
    render(<ActivityFeed entries={[]} />);
    expect(screen.getByText("Changes, approvals and comments on this record will show here.")).toBeTruthy();
  });
  it("tells ACE apart, shows relative time with the exact time on focus, and collapses routine syncs", () => {
    const { container } = render(
      <ActivityFeed
        entries={[
          ...ENTRIES,
          { id: "4", party: "ace", author: "ACE", title: "Drafted the renewal note", at: new Date("2026-11-07T14:30:00").toISOString() },
          { id: "5", party: "system", author: "Salesforce sync", title: "updated 14 fields", noise: true, detail: "Discount, term and 12 other fields.", at: new Date("2026-11-07T14:00:00").toISOString() },
        ]}
        now={NOW}
      />
    );
    expect(screen.getAllByText("ACE").length).toBeGreaterThan(0);
    expect(container.querySelector('[data-party="ace"] [data-slot="ace-mark"]')).toBeTruthy();
    const time = container.querySelector('[data-party="customer"] time') as HTMLElement;
    expect(time.textContent).toBe("5 hours ago");
    expect(time.getAttribute("tabindex")).toBe("0");
    expect(time.title).toContain("2026");
    const noise = container.querySelector('[data-noise="true"]') as HTMLElement;
    expect(noise.textContent).toContain("updated 14 fields");
    expect(within(noise).getByRole("button", { name: "Show" })).toBeTruthy();
    expect(within(noise).getByText("Discount, term and 12 other fields.").closest("[hidden]")).not.toBeNull();
    fireEvent.click(within(noise).getByRole("button", { name: "Show" }));
    expect(within(noise).getByText("Discount, term and 12 other fields.").closest("[hidden]")).toBeNull();
  });
  it("holds new entries behind a count until the reader asks for them", () => {
    const { rerender } = render(<ActivityFeed entries={ENTRIES} now={NOW} />);
    rerender(
      <ActivityFeed
        entries={[...ENTRIES, { id: "9", party: "internal", author: "Dana Ito", title: "Approved the quote", at: new Date("2026-11-07T14:45:00").toISOString() }]}
        now={NOW}
      />
    );
    expect(screen.getByRole("status").textContent).toContain("1 new update");
    expect(screen.queryByText("Dana Ito")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show 1 new update" }));
    expect(screen.getByText("Dana Ito")).toBeTruthy();
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
