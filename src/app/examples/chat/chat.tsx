"use client";

import type { ToolUIPart } from "ai";
import {
  CheckIcon,
  CopyIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PaperclipIcon,
  PresentationIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Task, TaskContent, TaskItem, TaskTrigger } from "@/components/ai-elements/task";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { SectionCard } from "@/components/lark/cards";
import { SourceChip, SourceList } from "@/components/lark/data";
import { AceMark, CompanyLogo } from "@/components/lark/identity";
import { DescriptionItem, DescriptionList, List, ListItem } from "@/components/lark/lists";
import { StageProgress } from "@/components/lark/progress";
import { StatusBadge } from "@/components/lark/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DealWorkflow } from "../../review/examples/workflow";

const ANSWER = `Northwind needs VP Finance because the **platform line is discounted 24%**, and FY27 policy caps the desk at 20% for 36-month renewals [1][3].

The rest of the quote is within limits:
- Support and onboarding lines are at list
- Payment terms (Net 45, annual in advance) match the MSA [2]

Two ways to bring it under the limit without changing the net value much:
1. Move 4 points of discount into a **first-year ramp** (year-one cost unchanged, +$22,545 over the term)
2. Swap the 36-month term for **24 months + renewal cap** at 19%`;

type Turn = { id: string; from: "user" | "assistant"; text: string };

const approval = { id: "approval-1" };

