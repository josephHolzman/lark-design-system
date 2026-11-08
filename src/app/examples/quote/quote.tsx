"use client";

import { SendIcon, SparklesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  ActionReceipt,
  ActionReview,
  AnswerSources,
  AssistantTurn,
  type ChatSource,
  Cite,
  ComposerNotice,
  WorkLog,
} from "@/components/lark/chat";
import {
  ApprovalRoute,
  BlockedReason,
  CpqStages,
  DealFigures,
  InvoiceSchedule,
  OrderMatch,
  PolicyChecks,
  PriceWaterfall,
  type QuoteLine,
  QuoteLines,
  ScenarioCompare,
  SourceLine,
} from "@/components/lark/cpq";
import { Callout } from "@/components/lark/feedback";
import { AceMark, CompanyLogo } from "@/components/lark/identity";
import { RecordLayout } from "@/components/lark/layouts";
import { ActionMenu } from "@/components/lark/menus";
import { PageHeader } from "@/components/lark/page-header";
import { StatusBadge } from "@/components/lark/status-badge";
import { SectionCard } from "@/components/lark/cards";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LINES: QuoteLine[] = [
  { id: "l1", family: "Platform", product: "Platform, enterprise", sku: "PLT-ENT-36", quantity: 1, listPrice: 281_820, discount: 24, start: "Jan 1, 2027", proposed: { discount: 20, by: "ACE", reason: "brings the line under the FY27 limit" } },
  { id: "l2", family: "Platform", product: "Mobile SDK", sku: "MOB-SDK", quantity: 1, listPrice: 48_000, discount: 10, start: "Apr 1, 2027", status: "validating", note: "start date vs the buyer's rollout email" },
  { id: "l3", family: "Platform", product: "Account Protection", sku: "ACC-PROT", quantity: 180_000, unit: "MAU", listPrice: 0.12, discount: 5, start: "Apr 1, 2027" },
  { id: "l4", family: "Services", product: "Premium support", sku: "SUP-PRM", quantity: 1, listPrice: 56_000, discount: 0, status: "locked", note: "Rate protected until Dec 2027" },
  { id: "l5", family: "Services", product: "Launch support", sku: "SVC-LAUNCH", quantity: 1, listPrice: 12_000, discount: 100, charge: "one-time", status: "above-limit", note: "Comped services still need Finance review" },
];

const SOURCES: ChatSource[] = [
  { id: "q", label: "Quote R4", system: "Salesforce CPQ", usedFor: "Lines, prices and discounts", meta: "Synced 2 min ago", excerpt: "PLT-ENT-36, list $281,820, discount 24%." },
  { id: "p", label: "FY27 discount policy v3", system: "SharePoint", usedFor: "20% limit for 36-month renewals", meta: "Effective Oct 1", excerpt: "Platform discounts above 20% on renewals of 36 months require VP Finance." },
  { id: "e", label: "Rollout email from Jordan Lee", system: "Outlook", usedFor: "Mobile start date", meta: "Oct 29", excerpt: "Mobile goes live in April, after web launches in January." },
  { id: "s", label: "#deal-desk thread", system: "Slack", usedFor: "Rui's prior decision on Halvorsen", meta: "Oct 12" },
];

