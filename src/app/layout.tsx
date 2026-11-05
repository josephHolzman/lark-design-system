import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";

import { ThemeScript } from "@/components/lark/theme";

import { Providers } from "./providers";
import "./globals.css";

// Hanken Grotesk, self-hosted (SIL OFL 1.1, see fonts/OFL-HankenGrotesk.txt).
// Variable weight 100–900, upright and real italic. Digits are tabular by default.
const hanken = localFont({
  variable: "--font-hanken",
  src: [
    { path: "./fonts/HankenGrotesk-Variable.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/HankenGrotesk-Italic-Variable.woff2", weight: "100 900", style: "italic" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lark",
  description: "Lark — AI chat design system playground",
};

// Typed explicitly (not Next's generated LayoutProps) so `npm run typecheck` works on a fresh clone.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
