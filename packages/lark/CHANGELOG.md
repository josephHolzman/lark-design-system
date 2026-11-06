# Changelog

All notable changes to Lark (`@josephholzman/lark`, imported as `@deepgrids/lark`). Versions follow semver; until 1.0, minor versions may
change component APIs (each is listed here).

## Unreleased

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
