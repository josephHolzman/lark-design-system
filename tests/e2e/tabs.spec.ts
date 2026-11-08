import { expect, test } from "@playwright/test";

/* Tabs never scroll or wrap: when the triggers don't fit, the ones that don't move into More
   and the current trigger stays visible. Measured in a browser because the fold depends on
   the component's own width. */

test("tabs fold into More inside a narrow card", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/examples/slots");
  const frame = page.locator("[data-slot=tabs-list-frame]").first();
  await frame.waitFor();
  const list = frame.locator("[data-slot=tabs-list]");
  await expect(frame.getByRole("button", { name: /More/ })).toBeVisible();
  await expect(frame.getByRole("tab", { name: "Overview" })).toBeVisible();
  // A tablist may hold only tabs: the More trigger is its sibling, not its child.
  await expect(list.getByRole("button", { name: /More/ })).toHaveCount(0);
  const [frameBox, listBox] = await Promise.all([frame.boundingBox(), list.boundingBox()]);
  expect(listBox!.width).toBeLessThanOrEqual(frameBox!.width + 1);
});
