# Lark 0.5 progress

Gap list: `deepgrids/apps/enterprise-workspace/docs/lark/lark-gaps.md` §1.

- [x] K1
- [ ] K2

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
