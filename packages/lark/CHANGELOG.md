# Changelog

All notable changes to Lark (`@josephholzman/lark`, imported as `@deepgrids/lark`). Versions follow semver; until 1.0, minor versions may
change component APIs (each is listed here).

## Unreleased

### The convention review of the components that predate 0.8

**Changed**

- **`DataGrid`** takes `getRowLabel` (each row's checkbox and details toggle is named
  "Select <label>" / "Show details for <label>"), controlled `sorting` + `onSortingChange`, and
  `trailingHeader` for an "Add column" control in the last header cell. The scroll region has
  `scroll-padding` so a focused row is not hidden under the sticky header.
- **`PageHeader`** no longer renders `eyebrow` above the title (a title has no eyebrow, §1/§5);
  the prop is kept and its value moves into the meta line. **`HeroBand`** shows `eyebrow` as a
  badge beside the title.
- **`ActionCard`** pins its one action to the card's footer (and keeps `h-full`), so actions line
  up across a row. **`ObjectCard`**'s star is named "Star/Unstar <title>" and has a tooltip;
  its description and the EntityCard's name and facts show their full text when cut.
- **`SectionCard`** titles clamp to two lines with the full title one hover or Tab away;
  checklist and tray titles use the module/item steps.
- **`UnsavedChangesBar`** keeps Save focusable while a save is in flight (`aria-disabled` plus a
  guard) instead of disabling it and dropping keyboard focus.
- **`ChangeReview`** names Accept, Reject and Undo with the field they change; **`Banner`** takes
  `dismissLabel`; **`TurnActions`** takes the answer's `context`; **`AiRunCell`** takes
  `itemLabel`; **`EvidencePopover`** takes `context`; **`RecordCell`** takes `linkLabel`.
- **`AppSidebar`** takes `workspaces` instead of hard-coding "Northwind sandbox"; **`SavedViewMenu`**
  uses pressed filters rather than tabs without panels; **`FacetList`** and **`CountSegments`**
  answer arrow keys with a roving tab index; **`FacetFilterMenu`** names its checkboxes.
- **`ProactiveTask`**'s action names its task; the chat controls were checked.
- Timelines, activity lines, notifications and compared versions carry the exact timestamp on
  hover; an activity row clears its sticky day heading on focus.

### The card anatomy review of the 0.8 components

**Changed**

