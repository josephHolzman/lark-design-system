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
      return { wide: wide.slice(0, 8), tabs: rows("nav ul[role=list]"), segmented: rows("[data-slot=segmented] > div:first-child") };
    });
    expect(report.wide, `${w}px: elements wider than the frame`).toEqual([]);
    for (const h of report.tabs) expect(h, `${w}px: tab bar on one line`).toBeLessThanOrEqual(41);
    for (const h of report.segmented) expect(h, `${w}px: segmented on one line`).toBeLessThanOrEqual(34);
    await frame.screenshot({ path: `test-results/width-matrix/${w}.png` });
  }
});
