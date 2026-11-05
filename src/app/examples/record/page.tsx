import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { DealRecord } from "./record";

export const metadata: Metadata = { title: "Northwind Traders · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Deals", href: "/examples/deals" }, { label: "Northwind Traders" }]} current="deals-list">
      <DealRecord />
    </DeepgridsShell>
  );
}
