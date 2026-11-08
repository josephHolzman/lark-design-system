import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecordDrawer } from "@/components/lark/record-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { axeViolations } from "./axe";

function DrawerHost() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} type="button">
        Open record
      </button>
      <RecordDrawer
        badges={<Badge variant="info">Awaiting finance</Badge>}
        footer={
          <Button size="lg" variant="secondary">
            Send for approval
          </Button>
        }
        onOpenChange={setOpen}
        open={open}
        subtitle="R4 · $412,800 · closes Dec 18"
        tabs={[
          { label: "Overview", href: "#overview", current: true },
          { label: "Quote lines", href: "#lines", count: 12 },
          { label: "Approvals", href: "#approvals", count: 3 },
        ]}
        title="Northwind renewal"
      >
        <h2>Overview</h2>
      </RecordDrawer>
    </>
  );
}

describe("RecordDrawer", () => {
  it("is a dialog named by its title with tabs, badges and footer actions", async () => {
    const user = userEvent.setup();
    render(<DrawerHost />);
    await user.click(screen.getByRole("button", { name: "Open record" }));
    const dialog = screen.getByRole("dialog", { name: "Northwind renewal" });
    expect(dialog.getAttribute("data-slot")).toBe("record-drawer");
    expect(screen.getByText("R4 · $412,800 · closes Dec 18")).toBeTruthy();
    expect(screen.getByText("Awaiting finance")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Quote lines/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send for approval" })).toBeTruthy();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("closes on Escape and puts focus back on the opener", async () => {
    const user = userEvent.setup();
    render(<DrawerHost />);
    const opener = screen.getByRole("button", { name: "Open record" });
    await user.click(opener);
    await screen.findByRole("dialog", { name: "Northwind renewal" });
    await user.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(opener);
  });

  it("passes axe while open", async () => {
    const user = userEvent.setup();
    render(<DrawerHost />);
    await user.click(screen.getByRole("button", { name: "Open record" }));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
