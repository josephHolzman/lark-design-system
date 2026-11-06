# Lark: Beams structure, the lark's palette

Since 2026-11-05 Lark follows Apollo's **Beams** design system for structure, and keeps
the lark for identity. This replaces `RECONCILIATION.md` (the Material 3 version).
Source measurements: Claude project doc `lark-beams-extraction.md`.

## What comes from where

| From Beams | From the lark |
|---|---|
| Warm neutral ramp ("paper": Beams' sand lightness and chroma) | Its hue (stone, from the bird's belly) |
| Ink-alpha lines: 4% faint · 8% default · 12% strong | — |
| Colour only for status, category and AI | Sky = the one brand button per view |
| Hues: ocean, rust, evergreen, ember, iris (AI), tropic, sakura, olive | Tan (sand) = "selected" (Beams' pebble) |
| Type roles, weights 400/450/550 | Hanken Grotesk, one pixel up from Inter |
| Radius 2 · 4 · 8 · 12 · 16 · full | — |
| Elevation: cards flat; raised, menu, overlay, drawer | — |
| Dark mode structure (mirrored roles) | Dusk: night-blue surfaces |

## Deliberate differences from Beams (accessibility)

- **Focus:** 2px action-blue ring, 2px out (Beams draws 1px).
- **Fields, checkboxes, radios, switches:** edges at 3:1 (`outline`), not ink 12–24%, for WCAG 1.4.11.
- **Table headers:** sentence case 12/18 450 (Beams: uppercase mono 11/16). One-line change in `ui/table.tsx` if wanted.
- **Semantics:** real `<table>`, `<a>`, `<button>`, labelled regions; Beams uses div grids and clickable divs.

## Tokens (roles)

| Role | Light | Dusk | Use |
|---|---|---|---|
| `surface` | white | dusk-200 | page, sidebar, header band, list pages |
| `canvas` | sand-50 | dusk-100 | dashboard and record bodies (cards sit on it) |
| `surface-container-low … highest` | paper 04 · 08 · 10 · 15 | dusk 300–600 | hovers, wells, counts, tracks |
| `on-surface` / `-variant` / `-tertiary` | paper 94 · 70 · 60 | stone 100 · 300 · 400 | primary, secondary, tertiary text |
| `outline-faint` / `-variant` / `-strong` | ink 4 · 8 · 12% | light 6 · 10 · 16% | dividers · cards, tables, menus · buttons, chips |
| `outline` | paper-50 (3:1) | dusk-800 | fields, checkboxes, switches off |
| `brand` (+ hover, pressed, `on-brand`) | sky 300 / 400 / 500, ink label | sky 300 / 200 / 400 | the one primary button |
| `primary` | sky-650 | sky-300 | links, focus ring, sparkline, info accents |
| `primary-container` | sky-100 / sky-900 | sky-800 / sky-100 | "in progress" badges |
| `secondary-container`, `selected-strong`, `selected-border` | sand 100 / 200 / 300 | sand 900 / 800 / 700 | selected rows, chips, cards, list items |
| `tertiary*`, `ai-border` | iris | iris (derived) | AI, always |
| `error*` / `success*` / `warning*` | rust / evergreen / ember | derived | status |
| `tag-teal` / `tag-pink` / `tag-olive` | tropic / sakura / olive | derived | categories (badges only) |
| `inverse-surface` | paper-90 | stone-100 | tooltips, reversed button, selected segment |

All text and control pairs are contrast-checked by `design/tokens/build_tokens.py` (166 checks).

## Type (Hanken optical match)

| Role | Lark | Beams | Use |
|---|---|---|---|
| `title-lg` | 26/32 450 | 24/32 | large headings, landings |
| `title-md` | 22/28 450, −0.01em | 20/28 | page titles, metric values |
| `title-sm` | 16/24 450 | 15/24 | card, section, drawer and dialog titles |
| `body-lg` | 16/24 400 | 15/24 | lead text |
| `text-sm` / `body-md` | 14/20 400 | 13/20 | body, cells, nav, chat |
| `label-lg` | 14/20 450 | 13/20 450 | buttons, labels |
| `label-md` | 12/18 450 | 12/18 450 | badges, key–value labels, table headers |
| `text-xs` / `body-sm` | 12/18 400 | 12/18 | captions, meta |
| `subtext` | 12/16 | 12/16 | dense meta |
| mono | Geist Mono 12/16, −0.4px | Roboto Mono | counts, IDs |

## Components

- **Button** 32 (xs 24, sm 28, lg 40), radius 8 (xs 6), label-lg. `default` = sky brand (one per view) · `secondary`/`outline` = near-white + ink 12% · `ghost` = tertiary · `reversed` = dark · `ai` = iris · `destructive` · `link` = ink text, light underline. Disabled = grey fill. Group order: ghost → secondary → default.
- **Badge** 20 pill, 12/18 450, hue-20 fill + hue-70 label. Variants: default (neutral ink 8%), info, success, warning, destructive, ai, selected, teal, pink, olive, inverse. Not clickable.
- **Inputs** 32 (sm 28), radius 8, `outline` edge, hover darker. **Checkbox/radio** 16, ink when checked. **Switch** 32×18, ink track when on. **Slider/progress** ink on a pale track.
- **Tabs** underline: 14, selected 550 ink + 2px ink line; no fill. **PageTabs** same look as links (`aria-current="page"`).
- **Menus/popovers/selects** radius 8, ink 8% edge, `shadow-md`, items 32 with a 5% hover. **Tooltip** paper-90, radius 8, 12/18, max 260.
- **Dialog** radius 16, white, edge, `shadow-lg`, title-sm, backdrop ink 10%. **Sheet** flush (no radius), 480, `shadow-drawer`, header and footer ruled. **Command** 624, radius 16.
- **Table** header 40 label-md; rows 55 (compact 40); ink 8% rules; hover paper-04; selected tan.
- **Card / SectionCard** radius 12, ink 8%, no shadow, title-sm header at 16 inset. **ActionCard** white, edge, 32 round tinted icon.
- **Sidebar** flush 240, white, hairline; rows 28 radius 8, 14 secondary; selected ink 8% + 450 ink; rail 48.
- **Top bar** 48, white, hairline; search field 32 radius 8 with a faint lift; Ask ACE = reversed.
- **Page header** white band with tabs on its edge; title-md; optional 12/18 tertiary description; body below on `canvas`.
- **Figure strip** one card, cells split by hairlines; label 14 ink, value 22/28, delta as a tinted badge with arrow.
- **Segmented** recessed track (34, radius 8, paper-04), items 28 radius 6; selected = ink fill, white text.
- **FilterChip** a 32 secondary button; applied = tan fill + tan edge + check.
- **Chat** 720 column; assistant 14/20 plain; user bubble paper-04, radius 12, secondary text; reasoning line tertiary; result cards (tool, confirmation) bordered; composer radius 16, ink 8% edge, no shadow, focus = 2px action blue.
- **Workflow nodes** radius 12, edge, raised; 28 round icon by kind (blue trigger, iris AI, ember decision, neutral tool, green output); floating controls in popover style.

## Patterns (v0.3): which one, when

Apollo pages are full bleed: no max-width, the document never scrolls, regions scroll inside
fixed frames. Lark's layouts do the same from `md` up; on phones they grow and the shell scrolls.

| Situation | Use | Notes |
|---|---|---|
| A list of records to scan, filter, act on | `ListLayout` + `DataGrid` | Header band, strip/inset banners, 48 toolbar, 300 facet rail (a "Filters" disclosure on phones), grid fills the rest |
| One record, many facets | `RecordLayout` | White header band with `StageProgress`; canvas body, 360 aside of collapsible cards, segmented tabs in main |
| Look at a record without losing the list | `RecordPeek` | Sheet at 64vw (min 640), Expand to the full record |
| Create something with a few fields | `CreateDrawer` | 480 drawer, Cancel / Create; full page only for long forms |
| Admin / preferences | `SettingsLayout` | 220 `VerticalNav`; rule rows with a switch and a collapsible limit; danger zone last, behind an AlertDialog |
| Overview of work | `DashboardLayout` + `DashboardGrid` | main-side, halves or thirds |

**Cards.** `SectionCard` is the default container (title-sm header, optional action, tabs, footer,
collapsible with a summary while closed). `ActionCard` = a next step (one link or one button).
`TemplateCard` = a starting point in a band; category badge keeps a stable hue, AI is iris.
`ChecklistCard` = first-run setup, one primary button on the first open item. `ChoiceCard` = ACE
needs a decision: radio list, one Recommended, Continue disabled until chosen, locks after submit.
`PromoCard` = inline, dismissible, never a floating box over content. `EntityCard` in a hover card
previews a linked record. Only result cards and the checklist get `shadow-raised`.

**Banners.** `layout="strip"` runs edge to edge between header and toolbar for account-level
problems (sync paused, billing). `layout="inset"` notes something about this page. One line, one
inline link, dismiss on the right; `negative` is `role="alert"`.

**Empty, loading and error.** `StatePanel` covers first run (say what will appear and how), no
results (offer Clear filters), no permission (name who can grant it), error (say whether anything
was lost, Try again, show a request ID), offline (say what's kept). Loading placeholders take the
shape of the content (`SkeletonLines`, `SkeletonCard`, `SkeletonFigure`, grid skeleton rows).

**Dirty state.** Edited fields get a `DirtyMark` (ember dot + "Edited" for screen readers).
The header shows `SaveStatus` (Unsaved changes / Saving / Saved 2 min ago / Couldn't save + Retry).
`UnsavedChangesBar` sticks to the bottom while anything is unsaved; Discard asks inline before it
throws work away. `useLeaveGuard` warns on reload/close. `InlineEdit`: Enter or blur saves, Escape
cancels, validation errors are `role="alert"` and keep the field open.

**Menus.** `ActionMenu` sections, destructive items last and separated; disabled items stay
visible with a `disabledReason` tooltip. `SplitButton` = one main action with alternatives.
`SavedViewMenu` for list views, `FacetFilterMenu` for multi-select filters with counts (applies on
Apply), `ColumnsPanel` with Move up / Move down (keyboard reorder, not drag only).

**Tabs.** Links that change the URL are `PageTabs`. Panels that swap in place are `Tabs`:
`variant="underline"` under a header band, `variant="segmented"` for record sections. Filters
over the same content are `Segmented`, `CountSegments` or a `FacetList`.

**Data grid.** Header 40, rows 55 (compact 40), sticky header, sticky select / expand / record
columns, sort buttons with `aria-sort`, selection with a floating bulk bar (undo via toast),
expandable sub-rows, grouping with counts and aggregates, row tints (ai, caution, error, positive,
selected; dusk mixes them at 28%), sticky totals row, pager "1 – 25 of N", loading / empty / error
in the body. Cells: record, money, percent bar with limit marker, sparkline, segmented progress,
avatar stack, tags with +N, date, actions (primary + menu), and AI run cells.

**AI patterns (the part that makes Lark Lark).**
- `AiRunCell` + `AiColumnStatus`: AI as a column. Every cell has a visible state (Click to run,
  queued, running, done, failed + retry, skipped with a reason); the header shows done/failed of
  total and a run/pause control.
- `ConfidenceBadge`: confidence in words (High / Medium / Low) plus bars, never a bare percentage.
- `EvidencePopover`: "Why?" on any AI value, with source chips and quotes.
- `PlanReview`: ACE proposes steps; people reorder or remove them, risky steps say "Needs your OK";
  nothing runs until Approve and run.
- `RunSteps`: progress while running, collapsed to "2 of 4 steps", expandable.
- `ChangeReview` + `DiffValue`: AI or teammates propose changes; accept or reject each, Apply stays
  disabled until every change is reviewed, then an undo toast.

## Chat states (v0.4): `lark/chat`

Built from the ACE state library (deepgrids-ACE, 404 states). Live gallery: `/examples/chat-states`.
ACE's rules carry over: status is words coloured by tone (with an icon for warnings and stops);
one place to act, at most one primary; sources once, at the end, each opening in place; nothing
silently dropped.

| Moment | Component | States |
|---|---|---|
| Start | `ChatWelcome`, `ProactiveTask`, `Combobox` (deal picker), `StatePanel` (no history) | — |
| Recent | `ConversationListItem` | working, needs you, failed, paused, done, unread |
| Composer | `FileRow compact`, `ModeSwitch`, `QueuedFollowUps`, `ComposerNotice`, `ScreenSessionNotice` | uploading, reading, ready, failed, refused; policy ceiling; offline, rate limited, read-only, background |
| The person's message | `UserTurn`, `BranchSwitcher` | sending, sent, failed + retry, queued; edited branches |
| ACE working | `ThinkingRow`, `WorkLog` / `ToolCallRow`, `StreamingText` | queued, running, done, failed, needs your OK, skipped |
| Interrupted | `StoppedNotice`, `ReplyError` (full or `partial`), `Callout` (reconnected) | kept work listed; request ID |
| Evidence | `Cite`, `AnswerSources`, `ConflictCompare`, `InjectionNotice` | ok, out of date, newer version, can't open, deleted |
| Asking | `ClarifyQuestion`, `ChoiceCard`, `PlanReview` | open, answered, deferred; ask the owner in a channel |
| Approving | `ActionReview` | pending, approved, declined, expired, duplicate |
| Acting | `ActionReceipt`, `DraftCard` | queued → saving → saved → verifying → verified; uncertain (never auto-retry), mismatch, failed; draft, saved, sending, sent, failed; external recipients flagged |

Screen readers: thinking is a polite status; streaming text is `aria-busy` and announces once
when finished; failures are alerts only when caused by the person's action.

## Fields and inputs (v0.4)

`Combobox` (search over ~10+ options; disabled options stay visible with a reason),
`MultiCombobox` + `Tag`, `DatePicker` / `DateRangePicker` (dates written out, presets, one month
on phones), `NumberInput` (unit, arrows and Shift+arrows, clamped on blur, `aria-valuetext`
includes the unit), `FileDropzone` + `FileRow` (states above), `IconButton` (label = name =
tooltip), `CopyButton`, `ProgressRing` (always beside words), `TextLink`, `Callout`.

## Responsive rules (v0.4)

Beams pages are full bleed at every width; what changes is which regions get room.

| Width | Shell | List pages | Record / settings | Header |
|---|---|---|---|---|
| < 768 | Sidebar is a sheet; search is an icon | Page scrolls; filters are a disclosure | Settings nav is a disclosure; aside stacks | Actions wrap below the title |
| 768–1023 | 48px icon rail | Grid full width; filters a disclosure | Aside stacks under the header | By container |
| 1024–1279 | 48px icon rail | 260px filter rail | Aside stacks (before or after main), so tables keep their width | By container |
| ≥ 1280 | 240px sidebar (can collapse) | 300px filter rail | 360px aside | By container |

Fixed Beams sizes stay fixed (32px controls, 55px rows, 14px body); Lark doesn't scale type with
the viewport. Touch devices get 16px input text (no iOS zoom) and 44px hit areas; every pointer
gets at least 24px (WCAG 2.5.8).

## Built for CPQ (v0.4): `lark/cpq`

Lark exists for configure, price, quote, approve and order. Live example: `/examples/quote`
(Northwind renewal, quote R4, with ACE beside it).

| Job | Component | What it guarantees |
|---|---|---|
| Know where a number came from | `SourceLine`, `ServiceLogo` | Logo + service + record + freshness under every figure and table; stale sources say so with a clock |
| See the deal at a glance | `DealFigures`, `CountUp` | 3–4 exact figures (never "$1M"), a verdict in words, a source each; figures count up once |
| Know where the deal is | `CpqStages` | Configure → Price and quote → Approve → Order, with what's happening in each |
| Read and edit the quote | `QuoteLines`, `DiscountMeter` | Real table grouped by family; list, discount against the drawn policy limit, net; proposed changes as old → new with who proposed them; validating, locked (protected price) and error lines say why; totals and effective discount in the footer |
| Explain the price | `PriceWaterfall` | List to net, one adjustment per row with its source; bars grow in; amounts in text |
| Check policy | `PolicyChecks` | Each rule, the result in words, who must approve, the rule's source |
| Route approvals | `ApprovalRoute`, `ActionReview`, `BlockedReason` | Steps in order, parallel reviewers side by side, why each is needed, where they decide (Slack, Outlook, Teams logo), conditions, out-of-office cover; self-approval explained |
| Choose an option | `ScenarioCompare` | Options read across: net, year-one cash, discount, approvals, policy; deltas say if they're better |
| Bill correctly | `InvoiceSchedule` | Periods, due dates, ramp and one-time rows; says whether it balances with the contract value and by how much it's off |
| Execute the order | `OrderMatch`, `ActionReceipt` | Accepted quote vs received PO field by field, ≠ on differences with how to resolve; order creation waits and says why |

Money is `formatMoney` everywhere: the deal's currency, tabular figures, a real minus sign (−),
no silent rounding. Logos are the services' own marks (from deepgrids-ACE, `design/logos/`),
always beside the service's name, never as decoration; unknown services get a neutral two-letter
mark. The ACE mark is ACE's real logo (`AceMark`), iris for AI.

### Cinematography

From deepgrids-ACE: the ACE mark spins while ACE works (`motion="spin"`) and settles when an
answer lands (`"settle"`); an answer's zones rise in 70ms apart (`.lark-render-in`), items inside
a zone a beat later (`.lark-stagger`); figures count up (`CountUp`); bars grow from their start
(`.lark-bar-grow`); one arriving card pops in (`.lark-pop-in`). Under prefers-reduced-motion
everything is still and final values show at once.

## v0.5: for the Deepgrids workspace

New in 0.5 (gap list G1–G11). Live examples: `/examples/patterns` ("Page leads", "Steps,
transcripts and graphs", "Shell, identity and figures").

| Component | Use it when |
|---|---|
| `ThemeScript` / `useTheme` / `ThemeToggle` `storageKey`, `attribute` | The app already stores a theme under its own key or keys its CSS off `data-theme` (use `"both"` so Lark's `.dark` tokens still apply). |
| `UserMenu` + `UserMenuSection`, `UserMenuItem`, `UserMenuSub`, `UserMenuRadioGroup` | The avatar menu: the person and role, profile, workspace switcher, working role and theme as radio groups, help. |
| `AppSidebar` `scope`, `footerItems`; `NavGroup` `collapsible`; `NavItem` `badge`; `ScopePill` | The sidebar says which data it shows (example data, sandbox), groups collapse, counts mark what's waiting. |
| `HeroBand` | A home or role page opens: one tinted band, title, one line, one or two actions (one brand at most), an illustration. Once per page; never sticky. |
| `IllustratedChoiceCard` | An entry page offers a few big choices (the roles): each card is one link with an illustration; the current one is marked. |
| `Figure` / `FigureCard` `icon`, `caption`, `href` | A home's next steps as numbers that link to the list behind them ("Quotes to work on 36 · Continue a draft"). |
| `ServiceLogo` (Snowflake, MCP, email; `src`) | Naming a connected source, always beside its name; `src` for a mark only the app has. |
| `StepList` | Steps in order with state: setup, onboarding, a check's stages. Not for navigation (that's `PageTabs`) or running AI work (`RunSteps`). |
| `GraphNode`, `GraphEdgeLabel`, `graph.css` (`@deepgrids/lark/graph`) | Records and their relationships on a React Flow canvas (the ontology graph). Workflow canvases keep `/ai`'s `Node`. |
| `Transcript` / `TranscriptLine` | What was said: a meeting transcript or a deal room's chat lines, with speaker, time and Commitment / Risk / Question flags. Not for ACE conversations (`lark/chat`). |

Tones for bands, choice cards and graph tiles are `sky`, `sand`, `evergreen`, `ember`, `iris`
(`--tint-<tone>` and `--tint-<tone>-strong`). Iris still means AI: don't use it for a role or
category that isn't ACE's.
