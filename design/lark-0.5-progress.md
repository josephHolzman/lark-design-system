# Lark 0.5 progress

Gap list: `deepgrids/apps/enterprise-workspace/docs/lark/lark-gaps.md` §1.

- [x] K1
- [x] K2
- [x] K8a

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
