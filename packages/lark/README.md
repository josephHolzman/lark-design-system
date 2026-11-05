# Lark: `@josephholzman/lark`, imported as `@deepgrids/lark`

Lark, Deepgrids' design system: Apollo's Beams structure with the lark's palette. React 19 +
Tailwind CSS v4. Entry points:

| Import | What | Needs |
|---|---|---|
| `@deepgrids/lark` | Product components: **CPQ** (quote lines, price waterfall, policy checks, approval route, scenarios, invoice schedule, order matching), **chat states**, service logos, shell, layouts, DataGrid and cells, cards, feedback, editing, menus, AI patterns, theme | React |
| `@deepgrids/lark/ui` | Primitives (shadcn, restyled): buttons, fields, combobox, date pickers, number input, file upload, menus, dialogs… | React |
| `@deepgrids/lark/ai` | Vercel AI Elements, restyled: conversation, message, prompt input, reasoning, tool, sources, workflow canvas… | React + the optional peers below |
| `@deepgrids/lark/utils` | `cn()` (tailwind-merge that knows Lark's type roles) | — |
| `@deepgrids/lark/tokens` | Tokens as data: primitives, roles per mode, contrast checks | — |
| `@deepgrids/lark/styles.css` | Tokens, theme, utilities, fonts (Tailwind v4 apps) | Tailwind 4.1+ |
| `@deepgrids/lark/tokens.css` | CSS variables only (apps without Tailwind) | — |
| `@deepgrids/lark/tokens/*.tokens.json` | W3C design tokens (DTCG) for Figma and other tools | — |

Spec and rules: `design/LARK.md` in the repo. Living examples: `/examples/patterns`,
`/examples/quote`, `/examples/chat-states`, `/examples/deals`, `/examples/record`, `/examples/settings`.

## Install

Lark is published to GitHub Packages as **`@josephholzman/lark`** (source:
[josephHolzman/lark-design-system](https://github.com/josephHolzman/lark-design-system)). Apps
install it under the alias **`@deepgrids/lark`**, so every import reads `@deepgrids/lark` and moving
the package to a Deepgrids org later changes nothing in app code.

1. **Point the scope at GitHub Packages.** Add `.npmrc` at the app's root (commit it; the token
   comes from the environment, never the file):

   ```ini
   @josephholzman:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

   Locally, `GITHUB_TOKEN` is a personal access token (classic) with `read:packages`. In GitHub
   Actions, give the workflow `permissions: packages: read` and grant the app's repo access under
   the package's settings (Package settings → Manage Actions access).

2. **Install under the alias:**

   ```bash
   npm install @deepgrids/lark@npm:@josephholzman/lark@^0.4.0 react react-dom lucide-react tailwindcss@4 tw-animate-css
   ```

3. **Using `/ai` as well?** Install its peers (optional, so apps that don't use AI Elements stay small):

   ```bash
   npm install ai streamdown @streamdown/code @streamdown/math @streamdown/mermaid @streamdown/cjk shiki \
     @xyflow/react motion nanoid use-stick-to-bottom tokenlens media-chrome ansi-to-react \
     react-jsx-parser @rive-app/react-webgl2 @radix-ui/react-use-controllable-state
   ```

To try an unreleased build: `npm run pack:lib` in the Lark repo writes
`packages/josephholzman-lark-<version>.tgz`; install it with
`npm install @deepgrids/lark@file:<path to the .tgz>`.

**Updates.** Turn on Dependabot or Renovate in each app so every Lark release opens a PR there.

## Set up

1. **Styles.** In your global CSS:

   ```css
   @import "tailwindcss";
   @import "@deepgrids/lark/styles.css";
   ```

   Brings `tw-animate-css`, the tokens (light on `:root`, dusk on `.dark`), type roles, radius, elevation, the
   `state-layer` / `focus-ring` / `hit-area` / `link-default` utilities, `@font-face` for the
   shipped fonts, and `@source` lines so Tailwind generates the classes Lark uses.

2. **Fonts.** Nothing to do: Hanken Grotesk and Geist Mono (variable, OFL) ship in the package and
   load on first use. Apps that already load them (for example `next/font` setting
   `--font-hanken` and `--font-geist-mono`) keep theirs; the shipped files are then never fetched.

3. **Links.** Give Lark your router's link (Next: in a small client component, because functions
   can't pass from a server layout to a client provider):

   ```tsx
   "use client";
   import Link from "next/link";
   import { LarkProvider } from "@deepgrids/lark";
   export function Providers({ children }: { children: React.ReactNode }) {
     return <LarkProvider linkComponent={Link}>{children}</LarkProvider>;
   }
   ```

4. **Theme.** Put `<ThemeScript />` in `<head>` (sets light or dusk before first paint, following
   the system until someone chooses) and use `useTheme()` or `<ThemeToggle />` to switch. Dusk is
   the `.dark` class on `<html>`; add `suppressHydrationWarning` to `<html>`.

5. **Toasts.** Render `<Toaster />` from `/ui` once; undo toasts and save results use it.

## Use

```tsx
import { Button, Combobox, NumberInput } from "@deepgrids/lark/ui";
import { AppShell, ListLayout, DataGrid, MoneyCell, UserTurn, WorkLog, ActionReceipt } from "@deepgrids/lark";
import { Conversation, Message, PromptInput } from "@deepgrids/lark/ai";
import { cn } from "@deepgrids/lark/utils";
```

Every module is marked `"use client"`. Import from client components, or pass them as children
from server components.

### Notes

- **DataGrid under Next `cacheComponents`.** TanStack Table reads `Date.now()` for dev-only
  timing; `DataGrid` has its own Suspense boundary, so development doesn't error and production
  still prerenders.
- **Heights.** Layouts are full bleed: from `md` up the document doesn't scroll and each region
  scrolls itself (give `DataGrid` `height="100%"` inside `ListLayout`). On phones layouts grow and
  the page scrolls.
- **Breakpoints.** Sidebar is a rail below 1280 (`AppShell compactBelow`), filter rails show from
  1024, page-header actions wrap by container width, inputs use 16px text on touch screens.
- **Accessibility.** Targets are at least 24×24 (44×44 on touch); focus rings are 2px; every
  colour pair is contrast-checked by the token generator; tests run axe on core and chat
  components (`npm test` in the repo).

## Releasing

From the Lark repo:

1. `npm run verify` (lint, types, tests, library build, consumer smoke test).
2. Bump `packages/lark/package.json` `version` and add a `CHANGELOG.md` entry.
3. Commit, tag `lark-v<version>` and push the tag. `.github/workflows/release.yml` checks the tag
   matches the version, runs `verify` and publishes to GitHub Packages.

The package is `UNLICENSED` (proprietary). After the first publish, check its visibility under
your GitHub profile → Packages → lark → Package settings: keep it private, and add each app's repo
under "Manage Actions access" so their CI can install it.
