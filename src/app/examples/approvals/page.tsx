import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { ApprovalsExample } from "./approvals";

export const metadata: Metadata = { title: "Approvals · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Approvals" }]} current="approvals">
      <ApprovalsExample />
    </DeepgridsShell>
  );
}
