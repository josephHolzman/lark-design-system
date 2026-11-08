import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { List, ListItem } from "@/components/lark/lists";
import { MasterDetail } from "@/components/lark/master-detail";

import { axeViolations } from "./axe";

function MasterHost({ initial }: { initial?: string }) {
  const [selected, setSelected] = useState<string | undefined>(initial);
  return (
    <MasterDetail
      detail={
        <div className="p-4">
          <h2>Northwind renewal · R4</h2>
          <p>The quote, its approvers and its lines.</p>
        </div>
      }
      list={
        <List>
          <ListItem headline="Northwind renewal · R4" onClick={() => setSelected("r4")} selected={selected === "r4"} supporting="$412,800" />
          <ListItem headline="Halvorsen expansion" onClick={() => setSelected("h2")} selected={selected === "h2"} supporting="$188,400" />
        </List>
      }
      listLabel="Quotes"
      onBack={() => setSelected(undefined)}
      selected={selected}
    />
  );
}

describe("MasterDetail", () => {
  it("opens the detail with a back button and moves focus to its heading", async () => {
    const user = userEvent.setup();
    render(<MasterHost />);
    await user.click(screen.getByRole("button", { name: /Northwind renewal · R4/ }));
    expect(screen.getByRole("button", { name: "Back to Quotes" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Northwind renewal · R4" }));
  });

  it("keeps focus where it is when a deep link opens a record", () => {
    render(<MasterHost initial="r4" />);
    expect(document.activeElement).toBe(document.body);
  });

  it("returns focus to the selected row on back", async () => {
    const user = userEvent.setup();
    render(<MasterHost initial="r4" />);
    await user.click(screen.getByRole("button", { name: "Back to Quotes" }));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Northwind renewal · R4/ }));
    expect(screen.queryByRole("button", { name: "Back to Quotes" })).toBeNull();
  });

  it("shows only the list when nothing is selected, and helps screen readers name both panes", () => {
    const { container } = render(<MasterHost />);
    expect(container.querySelector("[data-slot=master-detail-detail]")?.className).toContain("hidden");
    expect(screen.getByRole("region", { name: "Quotes" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Details" })).toBeTruthy();
  });

  it("passes axe", async () => {
    const { container } = render(<MasterHost initial="r4" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
