import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SectionCard, ChoiceCard } from "@/components/lark/cards";
import { AnswerSources, AssistantTurn, type ChatSource, Claim } from "@/components/lark/chat";
import { ApprovalMatrix, ScenarioCompare } from "@/components/lark/cpq";
import { FigureCard } from "@/components/lark/figure";
import { SplitButton } from "@/components/lark/menus";
import { CardStatusFooter, CompoundTag, Freshness, ProvisionalBadge, relativeTime, Tray, TrayCard } from "@/components/lark/surfaces";
import { Button } from "@/components/ui/button";
import { ContainedInput, ContainedTextarea } from "@/components/ui/contained-field";

import { axeViolations } from "./axe";

const NOW = new Date("2026-11-06T15:00:00Z");
const src: ChatSource = { id: "p1", label: "Quote R4, platform line", system: "Pricing engine", excerpt: "Discount 22%." };

describe("Tray and strip cards (v0.6)", () => {
  it("is a labelled region of concentric cards with a status footer", async () => {
    const { container } = render(
      <main>
        <Tray title="Approvals for quote R4">
          <TrayCard>
            <p>Deal desk</p>
            <CardStatusFooter action={<Button size="sm">Open request</Button>} status={<span>Awaiting decision</span>} />
          </TrayCard>
        </Tray>
        <SectionCard title="Terms" variant="strip">
          <p>24 months</p>
        </SectionCard>
      </main>
    );
    const tray = screen.getByRole("region", { name: "Approvals for quote R4" });
    expect(tray.className).toContain("rounded-2xl");
    expect(tray.className).toContain("p-3");
    expect(container.querySelector('[data-slot="tray-card"]')?.className).toContain("rounded-lg");
    expect(screen.getByRole("region", { name: "Terms" }).getAttribute("data-variant")).toBe("strip");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("ContainedInput (v0.6)", () => {
  it("labels the control, links error and disabled reason, and marks required", async () => {
    const { container } = render(
      <form>
        <ContainedInput defaultValue="24" label="Term" required suffix="months" />
        <ContainedInput defaultValue="22" error="Above the 15% EMEA floor." label="Discount" suffix="%" />
        <ContainedInput defaultValue="Net 60" disabledReason="Set by the master agreement." label="Payment terms" />
        <ContainedTextarea description="Shown to approvers." label="Note for approvers" />
      </form>
    );
    const term = screen.getByLabelText(/Term/);
    expect(term.getAttribute("aria-required")).toBe("true");
    const discount = screen.getByLabelText("Discount");
    expect(discount.getAttribute("aria-invalid")).toBe("true");
    const errId = discount.getAttribute("aria-describedby")!;
    expect(document.getElementById(errId)?.textContent).toContain("Above the 15% EMEA floor.");
    const terms = screen.getByLabelText("Payment terms") as HTMLInputElement;
    expect(terms.disabled).toBe(true);
    expect(document.getElementById(terms.getAttribute("aria-describedby")!)?.textContent).toBe("Set by the master agreement.");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Provisional, compound tags and freshness (v0.6)", () => {
  it("says provisional in words, reads compound tags as one phrase, and flags stale numbers", async () => {
    const { container } = render(
      <div>
        <ProvisionalBadge kind="ai" />
        <CompoundTag label="Discount" value="92%" />
        <Freshness at={new Date(NOW.getTime() - 2 * 60_000)} now={NOW} />
        <FigureCard label="ARR change" updated={{ at: new Date(NOW.getTime() - 5 * 3_600_000), now: NOW, staleAfter: 60 }} value="+$212,000.00" />
      </div>
    );
    expect(screen.getByText("Suggested by ACE")).toBeTruthy();
    expect(container.querySelector('[data-slot="compound-tag"]')?.textContent).toBe("Discount, 92% confidence");
    expect(screen.getByText("2 minutes ago").tagName).toBe("TIME");
    expect(container.querySelector('[data-stale="true"]')?.textContent).toContain("may be out of date");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("formats relative times", () => {
    expect(relativeTime(new Date(NOW.getTime() - 10_000), NOW)).toBe("just now");
    expect(relativeTime(new Date(NOW.getTime() - 3 * 3_600_000), NOW)).toBe("3 hours ago");
  });
});

describe("Best for (v0.6)", () => {
  it("lists what each choice and option suits, and marks unsaved options", async () => {
    const { container } = render(
      <main>
        <ChoiceCard choices={[{ value: "1y", label: "1 year", bestFor: ["Pilots"] }]} prompt="Which term?" />
        <ScenarioCompare scenarios={[{ id: "a", title: "2 years", metrics: [{ label: "Total", value: "$1.00" }], approvals: "Deal desk", policy: { ok: true, text: "Within policy" }, bestFor: ["Renewals"], provisional: true }]} />
      </main>
    );
    expect(screen.getAllByText("Pilots").length).toBe(1);
    expect(screen.getAllByText("Not saved").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Renewals").length).toBeGreaterThan(0);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("ApprovalMatrix (v0.6)", () => {
  it("is one radio group per row with names that say the row and the approver", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <ApprovalMatrix
        caption="Approver by discount band, EMEA"
        changed={["b1"]}
        levels={[
          { id: "manager", label: "Manager" },
          { id: "desk", label: "Deal desk" },
        ]}
        onChange={onChange}
        rows={[
          { id: "b0", label: "Up to 10%" },
          { id: "b1", label: "10–15%" },
        ]}
        value={{ b0: "manager", b1: "desk" }}
      />
    );
    expect(screen.getByRole("table", { name: "Approver by discount band, EMEA" })).toBeTruthy();
    const desk = screen.getByRole("radio", { name: "10–15%: Deal desk" }) as HTMLInputElement;
    expect(desk.checked).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "Up to 10%: Deal desk" }));
    expect(onChange).toHaveBeenCalledWith("b0", "desk");
    expect(screen.getByText("Changed")).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Cited answer (v0.6)", () => {
  it("names ACE as AI, and each claim is a button naming its source", async () => {
    const { container } = render(
      <main>
        <AssistantTurn agent={{ time: "9:16 AM" }} lead="Checked quote R4.">
          <p>
            The platform line is discounted <Claim n={1} source={src}>22%</Claim>.
          </p>
          <AnswerSources collapsible sources={[src]} />
        </AssistantTurn>
      </main>
    );
    expect(screen.getByText("AI")).toBeTruthy();
    expect(screen.getByRole("button", { name: /22%.*source 1: Quote R4, platform line/ })).toBeTruthy();
    const toggle = screen.getByRole("button", { name: "Sources (1)" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("SplitButton (v0.6)", () => {
  it("is a group named by the action, and disables both halves", async () => {
    const { container } = render(
      <SplitButton disabled menuLabel="More submit options" sections={[{ items: [{ label: "Submit and notify the customer" }] }]}>
        Submit for approval
      </SplitButton>
    );
    expect(screen.getByRole("group", { name: "Submit for approval" })).toBeTruthy();
    expect((screen.getByRole("button", { name: "More submit options" }) as HTMLButtonElement).disabled).toBe(true);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("One system (v0.6)", () => {
  it("ObjectCard: one link covers the card, star and menu stay separate, facts are spoken", async () => {
    const { ObjectCard, ObjectFact, IconChip } = await import("@/components/lark/cards");
    const { ServiceStack } = await import("@/components/lark/identity");
    const onStar = vi.fn();
    const { container } = render(
      <main>
        <ObjectCard
          byline="By Avery Chen"
          description="Pulls usage into a brief."
          facts={<><ObjectFact kind="version" label="Version">v2.0.2</ObjectFact><ObjectFact label="people use it">43</ObjectFact></>}
          href="/agents/brief"
          identity={<ServiceStack services={["Salesforce", "Slack", "Zoom", "Outlook"]} />}
          onStarredChange={onStar}
          title="Renewal brief"
        />
        <ObjectCard identity={<IconChip tone="ai" variant="solid">x</IconChip>} title="Pricing agent" />
      </main>
    );
    expect(screen.getByRole("link", { name: "Renewal brief" }).getAttribute("href")).toBe("/agents/brief");
    expect(screen.getByRole("article", { name: "Renewal brief" })).toBeTruthy();
    // The star names its card: several stars on a page must not share one name (WCAG 2.4.6).
    fireEvent.click(screen.getByRole("button", { name: "Star Renewal brief" }));
    expect(onStar).toHaveBeenCalledWith(true);
    expect(screen.getByText("Uses Salesforce, Slack, Zoom, Outlook")).toBeTruthy();
    expect(screen.getByText("+1")).toBeTruthy();
    expect(container.textContent).toContain("Version v2.0.2");
    expect(container.querySelector('[data-slot="icon-chip"]')?.className).toContain("rounded-md");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("SectionCard and Tray put their link in the footer; PageHeader has a back link", async () => {
    const { PageHeader } = await import("@/components/lark/page-header");
    const { container } = render(
      <main>
        <PageHeader back={{ label: "Back to deals", href: "/deals" }} title="Northwind Traders" />
        <SectionCard link={{ label: "View all deals", href: "/deals" }} title="Pipeline">
          <p>Body</p>
        </SectionCard>
        <Tray link={{ label: "Open ACE", href: "/ace" }} title="ACE is preparing">
          <TrayCard>One</TrayCard>
        </Tray>
      </main>
    );
    expect(screen.getByRole("link", { name: "Back to deals" })).toBeTruthy();
    const view = screen.getByRole("link", { name: "View all deals" });
    expect(view.closest("footer")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open ACE" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
});
