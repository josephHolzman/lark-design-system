"use client";

import { FileCheckIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";

import { SectionCard } from "@/components/lark/cards";
import { Segmented } from "@/components/lark/filters";
import { DescriptionItem, DescriptionList, List, ListItem } from "@/components/lark/lists";
import { PageHeader } from "@/components/lark/page-header";
import { StatusBadge } from "@/components/lark/status-badge";
import { Button } from "@/components/ui/button";

/*
  Lark 0.7 foundations. Every value here is fake (no customer data).
  The two open decisions (module title 18 or 20, module radius 12 or 16) are previewed side by
  side with the same module, so the choice is made on real content, not swatches.
*/

function SampleModule() {
  return (
    <SectionCard
      action={<StatusBadge status="Awaiting decision" />}
      description="Discount is 22% against a 15% floor for this region."
      title="Does this quote need an exception?"
    >
      <div className="flex flex-col gap-item">
        <div className="rounded-lg bg-inset p-4" data-slot="inset">
          <DescriptionList>
            <DescriptionItem term="Account">Northwind Freight (example)</DescriptionItem>
            <DescriptionItem term="Net price">$412,800 per year</DescriptionItem>
            <DescriptionItem term="Requested by">Priya Raman</DescriptionItem>
          </DescriptionList>
        </div>
        <List dividers>
          <ListItem headline="Pricing review" meta="2 hr ago" supporting="Approved by Dana Ito" />
          <ListItem headline="Finance review" meta="Waiting" supporting="Needs margin above 38%" />
        </List>
      </div>
    </SectionCard>
  );
}

const LADDER = [
  { cls: "text-title-lg", name: "Page title", size: "30 / 36 · 400", sample: "Deal desk" },
  { cls: "text-title-module", name: "Module title", size: "18 or 20 · 450", sample: "Who still has to approve?" },
  { cls: "text-title-sm", name: "Item title", size: "16 / 24 · 450", sample: "Finance review" },
  { cls: "text-body-md", name: "Body", size: "14 / 20 · 400", sample: "Discount is 22% against a 15% floor." },
  { cls: "text-meta", name: "Meta (metadata only)", size: "12 / 18 · 400", sample: "Updated 2 hr ago · REF-1042" },
] as const;

const SURFACES = [
  { cls: "bg-canvas", name: "Canvas", light: "linen-98", dusk: "dusk-100" },
  { cls: "bg-module", name: "Module", light: "white", dusk: "dusk-300" },
  { cls: "bg-inset", name: "Inset", light: "linen-95", dusk: "dusk-400" },
] as const;

export function Foundations() {
  const [title, setTitle] = useState("20");
  const [radius, setRadius] = useState("16");
  return (
    <div className="flex flex-col gap-module-gap">
      <PageHeader
        description="Type ladder, surfaces, spacing and module variants for Lark 0.7. Example data throughout."
        title="Foundations"
      />

      <SectionCard
        description="The same module at each setting. Pick on content, not swatches."
        icon={<FileCheckIcon />}
        title="Open decisions: module title and radius"
        variant="feature"
        tone="sky"
      >
        <div className="flex flex-col gap-item">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="text-label-lg">
                Title
              </span>
              <Segmented
                aria-label="Module title size"
                onValueChange={setTitle}
                options={[
                  { value: "18", label: "18px" },
                  { value: "20", label: "20px" },
                ]}
                value={title}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-label-lg">Radius</span>
              <Segmented
                aria-label="Module radius"
                onValueChange={setRadius}
                options={[
                  { value: "12", label: "12px" },
                  { value: "16", label: "16px" },
                ]}
                value={radius}
              />
            </div>
          </div>
          <div className="grid gap-module-gap rounded-lg bg-canvas p-4 md:grid-cols-2" data-lark-module-radius={radius} data-lark-module-title={title}>
            <SampleModule />
            <SectionCard as="h3" title="Recent activity">
              <List dividers>
                <ListItem headline="Quote R4 sent" meta="9:12 AM" supporting="Sent to the buyer for signature" />
                <ListItem headline="Margin check passed" meta="Yesterday" supporting="38.4% against a 35% floor" />
              </List>
            </SectionCard>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Recommendation: 20px titles (a clear step above 16px item titles; 18 is only 1.125×) and a 16px radius at 24px padding.
          </p>
        </div>
      </SectionCard>

      <div className="grid gap-module-gap lg:grid-cols-2">
        <SectionCard description="12px is for metadata only; lark-lint fails a 12px sentence." title="Type ladder">
          <ul className="flex flex-col divide-y divide-outline-variant">
            {LADDER.map((l) => (
              <li className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0" key={l.name}>
                <span className={l.cls}>{l.sample}</span>
                <span className="text-meta text-on-surface-variant">
                  {l.name} · {l.size} · <code className="font-mono">{l.cls}</code>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard description="Cohere's lightness steps with a faint sand cast. The hairline on the module does part of the work." title="Surfaces">
          <div className="flex flex-col gap-item">
            <div className="rounded-lg bg-canvas p-4">
              <div className="rounded-module border border-edge bg-module p-4">
                <div className="rounded-lg bg-inset p-4">
                  <div className="rounded-md border border-edge bg-module px-3 py-2 text-body-md">Item on an inset, in a module, on the canvas</div>
                </div>
              </div>
            </div>
            <ul className="grid grid-cols-3 gap-2">
              {SURFACES.map((s) => (
                <li className="flex flex-col gap-1" key={s.name}>
                  <span aria-hidden="true" className={`h-10 rounded-md border border-outline-variant ${s.cls}`} />
                  <span className="text-label-lg">{s.name}</span>
                  <span className="text-meta text-on-surface-variant">
                    {s.light} · {s.dusk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-module-gap md:grid-cols-2 xl:grid-cols-3">
        <SectionCard description="White, 24px padding (16 under 30rem)." title="Default module">
          <p className="text-body-md">The title says the module&apos;s job.</p>
        </SectionCard>
        <SectionCard
          description="An answer or recommendation from ACE."
          footer={<Button size="sm">Apply suggestion</Button>}
          icon={<SparklesIcon />}
          title="ACE suggests a 3-year term"
          tone="iris"
          variant="feature"
        >
          <p className="text-body-md">Raises margin to 39% and keeps the discount inside the floor.</p>
        </SectionCard>
        <SectionCard description="A decision the reader makes." icon={<FileCheckIcon />} title="Approve the exception?" tone="sky" variant="feature">
          <div className="flex gap-2">
            <Button size="sm">Approve</Button>
            <Button size="sm" variant="secondary">
              Request changes
            </Button>
          </div>
        </SectionCard>
        <SectionCard title="Blocked: legal review missing" tone="error" variant="status">
          <p className="text-body-md">The order form can&apos;t be sent until Legal approves clause 7.</p>
        </SectionCard>
        <SectionCard title="Needs attention: price book expires Friday" tone="warning" variant="status">
          <p className="text-body-md">Requote before the 2027 price book takes over.</p>
        </SectionCard>
        <SectionCard title="Ready: all checks passed" tone="success" variant="status">
          <p className="text-body-md">Six of six policy checks passed on revision 4.</p>
        </SectionCard>
      </div>
    </div>
  );
}
