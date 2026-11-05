"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { LarkProvider } from "@/components/lark/provider";

/** Client boundary for app-wide providers (a component can't be passed as a prop from a server component). */
export function Providers({ children }: { children: ReactNode }) {
  return <LarkProvider linkComponent={Link}>{children}</LarkProvider>;
}
