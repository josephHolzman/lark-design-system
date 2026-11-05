import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { AceChat } from "./chat";

export const metadata: Metadata = { title: "ACE · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell
      crumbs={[{ label: "ACE", href: "/examples/chat" }, { label: "Northwind renewal" }]}
      current="ace"
    >
      <AceChat />
    </DeepgridsShell>
  );
}
