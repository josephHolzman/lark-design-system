import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { Foundations } from "./foundations";

export const metadata: Metadata = { title: "Foundations · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Foundations" }]} current="foundations">
      <Foundations />
    </DeepgridsShell>
  );
}
