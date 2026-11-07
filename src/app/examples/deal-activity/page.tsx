import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { DealActivityExample } from "./activity";

export const metadata: Metadata = { title: "Deal activity · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Deal activity" }]} current="deal-activity">
      <DealActivityExample />
    </DeepgridsShell>
  );
}
