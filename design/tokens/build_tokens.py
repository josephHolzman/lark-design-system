#!/usr/bin/env python3
"""Lark color tokens: primitives -> roles (Apollo Beams structure) -> CSS + TypeScript.

Run from the repo root:  python design/tokens/build_tokens.py
Needs only Python 3. Fails (exit 1) if any role pair misses its WCAG minimum.

Inputs   design/tokens/primitives.json   44 primitives, mirrors Figma "lark/primitives"
Outputs  src/app/globals.css             block between the @lark-tokens markers
         src/design/tokens.ts            same data for the /review page
"""
import json, math, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# ---------------------------------------------------------------- color math
def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def _unlin(c):
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055

def _rgb(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]

def to_oklch(h):
    r, g, b = [_lin(x) for x in _rgb(h)]
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360

def from_oklch(L, C, H):
    """Hex for an OKLCH color, reducing chroma until it fits in sRGB."""
    while True:
        a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
        l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
        m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
        s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
        rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
               -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
               -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s]
        if all(-1e-4 <= x <= 1 + 1e-4 for x in rgb) or C <= 0:
            break
        C -= 0.001
    return "#%02X%02X%02X" % tuple(round(min(1, max(0, _unlin(min(1, max(0, x))))) * 255) for x in rgb)

def contrast(a, b):
    def lum(h):
        r, g, bl = [_lin(x) for x in _rgb(h)]
        return 0.2126 * r + 0.7152 * g + 0.0722 * bl
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)

def fit_darker(base, bg, target):
    """Darken `base` (same hue and chroma) until it reaches `target` on `bg`."""
    L, C, H = to_oklch(base)
    while contrast(from_oklch(L, C, H), bg) < target + 0.03:
        L -= 0.0025
    return from_oklch(L, C, H)

# ---------------------------------------------------------------- primitives
prim = json.loads((ROOT / "design/tokens/primitives.json").read_text())
P = {f"{fam}-{step}": hx for fam, steps in prim.items() for step, hx in steps.items()}

# v0.6: Cohere's warm coral, darkened until a chart mark or icon on white reaches 3:1 (WCAG
# 1.4.11), and a light version for dusk. Coral is for charts and the coral wash, never status.
P["coral-50"] = fit_darker("#FF7759", "#FFFFFF", 3.0)
P["coral-d50"] = from_oklch(0.76, 0.12, to_oklch("#FF7759")[2])

# v0.6 chart palette (Cohere-like, saturated but calm): cobalt (sky, deepened), coral, teal, plum,
# amber. Each mark reaches 3:1 on white (WCAG 1.4.11); dusk versions are lighter at the same hue.
# viz-10 cobalt · viz-20 teal · viz-30 plum · viz-40 amber (coral is coral-50).
VIZ = {"10": "#3E6AE1", "20": "#1F8A74", "30": "#A64CA6", "40": "#B9771C"}
for step, hx in VIZ.items():
    P[f"viz-{step}"] = hx
    L, C, H = to_oklch(hx)
    P[f"viz-d{step}"] = from_oklch(0.76, C * 0.85, H)

# In-between warm stone steps for M3's tonal surface containers.
P["stone-75"] = from_oklch(0.963, 0.012, 86)
P["stone-125"] = from_oklch(0.938, 0.013, 84)
P["stone-150"] = from_oklch(0.925, 0.014, 83)

# ---------------------------------------------------------------- Beams structure
# Since 2026-11-05 Lark follows Apollo's Beams system: a warm neutral ("paper") built
# on Beams' sand lightness and chroma, ink-alpha borders, colour only for status and
# category badges. The lark stays in four places: sky is the brand button, the tan
# (sand) is "selected", dusk is the dark mode, and the neutral carries stone's hue.

STONE_H = to_oklch(P["stone-500"])[2]
BEAMS_SAND = {"0": "#ffffff", "02": "#fdfdfc", "04": "#fafaf8", "08": "#f4f4f2", "10": "#efefeb",
              "20": "#d4d4cf", "30": "#b9b9b2", "40": "#9e9e96", "50": "#83837a", "60": "#68685d",
              "70": "#535347", "80": "#434339", "90": "#2f2f27", "94": "#1c1c18", "100": "#131310"}
for step, hx in BEAMS_SAND.items():
    L, C, _ = to_oklch(hx)
    P[f"paper-{step}"] = hx if step == "0" else from_oklch(L, C, STONE_H)
P["paper-15"] = from_oklch((to_oklch(P["paper-10"])[0] + to_oklch(P["paper-20"])[0] * 0.25) / 1.25, 0.006, STONE_H)

