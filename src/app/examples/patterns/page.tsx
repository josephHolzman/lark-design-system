import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { Patterns } from "./patterns";

export const metadata: Metadata = { title: "Patterns · Lark" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark" }, { label: "Patterns" }]} current="patterns">
      <Patterns />
    </DeepgridsShell>
  );
}
