import path from "node:path";
import { defineConfig } from "tsup";

// Run from the repo root: npm run build:lib
const root = process.cwd();
const src = (p: string) => path.join(root, "src", p);

export default defineConfig({
  entry: {
    index: src("components/lark/index.ts"),
    ui: src("components/ui/index.ts"),
    ai: src("components/ai-elements/index.ts"),
    utils: src("lib/utils.ts"),
    tokens: src("design/tokens.ts"),
  },
  outDir: path.join(root, "packages/lark/dist"),
  format: ["esm"],
  target: "es2022",
  dts: { compilerOptions: { incremental: false, composite: false } },
  outExtension: () => ({ js: ".js" }),
  splitting: true,
  sourcemap: true,
  clean: true,
  // Everything that isn't relative or the @/ alias is a dependency the consumer installs.
  external: [/^(?!@\/)(?![./])/],
  esbuildOptions(options) {
    options.alias = { "@": path.join(root, "src") };
    options.jsx = "automatic";
  },
  // Components use hooks and context; mark every module as a client module for RSC apps.
  banner: { js: '"use client";' },
  tsconfig: path.join(root, "tsconfig.json"),
  onSuccess: "node packages/lark/scripts/build-styles.mjs && node packages/lark/scripts/build-tokens.mjs",
});
