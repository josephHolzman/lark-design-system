"use client";

/*
 * Lark answers (v0.6): ACE's inline widgets.
 *
 * ACE answers in a chat with small dashboards, not walls of text. Every answer in the ACE state
 * library (404 states, about 4,000 widgets) is built from the same 26 section types, so Lark has
 * one component per type and one renderer that turns an answer document into them. The same kind
 * of information always looks the same and sits in the same place.
 *
 * Anatomy of an answer (AnswerView):
 *   deal tag · headline · subtitle · lead              (header)
 *   key figures                                        (stats strip)
 *   body: sections, optionally beside an aside, as a stack, a split or a bento grid; or tabs
 *   after: notices
 *   next step: the answer's state, the prompt and its actions (one action tray, sky-ringed)
 *   sources (closed, last)
 *
 * Rules (from ACE, fitted to Lark):
 *  - Information is neutral: white cards on the answer's stone surface. Anything the person can do
 *    sits in an action tray (sky tint, sky ring), at most one brand button per tray.
 *  - Status is words in their tone, with an icon for attention, critical and done, never colour alone.
 *  - Danger is a ringed callout across the full row (Callout caution / critical).
 *  - Things open where they were clicked (disclosures, table rows, master rows).
 *  - Layout follows the container, not the viewport: the same answer works in the full-page chat
 *    and in a 400px side panel (bento and split collapse to a stack under ~42rem).
 *  - Charts have a tooltip on every mark, a legend for two or more series and "View data".
 */

import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronRightIcon,
  CircleDotIcon,
  ImageIcon,
  LoaderCircleIcon,
  OctagonAlertIcon,
  TableIcon,
} from "lucide-react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { createContext, type ReactNode, useContext, useId, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ContainedField, ContainedInput, ContainedTextarea } from "@/components/ui/contained-field";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { TextLink } from "@/components/ui/icon-button";

import { ActionCard } from "./cards";
import { AnswerSources, type ChatSource, ClarifyQuestion } from "./chat";
import { InlineEdit } from "./editing";
import { Callout } from "./feedback";
import { Figure, FigureCard, FigureStrip } from "./figure";
import { Segmented } from "./filters";
import { CompanyLogo, PersonAvatar, ServiceLogo } from "./identity";
import { DescriptionItem, DescriptionList, List, ListItem } from "./lists";
import { StepList, type StepState } from "./steps";

/* ================================================================ model */

export type AnswerTone = "neutral" | "positive" | "attention" | "critical" | "progress";
export type AnswerStatus = { text: string; tone?: AnswerTone };

/** What a control does in a preview: announce, change its tray's status, reveal a section, navigate, open the system. */
export type AnswerEffect = { message?: string; status?: AnswerStatus; reveal?: string; href?: string; system?: true };

/** A button in an action tray. `send` makes it "Send via <service>" (sending, then sent). One `primary` per tray. */
export type AnswerAction = { label?: string; primary?: boolean; href?: string; effect?: AnswerEffect; send?: string };

export type AnswerStat = { label: string; value: string; note?: string; tone?: AnswerTone; system?: string; status?: AnswerStatus };
export type AnswerPerson = { name: string; initials?: string; role?: string };

export type AnswerRow = {
  title: string;
  meta?: string;
  detail?: string;
  value?: string;
  status?: AnswerStatus;
  /** Initials: shows a person. */
  avatar?: string;
  system?: string;
  selected?: boolean;
  /** Label of a button on the row. */
  action?: string;
  href?: string;
  effect?: AnswerEffect;
};

export type AnswerStepState = "done" | "current" | "pending" | "blocked" | "failed" | "unknown";
export type AnswerSeriesTone = "accent" | "muted" | "positive" | "attention" | "critical" | "series1" | "series2" | "series3" | "series4";
export type AnswerSeries = { key: string; label: string; tone?: AnswerSeriesTone };
export type AnswerDataTable = { columns: Array<{ label: string; numeric?: boolean }>; rows: string[][] };

export type AnswerField = {
  label: string;
  kind: "text" | "textarea" | "select" | "segmented" | "radio" | "file" | "checkbox" | "date" | "number" | "search";
  value?: string;
  placeholder?: string;
  options?: string[];
  help?: string;
  readonly?: boolean;
  checked?: boolean;
};

type SectionBase = {
  /** Lets a control reveal this section (with `hidden`). */
  id?: string;
  hidden?: boolean;
  /** Width in a bento layout, out of 6 (default 6). */
  cols?: 2 | 3 | 4 | 6;
  title?: string;
  /** Quiet descriptor after the title. */
  meta?: string;
  /** One line under the title. */
  intro?: string;
  /** What the person can do with this section: an action tray after it. */
  actions?: AnswerAction[];
  actionsNote?: string;
};

export type AnswerSection =
  | (SectionBase & { type: "text"; paragraphs: string[] })
  | (SectionBase & { type: "stats"; items: AnswerStat[]; display?: "hero" | "row" | "cards" })
  | (SectionBase & {
      type: "properties";
      rows: Array<{ label: string; value: string; status?: AnswerStatus; note?: string; tone?: AnswerTone; system?: string; editable?: boolean }>;
      display?: "list" | "figures";
    })
  | (SectionBase & { type: "list"; rows: AnswerRow[]; selectable?: boolean; ordered?: boolean })
  | (SectionBase & {
      type: "options";
      name: string;
      /** Choosing an option switches the whole answer to `variants[key]`. */
      variant?: boolean;
      options: Array<{ key?: string; title: string; value?: string; meta?: string; note?: AnswerStatus; selected?: boolean; detail?: string }>;
    })
  | (SectionBase & {
      type: "table";
      columns: Array<{ label: string; numeric?: boolean }>;
      rows: Array<{ cells: string[]; sub?: Array<string | null>; status?: AnswerStatus; tone?: AnswerTone; system?: string; selectable?: boolean; selected?: boolean; inspect?: AnswerSection[] }>;
      selectable?: boolean;
    })
  | (SectionBase & {
      type: "chart";
      kind: "bar" | "stacked" | "grouped" | "segments" | "step" | "line" | "area" | "waterfall" | "range";
      xKey: string;
      series: AnswerSeries[];
      data: Array<Record<string, string | number | boolean>>;
      format?: "currency" | "currency-compact" | "millions" | "thousands" | "percent" | "plain";
      unit?: string;
      height?: number;
      reference?: { value: number; label: string };
      yTicks?: number[];
      readouts?: Array<{ label: string; value: string; meta?: string }>;
      selected?: number;
      tickLines?: string[][];
      legend?: Array<{ label: string; tone?: AnswerSeriesTone; dashed?: boolean }>;
      data_table?: AnswerDataTable;
    })
  | (SectionBase & {
      type: "bars";
      max: number;
      ticks?: Array<{ value: number; label: string }>;
      bars: Array<{ label: string; value: number; display: string; lines?: string[]; readout?: { label: string; value: string; meta?: string } }>;
      reference?: { value: number; label: string };
      selected?: number;
      data?: AnswerDataTable;
    })
  | (SectionBase & {
      type: "timeline";
      axis: Array<{ label: string; at: number }>;
      span?: number;
      headers?: { track?: string; value?: string };
      lanes: Array<{ name: string; meta?: string; start: number; end: number; value?: string; period?: string; tone?: "accent" | "muted" | "positive" }>;
    })
  | (SectionBase & { type: "waterfall"; max: number; ticks?: Array<{ value: number; label: string }>; steps: Array<{ label: string; value: number; display: string; total?: boolean }> })
  | (SectionBase & {
      type: "steps";
      steps: Array<{ title: string; detail?: string; meta?: string; system?: string; state: AnswerStepState; status?: AnswerStatus; disclosure?: { summary: string; sections: AnswerSection[] } }>;
    })
  | (SectionBase & {
      type: "compare";
      relation?: "≠" | "→" | "vs";
      items: Array<{ label: string; value: string; detail?: string; status?: AnswerStatus; emphasis?: boolean; source?: string; system?: string }>;
      footer?: string;
    })
  | (SectionBase & { type: "flow"; nodes: Array<{ label: string; detail?: string; status?: AnswerStatus; system?: string }> })
  | (SectionBase & { type: "quote"; text: string; attribution?: string; system?: string })
  | (SectionBase & { type: "note"; text: string; tone?: AnswerTone })
  | (SectionBase & {
      type: "question";
      prompt: string;
      addressee?: { initials?: string; name: string; role?: string };
      channel?: string;
      name: string;
      options: Array<{ label: string; selected?: boolean }>;
    })
  | (SectionBase & { type: "form"; fields: AnswerField[]; submit?: { label: string; effect?: AnswerEffect } })
  | (SectionBase & {
      type: "draft";
      app: string;
      heading?: string;
      status?: AnswerStatus;
      toolbar?: string[];
      effects?: Record<string, AnswerEffect>;
      fields?: Array<{ label: string; value: string; status?: AnswerStatus; readonly?: boolean }>;
      body: string[];
      placeholder?: string;
      footer?: string[];
      buttons?: string[];
      mail?: Array<{ initial?: string; from: string; subject: string; when?: string; body?: string; draft?: boolean; message?: string }>;
      mailOpen?: boolean;
    })
  | (SectionBase & { type: "links"; lead?: string; leadStatus?: AnswerStatus; links: Array<{ label: string; href?: string; effect?: AnswerEffect }> })
  | (SectionBase & { type: "disclosure"; summary: string; count?: number; sections: AnswerSection[] })
  | (SectionBase & { type: "tiles"; tiles: Array<{ title: string; detail?: string; href?: string; system?: string }> })
  | (SectionBase & { type: "media"; alt: string; caption?: string; heading?: string; text?: string; action?: string; actionHref?: string; system?: string; src?: string })
  | (SectionBase & { type: "group"; columns?: 1 | 2 | 3; sections: AnswerSection[] })
  | (SectionBase & { type: "master"; rows: Array<AnswerRow & { inspect: AnswerSection[] }> })
  | (SectionBase & {
      type: "message";
      channel: string;
      from: AnswerPerson;
      to: AnswerPerson;
      subject?: string;
      text: string;
      status?: AnswerStatus;
      when?: string;
    });

export type AnswerSectionType = AnswerSection["type"];

export type AnswerTab = { label: string; meta?: string; sections: AnswerSection[]; aside?: AnswerSection[] };

