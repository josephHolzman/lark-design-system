import axe from "axe-core";

/** Runs axe on a container and returns readable violations (colour contrast is checked by the token generator instead: jsdom has no layout). */
export async function axeViolations(node: Element) {
  const res = await axe.run(node, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return res.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`);
}
