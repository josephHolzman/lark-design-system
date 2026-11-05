"""Regenerates src/components/lark/logos.data.ts from the SVGs in this folder."""
import json, re, urllib.parse
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE.parent.parent / "src/components/lark/logos.data.ts"
NAMES = ["salesforce", "outlook", "slack", "teams", "sharepoint", "meet", "zoom", "excel", "word"]

lines = [
    "// Generated from design/logos/*.svg by design/logos/build.py. Do not edit by hand.",
    "// Third-party marks identify the services Deepgrids connects to (nominative use). Keep them",
    "// unaltered, at their own colours, and never as decoration; follow each brand's guidelines.",
    "",
    "export const LOGO_SRC: Record<string, string> = {",
]
for n in NAMES:
    svg = re.sub(r"\s+", " ", (HERE / f"{n}.svg").read_text().strip())
    lines.append(f'  {n}: "data:image/svg+xml,{urllib.parse.quote(svg, safe=" =:/;,.-_()")}",')
lines.append("};")
paths = re.findall(r'<path d="([^"]+)"', (HERE / "ace.svg").read_text())
lines += ["", "/** The ACE mark (ACELogo.svg), drawn in currentColor. */", f"export const ACE_PATHS = {json.dumps(paths)};", ""]
OUT.write_text("\n".join(lines))
print(f"{OUT}: {len(NAMES)} logos, ACE mark with {len(paths)} paths")