- **`AgentTaskCard` / `AgentTaskRow` / `AgentTaskGrid`** follow the card anatomy: 32px identity, a
  16px title with its "<who> · <when>" byline and a "More actions for <title>" menu, a full-width
  two-line description, and a pinned footer with one action on the left and the `StatusBadge` on
  the right. A running task shows a `progressbar` with its step in words ("Step 2 of 4 ·
  Drafting the margin table") and a sky fill; a queued task shows "Starts when …". `menu`
  (`MenuSection[]`) replaces the hover `actions`, and `context` is now an alias of `description`.
  Rows clamp the title to two lines.
- **`TabsList`** folds into More by default; it never scrolls sideways. The fold is measured on
  the list's frame, so a `w-fit` tab bar inside a narrow card folds instead of clipping. The
  More trigger is a sibling of the tablist, not a child (a tablist may hold only tabs).
- **`CompanyLogo`** falls back to initials when the image failed before hydration (a 404 no
  `onError` could catch).
- **`StatePanel`** `compact` is text-only and left-aligned (a sheet or card is a small container);
  `NotificationsPanel` empty states use it, and an unread signal says "Unread" in words (it was a
  dot with the word only for screen readers).
- **`ListItem`** trailing controls stay at the row's end when the row wraps under 12rem.
- **`NumberInput`** right-aligns its quantity; **`MasterDetail`** panes are named, focusable
  regions.
- **`ChatWelcome`** no longer renders `eyebrow` (Lark has no eyebrow above a title); the prop is
  kept so 0.8 callers compile.
- **`VersionCompare`** change words are body size, not meta; **`ImpactPreview`** says "Needs
  attention" in visible words for a warning.
- **`PromoCard`** shows its media by the card's own width, not the viewport; `DecisionPanel`'s
  fact aside has no edge inside its sky module.

## 0.8.0 (2026-11-07)

The Deepgrids redesign's second half: record patterns, agent work and decisions, and a
machine-checked width matrix for every exported component.

**New components**

- **`Illustration`** (`lark/illustration`): a picture that reserves its box (48, 96, 140, 200 or
  `wide`), decorative by default, with a `brief` kept for authors. The same `illustration` slot on
  `StatePanel`, `ChatWelcome`, `Banner`, `PromoCard` and `SectionCard`. `CompanyLogo` falls back
  to initials when its image is missing or fails. `NumberInput` gains `commit="change"` and named
  steppers; `TabsList overflow="menu"` moves items that don't fit into a More menu.
- **`FactGrid`**: record facts as a `dl`; auto columns 1 → 2 → 3 → 4 at 24, 40 and 56rem of its
  own width, with hints, links, copy buttons and "Not set" in words.
- **`MasterDetail`**: 22rem list and a detail pane from 48rem of its own width; below, one pane
  with "Back to <listLabel>", focus moving to the detail heading and back to the row.
- **`RecordDrawer`**: a record over the page at 32, 44 or 60rem, full screen under 640, with
  overflow tabs, a scrolling body, a footer and focus returned to its opener.
- **`NotificationsPanel`**: deal signals in a sheet, grouped by day, with kind icons, unread
  words, a Segmented filter with counts and an illustrated empty state.
- **`AgentTaskCard` / `AgentTaskRow` / `AgentTaskGrid`**: one agent task (agent, title, state,
  context, one action, hover actions, a meter while running); the grid is 2-up from 36rem of its
  own width, 3-up from 60rem, and a list of rows below 36rem.
- **`DecisionPanel`**: a sky feature module for the decision a reader makes: options with
  consequences and disabled reasons, an optional required note, a sticky action row, facts beside
  the options from 40rem, and the result announced through `SaveStatus`.
- **`VersionCompare`**: two version headers and before/after rows; the change is an icon and a
  word, two columns from 40rem and before-then-after per row below, with an "Only changes" switch.
- **`ImpactPreview`**: a sentence summary and compact from → to rows with a tone icon and a
  spoken word; label and change sit side by side from 28rem.

**Fixes found by the component matrix**

- Every interactive target is at least 24×24: `TagsCell`'s "+N", `RecordCell`'s name, the page
  back link, breadcrumb links, `Claim` and `ScopePill` use `hit-area`/`min-h-6`; the Sidebar rail
  is 24px wide.
- **`SplitView` panes** are named, focusable regions (`listLabel`, `detailLabel`); `AppShell`'s
  `<main>` is focusable so a scrolling page with nothing focusable in it can still be scrolled by
  keyboard; `TableWidget` gives its scroll region a name and a tab stop.
- **`DealFigures` and `PriceWaterfall`** lay out by their own width (one column and a stacked
  waterfall row when narrow) instead of two columns/three tracks from the viewport.
- **`ChangeReview`** moves to a container query for its three-column row.
- **`Topbar`** hides breadcrumbs and collapses search to an icon by its own width, not the
  window's; `PageTabs` gains `data-slot="page-tabs"`.

**Visual and API changes worth knowing**

- `NativeSelect` puts `className` on the `<select>`; use `wrapperClassName` for the wrapper.
- `AppShell` wraps its children in `<main>` (top bars are banners again); `SplitView` panes are
  `role="region"` and take `listLabel`/`detailLabel`; `TableWidget`'s table wrapper is a named
  focusable region.

**Examples and checks**

- `/examples/components`: every exported product component, grouped by file, searchable, with
  realistic long content in frames at 280, 360, 480, 720 and 1080px. `tests/e2e/components.spec.ts`
  checks overflow, one-line tabs and segmented controls, 24px targets and axe with contrast in
  light and dusk; `tests/components-catalog.test.tsx` fails when an export has no sample.

## 0.7.0 (2026-11-07)

The redesign rules (one job per module, a real type ladder, three surfaces, room, narrow
behaviour) in the library first: foundations, a re-audit of the components, and the first
two patterns rebuilt on them.

**New patterns**

- **`ApprovalPath`** (`lark/approvals`), replacing `ApprovalRoute` for new work. One job: "who
  still has to approve, and what's blocking?". The answer first, in words
  (`summarizeApprovals`: "2 of 6 approved · waiting on Pricing, Finance and Legal", or
  "Blocked: Finance returned it · 2 of 6 approved"); a segmented progress bar; stages as a
  horizontal track with connectors from 48rem of its own width, a vertical stepper below that;
  parallel approvers stacked in an inset inside their stage; each approver a compact row
  (avatar, name, role, StatusBadge) whose reason, note, channel and time open in place
  (`aria-expanded`). Restricted approvers (`restricted: true`) show the role and decision, not
  the person. `ApprovalPathSkeleton` for loading.
- **`ActivityFeed`** (`lark/activity`): entries coded by party (customer, seller, internal,
  system) with a mark, a colour and the word; the message as a quote; one meta line (time,
  reference); grouped by day ("Today", "Yesterday", dates); Segmented filters with counts;
  "Show older" after `initialCount`; provenance said once at the top; `ActivityFeedSkeleton`.
- **`SituationSummary`**: the lead band above a feed or a record: status in words, the problem
  in one line, the next step, one action. Lays out by its own width.
- Examples `/examples/approvals` and `/examples/deal-activity` with a state switcher (default,
  loading, empty, error, missing fields, long names and big numbers, conflicting sources,
  permission-limited, many rows) and a 420px side-panel width; `?state=…&width=panel` opens one
  directly. Playwright runs axe and an overflow check on every state at both widths.

**Fixes**

- `cn()` (tailwind-merge) now knows `text-meta`, `text-meta-strong`, `text-title-module` and
  the display sizes as font sizes. Without it, `cn("text-meta", "text-on-surface-variant")`
  dropped the size and the text fell back to 16px.
- `useOverflow` shows every item when its container isn't laid out (hidden panels, tests).

**Foundations**

- **Type ladder:** page 30 → module 20 (`text-title-module`; 18 previewable, open decision) →
  item 16 (`text-title-sm`) → body 14 → meta 12. **12px is metadata only:** new `text-meta` and
  `text-meta-strong`; the raw 12px classes (`text-xs`, `text-body-sm`, `text-label-md`,
  `text-subtext`) are gone from Lark's components and examples. Of 248 uses, 140 were metadata
  (now `text-meta`) and 108 were sentences, labels or legends (now 14px).
- **`lark-lint`** (`npx lark-lint src`, also `npm run lint:lark`, part of `verify`): fails a raw
  12px class, and `text-meta` on a sentence (a `<p>`, `<li>`, `<label>`, `<legend>` or
  `<blockquote>` without `data-meta`, or a description, help, detail, note, reason, message).
- **Surfaces (after Cohere's North UI, sampled from product screenshots):** new `--module`,
  `--inset` and `--edge` roles (`bg-module`, `bg-inset`, `border-edge`). Light uses Cohere's
  lightness steps with a faint sand cast (new `linen` steps, OKLCH chroma .0045): canvas
  linen-98 #fbfaf7 → module white with an 11% ink hairline → inset linen-95 #f3f2ef; the light
  surface-container ramp moves to linen too (stone-150 insets read as sand and too strong). Dusk:
  dusk-100 → dusk-300 (modules were dusk-200, barely off the canvas) → dusk-400. Groups and trays
  inside modules use `bg-inset`. Tested for separation and 4.5:1 text on every step.
- **Spacing tokens:** `p-module` / `gap-module-gap` (24, 16 under 640px or inside a module under
  30rem), `gap-item` (16), `p-row` (12); `rounded-module` (16; 12 previewable, open decision).
  Page layouts use 24px gaps; list rows have 12px padding.
- **SectionCard:** 24px padding, module title, `variant="feature"` (`tone` iris or sky) and
  `variant="status"` (`tone` warning, error, success, info; always an icon tile, title says the
  status), optional `icon` tile; title clamps at 2 lines. `ui/Card` uses the same module tokens.
- **Narrow behaviour:** `TruncateText`, `ClampText` (full text in a focusable tooltip when cut)
  and `NoBreak`. `PageTabs` and `Segmented` never wrap or scroll: overflow goes to a "More" menu
  and the current item stays visible (`useOverflow`, `splitOverflow`). `Segmented` options take a
  `count`. `DescriptionList` inline pairs stack under 22rem; `ListItem` trailing content wraps
  below the row under 12rem; `ChatWelcome` tasks are rows of a list under 28rem (container, not
  viewport); `ApprovalChain` lanes stack under 13rem each; `Figure` values never break mid-number.
- **Colour jobs:** `AskAceButton` is sky (primary), not reversed.
- Item titles at 16: Callout, TimelineItem, StepList, ActionCard, ListItem. Dialog and Sheet
  titles at the module step. DescriptionList terms 14px.
- Examples: `/examples/foundations` (ladder, surfaces, variants, the two open decisions side by
  side) and `/examples/width-matrix` (280–1080). Playwright: `npm run test:e2e` runs the width
  matrix (no overflow, no wrapping, screenshots per width) and axe with colour contrast on every
  example page in light, dusk and at 390px.

## 0.6.0 (2026-11-07)

Shapes from Cohere's product UI, fitted to Lark's rules, and cited answers for approvers.

- **Surfaces pass (Nov 7), after Cohere's balance of faint lines and fills:**
  - Canvas is `paper-08` (was `paper-04`), so white cards read by fill. New `border-edge`
    colour (4% ink) for card edges; dividers stay `outline-variant`.
  - Nested blocks have no edge: white cards inside an answer, notes, insets, `ClarifyQuestion`,
    `ActionReview`, `ConflictCompare`, `StoppedNotice`. Callouts are tinted fills with no edge.
  - `text-display-sm` (40/48) and `text-display-md` (56/64). `Figure` values are display-size
    when they have room (`size="md"` keeps 24); a `FigureStrip` gives all its values one size and
    lays out by its own width (container queries), so an odd last figure spans the row.
  - `PageHeader` title is 30/36 (24 on phones).
  - Chat: `UserTurn` is a sky bubble with the author and time inside; `AssistantTurn` is a stack
    of stone blocks (`process` and `lead` props; new `TurnBlock`); `Claim` is a plain iris tint;
    `AnswerSources` is a block of iris-tinted source cards; `Reasoning` and `WorkLog` share one
    trigger shape. Conversation text is 16/24.
  - `StatePanel` content is top-aligned and "first-run" has an icon like the other kinds.
- **Fixes from the Deepgrids migration** (its `lark-gaps.md`; the app can drop its patches):
  - Visible focus on `InputGroup`, `TabsContent` and `CommandInput` (WCAG 2.4.7).
  - `Progress` announces its value (it read as busy).
  - `Table` `container` props, for a named, focusable scroll region; `DataGrid`'s scroll region
    becomes a named tab stop while it overflows (WCAG 2.1.1).
  - `SectionCard` `collapseLabel` (the toggle says "Collapse deal details", not "Collapse
    section" on every card) and `keepActionWhenClosed`.
  - `StatePanel` `titleAs` and `PromoCard` `titleAs` / `dismissLabel` (default "Dismiss <title>").
  - `Figure` labels wrap instead of being cut.
  - `ApprovalRoute` puts steps side by side by its own width (36rem), not the window's.
  - Links in a selected `ListItem` take the selected text colour (contrast on the tan fill).

**Breaking changes: none in the API.** Visual changes listed under Changed; apps get them by
upgrading. `rounded-2xl` / `rounded-3xl` are now 24px (unused before); trays only.

### Added
- **Answers:** `AnswerView` renders an ACE answer document (`AnswerDoc`) as an inline dashboard;
  one widget per section type (26: stats, properties, list, options, table, chart, bars, timeline,
  waterfall, steps, compare, flow, quote, note, question, form, draft, links, disclosure, tiles,
  media, group, master, message, text) plus `ActionTray`, `ToneText`, `AnswerSurface`,
  `AnswerBlock`. All 404 ACE states render through it.
- Answer widgets are built from Lark components (Figure, FigureStrip, DescriptionList, List,
  StepList, ActionCard, ClarifyQuestion, TextLink, Segmented, Callout). `ListItem` `wrap`.
- Chart palette: cobalt, coral, teal, plum, amber (`viz-*` primitives); all marks 3:1 on white.
- Rules: rows top-align; cards in a row share a height (`DashboardGrid` stretches).
- **Audit pass (Nov 6):** no text under 12px anywhere (counts, kbd, citations, avatars now
  `text-xs`); disabled controls are grey fills with muted text, never faded (25 primitives: fields,
  menus, checkbox, radio, switch, slider, tabs, toggles, labels, calendar); no `!important`
  overrides; user bubble radius 12; floating "Jump to latest" uses the button shape; service marks
  sit level with the first line of wrapping text.
- **Edge states:** empty answer sections keep their title and say so (`isEmptySection`);
  `AnswerSkeleton` for answers in progress; short table rows padded; long IDs and links wrap;
  `Freshness` ignores invalid dates. Shown in `/examples/widgets#f-edge`.
- **Conversation:** `ChatComposer`, `Reasoning`, `SuggestionChips`, `TurnActions`, `ChatLayout`,
  `ChatPanel` (no AI Elements dependency).
- `AnswerSources` is a group, not a region (many per page); `/examples/chat` rebuilt on these;
  new `/examples/chat-panel` and `/examples/widgets`.
- `ObjectCard`, `ObjectFact`, `CardLink`, `ServiceStack`: the browse card and its parts.
- `SectionCard` `link`, `Tray` `footer` and `link`.
- `Tray`, `TrayCard`: stone trays holding cards with concentric corners.
- `SectionCard` `variant="strip"`: header in a 40px stone band.
- `CardStatusFooter`: one action and the card's state.
- `ContainedField`, `ContainedInput`, `ContainedTextarea` (`/ui`): label inside the box, linked error and disabled reason.
- `ProvisionalBadge`, `provisionalEdge`: dashed edge plus words for proposed, unsaved and AI-suggested content.
- `CompoundTag`: value and qualifier in one pill.
- `Freshness`, `relativeTime`, `useNow`; `Figure` `updated`.
- `BestFor`; `Choice.bestFor`; `Scenario.bestFor` and `Scenario.provisional` in `ScenarioCompare`.
- `ApprovalMatrix`: approver per condition, native radios per row.
- `Claim`: highlighted claim that opens its source.
- `AssistantTurn` `agent` (mark, name, "AI" badge, time) and `lead`.
- `AnswerSources` `collapsible`, `defaultOpen`.
- `SplitButton` `size`, `disabled`; the group is named by the action.

### Changed (one system, see LARK.md "One system (v0.6)")
- **Canvas is neutral** (`paper-04`, `#fbfaf8`) instead of sand. Sand stays only as tan
  "selected" and as a legacy band tone.
- **Coral** (`--lark-coral-50` / `-d50`): chart colour 2 (replacing sand) and a new `coral` band,
  graph and icon-tile tone (`bg-tint-coral`).
- **Titles at regular weight:** `title-md` 24/32 400 (page titles, Figure values), `title-lg`
  30/36 400. Section and card titles unchanged.
- **IconChip is square** by default (`shape="circle"` to keep round) and has `variant="solid"`.
- **Segmented control and segmented tabs:** white selected segment on a grey track (was ink fill).
- **No resting shadows:** `PlanReview` and `ChecklistCard` are flat.
- **Actions out of card headers:** `ActionCard` renders `action` under its text; `ChangeReview`'s
  Accept all / Reject all moved to its footer.
- `PageHeader` description is 14/20 secondary text (was 12/18 tertiary); `back` link added;
  `eyebrow` deprecated (still renders).
- `FileDropzone`'s file input has an accessible name; AI Elements `TaskTrigger` is a real button.
- `/examples/dashboard` rebuilt on 0.6: `DashboardLayout` with `PageHeader` (freshness in its
  meta line), split button for New work, and every module a `SectionCard` at 12px: approvals in
  flight as `ApprovalChain` lanes, ACE work as a list with provisional marks. Contained fields in
  the decision form.
- `ApprovalChain` `layout="lanes"`: steps side by side, split by hairlines, to sit flush in a
  card; steps take `when` and `action`.
- `ListItem` `action`: a static row's next step under its text.
- `RecordLayout`, `DashboardLayout` and `SettingsLayout` bodies use the header's 24px gutter
  from md, so cards line up with the page title.
- The citation popover (`Cite`) also lists what the source was used for, and shows its meta line without a system.

## 0.5.0 (2026-11-05)

What the Deepgrids workspace needs (gap list G1–G11):

- G1 Theme storage and attribute options: `storageKey` and `attribute` on `ThemeScript`, `useTheme`, `ThemeToggle`.
- G2 Optional peer ranges: `motion` `>=12 <15`, `nanoid` `>=5 <7`; `react-day-picker` 9.13 or 10.
- G3 Composable `UserMenu` with sections, items, a submenu and radio groups.
- G4 Sidebar extras: `scope` (`ScopePill`), collapsible groups, item badges, footer items.
- G5 `HeroBand`: a page's tinted lead band.
- G6 `IllustratedChoiceCard`: a big one-link choice with an illustration.
- G7 `Figure` / `FigureCard` with an icon tile and a caption; the whole card is one link.
- G8 Snowflake, MCP and email logos; `ServiceLogo` `src` for app-provided marks.
- G9 `StepList`: ordered steps with state in words.
- G10 Graph theme for React Flow: `@deepgrids/lark/graph` (`GraphNode`, `GraphEdgeLabel`) and `@deepgrids/lark/graph.css`.
- G11 `Transcript` / `TranscriptLine`: speaker, `<time>`, flag badges.

**Breaking changes: none.** Every new prop is optional or on a new component, and 0.4 code
compiles and renders unchanged. Three things look or resolve differently (listed under Changed):
`serviceKey("Email")` returns the email envelope instead of Outlook, `Figure` captions are
tertiary, and `Figure` `icon` is a 32px tile.

### Added
- **Theme options**: `ThemeScript`, `useTheme` and `ThemeToggle` take `storageKey` (default
  `"lark-theme"`) and `attribute` (`"class"` default, `"data-theme"`, `"both"`). The change event
  is `"<storageKey>-change"` (`themeEventName()`); `themeScriptSource()` returns the boot script.
  A stored `"dark"` reads as dusk.
- **Composable `UserMenu`**: `UserMenu({ name, detail?, email?, avatar?, children })` with
  `UserMenuSection` (optional label), `UserMenuItem` (icon, `href` or `onSelect`, shortcut,
  destructive, disabled), `UserMenuSub` (label, icon) and `UserMenuRadioGroup` (label, value,
  onValueChange, options with descriptions; checked state announced). With no children it still
  shows Profile, Admin and Sign out.
- **Sidebar extras**: `AppSidebar` takes `scope` (under the logo; hidden on the rail) and
  `footerItems`; `NavGroup` takes `collapsible`, `defaultOpen`, `open` + `onOpenChange`;
  `NavItem` takes `badge` + `badgeLabel` (a `CountPill`, a dot on the rail, the label in the link's
  name; default "<n> waiting"). Rail tooltips include the badge. New `ScopePill({ label, href?,
  tone })`: dot + words, 24px, a link when `href` is set.
- **`Figure` / `FigureCard`**: `icon` is now a 32px round tinted tile beside the label (`tone`,
  default neutral); `caption` is 12/18 tertiary. With `href` the card is one link named
  "<label>: <value>" (override with `linkLabel`) and described by the caption.
- **Logos**: Snowflake, plus Lark's neutral MCP plug and email envelope. `serviceKey()` knows
  "snowflake", "mcp" / "model context protocol", "email" / "mail". `ServiceLogo` takes `src` for an
  app-provided mark (https:, `data:image/` or relative; anything else is ignored; see
  `safeLogoSrc()`).
- **`HeroBand`** (`lark/bands`): a page's lead band. `eyebrow`, `title` (`as` "h1" | "h2"),
  `description` (body-lg), `actions` (at most one brand button), `media` (decorative unless
  `mediaAlt`), `tone` ("sky" | "sand" | "evergreen" | "ember" | "iris"). Radius 16, tinted fill;
  stacks under 640 with media first; never sticky.
- **`IllustratedChoiceCard`**: `href`, `title`, `description` (2 lines), `media` on a tinted
  panel, `tone`, `cta` (default "Explore this role"), `current` (aria-current="true"). One link
  named by the title; equal heights in a grid; hover lifts the edge to outline-strong.
- **Tone tints**: `--tint-<tone>` and `--tint-<tone>-strong` (light and dusk) with Tailwind
  colours `bg-tint-sky`, `bg-tint-sky-strong`, … for the five tones (`BAND_TONE`).
- **`StepList`** (`lark/steps`): `steps` (`{ id, title, description?, state: "todo" | "current" |
  "done" | "blocked" | "skipped", action? }`), `orientation` ("vertical" default, "horizontal"
  stacks under 640), `numbered` (default true). An `<ol>`; state in words for screen readers
  (`STEP_STATE_LABEL`); the current step has aria-current="step"; done shows a check; blocked
  shows its reason in the description.
- **`Transcript` / `TranscriptLine`** (`lark/transcript`): `Transcript({ label, children })` is an
  `<ol>`; `TranscriptLine({ speaker, time, dateTime?, flag?, children })` shows the speaker at 450,
  the time as `<time>` in mono 12 (offsets like "12:31" get a duration `dateTime` via
  `offsetDuration()`), a flag as a Badge ("Commitment", "Risk", "Question"); long lines wrap.
- **Graph theme for React Flow**: new entry `@deepgrids/lark/graph` with `GraphNode({ title,
  meta, icon?, tone?, selected?, dimmed?, children })` (216×64, radius 12, 32px icon tile by tone,
  meta names the category in words, Handles as children) and `GraphEdgeLabel` (pill,
  outline-variant edge). `@deepgrids/lark/graph.css` maps React Flow's variables and classes to
  Lark tokens: edges outline, selected edge primary, handles, controls in popover style, minimap,
  dotted canvas (`.lark-graph-dots` without `<Background>`), dusk values. Neither imports
  `@xyflow/react` (still an optional peer); the main entry doesn't import the graph entry (the
  smoke test checks every module it reaches).
- `tokens.css` now includes the `--tint-*` variables.

### Changed
- Optional peers widened: `motion` `>=12 <15`, `nanoid` `>=5 <7` (apps on motion 14 and nanoid 6
  install without ERESOLVE).
- `react-day-picker` dependency is `^9.13.0 || ^10.0.0`. The date pickers pass their tests and
  type-check on 9.13 and 10.0.2; `Calendar` now styles the grid through `month_grid` (the old
  `table` class key is gone in 10). The repo develops on 10.
- `serviceKey("Email")`, `"mail"` and `"mailbox"` now return `"email"` (neutral envelope) instead of
  Outlook; only names containing "Outlook" get Outlook's mark.
- `Figure` captions are tertiary (were secondary) and `icon` is a 32px tile (was a 16px glyph).

## 0.4.0 (2026-11-05)

### Added
- **CPQ** (`lark/cpq`), for configure, price, quote, approve and order: `SourceLine`,
  `DealFigures`, `CountUp`, `CpqStages`, `QuoteLines`, `DiscountMeter`, `PriceWaterfall`,
  `PolicyChecks`, `ApprovalRoute`, `ScenarioCompare`, `InvoiceSchedule`, `OrderMatch`,
  `BlockedReason`, `formatMoney`. Example: `/examples/quote`.
- **Service logos**: `ServiceLogo` (Salesforce, Outlook, Slack, Teams, SharePoint, Google Meet,
  Zoom, Excel, Word, ACE; neutral mark otherwise), embedded as data URIs.
- **The real ACE mark** in `AceMark`, with `motion` (spin, settle, slow) and `variant` (badge, bare).
- **Cinematography utilities** from deepgrids-ACE: `.lark-render-in`, `.lark-stagger`,
  `.lark-pop-in`, `.lark-bar-grow`; all still under reduced motion.
- **Chat states** (`lark/chat`), from the ACE state library: `UserTurn` (sending, failed, queued,
  branches), `AssistantTurn`, `ThinkingRow`, `WorkLog` + `ToolCallRow` (queued, running, done,
  failed, needs your OK, skipped), `StreamingText`, `StoppedNotice`, `ReplyError`, `Cite`,
  `AnswerSources` (stale, superseded, inaccessible, deleted), `ConflictCompare`,
  `InjectionNotice`, `ClarifyQuestion` (open, answered, deferred, ask the owner), `ActionReview`
  (pending, approved, declined, expired, duplicate), `ActionReceipt` (queued → verified,
  uncertain, mismatch, failed), `DraftCard` (external recipients, saved, sent, failed),
  `QueuedFollowUps`, `ModeSwitch` (policy ceiling), `ComposerNotice`, `ScreenSessionNotice`,
  `JumpToLatest`, `BranchSwitcher`, `ConversationListItem`, `ChatWelcome`, `ProactiveTask`,
  `SystemMark`, `ChatColumn`, `TimeDivider`.
- **Primitives** (`/ui`): `Combobox`, `MultiCombobox`, `Tag`, `DatePicker`, `DateRangePicker`,
  `NumberInput`, `FileDropzone`, `FileRow`, `IconButton`, `CopyButton`, `ProgressRing`, `TextLink`.
- `Callout` (titled, toned note with actions) in `lark/feedback`.
- `useTheme` and `ThemeScript` (light, dusk, system; no flash on load).
- Package ships `tokens.css` (variables only), DTCG token JSON (`tokens/*.tokens.json`) for
  Figma variables, and the Hanken Grotesk and Geist Mono variable fonts (OFL).

### Changed
- Published as `@josephholzman/lark` on GitHub Packages (repo `josephHolzman/lark-design-system`);
  apps install it under the alias `@deepgrids/lark`, so imports don't change if it moves.
- `lucide-react` is a peer dependency (`>=0.577.0 <2`, tested with 0.577 and 1.57), so an app and
  Lark share one icon library.
- AI Elements dependencies are now **optional peer dependencies**; the core entries install
  with React only (packed size 2.0 MB → 0.6 MB). See the README for the `/ai` install line.
- `react`/`react-dom` peers widened from `19.3.0` to `^19.0.0`.
- `AppShell` starts the sidebar as a 48px rail below 1280px (`compactBelow`).
- `RecordLayout` and `DashboardLayout` scroll as one page on phones; `RecordLayout` takes
  `asideOnSmall`.
- `ListLayout`'s filter rail shows from 1024px (260px, 300px from 1280px); below that it is a
  "Filters" disclosure. `SettingsLayout`'s section nav is a disclosure on phones.
- `PageHeader` actions wrap below the title by container width, not viewport.
- `DescriptionList` columns size to the container.
- `hit-area` guarantees 24×24 targets for every pointer (44×44 on touch).
- Inputs use 16px text on touch devices so iOS never zooms.

### Fixed
- **Tables read in one pass.** `QuoteLines` puts each line's status and ACE's proposal under the
  product, shows the current value with "Proposed …" directly below it in every column, states
  units in the headers (per unit, per year, limit), and moves totals into a summary under the
  table (list, discounts, net per year, one-time, with proposed changes). `DataGrid` columns take
  `meta.description` for a second header line; the deals example uses it ("tick = 20% limit",
  "last 8 weeks", "given of needed"). `SparklineCell` shows the change in text; `ProgressCell`
  and `AiColumnStatus` say "2 of 3" instead of "2/3". `ScenarioCompare` switches between table and
  cards by container width.
- `AiRunCell` no longer squeezes the value, confidence and "Why?" onto one line (the confidence
  pill wrapped and the value truncated); `ConfidenceBadge` never wraps.
- Sticky `DataGrid` header cells were transparent when the grid scrolled sideways.
- `FacetFilterMenu` shows what is applied ("Owner: Priya Raman", "+1") instead of a count bubble.
- Small round number chips use Hanken's tabular figures (Geist Mono sat low in the circle).
- The command palette's close button no longer overlaps the search field; its title is inside the
  dialog; it has keyboard hints.
- Thin, theme-coloured scrollbars (no light OS arrows in dusk on Windows).
- No ellipsis truncation in sources, tool calls or queued messages: text wraps.
- `RecordLayout` puts the aside beside the main column from 1280 (was 1024), so tables keep
  their width; `PageHeader` meta separators end a line instead of starting one;
  `DescriptionList` labels stop at 14rem.
- Indeterminate checkboxes showed a check; they show a dash.
- Duplicate React keys in the sidebar and page tabs.
- `DataGrid` no longer errors under Next's `cacheComponents` in development.

## 0.3.0 (2026-11-05)
- Patterns, layouts, `DataGrid` and cells, AI patterns, menus, feedback and editing components;
  first packaged build.
