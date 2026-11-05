import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { ChatStates } from "./chat-states";

export const metadata: Metadata = { title: "Chat states · Lark" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark" }, { label: "Chat states" }]} current="chat-states">
      <ChatStates />
    </DeepgridsShell>
  );
}
