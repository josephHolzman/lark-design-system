// Consumer smoke test: pack the library, install it into an empty project with only React,
// and server-render a few components. Proves the published package works on its own:
// exports resolve, core entries don't need the optional AI peers, CSS/tokens/fonts ship.
// Run after build:lib:  npm run smoke:lib
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const pkgDir = path.join(root, "packages/lark");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lark-smoke-"));
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"], shell: process.platform === "win32" }).toString().trim();

const tarball = run("npm", ["pack", pkgDir, "--pack-destination", tmp, "--silent"], root).split("\n").pop();
fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "lark-smoke", private: true, type: "module" }));
// Installed under the alias apps use (@deepgrids/lark), exactly as the README says.
run("npm", ["install", "--no-audit", "--no-fund", "--silent", `@deepgrids/lark@file:${path.join(tmp, tarball)}`, "react@19", "react-dom@19"], tmp);

fs.writeFileSync(
  path.join(tmp, "smoke.mjs"),
  `
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as lark from "@deepgrids/lark";
import * as ui from "@deepgrids/lark/ui";
import { cn } from "@deepgrids/lark/utils";
import { modes } from "@deepgrids/lark/tokens";

const require = createRequire(import.meta.url);
const fail = (m) => { console.error("SMOKE FAIL:", m); process.exit(1); };
const html = renderToString(
  h("main", null,
    h(ui.Button, null, "Save"),
    h(lark.Callout, { tone: "caution", title: "Old evidence" }, "From Jun 2"),
    h(lark.ActionReceipt, { state: "verified", title: "Save quote" }),
    h(lark.DataGrid, { caption: "Deals", data: [{ id: "a", n: "Northwind" }], getRowId: (r) => r.id, columns: [{ id: "n", accessorKey: "n", header: "Account" }] })
  )
);
if (!html.includes("Old evidence") || !html.includes("Saved and verified")) fail("render output missing text");
if (cn("px-2", "px-4") !== "px-4") fail("cn merge");
if (!modes.light.roles["on-surface"]) fail("tokens");
for (const f of ["@deepgrids/lark/styles.css", "@deepgrids/lark/tokens.css", "@deepgrids/lark/tokens/light.tokens.json", "@deepgrids/lark/fonts/HankenGrotesk-Variable.woff2"]) {
  if (!fs.existsSync(require.resolve(f))) fail("missing " + f);
}
// The graph entry renders with React only, and the main entry never reaches @xyflow/react.
const graph = await import("@deepgrids/lark/graph");
const graphHtml = renderToString(h(graph.GraphNode, { title: "Northwind", meta: "Account", tone: "sky", selected: true }));
if (!graphHtml.includes("Northwind") || !graphHtml.includes("selected")) fail("GraphNode render");
if (!fs.existsSync(require.resolve("@deepgrids/lark/graph.css"))) fail("missing @deepgrids/lark/graph.css");
const seen = new Set();
const walk = (file) => {
  if (seen.has(file)) return;
  seen.add(file);
  const src = fs.readFileSync(file, "utf8");
  if (/from\\s*["']@xyflow\\/react|import\\(["']@xyflow\\/react/.test(src)) fail("main entry imports @xyflow/react via " + file);
  for (const m of src.matchAll(/(?:from|import)\\s*\\(?["'](\\.\\.?\\/[^"']+)["']/g)) walk(fileURLToPath(new URL(m[1], pathToFileURL(file))));
};
walk(fileURLToPath(import.meta.resolve("@deepgrids/lark")));
let aiLoaded = true;
try { await import("@deepgrids/lark/ai"); } catch { aiLoaded = false; }
console.log(JSON.stringify({ lark: Object.keys(lark).length, ui: Object.keys(ui).length, html: html.length, mainEntryModules: seen.size, graph: Object.keys(graph).length, aiEntryWithoutPeers: aiLoaded ? "loaded" : "needs optional peers (expected)" }));
`
);
console.log(run("node", ["smoke.mjs"], tmp));

// Tailwind v4 consumer: compile the package CSS the way an app would and check the result.
run("npm", ["install", "--no-audit", "--no-fund", "--silent", "tailwindcss@4", "@tailwindcss/cli@4", "tw-animate-css@1"], tmp);
fs.writeFileSync(path.join(tmp, "app.css"), '@import "tailwindcss";\n@import "@deepgrids/lark/styles.css";\n');
fs.writeFileSync(path.join(tmp, "page.html"), '<div class="bg-surface-container text-on-surface text-title-md rounded-lg focus-ring"></div>');
run("npx", ["@tailwindcss/cli", "-i", "app.css", "-o", "out.css"], tmp);
const out = fs.readFileSync(path.join(tmp, "out.css"), "utf8");
for (const needle of ["--on-surface", "@font-face", "Hanken Grotesk", ".bg-surface-container", ".text-title-md", ".focus-ring"]) {
  if (!out.includes(needle)) throw new Error(`Tailwind output is missing ${needle}`);
}
// Lark's own component classes come from @source "./*.js" in the package.
if (!out.includes(".bg-tertiary-container")) throw new Error("Tailwind didn't scan the package's components");
console.log(`tailwind ok: ${(out.length / 1024).toFixed(0)} KB CSS from a consumer build`);
const size = fs.statSync(path.join(tmp, tarball)).size;
console.log(`smoke ok: ${tarball} (${(size / 1024 / 1024).toFixed(1)} MB packed), installed with React only`);
fs.rmSync(tmp, { recursive: true, force: true });
