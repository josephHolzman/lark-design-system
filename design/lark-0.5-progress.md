# Lark 0.5 progress

Gap list: `deepgrids/apps/enterprise-workspace/docs/lark/lark-gaps.md` §1.

- [x] K1
- [x] K2
- [x] K8a
- [x] K8b
- [x] K8c
- [x] K8d

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
