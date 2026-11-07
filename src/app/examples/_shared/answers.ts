// Example answers for the chat screens and the widget gallery. Fictional companies and people.
import type { AnswerDoc, AnswerSection } from "@/components/lark/answer";
import type { ToolCall } from "@/components/lark/chat";
import type { ReasoningStep } from "@/components/lark/conversation";

const NORTHWIND = { label: "Northwind Traders", detail: "Renewal, OPP-20431" };

const SOURCES = {
  quote: { label: "Quote R4", system: "Salesforce CPQ", role: "Line prices and discounts", detail: "Version 4 of 4", excerpt: "PLT-ENT-36 platform, list $281,820.00, discount 24%." },
  policy: { label: "EMEA discount policy FY27", system: "SharePoint", role: "Desk limit", detail: "Version 3, effective Jul 1", excerpt: "Deal desk may approve up to 20% on 36-month renewals. Above 20% needs VP Finance." },
  opp: { label: "Opportunity OPP-20431", system: "Salesforce", role: "Term, owner and close date", detail: "Updated 2 min ago", excerpt: "Stage: Negotiation. Term: 36 months. Owner: Priya Raman. Close: Nov 14, 2026." },
  email: { label: "Rollout email from Dana Whitfield", system: "Outlook", role: "First-invoice limit", detail: "Oct 29", excerpt: "Procurement can't approve a first invoice above $250,000 this fiscal year." },
  history: { label: "Closed-won renewals, EMEA, 36 months", system: "Salesforce", role: "Precedent", detail: "38 deals since Jan 2025" },
};

/* ------------------------------------------------------------------ 1. approval */

export const APPROVAL: AnswerDoc = {
  tag: NORTHWIND,
  headline: "Northwind needs VP Finance for the platform discount",
  context: { text: "Quote R4 checked against the FY27 EMEA discount policy", status: { text: "Needs VP Finance", tone: "attention" } },
  lead: "The platform line is discounted 24%. On a 36-month renewal the desk can approve up to 20%, so the exception goes to Rui Tanaka.",
  stats: [
    { label: "Net value", value: "$1,001,710.00", system: "Salesforce CPQ" },
    { label: "Platform discount", value: "24%", tone: "attention", status: { text: "4 points over the desk limit", tone: "attention" } },
    { label: "Desk limit", value: "20%", note: "36-month renewals, EMEA" },
  ],
  sections: [
    {
      type: "compare",
      title: "What would clear it",
      relation: "→",
      items: [
        { label: "Platform discount now", value: "24%", detail: "$214,183.20 net on the line", source: "Quote R4", system: "Salesforce CPQ" },
        { label: "Within the desk limit", value: "20%", detail: "$225,456.00 net on the line, $11,272.80 more", emphasis: true, status: { text: "The desk can approve today", tone: "positive" } },
      ],
      footer: "Everything else in the quote stays the same.",
    },
    {
      type: "steps",
      title: "Approval path",
      steps: [
        { title: "Deal desk review", meta: "Avery Chen, Nov 5", state: "done", status: { text: "Approved: term and ramp are standard", tone: "positive" } },
        { title: "Discount exception", meta: "Rui Tanaka, VP Finance", state: "current", detail: "Required because the platform discount is above 20%.", system: "Slack" },
        { title: "Legal sign-off", meta: "Sam Whitfield", state: "pending", detail: "Starts after Finance approves." },
      ],
    },
    {
      type: "question",
      title: "Ask Rui now",
      prompt: "Can you approve a 24% platform discount on Northwind's 36-month renewal? It's 4 points over the desk limit; the buyer asked for it to consolidate procurement.",
      addressee: { name: "Rui Tanaka", role: "VP Finance" },
      channel: "Slack",
      name: "Answers Rui can pick",
      options: [{ label: "Approve 24%" }, { label: "Approve at 22%" }, { label: "Decline, keep 20%" }],
      actions: [{ send: "Slack", primary: true, effect: { message: "Sent to Rui Tanaka in Slack. ACE will tell you when he answers." } }],
      actionsNote: "Goes to Rui Tanaka, #deal-desk",
    },
  ],
  prompt: "Send the question to Rui, or prepare a 20% option the desk can approve today.",
  actions: [{ label: "Prepare a 20% option", effect: { message: "ACE is preparing quote R5 at 20%.", status: { text: "Preparing R5", tone: "progress" } } }],
  sources: { items: [SOURCES.quote, SOURCES.policy, SOURCES.opp] },
};

