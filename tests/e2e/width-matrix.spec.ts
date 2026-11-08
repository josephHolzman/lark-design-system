import { expect, test } from "@playwright/test";

const WIDTHS = [280, 360, 480, 720, 1080];

test.use({ viewport: { width: 1600, height: 3200 } });

test("width matrix: nothing overflows its frame, tabs and segmented never wrap", async ({ page }) => {
  await page.goto("/examples/width-matrix");
  await page.locator("[data-frame='1080']").waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (const w of WIDTHS) {
    const frame = page.locator(`[data-frame='${w}']`);
    const report = await frame.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const wide: string[] = [];
      for (const n of Array.from(el.querySelectorAll<HTMLElement>("*"))) {
        if (n.closest("[data-slot=overflow-measure]")) continue;
        // Content clipped by an ancestor on purpose (truncate, clamp, overflow menus) is fine.
        let clipped = false;
        for (let a = n.parentElement; a && a !== el; a = a.parentElement) {
          if (getComputedStyle(a).overflowX !== "visible") { clipped = true; break; }
        }
        if (clipped) continue;
        const r = n.getBoundingClientRect();
        if (r.width && r.right > box.right + 1) wide.push(`${n.tagName.toLowerCase()}.${(n.getAttribute("data-slot") ?? n.className.toString()).slice(0, 60)} +${Math.round(r.right - box.right)}px`);
      }
      const rows = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel)).map((x) => Math.round(x.getBoundingClientRect().height));
      // FactGrid columns follow its own width: 1 under 24rem, 2 to 40rem, 3 to 56rem, 4 above.
      const facts = el.querySelector<HTMLElement>("[data-slot=fact-grid]")!;
      const factColumns = getComputedStyle(facts).gridTemplateColumns.split(" ").filter(Boolean).length;
      const factWidth = facts.clientWidth;
      const factExpected = factWidth < 384 ? 1 : factWidth < 640 ? 2 : factWidth < 896 ? 3 : 4;
      // MasterDetail: one pane under 48rem (the open detail), both above it.
      const listPane = el.querySelector<HTMLElement>("[data-slot=master-detail-list]")!;
      const detailPane = el.querySelector<HTMLElement>("[data-slot=master-detail-detail]")!;
      return {
        wide: wide.slice(0, 8),
        tabs: rows("nav ul[role=list]"),
        segmented: rows("[data-slot=segmented] > div:first-child"),
        factColumns,
        factExpected,
        listWidth: Math.round(listPane.getBoundingClientRect().width),
        detailWidth: Math.round(detailPane.getBoundingClientRect().width),
      };
    });
    expect(report.wide, `${w}px: elements wider than the frame`).toEqual([]);
    for (const h of report.tabs) expect(h, `${w}px: tab bar on one line`).toBeLessThanOrEqual(41);
    for (const h of report.segmented) expect(h, `${w}px: segmented on one line`).toBeLessThanOrEqual(34);
    expect(report.factColumns, `${w}px: FactGrid columns at its own width`).toBe(report.factExpected);
    if (w >= 1080) {
      expect(report.listWidth, `${w}px: the list is shown beside the detail`).toBeGreaterThan(0);
      expect(report.detailWidth, `${w}px: the detail is shown beside the list`).toBeGreaterThan(0);
    } else {
      expect(report.listWidth, `${w}px: one pane, so the list is hidden`).toBe(0);
      expect(report.detailWidth, `${w}px: one pane, so the detail is shown`).toBeGreaterThan(0);
    }
    await frame.screenshot({ path: `test-results/width-matrix/${w}.png` });
  }
});

test("width matrix: the record drawer and signals panel open over the page and close", async ({ page }) => {
  await page.goto("/examples/width-matrix");
  // The page is server-rendered first: wait for the client chunks before clicking.
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(750);
  const frame = page.locator("[data-frame='1080']");
  await frame.waitFor();

  const opener = frame.getByRole("button", { name: "Open record" });
  await opener.click();
  const drawer = page.locator("[data-slot=record-drawer]");
  await expect(drawer).toBeVisible();
  // size lg = 44rem.
  expect(Math.round((await drawer.boundingBox())!.width)).toBe(704);
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(opener).toBeFocused();

  const bell = frame.getByRole("button", { name: "Deal signals" });
  await bell.click();
  const panel = page.locator("[data-slot=notifications-panel]");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("2 unread")).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Today" })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Yesterday" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
});

test("width matrix: the record drawer is full screen under 640", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/examples/width-matrix");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(750);
  const frame = page.locator("[data-frame='280']");
  await frame.waitFor();
  await frame.getByRole("button", { name: "Open record" }).click();
  const drawer = page.locator("[data-slot=record-drawer]");
  await expect(drawer).toBeVisible();
  expect(Math.round((await drawer.boundingBox())!.width)).toBe(390);
});
