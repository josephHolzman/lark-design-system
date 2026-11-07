"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AnswerView } from "@/components/lark/answer";
import { type AceMode, AssistantTurn, UserTurn } from "@/components/lark/chat";
import { ChatComposer, ChatPanel, Reasoning, SuggestionChips, TurnActions } from "@/components/lark/conversation";
import { CompanyLogo } from "@/components/lark/identity";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { APPROVAL, PRICE, REASONING_1 } from "../_shared/answers";
import { DeepgridsShell } from "../_shared/deepgrids-shell";
import { DealRecord } from "../record/record";

function Conversation({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<AceMode>("prepare");
  const [priced, setPriced] = useState(false);
  const openSystem = () => toast("Opening Northwind Traders in Salesforce (example)");
  return (
    <ChatPanel
      composer={<ChatComposer compact mode={mode} onAttach={() => toast("Attach files (example)")} onModeChange={setMode} onSubmit={() => setPriced(true)} placeholder="Ask about this deal" sources={{ count: 3 }} />}
      context={
        <>
          <CompanyLogo name="Northwind Traders" size="xs" />
          <span>
            Working on <span className="text-on-surface">Northwind Traders</span>, quote R4
          </span>
        </>
      }
      fullPageHref="/examples/chat"
      onClose={onClose}
      onNewChat={() => toast("New chat (example)")}
    >
      <UserTurn time="9:41 AM">Can the desk approve this discount?</UserTurn>
      <AssistantTurn
        actions={<TurnActions />}
        agent={{ time: "9:41 AM" }}
        lead="Not at 24%. The desk can approve up to 20% on a 36-month renewal, so this goes to Rui Tanaka."
        process={<Reasoning duration="6s" steps={REASONING_1} />}
      >
        <AnswerView doc={APPROVAL} onOpenSystem={openSystem} />
      </AssistantTurn>
      {!priced ? (
        <SuggestionChips items={["Show the price from list to net", "Prepare a 20% option"]} onPick={() => setPriced(true)} />
      ) : (
        <>
          <UserTurn>Show the price from list to net</UserTurn>
          <AssistantTurn actions={<TurnActions />} agent={{ time: "Now" }} lead="Three discounts stack on the platform line. The exception is the last 6%.">
            <AnswerView doc={PRICE} onOpenSystem={openSystem} />
          </AssistantTurn>
        </>
      )}
    </ChatPanel>
  );
}

/**
 * A record page with ACE docked on the right (from lg up, 420px). Under lg the same conversation
 * opens as a sheet. The top bar's Ask ACE toggles it.
 */
export function RecordWithAce() {
  const [open, setOpen] = useState(true);
  const [sheet, setSheet] = useState(false);
  const toggle = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) setOpen((o) => !o);
    else setSheet(true);
  };
  return (
    <DeepgridsShell crumbs={[{ label: "Deals", href: "/examples/deals" }, { label: "Northwind Traders" }]} current="chat-panel" onAskAce={toggle}>
      <div className="flex min-h-0 min-w-0 flex-1 max-md:flex-col">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <DealRecord />
        </div>
        {open && (
          <div className="hidden min-h-0 w-[420px] shrink-0 border-l border-outline-variant lg:flex">
            <Conversation onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
      <Sheet onOpenChange={setSheet} open={sheet}>
        <SheetContent aria-describedby={undefined} className="w-full gap-0 p-0 sm:max-w-[440px] [&>button:last-child]:hidden">
          <SheetTitle className="sr-only">ACE</SheetTitle>
          <Conversation onClose={() => setSheet(false)} />
        </SheetContent>
      </Sheet>
    </DeepgridsShell>
  );
}
