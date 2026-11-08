import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { Slots } from "./slots";

export const metadata: Metadata = { title: "Slots and fixes · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Slots and fixes" }]} current="slots">
      <Slots />
    </DeepgridsShell>
  );
}