# Beams hue ramps (steps 10 fill tint, 20 badge fill, 30 hover/border, 50 solid, 60 text, 70 label).
BEAMS = {
    "ocean": "#ecf3fe #dae5fc #a8c3eb #6697c9 #447aaf #2b5782 #1d3d58 #122536",
    "rust": "#fff1ee #fedbd7 #fea99f #e86f5f #d14532 #9e3225 #6a2419 #451610",
    "evergreen": "#ebf4eb #d8e8da #a5caa9 #62a265 #4b814f #396039 #274427 #1b2d1b",
    "ember": "#f9f1ed #f3e2d3 #e4bc9b #ce8345 #b16120 #884411 #602f0c #402007",
    "iris": "#f5f1fd #e4dcf9 #c3b8f4 #9d84dc #7f63c5 #603fab #3f2b73 #291c4a",
    "tropic": "#ebf4f4 #d3e7e9 #99cbcc #5a9ea0 #487e7f #355d5f #294343 #192929",
    "sakura": "#fbf0fb #f6daf5 #eaa9e5 #da67cf #bc44b1 #8c3485 #5f235b #3e1739",
    "olive": "#f1f3ec #dee5d1 #b8c69a #839b55 #6a7d45 #4e5c33 #384224 #1e2b18",
}
for fam, hexes in BEAMS.items():
    for step, hx in zip((10, 20, 30, 40, 50, 60, 70, 80), hexes.split()):
        P[f"{fam}-{step}"] = hx
    # Dusk pair for each hue: a dark container and a light label at the hue's chroma.
    H = to_oklch(P[f"{fam}-50"])[2]
    C = to_oklch(P[f"{fam}-50"])[1]
    P[f"{fam}-d20"] = from_oklch(0.31, min(C, 0.12) * 0.55, H)
    P[f"{fam}-d70"] = from_oklch(0.88, min(C, 0.12) * 0.45, H)
    P[f"{fam}-d50"] = from_oklch(0.76, min(C, 0.12) * 0.75, H)

# Dusk: low-chroma night blue for dark-mode surfaces and outlines.
for k, L in {100: .135, 200: .165, 300: .19, 400: .21, 500: .245, 600: .28, 700: .34, 800: .62}.items():
    P[f"dusk-{k}"] = from_oklch(L, 0.016, 258)

WORST_LIGHT = P["paper-15"]
P["paper-55"] = fit_darker(P["paper-50"], WORST_LIGHT, 3.0)          # field/checkbox edges (3:1)
P["sky-650"] = fit_darker(P["sky-600"], WORST_LIGHT, 4.5)             # links, focus, accents
INK = P["paper-94"]

def alpha(hx, a):
    return hx.lower() + format(round(a * 255), "02x")

