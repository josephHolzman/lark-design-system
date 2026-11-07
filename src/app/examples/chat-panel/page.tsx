import type { Metadata } from "next";

import { RecordWithAce } from "./panel";

export const metadata: Metadata = { title: "Northwind Traders with ACE · Lark example" };

export default function Page() {
  return <RecordWithAce />;
}
