# Lark: Beams structure, the lark's palette

Since 2026-11-05 Lark follows Apollo's **Beams** design system for structure, and keeps
the lark for identity. This replaces `RECONCILIATION.md` (the Material 3 version).
Source measurements: Claude project doc `lark-beams-extraction.md`.

> **v0.7:** "Rules (v0.7)" at the end of this file sits on top of v0.6: the type ladder, the
> 12px rule, surfaces, spacing and narrow behaviour. Where they disagree, v0.7 wins.
>
> **v0.6:** "One system (v0.6)" at the end of this file is the current rule set. Where an
> earlier section disagrees (canvas, title weights, segmented, icon tiles, card actions,
> shadows), v0.6 wins; those rows below are updated.

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
| `canvas` | paper-04 (v0.6; was sand-50) | dusk-100 | dashboard and record bodies (cards sit on it) |
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
| `title-md` | 24/32 400, −0.015em (v0.6) | 20/28 | page titles, metric values |
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
- **Card / SectionCard** radius 12, `border-edge` (4%) on the stone canvas, no shadow, title-sm header at 16 inset. Every module on a page grid is one; the last card in each column grows so columns end on one line. **ActionCard** white, edge, 32 square tinted tile, action under the text (v0.6).
- **Sidebar** flush 240, white, hairline; rows 28 radius 8, 14 secondary; selected ink 8% + 450 ink; rail 48.
- **Top bar** 48, white, hairline; search field 32 radius 8 with a faint lift; Ask ACE = reversed.
- **Page header** white band with tabs on its edge; title-md; optional 14/20 secondary description (v0.6); no eyebrow; body below on `canvas`.
- **Figure strip** one card, cells split by hairlines; label 14 ink, value 24/32 400, delta as a tinted badge with arrow.
- **Segmented** recessed track (34, radius 8, paper-04), items 28 radius 6; selected = white segment, hairline, ink text (v0.6; was ink fill).
- **FilterChip** a 32 secondary button; applied = tan fill + tan edge + check.
- **Chat** 760 column; your words in a sky bubble and ACE's in stone blocks, both radius 24, 16/24 text; claims iris-tinted; sources iris-tinted cards; composer radius 16, ink 8% edge, no shadow, focus = 2px action blue.
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
previews a linked record. No resting shadows (v0.6): only overlays have one.

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

Tones for bands, choice cards and graph tiles are `sky`, `coral` (v0.6), `evergreen`, `ember`, `iris` (`sand` is legacy)
(`--tint-<tone>` and `--tint-<tone>-strong`). Iris still means AI: don't use it for a role or
category that isn't ACE's.

## v0.6: shapes from Cohere's product UI, cited answers (unreleased)

Live examples: `/examples/patterns` ("Trays, contained fields and provisional marks") and
`/examples/chat-states` ("Cited answer for an approver"). Taken from Cohere's product UI and
fitted to Lark: sentence case, 12px floor, meaning never by colour or line style alone.
`/examples/dashboard` uses most of it. The rules that tie it together are in "One system (v0.6)"
below. Not taken:
the slash cut on buttons and toggles, mono all-caps labels, dot-only active nav.

