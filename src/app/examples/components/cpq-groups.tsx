"use client";

import {
  ApprovalMatrix,
  ApprovalRoute,
  BlockedReason,
  CountUp,
  CpqStages,
  DealFigures,
  DiscountMeter,
  InvoiceSchedule,
  OrderMatch,
  PolicyChecks,
  PriceWaterfall,
  QuoteLines,
  ScenarioCompare,
  SourceLine,
  formatMoney,
} from "@/components/lark/cpq";

import type { Group } from "./catalog";
import { Button } from "@/components/ui/button";

const noop = () => {};
const money = (n: number) => formatMoney(n);

const LINES = [
  { charge: "recurring" as const, discount: 24, family: "Platform", id: "1", listPrice: 281820, note: "24% is above the 20% desk limit.", product: "Platform, enterprise, all regions", quantity: 1, status: "above-limit" as const },
  { charge: "recurring" as const, discount: 0, family: "Analytics", id: "2", listPrice: 265.5, product: "Analytics seats", quantity: 1200 },
  { charge: "one-time" as const, discount: 10, family: "Services", id: "3", listPrice: 92463.2, product: "Premium support and onboarding", quantity: 1 },
];

export const CPQ_GROUPS: Group[] = [
  {
    file: "cpq.tsx",
    title: "Configure, price, quote",
    note: "Every number says where it came from, and every route says who decides and why.",
    samples: [
      { name: "formatMoney", note: "utility", node: <div className="flex flex-col gap-1 text-body-md"><span>{money(12480000)}</span><span>{money(-2400)}</span></div> },
      { name: "SourceLine", node: <SourceLine meta="synced 2 min ago · version 4 of 4" record="Quote R4" service="Salesforce CPQ" /> },
      { name: "CountUp", node: <span className="text-title-lg tabular-nums"><CountUp format={money} value={12480000} /></span> },
      {
        name: "DealFigures",
        node: (
          <DealFigures
            items={[
              { delta: { good: false, text: "+$12,400 vs R3" }, format: "money", label: "Total contract value", source: { meta: "Revision 4", record: "Quote R4", service: "Salesforce CPQ" }, status: { text: "Above the 20% limit", tone: "caution" }, value: 12480000 },
              { format: "percent", label: "Effective discount", status: { text: "Needs Finance", tone: "caution" }, value: 22.5 },
              { format: "percent", label: "Margin", status: { text: "Within policy", tone: "positive" }, value: 38.4 },
              { format: "number", label: "Seats", value: 1200 },
            ]}
          />
        ),
      },
      { name: "CpqStages", node: <CpqStages current="approve" details={{ approve: "Finance and Legal", configure: "Understand the request", order: "After approval", price: "Revision 4" }} /> },
      { name: "DiscountMeter", node: <div className="flex flex-wrap gap-4"><DiscountMeter limit={20} value={22.5} /><DiscountMeter limit={20} value={12} /></div> },
      {
        name: "QuoteLines",
        node: (
          <div className="flex flex-col gap-6">
            <QuoteLines caption="Quote lines" discountLimit={20} lines={LINES} />
            <QuoteLines caption="Quote lines, editing" discountLimit={20} editable lines={LINES} onChange={noop} />
            <QuoteLines
              caption="Quote lines, locked"
              discountLimit={20}
              editable
              lines={LINES}
              locked={{ onRecall: noop, reason: "Quote R4 was submitted for approval.", waitingOn: "Rui Tanaka (VP Finance), 6 hr" }}
            />
          </div>
        ),
      },
      { name: "PriceWaterfall", node: <PriceWaterfall start={{ label: "List price", value: 512000 }} steps={[{ detail: "Regional renewal discount", kind: "discount", label: "Discount", source: "Deal desk", value: -99200 }]} /> },
      {
        name: "PolicyChecks",
        node: (
          <PolicyChecks
            checks={[
              { approver: "Deal desk", id: "p1", rule: "Discount within the regional floor", source: { record: "Pricing policy, section 4.2", service: "SharePoint" }, status: "pass" },
              { approver: "Finance", detail: "Discount is 7.5 points above the floor.", id: "p2", rule: "Discount above 20% needs Finance", status: "needs-approval" },
              { id: "p3", rule: "Legal review for a changed exhibit", status: "unknown", statusLabel: "Ready for review" },
              { id: "p4", rule: "Self-approval", status: "blocked" },
            ]}
          />
        ),
      },
      {
        name: "ApprovalRoute",
        node: (
          <ApprovalRoute
            steps={[
              { approvers: [{ channel: "Slack", name: "Dana Ito", reason: "Discount above 20%", role: "Regional vice president", state: "approved", when: "Approved 9:02" }], id: "a", label: "Deal desk" },
              { approvers: [{ channel: "Outlook", name: "Marcus Bell", note: "Needs margin at net 60", reason: "Discount above the floor", role: "Finance", state: "pending" }, { name: "Ana Souza", reason: "Changed exhibit", role: "Legal", state: "waiting", stateLabel: "Ready for review" }], id: "b", label: "Finance and Legal", mode: "parallel" },
              { approvers: [{ name: "Rui Tanaka", role: "CFO", state: "waiting" }], id: "c", label: "CFO" },
            ]}
          />
        ),
      },
      {
        name: "ScenarioCompare",
        node: (
          <ScenarioCompare
            current="Compared with quote R4"
            scenarios={[
              { approvals: "Finance and Legal", bestFor: ["Buyers who need one signature"], id: "a", metrics: [{ label: "Net", value: "$12,480,000.00" }, { better: false, delta: "+$312,000", label: "Year-one cash", value: "$4,120,000.00" }], policy: { ok: false, text: "Needs Finance" }, recommended: true, title: "Hold 22% for three years" },
              { approvals: "Deal desk", id: "b", metrics: [{ label: "Net", value: "$11,980,000.00" }, { better: true, delta: "−$500,000", label: "Year-one cash", value: "$3,993,333.00" }], policy: { ok: true, text: "Within policy" }, provisional: true, title: "Counter at 20%" },
            ]}
          />
        ),
      },
      { name: "InvoiceSchedule", node: <InvoiceSchedule contractTotal={12480000} rows={[{ amount: 4120000, due: "Jan 1, 2027", id: "i1", kind: "ramp", note: "Includes onboarding", period: "Year one", }, { amount: 4144000, due: "Jan 1, 2028", id: "i2", period: "Year two" }, { amount: 4216000, due: "Jan 1, 2029", id: "i3", period: "Year three" }]} /> },
      {
        name: "OrderMatch",
        node: (
          <OrderMatch
            accepted={{ record: "Quote R4", service: "Salesforce CPQ" }}
            received={{ record: "PO-88412", service: "Outlook" }}
            rows={[
              { accepted: "$12,480,000.00", field: "Net value", id: "1", received: "$12,480,000.00", status: "match" },
              { accepted: "Dana Whitfield", field: "Billing contact", id: "2", received: "Not on the PO", resolution: "Ask the buyer for the billing contact.", status: "missing" },
              { accepted: "36 months", field: "Term", id: "3", received: "24 months", resolution: "Confirm the term before ordering.", status: "differs" },
            ]}
          />
        ),
      },
      { name: "BlockedReason", node: <BlockedReason action={<Button size="sm" variant="secondary">Ask Finance</Button>} title="Nothing is sent until Finance sets a margin floor">The regional floor is 15%, but Finance has not set a floor for this region.</BlockedReason> },
      { name: "ApprovalMatrix", node: <ApprovalMatrix caption="Approver by discount band, EMEA" changed={["b2"]} levels={[{ id: "desk", label: "Deal desk" }, { id: "finance", label: "Finance" }, { id: "cfo", label: "CFO" }]} onChange={noop} rows={[{ id: "b1", label: "0–10%" }, { description: "Needs the regional floor", id: "b2", label: "10–20%" }, { id: "b3", label: "Above 20%" }]} value={{ b1: "desk", b2: "finance", b3: "cfo" }} /> },
    ],
  },
];
