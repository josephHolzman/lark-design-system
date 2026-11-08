import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { VersionCompare } from "@/components/lark/version-compare";

import { axeViolations } from "./axe";

const ROWS = [
  { after: "$421,000.00", before: "$412,800.00", id: "price", label: "Net price" },
  { after: "PO-88412", before: null, id: "po", label: "Purchase order" },
  { after: "", before: "36 months", id: "term", label: "Renewal term" },
  { after: "Priya Raman", before: "Priya Raman", id: "owner", label: "Owner" },
];

function Compare({ defaultOnlyChanges = false }: { defaultOnlyChanges?: boolean }) {
  return (
    <VersionCompare
      defaultOnlyChanges={defaultOnlyChanges}
      left={{
        author: "Priya Raman",
        time: new Date("2026-11-06T09:30:00Z"),
        version: "Revision 3",
      }}
      right={{
        author: "Dana Ito",
        time: new Date("2026-11-07T11:15:00Z"),
        version: "Revision 4",
      }}
      rows={ROWS}
    />
  );
}

describe("VersionCompare", () => {
  it("names both versions and marks each change with a word and an icon", async () => {
    const { container } = render(<Compare />);
    expect(screen.getByText("Revision 3")).toBeTruthy();
    expect(screen.getByText("Revision 4")).toBeTruthy();
    expect(screen.getByText("Dana Ito")).toBeTruthy();
    expect(container.querySelectorAll("time")[1]?.getAttribute("datetime")).toBe("2026-11-07T11:15:00.000Z");
    expect(container.querySelector("[data-change=changed]")?.textContent).toContain("Changed");
    expect(container.querySelector("[data-change=added]")?.textContent).toContain("Added");
    expect(container.querySelector("[data-change=removed]")?.textContent).toContain("Removed");
    expect(container.querySelector("[data-change] svg")).toBeTruthy();
    // The change word is a status word, so it is body size, not meta.
    expect(screen.getByText("Changed").className).toContain("text-body-md");
    expect(await axeViolations(container)).toEqual([]);
  });

  it("only shows the rows that changed when Only changes is on", async () => {
    const user = userEvent.setup();
    render(<Compare />);
    expect(screen.getByText("Owner")).toBeTruthy();
    await user.click(screen.getByRole("switch", { name: "Only changes" }));
    expect(screen.queryByText("Owner")).toBeNull();
    expect(screen.getByText("Net price")).toBeTruthy();
    expect(screen.getByText("Purchase order")).toBeTruthy();
  });

  it("says so in words when nothing changed", () => {
    render(<VersionCompare defaultOnlyChanges left={{ version: "R1" }} right={{ version: "R2" }} rows={[{ after: "Same", before: "Same", label: "Owner" }]} />);
    expect(screen.getByText("No changes between these versions.")).toBeTruthy();
  });
});