LIGHT = {
    # surfaces
    "canvas": "paper-08", "surface": "#FFFFFF", "surface-container-lowest": "#FFFFFF",
    "surface-container-low": "paper-04", "surface-container": "paper-08",
    "surface-container-high": "paper-10", "surface-container-highest": "paper-15",
    # text and lines
    "on-surface": "paper-94", "on-surface-variant": "paper-70", "on-surface-tertiary": "paper-60",
    "outline": "paper-55", "outline-strong": alpha(INK, 0.12), "outline-variant": alpha(INK, 0.08),
    "outline-faint": alpha(INK, 0.04),
    # brand: the sky swatch, on the one primary button per view
    "brand": "sky-300", "brand-hover": "sky-400", "brand-pressed": "sky-500", "on-brand": "paper-94",
    # action blue: links, focus, progress, accents
    "primary": "sky-650", "on-primary": "#FFFFFF", "primary-container": "sky-100", "on-primary-container": "sky-900",
    # selected: the tan swatch (Beams' pebble)
    "secondary-container": "sand-100", "on-secondary-container": "sand-800",
    "selected-strong": "sand-200", "selected-border": "sand-300",
    # AI: iris, always
    "tertiary": "iris-60", "on-tertiary": "#FFFFFF", "tertiary-container": "iris-20", "on-tertiary-container": "iris-70",
    "ai-border": "iris-40",
    # status
    "error": "rust-60", "on-error": "#FFFFFF", "error-container": "rust-20", "on-error-container": "rust-70",
    "success": "evergreen-60", "on-success": "#FFFFFF", "success-container": "evergreen-20", "on-success-container": "evergreen-70",
    "warning": "ember-60", "on-warning": "#FFFFFF", "warning-container": "ember-20", "on-warning-container": "ember-70",
    # categories (badges only)
    "tag-teal": "tropic-20", "on-tag-teal": "tropic-70", "tag-pink": "sakura-20", "on-tag-pink": "sakura-70",
    "tag-olive": "olive-20", "on-tag-olive": "olive-70",
    # inverse and misc
    "inverse-surface": "paper-90", "inverse-on-surface": "#FFFFFF", "inverse-primary": "sky-300", "scrim": "paper-100",
    "terminal": "dusk-200", "on-terminal": "stone-100",
}
DUSK = {
    "canvas": "dusk-100", "surface": "dusk-200", "surface-container-lowest": "dusk-100",
    "surface-container-low": "dusk-300", "surface-container": "dusk-400",
    "surface-container-high": "dusk-500", "surface-container-highest": "dusk-600",
    "on-surface": "stone-100", "on-surface-variant": "stone-300", "on-surface-tertiary": "stone-400",
    "outline": "dusk-800", "outline-strong": alpha("#e9eef7", 0.16), "outline-variant": alpha("#e9eef7", 0.10),
    "outline-faint": alpha("#e9eef7", 0.06),
    "brand": "sky-300", "brand-hover": "sky-200", "brand-pressed": "sky-400", "on-brand": "dusk-100",
    "primary": "sky-300", "on-primary": "sky-950", "primary-container": "sky-800", "on-primary-container": "sky-100",
    "secondary-container": "sand-900", "on-secondary-container": "sand-100",
    "selected-strong": "sand-800", "selected-border": "sand-700",
    "tertiary": "iris-d50", "on-tertiary": "dusk-100", "tertiary-container": "iris-d20", "on-tertiary-container": "iris-d70",
    "ai-border": "iris-d50",
    "error": "rust-d50", "on-error": "dusk-100", "error-container": "rust-d20", "on-error-container": "rust-d70",
    "success": "evergreen-d50", "on-success": "dusk-100", "success-container": "evergreen-d20", "on-success-container": "evergreen-d70",
    "warning": "ember-d50", "on-warning": "dusk-100", "warning-container": "ember-d20", "on-warning-container": "ember-d70",
    "tag-teal": "tropic-d20", "on-tag-teal": "tropic-d70", "tag-pink": "sakura-d20", "on-tag-pink": "sakura-d70",
    "tag-olive": "olive-d20", "on-tag-olive": "olive-d70",
    "inverse-surface": "stone-100", "inverse-on-surface": "stone-900", "inverse-primary": "sky-650", "scrim": "#000000",
    "terminal": "dusk-100", "on-terminal": "stone-100",
}
SURFACES = ["canvas", "surface", "surface-container-lowest", "surface-container-low", "surface-container",
            "surface-container-high", "surface-container-highest"]
CHECKS = []
for s in SURFACES:
    CHECKS += [("on-surface", s, 4.5), ("on-surface-variant", s, 4.5), ("on-surface-tertiary", s, 4.5),
               ("primary", s, 4.5), ("outline", s, 3.0), ("error", s, 4.5), ("success", s, 4.5),
               ("warning", s, 4.5), ("tertiary", s, 4.5)]
for a in ("primary", "tertiary", "error", "success", "warning"):
    CHECKS.append((f"on-{a}", a, 4.5))
for a in ("primary", "secondary", "tertiary", "error", "success", "warning"):
    CHECKS.append((f"on-{a}-container", f"{a}-container", 4.5))
for t in ("teal", "pink", "olive"):
    CHECKS.append((f"on-tag-{t}", f"tag-{t}", 4.5))
CHECKS += [("on-secondary-container", "selected-strong", 4.5),
           ("on-brand", "brand", 4.5), ("on-brand", "brand-hover", 4.5), ("on-brand", "brand-pressed", 4.5),
           ("inverse-on-surface", "inverse-surface", 4.5), ("on-terminal", "terminal", 4.5)]

def hexof(v):
    return v if v.startswith("#") else P[v]

def cssval(v):
    return v.lower() if v.startswith("#") else f"var(--lark-{v})"

modes = {}
failed = []
for name, m in (("light", LIGHT), ("dusk", DUSK)):
    rows = []
    for fg, bg, mn in CHECKS:
        r = round(contrast(hexof(m[fg]), hexof(m[bg])), 2)
        rows.append({"fg": fg, "bg": bg, "ratio": r, "min": mn})
        if r < mn:
            failed.append(f"{name}: {fg} on {bg} = {r} < {mn}")
    modes[name] = {"roles": {k: {"src": v, "hex": hexof(v)} for k, v in m.items()}, "checks": rows}

