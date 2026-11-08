/**
 * K8h screenshot harness.
 *
 * Captures every route under /examples full-page at 390, 768 and 1440 (light) and 1440 (dark)
 * into .snapshots/k8h/, then fails loudly when a capture's pixel width is not the viewport width
 * (horizontal overflow) or when two captures of the same route are byte-identical (nothing was
 * actually rendered at the other width or theme).
 *
 * The dev server matches playwright.config.ts (`next dev` on port 3107). If one is already
 * running it is reused; otherwise this script starts it and stops it again.
 *
 * Usage: npm run lark:shots
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, ".snapshots", "k8h");
const base = process.env.LARK_SHOTS_BASE ?? "http://localhost:3107";
const port = Number(new URL(base).port || 3107);
const examplesDir = join(root, "src", "app", "examples");

const VIEWPORTS = [
  { width: 390, axis: "phone", dark: false },
  { width: 768, axis: "tablet", dark: false },
  { width: 1440, axis: "desktop", dark: false },
  { width: 1440, axis: "desktop", dark: true },
];

function routes() {
  const found = readdirSync(examplesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .filter((entry) => existsSync(join(examplesDir, entry.name, "page.tsx")))
    .map((entry) => entry.name)
    .sort();
  if (existsSync(join(examplesDir, "page.tsx"))) found.unshift("");
  return found.map((name) => ({ name: name || "index", path: name ? `/examples/${name}` : "/examples" }));
}

async function reachable(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await reachable(url)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function pngWidth(file) {
  const buf = readFileSync(file);
  if (buf.length < 24 || buf.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error(`${file} is not a PNG`);
  }
  return buf.readUInt32BE(16);
}

function sha(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

const serverUrl = `${base}/examples/foundations`;
let server = null;
if (!(await reachable(serverUrl))) {
  console.log(`[shots] starting next dev on ${port} (playwright.config.ts's server)`);
  server = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev", "-p", String(port)], {
    cwd: root,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (d) => process.stdout.write(`[next] ${d}`));
  server.stderr.on("data", (d) => process.stderr.write(`[next] ${d}`));
  if (!(await waitForServer(serverUrl, 180_000))) {
    server.kill();
    throw new Error(`next dev did not become ready at ${serverUrl}`);
  }
} else {
  console.log(`[shots] reusing the dev server at ${base}`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const failures = [];
const manifest = [];
const all = routes();
console.log(`[shots] ${all.length} routes × ${VIEWPORTS.length} captures`);

try {
  for (const route of all) {
    const files = [];
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.width === 390 ? 844 : vp.width === 768 ? 1024 : 1000 },
        colorScheme: vp.dark ? "dark" : "light",
      });
      if (vp.dark) {
        await context.addInitScript(() => localStorage.setItem("lark-theme", "dark"));
      } else {
        await context.addInitScript(() => localStorage.setItem("lark-theme", "light"));
      }
      const page = await context.newPage();
      const file = join(outDir, `${route.name}-${vp.width}${vp.dark ? "-dark" : ""}.png`);
      try {
        await page.goto(base + route.path, { waitUntil: "networkidle", timeout: 120_000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);
        await page.screenshot({ path: file, fullPage: true });
      } finally {
        await context.close();
      }

      const width = pngWidth(file);
      const hash = sha(file);
      files.push({ ...vp, file, width, hash });
      manifest.push({ route: route.name, path: route.path, ...vp, file: file.slice(root.length + 1), width, hash });

      if (width !== vp.width) {
        failures.push(
          `${route.name} at ${vp.width}${vp.dark ? " dark" : ""}: screenshot is ${width}px wide, expected ${vp.width}px (the page overflows its viewport)`
        );
      }
      const twin = files.find((f) => f !== files[files.length - 1] && f.hash === hash);
      if (twin) {
        const a = `${route.name} at ${twin.width}${twin.dark ? " dark" : ""}`;
        const b = `${route.name} at ${vp.width}${vp.dark ? " dark" : ""}`;
        failures.push(`${a} and ${b} are byte-identical — nothing was rendered differently`);
      }
    }
    console.log(`[shots] ${route.name}: ${files.map((f) => `${f.width}${f.dark ? "d" : ""}`).join(" ")}`);
  }
} finally {
  await browser.close();
  if (server) server.kill();
}

console.log(`[shots] wrote ${manifest.length} PNGs to ${outDir}`);
if (failures.length) {
  console.error("\n[shots] FAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("[shots] all captures match their viewports and differ from each other");
