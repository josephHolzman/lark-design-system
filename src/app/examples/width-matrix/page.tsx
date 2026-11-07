import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { WidthMatrix } from "./matrix";

export const metadata: Metadata = { title: "Width matrix · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Width matrix" }]} current="width-matrix">
      <WidthMatrix />
    </DeepgridsShell>
  );
}
