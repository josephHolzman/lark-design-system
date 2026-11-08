import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NotificationsPanel, type NotificationItem } from "@/components/lark/notifications";

import { axeViolations } from "./axe";

const NOW = new Date("2026-11-07T15:00:00");

const SIGNALS: NotificationItem[] = [
  { id: "1", at: "2026-11-07T14:40:00", detail: "Dana Ito approved the 22% discount.", kind: "approval", title: "Finance approved R4", unread: true },
  { id: "2", at: "2026-11-07T09:12:00", detail: "Can you check the margin on line 4?", kind: "mention", mentionsMe: true, title: "Priya mentioned you", unread: true },
  { id: "3", at: "2026-11-06T16:20:00", kind: "quote", title: "Quote R3 sent" },
  { id: "4", at: "2026-11-05T11:00:00", kind: "task", title: "Approval brief ready" },
];

describe("NotificationsPanel", () => {
  it("groups signals by day with counts, unread words and times", () => {
    render(<NotificationsPanel items={SIGNALS} now={NOW} onOpenChange={() => {}} open />);
    expect(screen.getByRole("dialog", { name: "Deal signals" })).toBeTruthy();
    expect(screen.getByText("2 unread")).toBeTruthy();
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
    expect(headings[0].textContent).toBe("Today");
    expect(headings[1].textContent).toBe("Yesterday");
    expect(screen.getAllByText("Unread", { selector: ".sr-only" })).toHaveLength(2);
    expect(screen.getByText("Finance approved R4")).toBeTruthy();
    expect(screen.getByText("Dana Ito approved the 22% discount.")).toBeTruthy();
    expect(document.querySelectorAll("time")).toHaveLength(4);
    expect(screen.getByRole("radio", { name: /^All/ })).toBeTruthy();
  });

  it("filters to unread and mentions", async () => {
    const user = userEvent.setup();
    render(<NotificationsPanel items={SIGNALS} now={NOW} onOpenChange={() => {}} open />);
    await user.click(screen.getByRole("radio", { name: /Unread/ }));
    expect(screen.queryByText("Quote R3 sent")).toBeNull();
    expect(screen.getByText("Finance approved R4")).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: /Mentions/ }));
    expect(screen.getByText("Priya mentioned you")).toBeTruthy();
    expect(screen.queryByText("Finance approved R4")).toBeNull();
  });

  it("marks everything read and disables the action when nothing is unread", async () => {
    const user = userEvent.setup();
    const onMarkAllRead = vi.fn();
    const { rerender } = render(<NotificationsPanel items={SIGNALS} now={NOW} onMarkAllRead={onMarkAllRead} onOpenChange={() => {}} open />);
    await user.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(onMarkAllRead).toHaveBeenCalled();
    rerender(<NotificationsPanel items={SIGNALS.map((s) => ({ ...s, unread: false }))} now={NOW} onMarkAllRead={onMarkAllRead} onOpenChange={() => {}} open />);
    expect(screen.getByRole("button", { name: "Mark all as read" })).toHaveProperty("disabled", true);
  });

  it("keeps an illustration in the empty state", async () => {
    render(<NotificationsPanel illustration={{ size: 96, src: "/illustrations/empty-approved.svg" }} items={[]} now={NOW} onOpenChange={() => {}} open />);
    expect(screen.getByText("No signals yet")).toBeTruthy();
    expect(document.querySelector("[data-slot=illustration]")).toBeTruthy();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("passes axe with signals", async () => {
    render(<NotificationsPanel items={SIGNALS} now={NOW} onOpenChange={() => {}} open />);
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
