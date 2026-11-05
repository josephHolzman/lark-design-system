import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { QuoteWorkbench } from "./quote";

export const metadata: Metadata = { title: "Quote R4 · Northwind · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Deals", href: "/examples/deals" }, { label: "Northwind Traders", href: "/examples/record" }, { label: "Quote R4" }]} current="quote">
      <QuoteWorkbench />
    </DeepgridsShell>
  );
}
