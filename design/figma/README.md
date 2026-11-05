# Lark in Figma

Figma file: **AI Design System — Lark** (`DVWf57vCwAmFDplkZ4SkBF`). Code is the source of truth;
Figma mirrors it. This is what goes into Figma and how it stays in sync.

## 1. Variables (tokens) — ready

`npm run build:lib` writes W3C design tokens (DTCG format) to `design/tokens/dtcg/`:

| File | Figma collection | Modes |
|---|---|---|
| `primitives.tokens.json` | `lark/primitives` (161 colour steps) | one |
| `light.tokens.json` + `dusk.tokens.json` | `lark/roles` (55 colour roles, aliased to primitives) | Light, Dusk |
| `scale.tokens.json` | `lark/scale` (radius, sizes, durations) + text styles (10 type roles) | one |

Import order matters, because roles are aliases: primitives first, then roles (light into the
Light mode, dusk into the Dusk mode), then scale. Use Figma's variable import if your plan has it,
or the Tokens Studio plugin, which reads these files as they are. Type roles become **text
styles** (Hanken Grotesk, sizes and weights from `scale.tokens.json`); elevation becomes **effect
styles** (values are CSS box-shadows: x y blur spread colour).

Naming in Figma matches code: the role `on-surface-variant` is the variable
`lark/roles/on-surface-variant` and the Tailwind class `text-on-surface-variant`.

## 2. Components — to build

Figma components should mirror the code API: one component per exported component, variant
properties named after props (`variant`, `size`, `state`, `tone`), using only role variables.
Order, by how often product work needs them:

1. Button, IconButton, Badge, StatusBadge, Tag, Input, NumberInput, Combobox, DatePicker,
   Checkbox, Radio, Switch, Tabs (underline, segmented), Segmented, Tooltip, Menu.
2. SectionCard, ActionCard, Callout, Banner, StatePanel, FileRow.
3. DataGrid header/row/cell set (record, money, percent bar, sparkline, progress, avatars,
   tags, actions, AI run cell), pager, bulk bar.
4. CPQ: QuoteLines row set (proposed, validating, locked, above limit), DiscountMeter,
   PriceWaterfall row, PolicyChecks row, ApprovalRoute card (every approver state), Scenario
   card, InvoiceSchedule, OrderMatch row, SourceLine, ServiceLogo (use the files in
   `design/logos/`).
5. Chat: UserTurn, ThinkingRow, WorkLog row, ClarifyQuestion, ActionReview, ActionReceipt,
   DraftCard, AnswerSources row, ConversationListItem, composer with notices.
6. Page templates: ListLayout, RecordLayout, SettingsLayout, quote workbench, chat workspace — at 1440, 1024 and
   390 wide, light and dusk.

`/examples/patterns` and `/examples/chat-states` in the app show every state to copy.

## 3. Code Connect — after step 2

`figma.config.json` at the repo root is set up for React. When a component exists in Figma,
add a `*.figma.tsx` next to it in `src/components/` mapping its Figma variant properties to
props (`npx figma connect create <node-url>` scaffolds one), then `npx figma connect publish`.
Dev Mode then shows the real Lark import and props instead of generated CSS.

## Keeping them in sync

- Token change: edit `design/tokens/build_tokens.py`, run `npm run tokens` (rewrites the CSS
  and `src/design/tokens.ts`), then `npm run build:lib` (rewrites the DTCG files), then re-import
  into Figma. Never edit variables in Figma first.
- Every release (`packages/lark/CHANGELOG.md`) lists component API changes; update the matching
  Figma component in the same week.
