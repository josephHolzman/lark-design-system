"use client";

import { CheckIcon, FileTextIcon, FlagIcon, ScaleIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PlanReview, RunSteps } from "@/components/lark/ai";
import { ActionCard, SectionCard } from "@/components/lark/cards";
import { SourceChip, SourceList } from "@/components/lark/data";
import { ChangeReview, InlineEdit } from "@/components/lark/editing";
import { Banner, SaveStatus, type SaveState, UnsavedChangesBar, useDirtyState, useLeaveGuard } from "@/components/lark/feedback";
import { CompanyLogo } from "@/components/lark/identity";
import { RecordLayout } from "@/components/lark/layouts";
import { DescriptionItem, DescriptionList, List, ListItem } from "@/components/lark/lists";
import { ActionMenu } from "@/components/lark/menus";
import { PageHeader } from "@/components/lark/page-header";
import { StageProgress, Timeline, TimelineItem } from "@/components/lark/progress";
import { StatusBadge } from "@/components/lark/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const SAVED = {
  term: "36 months",
  payment: "Net 45, annual in advance",
  close: "Nov 14, 2026",
  po: "PO-88412",
  billing: "",
};
const LABELS: Record<keyof typeof SAVED, string> = {
  term: "Term",
  payment: "Payment terms",
  close: "Close date",
  po: "PO number",
  billing: "Billing contact",
};

