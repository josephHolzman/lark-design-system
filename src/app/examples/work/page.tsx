import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { Work } from "./work";

export const metadata: Metadata = { title: "Work and decisions · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Work and decisions" }]} current="work">
      <Work />
    </DeepgridsShell>
  );
}
