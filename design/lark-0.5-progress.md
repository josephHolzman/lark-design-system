# Lark 0.5 progress

Gap list: `deepgrids/apps/enterprise-workspace/docs/lark/lark-gaps.md` §1.

- [x] K1
- [x] K2
- [x] K8a
- [x] K8b
- [x] K8c
- [x] K8d
- [x] K8e

## K1 (2026-11-05)

Plan:
1. G1 theme.tsx: `storageKey` + `attribute` ("class" | "data-theme" | "both") on ThemeScript, useTheme, ThemeToggle; event name from the key; tests.
2. G2 package.json peers (motion, nanoid); try react-day-picker 10, keep ^9 if the date pickers fail.
3. G3 composable `UserMenu` (Section, Item, Sub, RadioGroup) on Radix DropdownMenu; old `email` prop still renders.
4. G4 `AppSidebar` scope + `ScopePill`, collapsible groups, item badges, footer items, rail tooltips.
5. G7 `Figure`/`FigureCard` icon + caption; whole card one link.
6. G8 snowflake/mcp/email logos, serviceKey aliases, `ServiceLogo src`.
7. Each: export, patterns section, tests (behaviour + axe); lint, typecheck, test, build:lib, smoke:lib; commit per item.

Handoff:
- G1 `ThemeScript`/`useTheme`/`ThemeToggle` take `storageKey`, `attribute` ("class" | "data-theme" | "both"); event `<key>-change` (`themeEventName`); `themeScriptSource()`; stored "dark" reads as dusk.
- G2 peers motion `>=12 <15`, nanoid `>=5 <7`; react-day-picker `^9.13.0 || ^10.0.0` (date picker tests pass and type-check on 9.13 and 10.0.2; Calendar uses `month_grid`). Repo now on 10. Fixed tsup `external` regex so `build:lib` works on Windows.
- G3 `UserMenu({ name, detail, email, avatar, children })` + `UserMenuSection`, `UserMenuItem`, `UserMenuSub`, `UserMenuRadioGroup`; no children = old Profile/Admin/Sign out.
- G4 `AppSidebar` `scope`, `footerItems`; `NavGroup` `collapsible`/`defaultOpen`/`open`/`onOpenChange`; `NavItem` `badge`/`badgeLabel`; `ScopePill({ label, href, tone })`. Example shell uses all of them.
- G7 `Figure` `icon` = 32 tinted tile (`tone`), tertiary `caption`, link named "<label>: <value>" (`linkLabel`), described by caption.
- G8 snowflake/mcp/email in design/logos + logos.data.ts; `serviceKey` aliases; `ServiceLogo src` via `safeLogoSrc`.
- Tests: 29 pass (theme, date pickers, UserMenu, sidebar, Figure, logos; axe on each). lint 0 errors, typecheck, build:lib, smoke:lib pass. Changelog under "Unreleased"; version not bumped.
Open:
- Lark writes "dusk" to storage; if the workspace's other code expects "dark" under its key, K2 or the app should decide (reads already accept both).
- Default badge label is "<n> waiting"; ScopePill is hidden on the rail (no room). Confirm both.
- `serviceKey("Email")` changed from Outlook to the envelope (in changelog). Snowflake mark copied from the workspace's public/assets; check its brand-guideline provenance.

## K2 (2026-11-05)

Plan:
1. Tone tints (`--tint-<tone>` / `--tint-<tone>-strong`, light + dusk) in globals.css for sky, sand, evergreen, ember, iris.
2. G5 `HeroBand` + G6 `IllustratedChoiceCard` in `lark/bands.tsx`; patterns "Page leads" group; tests + axe.
3. G9 `StepList` in `lark/steps.tsx`; patterns; tests + axe.
4. G11 `Transcript` / `TranscriptLine` in `lark/transcript.tsx`; patterns; tests + axe.
5. G10 `lark/graph.tsx` (`GraphNode`, `GraphEdgeLabel`, no xyflow import) as entry `@deepgrids/lark/graph`; `packages/lark/src/graph.css` copied to `dist/graph.css` by build-styles; exports; smoke checks the main entry has no xyflow import and graph renders.
6. Release prep: 0.5.0, CHANGELOG, README (entries, ThemeScript options, Profile menu), LARK.md "v0.5".
7. `npm run verify`; commit per item; tick K2 + handoff.

