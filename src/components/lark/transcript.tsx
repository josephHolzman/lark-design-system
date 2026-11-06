import type { ComponentProps, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TranscriptFlag = "Commitment" | "Risk" | "Question";

const FLAG_VARIANT = { Commitment: "success", Risk: "warning", Question: "info" } as const;

export type TranscriptProps = Omit<ComponentProps<"ol">, "aria-label"> & {
  /** Names the transcript for screen readers ("Northwind renewal call, Nov 3"). */
  label: string;
  children: ReactNode;
};

/** A meeting transcript or a chat thread: an ordered list of `TranscriptLine`s. */
export function Transcript({ label, className, children, ...props }: TranscriptProps) {
  return (
    <ol aria-label={label} className={cn("flex min-w-0 flex-col gap-3", className)} data-slot="transcript" {...props}>
      {children}
    </ol>
  );
}

export type TranscriptLineProps = Omit<ComponentProps<"li">, "children"> & {
  speaker: ReactNode;
  /** As shown: an offset ("12:31", "1:02:05") or a clock time ("10:42"). */
  time: string;
  /**
   * The machine-readable value for `<time dateTime>`. Offsets like "12:31" become a duration
   * ("PT12M31S") on their own; pass this for clock times or dates.
   */
  dateTime?: string;
  flag?: TranscriptFlag;
  children: ReactNode;
};

/** "12:31" → "PT12M31S", "1:02:05" → "PT1H2M5S"; anything else → undefined. */
export function offsetDuration(time: string): string | undefined {
  const m = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return undefined;
  const [, h, min, s] = m;
  return `PT${h ? `${Number(h)}H` : ""}${Number(min)}M${Number(s)}S`;
}

/**
 * One line of a transcript: speaker (450), time in mono 12 as a `<time>`, an optional flag
 * badge (Commitment, Risk, Question), then the words. Long lines wrap; nothing truncates.
 */
export function TranscriptLine({ speaker, time, dateTime, flag, className, children, ...props }: TranscriptLineProps) {
  return (
    <li className={cn("flex min-w-0 flex-col gap-0.5", className)} data-flag={flag} data-slot="transcript-line" {...props}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-label-lg text-on-surface">{speaker}</span>
        <time className="font-mono text-[12px] leading-4 tracking-[-0.4px] text-on-surface-tertiary tabular-nums" dateTime={dateTime ?? offsetDuration(time)}>
          {time}
        </time>
        {flag && <Badge variant={FLAG_VARIANT[flag]}>{flag}</Badge>}
      </div>
      <div className="text-body-md break-words text-on-surface">{children}</div>
    </li>
  );
}