export function QuoteWorkbench() {
  const [chosen, setChosen] = useState<string>();
  const [submit, setSubmit] = useState<"pending" | "approved" | "declined">("pending");
  // The live-recalculation edit model: one model for this screen, no draft values kept beside it.
  const [editorLines, setEditorLines] = useState<QuoteLine[]>(() => LINES.map((l) => ({ ...l })));
  const [recalculating, setRecalculating] = useState(false);
  const recalcTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(recalcTimer.current), []);
  const onLineChange = (id: string, patch: Partial<Pick<QuoteLine, "quantity" | "discount">>) => {
    setEditorLines((lines) => lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setRecalculating(true);
    clearTimeout(recalcTimer.current);
    recalcTimer.current = setTimeout(() => setRecalculating(false), 600);
  };

  return (
    <RecordLayout
      asideOnSmall="after"
      aside={
        <>
          <SectionCard
            as="h2"
            description="ACE reads the quote, policy and mail you can see. Every claim links to its source."
            title={
              <span className="inline-flex items-center gap-2">
                <AceMark motion="settle" size="xs" /> ACE on this quote
              </span>
            }
          >
            <div className="lark-render-in flex flex-col gap-4">
              <WorkLog
                calls={[
                  { id: "1", name: "Read quote R4", system: "Salesforce CPQ", state: "done", duration: "1s" },
                  { id: "2", name: "Apply FY27 discount policy", system: "SharePoint", state: "done", duration: "2s" },
                  { id: "3", name: "Find the buyer's rollout plan", system: "Outlook", state: "done", duration: "3s" },
                  { id: "4", name: "Check the mobile start date", system: "ACE", state: "running" },
                ]}
              />
              <AssistantTurn
                lead={
                  <>
                <p>
                  The platform line is discounted 24%
                  <Cite n={1} source={SOURCES[0]} />, above the 20% limit for 36-month renewals
                  <Cite n={2} source={SOURCES[1]} />. Moving 4 points into a year-one ramp keeps Northwind&apos;s first-year cost at $333,903, adds $22,545 over the term, and removes the VP approval.
                </p>
                <p>
                  Mobile should start Apr 1, not Jan 1
                  <Cite n={3} source={SOURCES[2]} />. I&apos;m checking whether that changes the invoice schedule.
                </p>
                  </>
                }
              />
              <AnswerSources sources={SOURCES} />
            </div>
          </SectionCard>
          <ComposerNotice
            action={
              <Button onClick={() => toast("Opening ACE")} size="xs" variant="ai">
                <SparklesIcon /> Ask ACE
              </Button>
            }
            live={false}
            tone="ai"
          >
            Ask about this quote, or have ACE prepare the next revision.
          </ComposerNotice>
        </>
      }
      header={
        <div className="flex flex-col gap-4 pb-4">
          <PageHeader
            actions={
              <>
                <Button variant="ai">
                  <SparklesIcon /> Prepare R5 with ACE
                </Button>
                <Button onClick={() => toast("Submitted for approval")}>
                  <SendIcon /> Submit for approval
                </Button>
                <ActionMenu
                  label="More quote actions"
                  sections={[
                    { items: [{ label: "Open in Salesforce CPQ" }, { label: "Compare with R3" }, { label: "Download PDF" }] },
                    { items: [{ label: "Withdraw quote", destructive: true }] },
                  ]}
                />
              </>
            }
            leading={<CompanyLogo name="Northwind Traders" size="lg" />}
            meta={
              <>
                <span>Renewal, 36 months</span>
                <span>Priya Raman</span>
                <span className="font-mono text-meta">OPP-20431</span>
              </>
            }
            status={<StatusBadge size="md" status="Discount exception" />}
            title="Northwind Traders renewal, quote R4"
          />
          <SourceLine meta="synced 2 min ago" record="Quote R4, version 4 of 4" service="Salesforce CPQ" />
          <CpqStages current="price" details={{ configure: "5 products, Oct 30", price: "1 line above limit", approve: "2 approvers", order: "PO received" }} />
        </div>
      }
    >
      <Tabs defaultValue="quote">
        <TabsList aria-label="Quote sections" variant="segmented">
          <TabsTrigger value="quote">Price and quote</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="order">Order</TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------ quote */}
        <TabsContent className="lark-render-in mt-4 flex flex-col gap-4" value="quote">
          <SectionCard title="The deal in numbers">
            <DealFigures
              items={[
                { label: "Total contract value", value: 1_001_710, format: "money", delta: { text: "+$22,545 with ACE's change", good: true }, source: { service: "Salesforce CPQ", record: "R4" } },
                { label: "Annual recurring", value: 333_903, format: "money", source: { service: "Salesforce CPQ", record: "R4" } },
                { label: "Effective discount", value: 20.4, format: "percent", status: { text: "Platform line above the 20% limit", tone: "caution" }, source: { service: "SharePoint", record: "FY27 policy v3" } },
                { label: "Gross margin", value: 71.2, format: "percent", status: { text: "Above the 65% floor", tone: "positive" }, source: { service: "Excel", record: "Margin model" } },
              ]}
            />
          </SectionCard>

          <Callout
            actions={
              <>
                <Button onClick={() => toast("Applied: R5 drafted")} size="sm">
                  Apply ACE&apos;s change
                </Button>
                <Button size="sm" variant="ghost">
                  Keep 24% and ask VP Finance
                </Button>
              </>
            }
            tone="ai"
            title="ACE proposes one change"
          >
            Platform discount 24% → 20%, with a year-one ramp credit of $11,273. Northwind&apos;s year-one cost stays at $333,903, total contract value rises $22,545, and no VP approval is needed.
          </Callout>

          <SectionCard description="Proposed changes show old → new until someone applies them. The tick on each bar is the policy limit." flush title="Quote lines">
            <QuoteLines caption="Quote R4 lines" discountLimit={20} lines={LINES} />
          </SectionCard>

          <SectionCard description="Quantity and discount are the only editable cells; list price and net are calculated and read-only. A change recalculates the summary, and exceptions are counted above the lines with a link to each." title="Quote lines, editable">
            <QuoteLines caption="Quote R4 lines, editing" discountLimit={20} editable lines={editorLines} onChange={onLineChange} recalculating={recalculating} />
          </SectionCard>

          <SectionCard description="Submitted at 9:12 AM to Rui Tanaka. Editing stops, the reason and who it waits on are said above the lines, and Recall is offered to the submitter." title="Quote lines, locked for approval">
            <QuoteLines
              caption="Quote R4 lines, locked"
              discountLimit={20}
              editable
              lines={LINES}
              locked={{ onRecall: () => toast("Recalled to draft"), reason: "Quote R4 was submitted for approval.", waitingOn: "Rui Tanaka (VP Finance), 6 hr" }}
            />
          </SectionCard>

          <SectionCard description="From list price to what Northwind pays in year one." title="Price waterfall">
            <PriceWaterfall
              endLabel="Year-one net"
              start={{ label: "List price", value: 419_420 }}
              steps={[
                { label: "Platform discount", value: -56_364, detail: "20% after ACE's change", source: "Salesforce CPQ" },
                { label: "Mobile and protection discounts", value: -5_880, source: "Salesforce CPQ" },
                { label: "Year-one ramp credit", value: -11_273, detail: "Proposed by ACE" },
                { label: "Launch support comped", value: -12_000, detail: "Needs Finance review" },
              ]}
            />
          </SectionCard>

          <SectionCard description="Three ways to land under the limit, read across." title="Options">
            <ScenarioCompare
              chosen={chosen}
              onChoose={setChosen}
              scenarios={[
                {
                  id: "ramp",
                  title: "Year-one ramp",
                  recommended: true,
                  summary: "Move 4 points of discount into a first-year credit.",
                  metrics: [
                    { label: "Net value", value: "$1,024,255", delta: "+$22,545", better: true },
                    { label: "Year-one cash", value: "$333,903", delta: "no change" },
                    { label: "Platform discount", value: "20%", delta: "−4 pts", better: true },
                  ],
                  approvals: "Deal desk only",
                  policy: { ok: true, text: "Within FY27 policy" },
                },
                {
                  id: "term",
                  title: "24 months, renewal cap",
                  summary: "Shorter term with a 19% cap on the renewal.",
                  metrics: [
                    { label: "Net value", value: "$695,988", delta: "−$305,722", better: false },
                    { label: "Year-one cash", value: "$347,994", delta: "+$14,091", better: true },
                    { label: "Platform discount", value: "19%", delta: "−5 pts", better: true },
                  ],
                  approvals: "Legal",
                  policy: { ok: true, text: "Within policy; the cap needs Legal" },
                },
                {
                  id: "keep",
                  title: "Keep 24%",
                  summary: "No change; ask for an exception.",
                  metrics: [
                    { label: "Net value", value: "$1,001,710", delta: "no change" },
                    { label: "Year-one cash", value: "$333,903", delta: "no change" },
                    { label: "Platform discount", value: "24%", delta: "no change" },
                  ],
                  approvals: "VP Finance",
                  policy: { ok: false, text: "4 points above the limit; adds 1–2 days" },
                },
              ]}
            />
          </SectionCard>
        </TabsContent>

        {/* ------------------------------------------------ approvals */}
        <TabsContent className="lark-render-in mt-4 flex flex-col gap-4" value="approvals">
          <SectionCard title="Policy checks">
            <PolicyChecks
              checks={[
                { id: "1", rule: "Platform discount on 36-month renewals at most 20%", status: "needs-approval", detail: "24% on PLT-ENT-36", approver: "VP Finance", source: { service: "SharePoint", record: "FY27 policy v3, §2.1" } },
                { id: "2", rule: "Comped services reviewed by Finance", status: "needs-approval", detail: "Launch support at 100% discount", approver: "Finance", source: { service: "SharePoint", record: "FY27 policy v3, §4" } },
                { id: "3", rule: "Payment terms at most Net 45", status: "pass", detail: "Net 45, annual in advance", source: { service: "Salesforce", record: "MSA 2023" } },
                { id: "4", rule: "Gross margin at least 65%", status: "pass", detail: "71.2%", source: { service: "Excel", record: "Margin model" } },
                { id: "5", rule: "Credit review covers the contract value", status: "unknown", detail: "The credit review is from Jun 2 and predates the expansion.", source: { service: "SharePoint", record: "Credit review" } },
              ]}
            />
          </SectionCard>
          <SectionCard description="Who decides, why, in what order, and where." title="Approval route">
            <ApprovalRoute
              steps={[
                { id: "s1", label: "Deal desk", approvers: [{ name: "Avery Chen", role: "Deal desk", state: "approved", channel: "ACE", when: "Oct 31", note: "Term and ramp are standard." }] },
                {
                  id: "s2",
                  label: "Finance",
                  mode: "parallel",
                  approvers: [
                    { name: "Rui Tanaka", role: "VP Finance", state: "pending", channel: "Slack", when: "waiting 6 h", reason: "Platform discount above 20%" },
                    { name: "Mei Lin", role: "Finance", state: "conditional", channel: "Outlook", when: "Nov 4", reason: "Comped launch support", note: "Approved if launch support ends by Mar 31." },
                  ],
                },
                { id: "s3", label: "Legal", approvers: [{ name: "Sam Whitfield", role: "Legal", state: "away", channel: "Teams", reason: "Renewal cap language", note: "Back Nov 10. Dana Okafor is covering." }] },
              ]}
            />
          </SectionCard>
          <ActionReview
            approveLabel="Submit R4 for approval"
            onApprove={() => setSubmit("approved")}
            onDecline={() => setSubmit("declined")}
            state={submit}
            system="Salesforce CPQ"
            title="Submit quote R4 for approval"
          >
            Sends Rui Tanaka a request in Slack with ACE&apos;s note and the policy evidence. Mei Lin&apos;s conditional approval carries forward.
          </ActionReview>
          <BlockedReason action={<Button size="sm" variant="secondary">Route to Rui Tanaka</Button>} title="You can't approve the discount yourself">
            You prepared this quote, so the exception goes to VP Finance.
          </BlockedReason>
        </TabsContent>

        {/* ------------------------------------------------ billing */}
        <TabsContent className="lark-render-in mt-4 flex flex-col gap-4" value="billing">
          <SectionCard description="Revision R5 with ACE's change: annual in advance, Net 45." title="Invoice schedule">
            <InvoiceSchedule
              contractTotal={1_024_255}
              rows={[
                { id: "i1", period: "Jan 1 – Dec 31, 2027", due: "Feb 15, 2027", amount: 333_903, kind: "ramp", note: "Includes the $11,273 ramp credit, so year one doesn't change" },
                { id: "i2", period: "Launch support", due: "Feb 15, 2027", amount: 0, kind: "one-time", note: "Comped" },
                { id: "i3", period: "Jan 1 – Dec 31, 2028", due: "Feb 14, 2028", amount: 345_176, changed: { from: 333_903 } },
                { id: "i4", period: "Jan 1 – Dec 31, 2029", due: "Feb 14, 2029", amount: 345_176, changed: { from: 333_903 } },
              ]}
            />
          </SectionCard>
        </TabsContent>

        {/* ------------------------------------------------ order */}
        <TabsContent className="lark-render-in mt-4 flex flex-col gap-4" value="order">
          <SectionCard title="Accepted quote and purchase order">
            <OrderMatch
              accepted={{ service: "Salesforce CPQ", record: "Quote R5" }}
              actions={
                <>
                  <Button size="sm">Send correction request</Button>
                  <Button size="sm" variant="secondary">
                    Accept the PO&apos;s dates
                  </Button>
                </>
              }
              received={{ service: "Outlook", record: "PO-88412.pdf" }}
              rows={[
                { id: "1", field: "Total", accepted: "$1,024,255", received: "$1,024,255", status: "match" },
                { id: "2", field: "Platform start", accepted: "Jan 1, 2027", received: "Jan 1, 2027", status: "match" },
                { id: "3", field: "Mobile start", accepted: "Apr 1, 2027", received: "Jan 1, 2027", status: "differs", resolution: "The buyer's email says April. Ask procurement to correct the PO." },
                { id: "4", field: "First invoice", accepted: "Feb 15, 2027", received: "Jan 15, 2027", status: "differs", resolution: "Net 45 makes Feb 15 correct." },
                { id: "5", field: "Billing contact", accepted: "ap@northwind.example", received: "", status: "missing", resolution: "Add it to the order; the MSA names the same contact." },
              ]}
            />
          </SectionCard>
          <ActionReceipt state="queued" system="Salesforce" title="Create the order">
            Waits until the PO differences are resolved. ACE won&apos;t create the order with mismatched dates.
          </ActionReceipt>
        </TabsContent>
      </Tabs>
    </RecordLayout>
  );
}