Handoff:
- G5 `HeroBand` / G6 `IllustratedChoiceCard` in `lark/bands.tsx`; tones sky, sand, evergreen, ember, iris via new `--tint-<tone>` / `-strong` (light + dusk; also in tokens.css). HeroBand `as` h1 (default) or h2, `mediaAlt` makes media an img.
- G9 `StepList` (`lark/steps.tsx`), `STEP_STATE_LABEL`; horizontal stacks under 640.
- G11 `Transcript` / `TranscriptLine` (`lark/transcript.tsx`); `dateTime` optional, offsets become ISO durations (`offsetDuration`).
- G10 `@deepgrids/lark/graph` (`GraphNode`, `GraphEdgeLabel`; no `@xyflow/react` import, Handles go in as children) and `@deepgrids/lark/graph.css` (source `packages/lark/src/graph.css`, copied by build-styles). Smoke test walks every module the main entry reaches and finds no xyflow; GraphNode renders with React only.
- Examples: `/examples/patterns` "Page leads" and "Steps, transcripts and graphs" (a live React Flow graph). `next build` passes.
- Release prep: version 0.5.0, CHANGELOG 0.5.0 (G1–G11, no breaking changes; three visual/resolution changes listed), README (graph entries, ThemeScript options table, profile menu), LARK.md "v0.5". Not pushed or tagged.
- `npm run verify` passes: 37 tests, lint 0 errors (32 old warnings), typecheck, build:lib, smoke:lib.
Open:
- HeroBand doesn't enforce "one brand button"; it's documented only. Should it warn in development?
- `attribute="data-theme"` alone leaves Lark's components light (tokens key off `.dark`). The README says to use `"both"`. Should Lark also key dusk off `[data-theme="dark"]`?
- I kept iris for AI in the examples (the Sales ops card and the graph group use ember). Confirm iris may be a role tone at all.
- GraphNode's icon tile is a rounded square (radius 6), not round like the `/ai` workflow nodes. Confirm.

## K8a (2026-11-07)

Plan:
1. `Illustration` (illustration.tsx): src/alt/size 48·96·140·200·wide/brief; reserves its box; container query steps 200→140→96 under 20rem; `illustration` prop on StatePanel, ChatWelcome, Banner, PromoCard, SectionCard.
2. `CompanyLogo` fallback: failed or missing src → initials on `bg-inset`, same size, name still the accessible name.
3. `NumberInput` `commit: "blur" | "change"`; steppers named "Increase/Decrease <label>".
4. `ui/Tabs` `TabsList overflow="menu"` via useOverflow: unpinned triggers move to a More menu, active stays, roving focus kept.
5. §3 small fixes: check each in code; skip done (Figure link name, DataGrid scroll region, StatePanel titleAs, SectionCard collapse label…). Do the rest: CommandDialog focus return, Sheet showCloseButton, NativeSelect className, ScrollArea viewport, Calendar day labels, DropdownMenu/UserMenu non-modal, AppShell onOpenChange + landmark, phone sheet focus return, AskAceButton busy, ListItem/ActionCard link reset, IllustratedChoiceCard name, DatePicker name, ApprovalRoute words, UnsavedChangesBar labels, PolicyChecks words, ActionReview disabled, RunSteps idle/skipped, StepList onSelect, StoppedNotice note, ConversationListItem onSelect, ChatWelcome titleAs/eyebrow, AnswerSources onOpen, DataGrid pageSizeOptions, VerticalNav href, CpqStages labels.
6. New `/examples/slots` page in the gallery; vitest + axe; lint:lark; checks; commit per component; tick K8a + handoff.

