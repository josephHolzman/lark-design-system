import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionCard } from "@/components/lark/cards";
import { splitOverflow } from "@/components/lark/overflow";
import { cn } from "@/lib/utils";
import { axeViolations } from "./axe";

/* ---------------------------------------------------------------- surfaces */

const css = readFileSync(path.resolve(__dirname, "../src/app/globals.css"), "utf8");

function declarations(selector: ":root" | ".dark") {
  const out: Record<string, string> = {};
  const re = selector === ":root" ? /(?:^|\n):root(?::not\(\.dark\))?\s*\{([^}]*)\}/g : /(?:^|\n)\.dark\s*\{([^}]*)\}/g;
  for (const m of css.matchAll(re)) for (const d of m[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[d[1]] = d[2].trim();
  return out;
}
const light = declarations(":root");
// The light-only block must not leak into dusk.
const dusk = { ...light, ...declarations(".dark") };
for (const m of css.matchAll(/(?:^|\n):root:not\(\.dark\)\s*\{([^}]*)\}/g)) for (const d of m[1].matchAll(/(--[\w-]+):/g)) if (!(d[1] in declarations(".dark"))) throw new Error(`${d[1]} is light-only but has no dusk value`);

function resolve(vars: Record<string, string>, v: string, depth = 0): string {
  const m = /^var\((--[\w-]+)\)$/.exec(v);
  if (!m) return v;
  if (depth > 8 || !(m[1] in vars)) throw new Error(`unresolved ${v}`);
  return resolve(vars, vars[m[1]], depth + 1);
}
const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rgb = (h: string) => [1, 3, 5].map((i) => lin(parseInt(h.slice(i, i + 2), 16)));
const lum = (h: string) => {
  const [r, g, b] = rgb(h);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const oklchL = (h: string) => {
  const [r, g, b] = rgb(h);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720662 * s;
};
const hex = (vars: Record<string, string>, name: string) => {
  const v = resolve(vars, `var(${name})`).toLowerCase();
  return v === "#fff" ? "#ffffff" : v;
};

describe("v0.7 surfaces", () => {
  for (const [theme, vars] of [
    ["light", light],
    ["dusk", dusk],
  ] as const) {
    it(`${theme}: canvas, module and inset are three visibly different steps`, () => {
      const [canvas, module, inset] = ["--canvas", "--module", "--inset"].map((n) => oklchL(hex(vars, n)));
      // Cohere-style gentle steps: the module also carries an edge, so its step from the canvas is
      // the smallest; the inset must still read as its own plane against both.
      expect(Math.abs(module - canvas)).toBeGreaterThanOrEqual(0.01);
      expect(Math.abs(inset - module)).toBeGreaterThanOrEqual(0.02);
      expect(Math.abs(inset - canvas)).toBeGreaterThanOrEqual(0.02);
    });
    it(`${theme}: text roles keep 4.5:1 on every surface step`, () => {
      for (const bg of ["--canvas", "--module", "--inset"])
        for (const fg of ["--on-surface", "--on-surface-variant", "--on-surface-tertiary"]) {
          const r = contrast(hex(vars, fg), hex(vars, bg));
          expect(r, `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
    });
  }
});

/* ---------------------------------------------------------------- lark-lint */

const LINT = path.resolve(__dirname, "../packages/lark/scripts/lark-lint.mjs");
const lint = (dir: string) => {
  try {
    return { code: 0, out: execFileSync("node", [LINT, dir], { encoding: "utf8" }) };
  } catch (e) {
    const err = e as { status: number; stdout: string };
    return { code: err.status, out: err.stdout };
  }
};

describe("lark-lint", () => {
  it("passes Lark's components and examples", () => {
    expect(lint(path.resolve(__dirname, "../src/components/lark")).code).toBe(0);
    expect(lint(path.resolve(__dirname, "../src/app/examples")).code).toBe(0);
  });
  it("flags raw 12px classes and 12px sentences, and accepts declared metadata", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "lark-lint-"));
    writeFileSync(
      path.join(dir, "a.tsx"),
      [
        `export const A = () => <span className="text-xs">3</span>;`,
        `export const B = ({ description }: { description: string }) => <span className="text-meta">{description}</span>;`,
        `export const C = () => <p className="text-meta">Sentences are fourteen.</p>;`,
        `export const D = () => <p className="text-meta" data-meta="footnote">Example data.</p>;`,
        `export const E = () => <time className="text-meta">9:12 AM</time>;`,
      ].join("\n")
    );
    const r = lint(dir);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/a\.tsx:1\s+raw-12px/);
    expect(r.out).toMatch(/a\.tsx:2\s+meta-sentence/);
    expect(r.out).toMatch(/a\.tsx:3\s+meta-sentence/);
    expect(r.out).not.toMatch(/a\.tsx:4/);
    expect(r.out).not.toMatch(/a\.tsx:5/);
  });
});

/* ---------------------------------------------------------------- SectionCard v0.7 */

describe("SectionCard v0.7", () => {
  it("status modules show their status icon tile and say the status in words", async () => {
    const { container } = render(
      <SectionCard title="Blocked: legal review missing" tone="error" variant="status">
        <p>Body</p>
      </SectionCard>
    );
    const section = container.querySelector("[data-slot=section-card]")!;
    expect(section.getAttribute("data-tone")).toBe("error");
    expect(section.querySelector("[data-slot=module-icon] svg")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Blocked: legal review missing" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });
  it("feature modules default to iris and use the module title step", () => {
    const { container } = render(<SectionCard title="ACE suggests a 3-year term" variant="feature" />);
    const section = container.querySelector("[data-slot=section-card]")!;
    expect(section.getAttribute("data-tone")).toBe("iris");
    expect(section.className).toContain("lark-module");
    expect(screen.getByRole("heading").className).toContain("text-title-module");
  });
});

/* ---------------------------------------------------------------- overflow */

describe("splitOverflow", () => {
  const items = ["a", "b", "c", "d", "e"];
  it("keeps everything when it fits", () => expect(splitOverflow(items, 5)).toEqual({ shown: items, hidden: [] }));
  it("keeps the pinned (current) item visible", () => {
    expect(splitOverflow(items, 3, 4)).toEqual({ shown: ["a", "b", "e"], hidden: ["c", "d"] });
    expect(splitOverflow(items, 2, 1)).toEqual({ shown: ["a", "b"], hidden: ["c", "d", "e"] });
  });
});

/* ---------------------------------------------------------------- cn */

describe("cn knows the v0.7 type roles", () => {
  it("keeps a type role next to a text colour", () => {
    for (const role of ["text-meta", "text-meta-strong", "text-title-module", "text-display-sm"])
      expect(cn(role, "text-on-surface-variant").split(" ")).toContain(role);
  });
  it("lets a later type role replace an earlier one", () => expect(cn("text-meta", "text-body-md")).toBe("text-body-md"));
});
