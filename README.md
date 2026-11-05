# Lark

AI chat design system: **Apollo's Beams structure, the lark's palette.** Built on
Vercel's [AI Elements](https://ai-sdk.dev/elements) and shadcn/ui.

- Spec: [`design/LARK.md`](design/LARK.md). The Material 3 version (v0.1) is in `design/RECONCILIATION.md`, now superseded.
- Color tokens: `design/tokens/` (generator, primitives, contrast checks)
- Decisions log: Claude project doc `claude/lark-design-system-decisions.md`
- Figma: "AI Design System — Lark" (file key `DVWf57vCwAmFDplkZ4SkBF`)

## Run it

```bash
npm install
npm run dev
```

- http://localhost:3000/review — foundation, calibrated components and all 49 AI
  Elements in light and dusk
- http://localhost:3000/examples/dashboard — Deepgrids "Deals & approvals" built only from
  Lark parts (filters, sortable table, density switch, deal drawer, decision form)
- http://localhost:3000/examples/chat — ACE workspace: conversation, tools, sources,
  confirmation, workflow canvas, deal context panel
- http://localhost:3000/examples/patterns — every card, banner, state, menu, tab and AI pattern, with when to use it.
- http://localhost:3000/examples/deals — full-bleed list: facet rail, saved views, grouping, bulk actions, AI risk column, side peek, loading/empty/error.
- http://localhost:3000/examples/record — deal record: inline edit, dirty state and save bar, plan review, change review.
- http://localhost:3000/examples/settings — settings layout: rule rows, users grid, danger zone.
- http://localhost:3000/examples/quote — quote workbench: deal figures with sources, quote lines with ACE's proposed change, price waterfall, options, policy checks, approval route, invoice schedule, PO matching.
- http://localhost:3000/examples/chat-states — every state of a conversation with ACE (from the ACE state library).
- `npm run verify` runs lint, types, tests (axe + behaviour), the library build and a consumer smoke test.
- `npm run pack:lib` builds the library (`@josephholzman/lark`, imported as `@deepgrids/lark`) and packs a tarball into `packages/` (see `packages/lark/README.md`; release notes in `packages/lark/CHANGELOG.md`; Figma in `design/figma/README.md`).
- http://localhost:3000 — Vercel's mocked chatbot example (no backend needed)

## How it's put together

| Path | What |
|---|---|
| `src/app/globals.css` | Lark foundation: color roles (light `:root`, dusk `.dark`), shadcn aliases, Beams shape, type roles, motion, elevation, and the `state-layer`, `focus-ring`, `hit-area`, `link-default` and `link-hyper` utilities |
| `design/tokens/build_tokens.py` | Generates the color block in `globals.css` and `src/design/tokens.ts` from `primitives.json`; fails if any of the 166 contrast pairs misses its minimum. Run `python design/tokens/build_tokens.py` after changing colors |
| `src/components/ui/` | 54 shadcn primitives (incl. sidebar, table, sheet, drawer, calendar, chart, field, native-select), restyled to the spec |
| `src/components/lark/` | Product components beyond shadcn, for Deepgrids: `AppShell`/`AppSidebar`/`Topbar`/`SearchCommand`, `PageHeader`/`PageTabs`, `Figure`/`FigureStrip`/`Sparkline`/`Meter`, `SectionCard`/`ActionCard`/`IconChip`, `DescriptionList`, `List`/`ListItem`, `CountPill`, `StatusBadge`, `StageProgress`, `Timeline`, `ApprovalChain`, `FilterBar`/`FilterSearch`/`FilterChip`/`Segmented`, `SortableHead`/`TablePager`, `SourceChip`, `CompanyLogo`/`PersonAvatar`/`AceMark` |
| `src/app/examples/` | The example dashboard and chat |
| `src/components/ai-elements/` | All 49 AI Elements from `vercel/ai-elements` @ `ca8be60`, restyled: status colors use roles, hovers use state layers, containers use Beams shapes |
| `src/app/review/` | The review page; `examples/` holds Vercel's demos (deterministic IDs and dates) |
| `src/app/fonts/` | Hanken Grotesk variable, upright and italic (SIL OFL 1.1). Geist Mono comes from the `geist` package |

Lark is dark mode by adding `class="dark"` to an ancestor ("dusk").

## Rules of thumb

- Use role colors (`bg-surface-container`, `text-on-surface-variant`, `bg-error-container`…),
  never Tailwind palette colors.
- Interactive elements get `state-layer` (ink 8% hover, 12% pressed; add `[--state-hover:0.05]` in lists and menus) and `focus-ring`. Small controls also get `hit-area` (44px on touch screens).
- One `default` (sky) button per view. Everyday buttons are `secondary`; quiet ones `ghost`; ACE actions `ai`.
- Colour means something: status, category, AI (iris), selected (tan). Everything else is ink on paper.
- Cards never get a shadow. Only things that float do (`shadow-raised`, `-md`, `-lg`, `-drawer`).
- Selected states pair color with a second cue (check icon, indicator, weight).
- Status always shows an icon **and** a word.
- Code, IDs, emails and URLs use `font-mono` (Hanken's I and l are only distinct in some
  contexts).

## Things that are easy to get wrong

- `src/lib/utils.ts` extends tailwind-merge with Lark's type roles (`text-label-lg`…) and
  shadows. Without it, `cn()` reads `text-label-lg` as a colour and drops it whenever a
  variant sets `text-on-primary`. Add new role names there when you add them to the theme.
- Table density: `<Table density="compact">` (40px rows) or the default 52px.
- Input and NativeSelect take `size="sm"` (32px) for toolbars; Button has `xs` (28px).
- Section navigation that changes the URL is `PageTabs` (links, `aria-current`); panels
  that swap in place are `ui/tabs` (ARIA tabs).

## Changes from upstream

1. Restyling per `design/LARK.md` across `ui/` and `ai-elements/`.
2. New variants: Badge `info`, `success`, `warning`; Alert `info`, `success`, `warning`;
   InputGroupButton size `icon`.
3. `jsx-preview.tsx`: props omit the div's `onError` (upstream type conflict).
   `schema-display.tsx`: only string children go to `dangerouslySetInnerHTML`.
4. Question options are filter chips (8px corners, check when selected).
7. Workflow (React Flow) parts redesigned: `Node` takes `kind` (trigger, ai, decision,
   tool, output) and `status`; new `NodeIcon`, `NodeHeading`, `NodeField`,
   `NodeStatusBadge`. `NodeHeader` is now a flex row (put title and description inside
   `NodeHeading`). Edges: `Default`, `Animated`, `Running`, `Temporary`, with labels.
8. Composer: Beams bordered box (radius 16, ink 8% edge, no shadow); focus is a 2px action-blue edge.
9. Button variants `reversed` and `ai`; Badge variants `ai`, `selected`, `teal`, `pink`, `olive`, `inverse`.
5. Review demos: fixed IDs and dates (Next 16 prerendering rejects random values), type
   fixes where Vercel's demos drifted from current types.
6. `eslint.config.mjs`: React Compiler rules are warnings in vendored folders only.

## Known issues

- `file-tree.tsx`: a role is missing required ARIA props.
- One React hydration warning on `/review` from a demo (text mismatch); demos only.
- `npm run lint`: 0 errors, ~30 warnings, all in vendored code.