Handoff:
- Built: `Illustration` (48/96/140/200/wide, brief in `data-brief`, 200→140→96 under 20rem) and the `illustration` slot on StatePanel, ChatWelcome, Banner, PromoCard and SectionCard (empty modules only). `CompanyLogo` falls back to initials on `bg-inset` when src is missing or fails. `NumberInput` `commit` + named steppers. `TabsList overflow="menu"` (More menu, active pinned, no scroll).
- Small fixes: CommandDialog focus return; SheetContent `showCloseButton`; NativeSelect `className` on the select (+`wrapperClassName`); ScrollArea viewport tab stop; Calendar day labels; UserMenu `modal`; AppShell `onOpenChange` + page `<main>`; phone sheet focus return; AskAceButton busy/disabled/expanded/controls; ActionCard link reset; IllustratedChoiceCard name; DatePicker name; ApprovalRoute `stateLabel`; UnsavedChangesBar labels/children/saveDisabled; PolicyChecks `statusLabel`; ActionReview disabled/describedBy/fields; RunSteps idle/skipped/action; StepList `onSelect`; StoppedNotice note/retry; ConversationListItem `onSelect`/disabled; ChatWelcome titleAs/eyebrow; AnswerSources `onOpen`; DataGrid `pageSizeOptions`; VerticalNav `href`; CpqStages `labels`.
- Skipped (already done in 0.5–0.7): linked Figure/FigureCard name (`linkLabel`), DataGrid scroll region, StatePanel `titleAs`, SectionCard `collapseLabel`, PromoCard `dismissLabel`/`titleAs`, ListItem selected link colour, all rows marked "Done in 0.6.0".
- Checks: lint 0 errors, lint:lark ok, typecheck, vitest 102, verify (build:lib + smoke:lib), Playwright 50 (47 old + 3 slots). `/examples/slots` added to the axe e2e page list.
- Open: `NativeSelect className` moved from the wrapper to the `<select>` (breaking for callers that styled the wrapper; use `wrapperClassName`). AppShell now puts `<main>` around children, so top bars are banners; consumers that relied on SidebarInset being `<main>` should check. SheetHeader still reserves `pr-14` when the close button is hidden. Illustration's root is full width so fixed sizes centre; confirm that suits inline use. Should IllustratedChoiceCard's auto-name be opt-out beyond `label`?

## K8b (2026-11-07)

Plan:
1. `FactGrid` (fact-grid.tsx): a `dl` of term 14 / value 16; auto columns 1→2→3→4 at 24/40/56rem of its own width; hint, `href`, `copy` (name "Copy <term>", toast "Copied"), missing "Not set".
2. `MasterDetail` (master-detail.tsx): 22rem list + detail, both scroll, from 48rem of the component's width; below that one pane, a "Back to <listLabel>" button, focus to the detail heading on open and the selected row on back.
3. `RecordDrawer` (record-drawer.tsx): a right Sheet at 32/44/60rem, full screen under 640; icon or logo, badges, overflow tabs, footer; focus trapped, returned to the opener, Esc closes, titled by its title.
4. `NotificationsPanel` (notifications.tsx): a Sheet of deal signals grouped by day; kind icon, title 16, clamped detail 14, time meta, unread dot + "Unread"; header count + "Mark all as read"; Segmented All/Unread/Mentions with counts; empty state.
5. New `/examples/records` page with fake data for all four; link from the shell gallery; add it to the axe e2e page list.
6. Add all four to `/examples/width-matrix` and extend its Playwright test (FactGrid columns, MasterDetail panes, drawer full screen, panel).
7. vitest + axe per component; lint, lint:lark, typecheck, test, verify, Playwright; commit per component; tick K8b + handoff.

Handoff:
- `FactGrid` (`fact-grid.tsx`): a `dl` of term 14 / value 16; auto columns 1→2→3→4 at 24/40/56rem of its own width (explicit counts are maxima); `hint`, `href`, `copy` (button "Copy <term>", sonner toast "Copied"), missing value "Not set" plus sr-only "not set". The `@container` is a wrapper: on the grid it measured an ancestor.
- `MasterDetail` (`master-detail.tsx`): 22rem list + detail from 48rem of its own width, both scroll in a sized parent (`h-full`); below 48rem one pane, the detail with "Back to <listLabel>"; focus goes to the detail's first heading on open and back to the selected row. A deep-linked record does not steal focus on load.
- `RecordDrawer` (`record-drawer.tsx`): a right Sheet at 32/44/60rem capped to the viewport, full width under 640; icon or logo, badges, PageTabs overflow, scrolling body, footer. Radix traps focus and closes on Esc; the opener is captured in `onOpenAutoFocus` and refocused on close.
- `NotificationsPanel` (`notifications.tsx`): "Deal signals" Sheet grouped by day; kind icon, 16 title, 14 clamped detail, time meta, unread dot + sr-only "Unread", optional action; header unread count + "Mark all as read"; Segmented All/Unread/Mentions with counts; illustrated empty states.
- Examples: `/examples/records` (fake data, linked as "Record patterns" in the gallery); all four in `/examples/width-matrix`; `width-matrix.spec.ts` checks FactGrid columns at its own width, MasterDetail panes, drawer 704px at 1600 and full screen at 390, focus return, and the panel's groups. `records` added to the axe page list.
- Skipped: docs/CHANGELOG/version (K8d); no new §3 gap rows.
- Checks: lint 0 errors (32 old warnings), lint:lark, typecheck, vitest 119, verify (build:lib + smoke:lib), Playwright 55.
Open:
- `FactGrid` copy needs a mounted sonner `Toaster`; the gallery has one. Explicit columns are maxima — confirm that is what callers expect.
- `MasterDetail` needs a height from its parent. It focuses the detail's first `h1–h6` (or `[data-detail-heading]`), otherwise the detail region.
- `RecordDrawer` focus return needs the opener to still be in the document when it closes.
- `NotificationsPanel` keeps filter and read state with the caller: `Mark all as read` is a callback and `mentionsMe` powers Mentions. Confirm both names.
- The first Playwright click needs hydration; the new tests wait for `networkidle` + 750ms on the dev server.

