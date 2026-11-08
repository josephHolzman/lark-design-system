"use client";

import { AlertTriangleIcon, ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import { isValidElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { NoBreak } from "./text";

/*
  ImpactPreview (v0.8): what a change will do before it is applied, used before saves that
  re-price or re-route. A sentence summary, a compact list of before → after values, and the
  policy checks behind them. Each row pairs its tone with an arrow or alert icon and a word
  for screen readers, so the direction never depends on colour. Rows follow the component's
  own width: label and change side by side from 28rem, stacked below it.
*/

export type ImpactTone = "neutral" | "increase" | "decrease" | "warning";

export type ImpactItem = {
  id?: string;
  label: ReactNode;
  from: ReactNode;
  to: ReactNode;
  /** What the change does. Default "neutral" (a change with no direction). */
  tone?: ImpactTone;
};

export type ImpactPreviewProps = {
  items: ImpactItem[];
  /** One sentence saying what applying the change does. */
  summary?: ReactNode;
  /** Where the change lands: "Salesforce CPQ · quote R4". */
  target?: ReactNode;
  /** How big it is: "12 quote lines · $48,200". */
  size?: ReactNode;
  /** Whether it can be undone. `false` says so in words; a node replaces the sentence. */
  reversible?: boolean | ReactNode;
  /** The policy checks that explain the change (a PolicyChecks, a list of rules). */
  policyChecks?: ReactNode;
  className?: string;
};

const TONE = {
  neutral: { icon: ArrowRightIcon, word: "changes", tone: "text-on-surface-variant" },
  increase: { icon: ArrowUpRightIcon, word: "increases", tone: "text-on-surface-variant" },
  decrease: { icon: ArrowDownRightIcon, word: "decreases", tone: "text-on-surface-variant" },
  warning: { icon: AlertTriangleIcon, word: "needs attention", tone: "text-on-warning-container" },
} as const;

const NUMERIC = /^[\s$€£¥+\-–—.,0-9%()]+$/;

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function ImpactValue({ children, strong }: { children: ReactNode; strong?: boolean }) {
  const text = textOf(children);
  if (text.trim() === "") return <span className="text-on-surface-variant">Not set</span>;
  const whole = typeof children === "number" || (/\d/.test(text) && NUMERIC.test(text));
  return (
    <span className={cn("[overflow-wrap:break-word]", strong ? "text-body-lg font-medium text-on-surface" : "text-body-md text-on-surface-variant")}>
      {whole ? <NoBreak>{children}</NoBreak> : children}
    </span>
  );
}

export function ImpactPreview({ items, summary, target, size, reversible, policyChecks, className }: ImpactPreviewProps) {
  return (
    <div className={cn("@container/impact flex min-w-0 flex-col gap-3", className)} data-slot="impact-preview">
      {summary && <p className="text-body-md text-on-surface">{summary}</p>}
      {(target || size || reversible !== undefined) && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-md text-on-surface-variant" data-slot="impact-context">
          {target && (
            <span>
              In <span className="text-on-surface">{target}</span>
            </span>
          )}
          {target && (size || reversible !== undefined) && <span aria-hidden="true">·</span>}
          {size && <span className="text-on-surface">{size}</span>}
          {size && reversible !== undefined && <span aria-hidden="true">·</span>}
          {reversible !== undefined && (
            <span className={reversible === false ? "text-on-warning-container" : undefined}>
              {typeof reversible === "boolean" ? (reversible ? "Can be undone" : "Can't be undone") : reversible}
            </span>
          )}
        </p>
      )}
      <ul className="flex min-w-0 flex-col divide-y divide-outline-faint rounded-lg border border-edge bg-card" data-slot="impact-list">
        {items.map((item, index) => {
          const tone = TONE[item.tone ?? "neutral"];
          const Icon = tone.icon;
          return (
            <li
              className="flex min-w-0 flex-col gap-1 px-3.5 py-2.5 @[28rem]/impact:flex-row @[28rem]/impact:items-baseline @[28rem]/impact:justify-between @[28rem]/impact:gap-4"
              data-slot="impact-item"
              data-tone={item.tone ?? "neutral"}
              key={item.id ?? index}
            >
              <span className="min-w-0 text-body-md text-on-surface-variant" data-slot="impact-label">
                {item.label}
              </span>
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1" data-slot="impact-change">
                <span className="sr-only">{tone.word}: from </span>
                <ImpactValue>{item.from}</ImpactValue>
                <Icon aria-hidden="true" className={cn("size-3.5 shrink-0 self-center", tone.tone)} />
                <span className="sr-only">to </span>
                <ImpactValue strong>{item.to}</ImpactValue>
                {/* A warning says so in words; an arrow alone is shape and colour. The dot keeps
                    the word from reading as part of the value. */}
                {item.tone === "warning" && (
                  <span aria-hidden="true" className="inline-flex items-center gap-1.5 text-body-md text-on-warning-container">
                    <span className="text-on-surface-variant">·</span>
                    Needs attention
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {policyChecks && <div data-slot="impact-policy">{policyChecks}</div>}
    </div>
  );
}