if failed:
    print("Contrast failures:\n  " + "\n  ".join(failed))
    sys.exit(1)

# ---------------------------------------------------------------- CSS
ALIASES = {
    "background": "surface", "foreground": "on-surface",
    "card": "surface-container-lowest", "card-foreground": "on-surface",
    "popover": "surface-container-lowest", "popover-foreground": "on-surface",
    "primary-foreground": "on-primary",
    "secondary": "surface-container-high", "secondary-foreground": "on-surface",
    "muted": "surface-container", "muted-foreground": "on-surface-variant",
    "accent": "surface-container", "accent-foreground": "on-surface",
    "destructive": "error", "destructive-foreground": "on-error",
    "border": "outline-variant", "input": "outline", "ring": "primary",
    "sidebar": "surface", "sidebar-foreground": "on-surface",
    "sidebar-primary": "primary", "sidebar-primary-foreground": "on-primary",
    "sidebar-accent": "surface-container", "sidebar-accent-foreground": "on-surface",
    "sidebar-border": "outline-variant", "sidebar-ring": "primary",
}
DUSK_ALIASES = {"card": "surface", "popover": "surface-container-high"}
CHARTS = {"light": ["viz-10", "coral-50", "viz-20", "viz-30", "viz-40"],
          "dusk": ["viz-d10", "coral-d50", "viz-d20", "viz-d30", "viz-d40"]}

def order(name):
    fam, step = name.rsplit("-", 1)
    fams = ["paper", "sky", "sand", "coral", "viz", "stone", "crown", "dusk", "ocean", "rust", "evergreen", "ember",
            "iris", "tropic", "sakura", "olive"]
    num = int(step.lstrip("d")) + (1000 if step.startswith("d") else 0)
    return (fams.index(fam) if fam in fams else 99, num, step)

lines = ["/* @lark-tokens:start — generated by design/tokens/build_tokens.py; edit that, not this block. */",
         "", "/* 1. Primitives. The 44 base steps mirror Figma \"lark/primitives\"; the rest are derived. */", ":root {"]
lines += [f"  --lark-{k}: {P[k].lower()};" for k in sorted(P, key=order)]
lines += ["}", "", "/* 2. Color roles (Beams structure, Lark palette). Every text and control pair is contrast-checked by the generator. */"]
for sel, name in ((":root", "light"), (".dark", "dusk")):
    m = LIGHT if name == "light" else DUSK
    lines += [f"{sel} {{", f"  color-scheme: {'light' if name == 'light' else 'dark'};"]
    lines += [f"  --{k}: {cssval(v)};" for k, v in m.items()]
    lines += [f"  --chart-{i + 1}: var(--lark-{c});" for i, c in enumerate(CHARTS[name])]
    lines += ["}"]
lines += ["", "/* 3. shadcn variable names, aliased to the roles so every AI Element inherits them. */",
          ":root,", ".dark {"]
lines += [f"  --{k}: var(--{v});" for k, v in ALIASES.items()]
lines += ["}", ".dark {"]
lines += [f"  --{k}: var(--{v});" for k, v in DUSK_ALIASES.items()]
lines += ["}", "/* @lark-tokens:end */"]
block = "\n".join(lines)

css_path = ROOT / "src/app/globals.css"
css = css_path.read_text()
pattern = re.compile(r"/\* @lark-tokens:start.*?/\* @lark-tokens:end \*/", re.S)
if not pattern.search(css):
    sys.exit("globals.css has no @lark-tokens markers")
css_path.write_text(pattern.sub(lambda _: block, css))

# ---------------------------------------------------------------- TypeScript
ts = ["// Generated by design/tokens/build_tokens.py. Do not edit by hand.", "",
      "export type RoleCheck = { fg: string; bg: string; ratio: number; min: number };",
      "export type Mode = { roles: Record<string, { src: string; hex: string }>; checks: RoleCheck[] };", "",
      f"export const primitives: Record<string, string> = {json.dumps({k: P[k] for k in sorted(P, key=order)}, indent=2)};", "",
      f"export const modes: Record<\"light\" | \"dusk\", Mode> = {json.dumps(modes, indent=2)};", ""]
out = ROOT / "src/design/tokens.ts"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("\n".join(ts))

print(f"OK: {len(P)} primitives, {len(LIGHT)} roles x 2 modes, {len(CHECKS) * 2} contrast checks passed.")
