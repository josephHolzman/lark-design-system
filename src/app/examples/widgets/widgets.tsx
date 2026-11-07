"use client";

import type { ReactNode } from "react";

import { ActionTray, type AnswerSection, AnswerSectionView, AnswerSkeleton, AnswerSurface } from "@/components/lark/answer";
import { PageHeader } from "@/components/lark/page-header";

import { APPROVAL, PRICE, RENEWAL, SCHEDULES } from "../_shared/answers";

const pick = <T extends AnswerSection["type"]>(doc: { sections?: AnswerSection[]; aside?: AnswerSection[]; tabs?: { sections: AnswerSection[]; aside?: AnswerSection[] }[] }, type: T) =>
  [...(doc.sections ?? []), ...(doc.aside ?? []), ...(doc.tabs ?? []).flatMap((t) => [...t.sections, ...(t.aside ?? [])])].find((s) => s.type === type) as Extract<AnswerSection, { type: T }>;

type Entry = { type: string; when: string; section?: AnswerSection; node?: ReactNode };

const FAMILIES: { id: string; title: string; use: string; entries: Entry[] }[] = [
  {
    id: "figures",
    title: "Figures and facts",
    use: "Numbers people decide on. Set large when there are few, as label and value rows when there are many.",
    entries: [
      { type: "stats", when: "Key figures: one to six numbers, each with its label, an optional note and a verdict.", section: { type: "stats", title: "Key figures", items: APPROVAL.stats! } },
      { type: "properties", when: "Label and value rows. Values can be editable; a status says what a value means.", section: pick(SCHEDULES, "properties") },
      { type: "compare", when: "Two values side by side: a change (→), a comparison (vs), or a conflict (≠) that needs a decision.", section: pick(APPROVAL, "compare") },
      {
        type: "compare (≠)",
        when: "A conflict: values ringed in amber, the ≠ in an amber disc and \"Needs a decision\".",
        section: {
          type: "compare",
          title: "Mobile start date",
          relation: "≠",
          items: [
            { label: "Quote R4, mobile line", value: "Jan 1, 2027", system: "Salesforce CPQ", source: "Quote R4" },
            { label: "Buyer's rollout email", value: "Apr 1, 2027", system: "Outlook", source: "Dana Whitfield, Oct 29" },
          ],
          footer: "The invoice schedule depends on this date.",
        },
      },
    ],
  },
  {
    id: "lists",
    title: "Lists, tables and records",
    use: "Things to read across or open. Rows open their detail in place, never below the whole list.",
    entries: [
      { type: "list", when: "People, records or items, with an avatar or service, a value, a status and one action.", section: pick(RENEWAL, "list") },
      {
        type: "table",
        when: "Rows read across. Selectable rows open their detail under the row.",
        section: {
          type: "table",
          title: "Quote lines",
          selectable: true,
          columns: [{ label: "Product" }, { label: "Qty", numeric: true }, { label: "Net", numeric: true }],
          rows: [
            { cells: ["Platform, enterprise", "1", "$214,183.20"], status: { text: "Over the desk limit", tone: "attention" }, selected: true, inspect: [{ type: "properties", rows: [{ label: "List", value: "$281,820.00" }, { label: "Discount", value: "24%" }] }] },
            { cells: ["Analytics seats", "1,200", "$318,600.00"], status: { text: "Within policy", tone: "positive" }, inspect: [{ type: "properties", rows: [{ label: "Per seat", value: "$265.50" }] }] },
            { cells: ["Premium support", "1", "$83,216.80"], status: { text: "Within policy", tone: "positive" } },
          ],
        },
      },
      {
        type: "master",
        when: "A list where each row has its own detail: one opens at a time, in place.",
        section: {
          type: "master",
          title: "Open questions",
          rows: [
            { title: "Mobile start date", meta: "Quote and email disagree", status: { text: "Needs a decision", tone: "attention" }, selected: true, inspect: [{ type: "note", text: "The quote says January; Dana's email says April." }] },
            { title: "Billing contact", meta: "Missing on the order form", inspect: [{ type: "text", paragraphs: ["Ask Dana who should receive invoices."] }] },
          ],
        },
      },
      { type: "links", when: "Where to go next: records and other answers.", section: pick(RENEWAL, "links") },
      { type: "tiles", when: "A few destinations, each with its service.", section: { type: "tiles", title: "Open in", tiles: [{ title: "Quote R4", detail: "Salesforce CPQ", system: "Salesforce CPQ", href: "/examples/quote" }, { title: "Policy", detail: "SharePoint", system: "SharePoint", href: "#" }, { title: "Rollout email", detail: "Outlook", system: "Outlook", href: "#" }] } },
    ],
  },
  {
    id: "choices",
    title: "Choices and input",
    use: "Decisions are controls, never sentences: radio cards, a question to someone, or a short form.",
    entries: [
      { type: "options", when: "Choices with detail. With variant, choosing one switches the whole answer.", section: pick(SCHEDULES, "options") },
      { type: "question", when: "A question ACE will ask someone, where, with the answers they can pick and Send via the service.", section: pick(APPROVAL, "question") },
      {
        type: "form",
        when: "A short form ACE filled where it could. Labelled fields contain their label; submit is in a tray.",
        section: {
          type: "form",
          title: "Request a payment-terms exception",
          fields: [
            { label: "Requested terms", kind: "select", options: ["Net 30, quarterly", "Net 45, quarterly", "Net 30, monthly"], value: "Net 30, quarterly" },
            { label: "Amount at risk", kind: "number", value: "616000" },
            { label: "Urgency", kind: "segmented", options: ["Normal", "This week", "Today"], value: "This week" },
            { label: "Reason", kind: "textarea", value: "Buyer's procurement can't approve a first invoice above $250,000 this fiscal year." },
            { label: "Notify the account owner", kind: "checkbox", checked: true },
          ],
          submit: { label: "Send request", effect: { message: "Request sent to Finance." } },
        },
      },
    ],
  },
  {
    id: "charts",
    title: "Charts and time",
    use: "A tooltip on every mark, a legend for two or more series, a readout for the selected point, and View data for a table.",
    entries: [
      { type: "chart", when: "Bar, stacked, grouped, line, step, area, segments, waterfall or range, with a reference line and readouts.", section: pick(SCHEDULES, "chart") },
      {
        type: "chart (line)",
        when: "A trend over time.",
        section: {
          type: "chart",
          kind: "line",
          title: "Analytics seats in use",
          xKey: "m",
          series: [{ key: "used", label: "Seats in use" }, { key: "bought", label: "Seats bought", tone: "muted" }],
          data: [
            { m: "Jun", used: 820, bought: 1000 },
            { m: "Jul", used: 905, bought: 1000 },
            { m: "Aug", used: 960, bought: 1000 },
            { m: "Sep", used: 1040, bought: 1000 },
            { m: "Oct", used: 1110, bought: 1000 },
          ],
          format: "plain",
        },
      },
      { type: "bars", when: "Horizontal bars on one scale with a reference mark; bars with a readout can be inspected.", section: pick(PRICE, "bars") },
      { type: "waterfall", when: "From list to net: each step floats from where the last ended.", section: pick(PRICE, "waterfall") },
      { type: "timeline", when: "Lanes on a shared time axis: terms, ramps, subscriptions. Each lane states its period in words.", section: pick(RENEWAL, "timeline") },
    ],
  },
  {
    id: "process",
    title: "Process",
    use: "What happens in order and where it stands.",
    entries: [
      { type: "steps", when: "Steps with their state in words; a step can open its detail.", section: pick(APPROVAL, "steps") },
      { type: "flow", when: "How something moves between systems or people.", section: pick(PRICE, "flow") },
    ],
  },
  {
    id: "messages",
    title: "Messages and words",
    use: "What someone said or will receive. Drafts are editable and send through the service.",
    entries: [
      { type: "draft", when: "A message ACE drafted in Outlook or Slack: fields, editable body, the thread, Send via.", section: pick(RENEWAL, "draft") },
      {
        type: "message",
        when: "A message from one person to another through a service.",
        section: { type: "message", channel: "Slack", from: { name: "Rui Tanaka" }, to: { name: "Priya Raman" }, text: "Approved at 22%. Can you send me the revised quote?", when: "10:12 AM", status: { text: "Answered", tone: "positive" } },
      },
      { type: "quote", when: "Someone's words, attributed, with the service they came from.", section: pick(SCHEDULES, "quote") },
      { type: "text", when: "A paragraph or two of prose. Neutral, no card.", section: { type: "text", paragraphs: ["Spreading the invoices doesn't change the discount, but it clears the buyer's first-invoice limit."] } },
    ],
  },
  {
    id: "structure",
    title: "Notes and structure",
    use: "Warnings are ringed across the full row; detail opens in place; groups place like beside like.",
    entries: [
      { type: "note", when: "Neutral notes are quiet; attention and critical are ringed with an icon.", node: <><AnswerSectionView section={{ type: "note", text: "Finance reviews any schedule that isn't annual in advance." }} /><AnswerSectionView section={{ type: "note", tone: "attention", text: "Annual in advance puts the first invoice above the buyer's limit." }} /><AnswerSectionView section={{ type: "note", tone: "critical", text: "Monthly billing on this term needs a CFO exception. Don't send it without one." }} /></> },
      { type: "disclosure", when: "Detail behind a summary, opened in place.", section: { type: "disclosure", summary: "Lines within policy", count: 2, sections: [{ type: "list", rows: [{ title: "Analytics seats", value: "$318,600.00" }, { title: "Premium support", value: "$83,216.80" }] }] } },
      { type: "group", when: "Two or three sections side by side when there's room.", section: { type: "group", title: "Before you send", columns: 2, sections: [{ type: "properties", rows: [{ label: "Owner", value: "Priya Raman" }, { label: "Close date", value: "Nov 14, 2026" }] }, { type: "list", rows: [{ title: "Rui Tanaka", avatar: "RT", meta: "VP Finance" }] }] } },
      { type: "media", when: "A picture with what it shows.", section: { type: "media", alt: "Page 4 of the master agreement, section 7.2 on payment terms", heading: "Master agreement, section 7.2", text: "Payment terms can change by written amendment.", caption: "SharePoint, signed 2023", system: "SharePoint", action: "Open the agreement" } },
    ],
  },
  {
    id: "edge",
    title: "Edge cases",
    use: "What widgets do when data is missing, long or still loading. Nothing is silently dropped, nothing overflows, nothing jumps.",
    entries: [
      { type: "loading", when: "While ACE builds an answer: the answer's shape in placeholders, announced once as busy.", node: <AnswerSkeleton /> },
      { type: "empty", when: "A section whose data came back empty keeps its title and says so.", section: { type: "table", title: "Open purchase orders", columns: [{ label: "PO" }, { label: "Amount", numeric: true }], rows: [] } },
      {
        type: "long content",
        when: "Long names wrap; long IDs and links break instead of overflowing; rows stay aligned to their first line.",
        section: {
          type: "list",
          title: "Records with long names",
          rows: [
            { title: "Northwind Traders International Holdings, EMEA procurement and shared services", system: "Salesforce", meta: "OPP-20431-EMEA-RENEWAL-2027-AMENDMENT-0004-REVISED-FINAL", value: "$1,001,710.00", status: { text: "Waiting for the buyer's procurement team to confirm the billing contact", tone: "attention" } },
            { title: "https://contracts.example.com/northwind/master-services-agreement/2023/amendment-7/section-7.2", system: "SharePoint" },
          ],
        },
      },
      {
        type: "many figures",
        when: "Five or more key figures become a card each, in as many columns as fit.",
        section: {
          type: "stats",
          display: "cards",
          items: [
            { label: "Net value", value: "$1,001,710.00" },
            { label: "Discount", value: "24%", status: { text: "Over the limit", tone: "attention" } },
            { label: "Term", value: "36 months" },
            { label: "First invoice", value: "$154,000.00" },
            { label: "Margin", value: "71%" },
            { label: "Approvals", value: "1 of 3" },
          ],
        },
      },
    ],
  },
  {
    id: "act",
    title: "Acting",
    use: "What the person can do sits at the end: the state and a prompt on the left, the buttons on the right, one brand button at most.",
    entries: [
      { type: "actions", when: "The answer's next step (in a white card at its end) or a section's actions (the card's footer). Only when there is something to do. Send via a service shows Sending, then Sent.", node: <div className="rounded-lg border border-outline-faint bg-card p-3"><ActionTray actions={[{ label: "Prepare a 20% option" }, { send: "Slack", primary: true, effect: { message: "Sent to Rui Tanaka in Slack." } }]} prompt="Send the question to Rui, or prepare a 20% option the desk can approve today." status={{ text: "Needs VP Finance", tone: "attention" }} /></div> },
    ],
  },
];

export function WidgetGallery() {
  const count = FAMILIES.reduce((n, f) => n + f.entries.length, 0);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-canvas">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-10 px-4 py-6 md:px-6">
        <PageHeader description={`Every kind of widget in ACE's answers (${count} examples). One component per kind of information, so the same thing always looks the same. They lay out by their own width: resize the window to see them in a side panel.`} title="Answer widgets" />
        {FAMILIES.map((f) => (
          <section aria-labelledby={f.id} className="flex flex-col gap-4" id={`f-${f.id}`} key={f.id}>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-title-sm" id={f.id}>
                {f.title}
              </h2>
              <p className="max-w-[80ch] text-sm text-on-surface-variant">{f.use}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {f.entries.map((e) => (
                <div className="flex min-w-0 flex-col gap-2" key={e.type}>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-mono text-label-md text-on-surface">{e.type}</h3>
                    <p className="text-body-sm text-on-surface-variant">{e.when}</p>
                  </div>
                  <AnswerSurface className="flex-1 [&>*:only-child]:flex-1">{e.node ?? (e.section ? <AnswerSectionView section={e.section} /> : null)}</AnswerSurface>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