export type AnswerSourceItem = { label: string; system?: string; detail?: string; role?: string; excerpt?: string };

type AnswerBody = {
  context?: { text?: string; status?: AnswerStatus };
  lead?: string;
  stats?: AnswerStat[];
  sections?: AnswerSection[];
  aside?: AnswerSection[];
  tabs?: AnswerTab[];
  after?: AnswerSection[];
  prompt?: string;
  actions?: AnswerAction[];
};

export type AnswerDoc = AnswerBody & {
  headline: string;
  /** The record the answer is about: a tag above the headline that opens it. */
  tag?: { label: string; detail?: string; logo?: string };
  statsDisplay?: "hero" | "row" | "cards";
  layout?: "stack" | "split" | "bento";
  sources?: { label?: string; items: AnswerSourceItem[] };
  /** Alternative answers chosen by an options section with `variant: true`. */
  variants?: Record<string, Partial<AnswerBody>>;
};

/* ================================================================ context */

type AnswerCtx = {
  revealed: Set<string>;
  reveal: (id: string) => void;
  onNavigate?: (href: string) => void;
  onOpenSystem?: () => void;
  chooseVariant: (key: string) => void;
  /** Card nesting depth: a card inside a card flattens. */
  depth: number;
  /** Heading level for section titles. */
  level: 3 | 4 | 5 | 6;
};

const Ctx = createContext<AnswerCtx>({ revealed: new Set(), reveal: () => {}, chooseVariant: () => {}, depth: 0, level: 4 });
const useAnswer = () => useContext(Ctx);

/** Content inside a block: one card deeper; headings one level deeper only under a titled block. */
function Nested({ children, titled = true }: { children: ReactNode; titled?: boolean }) {
  const c = useAnswer();
  return <Ctx.Provider value={{ ...c, depth: c.depth + 1, level: (titled ? Math.min(c.level + 1, 6) : c.level) as AnswerCtx["level"] }}>{children}</Ctx.Provider>;
}

/* ================================================================ tone */

const TONE: Record<AnswerTone, { cls: string; icon?: typeof CheckCircle2Icon; word?: string }> = {
  neutral: { cls: "text-on-surface-variant" },
  positive: { cls: "text-success", icon: CheckCircle2Icon },
  attention: { cls: "text-on-warning-container", icon: AlertTriangleIcon },
  critical: { cls: "text-error", icon: OctagonAlertIcon },
  progress: { cls: "text-primary", icon: CircleDotIcon },
};

/** A status in words, in its tone, with an icon for anything but neutral (never colour alone). */
export function ToneText({ status, className }: { status: AnswerStatus; className?: string }) {
  const t = TONE[status.tone ?? "neutral"];
  return (
    <span className={cn("inline-flex items-start gap-1.5 text-body-md", t.cls, className)} data-slot="tone-text" data-tone={status.tone ?? "neutral"}>
      {t.icon && <t.icon aria-hidden className="mt-0.5 size-3.5 shrink-0" />}
      <span>{status.text}</span>
    </span>
  );
}

const toneValue = (tone?: AnswerTone) => (tone && tone !== "neutral" ? TONE[tone].cls : undefined);

/* ================================================================ actions */

function useRunEffect() {
  const { reveal, onNavigate, onOpenSystem } = useAnswer();
  return (e: AnswerEffect | undefined, set: { message?: (m: string) => void; status?: (s: AnswerStatus) => void }) => {
    if (!e) return;
    if (e.message) set.message?.(e.message);
    if (e.status) set.status?.(e.status);
    if (e.reveal) reveal(e.reveal);
    if (e.system) onOpenSystem?.();
    if (e.href) onNavigate?.(e.href);
  };
}

