import type { Metadata } from "next";

import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { WidgetGallery } from "./widgets";

export const metadata: Metadata = { title: "Answer widgets · Lark example" };

export default function Page() {
  return (
    <DeepgridsShell crumbs={[{ label: "Lark", href: "/examples/patterns" }, { label: "Answer widgets" }]} current="widgets">
      <WidgetGallery />
    </DeepgridsShell>
  );
}
