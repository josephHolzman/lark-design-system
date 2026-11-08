# Lark 0.5 progress

Gap list: `deepgrids/apps/enterprise-workspace/docs/lark/lark-gaps.md` §1.

- [x] K1
- [x] K2
- [x] K8a
- [x] K8b
- [x] K8c
- [x] K8d
- [x] K8e
- [x] K8f
- [x] K8g
- [x] K8h

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

## K8f (2026-11-08)

Plan:
1. Inventory every runtime export in `src/components/lark` (plus the `graph` entry and the `ui` primitives it re-exports) with the `industry-conventions.md` sections it serves; skip the components K8e covered.
2. Read each against `design-standards.md` §1–§7 and its conventions in seven batches: cards and sections; lists and tables; forms and inputs; feedback and overlays; navigation; AI/ACE; data display.
3. Look at each batch in its example page at 1440 and 390 (Playwright screenshots) and in the component matrix at 280–1080.
4. Fix violations in the component, keeping the public API; add an optional prop where the caller has to supply context (row label, sort state, the item a repeated control acts on).
5. Update the examples with realistic Deepgrids content (fictional accounts only).
6. After each batch run `npm run lint`, `npm run lint:lark`, `npm run typecheck`, `npm test`; at the end `npm run verify` and `npx playwright test`; one commit per batch.

Handoff:
- The audit was code-first: every file in `src/components/lark` was opened and searched for the fault patterns (eyebrows, 12px non-meta, floating or repeated actions, unnamed icon buttons, colour-only status, truncation, dates, targets, drag-only controls), the changed components were read in full, and each corrected component was looked at in `/examples/components` (280/360/480/720/1080) and the composed examples (`/examples/patterns`, `/examples/deals`, `/examples/slots`) at 1440 and 390.
- Fixed this pass: the card footer pin and action alignment; object/entity/section text truncation; per-item names on repeated controls (ObjectCard star, DataGrid rows, ChangeReview, TurnActions, AiRunCell, ProactiveTask, EvidencePopover); row labels and controlled sorting in `DataGrid` (gaps G12/G13, which had not been built); a focusable Save while saving; `AppSidebar`'s hard-coded workspace row; SavedViewMenu's tabs without panels; radio arrow keys; touch-visible hover actions; sticky-bar focus clearance (grid and activity feed); exact timestamps on hover; and no eyebrow over any title (PageHeader folds one into the meta line; HeroBand shows it as a badge).
- Already covered by K8e (not re-listed below): `AgentTaskCard`, `AgentTaskRow`, `AgentTaskGrid`, `Illustration`, `CompanyLogo`, `NumberInput`, `TabsList`, `FactGrid`, `MasterDetail`, `RecordDrawer`, `DecisionPanel`, `ImpactPreview`, `StatePanel`, `ChatWelcome`, `PromoCard`. Four of them were touched again here: `SectionCard` (title clamp), `Banner` (`dismissLabel`), `NotificationsPanel` and `VersionCompare` (exact timestamp on hover).
- Exported hooks and constants (not components): `useTheme`, `themeEventName`, `themeScriptSource` (`theme.tsx`), `useNow`, `relativeTime` (`surfaces.tsx`), `useDirtyState`, `useLeaveGuard` (`feedback.tsx`), `useOverflow`, `splitOverflow` (`overflow.tsx`), `serviceKey`, `safeLogoSrc`, `initials` (`identity.tsx`), `offsetDuration` (`transcript.tsx`), `summarizeApprovals` (`approvals.tsx`), `PARTY` (`activity.tsx`), `BAND_TONE` (`bands.tsx`), `STATUSES` (`status-badge.tsx`), `STEP_STATE_LABEL` (`steps.tsx`), `provisionalEdge` (`surfaces.tsx`), `formatMoney` and the `money` helpers (`cpq.tsx`). Checked with their components; no changes.

### Inventory and conformance (component | sections checked | violations found | fixed? | API change)