export function AceChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<"approval-requested" | "approval-responded" | "output-denied">("approval-requested");
  const nextId = useRef(1);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    const id = `t${nextId.current++}`;
    setTurns((t) => [...t, { id, from: "user", text }]);
    setBusy(true);
    window.setTimeout(() => {
      setTurns((t) => [
        ...t,
        {
          id: `${id}-r`,
          from: "assistant",
          text: "This is an example workspace, so I can't look that up. In Deepgrids I would answer from the Northwind records listed under **Deal context**.",
        },
      ]);
      setBusy(false);
    }, 1200);
  };

  return (
    <div className="grid min-h-0 min-w-0 flex-1 lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-hidden">
      {/* ------------------------------------------------ work area */}
      <Tabs className="flex h-[calc(100svh-3rem)] min-h-0 min-w-0 flex-col gap-0 lg:h-full" defaultValue="conversation">
        <div className="flex items-center gap-3 px-4 md:px-6">
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="outputs">Outputs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="flex min-h-0 flex-1 flex-col" value="conversation">
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="mx-auto w-full max-w-[720px] gap-6 px-4 py-6 md:px-6">
              <Message from="user">
                <MessageContent>Why does the Northwind renewal need VP approval?</MessageContent>
              </Message>

              <Message from="assistant">
                <MessageContent>
                  <Reasoning defaultOpen={false} duration={6}>
                    <ReasoningTrigger />
                    <ReasoningContent>
                      The quote has nine lines. Only the platform line is discounted beyond list, so the policy check should focus there and on the term length.
                    </ReasoningContent>
                  </Reasoning>
                  <Tool>
                    <ToolHeader state="output-available" title="check_pricing_policy" type="tool-check_pricing_policy" />
                    <ToolContent>
                      <ToolInput input={{ quote: "OPP-20431 R4", policy: "FY27 discount v3" }} />
                      <ToolOutput errorText={undefined} output={"1 line above limit: PLT-ENT-36 at 24% (limit 20%)"} />
                    </ToolContent>
                  </Tool>
                  <MessageResponse>{ANSWER}</MessageResponse>
                  <Sources>
                    <SourcesTrigger count={3} />
                    <SourcesContent>
                      <Source href="#" title="[1] Salesforce · Opportunity OPP-20431" />
                      <Source href="#" title="[2] Contract · MSA 2023, §4 Payment" />
                      <Source href="#" title="[3] Policy · FY27 discount v3" />
                    </SourcesContent>
                  </Sources>
                </MessageContent>
                <MessageActions>
                  <MessageAction label="Copy" tooltip="Copy">
                    <CopyIcon />
                  </MessageAction>
                  <MessageAction label="Regenerate" tooltip="Regenerate">
                    <RefreshCcwIcon />
                  </MessageAction>
                  <MessageAction label="Good response" tooltip="Good response">
                    <ThumbsUpIcon />
                  </MessageAction>
                  <MessageAction label="Bad response" tooltip="Bad response">
                    <ThumbsDownIcon />
                  </MessageAction>
                </MessageActions>
              </Message>

              <Message from="user">
                <MessageContent>Go with the ramp and ask Rui to approve.</MessageContent>
              </Message>

              <Message from="assistant">
                <MessageContent>
                  <Task defaultOpen>
                    <TaskTrigger title="Prepared revision R5" />
                    <TaskContent>
                      <TaskItem>Moved 4 points of platform discount into a year-one ramp</TaskItem>
                      <TaskItem>Re-ran the policy check: all lines within limits</TaskItem>
                      <TaskItem>Drafted the approval note for VP Finance</TaskItem>
                    </TaskContent>
                  </Task>
                  <Confirmation approval={approval} state={decision as ToolUIPart["state"]}>
                    <ConfirmationTitle>
                      <ConfirmationRequest>Send the approval request to Rui Tanaka in Slack (#deal-desk)?</ConfirmationRequest>
                      <ConfirmationAccepted>
                        <CheckIcon className="size-4 text-success" />
                        <span>Request sent to Rui Tanaka</span>
                      </ConfirmationAccepted>
                      <ConfirmationRejected>
                        <XIcon className="size-4 text-error" />
                        <span>Not sent</span>
                      </ConfirmationRejected>
                    </ConfirmationTitle>
                    <ConfirmationActions>
                      <ConfirmationAction onClick={() => setDecision("output-denied")} variant="outline">
                        Don&apos;t send
                      </ConfirmationAction>
                      <ConfirmationAction onClick={() => setDecision("approval-responded")}>Send request</ConfirmationAction>
                    </ConfirmationActions>
                  </Confirmation>
                </MessageContent>
              </Message>

              {turns.map((t) => (
                <Message from={t.from} key={t.id}>
                  <MessageContent>{t.from === "assistant" ? <MessageResponse>{t.text}</MessageResponse> : t.text}</MessageContent>
                </Message>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-sm" role="status">
                  <AceMark size="xs" />
                  <Shimmer>ACE is working…</Shimmer>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-4 pb-4 md:px-6">
            <Suggestions>
              {["Compare with last year's terms", "Draft the customer email", "Who else needs to sign?"].map((s) => (
                <Suggestion key={s} onClick={send} suggestion={s} />
              ))}
            </Suggestions>
            <PromptInput onSubmit={(m) => send(m.text)}>
              <PromptInputBody>
                <PromptInputTextarea aria-label="Message ACE" placeholder="Ask about Northwind, or tell ACE what to do next" />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputButton aria-label="Attach files" tooltip="Attach files">
                    <PaperclipIcon />
                  </PromptInputButton>
                  <PromptInputButton tooltip="Records ACE can use in this deal">
                    <FileTextIcon />3 sources
                  </PromptInputButton>
                  <PromptInputSelect defaultValue="standard">
                    <PromptInputSelectTrigger aria-label="ACE mode">
                      <PromptInputSelectValue />
                    </PromptInputSelectTrigger>
                    <PromptInputSelectContent>
                      <PromptInputSelectItem value="standard">ACE · Standard</PromptInputSelectItem>
                      <PromptInputSelectItem value="deep">ACE · Deep review</PromptInputSelectItem>
                    </PromptInputSelectContent>
                  </PromptInputSelect>
                </PromptInputTools>
                <PromptInputSubmit status={busy ? "submitted" : undefined} />
              </PromptInputFooter>
            </PromptInput>
            <p className="text-center text-body-sm text-on-surface-variant">
              ACE answers from your connected records and shows its sources. Check decisions before you send them.
            </p>
          </div>
        </TabsContent>

        <TabsContent className="min-h-0 flex-1 p-4 md:p-6" value="work">
          <div className="h-full min-h-[420px] overflow-hidden rounded-lg border border-outline-variant">
            <DealWorkflow />
          </div>
        </TabsContent>

        <TabsContent className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6" value="outputs">
          <SectionCard className="mx-auto max-w-[720px]" flush title="Outputs from this deal">
            <List className="pb-1" density="comfortable" dividers>
              <ListItem
                headline="Quote revision R5"
                href="#"
                leading={<FileSpreadsheetIcon />}
                meta="9:24"
                supporting="Year-one ramp on PLT-ENT-36; all lines within FY27 limits"
              />
              <ListItem
                headline="Approval note for VP Finance"
                href="#"
                leading={<FileTextIcon />}
                meta="9:25"
                supporting="Why the exception, what changed, and the two alternatives considered"
              />
              <ListItem
                headline="Renewal brief"
                href="#"
                leading={<PresentationIcon />}
                meta="Yesterday"
                supporting="Usage, open issues and contacts for the renewal call"
              />
            </List>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* ------------------------------------------------ context panel */}
      <aside
        aria-label="Deal context"
        className="flex min-w-0 flex-col gap-4 border-t border-outline-variant p-4 lg:h-full lg:overflow-y-auto lg:border-t-0 lg:border-l"
      >
        <div className="flex items-start gap-3">
          <CompanyLogo name="Northwind Traders" size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-title-md">Northwind Traders</h2>
            <p className="text-body-sm text-on-surface-variant">
              Renewal · Priya Raman · <span className="font-mono text-xs">OPP-20431</span>
            </p>
            <StatusBadge status="Discount exception" />
          </div>
        </div>

        <SectionCard as="h3" title="Progress">
          <StageProgress
            aria-label="Deal progress"
            current={2}
            orientation="vertical"
            stages={[
              { label: "Understand request" },
              { label: "Prepare changes", description: "R5 ready" },
              { label: "Approval decisions", description: "Waiting on VP Finance" },
              { label: "Confirm follow-through" },
            ]}
          />
        </SectionCard>

        <SectionCard as="h3" title="Key terms">
          <DescriptionList>
            <DescriptionItem term="Net value">$1,001,710</DescriptionItem>
            <DescriptionItem term="Platform discount">20% + ramp</DescriptionItem>
            <DescriptionItem term="Term">36 months</DescriptionItem>
            <DescriptionItem term="Close">Nov 14</DescriptionItem>
          </DescriptionList>
        </SectionCard>

        <SectionCard as="h3" title="Sources ACE used">
          <SourceList>
            <li>
              <SourceChip index={1} kind="Salesforce" label="Opportunity" />
            </li>
            <li>
              <SourceChip index={2} kind="Contract" label="MSA 2023" />
            </li>
            <li>
              <SourceChip index={3} kind="Policy" label="FY27 discount v3" />
            </li>
          </SourceList>
        </SectionCard>

        <Button asChild className="self-start" size="sm" variant="outline">
          <a href="/examples/dashboard">Open in Deals & approvals</a>
        </Button>
      </aside>
    </div>
  );
}