## K8c (2026-11-07)

Plan:
1. `AgentTaskCard` + `AgentTaskRow` + `AgentTaskGrid` (agent-task.tsx): avatar or AceMark, 16 title clamp 2, state badge (queued, running, needs review, done, failed), one context line, one primary action, hover actions, Meter while running.
2. `AgentTaskGrid` at its own width: cards 2-up from 36rem, 3-up from 60rem; below 36rem a List of rows (avatar · title · badge · action).
3. `DecisionPanel` (decision-panel.tsx): question 20, summary 14, radio option cards (label, consequence, recommended, disabled reason), optional required reason textarea, primary/secondary, sticky actions, aside facts, SaveStatus, sky feature module.
4. `VersionCompare` (version-compare.tsx): left/right version headers, rows of before/after, change word + icon, Only changes switch; two columns wide, one per row narrow.
5. `ImpactPreview` (impact-preview.tsx): summary sentence, compact from→to rows with tone icon + word, PolicyChecks slot; rows stack by container width.
6. `/examples/work` with fake data, linked from the shell gallery and added to the axe page list.
7. All four in `/examples/width-matrix`; extend `width-matrix.spec.ts`.
8. vitest + axe per component; lint, lint:lark, typecheck, test, verify, Playwright; commit per component; tick K8c + handoff.

