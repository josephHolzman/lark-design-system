import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { DealsList } from "./deals";

export const metadata: Metadata = { title: "All deals · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Deals", href: "/examples/deals" }, { label: "All deals" }]} current="deals-list">
      <DealsList />
    </DeepgridsShell>
  );
}
