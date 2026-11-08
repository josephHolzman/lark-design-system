import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { Records } from "./records";

export const metadata: Metadata = { title: "Record patterns · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Record patterns" }]} current="records">
      <Records />
    </DeepgridsShell>
  );
}