| Component | Use it when |
|---|---|
| `Tray` + `TrayCard` | Several related cards belong together inside one surface: an answer, a drawer, a chat panel. Stone tray, 24px corners (`rounded-2xl`, trays only), 12px padding, 12px cards: inner radius = outer − padding. Flat. Not for one card, and **never a page module**: on a page grid every module is a `SectionCard` (one radius, one edge), so a 24px tray never sits beside 12px cards. Lanes on a page are `ApprovalChain layout="lanes"` inside a flush SectionCard. |
| `SectionCard` `variant="strip"` | Stacked sections of one record that must read as separate parts. Title in a 40px stone band. Never tan (tan means selected). |
| `CardStatusFooter` | A card's one action on the left and its state (a `StatusBadge`) on the right. |
| `ContainedField` / `ContainedInput` / `ContainedTextarea` (`/ui`) | Labelled form fields. Label inside the box, whole box is the target, one focus ring around the box. `error` tints the box and links the message; `disabledReason` disables and says why; `suffix` for units. Bare `Input` stays for toolbars, filters and cells. Use one style per form. |
| `ProvisionalBadge` (`proposed`, `unsaved`, `ai`), `provisionalEdge` | Anything not committed: previews, AI-filled values. Dashed edge plus the word, always. |
| `CompoundTag` | A value and its qualifier in one pill ("Discount \| 92%"); reads "Discount, 92% confidence". |
| `Freshness`, `Figure` `updated`, `useNow` | Every computed number says when it was computed; past `staleAfter` minutes it says "may be out of date" with a clock. |
| `BestFor`, `Choice.bestFor`, `Scenario.bestFor` / `provisional` | Options people pick by fit. Unsaved previews say "Not saved". |
| `ApprovalMatrix` | Who approves what: each row (a band, a term) picks one approver. Native radios per row; the chosen cell is tan and names the approver; edited rows say "Changed". |
| `Claim` | Every figure or decision-relevant fact in an answer. Iris highlight + underline + source number; the whole claim is one button that opens the excerpt. A number with no Claim has no source. Numbers come from the pricing engine, never the model. |
| `AssistantTurn` `agent`, `lead` | Name ACE with an "AI" badge and the time; one line saying what ACE checked. Never "Here's what I found". |
| `AnswerSources` `collapsible` | Sources closed under the answer in a stone panel, so the answer reads first. |
| `SplitButton` `size`, `disabled` | Main action plus a menu of real alternatives, straight 2px seam, group named by the action. Not for a decorative "+" or "→". |

## One system (v0.6)

One set of rules for every component. Where Apollo/Beams, Cohere and earlier Lark disagree,
this section decides. Live: `/examples/patterns#system`.

### What comes from where

| Kept from | What |
|---|---|
| Lark | The palette's jobs: sky acts (brand button, links, focus), iris is AI, tan is selected data, dusk is dark mode, status hues are status. Hanken Grotesk and Geist Mono. Sentence case. WCAG 2.2 AA everywhere. |
| Apollo / Beams | Density (32px controls, 12px cards, ink-alpha hairlines), tables, lists, filters, status badges, the page layouts. |
| Cohere / North | Card anatomy; regular-weight display titles; colour in tiles and washes, not chrome; flat surfaces; trays and header strips; contained fields; white-on-grey segmented control; meta in the footer; versions in mono chips; service stacks; provisional and freshness marks; cited answers. |
| Dropped | Sand as a surface (cream canvas, sand bands as the default warm tone): it reads as generated. Eyebrows above page titles. Text buttons and links in card headers. Round tinted tiles for objects. Black-filled segmented items. Resting shadows on cards. Cohere's slash cut and mono all-caps labels. |

