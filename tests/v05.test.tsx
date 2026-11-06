import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroBand, IllustratedChoiceCard } from "@/components/lark/bands";
import { StepList } from "@/components/lark/steps";
import { offsetDuration, Transcript, TranscriptLine } from "@/components/lark/transcript";
import { Button } from "@/components/ui/button";

import { axeViolations } from "./axe";

const art = (
  <svg height="10" width="10">
    <rect height="10" width="10" />
  </svg>
);

describe("HeroBand (G5)", () => {
  it("is a labelled region with an h1 by default, an h2 via as, and decorative media", async () => {
    const { container, rerender } = render(
      <main>
        <HeroBand actions={<Button>Start a quote</Button>} description="Draft and price with ACE." eyebrow="Seller" media={art} title="Quote with ACE" tone="sky" />
      </main>
    );
    expect(screen.getByRole("heading", { level: 1, name: "Quote with ACE" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Quote with ACE" }).getAttribute("data-tone")).toBe("sky");
    expect(container.querySelector('[data-slot="hero-band-media"]')?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img")).toBeNull();
    expect(await axeViolations(container)).toEqual([]);

    rerender(
      <main>
        <h1>Home</h1>
        <HeroBand as="h2" media={art} mediaAlt="A quote with three lines" title="Review quotes" tone="sand" />
      </main>
    );
    expect(screen.getByRole("heading", { level: 2, name: "Review quotes" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "A quote with three lines" })).toBeTruthy();
    expect(screen.getByRole("region").className).toContain("bg-tint-sand");
    expect(screen.getByRole("region").className).not.toMatch(/sticky/);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("IllustratedChoiceCard (G6)", () => {
  it("is one link named by the title, described by the description, with aria-current when current", async () => {
    const { container } = render(
      <main>
        <ul>
          <li>
            <IllustratedChoiceCard current description="Draft and price quotes." href="/seller" media={art} title="Seller" tone="sky" />
          </li>
          <li>
            <IllustratedChoiceCard cta="Open" description="Review approvals." href="/desk" media={art} title="Deal desk" tone="sand" />
          </li>
        </ul>
      </main>
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    const seller = screen.getByRole("link", { name: "Seller" });
    expect(seller.getAttribute("href")).toBe("/seller");
    expect(seller.getAttribute("aria-current")).toBe("true");
    expect(seller.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.getElementById(seller.getAttribute("aria-describedby")!)?.textContent).toBe("Draft and price quotes.");
    expect(seller.textContent).toContain("Explore this role");
    const desk = screen.getByRole("link", { name: "Deal desk" });
    expect(desk.hasAttribute("aria-current")).toBe(false);
    expect(desk.textContent).toContain("Open");
    expect(desk.className).toContain("hover:border-outline-strong");
    expect(desk.className).not.toMatch(/shadow/);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("StepList (G9)", () => {
  const steps = [
    { id: "a", title: "Install", state: "done" as const },
    { id: "b", title: "Select the deal", state: "current" as const, action: <Button size="sm">Choose</Button> },
    { id: "c", title: "Check", description: "Needs a deal first.", state: "blocked" as const },
    { id: "d", title: "Share", state: "skipped" as const },
    { id: "e", title: "Send", state: "todo" as const },
  ];

  it("is an ordered list with state in words and aria-current=step only on the current step", async () => {
    const { container } = render(
      <main>
        <StepList aria-label="Setup" steps={steps} />
      </main>
    );
    const list = screen.getByRole("list", { name: "Setup" });
    expect(list.tagName).toBe("OL");
    const items = screen.getAllByRole("listitem");
    // Markers are aria-hidden: the number only shows on steps without a glyph.
    expect(items.map((li) => li.textContent)).toEqual([
      "Install, Done",
      "2Select the deal, Current stepChoose",
      "Check, BlockedNeeds a deal first.",
      "Share, Skipped",
      "5Send, Not started",
    ]);
    expect(items.map((li) => li.getAttribute("aria-current"))).toEqual([null, "step", null, null, null]);
    // Done shows a check, not a number, and isn't styled as current.
    const marker = (li: HTMLElement) => li.querySelector('[data-slot="step-marker"]')!;
    expect(marker(items[0]).querySelector("svg")).toBeTruthy();
    expect(marker(items[0]).getAttribute("aria-hidden")).toBe("true");
    expect(marker(items[0]).className).not.toContain("bg-inverse-surface");
    expect(marker(items[1]).className).toContain("bg-inverse-surface");
    expect(screen.getByRole("button", { name: "Choose" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("horizontal and un-numbered", async () => {
    const { container } = render(<StepList aria-label="Try" numbered={false} orientation="horizontal" steps={steps.slice(4)} />);
    expect(screen.getByRole("list").getAttribute("data-orientation")).toBe("horizontal");
    expect(container.querySelector('[data-slot="step-marker"]')!.textContent).toBe("");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Transcript (G11)", () => {
  it("is a labelled ordered list of lines with <time> and flag badges", async () => {
    const long = "word ".repeat(80).trim();
    const { container } = render(
      <main>
        <Transcript label="Northwind call">
          <TranscriptLine speaker="Dana" time="03:40" flag="Question">
            Can seats start in January?
          </TranscriptLine>
          <TranscriptLine dateTime="2026-11-03T10:42" speaker="Avery" time="10:42 AM">
            {long}
          </TranscriptLine>
        </Transcript>
      </main>
    );
    const list = screen.getByRole("list", { name: "Northwind call" });
    expect(list.tagName).toBe("OL");
    const lines = screen.getAllByRole("listitem");
    expect(lines).toHaveLength(2);
    const times = container.querySelectorAll("time");
    expect(times[0].getAttribute("dateTime")).toBe("PT3M40S");
    expect(times[0].className).toContain("font-mono");
    expect(times[1].getAttribute("dateTime")).toBe("2026-11-03T10:42");
    expect(screen.getByText("Question").getAttribute("data-slot")).toBe("badge");
    expect(lines[0].getAttribute("data-flag")).toBe("Question");
    expect(screen.getByText(long).className).toContain("break-words");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("offsetDuration reads mm:ss and h:mm:ss only", () => {
    expect(offsetDuration("1:02:05")).toBe("PT1H2M5S");
    expect(offsetDuration("12:31")).toBe("PT12M31S");
    expect(offsetDuration("10:42 AM")).toBeUndefined();
  });
});
