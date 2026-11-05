// Exports Lark's tokens as W3C Design Tokens (DTCG 2025.10 format) for Figma variables and other tools.
//   primitives.tokens.json  every colour step (one mode)
//   light.tokens.json       colour roles for light, as aliases of primitives
//   dusk.tokens.json        the same roles for dusk
//   scale.tokens.json       type roles, radius, motion, elevation, font families
// Written to dist/tokens/ (published) and design/tokens/dtcg/ (checked in, what Figma imports).
// Run after tsup has built dist/tokens.js:  npm run build:lib
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const { primitives, modes } = await import(pathToFileURL(path.join(root, "packages/lark/dist/tokens.js")).href);
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");

const color = (hex) => ({ $type: "color", $value: hex.toLowerCase() });

/* ---------------------------------------------------------------- primitives */
const prim = { color: {} };
for (const [name, hex] of Object.entries(primitives)) {
  const [fam] = name.split(/-(?=[^-]+$)/);
  prim.color[fam] ??= {};
  prim.color[fam][name] = color(hex);
}

/* ---------------------------------------------------------------- roles per mode */
const roleFile = (mode) => {
  const out = { color: {} };
  for (const [role, { src, hex }] of Object.entries(modes[mode].roles)) {
    const fam = src.split(/-(?=[^-]+$)/)[0];
    out.color[role] = src.startsWith("#") || !(src in primitives)
      ? { ...color(hex), $description: "Literal value" }
      : { $type: "color", $value: `{color.${fam}.${src}}`, $extensions: { "com.deepgrids.lark": { resolved: hex } } };
  }
  return out;
};

/* ---------------------------------------------------------------- scale */
const grab = (re) => [...css.matchAll(re)];
const rem = (v) => (v.endsWith("rem") ? Math.round(parseFloat(v) * 16 * 100) / 100 : parseFloat(v));
const dim = (px) => ({ $type: "dimension", $value: { value: px, unit: "px" } });

const typography = {};
for (const m of grab(/--text-([a-z]+-[a-z]+|subtext):\s*([\d.]+rem);/g)) {
  const role = m[1];
  const lh = css.match(new RegExp(`--text-${role}--line-height:\\s*([\\d.]+rem)`));
  const fw = css.match(new RegExp(`--text-${role}--font-weight:\\s*(\\d+)`));
  const ls = css.match(new RegExp(`--text-${role}--letter-spacing:\\s*([-\\d.]+)(em|px)`));
  typography[role] = {
    $type: "typography",
    $value: {
      fontFamily: "{font.sans}",
      fontSize: { value: rem(m[2]), unit: "px" },
      lineHeight: lh ? Math.round((rem(lh[1]) / rem(m[2])) * 1000) / 1000 : 1.5,
      fontWeight: fw ? Number(fw[1]) : 400,
      letterSpacing: ls ? { value: Number(ls[1]), unit: ls[2] } : { value: 0, unit: "px" },
    },
  };
}

const radius = {};
for (const m of grab(/--radius-(xs|sm|md|lg|xl):\s*(\d+)px;/g)) radius[m[1]] = dim(Number(m[2]));
radius.full = dim(9999);

const duration = {};
for (const m of grab(/--duration-([a-z]+\d):\s*(\d+)ms;/g)) duration[m[1]] = { $type: "duration", $value: { value: Number(m[2]), unit: "ms" } };

const elevation = {};
const lightBlock = css.match(/:root\s*\{\s*(--elevation-raised[\s\S]*?)\}/);
if (lightBlock)
  for (const m of lightBlock[1].matchAll(/--elevation-([a-z-]+):\s*([^;]+);/g))
    elevation[m[1]] = { $type: "shadow", $value: m[2].trim(), $description: "CSS box-shadow (light). Dusk values are in tokens.css." };

const scale = {
  font: {
    sans: { $type: "fontFamily", $value: ["Hanken Grotesk", "ui-sans-serif", "system-ui", "sans-serif"] },
    mono: { $type: "fontFamily", $value: ["Geist Mono", "ui-monospace", "monospace"] },
    weight: {
      regular: { $type: "fontWeight", $value: 400 },
      medium: { $type: "fontWeight", $value: 450 },
      semibold: { $type: "fontWeight", $value: 550 },
    },
  },
  typography,
  radius,
  size: {
    control: { sm: dim(28), md: dim(32), lg: dim(40) },
    "table-row": { comfortable: dim(55), compact: dim(40) },
    "table-header": dim(40),
    topbar: dim(48),
    sidebar: { expanded: dim(240), rail: dim(48) },
    "hit-target": { min: dim(24), touch: dim(44) },
    "chat-column": dim(720),
  },
  duration,
  elevation,
};

/* ---------------------------------------------------------------- write */
const files = {
  "primitives.tokens.json": prim,
  "light.tokens.json": roleFile("light"),
  "dusk.tokens.json": roleFile("dusk"),
  "scale.tokens.json": scale,
};
for (const dir of [path.join(root, "packages/lark/dist/tokens"), path.join(root, "design/tokens/dtcg")]) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, data] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2) + "\n");
}
console.log(
  `tokens: ${Object.keys(primitives).length} primitives, ${Object.keys(modes.light.roles).length} roles x 2 modes, ${Object.keys(typography).length} type roles`
);
