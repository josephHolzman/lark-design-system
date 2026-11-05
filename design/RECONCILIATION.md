> **Superseded on 2026-11-05 by `design/LARK.md`** (Lark now follows Apollo's Beams system). Kept for the history of the Material 3 version.

# Lark: Material 3 × shadcn/AI Elements reconciliation

**Rule: Material 3 for the materials, shadcn for the measurements.**
Material 3 decides what things are made of and how they behave: color roles, shape,
state layers, focus, elevation, motion, type roles. shadcn and AI Elements decide how
big things are: heights, padding, gaps, anatomy and props. Both use a 4px grid.

Sources: Google's own M3 tokens (`@material/web` 2.5.0, `tokens/versions/latest`),
Google Design "Using Material Density on the Web", Android window size classes,
Google's touch-target guidance, and the shadcn/AI Elements source in this repo.

## 1. Density

M3 density steps remove 4px of height each (0 → −3). Google's guidance: use dense
layouts for data-rich apps (tables, long forms); keep default density for focused
tasks, alerts and messages; pair denser components with larger margins and gutters;
never shrink the touch target, only the visual.

On M3's scale, shadcn sits at:

| Component | M3 default | shadcn | M3 density step |
|---|---|---|---|
| Button | 40 | 36 / 32 / 40 | −1 / −2 / 0 |
| Text field | 56 | 36 | −5 (beyond the scale) |
| Menu item | 48 (Expressive ≈ 36) | 32 | −4 |
| List item | 56 | 32–36 | −5 to −6 |
| Chip | 32 | 22–32 | 0 |

**Lark rules**
1. **Chrome is dense** (shadcn heights): toolbars, menus, fields, lists, tables, tool cards.
2. **The conversation is comfortable** (M3 default): message text 16/26, confirmations,
   alerts and dialogs keep default sizes. People read these; they don't scan them.
3. **Gutters grow when components shrink**: 24px page margins from 840px up, a 720px
   reading column, 24px between messages.
4. **Hit areas, not visuals, follow the input device**: ≥ 24×24 on fine pointers
   (WCAG 2.5.8), ≥ 44×44 on coarse pointers via `@media (pointer: coarse)`
   (invisible hit-area expansion, the way Google's guidance describes).

## 2. Shape (M3 values, assigned per component)

M3 scale: none 0 · extra-small 4 · small 8 · medium 12 · large 16 · large-increased 20 ·
extra-large 28 · extra-large-increased 32 · extra-extra-large 48 · full.
Circular corners (M3), not squircles. Tailwind's names are re-pointed so existing classes
snap to M3: `rounded-sm` 4 · `rounded-md` 8 · `rounded-lg` 12 · `rounded-xl` 16 ·
`rounded-2xl` 20 · `rounded-3xl` 28 · `rounded-4xl` 32.

Nesting rule: inner radius = outer radius − padding.

## 3. Color

M3 role names over the Lark palette (generated, 136 contrast pairs checked).
Light and dusk are both blue-tonal, as in M3 dynamic color: light neutrals ("mist") carry the
sky hue at low chroma, dusk uses low-chroma night blue. Warmth comes from the sand secondary
(user messages, selection, the focus ring) and warm text in dusk. Added roles M3 lacks: success, warning, terminal.
shadcn's variable names alias the roles, so `bg-secondary` means M3 secondary-container,
`border-input` means M3 outline (3:1), `border` means outline-variant (decorative).

## 4. States and focus

- **State layers** replace shadcn's color-swap and `/90` hovers: an overlay of the content
  color at hover 8% · focus 10% · pressed 10% · dragged 16% (utility: `state-layer`).
- **Focus ring = M3's**: 3px, 2px outside the element, in the secondary color
  (sand-650 / sand-300, ≥ 4.5:1 on every surface). Replaces shadcn's 3px ring at 50% alpha.
- **Selected** = secondary-container + on-secondary-container (M3), plus a non-color cue
  (check icon, weight or indicator) so selection never relies on color alone.
- **Disabled** keeps shadcn's 50% opacity (exempt from contrast, still recognizable).
- No ripples.

## 5. Elevation

Tone first: in-page components sit at level 0 and separate by surface-container tone and
an outline-variant hairline. Shadows only on floating layers: menus, popovers, rich
tooltips = level 2 (`shadow-md`); dialogs, sheets = level 3 (`shadow-lg`). Controls lose
shadcn's `shadow-xs`; cards lose `shadow-sm`.

## 6. Type (Hanken Grotesk; M3 role names, M3 sizes)

| M3 role | Size / line | Weight | Tailwind | Use |
|---|---|---|---|---|
| body-large | 16/26 | 400 | `text-body-lg` | Message text (26 instead of 24 for long reading; Hanken's small x-height) |
| body-medium | 14/20 | 400 | `text-sm` | UI text, fields, menu items |
| body-small | 12/16 | 400 | `text-xs` | Meta, captions (the floor) |
| label-large | 14/20 | 500 | `text-label-lg` | Buttons, chips, tabs |
| label-medium | 12/16 | 500 | `text-label-md` | Badges, group headings |
| title-small | 14/20 | 500 | `text-title-sm` | Card and tool headers |
| title-medium | 16/24 | 500 | `text-title-md` | Section titles |
| title-large | 22/28 | 500 | `text-xl` / `text-title-lg` | Dialog titles, answer headings |
| headline-small | 24/32 | 400 | `text-2xl` | Empty states |

No tracking (M3's values are tuned for Roboto). Nothing below 12px. Sentence case.
Digits are tabular by default in Hanken. IDs, code, URLs: Geist Mono.

## 7. Motion (M3 standard scheme, not Expressive)

Easing: standard `cubic-bezier(0.2, 0, 0, 1)`; enter = emphasized-decelerate
`(0.05, 0.7, 0.1, 1)`; exit = standard-accelerate `(0.3, 0, 1, 1)`.
Durations: state layers 150 (short3) · small expands 200 (short4) · collapsibles 300
(medium2) · dialogs in 400 / out 200. Tailwind's `ease-in`, `ease-out`, `ease-in-out` and
the default transition are re-pointed to these. No overshoot in dense flows.
`prefers-reduced-motion`: transitions and animations collapse to near-zero; anything that
used motion to signal "working" also shows text.

## 8. Layout (M3 window size classes)

Compact < 600 · medium 600–839 · expanded 840–1199 · large 1200–1599 · extra-large ≥ 1600.
Chat column max 720. From large up, list-detail: conversation + artifact/supporting pane.
From extra-large, a navigation rail or drawer can stay open beside both.

## 9. Components

### shadcn primitives

| Component | M3 reference | shadcn today | Lark |
|---|---|---|---|
| Button | xsmall 32 / small 40, full, label-large, 12–16 side padding, filled/tonal/outlined/text | 36/32/40, `rounded-md`, `shadow-xs`, hover `/90` | 36 / 32 / 40, **full**, label-large, px 16/12/20; default = filled primary, secondary = tonal (secondary-container), outline = outlined (outline 3:1), ghost = text, destructive = error with on-error; state layers; no shadow |
| Icon button | 40 / 32 round, icon 24/20 | `size-9/8/10`, `rounded-md` | 36 / 32 / 40 **round**, icon 16–20 |
| Input, textarea, select trigger | outlined field 56, extra-small 4, floating label, body-large | 36, `rounded-md`, `shadow-xs`, `border-input` | 36, **small 8** (4 reads sharp at 36), outline 1px (3:1), body-medium (16 on mobile), labels outside the field (no floating labels in dense forms), M3 focus ring |
| Badge | large badge 16, full, label-small | `rounded-full`, text-xs | 20 tall, full, label-medium, container roles for status (icon + text) |
| Chip (suggestion/filter/input) | 32, **small 8**, label-large, outline | (suggestion uses a pill button) | 32, **small 8**, label-large, outline-variant border; selected = secondary-container + check |
| Card | medium 12, elevated/filled/outlined, no shadow | `rounded-xl`, `shadow-sm`, padding 24 | **12**, outlined (outline-variant) or filled (surface-container), no shadow, padding 16 |
| Dialog | extra-large 28, headline-small, body-medium, padding 24 | `rounded-lg`, `shadow-lg`, title `text-lg` semibold | **28**, padding 24, title-large, body-medium, actions right, level-3 shadow, scrim |
| Popover, hover card | rich tooltip medium 12 / menu large 16 | `rounded-md`, `shadow-md` | **16**, padding 16, lowest (light) / high (dusk) container, hairline, level 2 |
| Dropdown, select, command list | Expressive menu: container 16, items 12 when active, gap 2 | `rounded-md` p-1, items `rounded-sm` 32 | container **16**, padding 4, items **12** (16 − 4), 32 tall, body-medium, state layers, selected = secondary-container + check |
| Tooltip | plain: extra-small 4, body-small, inverse surface | `rounded-md`, text-xs, `bg-foreground` | **8**, body-small, inverse-surface, no arrow |
| Tabs | primary 48 (3px indicator) / segmented 40 full | pill-in-muted, 36 | M3 segmented look: 36, **full**, track surface-container, selected = secondary-container |
| Switch | track 52×32, handle 16→24, 2px outline when off | 32×18 | 40×24, handle 16 → 20, off = outline border (3:1), on = primary |
| Progress | linear 4px, secondary-container track | 8px, primary/20 track | 4px, full, track secondary-container, indicator primary |
| Accordion, collapsible | list expand | `py-4`, hover underline | 40 rows, title-small, state layer instead of underline, chevron 200ms |
| Alert | banner, body-medium | `rounded-lg` border | **12**, container roles (info/success/warning/error), icon + title |
| Button group | connected: 2px gap, inner corners extra-small | joined, square inner corners | **2px gap, inner corners 4**, outer full |
| Kbd | — | — | 4, Geist Mono 12, surface-container-high |
| Separator, scroll area | divider 1px outline-variant | border | separator outline-variant; scrollbar thumb outline (3:1) |

### AI Elements

| Component | Lark |
|---|---|
| Conversation | 720 column, 24 between messages, 16 / 24 side margins; scroll-to-bottom = round tonal icon button 40 with level-2 shadow |
| Message (user) | secondary-container bubble, **20** (large-increased), 10/16 padding, body-large, max 85% |
| Message (assistant) | unboxed, body-large 16/26; actions = 32 round icon buttons, on-surface-variant; visible on hover **and** focus-within, always visible on the latest message |
| Message branch | "2 of 3" label-medium between 32 icon buttons |
| Prompt input (composer) | lowest (light) / high (dusk) container, outline 1px (3:1), **28**, padding 8; focus-within = 2px primary border; tools = 36 round icon buttons; model picker = 32 pill text button; submit = 36 round filled primary (radius 18 ≈ 28 − 8) |
| Suggestion | M3 suggestion chip: 32, **8**, outline-variant, label-large |
| Reasoning, chain of thought, task, plan, queue | collapsible text-button trigger (label-large, on-surface-variant), content on a 1px outline-variant thread; step status by icon + words |
| Tool, confirmation, artifact, code block, web preview, sandbox | outlined card **12**; 40px header in surface-container-low, title-small; status badge with icon + text in container roles; confirmation keeps default density |
| Sources, inline citation | citation = 20px pill badge (inline targets are exempt from 2.5.8); sources list = 32 rows |
| Context | tabular figures; linear or ring progress in primary on secondary-container |
| Model selector | command dialog: container 28, input row 44, items 32 |
| Attachments | input chips 32, **8**, 24 thumbnail; grid previews **12** |
| Shimmer | "Thinking…" shimmer; static text under reduced motion |
| Voice (audio player, mic/voice selector, speech input, transcription, persona) | play = 40 round filled; selectors = menus above; recording state uses error role + words |
| Workflow (canvas, node, edge, connection, controls, panel, toolbar) | node = outlined card 12, title-small header; edges outline (3:1 on canvas); controls/toolbar = M3 floating toolbar (full, surface-container, level 2) with 32 icon buttons; panel = surface-container-low **16** |
| Code (agent, commit, env vars, file tree, JSX preview, package info, schema, snippet, stack trace, terminal, test results) | rows 28–32; values in Geist Mono; statuses in success/warning/error roles with icons; terminal uses the terminal role in both modes |
| Utilities (image, open in chat) | image **12**; open-in-chat = dropdown above |

## 10. Not taken from M3
Ripples · FABs · bottom navigation bar · floating labels and filled text fields · 48/56px
visual heights on desktop · Expressive springs and shape morphing in dense flows ·
dynamic color from a seed/wallpaper · primary-tinted neutrals · Roboto tracking values.

## 11. Not taken from shadcn
Neutral gray palette · `shadow-xs` on controls · 50%-alpha 3px focus ring ·
`rounded-md` everywhere · `/90` opacity hovers · underline-on-hover accordions ·
semibold `text-lg` dialog titles.

## 12. Product patterns: Material 3 × Apollo, for Deepgrids

Apollo (measured Oct 23, `claude/deepgrids-apollo-design-language.md`) and Material 3 agree
more than they differ: tone over shadow, 12px cards with hairlines, quiet type, one primary per
view. Where they differ, Lark takes Apollo's **measurements** for data-dense screens and M3's
**materials**.

**Optical size.** Hanken's x-height (0.49) is ~10% smaller than Inter's (0.55), so Lark sizes
sit one step above Apollo's to look the same: Lark 14 ≈ Apollo 13 (body, cells, nav), Lark 12 ≈
Apollo 11–12 (meta, headers), Lark 16 ≈ Apollo 15 (section titles), Lark 22 ≈ Apollo 20 (page
titles).

| Pattern | Apollo | M3 | Lark |
|---|---|---|---|
| App shell | white, flush | tinted surface, content on a raised sheet (Gmail, Drive) | Light: white frame (sidebar = `surface-container-lowest`), content on a `canvas` panel (sand-50), radius 16, 8px inset; white cards sit on the sand. Dusk: tinted `surface-container` frame, `surface-container-low` panel |
| Sidebar | 240, rows 28, selected 8% ink | nav drawer, 56 rows, pill indicator in secondary-container | 248 wide, rows 32, **pill indicator** in secondary-container, group labels label-md, mono count pills; collapses to a 56 rail |
| Top bar | 48, breadcrumb, centered search with soft shadow, dark AI button | small top app bar 64 | 48, breadcrumb, **search pill with the raised shadow** (same as the composer) and ⌘K, tonal "Ask ACE", icon buttons, avatar |
| Page header | title 20/28, actions right, underline tabs with counts | — | title-lg 22/28, meta line, actions right, M3 tabs (3px indicator) with mono counts |
| Metrics | cells split by vertical rules inside one card | — | **Figure** (label, value headline-sm tabular, caption, delta badge); **FigureStrip** splits figures by rules in one card; **FigureCard** links to a filtered view |
| Table | header 40 mono uppercase, rows 55, no column rules | data table, header 56, rows 52 | header 40, label-md, **sentence case** (Lark rule), rows 52 comfortable / 40 compact, hairline row rules, no column rules, record link underlined on hover, tabular figures right-aligned |
| Toolbar / filters | 48 toolbar: view select, filters, search 240, sort | filter chips | **FilterBar**: search 32, M3 filter chips (8px) with counts, clear, result count, view options |
| Chips | 20 pill tints | assist/filter/input chips 32 @ 8 | status = **Badge** 20 pill (icon + word); interactive filters = 32 @ 8 chips |
| Cards | 12, hairline, no shadow; section card header 32 | outlined/filled/elevated, 12 | **SectionCard** (12, header 40, title-md, actions), **ActionCard** (whole card is a link/button, state layer) |
| Key–value | label 12 tertiary, value 13, rows 36, 1–2 columns | — | **DescriptionList**: label 12 on-surface-variant, value 14, rows 36, 1–2 columns |
| Lists | nav and menu rows 28–32 | list items 56/72/88 | **ListItem** 48 (compact 40, two-line 64): leading icon/avatar/logo, title, supporting text, trailing value or action |
| Segmented control | dark selected fill | segmented button, secondary-container + check | **Segmented**: full-radius track, selected secondary-container **with a check** |
| Drawer | 480 create drawer, no backdrop | side sheet, large-start corners | Sheet 480, 16px leading corners, scrim when modal |
| Command palette | 624, radius 16, rows 32 | — | 624, radius 16 (large), rows 32, group labels label-md |
| Stepper | — | — | **StageProgress**: 24px markers (done = primary + check, current = ring + `aria-current="step"`), 2px connectors |
| Timeline | — | — | **Timeline**: 1px outline-variant thread with 8px markers (shares the reasoning thread) |
| Evidence | — | input chip | **SourceChip**: 24 tall, 8px, icon + label; opens the source |

**Buttons for dense chrome:** adds `xs` (28) for in-row actions; toolbars use `sm` (32).
**Inputs:** add `sm` (32) for toolbars and filter bars.
**Composer:** Gemini-style. No solid border: a raised two-layer shadow on the lowest surface
(the search pill uses the same shadow). Dusk keeps a hairline, because shadows disappear on dark.
The field stays identifiable by its placeholder, icon buttons and position; focus adds a
primary hairline and a deeper shadow.

**Workflow nodes (React Flow), after Opal and M3 cards:** node = lowest surface, radius 16,
hairline + level-1 shadow; 40px header with a 28px tonal icon chip colored by node type
(trigger = secondary, AI step = primary, decision = tertiary, output = success), title-sm and a
status badge; body 12 padding with description and key–values; 12px handles (surface fill,
2px outline ring, primary when connectable); edges 1.5px outline color with arrowheads,
dashed and animated while running (static under reduced motion); canvas = surface with an
outline-variant dot grid; controls and node toolbars = M3 floating toolbars.
