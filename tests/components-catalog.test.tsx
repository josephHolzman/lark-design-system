import { describe, expect, it } from "vitest";

import * as Lark from "@/components/lark";
import * as Graph from "@/components/lark/graph";
import { COVERED_COMPONENTS, GROUPS } from "@/app/examples/components/catalog";

/** Samples for utilities (not components) the catalog shows so callers can see their output. */
const UTILITY_SAMPLES = new Set(["formatMoney"]);

/*
  The catalog is the proof that every exported component has a width-matrix sample. This test
  compares the index's runtime component exports with the sample names, so a new export cannot
  land without a frame to check it in.
*/
describe("component matrix coverage", () => {
  const runtimeComponents = [...Object.entries(Lark), ...Object.entries(Graph)]
    .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === "function")
    .map(([name]) => name)
    .sort();

  it("renders every exported component", () => {
    const covered = new Set(COVERED_COMPONENTS);
    expect(runtimeComponents.filter((name) => !covered.has(name))).toEqual([]);
  });

  it("does not name samples for nothing", () => {
    const known = new Set([...runtimeComponents, ...UTILITY_SAMPLES]);
    expect(COVERED_COMPONENTS.filter((name) => !known.has(name))).toEqual([]);
  });

  it("groups every sample under a file", () => {
    for (const group of GROUPS) {
      expect(group.file, "a file name").toMatch(/\.(tsx?|css)$/);
      expect(group.samples.length, `${group.file} has samples`).toBeGreaterThan(0);
    }
  });

  it("has unique sample names across files", () => {
    const names = COVERED_COMPONENTS;
    expect(new Set(names).size).toBe(names.length);
  });
});
