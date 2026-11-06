import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroBand, IllustratedChoiceCard } from "@/components/lark/bands";
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