/* ------------------------------------------------------------------ 2. schedules */

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

function schedule(kind: "annual" | "quarterly" | "monthly"): AnswerSection[] {
  const n = kind === "annual" ? 1 : kind === "quarterly" ? 4 : 12;
  const amount = 616000 / n;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels = Array.from({ length: n }, (_, i) => `${months[(i * 12) / n]} 1`);
  return [
    {
      type: "chart",
      kind: "bar",
      title: "Year one invoices",
      intro: "USD. Choose an invoice to see its amount and due date.",
      xKey: "label",
      series: [{ key: "amount", label: "Invoice amount" }],
      data: labels.map((label) => ({ label, amount })),
      format: "currency",
      reference: { value: 250000, label: "Buyer's first-invoice limit, $250,000" },
      yTicks: kind === "annual" ? [0, 200000, 400000, 600000, 800000] : [0, 100000, 200000, 300000],
      selected: 0,
      readouts: labels.map((l) => ({ label: `${l}, 2027`, value: usd(amount), meta: "Net 30" })),
    },
    {
      type: "properties",
      rows: [
        { label: "Scheduled total, year one", value: usd(616000), status: { text: "Matches the contract", tone: "positive" } },
        { label: "First invoice", value: usd(amount), status: amount > 250000 ? { text: "Above the buyer's limit", tone: "attention" } : { text: "Within the buyer's limit", tone: "positive" } },
      ],
    },
  ];
}

export const SCHEDULES: AnswerDoc = {
  tag: NORTHWIND,
  headline: "Three ways to schedule the invoices",
  context: { text: "Same products, prices and term. Only the cash timing changes.", status: { text: "Not saved", tone: "attention" } },
  sections: [
    {
      type: "options",
      title: "Invoice schedule",
      name: "Invoice schedule",
      variant: true,
      options: [
        { key: "annual", title: "Annual in advance", value: "$616,000.00", meta: "First invoice $616,000.00", note: { text: "Above the buyer's $250,000 limit", tone: "attention" } },
        { key: "quarterly", title: "Quarterly", value: "$616,000.00", meta: "First invoice $154,000.00", note: { text: "Finance reviews the schedule" }, selected: true },
        { key: "monthly", title: "Monthly", value: "$616,000.00", meta: "First invoice $51,333.33", note: { text: "Needs a payment-terms exception", tone: "attention" } },
      ],
    },
  ],
  tabs: [
    { label: "Cash schedule", sections: schedule("quarterly"), aside: [{ type: "quote", text: "Procurement can't approve a first invoice above $250,000 this fiscal year.", attribution: "Dana Whitfield, Oct 29", system: "Outlook" }] },
    {
      label: "Terms",
      sections: [
        {
          type: "properties",
          rows: [
            { label: "Term", value: "36 months" },
            { label: "Payment terms", value: "Net 30, quarterly in advance", editable: true },
            { label: "Price protection", value: "Year two and three capped at 5%" },
          ],
        },
        { type: "note", text: "Finance reviews any schedule that isn't annual in advance. Reviews take about a day." },
      ],
    },
  ],
  prompt: "Save the quarterly schedule to quote R5, or keep comparing.",
  actions: [{ label: "Save to quote R5", primary: true, effect: { message: "Saved to quote R5. Finance review requested.", status: { text: "Saved to R5", tone: "positive" } } }],
  sources: { items: [SOURCES.quote, SOURCES.email] },
  variants: {
    annual: {
      context: { text: "Same products, prices and term. Only the cash timing changes.", status: { text: "Not saved", tone: "attention" } },
      tabs: [{ label: "Cash schedule", sections: schedule("annual") }, { label: "Terms", sections: [{ type: "note", tone: "attention", text: "Annual in advance puts the first invoice above the buyer's limit. Expect the buyer to push back." }] }],
      prompt: "Annual in advance needs no review, but the buyer has said it won't clear procurement.",
    },
    monthly: {
      tabs: [{ label: "Cash schedule", sections: schedule("monthly") }, { label: "Terms", sections: [{ type: "note", tone: "critical", text: "Monthly billing on a 36-month enterprise term needs a payment-terms exception from the CFO." }] }],
      prompt: "Monthly needs a CFO exception. Quarterly clears the buyer's limit without one.",
    },
  },
};

