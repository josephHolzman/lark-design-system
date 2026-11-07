"use client";

import { Share2Icon, SquarePenIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AnswerSkeleton, AnswerView } from "@/components/lark/answer";
import { type AceMode, AssistantTurn, ThinkingRow, TimeDivider, UserTurn, WorkLog } from "@/components/lark/chat";
import { ChatComposer, ChatLayout, Reasoning, SuggestionChips, TurnActions } from "@/components/lark/conversation";
import { AceMark, CompanyLogo } from "@/components/lark/identity";
import { HeaderBand } from "@/components/lark/layouts";
import { PageHeader } from "@/components/lark/page-header";
import { Button } from "@/components/ui/button";

import { APPROVAL, PRICE, REASONING_1, REASONING_2, RENEWAL, SCHEDULES, SUGGESTIONS_1, SUGGESTIONS_2, TOOLS_1 } from "../_shared/answers";

type Extra = { id: number; q: string; state: "thinking" | "done" };

/**
 * Full-page ACE: a 760px thread with the composer docked under it. Each ACE turn: a header (mark,
 * name, AI badge, time), how it worked it out (closed), a sentence of lead-in, the answer as an
 * inline dashboard, feedback, then follow-ups.
 */
export function AceChat() {
  const [mode, setMode] = useState<AceMode>("prepare");
  const [extra, setExtra] = useState<Extra[]>([]);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const openSystem = () => toast("Opening Northwind Traders in Salesforce (example)");

  const ask = (q: string) => {
    const id = Date.now();
    setExtra((e) => [...e, { id, q, state: "thinking" }]);
    setBusy(true);
    timer.current = window.setTimeout(() => {
      setExtra((e) => e.map((x) => (x.id === id ? { ...x, state: "done" } : x)));
      setBusy(false);
    }, 1800);
  };
  const stop = () => {
    window.clearTimeout(timer.current);
    setExtra((e) => e.filter((x) => x.state === "done"));
    setBusy(false);
    toast("Stopped. Nothing was saved.");
  };

  return (
    <ChatLayout
      composer={
        <ChatComposer
          mode={mode}
          onAttach={() => toast("Attach files (example)")}
          onModeChange={setMode}
          onStop={stop}
          onSubmit={ask}
          sources={{ count: 5, onClick: () => toast("5 records ACE can use (example)") }}
          status={busy ? "streaming" : "ready"}
        />
      }
      header={
        // The page header every page uses, with the agent as its leading mark (Cohere opens a
        // chat with who you're talking to). The record is a chip in the meta line.
        <HeaderBand className="pb-3">
          <PageHeader
            actions={
              <>
                <Button onClick={() => toast("Link copied (example)")} size="sm" variant="ghost">
                  <Share2Icon />
                  Share
                </Button>
                <Button onClick={() => toast("New chat (example)")} size="sm" variant="secondary">
                  <SquarePenIcon />
                  New chat
                </Button>
              </>
            }
            leading={<AceMark size="lg" />}
            meta={
              <>
                <span>ACE, deal desk agent</span>
                <button
                  className="focus-ring state-layer [--state-hover:0.04] inline-flex h-6 items-center gap-1.5 rounded-md bg-surface-container pr-2 pl-1 text-body-sm text-on-surface outline-none"
                  onClick={openSystem}
                  type="button"
                >
                  <CompanyLogo name="Northwind Traders" size="xs" />
                  Northwind Traders
                </button>
              </>
            }
            title="Northwind renewal: discount exception"
          />
        </HeaderBand>
      }
    >
      <TimeDivider>Today 9:41 AM</TimeDivider>

      <UserTurn time="9:41 AM">Why does Northwind need VP approval?</UserTurn>
      <AssistantTurn
        actions={<TurnActions onRegenerate={() => toast("Regenerating (example)")} />}
        agent={{ time: "9:41 AM" }}
        lead="The platform discount is above what the desk can approve on a 36-month renewal. Here's the gap, who approves it, and a question ready to send."
        process={
          <>
            <Reasoning duration="6s" steps={REASONING_1} />
            <WorkLog calls={TOOLS_1} />
          </>
        }
      >
        <AnswerView level={2} doc={APPROVAL} onOpenSystem={openSystem} />
      </AssistantTurn>
      <SuggestionChips items={SUGGESTIONS_1} onPick={ask} />

      <UserTurn time="9:44 AM">What if we spread the invoices out instead?</UserTurn>
      <AssistantTurn
        actions={<TurnActions />}
        agent={{ time: "9:44 AM" }}
        lead="Spreading the invoices doesn't change the discount, but it clears the buyer's first-invoice limit. Pick a schedule to see its cash timing."
        process={<Reasoning duration="4s" steps={REASONING_2} />}
      >
        <AnswerView level={2} doc={SCHEDULES} onOpenSystem={openSystem} />
      </AssistantTurn>
      <SuggestionChips items={SUGGESTIONS_2} onPick={ask} />

      <UserTurn time="9:47 AM">Draft the renewal note to Dana with the quarterly schedule.</UserTurn>
      <AssistantTurn actions={<TurnActions />} agent={{ time: "9:47 AM" }} lead="A draft in Priya's voice. Nothing is sent until you press Send.">
        <AnswerView level={2} doc={RENEWAL} onOpenSystem={openSystem} />
      </AssistantTurn>

      {extra.map((x) => (
        <div className="flex flex-col gap-8" key={x.id}>
          <UserTurn>{x.q}</UserTurn>
          {x.state === "thinking" ? (
            <AssistantTurn
              agent={{ time: "Now" }}
              process={
                <>
                  <Reasoning streaming steps={[{ label: "Reading quote R4", state: "active", results: [{ label: "Quote R4", system: "Salesforce CPQ" }] }]} />
                  <ThinkingRow detail="Reading quote R4" label="Working" />
                </>
              }
            >
              <AnswerSkeleton />
            </AssistantTurn>
          ) : (
            <AssistantTurn
              actions={<TurnActions />}
              agent={{ time: "Now" }}
              lead="This is an example reply, so it shows the price breakdown for any question."
              process={<Reasoning duration="3s" steps={[{ label: "Read quote R4", state: "complete", results: [{ label: "Quote R4", system: "Salesforce CPQ" }] }]} />}
            >
              <AnswerView level={2} doc={PRICE} onOpenSystem={openSystem} />
            </AssistantTurn>
          )}
        </div>
      ))}
    </ChatLayout>
  );
}