function ActionButton({ action, onEffect }: { action: AnswerAction; onEffect: (e?: AnswerEffect) => void }) {
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const variant = action.primary ? "default" : "secondary";
  if (action.send) {
    const label = phase === "sending" ? `Sending via ${action.send}` : phase === "sent" ? `Sent via ${action.send}` : action.label ?? `Send via ${action.send}`;
    return (
      <Button
        aria-disabled={phase !== "idle" || undefined}
        onClick={() => {
          if (phase !== "idle") return;
          setPhase("sending");
          setTimeout(() => {
            setPhase("sent");
            onEffect(action.effect);
          }, 900);
        }}
        size="sm"
        variant={phase === "sent" ? "secondary" : variant}
      >
        {phase === "sending" ? <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" /> : phase === "sent" ? <CheckIcon /> : <ServiceLogo service={action.send} size={16} />}
        {label}
      </Button>
    );
  }
  if (action.href && !action.effect) {
    return (
      <Button asChild size="sm" variant={variant}>
        <a href={action.href}>{action.label}</a>
      </Button>
    );
  }
  return (
    <Button onClick={() => onEffect(action.effect)} size="sm" variant={variant}>
      {action.label}
    </Button>
  );
}

/**
 * What the person can do: the state and a prompt on the left, the buttons on the right
 * (secondary first, the one brand button last). No box of its own: inside a card it is the card's
 * footer; at the end of an answer it sits in a white card. Results of a press are announced.
 */
export function ActionTray({
  status: initialStatus,
  prompt,
  actions = [],
  note,
  className,
}: {
  status?: AnswerStatus;
  prompt?: ReactNode;
  actions?: AnswerAction[];
  note?: ReactNode;
  className?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const run = useRunEffect();
  const ordered = [...actions].sort((a, b) => Number(!!a.primary) - Number(!!b.primary));
  if (!status && !prompt && !actions.length && !note) return null;
  return (
    <div className={cn("flex flex-wrap items-end gap-x-4 gap-y-2", className)} data-slot="action-tray">
      {(status || prompt) && (
        <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-1">
          {status && <ToneText status={status} />}
          {prompt && <p className="text-sm text-on-surface">{prompt}</p>}
        </div>
      )}
      {(ordered.length > 0 || note) && (
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {note && <span className="text-body-md text-on-surface-variant">{note}</span>}
          {ordered.map((a, i) => (
            <ActionButton action={a} key={`${a.label ?? a.send}-${i}`} onEffect={(e) => run(e, { message: setMessage, status: setStatus })} />
          ))}
        </div>
      )}
      <p aria-live="polite" className={cn("basis-full text-body-md text-on-surface", !message && "sr-only")} role="status">
        {message}
      </p>
    </div>
  );
}

/* ================================================================ block frame */

/**
 * The frame every widget sits in: a white card on the answer's surface (flattened when nested),
 * a title with its meta and intro, the widget, then the section's action tray.
 */
export function AnswerBlock({
  title,
  meta,
  intro,
  actions,
  actionsNote,
  bare,
  className,
  children,
}: {
  title?: ReactNode;
  meta?: ReactNode;
  intro?: ReactNode;
  actions?: AnswerAction[];
  actionsNote?: string;
  /** No card: the widget floats on the surface (figures, notes, prose). */
  bare?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const { depth, level } = useAnswer();
  const H = `h${level}` as "h4";
  const card = !bare && depth === 0;
  return (
    <section className={cn("flex min-w-0 flex-col gap-3", card && "rounded-lg border border-transparent bg-card p-4", className)} data-slot="answer-block">
      {(title || meta || intro) && (
        <div className="flex flex-col gap-0.5">
          {(title || meta) && (
            <div className="flex flex-wrap items-baseline gap-x-2">
              {title && <H className="text-label-lg text-on-surface">{title}</H>}
              {meta && <span className="text-meta text-on-surface-variant">{meta}</span>}
            </div>
          )}
          {intro && <p className="text-sm text-on-surface-variant">{intro}</p>}
        </div>
      )}
      <Nested titled={!!title}>{children}</Nested>
      {actions?.length ? (
        card ? (
          <ActionTray actions={actions} className="-mx-4 -mb-1 border-t border-outline-faint px-4 pt-3" note={actionsNote} />
        ) : (
          // A widget without its own card (options, flow): the actions get one, never loose on the surface.
          <div className="rounded-lg bg-card p-3">
            <ActionTray actions={actions} note={actionsNote} />
          </div>
        )
      ) : null}
    </section>
  );
}

/* ================================================================ widgets */

/** A service mark beside text: level with the first line even when the text wraps (20px lines). */
const LOGO_NUDGE: Record<number, string> = { 12: "mt-1", 14: "mt-[3px]", 16: "mt-0.5", 18: "mt-px" };
const Logo = ({ system, size = 16 }: { system?: string; size?: number }) =>
  system ? <ServiceLogo className={cn("self-start", LOGO_NUDGE[size])} service={system} size={size} /> : null;

const statLabel = (s: AnswerStat) =>
  s.system ? (
    <span className="inline-flex items-center gap-1.5">
      <Logo size={14} system={s.system} />
      {s.label}
    </span>
  ) : (
    s.label
  );

/**
 * Key figures, as Lark figures: one strip split by hairlines (Apollo), or a card each. The note
 * is the caption; a verdict ("4 points over the desk limit") sits under the value in its tone.
 */
export function StatsWidget({ items, display }: { items: AnswerStat[]; display?: "hero" | "row" | "cards" }) {
  const figure = (s: AnswerStat) => (
    <Figure caption={s.note} key={s.label} label={statLabel(s)} linkLabel={`${s.label}: ${s.value}`} value={s.value}>
      {s.status && <ToneText status={s.status} />}
    </Figure>
  );
  if (items.length === 1) {
    const s = items[0];
    return (
      <FigureCard caption={s.note} label={statLabel(s)} value={s.value}>
        {s.status && <ToneText status={s.status} />}
      </FigureCard>
    );
  }
  if (display === "cards" && items.length > 4)
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3" data-slot="stats-widget">
        {items.map((s) => (
          <FigureCard caption={s.note} key={s.label} label={statLabel(s)} value={s.value}>
            {s.status && <ToneText status={s.status} />}
          </FigureCard>
        ))}
      </div>
    );
  return (
    <FigureStrip columns={Math.min(Math.max(items.length, 2), 4) as 2 | 3 | 4} data-slot="stats-widget">
      {items.map(figure)}
    </FigureStrip>
  );
}

type PropRow = Extract<AnswerSection, { type: "properties" }>["rows"][number];

function EditableValue({ row }: { row: PropRow }) {
  const [v, setV] = useState(row.value);
  return <InlineEdit label={row.label} onCommit={setV} value={v} />;
}

/** Label and value rows, as a Lark description list; or 2–4 short facts set as figures. */
export function PropertiesWidget({ rows, display = "list" }: { rows: PropRow[]; display?: "list" | "figures" }) {
  if (display === "figures") return <StatsWidget items={rows.map((r) => ({ label: r.label, value: r.value, note: r.note, system: r.system, status: r.status }))} />;
  return (
    <DescriptionList className="-my-2" data-slot="properties-widget">
      {rows.map((r) => (
        <DescriptionItem
          key={r.label}
          term={
            r.system ? (
              <span className="inline-flex items-center gap-1.5">
                <Logo size={12} system={r.system} />
                {r.label}
              </span>
            ) : (
              r.label
            )
          }
        >
          <span className="flex flex-col gap-0.5">
            {r.editable ? <EditableValue row={r} /> : <span className="tabular-nums">{r.value}</span>}
            {r.status && <ToneText status={r.status} />}
            {r.note && <span className="text-body-md text-on-surface-variant">{r.note}</span>}
          </span>
        </DescriptionItem>
      ))}
    </DescriptionList>
  );
}

function RowLeading({ row }: { row: AnswerRow }) {
  if (row.avatar) return <PersonAvatar name={row.title} size="md" />;
  if (row.system)
    return (
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-container">
        <ServiceLogo service={row.system} size={18} />
      </span>
    );
  return undefined;
}

function RowBody({ row, titleNode }: { row: AnswerRow; titleNode?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-sm text-on-surface">{titleNode ?? row.title}</span>
      {row.meta && <span className="text-meta text-on-surface-variant">{row.meta}</span>}
      {row.detail && <span className="text-body-md text-on-surface">{row.detail}</span>}
      {row.status && <ToneText status={row.status} />}
    </span>
  );
}

/** Rows of people, records or items, as a Lark list. `selectable`: pick one (radios). `ordered`: numbered. */
export function ListWidget({ rows, selectable, ordered, name }: { rows: AnswerRow[]; selectable?: boolean; ordered?: boolean; name?: string }) {
  const run = useRunEffect();
  const [msg, setMsg] = useState("");
  const [picked, setPicked] = useState(rows.findIndex((r) => r.selected));
  const groupName = useId();
  const supporting = (r: AnswerRow) =>
    r.meta || r.detail || r.status ? (
      <span className="flex flex-col gap-0.5">
        {r.meta && <span>{r.meta}</span>}
        {r.detail && <span className="text-on-surface">{r.detail}</span>}
        {r.status && <ToneText status={r.status} />}
      </span>
    ) : undefined;
  if (selectable) {
    return (
      <RadioGroup aria-label={name ?? "Choose one"} className="flex flex-col gap-1" onValueChange={(v) => setPicked(Number(v))} value={picked >= 0 ? String(picked) : ""}>
        {rows.map((r, i) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-md p-2 has-[[data-state=checked]]:bg-selected-strong" key={`${groupName}-${i}`}>
            <RadioGroupItem className="mt-0.5" value={String(i)} />
            <RowLeading row={r} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium">{r.title}</span>
              {supporting(r) && <span className="text-body-md text-on-surface-variant">{supporting(r)}</span>}
            </span>
            {r.value && <span className="shrink-0 text-sm tabular-nums">{r.value}</span>}
          </label>
        ))}
      </RadioGroup>
    );
  }
  return (
    <>
      <List className="-mx-3" data-slot="list-widget" density="default" role={ordered ? "list" : undefined}>
        {rows.map((r, i) => (
          <ListItem
            headline={
              ordered ? (
                <>
                  <span className="mr-2 font-mono text-meta-strong text-on-surface-variant">{i + 1}</span>
                  {r.title}
                </>
              ) : (
                r.title
              )
            }
            href={r.href}
            key={`${r.title}-${i}`}
            leading={<RowLeading row={r} />}
            meta={r.value}
            selected={r.selected}
            supporting={supporting(r)}
            trailing={
              r.action ? (
                <Button onClick={() => run(r.effect, { message: setMsg })} size="xs" variant="secondary">
                  {r.action}
                  <span className="sr-only">: {r.title}</span>
                </Button>
              ) : undefined
            }
            wrap
          />
        ))}
      </List>
      {msg && (
        <p className="text-body-md text-on-surface" role="status">
          {msg}
        </p>
      )}
    </>
  );
}

type OptionItem = Extract<AnswerSection, { type: "options" }>["options"][number];

/** Choices with detail, as radio cards. With `variant`, choosing one switches the answer. */
export function OptionsWidget({ name, options, variant, label }: { name: string; options: OptionItem[]; variant?: boolean; label?: string }) {
  const { chooseVariant } = useAnswer();
  const [value, setValue] = useState(() => {
    const i = options.findIndex((o) => o.selected);
    return i >= 0 ? options[i].key ?? String(i) : "";
  });
  return (
    <RadioGroup
      aria-label={label ?? name}
      className={cn("grid gap-2", options.length === 2 ? "@md:grid-cols-2" : options.length === 3 ? "@2xl:grid-cols-3" : "@md:grid-cols-2")}
      onValueChange={(v) => {
        setValue(v);
        if (variant) chooseVariant(v);
      }}
      value={value}
    >
      {options.map((o, i) => {
        const v = o.key ?? String(i);
        return (
          <label
            className="state-layer [--state-hover:0.03] flex cursor-pointer flex-col gap-1 rounded-lg border border-edge bg-card p-3 has-[[data-state=checked]]:border-selected-border has-[[data-state=checked]]:bg-secondary-container"
            key={v}
          >
            <span className="flex items-start gap-2.5">
              <RadioGroupItem className="mt-0.5" value={v} />
              <span className="text-label-lg text-on-surface">{o.title}</span>
            </span>
            {o.value && <span className="pl-6.5 text-sm tabular-nums">{o.value}</span>}
            {o.meta && <span className="pl-6.5 text-meta text-on-surface-variant">{o.meta}</span>}
            {o.note && <ToneText className="pl-6.5" status={o.note} />}
            {o.detail && <span className="pl-6.5 text-sm text-on-surface">{o.detail}</span>}
          </label>
        );
      })}
    </RadioGroup>
  );
}

type TableSection = Extract<AnswerSection, { type: "table" }>;

/**
 * A table read across. Rows with detail have a disclosure button in their first cell and open the
 * detail in place, under the row. Under ~28rem the status moves under the first cell.
 */
export function TableWidget({ columns, rows, caption }: Pick<TableSection, "columns" | "rows" | "selectable"> & { caption?: string }) {
  const [open, setOpen] = useState(rows.findIndex((r) => r.selected && r.inspect?.length));
  const hasStatus = rows.some((r) => r.status);
  const expandable = rows.some((r) => r.inspect?.length);
  const span = columns.length + (hasStatus ? 1 : 0);
  return (
    <div className="-mx-4 overflow-x-auto" data-slot="table-widget">
      <Table density="compact">
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c, i) => (
              <TableHead className={cn(c.numeric && "text-right", i === 0 && "pl-4", i === columns.length - 1 && !hasStatus && "pr-4")} key={c.label} scope="col">
                {c.label}
              </TableHead>
            ))}
            {hasStatus && (
              <TableHead className="pr-4 @max-md:hidden" scope="col">
                Status
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, ri) => {
            const canOpen = !!r.inspect?.length;
            const isOpen = open === ri && canOpen;
            const detailId = `${caption ?? "row"}-${ri}-detail`.replace(/\s+/g, "-");
            return [
              <TableRow className={cn(isOpen && "border-b-0 bg-surface-container-low hover:bg-surface-container-low")} key={`r${ri}`}>
                {[...r.cells, ...Array(Math.max(0, columns.length - r.cells.length)).fill("")].map((cell: string, ci) => (
                  <TableCell className={cn("align-top", columns[ci]?.numeric && "text-right tabular-nums", ci === 0 && "pl-4", ci === r.cells.length - 1 && !hasStatus && "pr-4")} key={ci}>
                    {ci === 0 && canOpen ? (
                      <button
                        aria-controls={detailId}
                        aria-expanded={isOpen}
                        className={cn("focus-ring -ml-1 inline-flex items-start gap-1.5 rounded-sm px-1 text-left outline-none hover:text-on-surface-variant", toneValue(r.tone))}
                        onClick={() => setOpen(isOpen ? -1 : ri)}
                        type="button"
                      >
                        <ChevronRightIcon aria-hidden className={cn("mt-0.5 size-4 shrink-0 transition-transform", isOpen && "rotate-90")} />
                        <span className="inline-flex items-center gap-2">
                          <Logo system={r.system} size={14} />
                          {cell}
                        </span>
                      </button>
                    ) : (
                      <span className={cn("inline-flex items-center gap-2", ci === 0 && toneValue(r.tone), ci === 0 && expandable && "pl-6")}>
                        {ci === 0 && <Logo system={r.system} size={14} />}
                        {cell}
                      </span>
                    )}
                    {r.sub?.[ci] && <span className={cn("block text-meta text-on-surface-variant", ci === 0 && expandable && "pl-6")}>{r.sub[ci]}</span>}
                    {ci === 0 && r.status && (
                      <span className={cn("mt-0.5 block @md:hidden", expandable && "pl-6")}>
                        <ToneText status={r.status} />
                      </span>
                    )}
                  </TableCell>
                ))}
                {hasStatus && <TableCell className="pr-4 align-top @max-md:hidden">{r.status && <ToneText status={r.status} />}</TableCell>}
              </TableRow>,
              isOpen ? (
                <TableRow className="bg-surface-container-low hover:bg-surface-container-low" key={`i${ri}`}>
                  <TableCell className="px-4 pt-0 pb-3 whitespace-normal" colSpan={span} id={detailId}>
                    <div className="@container rounded-md bg-card p-3">
                      <SectionList sections={r.inspect!} />
                    </div>
                  </TableCell>
                </TableRow>
              ) : null,
            ];
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------------------------------------------------------------- charts */

const SERIES_COLOR: Record<AnswerSeriesTone, string> = {
  accent: "var(--chart-1)",
  muted: "var(--outline)",
  positive: "var(--success)",
  attention: "var(--warning)",
  critical: "var(--error)",
  series1: "var(--chart-1)",
  series2: "var(--chart-2)",
  series3: "var(--chart-3)",
  series4: "var(--chart-4)",
};

export function formatAnswerNumber(n: number, format: Extract<AnswerSection, { type: "chart" }>["format"] = "plain", compact?: boolean) {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: compact ? 0 : 2, minimumFractionDigits: compact ? 0 : 2 }).format(n);
    case "currency-compact":
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);
    case "millions":
      return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n)}M`;
    case "thousands":
      return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n)}K`;
    case "percent":
      return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n)}%`;
    default:
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
  }
}

function DataTableToggle({ table, label }: { table: AnswerDataTable; label: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Button aria-controls={id} aria-expanded={open} className="w-fit" onClick={() => setOpen(!open)} size="xs" variant="ghost">
        <TableIcon />
        {open ? "Hide data" : "View data"}
      </Button>
      <div hidden={!open} id={id}>
        <TableWidget caption={label} columns={table.columns} rows={table.rows.map((cells) => ({ cells }))} />
      </div>
    </div>
  );
}

function Legend({ items }: { items: Array<{ label: string; tone?: AnswerSeriesTone; dashed?: boolean }> }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-body-md text-on-surface-variant">
      {items.map((l, i) => (
        <li className="inline-flex items-center gap-1.5" key={l.label}>
          <span aria-hidden className={cn("inline-block h-2.5 w-3 rounded-[2px]", l.dashed && "h-0 border-t-2 border-dashed")} style={l.dashed ? { borderColor: SERIES_COLOR[l.tone ?? (`series${(i % 4) + 1}` as AnswerSeriesTone)] } : { background: SERIES_COLOR[l.tone ?? (`series${(i % 4) + 1}` as AnswerSeriesTone)] }} />
          {l.label}
        </li>
      ))}
    </ul>
  );
}

/** The chosen point as a Lark figure, and a segmented control to choose it (keyboard and touch). */
function Readouts({ items, selected, onSelect, label }: { items: Array<{ label: string; value: string; meta?: string }>; selected: number; onSelect: (i: number) => void; label: string }) {
  const r = items[selected];
  return (
    <div className="flex flex-col gap-3">
      {r && (
        <div aria-live="polite">
          <Figure caption={r.meta} className="bg-transparent p-0" label={r.label} value={r.value} />
        </div>
      )}
      {items.length <= 6 ? (
        <Segmented aria-label={label} className="w-fit max-w-full overflow-x-auto" onValueChange={(v) => onSelect(Number(v))} options={items.map((it, i) => ({ value: String(i), label: it.label.replace(/, \d{4}$/, "") }))} value={String(selected)} />
      ) : (
        <label className="flex items-center gap-2 text-body-md text-on-surface-variant">
          {label}
          <select className="focus-ring h-8 rounded-md border border-input bg-surface-container-lowest px-2 text-sm text-on-surface" onChange={(e) => onSelect(Number(e.target.value))} value={selected}>
            {items.map((it, i) => (
              <option key={it.label} value={i}>
                {it.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

type ChartSection = Extract<AnswerSection, { type: "chart" }>;

/** Bar, stacked, grouped, line, step, area, segments, waterfall and range charts (Recharts). */
export function ChartWidget(s: Omit<ChartSection, "type"> & { label?: string }) {
  const [selected, setSelected] = useState(s.selected ?? 0);
  const fmt = (n: number, compact?: boolean) => formatAnswerNumber(n, s.format, compact) + (s.unit && s.format === "plain" ? ` ${s.unit}` : "");
  const config: ChartConfig = Object.fromEntries(s.series.map((se, i) => [se.key, { label: se.label, color: SERIES_COLOR[se.tone ?? (`series${(i % 4) + 1}` as AnswerSeriesTone)] }]));
  const height = s.height ?? 220;
  const label = s.label ?? s.title ?? "Chart";
  const domainMax = s.yTicks?.length ? s.yTicks[s.yTicks.length - 1] : "auto";
  const table: AnswerDataTable =
    s.data_table ??
    ({
      columns: [{ label: s.xKey }, ...s.series.map((se) => ({ label: se.label, numeric: true }))],
      rows: s.data.map((d) => [String(d[s.xKey]), ...s.series.map((se) => (typeof d[se.key] === "number" ? fmt(d[se.key] as number) : String(d[se.key] ?? "")))]),
    } satisfies AnswerDataTable);
  const legend = s.legend ?? (s.series.length > 1 ? s.series.map((se) => ({ label: se.label, tone: se.tone })) : undefined);

  let chart: ReactNode;
  // An array, not a fragment: Recharts only finds axes, grids and reference lines among its direct children.
  const axes = [
    <CartesianGrid key="grid" stroke="var(--outline-faint)" vertical={false} />,
    <XAxis axisLine={false} dataKey={s.xKey} key="x" tickLine={false} tickMargin={8} />,
    <YAxis axisLine={false} domain={[0, domainMax]} key="y" tickFormatter={(v: number) => fmt(v, true)} tickLine={false} ticks={s.yTicks} width={72} />,
    <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} />} cursor={{ fill: "var(--on-surface)", opacity: 0.04 }} key="tip" />,
    s.reference ? <ReferenceLine ifOverflow="extendDomain" key="ref" label={{ value: s.reference.label, position: "insideTopRight", fontSize: 12, fill: "var(--on-surface-variant)" }} stroke="var(--on-surface-variant)" strokeDasharray="4 4" y={s.reference.value} /> : null,
  ];

  if (s.kind === "segments") {
    const key = s.series[0]?.key;
    const total = s.data.reduce((a, d) => a + Number(d[key] ?? 0), 0) || 1;
    chart = (
      <div className="flex flex-col gap-2">
        <div aria-hidden className="flex h-6 w-full overflow-hidden rounded-md">
          {s.data.map((d, i) => (
            <span key={String(d[s.xKey])} style={{ width: `${(Number(d[key]) / total) * 100}%`, background: SERIES_COLOR[`series${(i % 4) + 1}` as AnswerSeriesTone] }} />
          ))}
        </div>
        <Legend items={s.data.map((d, i) => ({ label: `${d[s.xKey]}: ${fmt(Number(d[key]))}`, tone: `series${(i % 4) + 1}` as AnswerSeriesTone }))} />
      </div>
    );
  } else if (s.kind === "waterfall" || s.kind === "range") {
    // Floating bars: an invisible base, then the visible step.
    const lowKey = s.series[0]?.key;
    const highKey = s.series[1]?.key;
    const rows: Array<Record<string, string | number | boolean>> = [];
    let running = 0;
    for (const d of s.data) {
      if (s.kind === "range") {
        rows.push({ ...d, __base: Number(d[lowKey] ?? 0), __step: Number(d[highKey] ?? 0) - Number(d[lowKey] ?? 0), __neg: false });
        continue;
      }
      const v = Number(d[lowKey] ?? 0);
      if (d.total) {
        running = v;
        rows.push({ ...d, __base: 0, __step: v, __neg: false, __total: true });
        continue;
      }
      rows.push({ ...d, __base: v >= 0 ? running : running + v, __step: Math.abs(v), __neg: v < 0 });
      running += v;
    }
    chart = (
      <ChartContainer className="aspect-auto w-full" config={{ __step: { label: s.series[0]?.label ?? "Value", color: "var(--chart-1)" } }} style={{ height }}>
        <BarChart accessibilityLayer data={rows} margin={{ top: 16, left: 0, right: 8 }}>
          {axes}
          <Bar dataKey="__base" fill="transparent" isAnimationActive={false} stackId="w" />
          <Bar dataKey="__step" isAnimationActive={false} maxBarSize={40} radius={[4, 4, 0, 0]} stackId="w">
            {rows.map((r, i) => (
              <Cell fill={r.__neg ? "var(--chart-2)" : r.__total ? "var(--chart-1)" : "var(--chart-3)"} key={i} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  } else if (s.kind === "line" || s.kind === "step" || s.kind === "area") {
    const C = s.kind === "area" ? AreaChart : LineChart;
    chart = (
      <ChartContainer className="aspect-auto w-full" config={config} style={{ height }}>
        <C accessibilityLayer data={s.data} margin={{ top: 16, left: 0, right: 8 }}>
          {axes}
          {s.series.map((se) =>
            s.kind === "area" ? (
              <Area dataKey={se.key} fill={`var(--color-${se.key})`} fillOpacity={0.15} isAnimationActive={false} key={se.key} stroke={`var(--color-${se.key})`} strokeWidth={2} type="monotone" />
            ) : (
              <Line dataKey={se.key} dot={{ r: 3 }} isAnimationActive={false} key={se.key} stroke={`var(--color-${se.key})`} strokeWidth={2} type={s.kind === "step" ? "stepAfter" : "monotone"} />
            )
          )}
        </C>
      </ChartContainer>
    );
  } else {
    chart = (
      <ChartContainer className="aspect-auto w-full" config={config} style={{ height }}>
        <BarChart accessibilityLayer data={s.data} margin={{ top: 16, left: 0, right: 8 }}>
          {axes}
          {s.series.map((se) => (
            <Bar dataKey={se.key} fill={`var(--color-${se.key})`} isAnimationActive={false} key={se.key} maxBarSize={40} onClick={(_, i) => setSelected(i)} radius={s.kind === "stacked" ? 0 : [4, 4, 0, 0]} stackId={s.kind === "stacked" ? "s" : undefined}>
              {s.readouts && s.series.length === 1 && s.data.map((_, i) => <Cell key={i} stroke={i === selected ? "var(--on-surface)" : "none"} strokeWidth={i === selected ? 2 : 0} />)}
            </Bar>
          ))}
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <figure aria-label={label} className="flex flex-col gap-3" data-kind={s.kind} data-slot="chart-widget">
      {legend && <Legend items={legend} />}
      {s.readouts?.length ? (
        <Readouts items={s.readouts} label={`${label}: choose a point`} onSelect={setSelected} selected={selected} />
      ) : null}
      <div>{chart}</div>
      <DataTableToggle label={label} table={table} />
    </figure>
  );
}

type BarsSection = Extract<AnswerSection, { type: "bars" }>;

/** Horizontal bars against one scale, with a reference mark; each bar can be inspected. */
export function BarsWidget({ max, bars, reference, selected: initial, data, label }: Omit<BarsSection, "type" | "ticks"> & { label?: string }) {
  const [sel, setSel] = useState(initial ?? -1);
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / (max || 1)) * 100))}%`;
  const r = sel >= 0 ? bars[sel]?.readout : undefined;
  return (
    <div className="flex flex-col gap-3" data-slot="bars-widget">
      {reference && <p data-meta="caption" className="text-meta text-on-surface-variant">Dashed line: {reference.label}</p>}
      <ul className="flex flex-col gap-2.5">
        {bars.map((b, i) => {
          const content = (
            <>
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                <span className="text-on-surface">{b.label}</span>
                <span className="tabular-nums">{b.display}</span>
              </span>
              <span aria-hidden className="relative block h-2.5 w-full rounded-full bg-surface-container-high">
                <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--chart-1)]" style={{ width: pct(b.value) }} />
                {reference && <span className="absolute -inset-y-1 border-l-2 border-dashed border-on-surface-variant" style={{ left: pct(reference.value) }} />}
              </span>
              {b.lines?.map((l) => (
                <span className="text-meta text-on-surface-variant" key={l}>
                  {l}
                </span>
              ))}
            </>
          );
          return (
            <li key={b.label}>
              {b.readout ? (
                <button aria-pressed={i === sel} className="focus-ring flex w-full flex-col gap-1 rounded-md p-1.5 text-left outline-none hover:bg-surface-container-low aria-pressed:bg-secondary-container" onClick={() => setSel(i)} type="button">
                  {content}
                </button>
              ) : (
                <div className="flex flex-col gap-1 p-1.5">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
      {r && (
        <div aria-live="polite">
          <Figure caption={r.meta} className="bg-transparent p-0" label={r.label} value={r.value} />
        </div>
      )}
      {data && <DataTableToggle label={label ?? "Bars"} table={data} />}
    </div>
  );
}

type TimelineSection = Extract<AnswerSection, { type: "timeline" }>;

/** Lanes on a shared time axis (terms, ramps, subscriptions). Each lane states its period in words. */
export function TimelineWidget({ axis, span, headers, lanes }: Omit<TimelineSection, "type">) {
  const total = span ?? Math.max(...axis.map((a) => a.at), ...lanes.map((l) => l.end), 1);
  const pct = (n: number) => `${(n / total) * 100}%`;
  const TONE_BAR = { accent: "bg-[var(--chart-1)]", muted: "bg-surface-container-highest", positive: "bg-[var(--chart-3)]" } as const;
  return (
    <div className="flex flex-col gap-2" data-slot="timeline-widget">
      <div className="grid grid-cols-[minmax(7rem,30%)_1fr] items-end gap-x-3 @lg:grid-cols-[minmax(8rem,28%)_1fr_auto]">
        <span className="text-meta-strong text-on-surface-variant">{headers?.track ?? ""}</span>
        <div aria-hidden className="relative h-5">
          {axis.map((a) => (
            <span className="absolute -translate-x-1/2 text-meta whitespace-nowrap text-on-surface-variant first:translate-x-0 last:-translate-x-full" key={a.label} style={{ left: pct(a.at) }}>
              {a.label}
            </span>
          ))}
        </div>
        <span className="hidden text-right text-meta-strong text-on-surface-variant @lg:block">{headers?.value ?? ""}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {lanes.map((l) => (
          <li className="grid grid-cols-[minmax(7rem,30%)_1fr] items-start gap-x-3 gap-y-1 @lg:grid-cols-[minmax(8rem,28%)_1fr_auto]" key={l.name}>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm text-on-surface">{l.name}</span>
              {l.meta && <span className="text-meta text-on-surface-variant">{l.meta}</span>}
              {l.period && <span className="text-meta text-on-surface-variant">{l.period}</span>}
            </span>
            <span aria-hidden className="relative block h-5 rounded-sm bg-surface-container">
              <span className={cn("absolute inset-y-0.5 rounded-sm", TONE_BAR[l.tone ?? "accent"])} style={{ left: pct(l.start), width: pct(Math.max(l.end - l.start, total * 0.01)) }} />
            </span>
            {l.value && <span className="col-start-2 text-right text-sm tabular-nums @lg:col-start-3">{l.value}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

type WaterfallSection = Extract<AnswerSection, { type: "waterfall" }>;

/** From list to net: each step floats from where the last one ended; totals start from zero. */
export function WaterfallWidget({ max, steps }: Omit<WaterfallSection, "type" | "ticks">) {
  const rows: Array<WaterfallSection["steps"][number] & { left: number; width: number; neg: boolean }> = [];
  let running = 0;
  for (const st of steps) {
    if (st.total) {
      running = st.value;
      rows.push({ ...st, left: 0, width: st.value, neg: false });
      continue;
    }
    rows.push({ ...st, left: st.value >= 0 ? running : running + st.value, width: Math.abs(st.value), neg: st.value < 0 });
    running += st.value;
  }
  const pct = (n: number) => `${(n / (max || 1)) * 100}%`;
  return (
    <ol className="flex flex-col gap-2" data-slot="waterfall-widget">
      {rows.map((r) => (
        <li className="grid grid-cols-[minmax(7rem,35%)_1fr_auto] items-start gap-x-3" key={r.label}>
          <span className={cn("text-sm", r.total ? "text-on-surface" : "text-on-surface-variant")}>{r.label}</span>
          <span aria-hidden className="relative mt-0.5 block h-4">
            <span className={cn("absolute inset-y-0 rounded-sm", r.total ? "bg-[var(--chart-1)]" : r.neg ? "bg-[var(--chart-2)]" : "bg-[var(--chart-3)]")} style={{ left: pct(r.left), width: pct(Math.max(r.width, max * 0.004)) }} />
          </span>
          <span className={cn("text-right text-sm tabular-nums", r.total && "text-label-lg")}>{r.display}</span>
        </li>
      ))}
    </ol>
  );
}

const STEP_STATE: Record<AnswerStepState, StepState> = { done: "done", current: "current", pending: "todo", blocked: "blocked", failed: "blocked", unknown: "todo" };

type StepsSection = Extract<AnswerSection, { type: "steps" }>;

/** Steps in order with their state, as a Lark step list; a step can open its detail in place. */
export function StepsWidget({ steps }: Pick<StepsSection, "steps">) {
  return (
    <StepList
      data-slot="steps-widget"
      steps={steps.map((st, i) => ({
        id: `${i}`,
        state: STEP_STATE[st.state],
        title: st.system ? (
          <span className="inline-flex items-center gap-1.5">
            <Logo size={14} system={st.system} />
            {st.title}
          </span>
        ) : (
          st.title
        ),
        description:
          st.meta || st.detail || st.status || st.disclosure || st.state === "failed" || st.state === "unknown" ? (
            <span className="flex flex-col gap-0.5">
              {st.meta && <span>{st.meta}</span>}
              {st.detail && <span className="text-on-surface">{st.detail}</span>}
              {st.state === "failed" && !st.status && <ToneText status={{ text: "Failed", tone: "critical" }} />}
              {st.state === "unknown" && !st.status && <span>State unknown</span>}
              {st.status && <ToneText status={st.status} />}
              {st.disclosure && <Disclosure sections={st.disclosure.sections} summary={st.disclosure.summary} />}
            </span>
          ) : undefined,
      }))}
    />
  );
}

type CompareSection = Extract<AnswerSection, { type: "compare" }>;

function CompareValue({ it }: { it: CompareSection["items"][number] }) {
  return (
    <Figure caption={it.detail} className="bg-transparent p-0" label={it.label} value={it.value}>
      {(it.source || it.system) && (
        <span className="inline-flex items-center gap-1.5 text-meta text-on-surface-variant">
          <Logo system={it.system} size={14} />
          {it.source ?? it.system}
        </span>
      )}
      {it.status && <ToneText status={it.status} />}
    </Figure>
  );
}

/**
 * Values side by side in one card, the relation on the divider between them: → a change,
 * vs a comparison, ≠ a conflict (the card is ringed in amber and says "Needs a decision").
 * More than two values sit in columns with the same divider.
 */
export function CompareWidget({ relation = "vs", items, footer }: Pick<CompareSection, "relation" | "items" | "footer">) {
  const conflict = relation === "≠";
  // Inside a block the block is the card (and carries the amber ring); on its own it draws one.
  const own = useAnswer().depth === 0;
  const glyphLabel = relation === "≠" ? "does not match" : relation === "→" ? "changes to" : "compared with";
  return (
    <div className={cn("flex flex-col gap-3", own && "rounded-lg border bg-card p-4", own && (conflict ? "border-warning" : "border-transparent"))} data-slot="compare-widget">
      {conflict && <ToneText status={{ text: "Needs a decision", tone: "attention" }} />}
      <div className={cn("grid gap-4", items.length === 2 ? "@md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]" : "@md:grid-cols-2 @2xl:grid-cols-3")}>
        {items.map((it, i) => (
          <div className="contents" key={`${it.label}-${i}`}>
            {i > 0 && items.length === 2 && (
              <div className="relative flex justify-center @max-md:h-7 @max-md:items-center @md:items-start @md:pt-6">
                <span aria-hidden className="absolute bg-outline-variant @max-md:inset-x-0 @max-md:top-1/2 @max-md:h-px @md:inset-y-0 @md:left-1/2 @md:w-px" />
                <span
                  aria-label={glyphLabel}
                  className={cn(
                    "relative inline-flex size-7 items-center justify-center rounded-full border bg-card text-sm",
                    conflict ? "border-warning text-on-warning-container" : "border-outline-variant text-on-surface-variant"
                  )}
                  role="img"
                >
                  {relation === "→" ? <ArrowRightIcon aria-hidden className="size-3.5 rotate-90 @md:rotate-0" /> : relation}
                </span>
              </div>
            )}
            <CompareValue it={it} />
          </div>
        ))}
      </div>
      {footer && <p data-meta="footnote" className="border-t border-outline-faint pt-3 text-meta text-on-surface-variant">{footer}</p>}
    </div>
  );
}

type FlowSection = Extract<AnswerSection, { type: "flow" }>;

/** How something moves between systems or people, in order: Lark action cards with arrows between. */
export function FlowWidget({ nodes }: Pick<FlowSection, "nodes">) {
  return (
    <ol className="flex flex-col gap-2 @2xl:flex-row @2xl:items-stretch" data-slot="flow-widget">
      {nodes.map((n, i) => (
        <li className="flex flex-col gap-2 @2xl:flex-1 @2xl:flex-row @2xl:items-stretch" key={`${n.label}-${i}`}>
          <ActionCard
            className="flex-1"
            description={n.detail}
            icon={n.system ? <ServiceLogo service={n.system} size={16} /> : undefined}
            meta={n.status ? <ToneText status={n.status} /> : undefined}
            title={n.label}
            tone="neutral"
          />
          {i < nodes.length - 1 && <ArrowRightIcon aria-hidden className="mx-auto size-4 shrink-0 rotate-90 text-on-surface-variant @2xl:mt-5 @2xl:rotate-0" />}
        </li>
      ))}
    </ol>
  );
}

/** Someone's words: who said it and where on top, then the words, in a card. */
export function QuoteWidget({ text, attribution, system }: { text: string; attribution?: string; system?: string }) {
  const [who, ...rest] = (attribution ?? "").split(",");
  const own = useAnswer().depth === 0;
  return (
    <figure className={cn("flex flex-col gap-2.5", own && "rounded-lg bg-card p-4")} data-slot="quote-widget">
      {attribution && (
        <figcaption className="flex flex-wrap items-center gap-2 text-meta text-on-surface-variant">
          <PersonAvatar name={who.trim()} size="sm" />
          <span className="text-on-surface">{who.trim()}</span>
          {rest.length > 0 && <span>{rest.join(",").trim()}</span>}
          {system && (
            <span className="ml-auto inline-flex items-center gap-1.5">
              <ServiceLogo service={system} size={14} />
              {system}
            </span>
          )}
        </figcaption>
      )}
      <blockquote className="text-sm text-on-surface">&ldquo;{text}&rdquo;</blockquote>
    </figure>
  );
}

const NOTE_TONE: Record<AnswerTone, "info" | "positive" | "caution" | "critical"> = { neutral: "info", progress: "info", positive: "positive", attention: "caution", critical: "critical" };

/** A note: neutral notes are a quiet panel; attention and critical are ringed across the full row. */
export function NoteWidget({ text, tone = "neutral", title }: { text: string; tone?: AnswerTone; title?: string }) {
  return (
    <Callout title={title} tone={NOTE_TONE[tone]}>
      {text}
    </Callout>
  );
}

type QuestionSection = Extract<AnswerSection, { type: "question" }>;

/** A question ACE will ask someone, where, and the answers to pick: Lark's ClarifyQuestion. */
export function QuestionWidget({ prompt, addressee, channel, options }: Omit<QuestionSection, "type">) {
  const [state, setState] = useState<"open" | "answered">("open");
  const [answer, setAnswer] = useState<string | undefined>(() => options.find((o) => o.selected)?.label);
  return (
    <ClarifyQuestion
      addressee={addressee ? { name: addressee.name, role: addressee.role } : undefined}
      answer={answer}
      channel={channel}
      onAnswer={(v) => {
        setAnswer(v);
        setState("answered");
      }}
      options={options.map((o) => o.label)}
      prompt={prompt}
      state={state}
    />
  );
}

function FieldControl({ f }: { f: AnswerField }) {
  const [seg, setSeg] = useState(f.value ?? f.options?.[0] ?? "");
  const [checked, setChecked] = useState(!!f.checked);
  const id = useId();
  switch (f.kind) {
    case "textarea":
      return <ContainedTextarea className="@lg:col-span-2" defaultValue={f.value} description={f.help} label={f.label} placeholder={f.placeholder} readOnly={f.readonly} />;
    case "select":
      return (
        <ContainedField description={f.help} label={f.label} suffix={<ChevronRightIcon aria-hidden className="size-4 rotate-90" />}>
          {(c) => (
            <select {...c} className={cn(c.className, "h-6 cursor-pointer appearance-none")} defaultValue={f.value} disabled={f.readonly}>
              {(f.options ?? []).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          )}
        </ContainedField>
      );
    case "segmented":
      return (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-label-lg text-on-surface-variant">{f.label}</legend>
          <Segmented aria-label={f.label} onValueChange={setSeg} options={(f.options ?? []).map((o) => ({ value: o, label: o }))} value={seg} />
          {f.help && <p className="text-body-md text-on-surface-variant">{f.help}</p>}
        </fieldset>
      );
    case "radio":
      return (
        <fieldset className="flex flex-col gap-1.5 @lg:col-span-2">
          <legend className="mb-1.5 text-label-lg text-on-surface-variant">{f.label}</legend>
          <RadioGroup aria-label={f.label} defaultValue={f.value} disabled={f.readonly}>
            {(f.options ?? []).map((o) => (
              <label className="flex cursor-pointer items-start gap-2.5 text-sm" key={o}>
                <RadioGroupItem className="mt-0.5" value={o} />
                {o}
              </label>
            ))}
          </RadioGroup>
          {f.help && <p className="text-body-md text-on-surface-variant">{f.help}</p>}
        </fieldset>
      );
    case "checkbox":
      return (
        <div className="flex items-start gap-2.5 @lg:col-span-2">
          <Checkbox aria-describedby={f.help ? `${id}-h` : undefined} checked={checked} className="mt-0.5" disabled={f.readonly} id={id} onCheckedChange={(v) => setChecked(!!v)} />
          <div className="flex flex-col gap-0.5">
            <label className="text-sm" htmlFor={id}>
              {f.label}
            </label>
            {f.help && (
              <p className="text-body-md text-on-surface-variant" id={`${id}-h`}>
                {f.help}
              </p>
            )}
          </div>
        </div>
      );
    case "file":
      return (
        <div className="flex flex-col gap-1.5 @lg:col-span-2">
          <span className="text-label-lg text-on-surface-variant">{f.label}</span>
          <FileDropzone hint={f.help} onFiles={() => {}} />
        </div>
      );
    default:
      return (
        <ContainedInput
          defaultValue={f.value}
          description={f.help}
          label={f.label}
          placeholder={f.placeholder}
          readOnly={f.readonly}
          type={f.kind === "number" ? "number" : f.kind === "date" ? "date" : f.kind === "search" ? "search" : "text"}
        />
      );
  }
}

/** A short form ACE prepared (fields filled where it could), with its submit in an action tray. */
export function FormWidget({ fields, submit }: { fields: AnswerField[]; submit?: { label: string; effect?: AnswerEffect } }) {
  return (
    <div className="flex flex-col gap-3" data-slot="form-widget">
      <div className="grid gap-3 @lg:grid-cols-2">
        {fields.map((f) => (
          <FieldControl f={f} key={f.label} />
        ))}
      </div>
      {submit && <ActionTray actions={[{ label: submit.label, primary: true, effect: submit.effect }]} />}
    </div>
  );
}

type DraftSection = Extract<AnswerSection, { type: "draft" }>;

/** A message ACE drafted in Outlook or Slack: editable body, fields, the thread it belongs to. */
export function DraftWidget(d: Omit<DraftSection, "type"> & { sendActions?: AnswerAction[]; sendNote?: string }) {
  const [status, setStatus] = useState(d.status);
  const [msg, setMsg] = useState("");
  const [openMail, setOpenMail] = useState<number | null>(null);
  const [showMail, setShowMail] = useState(!!d.mailOpen);
  const run = useRunEffect();
  const bodyId = useId();
  const press = (label: string) => run(d.effects?.[label], { message: setMsg, status: setStatus });
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card" data-slot="draft-widget">
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant bg-surface-container-low px-3.5 py-2 text-body-md">
        <ServiceLogo service={d.app} size={16} />
        <span className="text-label-lg text-on-surface">{d.heading ?? `Draft in ${d.app}`}</span>
        {status && <ToneText className="ml-auto" status={status} />}
      </div>
      {d.toolbar?.length ? (
        <div aria-label="Draft tools" className="flex flex-wrap gap-1 border-b border-outline-faint px-2 py-1" role="toolbar">
          {d.toolbar.map((t) => (
            <Button aria-label={t === "B" ? "Bold" : t === "I" ? "Italic" : undefined} className={cn(t === "B" && "font-semibold", t === "I" && "italic")} key={t} onClick={() => (t === "Conversation" ? setShowMail(!showMail) : press(t))} size="xs" variant="ghost">
              {t}
            </Button>
          ))}
        </div>
      ) : null}
      {d.fields?.length ? (
        <dl className="grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1.5 border-b border-outline-faint px-3.5 py-2.5 text-sm">
          {d.fields.map((f) => (
            <div className="contents" key={f.label}>
              <dt className="text-on-surface-variant">{f.label}</dt>
              <dd className="flex flex-wrap items-center gap-2">
                {f.value}
                {f.status && <ToneText status={f.status} />}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      <label className="sr-only" htmlFor={bodyId}>
        Message body
      </label>
      <textarea className="min-h-32 w-full resize-y bg-transparent px-3.5 py-3 text-sm text-on-surface outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" defaultValue={d.body.join("\n\n")} id={bodyId} placeholder={d.placeholder} />
      {d.footer?.length ? (
        <div className="flex flex-col gap-0.5 border-t border-outline-faint px-3.5 py-2 text-meta text-on-surface-variant">
          {d.footer.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      ) : null}
      {d.buttons?.length ? (
        <div className="flex flex-wrap gap-2 border-t border-outline-faint px-3.5 py-2">
          {d.buttons.map((b) => (
            <Button key={b} onClick={() => press(b)} size="sm" variant="secondary">
              {b}
            </Button>
          ))}
        </div>
      ) : null}
      {d.mail?.length && showMail ? (
        <ul aria-label="Conversation" className="flex flex-col border-t border-outline-variant">
          {d.mail.map((m, i) => (
            <li className="border-b border-outline-faint last:border-0" key={`${m.subject}-${i}`}>
              <button aria-expanded={openMail === i} className="focus-ring flex w-full items-start gap-2.5 px-3.5 py-2 text-left outline-none hover:bg-surface-container-low" onClick={() => setOpenMail(openMail === i ? null : i)} type="button">
                <PersonAvatar name={m.from} size="sm" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm">
                    {m.from}
                    {m.draft && <span className="text-on-surface-variant"> (draft)</span>}
                  </span>
                  <span className="text-body-md text-on-surface-variant">{m.subject}</span>
                </span>
                {m.when && <span className="shrink-0 text-meta text-on-surface-variant">{m.when}</span>}
              </button>
              {openMail === i && m.body && <p className="px-3.5 pb-3 pl-12 text-sm whitespace-pre-line">{m.body}</p>}
            </li>
          ))}
        </ul>
      ) : null}
      <p aria-live="polite" className={cn("px-3.5 pb-2 text-body-md", !msg && "sr-only")} role="status">
        {msg}
      </p>
      {d.sendActions?.length ? <ActionTray actions={d.sendActions} className="border-t border-outline-faint px-3.5 py-2.5" note={d.sendNote} /> : null}
    </div>
  );
}

/** Where to go next: Lark text links after an optional lead line. */
export function LinksWidget({ lead, leadStatus, links }: { lead?: string; leadStatus?: AnswerStatus; links: Array<{ label: string; href?: string; effect?: AnswerEffect }> }) {
  const run = useRunEffect();
  const [msg, setMsg] = useState("");
  const { onNavigate } = useAnswer();
  return (
    <div className="flex flex-col gap-2" data-slot="links-widget">
      {(lead || leadStatus) && (
        <p className="flex flex-col gap-0.5 text-sm">
          {lead}
          {leadStatus && <ToneText status={leadStatus} />}
        </p>
      )}
      <ul className="flex flex-col gap-1.5">
        {links.map((l) => (
          <li className="text-sm" key={l.label}>
            {l.href && !l.effect ? (
              <TextLink
                href={l.href}
                onClick={(e) => {
                  if (onNavigate && l.href!.startsWith("#/")) {
                    e.preventDefault();
                    onNavigate(l.href!);
                  }
                }}
              >
                {l.label}
              </TextLink>
            ) : (
              <button className="link-default focus-ring rounded-[2px] text-left outline-none" onClick={() => run(l.effect, { message: setMsg })} type="button">
                {l.label}
              </button>
            )}
          </li>
        ))}
      </ul>
      {msg && (
        <p className="text-body-md" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}

/** "Show N more": detail that opens in place. */
export function Disclosure({ summary, count, sections }: { summary: string; count?: number; sections: AnswerSection[] }) {
  const [open, setOpen] = useState(false);
  return (
    <CollapsiblePrimitive.Root onOpenChange={setOpen} open={open}>
      <CollapsiblePrimitive.Trigger asChild>
        <button className="focus-ring inline-flex min-h-8 w-fit items-center gap-1.5 rounded-sm text-label-lg text-on-surface outline-none hover:text-on-surface-variant" type="button">
          <ChevronRightIcon aria-hidden className={cn("size-4 transition-transform", open && "rotate-90")} />
          {summary}
          {count != null && <span className="text-on-surface-variant">({count})</span>}
        </button>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="pt-2 data-[state=closed]:hidden">
        <SectionList sections={sections} />
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

/** A few places to go: Lark action cards with their service. */
export function TilesWidget({ tiles }: { tiles: Array<{ title: string; detail?: string; href?: string; system?: string }> }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2" data-slot="tiles-widget">
      {tiles.map((t) => (
        <li className="flex" key={t.title}>
          <ActionCard className="flex-1" description={t.detail} href={t.href} icon={t.system ? <ServiceLogo service={t.system} size={16} /> : undefined} title={t.title} tone="neutral" />
        </li>
      ))}
    </ul>
  );
}

/** A picture with what it shows: a screenshot, a page from a document. */
export function MediaWidget({ alt, caption, heading, text, action, actionHref, system, src }: { alt: string; caption?: string; heading?: string; text?: string; action?: string; actionHref?: string; system?: string; src?: string }) {
  return (
    <figure className="flex flex-col gap-3 @2xl:flex-row @2xl:items-start" data-slot="media-widget">
      <div className="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container @2xl:w-1/2">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- app-provided media
          <img alt={alt} className="size-full object-cover" src={src} />
        ) : (
          <span aria-label={alt} className="flex flex-col items-center gap-2 p-4 text-center text-meta text-on-surface-variant" role="img">
            <ImageIcon aria-hidden className="size-6" />
            {system && <ServiceLogo service={system} size={16} />}
          </span>
        )}
      </div>
      {(heading || text || caption || action) && (
        <figcaption className="flex flex-col gap-1.5">
          {heading && <span className="text-label-lg">{heading}</span>}
          {text && <span className="text-sm">{text}</span>}
          {caption && <span className="text-meta text-on-surface-variant">{caption}</span>}
          {action &&
            (actionHref ? (
              <Button asChild className="w-fit" size="sm" variant="secondary">
                <a href={actionHref}>{action}</a>
              </Button>
            ) : (
              <Button className="w-fit" size="sm" variant="secondary">
                {action}
              </Button>
            ))}
        </figcaption>
      )}
    </figure>
  );
}

/** Rows that open their detail in place (one at a time). */
export function MasterWidget({ rows }: { rows: Array<AnswerRow & { inspect: AnswerSection[] }> }) {
  const [open, setOpen] = useState(rows.findIndex((r) => r.selected));
  return (
    <ul className="flex flex-col gap-1" data-slot="master-widget">
      {rows.map((r, i) => (
        <li className={cn("rounded-lg", open === i && "bg-surface-container-low")} key={`${r.title}-${i}`}>
          <button aria-expanded={open === i} className="focus-ring flex w-full items-start gap-3 rounded-lg p-2 text-left outline-none hover:bg-surface-container-low" onClick={() => setOpen(open === i ? -1 : i)} type="button">
            <RowLeading row={r} />
            <RowBody row={r} />
            {r.value && <span className="shrink-0 text-sm tabular-nums">{r.value}</span>}
            <ChevronRightIcon aria-hidden className={cn("mt-0.5 size-4 shrink-0 text-on-surface-variant transition-transform", open === i && "rotate-90")} />
          </button>
          {open === i && (
            <div className="px-2 pt-1 pb-3 @md:pl-12">
              <SectionList sections={r.inspect} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

type MessageSection = Extract<AnswerSection, { type: "message" }>;

/** A message from one person to another through a service. */
export function MessageWidget({ channel, from, to, subject, text, status, when }: Omit<MessageSection, "type">) {
  return (
    <div className="flex flex-col gap-2.5" data-slot="message-widget">
      <p className="flex flex-wrap items-center gap-2 text-body-md text-on-surface-variant">
        <PersonAvatar name={from.name} size="sm" />
        <span className="text-on-surface">{from.name}</span>
        <ArrowRightIcon aria-label="to" className="size-3.5" role="img" />
        <PersonAvatar name={to.name} size="sm" />
        <span className="text-on-surface">{to.name}</span>
        <span className="inline-flex items-center gap-1.5">
          via <ServiceLogo service={channel} size={14} /> {channel}
        </span>
        {when && <span className="ml-auto">{when}</span>}
      </p>
      {subject && <p className="text-label-lg">{subject}</p>}
      <p className="text-sm whitespace-pre-line">{text}</p>
      {status && <ToneText status={status} />}
    </div>
  );
}

/* ================================================================ renderer */

/** Whether a section has nothing to show (its data arrived empty). */
export function isEmptySection(s: AnswerSection): boolean {
  switch (s.type) {
    case "text":
      return !s.paragraphs?.some((p) => p.trim());
    case "stats":
      return !s.items?.length;
    case "properties":
    case "list":
    case "table":
    case "master":
      return !s.rows?.length;
    case "options":
      return !s.options?.length;
    case "chart":
      return !s.data?.length || !s.series?.length;
    case "bars":
      return !s.bars?.length;
    case "timeline":
      return !s.lanes?.length;
    case "waterfall":
    case "steps":
      return !s.steps?.length;
    case "compare":
      return !s.items?.length;
    case "flow":
      return !s.nodes?.length;
    case "links":
      return !s.links?.length && !s.lead;
    case "tiles":
      return !s.tiles?.length;
    case "group":
    case "disclosure":
      return !s.sections?.length;
    case "form":
      return !s.fields?.length;
    case "quote":
    case "note":
    case "message":
      return !s.text?.trim();
    case "question":
      return !s.prompt?.trim();
    default:
      return false;
  }
}

/** One section, in its frame. Hidden sections render once revealed; empty ones say so under their title. */
export function AnswerSectionView({ section: s }: { section: AnswerSection }) {
  const { revealed } = useAnswer();
  if (s.hidden && !(s.id && revealed.has(s.id))) return null;
  if (isEmptySection(s)) {
    if (!s.title) return null;
    return (
      <AnswerBlock intro={s.intro} meta={s.meta} title={s.title}>
        <p className="text-sm text-on-surface-variant">Nothing to show. The records ACE checked had no entries for this.</p>
      </AnswerBlock>
    );
  }
  const frame = (children: ReactNode, bare?: boolean) => (
    <AnswerBlock actions={s.actions} actionsNote={s.actionsNote} bare={bare} intro={s.intro} meta={s.meta} title={s.title}>
      {children}
    </AnswerBlock>
  );
  switch (s.type) {
    case "text":
      return frame(
        <div className="flex flex-col gap-2 text-sm text-on-surface">
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>,
        true
      );
    case "stats":
      return frame(<StatsWidget display={s.display} items={s.items} />, true);
    case "properties":
      return frame(<PropertiesWidget display={s.display} rows={s.rows} />);
    case "list":
      return frame(<ListWidget name={s.title} ordered={s.ordered} rows={s.rows} selectable={s.selectable} />);
    case "options":
      return frame(<OptionsWidget label={s.title} name={s.name} options={s.options} variant={s.variant} />, true);
    case "table":
      return frame(<TableWidget caption={s.title} columns={s.columns} rows={s.rows} selectable={s.selectable} />);
    case "chart": {
      const { type: _t, ...rest } = s;
      void _t;
      return frame(<ChartWidget {...rest} label={s.title} />);
    }
    case "bars":
      return frame(<BarsWidget bars={s.bars} data={s.data} label={s.title} max={s.max} reference={s.reference} selected={s.selected} />);
    case "timeline":
      return frame(<TimelineWidget axis={s.axis} headers={s.headers} lanes={s.lanes} span={s.span} />);
    case "waterfall":
      return frame(<WaterfallWidget max={s.max} steps={s.steps} />);
    case "steps":
      return frame(<StepsWidget steps={s.steps} />);
    case "compare":
      return (
        <AnswerBlock actions={s.actions} actionsNote={s.actionsNote} className={cn(s.relation === "≠" && "border-warning")} intro={s.intro} meta={s.meta} title={s.title}>
          <CompareWidget footer={s.footer} items={s.items} relation={s.relation} />
        </AnswerBlock>
      );
    case "flow":
      return frame(<FlowWidget nodes={s.nodes} />, true);
    case "quote":
      return frame(<QuoteWidget attribution={s.attribution} system={s.system} text={s.text} />);
    case "note":
      return frame(<NoteWidget text={s.text} tone={s.tone} />, true);
    case "question":
      return (
        <AnswerBlock intro={s.intro} meta={s.meta} title={s.title}>
          <QuestionWidget addressee={s.addressee} channel={s.channel} name={s.name} options={s.options} prompt={s.prompt} />
        </AnswerBlock>
      );
    case "form":
      return frame(<FormWidget fields={s.fields} submit={s.submit} />);
    case "draft": {
      const { type: _t, actions, actionsNote, ...rest } = s;
      void _t;
      return (
        <AnswerBlock bare intro={s.intro} meta={s.meta} title={s.title}>
          <DraftWidget {...rest} sendActions={actions} sendNote={actionsNote} />
        </AnswerBlock>
      );
    }
    case "links":
      return frame(<LinksWidget lead={s.lead} leadStatus={s.leadStatus} links={s.links} />);
    case "disclosure":
      return frame(<Disclosure count={s.count} sections={s.sections} summary={s.summary} />, true);
    case "tiles":
      return frame(<TilesWidget tiles={s.tiles} />, true);
    case "media":
      return frame(<MediaWidget action={s.action} actionHref={s.actionHref} alt={s.alt} caption={s.caption} heading={s.heading} src={s.src} system={s.system} text={s.text} />);
    case "group":
      return frame(
        <div className={cn("grid gap-3", s.columns === 2 && "@xl:grid-cols-2", s.columns === 3 && "@xl:grid-cols-2 @3xl:grid-cols-3")}>
          {s.sections.map((c, i) => (
            <AnswerSectionView key={i} section={c} />
          ))}
        </div>
      );
    case "master":
      return frame(<MasterWidget rows={s.rows} />);
    case "message":
      return frame(<MessageWidget channel={s.channel} from={s.from} subject={s.subject} status={s.status} text={s.text} to={s.to} when={s.when} />);
    default: {
      const unknown: never = s;
      void unknown;
      return null;
    }
  }
}

/** Sections in order (used for nested content: disclosures, table and master detail). */
export function SectionList({ sections }: { sections: AnswerSection[] }) {
  return (
    <div className="flex flex-col gap-3">
      {sections.map((s, i) => (
        <AnswerSectionView key={i} section={s} />
      ))}
    </div>
  );
}

const BENTO: Record<number, string> = { 2: "@2xl:col-span-2", 3: "@2xl:col-span-3", 4: "@2xl:col-span-4", 6: "@2xl:col-span-6" };

function Body({ sections = [], aside, layout = "stack" }: { sections?: AnswerSection[]; aside?: AnswerSection[]; layout?: AnswerDoc["layout"] }) {
  const main =
    layout === "bento" ? (
      <div className="grid gap-3 @2xl:grid-cols-6">
        {sections.map((s, i) => (
          <div className={cn("flex min-w-0 flex-col [&>section]:h-full", BENTO[s.cols ?? 6])} key={i}>
            <AnswerSectionView section={s} />
          </div>
        ))}
      </div>
    ) : (
      <SectionList sections={sections} />
    );
  if (!aside?.length) return main;
  return (
    <div className="grid gap-3 @3xl:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] @3xl:items-start">
      {main}
      <div className="flex flex-col gap-3 @3xl:sticky @3xl:top-2" data-slot="answer-aside">
        {aside.map((s, i) => (
          <AnswerSectionView key={i} section={s} />
        ))}
      </div>
    </div>
  );
}

/**
 * ACE's answer as an inline dashboard: header, key figures, body (stack, split or bento, or tabs),
 * notices, the next step and the sources. Lays out by its own width, so the same answer works in
 * the full-page chat and the side panel.
 */
export function AnswerView({
  doc,
  onNavigate,
  onOpenSystem,
  level = 3,
  className,
}: {
  doc: AnswerDoc;
  /** Called for in-app links ("#/…") and navigation effects. */
  onNavigate?: (href: string) => void;
  /** Opens the record or system the answer is about (deal tag, "open in Salesforce" effects). */
  onOpenSystem?: () => void;
  /** Heading level of the headline: 2 in a full-page chat under the h1, 3 (default) under a panel's h2. */
  level?: 2 | 3;
  className?: string;
}) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [variant, setVariant] = useState<string | null>(null);
  const headId = useId();
  const d: AnswerDoc = useMemo(() => (variant && doc.variants?.[variant] ? { ...doc, ...doc.variants[variant] } : doc), [doc, variant]);
  const ctx: AnswerCtx = {
    revealed,
    reveal: (id) => setRevealed((s) => new Set(s).add(id)),
    onNavigate,
    onOpenSystem,
    chooseVariant: (k) => setVariant(k),
    depth: 0,
    level: (level + 1) as AnswerCtx["level"],
  };
  const H = `h${level}` as "h3";
  const sources: ChatSource[] | undefined = d.sources?.items.map((s, i) => ({
    id: `${i}-${s.label}`,
    label: s.label,
    system: s.system,
    usedFor: s.role,
    meta: s.detail,
    excerpt: s.excerpt,
  }));
  return (
    <Ctx.Provider value={ctx}>
      <article aria-labelledby={headId} className={cn("@container flex min-w-0 flex-col gap-3 rounded-2xl bg-inset p-3 wrap-break-word", className)} data-slot="answer">
        <header className="flex flex-col gap-1.5 px-1 pt-1 pb-1">
          {d.tag && (
            <button
              className="focus-ring state-layer [--state-hover:0.04] mb-1 inline-flex h-7 w-fit max-w-full items-center gap-2 rounded-md border border-outline-variant bg-card pr-2.5 pl-1 text-body-md outline-none"
              onClick={onOpenSystem}
              type="button"
            >
              <CompanyLogo name={d.tag.label} size="xs" src={d.tag.logo} />
              <span className="text-on-surface">{d.tag.label}</span>
              {d.tag.detail && <span className="text-on-surface-variant">{d.tag.detail}</span>}
            </button>
          )}
          <H className="text-title-sm text-on-surface @lg:text-title-md" id={headId}>
            {d.headline}
          </H>
          {(d.context?.text || (d.context?.status && !d.actions?.length)) && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-md text-on-surface-variant">
              {d.context?.text}
              {d.context?.status && !d.actions?.length && <ToneText status={d.context.status} />}
            </p>
          )}
          {d.lead && <p className="max-w-[70ch] text-sm text-on-surface">{d.lead}</p>}
        </header>

        {d.stats?.length ? (
          <StatsWidget display={d.statsDisplay} items={d.stats} />
        ) : null}

        {d.sections?.length || (d.aside?.length && !d.tabs?.length) ? <Body aside={d.tabs?.length ? undefined : d.aside} layout={d.layout} sections={d.sections} /> : null}

        {d.tabs?.length ? (
          <Tabs defaultValue="0">
            <TabsList aria-label={`${d.headline}: views`} className="mx-1 max-w-[calc(100%-0.5rem)]" variant="segmented">
              {d.tabs.map((t, i) => (
                <TabsTrigger key={t.label} value={String(i)}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {d.tabs.map((t, i) => (
              <TabsContent className="flex flex-col gap-3 pt-3" key={t.label} value={String(i)}>
                {t.meta && <p data-meta="meta" className="px-1 text-meta text-on-surface-variant">{t.meta}</p>}
                <Body aside={t.aside} layout={d.layout} sections={t.sections} />
              </TabsContent>
            ))}
          </Tabs>
        ) : null}


        {d.after?.length ? <SectionList sections={d.after} /> : null}

        {d.actions?.length ? (
          <div className="rounded-lg bg-card p-3 @md:px-4">
            <ActionTray actions={d.actions} prompt={d.prompt} status={d.context?.status} />
          </div>
        ) : d.prompt ? (
          <p className="px-1 text-sm text-on-surface">{d.prompt}</p>
        ) : null}

        {sources?.length ? (
          <AnswerSources className="rounded-lg bg-card" collapsible label={d.sources?.label ?? "Sources"} sources={sources} />
        ) : null}
      </article>
    </Ctx.Provider>
  );
}

/**
 * A widget outside a full answer (docs, a card on a page): the answer's stone surface and the
 * context widgets need (reveal, navigation), without the header and footer.
 */
export function AnswerSurface({ children, onNavigate, onOpenSystem, className }: { children: ReactNode; onNavigate?: (href: string) => void; onOpenSystem?: () => void; className?: string }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  return (
    <Ctx.Provider value={{ revealed, reveal: (id) => setRevealed((s) => new Set(s).add(id)), onNavigate, onOpenSystem, chooseVariant: () => {}, depth: 0, level: 4 }}>
      <div className={cn("@container flex min-w-0 flex-col gap-3 rounded-2xl bg-inset p-3 wrap-break-word", className)} data-slot="answer-surface">
        {children}
      </div>
    </Ctx.Provider>
  );
}

/**
 * While ACE builds an answer: the answer's shape in placeholders (headline, figures, a card), so
 * the thread doesn't jump when it arrives. Announced once as busy; pulses only without reduced motion.
 */
export function AnswerSkeleton({ label = "ACE is preparing the answer", className }: { label?: string; className?: string }) {
  return (
    <div aria-busy="true" className={cn("flex min-w-0 flex-col gap-3 rounded-2xl bg-inset p-3", className)} data-slot="answer-skeleton" role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden className="flex flex-col gap-2 px-1 pt-1 [&_[data-slot=skeleton]]:motion-reduce:animate-none">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
      <div aria-hidden className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-edge bg-outline-variant [&_[data-slot=skeleton]]:motion-reduce:animate-none">
        {[0, 1, 2].map((i) => (
          <div className="flex flex-col gap-2 bg-card p-4" key={i}>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
      <div aria-hidden className="flex flex-col gap-3 rounded-lg bg-card p-4 [&_[data-slot=skeleton]]:motion-reduce:animate-none">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}