### Surfaces and colour
- Canvas `paper-08` (`#f5f4f2`, v0.6.1; was `paper-04`); cards and the header band white; trays, ACE's blocks and insets stone (`surface-container`). Dusk unchanged. Flat: shadows only on overlays (menus, dialogs, popovers, floating bars).
- **Elevation is a change of fill, not a line (v0.6.1, Cohere).** One step per level: stone canvas → white card → stone inset → white card inside it. A boundary gets one cue:
  - The edge of a card on the canvas is `border-edge` (4% ink): a whisper; the fill does the work.
  - Inside a surface, nested blocks (notes, insets, ACE's blocks, white cards in an answer) have **no edge**, only their fill. Callouts are tinted fills with no edge; the icon and title carry the meaning.
  - Dividers inside a surface (rows, columns, header and footer rules) are `outline-variant`.
  - Lines that carry meaning stay: controls' 3:1 edges (inputs, checkboxes, secondary buttons), focus rings, the selected edge, a conflict's amber ring, dashed provisional edges.
- Colour has one job each and appears as small, deliberate areas: the brand button, iris for anything ACE did, tan for what's selected, status hues on badges, solid identity tiles (`IconChip variant="solid"`), and at most one wash per page (`HeroBand` / band tones).
- Warm comes from **coral** (`--lark-coral-50`, Cohere's coral darkened to 3:1 on white): the second chart colour and the `coral` wash (`bg-tint-coral`). Coral never means status. `sand` stays as a tone for compatibility; don't start new work with it. Tan stays only as "selected".
- Charts: cobalt, coral, teal, plum, amber (`--chart-1…5`, `viz-*` and `coral-50` primitives), in
  that order; every mark reaches 3:1 on white; lighter versions in dusk. Decreases are coral,
  increases teal, totals cobalt. Never status colours for data.

### Type
| Role | Token | Use |
|---|---|---|
| Figure | `text-display-sm` 40/48 **400**, −2.5% (v0.6.1) | Headline numbers (Figure "lg"), chart readouts. `text-display-md` 56/64 for a single hero number |
| Page title | `text-title-lg` 30/36 **400**, −2% (v0.6.1; 24 on phones) | The h1, hero bands |
| Section title | `text-title-md` 24/32 **400**, −1.5% | Groups of cards; answer headlines; Figure "md" |
| Card title | `text-title-sm` 16/24 450 | SectionCard, ObjectCard, drawers |
| Card title / control | `text-label-lg` 14/20 450 | ActionCard, TrayCard, buttons |
| Body | `text-sm` 14/20 | Descriptions under page titles, card descriptions |
| Meta | `text-body-sm` 12/18, `on-surface-variant` | Bylines, counts, freshness |
| IDs, versions, code | Geist Mono | `OPP-20431`, `v2.0.2` (in a chip) |

Size carries hierarchy at the top; weight carries it in dense parts. Never bold (no 600+), never all caps.

**Large numbers (v0.6.1).** Like Cohere, set the numbers people decide on large and the words around them small: a 14px label, a 40px value, a 12px caption. A Figure is display-size when its box has room (14rem); in a `FigureStrip` every value takes one size, display once each column is 16rem. Headline values are short (`$1.84M`); the exact amount goes in the caption. Conversation text (yours and ACE's words) is 16/24; data inside answers stays 14/20.

### Headers
- **Page header:** optional `back` link ("← Back to deals") · title + one badge (lifecycle "Beta" outlined, or a StatusBadge) · description (one or two lines, 14/20 secondary) · meta line · text actions on the right (the only header with text buttons; one brand button at most) · PageTabs on its edge. No eyebrow: the shell's breadcrumb says where you are.
- **Section and card headers:** title · optional description · on the right, **controls only**: an icon button or menu, or a segmented control or filter that changes the card's content. A text action goes in the footer; "see more" is `link` (footer, with an arrow).
- **Trays:** same rule (`footer`, `link`).

### Card anatomy
Every card is some subset of this, in this order:

    identity (tile, logo, avatar or service stack) · title + badge · byline ...... icon controls
    description (two lines, clamped on browse cards)
    body (facts, a table, a chart)
    footer: facts or one action on the left .......................... state or link on the right

- `ObjectCard` is the browse card (agents, automations, templates, views, integrations); `ActionCard` is a thing to do (its action sits in the footer); `SectionCard` holds a part of a page; `TrayCard` sits in a Tray.
- One destination → the whole card is the link (title link stretched); other controls sit above it as their own tab stops.
- Identity tiles are square (6/8/10 corners at 24/32/40); people are round avatars. Tinted tiles for actions and figures, solid for an object's kind.

### Controls
- Segmented control and segmented tabs: grey track, the selected item a white segment with a hairline and ink text.
- Buttons: brand (sky) once per view, secondary, ghost, AI (iris); split button only with real alternatives.
- Fields: contained fields for labelled forms; bare inputs in toolbars, filters and cells.
- Navigation location is neutral (grey fill, ink, 450); tan is for selected data, not where you are.

### Alignment and rows
- **Top-aligned.** Rows align to their first line: a label beside a two-line value sits level with
  the value's first line, radios and icons with the first line of their text, arrows with the
  titles they connect. Buttons in a footer align to the bottom (the prompt's last line). Centre only
  things that are one line on both sides.
- **Cards in a row share one height.** Grids of cards stretch (no `items-start`); a card's footer
  is pushed to the bottom (`mt-auto`). Stacks of cards go in a column wrapper so columns can differ.

### Marks
- Lifecycle: outlined neutral badge after the title ("Beta", "Alpha"). Status: StatusBadge with icon and word.
- Not committed yet: ProvisionalBadge (dashed edge plus word). Computed numbers: Freshness.
- Counts and versions: `ObjectFact` (icon + number, mono chip), spoken with their noun.

## Chat and answers (v0.6)

ACE answers with inline widgets, not walls of text. Live: `/examples/chat` (full page),
`/examples/chat-panel` (docked beside a record), `/examples/widgets` (every widget),
`/examples/chat-states` (every state a turn can be in).

### The thread
- **You** on the right in a sky bubble (radius 24) with your name and the time inside it; **ACE** on
  the left in stone blocks (radius 24, no edge). Cohere's shapes; Lark keeps the two voices on
  opposite sides. Sky is the person's colour (sky acts); iris marks what ACE claims.
- An ACE turn is a stack of blocks, 8px apart: the first block holds the header (mark, "ACE", an
  AI badge, time), `process` (`Reasoning` and `WorkLog`, closed, the same trigger shape: icon,
  words, chevron) and `lead`, ACE's words at 16/24. Then the answer (`AnswerView`, a block of white
  cards), more `TurnBlock`s for prose, `AnswerSources` (a block of iris-tinted source cards), then
  `TurnActions` and `SuggestionChips`. ACE's words never float outside a block.
- Every figure an approver acts on is a `Claim` (iris highlight, opens its source) or sits in a
  widget whose sources are listed. Numbers come from the pricing engine, never the model.
- `ChatComposer`: one surface (radius 16 like dialogs, no shadow, 8px buttons); attach, sources, mode (Guide, Prepare, Execute; modes above
  the organization's ceiling stay visible and disabled), send. Enter sends, Shift+Enter is a new
  line; Stop replaces Send while ACE replies. One line under it: "ACE can make mistakes."
- `ChatLayout` (full page, 760 column, composer docked) and `ChatPanel` (420 beside a page, with
  what ACE is working on, new chat, open full page, close; a sheet under `lg`).

### The answer (`AnswerView`)
A stone surface (radius 24, `surface-container`) holding white widget cards:
header (record tag, headline, subtitle, lead) · key figures · body (stack, split or bento; or
tabs) · notices · **Next step** tray · sources (closed). It lays out by its own width (container
queries), so one answer works in the full page and the panel: bento and split collapse under
~42rem.

Rules: information is neutral (white cards, radius 12, on the 24-radius surface with 12 padding);
what the person can do is an `ActionTray`: no box of its own, state and prompt left, buttons right
(bottom-aligned), one brand button; inside a card it is the footer under a hairline, at the end of
an answer it sits in a white card, and it only appears when there is something to do. "Send via
Slack" shows Sending, then Sent. Status is words in their tone with an icon; warnings are ringed
callouts across the full row; detail opens in place; charts get tooltips, a legend for two or more
series, a readout (a Figure) for the chosen point and View data.

**Widgets are compositions of Lark components, not restyled copies:** key figures and readouts
are `Figure` / `FigureStrip`; properties are `DescriptionList`; lists are `List` + `ListItem`
(`wrap`); steps are `StepList`; flow nodes and tiles are `ActionCard`; questions are
`ClarifyQuestion`; links are `TextLink`; point pickers are `Segmented`; notes are `Callout`; fields
are contained fields; buttons are `Button` (radius 8, never round). Type uses Lark's roles only.

### Widgets (one per kind of information, from the ACE state library)
The 404 ACE states (~4,000 widgets) all render through `AnswerView` with no errors and no axe
violations (checked Nov 6, 2026).

| Family | Types |
|---|---|
| Figures and facts | `stats` (hero, row, cards), `properties` (list or figures; editable values), `compare` (→, vs, ≠ conflict) |
| Lists and records | `list` (selectable, ordered), `table` (selectable rows open detail in place), `master`, `links`, `tiles` |
| Choices and input | `options` (radio cards; `variant` switches the answer), `question` (ask someone via a service), `form` (contained fields) |
| Charts and time | `chart` (bar, stacked, grouped, line, step, area, segments, waterfall, range), `bars`, `waterfall`, `timeline` |
| Process | `steps`, `flow` |
| Messages | `draft` (Outlook or Slack; editable, thread, Send via), `message`, `quote`, `text` |
| Structure | `note`, `disclosure`, `group`, `media` |
| Acting | `ActionTray` (answer's next step, or a section's `actions`) |

Each type is also its own component (`StatsWidget`, `CompareWidget`, `ChartWidget`, …) for use
outside an answer, inside `AnswerSurface`.

## Rules (v0.7)

Seven rules, checked where a machine can check them.

1. **One job per module.** Write the question before building it ("Who still has to approve,
   and what's blocking?"). The title says it. Content that doesn't serve it moves or goes.
2. **Type ladder.** Page 30 (`text-title-lg`) → module 20 (`text-title-module`, set by
   `--module-title-size`; 18 is the alternative) → item 16 (`text-title-sm`) → body 14
   (`text-body-md`) → meta 12 (`text-meta`, `text-meta-strong`). **12px is metadata only**:
   timestamps, counts in chips, table meta and column heads, captions and legends, footnotes,
   sources, eyebrows, menu group labels, initials. `npm run lint:lark` (`npx lark-lint src` in
   an app) fails a raw 12px class and a 12px sentence; a `<p>` at 12px declares what it is with
   `data-meta="caption|footnote|source|timestamp|…"`.
3. **Surfaces.** Canvas (linen-98) → module (white, 11% ink edge, radius 16) → inset (linen-95)
   → item. The steps are Cohere's (sampled from North): gentle, with the module's edge doing
   part of the work, and a faint sand cast rather than pure grey. Dusk: dusk-100 → dusk-300 →
   dusk-400. Tinted modules: `feature` (iris = AI, sky = a decision) and `status` (always with
   its icon, the title says the status). Never more than three levels in a module.
4. **Room.** Module padding and page gaps 24 (`p-module`, `gap-module-gap`), 16 under 640px or
   inside a module under 30rem; 16 between items (`gap-item`); rows 12 (`p-row`). Compact
   density is for data tables only.
5. **Narrow behaviour, by the component's own width** (container queries, not the viewport):
   truncate or clamp with the full text one hover or Tab away (`TruncateText`, `ClampText`);
   stack (DescriptionList under 22rem, ApprovalPath under 48rem); switch to a list (ChatWelcome
   under 28rem). Tabs and segmented controls never wrap or scroll: overflow goes to "More" and
   the current item stays. Names and numbers never break mid-word (`NoBreak`). Every component
   is checked at 280, 360, 480, 720 and 1080 (`/examples/width-matrix`, `npm run test:e2e`).
6. **Provenance once** per module or page (an "Example data" badge, a `SourceLine`), never per
   row.
7. **Colour by job.** Sky = the primary action (Ask ACE included), iris = AI, tan = selected
   data only, status hues = status, coral = chart taxonomy. Party colours in ActivityFeed are
   tags (teal customer, pink seller, olive internal, neutral system; never sky, which means "act") and always come
   with the word.