| Component (file) | Sections | Violations found | Fixed? | API change |
|---|---|---|---|---|
| ActivityFeed (activity) | 1, 3, 7, 14, 17 | Relative time had no exact timestamp; a sticky day heading could cover a focused row; a cut reference had no title | Yes | — |
| ActivityFeedSkeleton (activity) | 11 | None | — | — |
| SituationSummary (activity) | 1, 3, 7 | None | — | — |
| AiColumnStatus (ai) | 11, 15 | None | — | — |
| AiRunCell (ai) | 2, 3, 11, 15 | "Run"/"Retry" repeated per row without the row's name | Yes | additive `itemLabel` |
| ConfidenceBadge (ai) | 3, 15 | None | — | — |
| EvidencePopover (ai) | 4, 8, 15 | "Why?" repeated per value without the value | Yes | additive `context` |
| PlanReview (ai) | 8, 15, 16 | None (move/remove named per step) | — | — |
| RunSteps (ai) | 11, 15 | None (idle has no spinner; states in words) | — | — |
| ActionTray (answer) | 4, 15 | None | — | — |
| AnswerBlock, AnswerSurface, SectionList (answer) | 1, 15 | None | — | — |
| AnswerSectionView, AnswerView (answer) | 1, 9, 15, 17 | No eyebrow; one status per answer | — | — |
| AnswerSkeleton (answer) | 11 | None | — | — |
| BarsWidget, ChartWidget, CompareWidget, TimelineWidget, WaterfallWidget (answer) | 2, 11, 14, 15 | None found (numbers in text, sources once) | — | — |
| Disclosure (answer) | 9, 15 | None | — | — |
| DraftWidget, FormWidget, QuestionWidget, OptionsWidget (answer) | 6, 9, 15 | None found (labels, options in words) | — | — |
| FlowWidget, LinksWidget, ListWidget, MasterWidget, MediaWidget, MessageWidget, NoteWidget, PropertiesWidget, QuoteWidget, StatsWidget, StepsWidget, TableWidget, TilesWidget, ToneText (answer) | 1, 2, 7, 11, 15, 17 | None found in this pass (matrix + axe cover them; see Open) | — | — |
| ApprovalPath, ApprovalPathSkeleton (approvals) | 2, 3, 8, 11 | None (state in words; disclosure names its approver) | — | — |
| HeroBand (bands) | 1, 4, 5, 17 | Eyebrow over the title | Yes | `eyebrow` now a badge beside the title |
| IllustratedChoiceCard (bands) | 1, 4, 5, 17 | None (whole card one link, name from visible words) | — | — |
| ActionCard (cards) | 1, 4, 5, 17 | Action floated mid-card, footers did not align | Yes | — (visual) |
| BestFor (cards) | 6 | None | — | — |
| CardLink (cards) | 4, 5 | None | — | — |
| ChecklistCard (cards) | 1, 11 | Title at the 24 step over a module of 20 | Yes | — |
| ChoiceCard (cards) | 1, 6 | Prompt at 14 (a body size) and unnamed radios | Yes | — |
| EntityCard (cards) | 1, 13 | Name and facts truncated with no full text | Yes | — |
| IconChip (cards) | 1 | None | — | — |
| ObjectCard (cards) | 1, 3, 4, 13, 17 | Star named only "Star" for every card, no tooltip; description cut with no full text | Yes | — (name changes) |
| ObjectFact (cards) | 3, 14 | None | — | — |
| TemplateCard (cards) | 1, 4, 17 | None | — | — |
| ActionsCell (cells) | 2, 4 | None (caller names the menu) | — | — |
| AvatarStack, TagsCell (cells) | 2, 3, 13 | None (full list in a tooltip and a name) | — | — |
| DateCell (cells) | 2, 14 | None (already exact on hover) | — | — |
| HoverActions (cells) | 2, 4, 17 | Hover-only on touch | Yes | — |
| MoneyCell, Num (cells, data) | 2, 14 | None (right-aligned, tabular) | — | — |
| PercentBarCell, ProgressCell (cells) | 2, 3, 11 | None (words as well as the bar) | — | — |
| RecordCell (cells) | 2, 13 | No way to give a link its row context | Yes | additive `linkLabel` |
| SparklineCell (cells) | 2, 14 | None | — | — |
| TextCell (cells) | 2, 13 | Truncated with no title | Yes | — |
| ActionReceipt, ActionReview (chat) | 3, 6, 7, 8, 16 | None (states in words, buttons can say why) | — | — |
| AnswerSources, Cite, Claim (chat) | 4, 8, 15 | None | — | — |
| AssistantTurn, TurnBlock, StreamingText, ThinkingRow (chat) | 7, 11, 15 | None | — | — |
| BranchSwitcher (chat) | 9, 15 | None | — | — |
| ChatColumn, SystemMark, TimeDivider, UserTurn (chat) | 1, 3, 7, 14, 15 | None found (times remain caller strings; see Open) | — | — |
| ClarifyQuestion, ComposerNotice, QueuedFollowUps, ReplyError, ScreenSessionNotice, StoppedNotice (chat) | 6, 7, 8, 11, 15 | None found (one next step each; request ID shown) | — | — |
| ConflictCompare, InjectionNotice, JumpToLatest (chat) | 3, 4, 7, 15 | None | — | — |
| ConversationListItem (chat) | 2, 3, 14, 15 | Unread is a dot plus a bold title; see Open | No — Open | — |
| DraftCard (chat) | 6, 15, 16 | None | — | — |
| ModeSwitch (chat) | 4, 6, 15 | None (modes above the ceiling visible with the reason) | — | — |
| ProactiveTask (chat) | 1, 4, 15 | Action repeated per task without its task | Yes | — (name changes) |
| ToolCallRow, WorkLog (chat) | 11, 15 | None | — | — |
| ChatComposer, ChatLayout, ChatPanel, Reasoning, SuggestionChips (conversation) | 1, 4, 6, 7, 8, 11, 15, 17 | None | — | — |
| TurnActions (conversation) | 4, 15 | Copy/Regenerate/votes repeated per turn without the answer | Yes | additive `context` |
| ApprovalMatrix, ApprovalRoute (cpq) | 1, 2, 3, 6, 8 | ApprovalRoute's approver cards are bordered cards inside a module (see Open); names cut without a title | Partly | — (titles only) |
| BlockedReason, DiscountMeter, PolicyChecks, SourceLine (cpq) | 2, 3, 7, 11, 14 | None (each result in words with its source) | — | — |
| CountUp, DealFigures (cpq) | 1, 11, 14 | None (exact figures, source per figure) | — | — |
| CpqStages (cpq) | 3, 11 | None (state in words, record's own labels) | — | — |
| InvoiceSchedule, OrderMatch (cpq) | 2, 3, 14 | None (numbers right-aligned, ≠ named) | — | — |
| PriceWaterfall (cpq) | 2, 14 | None | — | — |
| QuoteLines (cpq) | 2, 3, 6, 14, 17 | None (status once with its line; numbers right) | — | — |
| ScenarioCompare (cpq) | 2, 3, 14 | None | — | — |
| DataGrid (data-grid) | 2, 3, 6, 11, 12, 13, 17 | Row controls all named "Select row N"/"Show details"; no controlled sorting; no trailing header; focus could sit under the sticky header | Yes | additive `getRowLabel`, `sorting`, `onSortingChange`, `trailingHeader` |
| SortableHead, TablePager, SourceList (data) | 2 | None | — | — |
| SourceChip (data) | 3, 13 | Cut label with no title | Yes | — |
| ChangeReview (editing) | 3, 4, 6, 7, 16 | Accept/Reject/Undo repeated per row without the field | Yes | — (name changes) |
| DiffValue (editing) | 2, 3 | None (was/now for screen readers) | — | — |
| InlineEdit (editing) | 4, 6, 7 | A cut value had no full text for pointer users | Yes | — |
| Callout (feedback) | 7 | None | — | — |
| DirtyMark (feedback) | 3, 6 | None (word, not colour alone) | — | — |
| SaveStatus (feedback) | 3, 7, 11 | None | — | — |
| SkeletonCard, SkeletonFigure, SkeletonLines (feedback) | 11 | None | — | — |
| UnsavedChangesBar (feedback) | 4, 6, 7, 16 | Saving disabled Save and dropped focus mid-Tab | Yes | behaviour (see below) |
| Figure, FigureCard (figure) | 1, 3, 4, 14 | None (label 14, whole card one link, caption described) | — | — |
| FigureStrip (figure) | 2, 14, 17 | None (one size per strip, columns by its own width) | — | — |
| Meter, Sparkline (figure) | 3, 11, 14 | None (meter names its value) | — | — |
| FilterBar, FilterCount (filters) | 10 | None | — | — |
| FilterChip (filters) | 4, 10 | None (pressed state and check) | — | — |
| FilterSearch (filters) | 4, 6, 10 | None (label always present) | — | — |
| Segmented (filters) | 9, 10, 17 | None (More outside the track's list semantics) | — | — |
| GraphEdgeLabel, GraphNode (graph) | 1, 3, 14, 15 | None (words beside every mark) | — | — |
| AceMark, PersonAvatar, ServiceLogo, ServiceStack (identity) | 1, 3, 14, 15 | None (marks decorative, names beside them) | — | — |
| CreateDrawer (layouts) | 4, 6, 8 | None | — | — |
| DashboardGrid, DashboardLayout (layouts) | 1, 17 | None | — | — |
| HeaderBand (layouts) | 5 | None | — | — |
| ListLayout (layouts) | 2, 10, 17 | None (rail becomes a disclosure) | — | — |
| RecordLayout, RecordPeek (layouts) | 5, 8, 17 | None | — | — |
| SettingsLayout, SplitView (layouts) | 2, 8, 9, 17 | None (named focusable panes) | — | — |
| CountPill (lists) | 3 | None | — | — |
| DescriptionItem, DescriptionList (lists) | 2, 6, 17 | None (stacks under 22rem) | — | — |
| List, ListItem (lists) | 2, 3, 4, 17 | None (trailing controls stay at the end) | — | — |
| ActionMenu (menus) | 2, 4, 8, 16 | None (destructive last, disabled say why) | — | — |
| ColumnsPanel (menus) | 2, 4, 17 | Move buttons hover-only on touch | Yes | — |
| CountSegments, FacetList (menus) | 4, 9, 10, 17 | Radios did not answer arrow keys; every item was a Tab stop | Yes | keyboard behaviour |
| FacetFilterMenu (menus) | 4, 10 | Checkboxes had no accessible name | Yes | — |
| SavedViewMenu (menus) | 4, 8, 10 | `role=tablist` with no tabpanel or arrow keys | Yes | semantics |
| SplitButton (menus) | 4 | None | — | — |
| VerticalNav (menus) | 4, 9 | None (links when they go to pages) | — | — |
| MoreLabel, OverflowMeasure (overflow) | 4, 9, 17 | None | — | — |
| PageHeader (page-header) | 5, 17 | Rendered an eyebrow over the title | Yes | deprecated `eyebrow` (moves to the meta line) |
| PageTabs (page-header) | 4, 9, 17 | None (More keeps the current tab) | — | — |
| ApprovalChain, StageProgress (progress) | 2, 3, 8, 11 | None (state in words, 24px markers) | — | — |
| Timeline, TimelineItem (progress) | 2, 3, 14 | No exact timestamp on hover | Yes | — |
| LarkLink, LarkProvider (provider) | 4 | None | — | — |
| AppShell (shell) | 5, 17 | None (page content is the main landmark) | — | — |
| AppSidebar (shell) | 2, 3, 4, 17 | Workspace menu hard-coded entries | Yes | additive `workspaces` |
| AskAceButton (shell) | 4, 15 | None (busy, expanded, controls) | — | — |
| ScopePill (shell) | 3, 14 | None | — | — |
| SearchCommand (shell) | 4, 10 | Results with an `href` were buttons, not links | Yes | — |
| ThemeToggle, Topbar, TopbarIconButton (shell) | 4, 5, 17 | None (names and tooltips; pressed state) | — | — |
| UserMenu, UserMenuSection, UserMenuSub (shell) | 4, 8 | None | — | — |
| UserMenuItem (shell) | 4, 8 | A cut item had no full text | Yes | — |
| UserMenuRadioGroup (shell) | 4, 8 | None (menuitemradio, checked state) | — | — |
| StatusBadge (status-badge) | 3 | None (icon + word + tone) | — | — |
| StepList (steps) | 3, 11 | None (state in words, 24px markers) | — | — |
| CardStatusFooter, TrayCard (surfaces) | 1, 3 | None | — | — |
| CompoundTag, ProvisionalBadge, Freshness (surfaces) | 3, 14 | None (words; Freshness has its exact time) | — | — |
| Tray (surfaces) | 1, 5, 17 | Title at the 14 body size | Yes | — |
| ClampText, NoBreak, TruncateText (text) | 13 | None (the reference implementation) | — | — |
| ThemeScript (theme) | — | None | — | — |
| Transcript, TranscriptLine (transcript) | 2, 3, 14 | None (mono time as `<time>`; offsets as durations) | — | — |

`ui/` primitives (`@deepgrids/lark/ui`) were checked where they surface in these components (Button targets 24/28/32, Checkbox/Radio/Input labels, Tabs, Select). Their own convention review is not part of this pass; the K8a–K8c gap rows that touched them were already fixed in 0.6–0.8.

### design-standards §7 answers (library level)

1. **Card order:** the cards that carry it (`ActionCard`, `ObjectCard`, `AgentTaskCard`, `SectionCard`, `Tray`) keep identity · title + badge · byline · controls, a full-width body and a pinned footer; cards without a footer say so by omitting it.
2. **Row alignment:** `ActionCard` now pins its action (`mt-auto`), `ObjectCard` and `SectionCard` keep `mt-auto`/flex growth; the component matrix has every card in a row the same width and height.
3. **12px non-metadata:** none found; `lark-lint` passes on all of `src/components/lark` and `src/app/examples`.
4. **Visible actions / icon names:** every icon-only control has an accessible name; the repeated ones now include their item (rows, cards, turn actions, run cells, change review). Tooltips: see Open.
5. **Colour/shape alone:** statuses are icon + word; bars and meters carry `aria-valuenow`/`aria-valuetext` or words; activity parties, approvals and policy checks all have words.
6. **Recognisable structure:** each component maps to a standard pattern (card, table, field, banner/toast, dialog/drawer, tabs, filter, empty state, progress, diff); no invented interaction replaced a standard one.

### Breaking or deprecated

- **`PageHeader` `eyebrow`**: deprecated. It still compiles, but it no longer renders above the title; the value appears in the meta line under the title. No other prop changed.
- **`HeroBand` `eyebrow`**: same prop, now a badge beside the title (visual change only).
- **`ObjectCard` star name**: `aria-label` is now "Star/Unstar <title>" (was "Star"). Tests and tools that looked for "Star" need the card's title.
- **`UnsavedChangesBar` Save**: while `saving` it is no longer `disabled`; it sets `aria-busy` and `aria-disabled` and ignores the press. A test that asserted `disabled` must change.
- **`AppSidebar`**: the hard-coded "Northwind sandbox" entry is gone. Pass `workspaces` to keep a switcher; the default is this workspace plus "All spaces".
- **`SavedViewMenu`**: the Created by me / Shared with team control is a pressed-filter group, not a `tablist` (same look; no tabpanel semantics).
- **`FacetList`, `CountSegments`**: radios now use a roving tab index, so Tab enters the group once and arrows move within it (was one Tab stop per item).
- **`DataGrid`**: `initialSorting` still works; `sorting` + `onSortingChange` take over when passed. `getRowLabel` changes the row controls' names (from "Select row N"/"Show details") and `trailingHeader` adds a header cell and an empty body cell per row.

### Examples

- `/examples/components`: `DataGrid` sample now shows `getRowLabel` and a trailing "Add column"; cards render the corrected footers, star names, clamps and titles in the 280–1080 frames.
- `/examples/deals`: rows are named "<type> · <account>" for their checkboxes and details toggles.
- `/examples/slots`: the rows-per-page grid names its rows and shows the trailing header.
- `/examples/patterns`: the Hero band note says the role is a badge beside the title.
- Screenshots read at 1440 and 390: `/examples/patterns` (band and choice cards), `/examples/deals` (grid, filters, banners), `/examples/slots` (grid with rows per page and the trailing header), and the cards group of `/examples/components`. Nothing overflowed or wrapped; the only visual correction from the look was removing `sticky` from the trailing header cell, which had covered the value column at 390.

Checks: `npm run lint` 0 errors (32 existing warnings) · `npm run lint:lark` ok · `npm run typecheck` ok · `npm test` 146 · `npm run verify` ok (build:lib + smoke:lib) · `npx playwright test` 65 passed.

Open:
- **Icon buttons still have names but no tooltips.** `design-standards.md` §4 and industry-conventions §4.5 want both. This pass added a tooltip where a name alone was ambiguous (`ObjectCard`'s star); adding a tooltip to every ⋯, close, dismiss and collapse control is a library-wide change K8e flagged and this pass did not make. Which wins: a tooltip on every icon-only control, or the names only?
- **`ApprovalRoute`** still draws each approver as a bordered card inside a `SectionCard` (industry-conventions §1.8: no cards in cards). `ApprovalPath` (the 0.7 component) is the lane/row form; moving `ApprovalRoute` to it changes the approval examples. Should `ApprovalRoute` be deprecated in favour of `ApprovalPath`?
- **`HeroBand`'s role badge / `PageHeader`'s folded eyebrow:** G5 asked for an eyebrow; the standards forbid one over a title. I kept the information (badge beside the title; meta line) — confirm the workspace accepts that reading.
- **Answer widgets** (`AnswerView`'s 14 widget renderers) were covered by the component width matrix, the axe pass and a read of `AnswerView`/`AnswerSkeleton`, not a line-by-line audit of every widget. No check failed on them; a deeper pass may still find wording or alignment faults.
- **Chat times** (`UserTurn` `time`, `AssistantTurn` `agent.time`) are caller strings, so they are not `<time>` with a machine-readable value or an exact timestamp on hover. Adding `dateTime` would be an API change; do the app's chat surfaces need it?
- **`ChoiceCard`**'s Continue stays disabled until a choice, which §4.6 normally forbids; LARK v0.3 documents it for this card ("Continue disabled until chosen"). Keep the documented exception?
- **`ConversationListItem`** shows unread as a dot plus a bold title, with the word only for screen readers; `NotificationsPanel` now uses a visible "Unread" badge. Should the conversation row show the word too (it adds a chip to every unread row)?
- **`SavedViewMenu`**'s view list is a `listbox` whose options are Tab stops; arrow-key navigation is still missing. I fixed the false `tablist` above it but not the listbox roving focus; worth doing with a shared listbox helper?
- **`DataGrid` trailing header:** the last header cell now sits at the end of the horizontal scroll (not sticky, so it never covers values). At 390 the Add column control is off-screen until the user scrolls sideways; confirm that is better than a pinned control over the number column.
- **`HoverActions`** becomes visible under `pointer: coarse`; jsdom cannot evaluate that media query, so only the Playwright matrix exercises it.
- **Sticky bars and focused controls:** the grid gets `scroll-padding-top` and activity rows get `scroll-mt`, but `UnsavedChangesBar` (sticky to the bottom) can still cover a focused control in the page behind it. A page-level `scroll-padding-bottom` is the caller's layout decision; say if Lark should own it.
- **`SectionCard` `action`** still accepts text actions even though §5 says controls only; the prop is typed `ReactNode` and the examples pass icon menus. Enforce it with a type or leave it documented?

## K8g

Plan:
1. Read part 2 §18–21, the standards, part 1 and the K8e/K8f handoffs; inventory every component part 2 governs and its example.
2. §19: summarizeApprovals names the current waiters with role, since when and why; ApprovalPath puts parallel approvers side by side, shows delegation, and DecisionPanel takes per-decision reasons, an acting-for line and a non-approver view with no controls.
3. §21: ActivityFeed marks ACE apart from people and systems, reads actor · action · object · relative time with the exact time on focus, collapses routine sync noise, holds "N new updates" until asked, and describes its empty state; SituationSummary gains "since".
4. §20: agent tasks gain pause/resume and stop in one action, a paused state, completed/next steps and a failed "Needs" line; ChatWelcome gains capability boundaries; ImpactPreview gains target, size and reversibility; VersionCompare marks an ACE version.
5. §18: NumberInput announces its unit; QuoteLines says "Discount (%)", counts exceptions with links, pins its summary and shows "Recalculating…"; one edit model per screen.
6. Update the examples with invented Deepgrids content; look at each at 1440 and 390 in Playwright screenshots.
7. Run each check in its own call; one commit per group; handoff with the conformance tables, "Needed for 0.9" and Open.

Handoff:
- Audited the part-2 components file by file against §18–21 and fixed the component, then the examples. Looked at `/examples/approvals`, `/examples/deal-activity`, `/examples/work`, `/examples/quote` and `/examples/chat-states` at 1440 and 390 in Playwright screenshots (the full page through the app's scroll container), plus the component matrix at 280–1080 through its e2e checks. All names, accounts and amounts are invented (Northwind, Halvorsen, Cedar & Field).
- §19: `ApprovalPath`'s summary now names the current stage's people, their role, how long and why ("Waiting on Priya Raman (Pricing) and Marcus Bell (Finance) · 6 hr · Discount 22% is above the 15% floor") instead of listing every later stage; delegation is visible under the name and in the row's accessible name; parallel approvers sit side by side only when their stage is at least 26rem of its own width, so they stack at 390. `DecisionPanel` takes a reason per answer (Approve optional; Request changes and Reject required), an `actingFor` line for delegation, and a `canDecide={false}` view that shows the answers as status, no inputs and no buttons, and names who to ask. `ApprovalPathSkeleton` can hide the summary.
- §21: `ActivityFeed` adds the ACE party (the ACE mark, not a generic sparkle), an object slot, relative times with the full timestamp on hover and keyboard focus, `noise`/`detail` for routine automation (one quiet line with Show; the audit detail stays), and holds entries added after mount behind "N new updates" with a polite announcement; a fresh record starts a fresh feed. The default empty copy says what will appear. `SituationSummary` gains `since`.
- §20: `AgentTaskCard`/`AgentTaskRow` add a paused state, pause/resume and stop as one ⋯ action while running or paused, Done/Next steps in words, and a failed "Needs: …" line. `AgentTaskGrid` passes all of it through. `ChatWelcome` gains the three capability lists; `ImpactPreview` names the target, the size and whether it can be undone; `VersionCompare` marks an ACE-prepared side once.
- §18: `NumberInput` describes its unit to screen readers and keeps a caller's `aria-describedby`. `QuoteLines` says "Discount (%)", counts exceptions above the lines with a link to each line (separate anchors per instance), pins its summary at the bottom in both layouts, says "Recalculating…" instead of showing a stale total, edits quantity and discount on phones too, keeps the quantity unit visible, and shows a lock banner with the reason, the person waited on and Recall. The quote page now shows the read-only, editable and locked line sets.
- The `Segmented` filter painted its items outside its box before the overflow measurement ran; its root is now `overflow-x-clip`.

### §19–21 / §18 conformance (component | sections | violations | fixed? | API change)

| Component | Sections | Violations found | Fixed? | API change |
|---|---|---|---|---|
| `ApprovalPath` (approvals) | 19 | Summary listed every later stage, not who waits now; no since-when or why; parallel approvers always stacked inside their step; delegation only in the disclosure | Yes | additive `Approver.delegation` |
| `summarizeApprovals` | 19 | Sentence named roles only, omitted names, since-when and reason; `waitingOn` included later stages | Yes | `waitingOn` now means current-stage roles; adds `waiting`, `currentStage`; sentence reworded |
| `ApprovalPathSkeleton` | 19, 11 | Could not hide the summary when its module already said it | Yes | additive `hideSummary` |
| `DecisionPanel` | 19 | One reason required for every answer, so Approve required a comment; no delegation; no non-approver view with no controls | Yes | additive `DecisionOption.requiresReason`, `actingFor`, `canDecide`, `ask`; the reason requirement follows the answer |
| `ActivityFeed` (activity) | 21 | Exact time only on hover; no relative time; no ACE party; routine syncs looked like normal system events; new entries moved the list; empty copy named nothing; no object slot | Yes | `ActivityParty` adds `ace`; `ActivityEntry` adds `object`, `noise`, `detail`; later entries held behind "N new updates" |
| `ActivityFeedSkeleton` | 11, 21 | No day-heading shape | Yes | — |
| `SituationSummary` | 21 | No "since" line | Yes | additive `since` |
| `AgentTaskCard` | 20 | A running task had no pause/stop the component owned; no paused state; failed tasks named no need; progress lacked done/next | Yes | `AgentTaskState` adds `paused`; additive `onPause`, `onStop`, `needs`, `AgentTaskProgress.completed/next` |
| `AgentTaskRow` | 20 | Same controls and failure context were missing in the row | Yes | same additive props |
| `AgentTaskGrid` | 20, 17 | None (passes the new props through) | — | — |
| `ChatWelcome` | 20 | Said nothing about what ACE does alone, asks about, or cannot do | Yes | additive `capabilities` |
| `ImpactPreview` | 20 | Named the change but not the target, its size or reversibility | Yes | additive `target`, `size`, `reversible` |
| `VersionCompare` | 20 | An ACE-prepared revision carried no ACE mark | Yes | additive `VersionSide.ai` |
| `NumberInput` | 18, 6 | The visible unit was aria-hidden, so an empty field never said what it counted | Yes | `aria-describedby` now includes an sr-only unit; caller's value kept |
| `QuoteLines` (cpq) | 18 | Header said "Discount", not "Discount (%)"; exceptions were not counted or linked above the table; the summary scrolled away; no "Recalculating…"; phones could not edit; a submitted quote had no lock/recall; the quantity plus unit cut "180,000"; error wording differed between cell and summary | Yes | additive `recalculating`, `locked`; phone cards are editable; summary sticky; error word "Can't be priced"; row anchors are per instance |
| Editable data grid | 18.9 | `DataGrid` is not a spreadsheet (one tab stop, arrows, Enter/F2) | No — Needed for 0.9 | — |
| `Segmented` (supporting) | 21 | Items painted outside the control before the fold measured | Yes | root `overflow-x-clip` (visual) |

### Breaking or deprecated

- **`summarizeApprovals`**: `waitingOn` is now the current stage's roles, not every later stage; `sentence` now reads "Waiting on <name> (<role>) · <since> · <why>" (or "Blocked: <name> (<role>) returned it…"). Any exact-string test needs the new wording. `waiting` and `currentStage` are additive.
- **`AgentTaskState`** gains `"paused"`: an exhaustive `switch` over the state in a caller needs a case. `ActivityParty` gains `"ace"` for the same reason.
- **`ActivityFeed`** holds entries added after mount behind "N new updates" (one click to release). A caller that expects a streamed list to move immediately should account for the banner.
- **`QuoteLines`**: the discount header is now "Discount (%)"; the summary is `sticky bottom-0`; the phone cards are editable when `editable`; a locked quote stops editing even when `editable` is set; the validation word is "Can't be priced"; two QuoteLines on one page no longer share row ids.
- **`NumberInput`**: the field's `aria-describedby` now includes an sr-only "Unit: %" (a caller's existing value is kept). A strict accessible-description test will see the extra description.
- **`Segmented`**: its root clips horizontally (no visual change when it folds; it stops pre-hydration spill).
- Deprecated: none.

### Needed for 0.9

| Pattern | Section | Why |
|---|---|---|
| **ApprovalCard for ACE actions** | 20.4 | The exact payload (email text or the fields with before → after), the target system, the size ("12 quote lines · $48,200"), whether it can be undone, and Approve / Edit / Reject. `ActionReview` has two actions and no edit slot; `DecisionPanel` is a decision form; `ImpactPreview` previews the change but cannot approve it. |
| **EditableDataGrid** | 18.9 | The spreadsheet keyboard model (one tab stop, arrows, Enter/F2, Esc, no wrapping at the ends) and a per-cell edit/validation model. `QuoteLines` is an ordinary table whose editable cells are inputs in tab order; `DataGrid` is not editable. |
| **CapabilityBoundaries** | 20.1 | The same three lists `ChatWelcome` now shows ("Works on its own", "Asks before", "Can't do") as a component the Settings page can use. |
| **Activity filters by actor and date** | 21.4 | `ActivityFeed` filters by party only. Long feeds need an actor picker and a date range; today the caller must filter the entries before passing them. |
| **Approval queue** | 19.7 | The "Waiting for you" list (item, submitter, amount, reason routed, age, oldest first, count, next item after deciding) can be composed from `DataGrid`/`List`; a dedicated preset would keep the wording and ordering consistent. |

### Examples

- `/examples/approvals`: the summary names Priya and Marcus with "6 hr" and the reason; the stages show delegation; two new sections show the decision as the current approver sees it (Approve/Request changes/Reject, per-answer reason, facts, acting for Dana Lee) and the non-approver view (status, who to ask, no buttons). Read at 1440 and 390; parallel approvers stack at 390.
- `/examples/deal-activity`: ACE and system marks, object phrases, relative times, a collapsed "Salesforce sync updated 14 fields · Show", a "Show how a new update arrives" button, and a `since` line. Read at 1440 and 390.
- `/examples/work`: a running task with Done/Next and pause/stop in the ⋯ menu, a paused task, a failed task with "Needs: …", and target/size/reversibility on the impact preview. Read at 1440 and 390 (the grid becomes rows).
- `/examples/quote`: three line sets — read-only, editable (inputs on both layouts, exceptions linked above, pinned summary, "Recalculating…" on a change) and locked (reason, waiter, Recall). Read at 1440 and 390.
- `/examples/chat-states`: the welcome now shows the three capability lists, stacked under 22rem. Read at 1440 and 390.
- `/examples/components`: samples updated for every new prop; the matrix checks at 280–1080 pass.

Checks: `npm run lint` 0 errors (32 existing warnings) · `npm run lint:lark` ok · `npm run typecheck` ok · `npm test` 162 · `npm run verify` ok (build:lib + smoke:lib) · `npx playwright test` 65 passed.

Open:
- **Activity timestamps are now tab stops.** The exact time is on a focusable `<time>` (one per entry) so keyboard users get what hover users get, per §21.2. Confirm that extra tab stop per row, or move the exact time into a button/tooltip pattern shared with `Freshness`.
- **"N new updates" uses the entry ids at mount.** If a parent replaces the list but keeps one of the old ids, the other entries are treated as new and held. Confirm the workspace's data shape (a per-record feed should replace all ids).
- **`DecisionPanel` still has one primary ("Record decision").** The three answers are radio options; if the product wants Approve / Request changes / Reject as three buttons with their own disabled rules, that is the ApprovalCard in Needed for 0.9.
- **Routine noise is opt-in.** A sync entry is collapsed only when the caller sets `noise`; an unmarked sync shows as a normal system event. Confirm the app marks routine syncs.
- **`ChatWelcome` capability lists** are new copy on the welcome. The Settings page must show the same three lists (Needed for 0.9) so the promise matches the controls.
- **The sticky quote summary** can cover a focused input at 390; the page needs `scroll-padding-bottom` (the same note as K8f's sticky bar). `QuoteLines` adds `scroll-mb-28` to its rows but cannot set the page's scroll padding.
- **`AgentTaskCard` cannot invent pause/stop.** The ⋯ menu offers them only when the caller passes `onPause`/`onStop`. Should `state="running"` require them at the type level?
- **`VersionCompare` marks an ACE side only with `ai`.** The app must set `ai` when ACE prepared the revision; otherwise the revision looks human-made.
- **`Segmented` clips horizontally before the fold runs.** At a cold hydration the last filter option can be clipped for a moment before it moves into More. The final layout is correct.
- **Approval summary length.** With several current approvers, "Waiting on A (role) and N others · since · reason" is one sentence; confirm it still reads in five seconds at 390.
- **`QuoteLines` locked banner is rendered in both layouts** (one hidden by CSS). This matches the existing summary duplication; screen readers see one because the other is `display:none`.

## K8h (2026-11-08)

Plan:
1. `scripts/shots.mjs`: every `/examples` route at 390, 768, 1440 (light) and 1440 (dark), full page into `.snapshots/k8h/`; assert pixel width = viewport width and no two captures of a route share a hash; `npm run lark:shots`.
2. Read every PNG; one table row per component (route, files read, sections checked, what I saw, violations, fixed).
3. Deals: one toolbar row at 1440 (right group folds into "View options" below xl); low-priority columns off by default and a labelled, focusable scroll region with an edge shadow; one banner and the access note inline under the header; neutral Type tags; visible "Page" label in the pager; the example's Preview state toolbar moved above the module and marked example-only.
4. Cards: `ChecklistCard` places the completion meta under the title below 22rem of card width (container query); `ChoiceCard` keeps a label and its Recommended badge together.
5. Audit every other route from the captures; fix what the images show (page gutters included).
6. Each check in its own call; commits per batch "K8h: <batch> verified at 390/768/1440"; finish with the handoff table, Breaking or deprecated and Open.

Handoff:
- `scripts/shots.mjs` captures every route under `/examples` (18 routes) full page at 390, 768 and 1440 light and 1440 dark into `.snapshots/k8h/<route>-<width>[-dark].png`; it fails when a PNG's pixel width differs from its viewport (horizontal overflow) or when two captures of one route are byte-identical. `npm run lark:shots` reuses the `next dev` on port 3107 from `playwright.config.ts` (starting and stopping it when absent). 72 captures, all assertions pass. I read the route captures and, for the component matrix, per-group crops at 280 and 1080 in `.snapshots/k8h/groups/` (generated by an untracked helper; the matrix route capture shows the 280 frame at 390).
- The seven defects: (a) one toolbar row at 1440 — view · filters · search · owner left, group by · density · columns right; below xl the right group is a single "View options" popover with group by, density and the ColumnsPanel. (b) the default visible columns are Deal, Status, Net value, Platform discount and Actions (the others start in Columns), and the grid's overflow region is named, focusable and shows a right-edge gradient until the last column is in view. (c) only the Salesforce sync banner renders; the access note is a lock + sentence + link under the page header. (d) every deal Type is a neutral tag. (e) `DataGrid`'s page select has a visible "Page" label, with "1–12 of 24" and previous/next unchanged. (f) the example's Preview state switcher sits in a bar above the page, marked "Example only". (g) `ChecklistCard` moves "1 of 3 completed" under the title below 22rem of its own width; `ChoiceCard` keeps a label and its Recommended badge together.
- Two further faults the images showed and this pass fixed: `GraphNode` cut its title and meta with no way to read them in full (now `TruncateText`), and `ListItem` cut a headline with no full text for pointer users (now a `title` on the row). Approvals, Deal activity and Foundations had no page gutter; they match the other examples now.
- Checks: `npm run lint` 0 errors (32 existing warnings) · `npm run lint:lark` ok · `npm run typecheck` ok · `npm test` 162 passed · `npm run verify` ok (build:lib + smoke:lib) · `npx playwright test` 65 passed · `npm run lark:shots` 72 captures, width/hash assertions pass.

### One row per component

Screenshot file names are under `.snapshots/k8h/`; `groups/<file>-1080-clean.png` and `-280-clean.png` are the matrix group crops. "None — …" says what was looked at in the image.

| Component | Example route | Screenshot files read | Sections checked | What I saw | Violations | Fixed? |
|---|---|---|---|---|---|---|
| ActivityFeed | /examples/deal-activity, /examples/components | deal-activity-390.png, groups/activity-tsx-1080-clean.png | DS 1,3,7,14; IC 3,7,14,21 | Day dividers; Customer, ACE, system and internal rows with mark + word; object line; relative times; "Salesforce sync updated 14 fields · Show" | None — the 1080 crop showed every party and the collapsed sync row without clipping | n/a |
| ActivityFeedSkeleton | /examples/components | groups/activity-tsx-1080-clean.png | DS 11; IC 11 | Day-heading bar and five row skeletons at the real row shape | None — skeleton only, no copy or controls | n/a |
| SituationSummary | /examples/deal-activity, /examples/components | deal-activity-390.png, groups/activity-tsx-1080-clean.png | DS 3,7; IC 3,7,21 | "Blocked", the buyer sentence, "Since 9:40 AM…", "Next…" and one action; tint + icon + word | None — status never colour alone; action has text | n/a |
| AiColumnStatus | /examples/deals, /examples/components | deals-1440.png, groups/ai-tsx-1080-clean.png | DS 3,11; IC 3,11,15 | "8 of 12, 1 failed" with a progress track and a run control | None — count and failure are in words | n/a |
| AiRunCell | /examples/deals, /examples/components | deals-1440.png, groups/ai-tsx-1080-clean.png | DS 3,11; IC 2,3,11,15 | Idle "Click to run", "Running…", "At risk" + Why, and the timeout error + retry | None — every state is words; rows are named from the row label | n/a |
| ConfidenceBadge | /examples/components | groups/ai-tsx-1080-clean.png | DS 3; IC 3,15 | Three bars + High/Medium/Low confidence | None — icon + word, not colour alone | n/a |
| EvidencePopover | /examples/deals, /examples/components | deals-1440.png, groups/ai-tsx-1080-clean.png | DS 4,8; IC 4,8,15 | "Why?" trigger per value; panel closed in the crop | None — the trigger name carries its value (K8f context prop); open state is in the axe and unit suites | n/a |
| PlanReview | /examples/work, /examples/components | work-390.png, groups/ai-tsx-1080-clean.png | DS 8; IC 8,15,20 | Three one-line steps, a "Needs your OK" tag, move/remove controls, Cancel + "Approve and run" | None — approval comes before the run; each control names its step | n/a |
| RunSteps | /examples/work, /examples/components | work-390.png, groups/ai-tsx-1080-clean.png | DS 11; IC 11,15 | One running step with "1 of 3 steps"; no spinner when idle | None — idle shows no motion | n/a |
| ActionTray | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 4,15; IC 4,15 | Text actions under an answer | None — verb labels, one primary | n/a |
| AnswerBlock | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 1,15; IC 1,15 | Titled blocks with body and sources, 14 body text | None — title before body; no eyebrow | n/a |
| AnswerSurface | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 1,15; IC 1,15 | Answer card frame with consistent padding | None — full-width body | n/a |
| SectionList | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 1,15 | Sections separated by rules, no nested cards | None — one section per heading | n/a |
| AnswerSectionView | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 1,9,15; IC 1,9,15 | Section heading + body; no duplicate status | None — one status per answer | n/a |
| AnswerView | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 1,9,15; IC 1,9,15 | Whole answer at 1080 with sources once | None — status and provenance appear once | n/a |
| AnswerSkeleton | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 11; IC 11 | Text-shaped skeleton, aria-busy frame | None — no spinner | n/a |
| BarsWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,11; IC 2,11,14 | Labelled bars; values in text | None — numbers are readable and not colour-only | n/a |
| ChartWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,11; IC 2,11,14 | Line chart with axis labels and summary | None — the chart has a text summary | n/a |
| CompareWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,14; IC 2,14 | Two-column comparison with signs | None — direction in words/icon, not colour only | n/a |
| TimelineWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,14; IC 2,14 | Dated rows in order | None — dates as text | n/a |
| WaterfallWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,14; IC 2,14 | Waterfall bars with labels and amounts | None — amounts in text | n/a |
| Disclosure | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 9,15; IC 9,15 | "Show …" disclosure with a named trigger | None — trigger says what it reveals | n/a |
| DraftWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 6,15; IC 6,15 | Draft text with labelled actions | None — actions are verbs | n/a |
| FormWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 6,15; IC 6,15 | Labels above fields, one column | None — visible labels | n/a |
| QuestionWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 6,9,15; IC 6,9,15 | Question + radio options with visible labels | None — the group is named by the question | n/a |
| OptionsWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 6,9,15; IC 6,9,15 | Option rows with labels and descriptions | None — no unlabelled radios | n/a |
| FlowWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,11; IC 2,11 | Flow steps in order with words | None — state in words | n/a |
| LinksWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 4,15; IC 4,15 | A labelled link list | None — links read as links | n/a |
| ListWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,15; IC 2,15 | Dense list rows, text at 14 | None — no 12px non-meta | n/a |
| MasterWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 1,8; IC 1,8 | A record summary card | None — one subject per card | n/a |
| MediaWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 1,15; IC 1,15 | Image with caption | None — decorative picture with text beside it | n/a |
| MessageWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 7,15; IC 7,15 | A drafted message with copy | None — quoted text is 14 | n/a |
| NoteWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 7,15; IC 7,15 | A tinted note with an icon and words | None — meaning in words | n/a |
| PropertiesWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,6; IC 2,6 | Term/value pairs | None — values are text, not chips | n/a |
| QuoteWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,14; IC 2,14 | Quote summary with right-aligned amounts | None — tabular amounts | n/a |
| StatsWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,14; IC 2,14 | Three figures with labels and notes | None — labels at 14 | n/a |
| StepsWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 11; IC 11 | Numbered steps with state words | None — current step named | n/a |
| TableWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 2,17; IC 2,17 | Small table, numbers right-aligned; scroll region named in K8d | None — no silent clipping in the 1080 crop | n/a |
| TilesWidget | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 1,17; IC 1,17 | Tiles with label + value | None — equal structure | n/a |
| ToneText | /examples/widgets | widgets-390.png, groups/answer-tsx-1080-clean.png | DS 3; IC 3 | Coloured text beside its word | None — tone never carries meaning alone | n/a |
| ApprovalPath | /examples/approvals | approvals-1440.png, approvals-390.png, groups/approvals-tsx-1080-clean.png | DS 2,3,8,11; IC 2,3,8,19 | Blocked sentence, stage track, parallel approvers side by side at 1080 and stacked at 390, delegation line, reasons behind disclosure | None — waiting-on, since and why are one sentence; state is icon + word | n/a |
| ApprovalPathSkeleton | /examples/approvals, /examples/components | approvals-390.png, groups/approvals-tsx-1080-clean.png | DS 11; IC 11,19 | Summary bar, stage markers and approver-row skeletons | None — layout-shaped, no spinner | n/a |
| HeroBand | /examples/patterns, /examples/components | patterns-1440.png, groups/bands-tsx-1080-clean.png | DS 1,4,5,17; IC 1,4,5,17 | Tinted band, title, "Deal desk" in the meta row, one-line description, one primary + secondary, decorative illustration | None — no eyebrow over the title; one brand button | n/a |
| IllustratedChoiceCard | /examples/patterns, /examples/slots, /examples/components | patterns-1440.png, groups/bands-tsx-1080-clean.png | DS 1,4,5,17; IC 1,4,5,17 | Whole card one link, illustration panel, title + two lines, "Explore this role →", Current badge on the active role | None — one link, focus ring on the card | n/a |
| ActionCard | /examples/components | groups/cards-tsx-1080-clean.png | DS 1,4,5,17; IC 1,4,5,17 | Icon, title, two-line description, one action pinned at the card's foot | None — action no longer floats mid-card | n/a |
| BestFor | /examples/components | groups/cards-tsx-1080-clean.png | DS 6; IC 6 | "Best for" label + check-marked list at 14 | None — label and items readable | n/a |
| CardLink | /examples/components | groups/cards-tsx-1080-clean.png | DS 4,5; IC 4,5 | "View all 24 deals →" text link | None — verb + destination, not a button | n/a |
| ChecklistCard | /examples/components | k8h-inspect-ChecklistCard-280.png, -360.png, -480.png, groups/cards-tsx-1080-clean.png | DS 1,11; IC 1,11,17 | Title, reward, description, "1 of 3 completed", collapse control, 64px rows with one action | Yes — at 280 the completion meta squeezed the title; it now drops under the title below 22rem of the card | Yes |
| ChoiceCard | /examples/chat-states, /examples/patterns, /examples/components | k8h-inspect-ChoiceCard-280.png, -360.png, groups/cards-tsx-1080-clean.png | DS 1,6; IC 1,6 | Prompt at 14, labelled radios, descriptions, Best for lists, Recommended badge, Continue | Yes — at 280 the Recommended badge left its label; label + badge now share a line | Yes |
| EntityCard | /examples/deals (peek), /examples/components | deals-1440.png, groups/cards-tsx-1080-clean.png | DS 1,13; IC 1,13 | Logo, name, meta, facts, one action | None — long name and facts stay readable (title from K8f) | n/a |
| IconChip | /examples/components | groups/cards-tsx-1080-clean.png | DS 1; IC 1 | Three tinted tiles in three sizes | None — decorative, no controls | n/a |
| ObjectCard | /examples/patterns, /examples/components | patterns-390.png, groups/cards-tsx-1080-clean.png | DS 1,3,4,13,17; IC 1,3,4,13,17 | Icon tile, title, byline, star, ⋯, two-line description, facts, footer action/status | None — action pinned; star names the card; description has full text | n/a |
| ObjectFact | /examples/components | groups/cards-tsx-1080-clean.png | DS 3,14; IC 3,14 | Version and task-count facts in mono/meta | None — words beside icons | n/a |
| TemplateCard | /examples/components | groups/cards-tsx-1080-clean.png | DS 1,4,17; IC 1,4,17 | Two equal cards, status at top, description, selected tint | None — equal heights in the row | n/a |
| ActionsCell | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,4; IC 2,4 | One visible "Review" + named ⋯ menu at the row end | None — menu name comes from the caller | n/a |
| AvatarStack | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,3,13; IC 2,3,13 | Initials tiles + "+N" with the full list in the name/tooltip | None — no colour-only meaning | n/a |
| TagsCell | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,3,13; IC 2,3,13 | Neutral "Renewal"/"Enterprise" tags + "+1" tooltip in the matrix; the deals example now passes neutral Type tags too | None — the component already supports neutral; the example's accent Type map was the fault | Example fixed |
| DateCell | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,14; IC 2,14 | "Nov 14, 2026" + relative line; `<time>` and title | None — exact value available | n/a |
| HoverActions | /examples/components | groups/cells-tsx-1080-clean.png | DS 2,4,17; IC 2,4,17 | Row with touch-visible icon actions under pointer: coarse | None — visible without hover on touch | n/a |
| MoneyCell | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,14; IC 2,14 | Right-aligned tabular amount + revision line | None — unit and precision consistent | n/a |
| Num | /examples/components | groups/data-tsx-1080-clean.png | DS 2,14; IC 2,14 | "1,240 seats" tabular | None — suffix muted beside the number | n/a |
| PercentBarCell | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,3,11; IC 2,3,11 | Bar + "22.5%" + warning icon when over the limit | None — value in words, not colour alone | n/a |
| ProgressCell | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,3,11; IC 2,3,11 | Segments + "2 of 3" | None — count in text | n/a |
| RecordCell | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,13; IC 2,13 | Logo/initials + name link + meta; title carries the full name | None — row context comes from `linkLabel` | n/a |
| SparklineCell | /examples/deals, /examples/components | deals-1440.png, groups/cells-tsx-1080-clean.png | DS 2,14; IC 2,14 | Sparkline + "+12%" summary | None — direction in text | n/a |
| TextCell | /examples/components | groups/cells-tsx-1080-clean.png | DS 2,13; IC 2,13 | Title line + preview; title attribute from K8f | None — cut text readable | n/a |
| ActionReceipt | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 3,6,7,8; IC 3,6,7,8,16 | Saved/skipped/verified receipt with words and marks | None — outcome in words | n/a |
| ActionReview | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 3,6,7,8; IC 3,6,7,8,16 | "Approve" + "I don't want this", consequence sentence | None — consequence before the action | n/a |
| AnswerSources | /examples/chat, /examples/chat-states | chat-390.png, groups/chat-tsx-1080-clean.png | DS 4,8,15; IC 4,8,15 | Numbered source chips, system mark + kind + label | None — sources once per answer | n/a |
| Cite | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 4,15; IC 4,15 | Inline citation number styled as a link | None — visible number matches source | n/a |
| Claim | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 8,15; IC 8,15 | Claim text with its source marker | None — no colour-only provenance | n/a |
| AssistantTurn | /examples/chat | chat-390.png, groups/chat-tsx-1080-clean.png | DS 7,11,15; IC 7,11,15 | ACE mark, AI label, time, reasoning row, body | None — one ACE mark, sources in the answer | n/a |
| TurnBlock | /examples/chat | chat-390.png, groups/chat-tsx-1080-clean.png | DS 1,15; IC 1,15 | Blocks inside the turn keep the turn's padding | None — no nested cards | n/a |
| StreamingText | /examples/chat | chat-390.png, groups/chat-tsx-1080-clean.png | DS 7,11,15; IC 7,11,15 | Streamed prose with a caret/status | None — polite status row | n/a |
| ThinkingRow | /examples/chat | chat-390.png, groups/chat-tsx-1080-clean.png | DS 11,15; IC 11,15 | "Thought for 4s" disclosure, collapsed | None — duration in words | n/a |
| BranchSwitcher | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 9,15; IC 9,15 | "1 of 3" with previous/next | None — position in words; labelled controls | n/a |
| ChatColumn | /examples/chat | chat-390.png, groups/chat-tsx-1080-clean.png | DS 1,3,7,14; IC 1,3,7,14 | User and assistant turns, times, day divider | None — no duplicate status | n/a |
| SystemMark | /examples/chat, /examples/chat-states | chat-390.png, groups/chat-tsx-1080-clean.png | DS 3,15; IC 3,15 | System logo + kind word | None — mark is decorative, word carries it | n/a |
| TimeDivider | /examples/chat | chat-390.png, groups/chat-tsx-1080-clean.png | DS 14; IC 14 | "Today 9:41 AM" divider | None — `<time>` from caller strings | n/a |
| UserTurn | /examples/chat | chat-390.png, groups/chat-tsx-1080-clean.png | DS 1,3,7,14; IC 1,3,7,14 | "You" + time + message, right tint | None — name and time in words | n/a |
| ClarifyQuestion | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 6,7,8,15; IC 6,7,8,15 | Question + radio options + Answer button | None — one next step | n/a |
| ComposerNotice | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 7,15; IC 7,15 | Inline notice under the composer with a reason | None — what happened + what to do | n/a |
| QueuedFollowUps | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 7,11,15; IC 7,11,15 | "Sends after ACE finishes" list with a remove control | None — state in words | n/a |
| ReplyError | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 7,11,15; IC 7,11,15 | Error sentence, request id, retry, discard | None — retry is one next step | n/a |
| ScreenSessionNotice | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 7,15; IC 7,15 | "ACE can see salesforce.com…" notice | None — says what ACE can see | n/a |
| StoppedNotice | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 7,11,15; IC 7,11,15 | "You stopped ACE", finished vs kept, Retry/Discard with request id | None — says what happened | n/a |
| ConflictCompare | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 3,4,7,15; IC 3,4,7,15 | Two source cards with dates + "The invoice schedule depends on this date" | None — both sides in words | n/a |
| InjectionNotice | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 3,4,7,15; IC 3,4,7,15 | Warning icon + "Ignored an instruction inside a document" + reason | None — word + icon, not colour alone | n/a |
| JumpToLatest | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 3,4,7,15; IC 3,4,7,15 | "↓ 3 new updates" button | None — count in words; polite hold | n/a |
| ConversationListItem | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 2,3,14,15; IC 2,3,14,15 | Title + preview + relative time; unread dot + bold (Open from K8f) | None for this pass — the word "Unread" remains an Open item | n/a |
| DraftCard | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 6,15,16; IC 6,15,16 | To/Subject, draft, "Save draft"/"Send via Outlook", warning about the external recipient | None — actions are verbs; warning in words | n/a |
| ModeSwitch | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 4,6,15; IC 4,6,15 | Guide/Prepare/Execute radios with descriptions | None — modes above the ceiling visible | n/a |
| ProactiveTask | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 1,4,15; IC 1,4,15 | Task title, description, due/owner, one action per card | None — action names the task | n/a |
| ToolCallRow | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 11,15; IC 11,15 | Tool name + step + status word | None — state in words | n/a |
| WorkLog | /examples/chat-states | chat-states-390.png, groups/chat-tsx-1080-clean.png | DS 11,15; IC 11,15 | "Working · 1 of 3 steps done" and nested steps | None — show/hide is labelled; hidden parts render conditionally | n/a |
| ChatComposer | /examples/chat | chat-390.png, groups/conversation-tsx-1080-clean.png | DS 1,4,6,7,15; IC 1,4,6,7,15 | Input, source count, Prepare menu, send; "ACE can make mistakes" line | None — one primary, labelled controls | n/a |
| ChatLayout | /examples/chat | chat-390.png, groups/conversation-tsx-1080-clean.png | DS 1,8,15; IC 1,8,15 | Thread region + composer at the foot | None — one scroll region | n/a |
| ChatPanel | /examples/chat-panel | chat-panel-390.png, groups/conversation-tsx-1080-clean.png | DS 1,4,6,7,8,15; IC 1,4,6,7,8,15 | Side panel header, context line, thread, composer | None — close named; panel is a region | n/a |
| Reasoning | /examples/chat | chat-390.png, groups/conversation-tsx-1080-clean.png | DS 11,15; IC 11,15 | "Thought for 4s" row, collapsed disclosure | None — duration in words | n/a |
| SuggestionChips | /examples/chat | chat-390.png, groups/conversation-tsx-1080-clean.png | DS 4,15; IC 4,15 | Three verb-phrase buttons | None — each is one next step | n/a |
| TurnActions | /examples/chat | chat-390.png, groups/conversation-tsx-1080-clean.png | DS 4,15; IC 4,15 | Copy, retry, vote icons in the corner with names | None — names include the answer (K8f context) | n/a |
| ApprovalMatrix | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 2,3,6,8; IC 2,3,6,8 | Rule matrix with right-aligned amounts and state words | None — no colour-only cells | n/a |
| ApprovalRoute | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 2,3,8; IC 2,3,8 | Approver cards in a route with state words and a reason | None in this pass — the bordered-cards-in-a-module question stays Open from K8f | n/a |
| BlockedReason | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 3,7,11; IC 3,7,11,14 | Icon + sentence naming the blocker and the next action | None — in words | n/a |
| DiscountMeter | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 3,11; IC 3,11 | Meter + 22.5% + limit marker | None — value and limit in text | n/a |
| PolicyChecks | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 2,3,7; IC 2,3,7 | Four checks with status words, policy line, approve affordance when needed | None — caller supplies status words | n/a |
| SourceLine | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 7; IC 7,14 | Service mark + source + relative sync time | None — system and time in words | n/a |
| CountUp | /examples/dashboard, /examples/components | dashboard-390.png, groups/cpq-tsx-1080-clean.png | DS 1,11,14; IC 1,11,14 | Figures count to exact values, tabular | None — final value exact | n/a |
| DealFigures | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 1,11,14; IC 1,11,14 | Four figures by container width with source lines | None — no overlap at 1080; K8g's container fix holds | n/a |
| CpqStages | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 3,11; IC 3,11 | Four stages, current one marked with a word | None — labels come from the caller | n/a |
| InvoiceSchedule | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 2,3,14; IC 2,3,14 | Three invoice rows with dates and right-aligned amounts | None — dates left, amounts right | n/a |
| OrderMatch | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 2,3,14; IC 2,3,14 | PO vs order lines with a "≠" in words | None — mismatch is words, not colour | n/a |
| PriceWaterfall | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 2,14; IC 2,14 | List → discount → net bar with labels and amounts | None — amounts outside the bar; stacks under 30rem | n/a |
| QuoteLines | /examples/quote, /examples/components | quote-1440.png, quote-390.png, groups/cpq-tsx-1080-clean.png | DS 2,3,6,14,17; IC 2,3,6,14,17,18 | "Discount (%)", exception lines linked above, pinned summary, editable and locked sets, phone cards | None — K8g fixes hold in every crop | n/a |
| ScenarioCompare | /examples/quote, /examples/components | quote-1440.png, groups/cpq-tsx-1080-clean.png | DS 2,3,14; IC 2,3,14 | Hold 22% / Counter at 20% with figures and policy lines | None — recommended and not-chosen in words | n/a |
| DataGrid | /examples/deals, /examples/slots, /examples/components | deals-1440.png, deals-768.png, deals-390.png, groups/data-grid-tsx-1080-clean.png, groups/data-grid-tsx-280-clean.png | DS 2,3,6,11,12,13,17; IC 2,3,6,11,12,13,17 | Header 40, rows 55, checkbox + expand + record, sorting arrows, trailing column, pager | Yes — at 1440 the last column was cut with no affordance, and the page select showed an unlabelled "1"; the default set now fits and the overflow region is named/focusable with an edge gradient; the select says "Page" | Yes |
| SortableHead | /examples/components | groups/data-tsx-1080-clean.png | DS 2; IC 2 | "Deal" + sort arrows, aria-sort on the th | None — one sorted column shows its arrow | n/a |
| TablePager | /examples/components | groups/data-tsx-1080-clean.png | DS 2; IC 2 | "1–8 of 132 deals" + previous/next icon buttons | None — range in words; buttons named | n/a |
| SourceList | /examples/components | groups/data-tsx-1080-clean.png | DS 2,4; IC 2,4 | Ordered source chips in a list | None — numbered and labelled | n/a |
| SourceChip | /examples/components | groups/data-tsx-1080-clean.png | DS 3,13; IC 3,13 | Index + label + kind + external-link icon; cut label has a title | None — full label available | n/a |
| ChangeReview | /examples/components | groups/editing-tsx-1080-clean.png | DS 3,4,6,7,16; IC 3,4,6,7,16 | Two changed fields with before → after, Accept/Reject per row, footer actions | None — each control names its field | n/a |
| DiffValue | /examples/components | groups/editing-tsx-1080-clean.png | DS 2,3; IC 2,3 | Was → now with strikethrough/weight, "was/now" for screen readers | None — not colour-only | n/a |
| InlineEdit | /examples/components | groups/editing-tsx-1080-clean.png | DS 4,6,7; IC 4,6,7 | Editable value with a full-text title from K8f | None — save/cancel in words | n/a |
| Callout | /examples/patterns, /examples/components | patterns-1440.png, groups/feedback-tsx-1080-clean.png | DS 7; IC 7 | Tinted note with title, sentence, action | None — tone word/icon + text | n/a |
| DirtyMark | /examples/components | groups/feedback-tsx-1080-clean.png | DS 3,6; IC 3,6 | "● Edited" word beside the mark | None — not colour alone | n/a |
| SaveStatus | /examples/components | groups/feedback-tsx-1080-clean.png | DS 3,7,11; IC 3,7,11 | Unsaved / Saving / Saved / Couldn't save / Retry | None — each state in words | n/a |
| SkeletonCard | /examples/components | groups/feedback-tsx-1080-clean.png | DS 11; IC 11 | Card-shaped skeleton with title and lines | None — matches the card layout | n/a |
| SkeletonFigure | /examples/components | groups/feedback-tsx-1080-clean.png | DS 11; IC 11 | Label, figure and caption skeletons | None — no spinner | n/a |
| SkeletonLines | /examples/components | groups/feedback-tsx-1080-clean.png | DS 11; IC 11 | Four text lines at real heights | None — no spinner | n/a |
| UnsavedChangesBar | /examples/components | groups/feedback-tsx-1080-clean.png | DS 4,6,7,16; IC 4,6,7,16 | "2 unsaved changes" + Discard + Save changes | None — K8f's focus-safe saving holds | n/a |
| Banner | /examples/deals, /examples/components | deals-1440.png, groups/feedback-tsx-1080-clean.png | DS 7; IC 7 | One strip banner in All deals (sync); the matrix shows the tone variants and dismiss control | Yes in the example — two banners were stacked; the access note is now inline under the header | Example fixed |
| Figure | /examples/dashboard, /examples/components | dashboard-390.png, groups/figure-tsx-1080-clean.png | DS 1,3,4,14; IC 1,3,4,14 | Tinted icon tile, label 14, value, caption, link | None — whole figure one link; name includes the value | n/a |
| FigureCard | /examples/components | groups/figure-tsx-1080-clean.png | DS 1,3,4,14; IC 1,3,4,14 | Label, value, caption; one link | None — caption is the description | n/a |
| FigureStrip | /examples/dashboard, /examples/components | dashboard-390.png, groups/figure-tsx-1080-clean.png | DS 2,14,17; IC 2,14,17 | Four figures that stack at 390 and share columns at 1080 | None — reflows by its own width | n/a |
| Meter | /examples/components | groups/figure-tsx-1080-clean.png | DS 3,11,14; IC 3,11,14 | Bar with a value spoken as text | None — `aria-valuenow`/text | n/a |
| Sparkline | /examples/components | groups/figure-tsx-1080-clean.png | DS 3,11,14; IC 3,11,14 | Small trend line with a textual summary | None — meaning in text | n/a |
| FilterBar | /examples/deals, /examples/components | deals-1440.png, groups/filters-tsx-1080-clean.png | DS 10; IC 10 | Chips + "24 deals" count; filter trigger shows active filters | None — count and chips readable | n/a |
| FilterCount | /examples/components | groups/filters-tsx-1080-clean.png | DS 10; IC 10 | "1,240 deals" | None — result count in words | n/a |
| FilterChip | /examples/components | groups/filters-tsx-1080-clean.png | DS 4,10; IC 4,10 | Pressed chips with a check | None — state not colour alone | n/a |
| FilterSearch | /examples/deals, /examples/components | deals-1440.png, groups/filters-tsx-1080-clean.png | DS 4,6,10; IC 4,6,10 | Search field with a visible placeholder and label; clear control | None — at 390 the deals toolbar keeps it 12rem wide rather than collapsing it | n/a |
| Segmented | /examples/deals, /examples/components | deals-1440.png, groups/filters-tsx-1080-clean.png | DS 9,10,17; IC 9,10,17 | Never-wrapping track, overflow to More, pressed state | None — one row at every crop | n/a |
| GraphNode | /examples/patterns, /examples/components | patterns-1440.png, groups/graph-tsx-1080-clean.png | DS 1,3,13,14; IC 1,3,13,14 | 216px node, icon tile, title + meta, selected ring, dimmed state | Yes — the title and meta were cut with no full text; both now use `TruncateText` (tooltip + Tab when cut) | Yes |
| GraphEdgeLabel | /examples/patterns, /examples/components | patterns-1440.png, groups/graph-tsx-1080-clean.png | DS 3,12; IC 3 | Pill with an edge word ("renews") | None — word, not colour | n/a |
| AceMark | /examples/chat, /examples/components | chat-390.png, groups/identity-tsx-1080-clean.png | DS 1,3,15; IC 1,3,15 | Three ACE marks, decorative beside the ACE word | None — no sparkle per line | n/a |
| PersonAvatar | /examples/components | groups/identity-tsx-1080-clean.png | DS 1,3; IC 1,3 | Initials tiles at three sizes | None — name always beside it | n/a |
| ServiceLogo | /examples/components | groups/identity-tsx-1080-clean.png | DS 1,3; IC 1,3 | Eight service marks, one line | None — `src` fallback kept | n/a |
| ServiceStack | /examples/components | groups/identity-tsx-1080-clean.png | DS 1,3,13; IC 1,3,13 | Marks + "+2" with names | None — count and names available | n/a |
| CreateDrawer | /examples/components | groups/layouts-tsx-1080-clean.png | DS 4,6,8; IC 4,6,8 | Closed trigger in the matrix; open flow in the axe suite | None — no layout fault in the captured trigger | n/a |
| DashboardGrid | /examples/components | groups/layouts-tsx-1080-clean.png | DS 1,17; IC 1,17 | Three equal cards across 1080 | None — equal widths and heights | n/a |
| DashboardLayout | /examples/dashboard, /examples/components | dashboard-390.png, groups/layouts-tsx-1080-clean.png | DS 1,17; IC 1,17 | Header + full-bleed sections; no centred column | None — nothing overflows | n/a |
| HeaderBand | /examples/components | groups/layouts-tsx-1080-clean.png | DS 5; IC 5 | "Deals" band with a single title | None — no eyebrow | n/a |
| ListLayout | /examples/deals, /examples/components | deals-1440.png, groups/layouts-tsx-1080-clean.png | DS 2,10,17; IC 2,10,17 | Header, banners, toolbar, rail, grid region | None — rail becomes a disclosure under lg; toolbar stays one row at 1440 | n/a |
| RecordLayout | /examples/record, /examples/components | record-390.png, groups/layouts-tsx-1080-clean.png | DS 5,8,17; IC 5,8,17 | Full-bleed record header + aside | None — aside stacks before 1280 by design | n/a |
| RecordPeek | /examples/deals, /examples/components | deals-1440.png, groups/layouts-tsx-1080-clean.png | DS 5,8,17; IC 5,8,17 | Peek opened from All deals with sections, facts and two actions | None — focus returns to the row; header hierarchy holds | n/a |
| SettingsLayout | /examples/settings, /examples/components | settings-390.png, groups/layouts-tsx-1080-clean.png | DS 2,8,9,17; IC 2,8,9,17 | Rail collapses to a disclosure at 390; one content column | None — nav labelled | n/a |
| SplitView | /examples/components | groups/layouts-tsx-1080-clean.png | DS 2,8,9,17; IC 2,8,9,17 | Named panes side by side; list rows keep trailing amounts | None — titles cut with a title attribute (K8f) | n/a |
| CountPill | /examples/components | groups/lists-tsx-1080-clean.png | DS 3; IC 3 | "Approvals 6" mono count | None — count has a label option | n/a |
| DescriptionItem | /examples/components | groups/lists-tsx-1080-clean.png | DS 2,6,17; IC 2,6,17 | Term 14 + value; stacks under 22rem | None — no cut terms in the crop | n/a |
| DescriptionList | /examples/records, /examples/components | records-1440.png, groups/lists-tsx-1080-clean.png | DS 2,6,17; IC 2,6,17 | Two/two/four columns by container; one column in the narrow aside | None — amounts unbroken | n/a |
| List | /examples/work, /examples/components | work-390.png, groups/lists-tsx-1080-clean.png | DS 2,3,4,17; IC 2,3,4,17 | Rows with dividers, trailing badges, one action | None — trailing stays at the row end | n/a |
| ListItem | /examples/records, /examples/components | records-1440.png, groups/lists-tsx-1080-clean.png | DS 2,3,4,13,17; IC 2,3,4,13,17 | Icon/logo, headline, supporting, meta, trailing; selected tint with link-colour fix | Yes — a cut headline had no full text for pointer users; the row now carries the headline in a title | Yes |
| ActionMenu | /examples/deals, /examples/components | deals-1440.png, groups/menus-tsx-1080-clean.png | DS 2,4,8,16; IC 2,4,8,16 | ⋯ menu with sections, destructive item last, disabled reason | None — menu name comes from the caller | n/a |
| ColumnsPanel | /examples/deals, /examples/components | deals-1440.png, groups/menus-tsx-1080-clean.png | DS 2,4,17; IC 2,4,17 | Search, always-shown lock, checkboxes, reorder controls | None — move controls visible on touch | n/a |
| CountSegments | /examples/deals, /examples/components | deals-1440.png, groups/menus-tsx-1080-clean.png | DS 4,9,10,17; IC 4,9,10,17 | Total / Mine / At risk with counts; arrow keys within | None — one Tab stop per group | n/a |
| FacetList | /examples/deals, /examples/components | deals-1440.png, groups/menus-tsx-1080-clean.png | DS 4,9,10,17; IC 4,9,10,17 | Status facet list with counts, selected row tan | None — selected in words + tint | n/a |
| FacetFilterMenu | /examples/deals, /examples/components | deals-1440.png, groups/menus-tsx-1080-clean.png | DS 4,10; IC 4,10 | "Owner" trigger with checkboxes and counts | None — labels on every checkbox | n/a |
| SavedViewMenu | /examples/deals, /examples/components | deals-1440.png, groups/menus-tsx-1080-clean.png | DS 4,8,10; IC 4,8,10 | "Default view" menu with saved views and owner filter | None — pressed-filter group, not a false tablist | n/a |
| SplitButton | /examples/deals, /examples/components | deals-1440.png, groups/menus-tsx-1080-clean.png | DS 4; IC 4 | "New deal" + chevron menu | None — both controls named | n/a |
| VerticalNav | /examples/settings, /examples/components | settings-390.png, groups/menus-tsx-1080-clean.png | DS 4,9; IC 4,9 | Ten sections as links, selected row | None — links when they are pages | n/a |
| MoreLabel | /examples/components | groups/overflow-tsx-1080-clean.png | DS 4,9,17; IC 4,9,17 | "More" chevron with its count | None — named with the hidden count | n/a |
| OverflowMeasure | /examples/components | groups/overflow-tsx-1080-clean.png | DS 4,9,17; IC 4,9,17 | Off-screen measure row (invisible in the crop) | None — it is aria-hidden and takes no space | n/a |
| PageHeader | /examples/deals, /examples/records, /examples/components | deals-1440.png, records-1440.png, groups/page-header-tsx-1080-clean.png, groups/page-header-tsx-280-clean.png | DS 1,5,17; IC 1,5,17 | Back link, title 30, status, description, meta, text actions, tabs | None — no eyebrow; the long title wraps at 280 without pushing actions over text | n/a |
| PageTabs | /examples/deals, /examples/components | deals-1440.png, groups/page-header-tsx-1080-clean.png | DS 4,9,17; IC 4,9,17 | Underline tabs with counts; More keeps the current tab | None — one row at 280 | n/a |
| ApprovalChain | /examples/components | groups/progress-tsx-1080-clean.png | DS 2,3,8,11; IC 2,3,8,11 | Numbered steps with status badges, approver, reason, action | None — state in words | n/a |
| StageProgress | /examples/deals, /examples/components | deals-1440.png, groups/progress-tsx-1080-clean.png | DS 3,11; IC 3,11 | Four stages with a current marker and label under it | None — state in words | n/a |
| Timeline | /examples/components | groups/progress-tsx-1080-clean.png | DS 2,3,14; IC 2,3,14 | Dated event rows with party and revision | None — exact time on the `<time>` (K8f) | n/a |
| TimelineItem | /examples/components | groups/progress-tsx-1080-clean.png | DS 2,3,14; IC 2,3,14 | One event with its dot, title, sentence, byline | None — relative + exact | n/a |
| LarkLink | /examples/components | groups/menus-tsx-1080-clean.png | DS 4; IC 4 | In-app link styling and focus ring | None — links look like links | n/a |
| LarkProvider | /examples/components | components-390.png | DS 4 | Provider wrapper; no visible UI in the crop | None — nothing rendered to inspect | n/a |
| AppShell | /examples/deals, /examples/components | deals-1440.png, groups/shell-tsx-1080-clean.png | DS 5,17; IC 5,17 | Sidebar + top bar + page content as the main landmark | None — title bar is a banner, page region is main | n/a |
| AppSidebar | /examples/deals, /examples/components | deals-1440.png, groups/shell-tsx-1080-clean.png | DS 2,3,4,17; IC 2,3,4,17 | Scope pill, groups, counts, rail mode, footer items | None — every item shows its icon and label (rail names from K8f) | n/a |
| AskAceButton | /examples/components | groups/shell-tsx-1080-clean.png | DS 4,15; IC 4,15 | Brand button, "Asking…" state | None — busy and expanded state announced | n/a |
| ScopePill | /examples/deals, /examples/components | deals-1440.png, groups/shell-tsx-1080-clean.png | DS 3,14; IC 3,14 | Dot + "Example data · as of Oct 21" | None — words carry the meaning | n/a |
| SearchCommand | /examples/components | groups/shell-tsx-1080-clean.png | DS 4,10; IC 4,10 | "Search or ask ACE" trigger + Ctrl K | None — results are links when they have hrefs | n/a |
| ThemeToggle | /examples/components | groups/shell-tsx-1080-clean.png | DS 4,5,17; IC 4,5,17 | Sun icon, pressed state, tooltip | None — named and stateful | n/a |
| Topbar | /examples/deals, /examples/components | deals-1440.png, groups/shell-tsx-1080-clean.png | DS 4,5,17; IC 4,5,17 | Breadcrumbs, search, actions, theme, user | None — one banner landmark; no duplicate title | n/a |
| TopbarIconButton | /examples/deals, /examples/components | deals-1440.png, groups/shell-tsx-1080-clean.png | DS 4,5; IC 4,5 | Bell with count, help, theme; names + tooltips | None — badge count in the name | n/a |
| UserMenu | /examples/components | groups/shell-tsx-1080-clean.png | DS 4,8; IC 4,8 | Avatar trigger; menu sections, items, sub, radio groups | None — non-modal, focus returned | n/a |
| UserMenuSection | /examples/components | groups/shell-tsx-1080-clean.png | DS 4,8; IC 4,8 | Labelled section group | None — heading is not a menu item | n/a |
| UserMenuSub | /examples/components | groups/shell-tsx-1080-clean.png | DS 4,8; IC 4,8 | Submenu item ("Switch workspace") | None — submenu opens with the keyboard | n/a |
| UserMenuItem | /examples/components | groups/shell-tsx-1080-clean.png | DS 4,8; IC 4,8 | Icon + label + shortcut | None — cut labels carry a title (K8f) | n/a |
| UserMenuRadioGroup | /examples/components | groups/shell-tsx-1080-clean.png | DS 4,8; IC 4,8 | Theme/role radios with checked state | None — menuitemradio | n/a |
| StatusBadge | /examples/deals, /examples/components | deals-1440.png, groups/status-badge-tsx-1080-clean.png | DS 3; IC 3 | Five states as icon + word + tone; "A status from the app" outline | None — never colour alone | n/a |
| StepList | /examples/work, /examples/components | work-390.png, groups/steps-tsx-1080-clean.png | DS 3,11; IC 3,11 | Done/current/blocked steps, 24px markers, "Blocked: …" in words | None — current step named | n/a |
| CardStatusFooter | /examples/components | groups/surfaces-tsx-1080-clean.png | DS 1,3; IC 1,3 | One action left, status right | None — footers align | n/a |
| TrayCard | /examples/components | groups/surfaces-tsx-1080-clean.png | DS 1,3; IC 1,3 | Plain card in a tray | None — one subject | n/a |
| CompoundTag | /examples/components | groups/surfaces-tsx-1080-clean.png | DS 3,14; IC 3,14 | "Discount 92%" / "Term 36 months" pairs | None — label + value in words | n/a |
| ProvisionalBadge | /examples/components | groups/surfaces-tsx-1080-clean.png | DS 3,14; IC 3,14 | Proposed / Not saved / Suggested by ACE with icons | None — one badge per state, words | n/a |
| Freshness | /examples/components | groups/surfaces-tsx-1080-clean.png | DS 3,14; IC 3,14 | "Updated 2 minutes ago" | None — relative time, exact on focus | n/a |
| Tray | /examples/components | groups/surfaces-tsx-1080-clean.png | DS 1,5,17; IC 1,5,17 | Titled tray containing cards, action at the foot | None — title at module size (K8f fix) | n/a |
| ClampText | /examples/components | groups/text-tsx-1080-clean.png | DS 13; IC 13 | Two-line clamp of a long title with ellipsis | None — full text via the shared tooltip/Tab | n/a |
| NoBreak | /examples/components | groups/text-tsx-1080-clean.png | DS 2,14; IC 2,14 | "$12,480,000.00" unbroken, tabular | None — amounts never break | n/a |
| TruncateText | /examples/components | groups/text-tsx-1080-clean.png | DS 13; IC 13 | One-line ellipsis with the full string in a tooltip | None — reference implementation | n/a |
| ThemeScript | /examples/components | groups/theme-tsx-1080-clean.png | — | Pre-hydration script text | None — runs before paint; no visible control | n/a |
| Transcript | /examples/quote, /examples/components | quote-390.png, groups/transcript-tsx-1080-clean.png | DS 2,3,14; IC 2,3,14 | Speaker + time + flag above each line, `<ol>` | None — times as `<time>` | n/a |
| TranscriptLine | /examples/quote, /examples/components | quote-390.png, groups/transcript-tsx-1080-clean.png | DS 2,3,14; IC 2,3,14 | One line with speaker, time, optional flag | None — flags in words | n/a |
| NotificationsPanel | /examples/components | components-390.png (closed trigger in the matrix) | DS 3,7,9,12,14; IC 3,7,9,12,14 | Panel closed in the capture; open state reverified by axe and K8e screenshots | None — the unread word and day headings were fixed in K8e | n/a |
| RecordDrawer | /examples/records, /examples/components | records-1440.png (closed in the matrix), width-matrix-390.png | DS 4,8,9,17; IC 4,8,9,17 | Drawer closed in the route capture; the width matrix opens it at 390 | None — full-screen under 640; focus trap/Esc covered by width-matrix.spec | n/a |

### Breaking or deprecated

- **`DataGrid` page select**: the label is now visible ("Page") instead of `sr-only`; its accessible name is unchanged. The overflow region gains a right-edge gradient while there are hidden columns; the region's name, `role="region"` and `tabIndex=0` behaviour (only while overflowing) is unchanged.
- **`GraphNode`**: title and meta now render through `TruncateText`, so a clipped node title/meta becomes a Tab stop with a tooltip (up to two extra stops per clipped node). The `title` and `meta` props still take `ReactNode`.
- **`ListItem`**: a row with string `headline`/`supporting` now carries a native `title` attribute for pointer users. No prop changed.
- **`ChecklistCard`**: the header is a container grid; below 22rem of card width the completion count sits under the title. Visual only.
- **`ChoiceCard`**: a label and its Recommended badge now share a line; the label wraps inside its own width. Visual only.
- **Deals example** (not library API): the default visible columns are Deal, Status, Net value, Platform discount and Actions; Type is neutral; the access note is inline under the header; the Preview state switcher is above the module. A caller that depended on every column being visible by default should pass its own `columnVisibility`.
- Deprecated: none.

### Open

- **Narrow All deals toolbar**: at 390 it uses three rows — Default view + Hide filters, then Search, then Owner with "View options" — and "View options" sits beside the search row rather than at the far right. Confirm that reading; at 1440 it is one row with the view controls at the right.
- **Default columns**: Type, Value trend, Approvals, ACE risk, Owner, Deal team and Close now start hidden so the 1440 table fits. Confirm that is the right default set; the neutral Type tag fix is only visible once Type is turned on in Columns.
- **One-sided scroll cue**: `DataGrid` shows a gradient only while there is more table to the right; after scrolling to the end there is no cue when scrolling back. Should a left gradient appear too?
- **`GraphNode` Tab stops**: the truncation fix adds up to two Tab stops per clipped node. Confirm that is better than one tooltip shared by the node, or than the node itself being the only Tab stop.
- **`ListItem` full text**: the full headline is now a native `title` (hover). A sighted keyboard user still sees the ellipsis; `wrap` is the caller's option when the row must be read in full. Should `ListItem` expose its own focusable truncation instead?
- **Example-only bar on All deals**: it sits above the page header, outside `ListLayout`; confirm that is clearly example chrome and not a page banner.
- **Screenshot harness scope**: `scripts/shots.mjs` enumerates `src/app/examples/*/page.tsx` and does not capture an `/examples` root (there is none today). It sets dark through `localStorage["lark-theme"]="dark"` and reuses a running dev server; confirm both are the intended conventions.
- **Matrix crops**: the per-group 1080/280 images I read are produced by `.snapshots/k8h-groups.mjs`, which is untracked. Should the group-crop pass move into `scripts/` next to `shots.mjs`?
- **`ApprovalRoute`** and the icon-tooltip question stay as they were in K8f/K8g Open; this pass found no new fault in either.