"use client";

import { useMemo, useState, type ReactNode } from "react";

import { PageHeader } from "@/components/lark/page-header";
import { FilterSearch } from "@/components/lark/filters";

import { AI_GROUPS } from "./ai-groups";
import { CORE_GROUPS } from "./core-groups";
import { CPQ_GROUPS } from "./cpq-groups";
import { SHELL_GROUPS } from "./shell-groups";

/*
  The component width matrix (v0.8): every exported product component, grouped by the file it
  lives in, with realistic and deliberately long fake content. Each group is rendered in frames
  at 280, 360, 480, 720 and 1080px, the five widths the narrow-behaviour rule is checked at.
  Search narrows the catalog by component name, file or note.

  tests/e2e/components.spec.ts checks that nothing is wider than its frame, that tabs and
  segmented controls stay on one line, that every target is at least 24x24, and axe with
  contrast in light and dusk.
*/

export type Sample = { name: string; note?: string; node: ReactNode };
export type Group = {
  file: string;
  title: string;
  note?: string;
  /** Answer widgets carry their own negative margins for a card's padding; give them one. */
  inset?: boolean;
  samples: Sample[];
};

const WIDTHS = [280, 360, 480, 720, 1080] as const;

export const GROUPS: Group[] = [...CORE_GROUPS, ...AI_GROUPS, ...CPQ_GROUPS, ...SHELL_GROUPS];

/** Every component name rendered somewhere in the catalog (checked against the index export). */
export const COVERED_COMPONENTS = GROUPS.flatMap((group) => group.samples.map((sample) => sample.name));

function groupMatches(group: Group, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [group.file, group.title, group.note ?? ""].some((text) => text.toLowerCase().includes(q));
}

function sampleMatches(sample: Sample, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [sample.name, sample.note ?? ""].some((text) => text.toLowerCase().includes(q));
}

function filteredSamples(group: Group, query: string) {
  return groupMatches(group, query) ? group.samples : group.samples.filter((sample) => sampleMatches(sample, query));
}

function GroupSection({ group, query }: { group: Group; query: string }) {
  const samples = filteredSamples(group, query);
  const id = `group-${group.file.replace(/[^a-z0-9]+/gi, "-")}`;
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-3" data-group={group.file}>
      <header className="flex min-w-0 flex-col gap-0.5">
        <h2 className="font-mono text-title-sm" id={id}>
          {group.file}
        </h2>
        <p className="text-body-md text-on-surface-variant">
          <span className="text-on-surface">{group.title}.</span> {group.note}
        </p>
      </header>
      <div className="flex items-start gap-6 overflow-x-auto pb-3" data-slot="component-frames" role="region" aria-label={`${group.file} frames`} tabIndex={0}>
        {WIDTHS.map((width) => (
          <div className="flex shrink-0 flex-col gap-2" data-frame={width} key={width} style={{ width }}>
            <span className="text-meta-strong text-on-surface-variant">{width}px</span>
            <div className="flex min-w-0 flex-col gap-4 rounded-lg bg-canvas p-2" data-frame-body>
              {samples.map((sample) => (
                <div className="flex min-w-0 flex-col gap-2" data-sample={sample.name} key={sample.name}>
                  <span className="text-meta-strong text-on-surface-variant" data-meta="eyebrow">
                    {sample.name}
                  </span>
                  <div className="min-w-0">{group.inset ? <div className="rounded-2xl bg-inset p-4">{sample.node}</div> : sample.node}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComponentCatalog() {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => GROUPS.map((group) => ({ group, samples: filteredSamples(group, query) })).filter((entry) => entry.samples.length > 0), [query]);
  const count = shown.reduce((n, entry) => n + entry.samples.length, 0);

  return (
    <div className="flex min-w-0 flex-col gap-module-gap p-4 md:p-6">
      <PageHeader
        description="Every exported component, grouped by the file it lives in and rendered with long, realistic fake data in frames at 280, 360, 480, 720 and 1080px. Nothing may overflow its frame; tabs and segmented controls never wrap; every target is at least 24 by 24."
        title="Component matrix"
      />

      <div className="flex flex-wrap items-center gap-3">
        <FilterSearch className="sm:w-80" label="Search components" onValueChange={setQuery} placeholder="Search by component, file or note" value={query} />
        <span data-meta="count" className="text-meta text-on-surface-variant tabular-nums">
          {count} of {COVERED_COMPONENTS.length} components · {shown.length} of {GROUPS.length} files
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">Nothing matches “{query}”. Try a file name, or a component such as DataGrid or StepList.</p>
      ) : (
        shown.map((entry) => <GroupSection group={entry.group} key={entry.group.file} query={query} />)
      )}
    </div>
  );
}
