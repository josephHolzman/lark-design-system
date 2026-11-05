import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = { title: "Deals & approvals · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell
      crumbs={[{ label: "Deal desk", href: "/examples/dashboard" }, { label: "Deals & approvals" }]}
      current="deals"
    >
      <Dashboard />
    </DeepgridsShell>
  );
}
