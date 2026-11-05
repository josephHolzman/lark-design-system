"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Lark themes: light and dusk (night blue). "system" follows prefers-color-scheme.
 * The choice is stored in localStorage["lark-theme"]; dusk is the `.dark` class on <html>,
 * so Tailwind's `dark:` variant and every Lark token switch together.
 */
export type LarkTheme = "light" | "dusk" | "system";

const KEY = "lark-theme";
const EVENT = "lark-theme-change";

function read(): LarkTheme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dusk" ? v : "system";
  } catch {
    return "system";
  }
}

function prefersDusk() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(theme: LarkTheme) {
  const dusk = theme === "dusk" || (theme === "system" && prefersDusk());
  document.documentElement.classList.toggle("dark", dusk);
  document.documentElement.style.colorScheme = dusk ? "dark" : "light";
}

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    if (read() === "system") apply("system");
    cb();
  };
  // Also notice the class changing from outside (tests, other tabs, a host app's own toggle).
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributeFilter: ["class"], attributes: true });
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  mq.addEventListener("change", onSystem);
  return () => {
    mo.disconnect();
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
    mq.removeEventListener("change", onSystem);
  };
}

/**
 * Current theme, the resolved one (what is on screen) and a setter. Server render resolves to
 * light; the ThemeScript below sets the class before first paint so there is no flash.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as LarkTheme);
  const resolved = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains("dark") ? "dusk" : "light"),
    () => "light" as const
  );
  useEffect(() => apply(theme), [theme]);
  const setTheme = useCallback((next: LarkTheme) => {
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {}
    apply(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { theme, resolved, setTheme };
}

/**
 * Put in <head> (Next: in the root layout) so the right theme is set before first paint.
 * Pass a nonce if your CSP requires one.
 */
export function ThemeScript({ nonce }: { nonce?: string }) {
  const code = `(function(){try{var t=localStorage.getItem("${KEY}");var d=t==="dusk"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(_){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} nonce={nonce} suppressHydrationWarning />;
}
