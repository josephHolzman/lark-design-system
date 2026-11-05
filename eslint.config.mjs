import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Vendored as-is from vercel/ai-elements (they lint with oxlint, not the
    // React Compiler rules). These rules stay visible as warnings here and
    // remain errors everywhere else. Fix each one when that component is
    // redesigned for Lark, then delete the file from this list.
    files: [
      "src/components/ai-elements/**",
      "src/components/ui/**",
      "src/components/chatbot.tsx",
      "src/app/review/examples/**",
    ],
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Built library output.
    "packages/*/dist/**",
  ]),
]);

export default eslintConfig;
