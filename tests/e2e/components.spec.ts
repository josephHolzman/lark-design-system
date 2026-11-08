import path from "node:path";

import { expect, test } from "@playwright/test";

/*
  The component width matrix (v0.8): every exported component in frames at 280, 360, 480, 720
  and 1080px. Checks, per frame:
  · nothing is wider than the frame (content clipped by an overflow ancestor on purpose is fine);
  · page tabs and segmented controls stay on one line;
  · every pointer target is at least 24x24 (WCAG 2.5.8; inline links and labelled radio/checkbox
    rows are exempt, as the target in those cases is the label);
  · axe with contrast passes in light and dusk.
*/

const WIDTHS = [280, 360, 480, 720, 1080];
const AXE = path.resolve(process.cwd(), "node_modules/axe-core/axe.min.js");

test.use({ viewport: { width: 1600, height: 2400 } });
// The page mounts every component at five widths; run the three scans one at a time.
test.describe.configure({ mode: "serial" });

test("component matrix: frames, one-line controls and 24px targets", async ({ page }) => {
  test.setTimeout(480_000);
  await page.goto("/examples/components");
  await page.locator("[data-group]").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1_500);

  const groupCount = await page.locator("[data-group]").count();
  expect(groupCount).toBeGreaterThan(30);

  const seen: string[] = [];
  for (let i = 0; i < groupCount; i++) {
    const group = page.locator("[data-group]").nth(i);
    const file = await group.getAttribute("data-group");
    for (const width of WIDTHS) {
      const frame = group.locator(`[data-frame='${width}']`);
      await frame.waitFor();
      const report = await frame.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const overflow: string[] = [];
        for (const node of Array.from(el.querySelectorAll<HTMLElement>("*"))) {
          if (node.closest("[data-slot=overflow-measure]")) continue;
          // Content the component deliberately clips (truncate, clamp, its own scroll region) is fine.
          let clipped = false;
          for (let ancestor = node.parentElement; ancestor && ancestor !== el; ancestor = ancestor.parentElement) {
            if (getComputedStyle(ancestor).overflowX !== "visible") {
              clipped = true;
              break;
            }
          }
          if (clipped) continue;
          const rect = node.getBoundingClientRect();
          if (rect.width && rect.right > box.right + 1) {
            const label = node.getAttribute("data-slot") ?? node.className.toString();
            overflow.push(`${node.tagName.toLowerCase()}.${label.slice(0, 50)} +${Math.round(rect.right - box.right)}px`);
          }
        }

        const rows = (selector: string) => Array.from(el.querySelectorAll<HTMLElement>(selector)).map((x) => Math.round(x.getBoundingClientRect().height));

        // Pointer targets. A radio/checkbox inside a label is measured by its label: that is
        // what the pointer can hit. Inline links and anything hidden/measured is exempt.
        const small: string[] = [];
        const targets = el.querySelectorAll<HTMLElement>("button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=radio], [role=checkbox], [role=switch]");
        for (const node of targets) {
          if (node.closest("[data-slot=overflow-measure]")) continue;
          if (node.getAttribute("aria-hidden") === "true") continue;
          const style = getComputedStyle(node);
          if (style.display === "none" || style.visibility === "hidden") continue;
          if (style.display === "inline") continue;
          const measure = (node.matches("input[type=radio], input[type=checkbox], [role=radio], [role=checkbox]") ? (node.closest("label") as HTMLElement | null) : null) ?? node;
          const rect = measure.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          // Lark's `hit-area` utility grows the pointer target to 24x24 with an ::after layer
          // without changing the visual size. That is the target WCAG 2.5.8 measures.
          const after = getComputedStyle(measure, "::after");
          const hitW = parseFloat(after.width);
          const hitH = parseFloat(after.height);
          const expanded = measure.classList.contains("hit-area") && hitW >= 24 && hitH >= 24;
          if (!expanded && (rect.width < 24 || rect.height < 24)) {
            const name = node.getAttribute("aria-label") ?? node.textContent?.trim().slice(0, 40) ?? "";
            small.push(`${node.tagName.toLowerCase()}.${(node.getAttribute("data-slot") ?? node.className.toString()).slice(0, 40)} "${name}" ${Math.round(rect.width)}x${Math.round(rect.height)}`);
          }
        }

        return {
          overflow: overflow.slice(0, 8),
          small: small.slice(0, 8),
          tabs: rows("[data-slot=page-tabs] ul[role=list]"),
          segmented: rows("[data-slot=segmented] > div:first-child"),
        };
      });

      expect(report.overflow, `${file} @ ${width}px: elements wider than the frame`).toEqual([]);
      expect(report.small, `${file} @ ${width}px: targets under 24x24`).toEqual([]);
      for (const height of report.tabs) expect(height, `${file} @ ${width}px: tab bar on one line`).toBeLessThanOrEqual(41);
      for (const height of report.segmented) expect(height, `${file} @ ${width}px: segmented control on one line`).toBeLessThanOrEqual(34);
      seen.push(`${file} @ ${width}`);
    }
  }
  expect(seen.length).toBe(groupCount * WIDTHS.length);
});

for (const theme of ["light", "dusk"] as const) {
  test(`component matrix: axe with contrast · ${theme}`, async ({ page }) => {
    test.setTimeout(480_000);
    await page.setViewportSize({ width: 1280, height: 2000 });
    await page.addInitScript((value) => localStorage.setItem("lark-theme", value), theme);
    await page.goto("/examples/components");
    await page.locator("[data-group]").first().waitFor();
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.addScriptTag({ path: AXE });
    const violations = await page.evaluate(async () => {
      // @ts-expect-error axe is injected above
      const result = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
      return result.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.slice(0, 4).map((n) => n.target.join(" ")).join(" | ")}${v.nodes.length > 4 ? ` (+${v.nodes.length - 4})` : ""}`);
    });
    expect(violations).toEqual([]);
  });
}
