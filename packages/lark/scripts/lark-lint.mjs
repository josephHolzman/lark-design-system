#!/usr/bin/env node
/*
  lark-lint (Lark 0.7): the type-ladder check. Run it on any app built on Lark:

    npx lark-lint src            # or: node packages/lark/scripts/lark-lint.mjs <dir…>

  Rules
  1. raw-12px   A raw 12px class (text-xs, text-body-sm, text-label-md, text-subtext,
                text-[11px], text-[12px], text-[0.75rem]). 12px is metadata only, and
                metadata says so: use text-meta or text-meta-strong.
  2. meta-sentence  text-meta on something that reads as a sentence:
                · a <p>, <li>, <label>, <legend> or <blockquote> without a data-meta
                  attribute naming the kind of metadata (caption, footnote, source,
                  timestamp, eyebrow, byline, divider, details, meta);
                · or whose content is a description, help, detail, note, reason, why,
                  message or summary.
  A line can opt out with a trailing comment containing `lark-lint-allow: <reason>`.
  Exit code 1 when anything is found.
*/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const RAW = /(?<![\w-])text-(xs|body-sm|label-md|subtext|\[(?:11|12)px\]|\[0\.75rem\])(?![\w-])/g;
const META = /(?<![\w-])text-meta(?:-strong)?(?![\w-])/g;
const SENTENCE_TAGS = new Set(["p", "li", "label", "legend", "blockquote"]);
const SENTENCE_CONTENT = /^\s*\{\s*(?:[\w.?]+\.)?(description|help|detail|details|note|reason|why|message|msg|summary|prompt)\s*\}/i;
const EXT = new Set([".tsx", ".jsx", ".ts", ".js", ".mdx"]);
const SKIP = new Set(["node_modules", ".next", "dist", ".git", "ui", "ai-elements"]);

function walk(p, out) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) if (!SKIP.has(name)) walk(join(p, name), out);
  } else if (EXT.has(extname(p))) out.push(p);
  return out;
}

/** The JSX opening tag that contains `index`, or null. */
function enclosingTag(text, index) {
  const lt = text.lastIndexOf("<", index);
  if (lt < 0) return null;
  const m = /^<([A-Za-z][\w.]*)/.exec(text.slice(lt));
  if (!m) return null;
  // the tag must not have closed before index
  const between = text.slice(lt, index);
  if (/[^=]>\s*[^\s"'`{]/.test(between.replace(/=>/g, ""))) return null;
  let depth = 0;
  let end = -1;
  for (let i = lt; i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0 && text[i - 1] !== "=") {
      end = i;
      break;
    }
  }
  return { name: m[1], open: text.slice(lt, end + 1), after: end > 0 ? text.slice(end + 1, end + 160) : "" };
}

const targets = process.argv.slice(2);
if (!targets.length) targets.push("src");
const problems = [];
for (const t of targets) {
  for (const file of walk(t, [])) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    const lineOf = (i) => text.slice(0, i).split(/\n/).length;
    const allowed = (ln) => /lark-lint-allow:/.test(lines[ln - 1] ?? "");
    for (const m of text.matchAll(RAW)) {
      const ln = lineOf(m.index);
      if (!allowed(ln)) problems.push([file, ln, "raw-12px", `${m[0]}: 12px is metadata only; use text-meta (or text-body-md for a sentence)`]);
    }
    for (const m of text.matchAll(META)) {
      const ln = lineOf(m.index);
      if (allowed(ln)) continue;
      const tag = enclosingTag(text, m.index);
      if (!tag) continue;
      if (/\sdata-meta=/.test(tag.open)) continue; // declared metadata
      if (SENTENCE_TAGS.has(tag.name)) {
        problems.push([file, ln, "meta-sentence", `<${tag.name}> at 12px: add data-meta="caption|footnote|source|…" if it is metadata, otherwise use text-body-md`]);
      } else if (SENTENCE_CONTENT.test(tag.after)) {
        problems.push([file, ln, "meta-sentence", `${SENTENCE_CONTENT.exec(tag.after)[1]} at 12px: sentences are 14px (text-body-md)`]);
      }
    }
  }
}

for (const [file, ln, rule, msg] of problems) console.log(`${relative(process.cwd(), file)}:${ln}  ${rule}  ${msg}`);
if (problems.length) {
  console.log(`\nlark-lint: ${problems.length} problem${problems.length === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log("lark-lint: ok");
