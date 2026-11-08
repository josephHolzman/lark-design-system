// Fictional deals for the Lark examples. Deterministic (no Math.random): pages prerender.

export type DealType = "New deal request" | "Renewal" | "Expansion" | "Counteroffer" | "Pricing exception" | "Order & billing";

export type QuoteLine = { sku: string; name: string; qty: number; list: number; discount: number };

export type Deal = {
  id: string;
  account: string;
  type: DealType;
  owner: string;
  team: string[];
  status: string;
  value: number;
  revision: number;
  discount: number;
  trend: number[];
  approvals: [number, number];
  close: string;
  closeLabel: string;
  risk: { state: "idle" | "done" | "failed" | "running"; value?: string; confidence?: "high" | "medium" | "low"; error?: string };
  lines: QuoteLine[];
};

const ACCOUNTS = [
  "Northwind Traders", "Halvorsen Group", "Brightline Health", "Meridian Freight", "Corvid Analytics", "Fernwood Energy",
  "Oakline Bank", "Pellucid Labs", "Quarry & Co", "Tallis Retail", "Juniper Mobility", "Kestrel Insurance",
  "Larchmont Foods", "Marrow Biotech", "Nimbus Logistics", "Orchard Learning", "Pinnacle Media", "Redwater Utilities",
  "Sable Security", "Thistle Hotels", "Umber Capital", "Vireo Telecom", "Wexford Legal", "Yarrow Health",
];
const TYPES: DealType[] = ["Renewal", "Expansion", "New deal request", "Counteroffer", "Pricing exception", "Order & billing"];
const OWNERS = ["Priya Raman", "Marcus Bell", "Avery Chen", "Dana Okafor"];
const STATUSES = ["Awaiting decision", "In review", "Review required", "Draft", "Approved", "Changes requested", "Ready for review", "Within pricing limits"];
const MONTHS = ["Nov", "Dec"];

export const DEALS: Deal[] = ACCOUNTS.map((account, i) => {
  // Northwind (i = 0) matches the quote workbench example: R4 total contract value.
  const value = i === 0 ? 1_001_710 : 40000 + ((i * 73127) % 520000);
  const discount = [24, 12, 8, 15, 5, 18, 10, 4, 22, 9, 14, 6][i % 12];
  const day = i === 0 ? 14 : 6 + ((i * 5) % 24);
  const month = i % 3 === 2 ? 1 : 0;
  const total = 2 + (i % 2);
  const riskStates: Deal["risk"][] = [
    { state: "done", value: "Discount above policy", confidence: "high" },
    { state: "idle" },
    { state: "done", value: "Low risk", confidence: "high" },
    { state: "failed", error: "Contract not found" },
    { state: "done", value: "Champion left", confidence: "low" },
    { state: "idle" },
  ];
  return {
    id: `OPP-${20431 + i * 13}`,
    account,
    type: TYPES[i % TYPES.length],
    owner: OWNERS[i % OWNERS.length],
    team: [OWNERS[i % OWNERS.length], OWNERS[(i + 1) % OWNERS.length], OWNERS[(i + 2) % OWNERS.length], "Rui Tanaka", "Sam Whitfield"].slice(0, 2 + (i % 4)),
    status: discount > 20 ? "Discount exception" : STATUSES[i % STATUSES.length],
    value,
    revision: i === 0 ? 4 : 1 + (i % 5),
    discount,
    trend: Array.from({ length: 8 }, (_, k) => 40 + ((i * 7 + k * (i % 2 ? 5 : -3) + k * k) % 30)),
    approvals: [Math.min(total, i % 4), total],
    close: `2026-${month ? "12" : "11"}-${String(day).padStart(2, "0")}`,
    closeLabel: `${MONTHS[month]} ${day}`,
    risk: riskStates[i % riskStates.length],
    lines: [
      { sku: "PLT-ENT-36", name: "Platform, enterprise", qty: 1, list: Math.round(value * 0.7), discount },
      { sku: "SUP-PRM", name: "Premium support", qty: 1, list: Math.round(value * 0.2), discount: 0 },
      { sku: "ONB-STD", name: "Onboarding", qty: 1, list: Math.round(value * 0.1), discount: 0 },
    ],
  };
});

/** Deal type is descriptive, not status: every value is a neutral tag (§3.1, §3.5). */
export const TYPE_TAG: Record<DealType, "default"> = {
  "New deal request": "default",
  Renewal: "default",
  Expansion: "default",
  Counteroffer: "default",
  "Pricing exception": "default",
  "Order & billing": "default",
};

export const usd = (n: number) => "$" + n.toLocaleString("en-US");
