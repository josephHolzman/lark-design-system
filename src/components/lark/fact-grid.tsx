"use client";

import { CopyIcon } from "lucide-react";
import { isValidElement, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LarkLink as Link } from "./provider";
import { NoBreak } from "./text";

/*
  FactGrid (v0.8): the facts about a record, as a real definition list. Term 14, value 16.
  Columns follow the grid's own width, never the viewport: auto is one column under 24rem,
  two to 40rem, three to 56rem and four above. An explicit `columns` is a maximum, so a
  four-column grid in a 360 aside still reads as one or two columns.
*/

export type FactGridColumns = "auto" | 1 | 2 | 3 | 4;

export type FactGridItem = {
  term: ReactNode;
  value: ReactNode;
  /** A note under the value: how it was calculated, where it came from. */
  hint?: ReactNode;
  /** Adds a copy button named "Copy <term>" and a "Copied" toast. */
  copy?: boolean;
  /** Makes the value a link. */
  href?: string;
};

export type FactGridProps = Omit<ComponentProps<"dl">, "children"> & {
  items: FactGridItem[];
  columns?: FactGridColumns;
};

const COLUMNS: Record<FactGridColumns, string> = {
  auto: "grid-cols-1 @[24rem]/facts:grid-cols-2 @[40rem]/facts:grid-cols-3 @[56rem]/facts:grid-cols-4",
  1: "grid-cols-1",
  2: "grid-cols-1 @[24rem]/facts:grid-cols-2",
  3: "grid-cols-1 @[24rem]/facts:grid-cols-2 @[40rem]/facts:grid-cols-3",
  4: "grid-cols-1 @[24rem]/facts:grid-cols-2 @[40rem]/facts:grid-cols-3 @[56rem]/facts:grid-cols-4",
};

/** The text a node shows, for names and copying. Empty for nodes with no text. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

const NUMERIC = /^[\s$€£¥+\-–—.,0-9%()]+$/;

/** Amounts, counts and percentages never break mid-word and line up in a column. */
function isNumeric(value: ReactNode) {
  return typeof value === "number" || (typeof value === "string" && /\d/.test(value) && NUMERIC.test(value));
}

function isSet(value: ReactNode) {
  return value !== null && value !== undefined && value !== "";
}

export function FactGrid({ items, columns = "auto", className, ...props }: FactGridProps) {
  return (
    <dl
      className={cn("group/facts @container/facts grid min-w-0 gap-x-6 gap-y-4", COLUMNS[columns], className)}
      data-columns={columns}
      data-slot="fact-grid"
      {...props}
    >
      {items.map((item, i) => {
        const term = textOf(item.term);
        const copyText = textOf(item.value);
        const value = isSet(item.value) ? (
          isNumeric(item.value) ? (
            <NoBreak>{item.value}</NoBreak>
          ) : (
            item.value
          )
        ) : (
          <>
            <span aria-hidden="true" className="text-on-surface-variant">
              Not set
            </span>
            <span className="sr-only">not set</span>
          </>
        );
        return (
          <div className="min-w-0" data-not-set={isSet(item.value) ? undefined : ""} data-slot="fact" key={i}>
            <dt className="text-body-md text-on-surface-variant">{item.term}</dt>
            <dd className="mt-0.5 flex min-w-0 flex-col gap-0.5 text-body-lg text-on-surface">
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1">
                {item.href ? (
                  <Link className="link-default focus-ring rounded-sm outline-none" href={item.href}>
                    {value}
                  </Link>
                ) : (
                  value
                )}
                {item.copy && copyText !== "" && (
                  <Button
                    aria-label={`Copy ${term || "value"}`}
                    className="-my-1 shrink-0 text-on-surface-variant"
                    onClick={() => {
                      const result = navigator.clipboard?.writeText(copyText);
                      if (result) void result.then(() => toast("Copied"), () => toast("Couldn't copy"));
                      else toast("Copied");
                    }}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <CopyIcon />
                  </Button>
                )}
              </span>
              {item.hint && (
                <p className="text-meta text-on-surface-variant" data-meta="hint">
                  {item.hint}
                </p>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