Handoff:
- `AgentTaskCard` / `AgentTaskRow` / `AgentTaskGrid` (`agent-task.tsx`): agent avatar or AceMark + name, 16 title clamp 2, status badge in words (Queued, Running, Needs review, Done, Failed), one context line, one action, the rest in HoverActions, a labelled Meter while running (`progress`). The grid is 2 cards from 36rem, 3 from 60rem, and a List of rows below (both forms are in the DOM; the container query's `display:none` keeps the hidden one out of the accessibility tree).
- `DecisionPanel` (`decision-panel.tsx`): a sky feature module whose `@container/decision` is a wrapper (`.lark-module` already names its own container). Question 20, summary 14, radio option cards (consequence, Recommended, "Not available: <reason>"), optional required reason, SaveStatus, sticky actions; options and the 18rem aside sit side by side from 40rem. The aside is `relative`, so a FactGrid's absolute sr-only text does not drift when the page scrolls.
- `VersionCompare`: before/after headers (version, author, time), rows of before → after; `kind` or an inferred change from the two values, always an icon + word (Added, Removed, Changed); Only changes switch; two value columns from 40rem, before then after per row below.
- `ImpactPreview`: summary, compact label + from → to rows (tone icon and an sr-only word), PolicyChecks slot; label and change side by side from 28rem.
- Examples: `/examples/work` ("Work and decisions", linked in the gallery) and all four in `/examples/width-matrix`; `work` in the axe page list. `width-matrix.spec.ts` checks cards/rows at 576, 2/3 columns at 960, DecisionPanel 2 columns at 640, VersionCompare before/after at 640, ImpactPreview side by side at 448.
- Skipped: docs/CHANGELOG/version (K8d); no new lark-gaps §3 rows.
- Checks: lint 0 errors (32 old warnings), lint:lark, typecheck, vitest 132, verify (build:lib + smoke:lib), Playwright 58.
Open:
- DecisionPanel owns the option/reason state and disables the primary until both are ready; the caller drives `status` (SaveStatus). Confirm that split, and whether an option's `disabled` reason should be announced on focus as well as read inline.
- Decision options are new radio cards inside the panel, not Lark's existing `ChoiceCard` (a whole prompt + choices + submit). Should `ChoiceCard` grow a one-option card?
- `VersionCompare` infers Added/Removed/Changed from the two values when `kind` is absent; a row whose text matches is unchanged. Passing `kind` on an equal pair would still mark it changed.
- A running `AgentTaskCard` shows no meter unless `progress` is passed; the example passes it for one task.
- `ImpactPreview` tone words ("changes", "increases", "decreases", "needs attention") are screen-reader only; confirm the four names.

## K8d (2026-11-07)

Plan:
1. `/examples/components`: a searchable catalog grouped by component file; every exported component gets a realistic, deliberately long-data sample.
2. Each file group renders in frames at 280, 360, 480, 720 and 1080px (the rule's five widths), with the group and sample names exposed for search.
3. `tests/e2e/components.spec.ts`: no element overflows its frame (clipped ancestors allowed), tabs and segmented controls stay one line, every interactive target is at least 24x24, axe with contrast in light and dusk.
4. Fix every component the matrix finds; list any failure that needs a design decision in the handoff.
5. Add the page to the shell gallery and the axe page list; keep the existing width-matrix for record compositions.
6. Version 0.8.0: CHANGELOG, `design/LARK.md` "v0.8" section, README install line; run verify and test:e2e last.

Handoff:
- Built `/examples/components`: every runtime component export of the main entry (plus `graph`), grouped by file and searchable by component/file/note. Each group renders its samples in 280/360/480/720/1080 frames with long fake data; `tests/components-catalog.test.tsx` fails when an export has no sample.
- `tests/e2e/components.spec.ts` (serial): no element wider than its frame (clipped ancestors allowed), page tabs/segmented one line, all pointer targets 24×24 (`hit-area` pseudo counts), and axe with contrast in light and dusk. The page is also in the main axe page list.
- Fixes the matrix found: `TagsCell` +N, `RecordCell` name, page back link, breadcrumbs and `Claim` targets; Sidebar rail 24 wide; `SplitView` named focusable panes; `AppShell` focusable `<main>`; `TableWidget` named focusable scroll region; `DealFigures` and `PriceWaterfall` container layout; `ChangeReview` container row; `Topbar` container breadcrumbs/search; `PageTabs` `data-slot`.
- Release prep: packages/lark 0.8.0, CHANGELOG 0.8.0 (new components, fixes, API notes), README install `^0.8.0` and examples line, LARK.md "v0.8" section with the narrow rules. Not pushed or tagged.
- Checks: lint 0 errors (32 old warnings), lint:lark ok, typecheck, vitest 136, verify (build:lib + smoke:lib), Playwright 64 (3 new + 61 existing).
- Skipped: nothing in items 14–15; the overlays' open states stay in width-matrix.spec.
Open:
- The matrix renders overlay components (RecordDrawer, RecordPeek, CreateDrawer, NotificationsPanel) closed; their open behaviour stays in width-matrix.spec.
- AppShell's sample is inside a transform so its fixed sidebar stays in the frame; `AppShell` now has a focusable `<main>` (an extra Tab stop on pages with no focusable content).
- `TableWidget`'s scroll wrapper is always a named tab stop (it cannot know when it will overflow); `PriceWaterfall` stacks its bar under the label and amount under 30rem — confirm that reads right.
- K8d changed `NativeSelect` (className on the select; `wrapperClassName` for the wrapper), `SplitView` (regions + labels) and `Topbar` (container breadcrumbs/search); callers should check.

## K8e (2026-11-07)

Plan:
1. Rebuild `AgentTaskCard` to the card anatomy: 32px identity, 16 title with a `<who> · <when>` byline under it, a ⋯ "More actions for <title>" menu, a full-width 14 description, a full-width progressbar while running (step words, sky fill) or "Starts when …" while queued, and a pinned footer with one action left and StatusBadge right.
2. `AgentTaskRow`: avatar · title + byline · badge · action · ⋯ (no hover-only controls). `AgentTaskGrid`: equal columns, `h-full` cards, rows under 36rem.
3. Audit every K8a–K8d component against design-standards §1–§7 and industry-conventions: fill the six-question and four-check tables, fix each "no" (eyebrows, 12px non-meta, floating actions, colour-only status, unlabelled icons).
4. Refresh `/examples/work`, `/examples/records`, `/examples/slots`, `/examples/width-matrix` and `/examples/components` with realistic content; screenshot each at 1440 and 390 and read them.
5. Checks: lint, lint:lark, typecheck, test, verify, Playwright; commit per component; handoff with the conformance tables and Open.

Handoff:
- `AgentTaskCard` / `AgentTaskRow` / `AgentTaskGrid` are the anatomy in `design/LARK.md`: 32px identity (avatar, `PersonAvatar` or `AceMark`), a 16px title with its "<who> · <when>" byline and a ⋯ "More actions for <title>" menu, a full-width 14 description clamped to two lines, the step in words ("Step 2 of 4 · Drafting the margin table") over a sky `progressbar` with `aria-valuenow`/`aria-valuetext` while running or "Starts when …" while queued, and a pinned (mt-auto, hairline) footer with one secondary action left and the `StatusBadge` right. Run, dismiss, retry later and reassign are text items in the ⋯ menu; failed keeps Retry in the footer; done keeps the footer (Open result or none). The grid is equal columns 2-up from 36rem and 3-up from 60rem of its own width, every card `h-full`; under 36rem the same tasks are a `List` of rows (avatar · title + byline · badge · action · ⋯).
- Audit fixes this session: the tabs `More` trigger is now a sibling of the tablist (axe `aria-required-children` failed when it was a child); `NotificationsPanel` says "Unread" in a `StatusBadge` instead of a dot with an sr-only word; `ListItem` trailing controls stay at the row's end when the row wraps under 12rem; `ImpactPreview` separates "Needs attention" from the value with a middot; the width-matrix sample no longer says "Waiting" beside a "Pending" badge. `TabsList`'s More trigger had been the one Playwright failure (65 → 60 passed before the fix).
- Earlier K8e commits: AgentTask rebuild; ChatWelcome's eyebrow removed (prop kept); compact StatePanel text-only; DecisionPanel's reason label and nested block; VersionCompare change words at 14; ImpactPreview's warning in words; NumberInput right-aligned; MasterDetail named focusable panes; PromoCard media by its own width; NotificationsPanel empty state text-only; Tabs fold by frame width; CompanyLogo pre-hydration fallback; record and work examples realistic.

### design-standards §7 (six questions)

| Component | 1. §1 order | 2. Row width / height / actions | 3. Non-meta at 12px | 4. >1 visible action / unlabelled icon | 5. Colour or shape alone | 6. Structure recognisable |
|---|---|---|---|---|---|---|
| `AgentTaskCard` | Yes — identity · title + byline + ⋯ · full-width description · progress (or Starts when) · pinned footer one action left, badge right. | Yes — `h-full`, equal grid columns, `mt-auto` footers. | No — only the step counter and byline. | No — one action; ⋯ named from the title; menu items have text. | No — badge is icon + word; progressbar has words, sky by job. | Yes — standard work/task card. |
| `AgentTaskRow` | Yes, the narrow subset — avatar · title + byline · badge · action · ⋯ (no description; it is a list row). | n/a single column; trailing stays right when wrapped. | No — byline only. | No — one action + named ⋯. | No — icon + word. | Yes — a dense task row. |
| `AgentTaskGrid` | Yes — every card renders the same slots. | Yes — equal columns by its own width; rows under 36rem; `h-full`. | No. | No. | No. | Yes — responsive card grid to list. |
| `Illustration` + slots | n/a, not a card; it reserves its box and sits above the words, decorative by default. | n/a | No. | No control of its own. | No — a picture; wording carries the meaning unless `alt`. | Yes — an empty-state/promo picture. |
| `CompanyLogo` fallback | n/a — identity only. | n/a | No. | No control. | No — falls back to initials, not colour. | Yes — a logo tile. |
| `NumberInput` | n/a — a field; label above, value right, unit shown. | n/a | No. | The two steppers are 24px, out of the tab order, and named "Increase/Decrease <label>" when the field has a name. | No. | Yes — standard numeric field. |
| `TabsList` overflow | n/a — a control. | n/a — one row; More is a sibling of the tablist. | No — only tab labels at 14. | No — the More trigger is labelled "More, n more". | No — the selected tab has weight + indicator. | Yes — tabs with More. |
| `FactGrid` | n/a — a `dl`; no identity/footer; term 14, value 16, hint meta. | n/a | No. | The copy button is named "Copy <term>". | No — "Not set" is words. | Yes — facts about a record. |
| `MasterDetail` | n/a — layout; list beside detail, one pane with Back under 48rem. | n/a | No. | Panes are named, focusable regions; one Back button. | No. | Yes — master/detail. |
| `RecordDrawer` | Yes — logo/icon · title + badges · tabs · scrolling body · footer. | n/a | No — tab counts only. | Drawer footer primary + close; the sheet's × is labelled "Close". | No — badges icon + word. | Yes — a record drawer. |
| `NotificationsPanel` | Yes — kind icon · title · detail, time meta; day headings are group labels. | n/a | No — group label, time. | One row action + "Mark all as read"; both have text. | No — unread is now an "Unread" badge (was dot + sr-only). | Yes — a notification list. |
| `DecisionPanel` | n/a — a form; question 20, summary 14, options, reasons, sticky footer. | n/a | No — "Required" sits at 14. | Footer primary + secondary (a form, not a card); status announced by `SaveStatus`. | No — recommended has a word; disabled says why. | Yes — a decision form. |
| `VersionCompare` | n/a — a comparison; change is an icon + word. | n/a — two columns by its own width. | No — "Before/After", byline, time, count are metadata. | One "Only changes" switch; labelled. | No — change word + icon + semantic colour. | Yes — a revision diff. |
| `ImpactPreview` | n/a — a before → after list; no card slots. | n/a — rows stack under 28rem. | No. | No action of its own. | No — warning says "Needs attention" in words (now separated). | Yes — a change preview. |
| `StatePanel` + illustration | n/a — empty state: icon/illustration, title, one line, one action. | n/a | No. | Caller passes one action; by convention one. | No — kind changes icon and words; compact is text-only. | Yes — an empty/no-results state. |
| `ChatWelcome` | n/a — welcome: illustration, mark, title, description, one row of suggestions, tasks. | n/a — tasks 2-up from 28rem, rows below. | No. | Suggestion buttons + one action per task. | No. | Yes — an AI chat welcome. |
| `Banner` | n/a — one inline line + action; dismiss at the end. | n/a | No. | One action + labelled dismiss. | No — icon + tone + words. | Yes — an inline banner. |
| `PromoCard` | n/a — promo: media/illustration, title, description, one action, dismiss. | n/a | No. | One action + labelled dismiss ("Dismiss <title>"). | No. | Yes — an inline promo. |
| `SectionCard` | n/a — a module: title, description, header controls only, body, footer action/link. | n/a | No — a collapsed count is meta. | Header controls only; one footer/link; collapse named "<Collapse/Expand> <title>". | No. | Yes — a section module. |

### industry-conventions checks

| Component | 1. Familiar to Jira/Salesforce/GitHub users | 2. Rules followed (§) | 3. Nothing invented | 4. Accessibility (keyboard, focus, names, targets, announcements) |
|---|---|---|---|---|
| `AgentTaskCard` / `Row` / `Grid` | Yes | §1 cards, §3 status, §4 buttons, §11 progress, §13 truncation, §15 ACE, §17 responsive | No — card anatomy is Lark's plus standard header/footer | One action; ⋯ named; progressbar with value text; clamped title has a focusable tooltip; 24px+ controls; state in words. |
| `Illustration` + slots | Yes | §1 cards, §12 empty states, §17 responsive | No | Decorative (`aria-hidden`) unless `alt`; box reserved; no focusable content. |
| `CompanyLogo` fallback | Yes | §1 cards (identity), §13 truncation | No | Initials remain the name; `role="img"` + label when not decorative; no broken-image icon. |
| `NumberInput` | Yes | §6 forms, §4 targets | No | Visible label or `aria-label`; right-aligned tabular value; steppers named and 24px; commits on blur by default. |
| `TabsList` overflow | Yes | §9 tabs, §17 responsive | No | One row; More outside the tablist (axe clean); arrow-key roving kept; active pinned; More named with its count. |
| `FactGrid` | Yes | §6 forms (facts), §14 dates/numbers, §17 responsive | No | Real `dl`; copy button named "Copy <term>" + toast; numbers don't break; missing value says "Not set". |
| `MasterDetail` | Yes | §2 lists, §8 drawers/pages, §17 responsive | No | Named focusable regions; focus moves to the detail heading and back to the row; one Back control; no duplicate ids. |
| `RecordDrawer` | Yes | §8 drawers, §9 tabs, §17 responsive | No | Radix focus trap, Esc, focus returned to opener; title names the record; footer primary + close; full screen under 640. |
| `NotificationsPanel` | Yes | §7 feedback (notifications), §3 status, §9 segmented, §12 empty, §14 dates | No | Sheet focus trap/return; unread in words; each row's action named; counts in the filter; day groups have headings. |
| `DecisionPanel` | Yes | §6 forms, §3 status, §8 panels, §11 progress | No | Radio group named by the question; disabled option states why; required reason gated; status polite; sticky footer. |
| `VersionCompare` | Yes | §3 status, §14 dates/numbers, §17 responsive | No | Change is never colour-only; the switch is labelled; each value is read with Before/After. |
| `ImpactPreview` | Yes | §3 status, §11 progress-ish, §14 numbers, §17 responsive | No | Tone word for screen readers; warning visible in words; direction also evident from from→to; numbers don't break. |
| `StatePanel` + illustration | Yes | §12 empty/no-results/error, §17 responsive | No | Error states `role="alert"`; title level chosen by `titleAs`; text-only and left-aligned when compact. |
| `ChatWelcome` | Yes | §15 AI, §1 cards, §12 empty, §17 responsive | No | No eyebrow; title level configurable; suggestions are buttons; tasks 2-up/rows by width. |
| `Banner` | Yes | §7 feedback, §17 responsive | No | Negative is `role="alert"`, others `status`; dismiss named; one line; action has text. |
| `PromoCard` | Yes | §1 cards, §4 buttons, §7 feedback, §17 responsive | No | Dismiss named from the title; media hidden under 24rem by its own width; title level opt-in. |
| `SectionCard` | Yes | §1 cards, §5 headers, §17 responsive | No | Header controls only; collapse toggle named from the title; footer link/action; heading level opt-in. |

### Examples

Looked at `/examples/work`, `/examples/records`, `/examples/slots`, `/examples/width-matrix` and `/examples/components` at 1440 and 390 with Playwright screenshots (full-height for the four content pages, the component-matrix groups at 280/360/480/720/1080, and the open notifications panel and record drawer at both widths). Content is realistic (Northwind renewal, Halvorsen, Marlowe, Cedar & Field; real lengths and edge cases). Fixes the look prompted: the width-matrix row that said "Waiting" beside a "Pending" badge now says "Requested 2 hr ago"; the rows' trailing controls stay at the row end when wrapped. Nothing overflowed, and the only axe failure was the tablist structure above, now fixed.

Checks: `npm run lint` 0 errors (32 existing warnings) · `npm run lint:lark` ok · `npm run typecheck` ok · `npm test` 143 · `npm run verify` ok (build:lib + smoke:lib) · `npx playwright test` 65 passed.

Open:
- `TabsList`'s More trigger is now a sibling of the tablist (the tablist may hold only tabs). It sits directly after the visible tabs, not at the far right of the frame; confirm that reading.
- `NotificationsPanel`'s unread state is a neutral `StatusBadge` ("Unread" + dot) beside the time; it replaces the colour dot with an sr-only word. Confirm the tone (neutral, not sky/progress).
- `ListItem` trailing controls now `ml-auto` so they stay at the row's end when the row wraps under 12rem; this touches every list, not only AgentTaskRow.
- `ImpactPreview` shows "· Needs attention" after a warning row; confirm the separator (or whether the word should move to its own line).
- `design-standards.md` §4 says "primary first on the left in footers and forms"; every existing footer in Lark (DecisionPanel, DraftCard, UnsavedChangesBar, RecordDrawer) puts the secondary left and the primary right, as the screenshots do. I did not reorder the library: which wins?
- §4 also asks icon-only buttons to have a tooltip; Lark's ⋯, close and dismiss buttons have accessible names but no tooltip. Flag rather than adding a tooltip to every control.
- An `AgentTaskCard` with `state="running"` and no `progress` shows no bar (the caller must pass it). Should running imply an indeterminate bar?
- The component matrix renders overlay components closed; their open states are reviewed on `/examples/records` and in `width-matrix.spec.ts`.
