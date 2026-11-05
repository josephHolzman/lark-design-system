# Changelog

All notable changes to Lark (`@josephholzman/lark`, imported as `@deepgrids/lark`). Versions follow semver; until 1.0, minor versions may
change component APIs (each is listed here).

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
