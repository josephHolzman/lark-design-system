import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { Settings } from "./settings";

export const metadata: Metadata = { title: "Settings · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Settings" }, { label: "Approval policies" }]} current="settings">
      <Settings />
    </DeepgridsShell>
  );
}
