import type { Metadata } from "next";
import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { modes } from "@/design/tokens";

import { ButtonMatrix, ComposerDemo, MessageDemo } from "./calibrated";
import { FAMILIES, Gallery } from "./gallery";

export const metadata: Metadata = {
  title: "Lark review",
  description: "Lark foundation, calibrated components and all 49 AI Elements in light and dusk.",
};

type Mode = "light" | "dusk";

const ROLE_GROUPS: [string, string[]][] = [
  ["Surfaces · paper", ["surface", "canvas", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest"]],
  ["Text · ink", ["on-surface", "on-surface-variant", "on-surface-tertiary"]],
  ["Lines · ink alpha", ["outline-faint", "outline-variant", "outline-strong", "outline"]],
  ["Brand · sky (one per view)", ["brand", "brand-hover", "brand-pressed", "on-brand"]],
  ["Action · links, focus", ["primary", "on-primary", "primary-container", "on-primary-container"]],
  ["Selected · tan", ["secondary-container", "selected-strong", "selected-border", "on-secondary-container"]],
  ["AI · iris", ["tertiary", "tertiary-container", "on-tertiary-container", "ai-border"]],
  ["Negative · rust", ["error", "on-error", "error-container", "on-error-container"]],
  ["Positive · evergreen", ["success", "on-success", "success-container", "on-success-container"]],
  ["Caution · ember", ["warning", "on-warning", "warning-container", "on-warning-container"]],
  ["Categories", ["tag-teal", "on-tag-teal", "tag-pink", "on-tag-pink", "tag-olive", "on-tag-olive"]],
  ["Inverse and terminal", ["inverse-surface", "inverse-on-surface", "terminal", "on-terminal"]],
];

const SHAPES: [string, string, string, string][] = [
  ["xxs", "2", "rounded-xs", "Focus offsets, tiny marks"],
  ["xs", "4", "rounded-sm", "Checkboxes, kbd"],
  ["sm", "8", "rounded-md", "Buttons, fields, menus, tooltips, nav rows"],
  ["md", "12", "rounded-lg", "Cards, tables, user message"],
  ["lg", "16", "rounded-xl", "Dialogs, composer, command palette"],
  ["full", "—", "rounded-full", "Badges, counts, avatars, switches"],
];

const TYPE: [string, string, string, string][] = [
  ["text-title-lg", "Title large", "26/32 · 450 (Beams 24)", "Large headings, landings"],
  ["text-title-md", "Title medium", "22/28 · 450 (Beams 20)", "Page titles, metric values"],
  ["text-title-sm", "Title small", "16/24 · 450 (Beams 15)", "Card, section and drawer titles"],
  ["text-body-lg", "Body large", "16/24 · 400 (Beams 15)", "Lead text"],
  ["text-sm", "Body", "14/20 · 400 (Beams 13)", "Body, cells, nav, chat"],
  ["text-label-lg", "Subtitle large", "14/20 · 450 (Beams 13)", "Buttons, labels, controls"],
  ["text-label-md", "Subtitle small", "12/18 · 450", "Badges, key–value labels"],
  ["text-xs", "Caption", "12/18 · 400", "Captions, meta (the floor)"],
];

const DENSITY: [string, string, string, string][] = [
  ["Button", "32 (24 / 40), radius 8", "36, pill", "32 (24 / 28 / 40), radius 8"],
  ["Text field", "32, ink 12% edge", "36, 3:1 edge", "32, 3:1 edge (WCAG 1.4.11)"],
  ["Menu item", "32, menu radius 8", "32 in a 16 menu", "32, menu radius 8"],
  ["Table row", "header 40, rows 55", "header 40, rows 52", "header 40, rows 55 / 40"],
  ["Card", "radius 12, ink 8%, no shadow", "radius 12, tonal", "radius 12, ink 8%, no shadow"],
  ["Chat text", "13/20, no bubble", "16/26", "14/20, no bubble; user in a grey bubble"],
];

const STATES = ["enabled", "hover", "focus", "pressed", "disabled"] as const;

function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-title-md" id={id}>
          {title}
        </h2>
        {intro && <p className="max-w-[72ch] text-sm text-on-surface-variant">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

function Pair({ children }: { children: (mode: Mode) => ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {(["light", "dusk"] as const).map((mode) => (
        <div className={mode === "dusk" ? "dark" : undefined} key={mode}>
          <div className="flex h-full min-w-0 flex-col gap-4 rounded-lg border border-outline-variant bg-background p-4 text-foreground sm:p-6">
            <span className="text-label-md text-on-surface-variant">{mode === "light" ? "Light" : "Dusk"}</span>
            {children(mode)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Swatches({ mode }: { mode: Mode }) {
  const roles = modes[mode].roles;
  return (
    <div className="flex flex-col gap-5">
      {ROLE_GROUPS.map(([group, names]) => (
        <div className="flex flex-col gap-2" key={group}>
          <h3 className="text-label-md text-on-surface-variant">{group}</h3>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {names.map((name) => (
              <li className="flex min-w-0 items-center gap-3" key={name}>
                <span
                  aria-hidden
                  className="size-9 shrink-0 rounded-md border border-outline-variant"
                  style={{ background: `var(--${name})` }}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm">{name}</span>
                  <span className="truncate font-mono text-xs text-on-surface-variant">
                    {roles[name].src} · {roles[name].hex}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Surfaces() {
  const steps = ["surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest"];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <div className="flex h-16 min-w-24 flex-1 items-end rounded-lg border border-outline-variant p-2 text-xs" key={s} style={{ background: `var(--${s})` }}>
            {s.replace("surface-container", "container")}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-lg border border-outline-variant bg-card p-4">
          <span className="text-title-sm">Card · no shadow</span>
          <span className="text-xs text-on-surface-variant">Cards, tables and panels: ink 8% edge only</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-outline-variant bg-card p-4 shadow-raised">
          <span className="text-title-sm">Raised · result cards</span>
          <span className="text-xs text-on-surface-variant">AI results, workflow nodes</span>
        </div>
        <div className="flex flex-col gap-1 rounded-md border border-outline-variant bg-popover p-4 shadow-md">
          <span className="text-title-sm">Menu · menus, popovers</span>
          <span className="text-xs text-on-surface-variant">Anchored floating layers</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-outline-variant bg-popover p-4 shadow-lg">
          <span className="text-title-sm">Overlay · dialogs, palette</span>
          <span className="text-xs text-on-surface-variant">Centered floating layers</span>
        </div>
      </div>
    </div>
  );
}

function States() {
  const rows = [
    ["default", "Primary"],
    ["secondary", "Secondary"],
    ["ghost", "Tertiary"],
    ["ai", "AI"],
  ] as const;
  return (
    <div className="flex flex-col gap-4 overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-y-2 text-left">
        <thead>
          <tr>
            <th className="w-20" />
            {STATES.map((s) => (
              <th className="pb-1 text-label-md font-medium text-on-surface-variant" key={s} scope="col">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([variant, label]) => (
            <tr key={variant}>
              <th className="text-xs font-normal text-on-surface-variant" scope="row">
                {label}
              </th>
              {STATES.map((s) => (
                <td key={s}>
                  <Button
                    data-demo-state={s === "enabled" || s === "disabled" ? undefined : s}
                    disabled={s === "disabled"}
                    size="sm"
                    tabIndex={-1}
                    variant={variant}
                  >
                    Action
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex w-56 flex-col gap-0.5 rounded-md border border-outline-variant bg-popover p-1 shadow-md">
          {["enabled", "hover", "focus", "pressed"].map((s) => (
            <div className="state-layer [--state-hover:0.05] rounded-md px-2 py-1.5 text-sm" data-demo-state={s === "enabled" ? undefined : s} key={s}>
              Menu item · {s}
            </div>
          ))}
          <div className="flex items-center justify-between rounded-md bg-selected-strong px-2 py-1.5 text-sm text-on-secondary-container">
            Selected <span aria-hidden>✓</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["enabled", "hover", "focus"].map((s) => (
            <Button
              data-demo-state={s === "enabled" ? undefined : s}
              key={s}
              size="sm"
              tabIndex={-1}
              variant="outline"
            >
              Chip · {s}
            </Button>
          ))}
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Running</Badge>
            <Badge variant="success">Completed</Badge>
            <Badge variant="warning">Needs approval</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge>Pending</Badge>
            <Badge variant="ai">AI</Badge>
            <Badge variant="selected">Selected</Badge>
            <Badge variant="teal">Renewal</Badge>
            <Badge variant="pink">Counteroffer</Badge>
            <Badge variant="olive">Billing</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rendered per request: several demos (and libraries they use) call Math.random() while rendering.
async function ReviewContent() {
  await connection();
  const checks = modes.light.checks.map((c, i) => ({ ...c, dusk: modes.dusk.checks[i].ratio }));
  const total = FAMILIES.reduce((n, f) => n + f.demos.reduce((m, d) => m + (d.covers ? d.covers.split(",").length : 1), 0), 0);

  return (
    <main className="group/review mx-auto flex w-full max-w-[1280px] flex-col gap-14 px-4 py-10 sm:px-6 lg:px-10">
      <header className="flex flex-col gap-4">
        <span className="text-label-md text-on-surface-variant">Lark · review v0.2</span>
        <h1 className="text-title-lg">Beams structure, the lark&apos;s palette</h1>
        <p className="max-w-[72ch] text-body-lg text-on-surface-variant">
          The foundation, the three calibrated components, and all {total} AI Elements in light and dusk. Apollo&apos;s
          Beams system decides structure: warm paper neutrals, ink-alpha lines, 32px controls, 12px cards with no
          shadow, colour only for status. The lark supplies the palette: sky for the one brand button, tan for
          selected, night blue for dusk, Hanken Grotesk for type.
        </p>
        <div className="max-w-[72ch] rounded-lg bg-surface-container p-4 text-sm">
          <p className="text-title-sm">What to check</p>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5">
            <li>Does it read as Beams: ink on paper, hairlines, colour only where it means something?</li>
            <li>Is the sky button the only coloured action on each screen, and is tan clearly &quot;selected&quot;?</li>
            <li>Type: does Hanken at 14/20 read like Apollo&apos;s Inter at 13/20?</li>
            <li>Anything in the component gallery that still looks like stock shadcn.</li>
          </ol>
        </div>
        <nav aria-label="Sections" className="flex flex-wrap gap-2">
          {[
            ["density", "Density"],
            ["color", "Color"],
            ["surfaces", "Surfaces"],
            ["shape", "Shape"],
            ["type", "Type"],
            ["states", "States"],
            ["motion", "Motion"],
            ["calibrated", "Calibrated"],
            ["components", "All components"],
          ].map(([id, label]) => (
            <Button asChild key={id} size="sm" variant="secondary">
              <a href={`#${id}`}>{label}</a>
            </Button>
          ))}
        </nav>
      </header>

      <Section id="density" intro="Beams is dense by default: 32px controls, 28px nav rows, 55px table rows. Hit areas follow the input device instead: at least 24px on a mouse (WCAG 2.5.8), 44px on touch." title="Density">
        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
              <tr>
                {["Component", "Beams", "Lark v0.1 (M3)", "Lark"].map((h) => (
                  <th className="px-4 py-2 font-medium" key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DENSITY.map((r) => (
                <tr className="border-t border-outline-variant" key={r[0]}>
                  <th className="px-4 py-2 font-medium" scope="row">
                    {r[0]}
                  </th>
                  <td className="px-4 py-2 text-on-surface-variant">{r[1]}</td>
                  <td className="px-4 py-2 text-on-surface-variant">{r[2]}</td>
                  <td className="px-4 py-2">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="color" intro="Beams roles over the lark&apos;s palette. Neutrals are Beams&apos; sand at stone&apos;s hue; lines are ink at 4, 8 and 12%; fields keep a 3:1 edge. Status and category hues are Beams&apos;. Dusk is the lark&apos;s night blue." title="Color roles">
        <Pair>{(mode) => <Swatches mode={mode} />}</Pair>
        <details className="rounded-lg border border-outline-variant">
          <summary className="state-layer cursor-pointer rounded-lg px-4 py-3 text-title-sm">
            {checks.length * 2} contrast pairs checked, all passing (show table)
          </summary>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-label-md text-on-surface-variant">
                <tr>
                  <th className="py-2 font-medium" scope="col">Foreground on background</th>
                  <th className="py-2 font-medium" scope="col">Light</th>
                  <th className="py-2 font-medium" scope="col">Dusk</th>
                  <th className="py-2 font-medium" scope="col">Minimum</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {checks.map((c) => (
                  <tr className="border-t border-outline-variant" key={`${c.fg}-${c.bg}`}>
                    <td className="py-1.5 font-sans text-sm">
                      {c.fg} on {c.bg}
                    </td>
                    <td className="py-1.5">{c.ratio.toFixed(2)}</td>
                    <td className="py-1.5">{c.dusk.toFixed(2)}</td>
                    <td className="py-1.5">{c.min}:1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Section>

      <Section id="surfaces" intro="Hairlines separate; shadows are only for things that float. Result cards get the faintest lift, menus a little more, dialogs and the palette the most." title="Surfaces and elevation">
        <Pair>{() => <Surfaces />}</Pair>
      </Section>

      <Section id="shape" intro="Beams&apos; five corners. Nothing is rounder than 16 except pills." title="Shape">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SHAPES.map(([name, px, cls, use]) => (
            <div className="flex flex-col gap-2" key={name}>
              <div className={`h-20 border border-outline-strong bg-surface-container ${cls}`} />
              <span className="text-title-sm">
                {name} {px !== "—" && <span className="text-on-surface-variant">{px}</span>}
              </span>
              <span className="text-xs text-on-surface-variant">{use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="type" intro="Beams&apos; roles in Hanken Grotesk, one pixel up from Inter so x-heights match (Hanken 0.49, Inter 0.55). Weights 400, 450 and 550. Nothing below 12px." title="Type">
        <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
          {TYPE.map(([cls, name, spec, use]) => (
            <div className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_200px] sm:items-baseline" key={name}>
              <span className={cls}>Two renewals slipped into October · 1,180,400</span>
              <span className="text-xs text-on-surface-variant">
                {name} · {spec} · {use}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="states" intro="Ink overlays: hover 8% (4–5% in lists and menus), pressed 12%. The brand button swaps to darker sky instead. Focus is a 2px action-blue ring, 2px out (Beams draws 1px). Selected is tan; disabled is a grey fill, never a fade." title="States">
        <Pair>{() => <States />}</Pair>
      </Section>

      <Section id="motion" intro="Beams moves little: 120ms ease-in-out for colour and borders, longer only for things that travel. With reduced motion, transitions collapse to near zero." title="Motion">
        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full min-w-[520px] text-left text-sm">
            <tbody>
              {[
                ["Hover, pressed, border colour", "120ms", "ease-in-out (0.4, 0, 0.2, 1)"],
                ["Shadows, opacity", "150–200ms", "ease-in-out"],
                ["Collapsibles, chevrons", "200ms", "ease-in-out"],
                ["Drawers and dialogs in", "300ms", "ease-out"],
              ].map((r) => (
                <tr className="border-t border-outline-variant first:border-t-0" key={r[0]}>
                  <th className="px-4 py-2 font-medium" scope="row">
                    {r[0]}
                  </th>
                  <td className="px-4 py-2 font-mono text-xs">{r[1]}</td>
                  <td className="px-4 py-2 text-on-surface-variant">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="calibrated" intro="The three components that set the rules for the rest: Button, Message and the composer (Prompt Input)." title="Calibrated components">
        <Pair>
          {() => (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-title-sm">Button</h3>
                <ButtonMatrix />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-title-sm">Message</h3>
                <MessageDemo />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-title-sm">Composer</h3>
                <ComposerDemo />
                <ComposerDemo status="streaming" text="Summarize the Halvorsen legal review and draft a follow-up" />
              </div>
            </div>
          )}
        </Pair>
      </Section>

      <Section id="components" intro={`Vercel's own demo for each component, restyled. ${total} components across five families.`} title="All components">
        <fieldset className="flex h-[34px] w-fit gap-0.5 rounded-md border border-outline-variant bg-surface-container-low p-0.5">
          <legend className="sr-only">Gallery theme</legend>
          {[
            ["g-light", "Light"],
            ["g-dusk", "Dusk"],
          ].map(([id, label]) => (
            <label
              className="state-layer [--state-hover:0.05] flex h-full cursor-pointer items-center gap-1.5 rounded-[6px] px-3 text-label-lg text-on-surface-variant has-checked:bg-inverse-surface has-checked:text-inverse-on-surface has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
              htmlFor={id}
              key={id}
            >
              <input className="peer sr-only" defaultChecked={id === "g-light"} id={id} name="gallery-theme" type="radio" />
              {label}
            </label>
          ))}
        </fieldset>
        <div className="group-has-[#g-dusk:checked]/review:hidden">
          <Gallery idPrefix="light" />
        </div>
        <div className="dark hidden group-has-[#g-dusk:checked]/review:block">
          <div className="rounded-lg bg-background p-4 text-foreground sm:p-6">
            <Gallery idPrefix="dusk" />
          </div>
        </div>
      </Section>

      <footer className="border-t border-outline-variant pt-6 text-xs text-on-surface-variant">
        Spec: design/LARK.md · tokens: design/tokens/build_tokens.py · live route: /review in C:\dev\lark
      </footer>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<p className="p-10 text-sm text-on-surface-variant">Loading review…</p>}>
      <ReviewContent />
    </Suspense>
  );
}
