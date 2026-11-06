"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

/**
 * Lark themes: light and dusk (night blue). "system" follows prefers-color-scheme.
 * The choice is stored in localStorage[storageKey] (default "lark-theme"). Dusk is written to
 * <html> as the `.dark` class (attribute "class", the default), as data-theme="dark"
 * (attribute "data-theme"; light is data-theme="light"), or both. Tailwind's `dark:` variant and
 * every Lark token follow the `.dark` class; use "data-theme" only if your CSS keys off it.
 */
export type LarkTheme = "light" | "dusk" | "system";
export type ThemeAttribute = "class" | "data-theme" | "both";
export type ThemeOptions = {
  /** localStorage key that holds the choice. Default "lark-theme". */
  storageKey?: string;
  /** How dusk is marked on <html>. Default "class". */
  attribute?: ThemeAttribute;
};

const DEFAULT_KEY = "lark-theme";

/** The window event fired when the theme changes in this tab: "<storageKey>-change". */
export function themeEventName(storageKey = DEFAULT_KEY) {
  return `${storageKey}-change`;
}

function read(key: string): LarkTheme {
  try {
    const v = localStorage.getItem(key);
    // "dark" is accepted too, for apps whose stored values predate Lark.
    return v === "light" ? "light" : v === "dusk" || v === "dark" ? "dusk" : "system";
  } catch {
    return "system";
  }
}

function prefersDusk() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(theme: LarkTheme, attribute: ThemeAttribute) {
  const dusk = theme === "dusk" || (theme === "system" && prefersDusk());
  const el = document.documentElement;
  if (attribute !== "data-theme") el.classList.toggle("dark", dusk);
  if (attribute !== "class") el.setAttribute("data-theme", dusk ? "dark" : "light");
  el.style.colorScheme = dusk ? "dark" : "light";
}

function resolvedNow(attribute: ThemeAttribute): "light" | "dusk" {
  const el = document.documentElement;
  const dusk = attribute === "data-theme" ? el.getAttribute("data-theme") === "dark" : el.classList.contains("dark");
  return dusk ? "dusk" : "light";
}

function makeSubscribe(key: string, attribute: ThemeAttribute) {
  return (cb: () => void) => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (read(key) === "system") apply("system", attribute);
      cb();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === key) cb();
    };
    // Also notice the marker changing from outside (tests, other tabs, a host app's own toggle).
    const mo = new MutationObserver(cb);
    mo.observe(document.documentElement, { attributeFilter: ["class", "data-theme"], attributes: true });
    const event = themeEventName(key);
    window.addEventListener(event, cb);
    window.addEventListener("storage", onStorage);
    mq.addEventListener("change", onSystem);
    return () => {
      mo.disconnect();
      window.removeEventListener(event, cb);
      window.removeEventListener("storage", onStorage);
      mq.removeEventListener("change", onSystem);
    };
  };
}

/**
 * Current theme, the resolved one (what is on screen) and a setter. Server render resolves to
 * light; the ThemeScript below sets the marker before first paint so there is no flash. Pass the
 * same options to ThemeScript, useTheme and ThemeToggle.
 */
export function useTheme({ storageKey = DEFAULT_KEY, attribute = "class" }: ThemeOptions = {}) {
  const subscribe = useMemo(() => makeSubscribe(storageKey, attribute), [storageKey, attribute]);
  const theme = useSyncExternalStore(subscribe, () => read(storageKey), () => "system" as LarkTheme);
  const resolved = useSyncExternalStore(subscribe, () => resolvedNow(attribute), () => "light" as const);
  useEffect(() => apply(theme, attribute), [theme, attribute]);
  const setTheme = useCallback(
    (next: LarkTheme) => {
      try {
        if (next === "system") localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, next);
      } catch {}
      apply(next, attribute);
      window.dispatchEvent(new Event(themeEventName(storageKey)));
    },
    [storageKey, attribute]
  );
  return { theme, resolved, setTheme };
}

/** The inline boot script ThemeScript renders (exported for apps that serve it as a file). */
export function themeScriptSource({ storageKey = DEFAULT_KEY, attribute = "class" }: ThemeOptions = {}) {
  // JSON-encode the key and escape "<" so a key can never close the <script>.
  const k = JSON.stringify(storageKey).replace(/</g, "\\u003c");
  const cls = attribute !== "data-theme" ? 'e.classList.toggle("dark",d);' : "";
  const attr = attribute !== "class" ? 'e.setAttribute("data-theme",d?"dark":"light");' : "";
  return `(function(){try{var t=localStorage.getItem(${k});var d=t==="dusk"||t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;${cls}${attr}e.style.colorScheme=d?"dark":"light";}catch(_){}})();`;
}

/**
 * Put in <head> (Next: in the root layout) so the right theme is set before first paint.
 * Pass a nonce if your CSP requires one.
 */
export function ThemeScript({ nonce, ...options }: ThemeOptions & { nonce?: string }) {
  return <script dangerouslySetInnerHTML={{ __html: themeScriptSource(options) }} nonce={nonce} suppressHydrationWarning />;
}
