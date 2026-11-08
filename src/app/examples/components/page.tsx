import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { ComponentCatalog } from "./catalog";

export const metadata: Metadata = { title: "Component matrix · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Component matrix" }]} current="components">
      <ComponentCatalog />
    </DeepgridsShell>
  );
}
