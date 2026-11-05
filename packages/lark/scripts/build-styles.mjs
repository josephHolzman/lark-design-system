// Builds the package's CSS and fonts from the app's sources:
//   dist/styles.css  tokens, Tailwind theme, utilities, @font-face (Tailwind v4 apps)
//   dist/tokens.css  the CSS variables only (any app, no Tailwind needed)
//   dist/fonts/      Hanken Grotesk and Geist Mono variable fonts, with their OFL licences
// Consumers (Tailwind v4):  @import "tailwindcss";  @import "@deepgrids/lark/styles.css";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "packages/lark/dist");
fs.mkdirSync(path.join(dist, "fonts"), { recursive: true });

let css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");

/* ---------------------------------------------------------------- fonts */
const fonts = [
  ["src/app/fonts/HankenGrotesk-Variable.woff2", "HankenGrotesk-Variable.woff2"],
  ["src/app/fonts/HankenGrotesk-Italic-Variable.woff2", "HankenGrotesk-Italic-Variable.woff2"],
  ["src/app/fonts/OFL-HankenGrotesk.txt", "OFL-HankenGrotesk.txt"],
  ["node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2", "GeistMono-Variable.woff2"],
  ["node_modules/geist/LICENSE.txt", "OFL-GeistMono.txt"],
];
for (const [from, to] of fonts) fs.copyFileSync(path.join(root, from), path.join(dist, "fonts", to));

// Only downloaded when used: an app that already loads the fonts (next/font sets --font-hanken)
// never references these family names, so the browser never fetches them.
const fontFaces = `
/* Fonts shipped with Lark (SIL OFL 1.1). */
@font-face { font-family: "Hanken Grotesk"; src: url("./fonts/HankenGrotesk-Variable.woff2") format("woff2"); font-weight: 100 900; font-style: normal; font-display: swap; }
@font-face { font-family: "Hanken Grotesk"; src: url("./fonts/HankenGrotesk-Italic-Variable.woff2") format("woff2"); font-weight: 100 900; font-style: italic; font-display: swap; }
@font-face { font-family: "Geist Mono"; src: url("./fonts/GeistMono-Variable.woff2") format("woff2"); font-weight: 100 900; font-style: normal; font-display: swap; }
`;

/* ---------------------------------------------------------------- styles.css */
const styles = css
  .replace('@import "tailwindcss";\n', "")
  // Scan Lark's own compiled components and Streamdown's markdown classes from node_modules.
  .replace(
    /@source "\.\.\/\.\.\/node_modules\/streamdown\/dist\/\*\.js";/,
    '@source "./*.js";\n@source "../../../streamdown/dist/*.js";'
  )
  // Fonts: the app's variables when present (next/font), else the shipped families.
  .replace(
    "--font-sans: var(--font-hanken), ui-sans-serif, system-ui, sans-serif;",
    '--font-sans: var(--font-hanken, "Hanken Grotesk"), ui-sans-serif, system-ui, sans-serif;'
  )
  .replace(
    "--font-mono: var(--font-geist-mono), ui-monospace, monospace;",
    '--font-mono: var(--font-geist-mono, "Geist Mono"), ui-monospace, monospace;'
  );

if (!styles.includes('@source "./*.js";')) throw new Error("build-styles: the streamdown @source line moved; update the replace above.");
if (!styles.includes('"Hanken Grotesk"')) throw new Error("build-styles: the --font-sans line moved; update the replace above.");

const header = `/* @deepgrids/lark styles, generated from src/app/globals.css by packages/lark/scripts/build-styles.mjs.\n   Usage (Tailwind v4):  @import "tailwindcss";  @import "@deepgrids/lark/styles.css"; */\n`;
// @import rules must stay first, so the @font-face block goes after them.
const withFonts = styles.replace('@import "tw-animate-css";\n', `@import "tw-animate-css";\n${fontFaces}`);
if (withFonts === styles) throw new Error("build-styles: @import \"tw-animate-css\" not found; place the @font-face block by hand.");
fs.writeFileSync(path.join(dist, "styles.css"), header + withFonts);

/* ---------------------------------------------------------------- tokens.css */
const block = css.match(/\/\* @lark-tokens:start[\s\S]*?\/\* @lark-tokens:end \*\//);
if (!block) throw new Error("build-styles: no @lark-tokens block in globals.css");
const elevation = css.match(/:root\s*\{\s*--elevation-raised[\s\S]*?\}\s*\.dark\s*\{\s*--elevation-raised[\s\S]*?\}/);
fs.writeFileSync(
  path.join(dist, "tokens.css"),
  `/* @deepgrids/lark tokens: CSS variables only, for apps without Tailwind.\n   Light on :root, dusk on .dark. Generated; do not edit. */\n${block[0]}\n${elevation ? elevation[0] : ""}\n`
);

console.log(`styles.css ${styles.length} bytes, tokens.css, ${fonts.length} font files`);