/* ------------------------------------------------------------------ 3. renewal note */

export const RENEWAL: AnswerDoc = {
  tag: NORTHWIND,
  headline: "Renewal note to Dana, with the quarterly schedule",
  context: { text: "Draft in Outlook, not sent", status: { text: "Ready for your review", tone: "progress" } },
  layout: "split",
  sections: [
    {
      type: "timeline",
      title: "What renews",
      axis: [
        { label: "Jan 2027", at: 0 },
        { label: "Jan 2028", at: 12 },
        { label: "Jan 2029", at: 24 },
        { label: "Jan 2030", at: 36 },
      ],
      span: 36,
      headers: { track: "Subscription", value: "Annual" },
      lanes: [
        { name: "Platform, enterprise", period: "Jan 2027 to Dec 2029", start: 0, end: 36, value: "$214,183.20" },
        { name: "Analytics, 1,200 seats", period: "Starts Apr 2027", start: 3, end: 36, value: "$318,600.00", tone: "positive" },
        { name: "Premium support", period: "Year one only", start: 0, end: 12, value: "$83,216.80", tone: "muted" },
      ],
    },
    {
      type: "draft",
      app: "Outlook",
      heading: "Northwind renewal: schedule and next steps",
      status: { text: "Draft, not sent" },
      toolbar: ["B", "I", "Insert source", "Conversation"],
      effects: { "Insert source": { message: "Inserted a link to quote R5." } },
      fields: [
        { label: "To", value: "Dana Whitfield" },
        { label: "Cc", value: "Priya Raman" },
        { label: "Subject", value: "Northwind renewal: schedule and next steps" },
      ],
      body: [
        "Hi Dana,",
        "Following your note on the first-invoice limit, we've moved the renewal to quarterly invoicing. The first invoice is $154,000.00 on January 1, well within the $250,000 limit, and the year-one total is unchanged at $616,000.00.",
        "Analytics seats start in April as you asked. I'll send the order form once Finance confirms the schedule, usually within a day.",
        "Best,\nPriya",
      ],
      mail: [
        { from: "Dana Whitfield", subject: "Re: Northwind renewal", when: "Oct 29", body: "Procurement can't approve a first invoice above $250,000 this fiscal year. Can the analytics seats start in April?" },
        { from: "Priya Raman", subject: "Northwind renewal", when: "Oct 27", body: "Attached is quote R4 for your review." },
      ],
      actions: [{ send: "Outlook", primary: true, effect: { message: "Sent to Dana Whitfield via Outlook." } }],
      actionsNote: "From Priya Raman's mailbox",
    },
  ],
  aside: [
    {
      type: "list",
      title: "Who's involved",
      rows: [
        { title: "Dana Whitfield", avatar: "DW", meta: "Buyer, procurement", detail: "Asked for the April start" },
        { title: "Priya Raman", avatar: "PR", meta: "Account owner" },
        { title: "Rui Tanaka", avatar: "RT", meta: "VP Finance", status: { text: "Reviewing the schedule", tone: "progress" } },
      ],
    },
    {
      type: "links",
      title: "Related",
      links: [
        { label: "Quote R5 in Salesforce CPQ", href: "/examples/quote" },
        { label: "Northwind deal record", href: "/examples/record" },
      ],
    },
  ],
  sources: { items: [SOURCES.email, SOURCES.quote, SOURCES.opp] },
};

