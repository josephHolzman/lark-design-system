import path from "node:path";

import { expect, test } from "@playwright/test";

/* axe with colour contrast (jsdom can't check contrast) on every example page: light, dusk, 390. */

const AXE = path.resolve(process.cwd(), "node_modules/axe-core/axe.min.js");

const PAGES = ["foundations", "width-matrix", "components", "patterns", "dashboard", "deals", "quote", "record", "settings", "chat", "chat-states", "widgets", "chat-panel", "approvals", "deal-activity", "slots", "records", "work"];
const MODES = [
  { name: "light", theme: "light", width: 1280 },
  { name: "dusk", theme: "dusk", width: 1280 },
  { name: "390", theme: "light", width: 390 },
] as const;

for (const mode of MODES) {
  for (const p of PAGES) {
    test(`axe ${p} · ${mode.name}`, async ({ page }) => {
      await page.setViewportSize({ width: mode.width, height: 900 });
      await page.addInitScript((t) => localStorage.setItem("lark-theme", t), mode.theme);
      await page.goto(`/examples/${p}`);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ path: AXE });
      const violations = await page.evaluate(async () => {
        // @ts-expect-error axe is injected above
        const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
        return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}${v.nodes.length > 3 ? ` (+${v.nodes.length - 3})` : ""}`);
      });
      expect(violations).toEqual([]);
    });
  }
}

/* Every state of the two pattern pages, light, page width and the 420px panel. */
const STATES = ["loading", "empty", "error", "partial", "long", "conflict", "permission", "many"];
for (const p of ["approvals", "deal-activity"]) {
  for (const width of ["full", "panel"]) {
    test(`axe ${p} · every state · ${width}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      for (const s of STATES) {
        await page.goto(`/examples/${p}?state=${s}&width=${width}`);
        await page.waitForLoadState("networkidle");
        await page.locator(`[data-example-state='${s}']`).waitFor();
        await page.addScriptTag({ path: AXE });
        const violations = await page.evaluate(async () => {
          // @ts-expect-error axe is injected above
          const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
          return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
        });
        expect(violations, `${p} ${s} ${width}`).toEqual([]);
        // Nothing wider than the example frame.
        const over = await page.locator("[data-example-state]").evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(over, `${p} ${s} ${width}: horizontal overflow`).toBeLessThanOrEqual(1);
      }
    });
  }
}