export function DealRecord() {
  const form = useDirtyState(SAVED);
  const [save, setSave] = useState<SaveState>("saved");
  const [activity, setActivity] = useState<string[]>(["all"]);
  useLeaveGuard(form.dirty);

  const changed = (Object.keys(SAVED) as (keyof typeof SAVED)[]).filter((k) => form.value[k] !== SAVED[k] && form.value[k] !== undefined);
  const dirtyCount = (Object.keys(SAVED) as (keyof typeof SAVED)[]).filter((k) => JSON.stringify(form.value[k]) !== JSON.stringify(SAVED[k])).length;
  const status: SaveState = form.dirty ? "dirty" : save;

  const doSave = () => {
    setSave("saving");
    window.setTimeout(() => {
      form.commit();
      setSave("saved");
      toast("Deal details saved");
    }, 900);
  };

  return (
    <>
      <RecordLayout
        aside={
          <>
            <SectionCard
              as="h2"
              collapsible
              collapsedSummary={`${Object.values(form.value).filter(Boolean).length} of 5 filled`}
              description="Click a value to edit. Enter saves the field, Escape cancels."
              title="Deal details"
            >
              <DescriptionList>
                {(Object.keys(SAVED) as (keyof typeof SAVED)[]).map((k) => (
                  <DescriptionItem key={k} term={LABELS[k]}>
                    <InlineEdit
                      dirty={changed.includes(k)}
                      label={LABELS[k]}
                      mono={k === "po"}
                      onCommit={(v) => {
                        form.setValue({ ...form.value, [k]: v });
                        setSave("idle");
                      }}
                      placeholder={k === "billing" ? "Add a billing contact" : undefined}
                      validate={(v) => (k === "po" && v && !/^PO-\d{4,}$/.test(v) ? "Use the format PO-12345." : undefined)}
                      value={form.value[k]}
                    />
                  </DescriptionItem>
                ))}
              </DescriptionList>
            </SectionCard>

            <ActionCard
              action={
                <Button size="sm" variant="ai">
                  <SparklesIcon /> Assign
                </Button>
              }
              description="Review pricing and alternatives against FY27 policy."
              icon={<SparklesIcon />}
              meta={<span>Pricing agent · about 2 min</span>}
              title="Prepare with ACE"
              tone="ai"
            />

            <SectionCard as="h2" collapsible collapsedSummary="6 records" flush title="Supporting records">
              <List density="compact">
                {[
                  ["Latest imported quote", "Sep 28"],
                  ["Commercial discovery notes", "Sep 26"],
                  ["Sample monthly service statement", "Sep 23"],
                  ["Commercial proposal", "Sep 20"],
                  ["Executed order and terms", "Aug 14"],
                  ["Line allocation, installed agreement", "Aug 2"],
                ].map(([t, d]) => (
                  <ListItem headline={t} href="#" key={t} leading={<FileTextIcon />} meta={d} />
                ))}
              </List>
            </SectionCard>
          </>
        }
        header={
          <div className="flex flex-col gap-4 pb-4">
            <PageHeader
              actions={
                <>
                  <SaveStatus onRetry={doSave} state={status} />
                  <Button variant="ai">
                    <SparklesIcon /> Ask ACE
                  </Button>
                  <Button variant="secondary">New work</Button>
                  <Button>Review approvals</Button>
                  <ActionMenu
                    label="More deal actions"
                    sections={[
                      { items: [{ label: "Copy deal link" }, { label: "Open in Salesforce" }] },
                      { items: [{ label: "Recall approval request", destructive: true }] },
                    ]}
                  />
                </>
              }
              back={{ label: "Back to deals", href: "/examples/deals" }}
              leading={<CompanyLogo name="Northwind Traders" size="lg" />}
              meta={
                <>
                  <span>Renewal</span>
                  <span>Priya Raman</span>
                  <span className="font-mono text-meta">OPP-20431 · R4</span>
                  <span>Synced from Salesforce 2 min ago</span>
                </>
              }
              status={<StatusBadge size="md" status="Discount exception" />}
              title="Northwind Traders"
            />
            <StageProgress
              aria-label="Deal progress"
              current={2}
              stages={[
                { label: "Understand request", description: "Done Oct 30" },
                { label: "Prepare changes", description: "R4 ready" },
                { label: "Approval decisions", description: "1 of 3 approvals" },
                { label: "Confirm follow-through" },
              ]}
            />
          </div>
        }
      >
        <Tabs defaultValue="overview">
          <TabsList aria-label="Deal sections" variant="segmented">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="changes">Proposed changes</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4 flex flex-col gap-4" value="overview">
            <SectionCard
              collapsible
              footer={
                <Button size="sm" variant="secondary">
                  <FlagIcon /> Record issue
                </Button>
              }
              title="Questions before approval"
            >
              <Banner layout="strip" tone="caution">
                The platform line is discounted 24%. FY27 policy caps the desk at 20% for 36-month renewals.
              </Banner>
              <p className="mt-3 text-sm text-on-surface-variant">No other issues recorded. Sources were checked for completeness, not independently verified.</p>
            </SectionCard>

            <SectionCard collapsible description="What the customer asked for, in their words and ours." title="What the customer needs">
              <DescriptionList columns={2}>
                <DescriptionItem term="Request">Renew at the current price with a three-year term.</DescriptionItem>
                <DescriptionItem term="Account context">Consolidating procurement; marketplace fee is the sticking point.</DescriptionItem>
                <DescriptionItem term="Counteroffer">Additional 4 points on the platform line.</DescriptionItem>
                <DescriptionItem term="Existing agreement">Annual commitment $393,541, Oct 1, 2026 – Oct 1, 2027</DescriptionItem>
              </DescriptionList>
            </SectionCard>

            <PlanReview
              onApprove={() => toast("ACE is running the plan", { description: "You can keep working; results land in Proposed changes." })}
              steps={[
                { id: "1", title: "Re-price the platform line with a year-one ramp", detail: "Keeps net value within $4,000 of R4" },
                { id: "2", title: "Re-run the FY27 policy check" },
                { id: "3", title: "Draft the approval note for VP Finance" },
                { id: "4", title: "Send the request to Rui Tanaka in Slack", detail: "#deal-desk", risky: true },
              ]}
            />

            <RunSteps
              steps={[
                { id: "a", title: "Read the latest quote (R4)", state: "done" },
                { id: "b", title: "Compare against FY27 discount policy", state: "done", detail: "1 line above limit" },
                { id: "c", title: "Check the MSA for payment terms", state: "running" },
                { id: "d", title: "Summarise options", state: "queued" },
              ]}
              title="Pricing review"
            />
          </TabsContent>

          <TabsContent className="mt-4 flex flex-col gap-4" value="changes">
            <ChangeReview
              changes={[
                { id: "1", field: "Platform discount", from: "24%", to: "20%", by: "ACE", reason: "Brings the line under the policy limit" },
                { id: "2", field: "Year-one ramp", from: "None", to: "−$11,273 in year 1", by: "ACE", reason: "Keeps the customer's first-year cost flat" },
                { id: "3", field: "Payment terms", from: "Net 45", to: "Net 30", by: "Priya Raman", reason: "Finance request" },
              ]}
              onApply={(ids) => toast(`Applied ${ids.length} changes`, { description: "Quote revision R5 created.", action: { label: "Undo", onClick: () => toast("Revision R5 discarded") } })}
            />
          </TabsContent>

          <TabsContent className="mt-4 flex flex-col gap-4" value="approvals">
            <SectionCard flush title="Approval path">
              <List density="comfortable" dividers>
                <ListItem headline="Deal desk review" leading={<CheckIcon />} meta="Oct 31" supporting="Avery Chen · Approved: term and ramp are standard." trailing={<StatusBadge status="Approved" />} />
                <ListItem headline="Discount exception" leading={<ScaleIcon />} supporting="Rui Tanaka, VP Finance · required above 20%" trailing={<StatusBadge status="Awaiting decision" />} />
                <ListItem headline="Legal sign-off" leading={<FileTextIcon />} supporting="Sam Whitfield · starts after Finance" trailing={<StatusBadge status="Waiting" />} />
              </List>
            </SectionCard>
          </TabsContent>

          <TabsContent className="mt-4 flex flex-col gap-4" value="history">
            <SectionCard
              action={
                <ToggleGroup aria-label="Filter activity" onValueChange={(v) => setActivity(v.length ? v : ["all"])} size="sm" type="multiple" value={activity} variant="outline">
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  <ToggleGroupItem value="customer">Customer</ToggleGroupItem>
                  <ToggleGroupItem value="internal">Internal</ToggleGroupItem>
                  <ToggleGroupItem value="ace">ACE</ToggleGroupItem>
                </ToggleGroup>
              }
              title="Activity"
            >
              <Timeline>
                <TimelineItem meta="Priya Raman · R4 · Salesforce" time={{ dateTime: "2026-11-05T08:31", label: "8:31" }} title="Quote revision submitted" />
                <TimelineItem icon={<SparklesIcon />} meta="ACE · Pricing agent" time={{ dateTime: "2026-11-05T08:40", label: "8:40" }} title="Discount exception detected" tone="primary" />
                <TimelineItem icon={<CheckIcon />} meta="Avery Chen · Deal desk" time={{ dateTime: "2026-10-31T16:02", label: "Oct 31" }} title="Deal desk approved" tone="success" />
              </Timeline>
              <div className="mt-3">
                <SourceList>
                  <li>
                    <SourceChip index={1} kind="Salesforce" label="Opportunity" />
                  </li>
                  <li>
                    <SourceChip index={2} kind="Contract" label="MSA 2023" />
                  </li>
                </SourceList>
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </RecordLayout>
      <UnsavedChangesBar count={dirtyCount} onDiscard={form.reset} onSave={doSave} open={form.dirty} saving={save === "saving"} />
    </>
  );
}
