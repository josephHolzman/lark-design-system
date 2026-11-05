"use client";

import { type AnchorHTMLAttributes, type ComponentType, createContext, type ReactNode, type Ref, useContext } from "react";

/**
 * Lark is framework-agnostic: components that navigate render `LarkLink`, which uses
 * whatever link component the app provides (Next's `Link`, React Router's `Link`…) and
 * falls back to a plain <a>.
 *
 *   import Link from "next/link";
 *   <LarkProvider linkComponent={Link}>{children}</LarkProvider>
 */
export type LarkLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; ref?: Ref<HTMLAnchorElement> };

type LarkConfig = { linkComponent?: ComponentType<LarkLinkProps> };

const LarkContext = createContext<LarkConfig>({});

export function LarkProvider({ children, linkComponent }: LarkConfig & { children: ReactNode }) {
  return <LarkContext.Provider value={{ linkComponent }}>{children}</LarkContext.Provider>;
}

export function LarkLink(props: LarkLinkProps) {
  const { linkComponent: L } = useContext(LarkContext);
  if (L) return <L {...props} />;
  return <a {...props} />;
}
