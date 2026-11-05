"use client";

import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
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
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CopyIcon,
  GlobeIcon,
  PlusIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

const VARIANTS = [
  ["default", "Primary"],
  ["secondary", "Secondary"],
  ["ghost", "Tertiary"],
  ["reversed", "Reversed"],
  ["ai", "AI"],
  ["destructive", "Destructive"],
  ["link", "Link"],
] as const;

export function ButtonMatrix() {
  return (
    <div className="flex flex-col gap-3">
      {VARIANTS.map(([variant, label]) => (
        <div className="flex flex-wrap items-center gap-2" key={variant}>
          <span className="w-24 shrink-0 text-xs text-on-surface-variant">{label}</span>
          <Button size="sm" variant={variant}>
            Small
          </Button>
          <Button variant={variant}>Default</Button>
          <Button size="lg" variant={variant}>
            Large <ArrowRightIcon />
          </Button>
          {variant !== "link" && (
            <Button aria-label="Add" size="icon" variant={variant}>
              <PlusIcon />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

const ANSWER = `The forecast fell by **$1,180,400** because two renewals moved past September 30. *Neither deal was lost*: both buyers confirmed budget last week.

- Acme Logistics: signing moved to Oct 14
- Halvorsen: legal review, expected Oct 21

If both close in October, Q4 lands **14.7%** above plan. Record \`OPP-20431\` has the details.`;

export function MessageDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Message from="user">
        <MessageContent>Why did the Q3 forecast drop?</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>{ANSWER}</MessageResponse>
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
    </div>
  );
}

export function ComposerDemo({
  status,
  text,
}: {
  status?: "submitted" | "streaming" | "error";
  text?: string;
}) {
  return (
    <PromptInput onSubmit={() => {}}>
      <PromptInputBody>
        <PromptInputTextarea
          aria-label="Message"
          defaultValue={text}
          placeholder="Ask about a deal, a forecast, or a record"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputButton aria-label="Add files" tooltip="Add files">
            <PlusIcon />
          </PromptInputButton>
          <PromptInputButton>
            <GlobeIcon />
            Search
          </PromptInputButton>
          <PromptInputSelect defaultValue="lark-pro">
            <PromptInputSelectTrigger aria-label="Model">
              <PromptInputSelectValue />
            </PromptInputSelectTrigger>
            <PromptInputSelectContent>
              <PromptInputSelectItem value="lark-pro">Lark Pro</PromptInputSelectItem>
              <PromptInputSelectItem value="lark-fast">Lark Fast</PromptInputSelectItem>
            </PromptInputSelectContent>
          </PromptInputSelect>
        </PromptInputTools>
        <PromptInputSubmit status={status} />
      </PromptInputFooter>
    </PromptInput>
  );
}