/* ------------------------------------------------------------------ 4. price breakdown */

export const PRICE: AnswerDoc = {
  tag: NORTHWIND,
  headline: "How the platform price gets from list to net",
  context: { text: "Platform line, quote R4" },
  layout: "bento",
  sections: [
    {
      type: "waterfall",
      cols: 4,
      title: "List to net",
      max: 300000,
      steps: [
        { label: "List price", value: 281820, display: "$281,820.00", total: true },
        { label: "Volume discount", value: -28182, display: "−$28,182.00" },
        { label: "Multi-year discount", value: -22545.6, display: "−$22,545.60" },
        { label: "Exception requested", value: -16909.2, display: "−$16,909.20" },
        { label: "Net price", value: 214183.2, display: "$214,183.20", total: true },
      ],
    },
    {
      type: "properties",
      cols: 2,
      title: "In short",
      display: "list",
      rows: [
        { label: "Total discount", value: "24%" },
        { label: "Policy allows", value: "20%" },
        { label: "Margin after discount", value: "71%", status: { text: "Above the 65% floor", tone: "positive" } },
      ],
    },
    {
      type: "bars",
      cols: 6,
      title: "Against comparable renewals",
      intro: "Platform discount on 36-month EMEA renewals closed since January 2025.",
      max: 30,
      reference: { value: 20, label: "desk limit, 20%" },
      bars: [
        { label: "Median", value: 14, display: "14%" },
        { label: "90th percentile", value: 21, display: "21%" },
        { label: "Northwind, requested", value: 24, display: "24%", readout: { label: "Northwind", value: "24%", meta: "Higher than 36 of 38 comparable deals" } },
      ],
    },
    {
      type: "flow",
      cols: 6,
      title: "Where the price goes after approval",
      nodes: [
        { label: "Quote", detail: "Approved revision locked", system: "Salesforce CPQ" },
        { label: "Order", detail: "Created from the quote", system: "Salesforce" },
        { label: "Invoices", detail: "Quarterly schedule", system: "Excel", status: { text: "Checked against the quote", tone: "positive" } },
        { label: "Confirmation", detail: "Sent to Dana", system: "Outlook" },
      ],
    },
  ],
  sources: { items: [SOURCES.quote, SOURCES.policy, SOURCES.history] },
};

/* ------------------------------------------------------------------ the conversation */

export const REASONING_1: ReasoningStep[] = [
  { label: "Read quote R4", state: "complete", results: [{ label: "Quote R4", system: "Salesforce CPQ" }] },
  { label: "Checked the FY27 discount policy", detail: "EMEA, 36-month renewals", state: "complete", results: [{ label: "EMEA discount policy FY27", system: "SharePoint" }] },
  { label: "Found who approves above 20%", state: "complete", results: [{ label: "Approval matrix", system: "Salesforce" }] },
];

export const TOOLS_1: ToolCall[] = [
  { id: "t1", name: "Read quote R4", system: "Salesforce CPQ", state: "done", duration: "1s", output: "9 lines, net $1,001,710.00" },
  { id: "t2", name: "Check FY27 discount policy", system: "SharePoint", state: "done", duration: "2s", output: "Desk limit 20% on 36-month renewals" },
  { id: "t3", name: "Find approvers", system: "Salesforce", state: "done", duration: "1s", output: "Rui Tanaka, VP Finance" },
];

export const REASONING_2: ReasoningStep[] = [
  { label: "Read the buyer's rollout email", state: "complete", results: [{ label: "Rollout email from Dana Whitfield", system: "Outlook" }] },
  { label: "Priced three schedules on the same lines", state: "complete", results: [{ label: "Quote R4", system: "Salesforce CPQ" }] },
];

export const SUGGESTIONS_1 = ["What if we spread the invoices out instead?", "Show the price from list to net", "Who else has approved above 20%?"];
export const SUGGESTIONS_2 = ["Draft the renewal note to Dana", "Compare against last year's terms"];
