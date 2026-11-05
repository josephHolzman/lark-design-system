"use client";

import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { Collapsible as CollapsiblePrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode, useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LarkLink as Link } from "./provider";

/* ================================================================ SectionCard */

export type SectionCardProps = Omit<ComponentProps<"section">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  /** Right side of the header: buttons, a menu, a filter. */
  action?: ReactNode;
  /** Underline tabs or a segmented control on the header's bottom edge. */
  tabs?: ReactNode;
  footer?: ReactNode;
  /** Remove body padding for tables and lists that run edge to edge. */
  flush?: boolean;
  /** Heading level for the title (h2 on a page, h3 inside a drawer). */
  as?: "h2" | "h3" | "h4";
  /** Adds a collapse toggle (Beams' record-page cards). Uncontrolled unless `open` is set. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Shown next to the title when collapsed, e.g. "3 open". */
  collapsedSummary?: ReactNode;
};

/**
 * Beams section card: white, radius 12, ink 8% edge, no shadow. Title 16/24 at a 16px
 * inset; actions right; optional tabs on the header edge; collapsible like Apollo's
 * record cards (the toggle is a real button with aria-expanded and aria-controls).
 */
export function SectionCard({
  title,
  description,
  action,
  tabs,
  footer,
  flush,
  as: H = "h2",
  collapsible,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  collapsedSummary,
  className,
  children,
  ...props
}: SectionCardProps) {
  const id = useId();
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = (o: boolean) => {
    setOpenState(o);
    onOpenChange?.(o);
  };

  const header = (
    <header className="flex flex-wrap items-start gap-x-3 gap-y-2 px-4 pt-3 pb-3">
      <div className="flex min-w-[min(12rem,100%)] flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <H className="text-title-sm" id={id}>
            {title}
          </H>
          {collapsible && !open && collapsedSummary && (
            <span className="text-body-sm text-on-surface-variant">{collapsedSummary}</span>
          )}
        </div>
        {description && open && <p className="text-body-sm text-on-surface-variant">{description}</p>}
      </div>
      {(action || collapsible) && (
        <div className="-my-0.5 flex shrink-0 items-center gap-1">
          {open && action}
          {collapsible && (
            <CollapsiblePrimitive.Trigger asChild>
              <Button aria-label={open ? "Collapse section" : "Expand section"} size="icon-sm" variant="ghost">
                <ChevronDownIcon className={cn("transition-transform", !open && "-rotate-90")} />
              </Button>
            </CollapsiblePrimitive.Trigger>
          )}
        </div>
      )}
    </header>
  );

  const body = (
    <>
      {tabs && <div className="border-b border-outline-variant px-4">{tabs}</div>}
      <div className={cn("flex min-w-0 flex-1 flex-col", !flush && "px-4 pb-4", tabs && !flush && "pt-4")}>{children}</div>
      {footer && (
        <footer className="flex items-center gap-2 border-t border-outline-variant px-4 py-2.5 text-body-sm text-on-surface-variant">
          {footer}
        </footer>
      )}
    </>
  );

  const cls = cn(
    "flex min-w-0 flex-col overflow-hidden rounded-lg border border-outline-variant bg-card text-card-foreground",
    className
  );

  if (!collapsible) {
    return (
      <section aria-labelledby={id} className={cls} data-slot="section-card" {...props}>
        {header}
        {body}
      </section>
    );
  }
  return (
    <CollapsiblePrimitive.Root asChild onOpenChange={setOpen} open={open}>
      <section aria-labelledby={id} className={cls} data-slot="section-card" data-state={open ? "open" : "closed"} {...props}>
        {header}
        <CollapsiblePrimitive.Content className="flex min-w-0 flex-col data-[state=closed]:hidden">{body}</CollapsiblePrimitive.Content>
      </section>
    </CollapsiblePrimitive.Root>
  );
}

/* ================================================================ IconChip */

const CHIP = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  ai: "bg-tertiary-container text-on-tertiary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  success: "bg-success-container text-on-success-container",
  warning: "bg-warning-container text-on-warning-container",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
} as const;

export type ChipTone = keyof typeof CHIP;
export type IconChipProps = ComponentProps<"span"> & { tone?: ChipTone; size?: "sm" | "md" | "lg" };

/** Beams' round tinted icon (24 / 32 / 40). Decorative. */
export function IconChip({ tone = "primary", size = "md", className, ...props }: IconChipProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        size === "sm" && "size-6 rounded-full [&_svg]:size-3.5",
        size === "md" && "size-8 rounded-full [&_svg]:size-4",
        size === "lg" && "size-10 rounded-full [&_svg]:size-5",
        CHIP[tone],
        className
      )}
      {...props}
    />
  );
}

/* ================================================================ ActionCard */

export type ActionCardProps = Omit<ComponentProps<"div">, "title"> & {
  icon?: ReactNode;
  tone?: ChipTone;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  /** A trailing button; or pass href to make the whole card a link. */
  action?: ReactNode;
  href?: string;
  /** Illustration slot above the content. */
  media?: ReactNode;
};

/**
 * Beams action card: white, hairline, 32px round tinted icon. For things to do next: ACE
 * task tiles, "Create dashboard", integrations. With href, the title is the link and its
 * ::after covers the card: one tab stop, still announced as a link.
 */
export function ActionCard({ icon, tone = "primary", title, description, meta, action, href, media, className, ...props }: ActionCardProps) {
  return (
    <div
      className={cn(
        "group/action relative flex min-w-0 flex-col gap-3 rounded-lg border border-outline-variant bg-card p-3 text-on-surface",
        href && "state-layer [--state-hover:0.03] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring",
        className
      )}
      data-slot="action-card"
      {...props}
    >
      {media}
      <div className="flex items-start gap-3">
        {icon && <IconChip tone={tone}>{icon}</IconChip>}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="text-label-lg">
            {href ? (
              <Link className="outline-none after:absolute after:inset-0 after:content-['']" href={href}>
                {title}
              </Link>
            ) : (
              title
            )}
          </div>
          {description && <p className="text-body-sm text-on-surface-variant">{description}</p>}
          {meta && <div className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">{meta}</div>}
        </div>
        {action && <div className="relative z-10 shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/* ================================================================ TemplateCard */

export type TemplateCardProps = {
  /** Category badges first (stable hue per category), then "AI" if made by AI. */
  tags?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  href?: string;
  onSelect?: () => void;
  selected?: boolean;
  className?: string;
};

/**
 * Apollo's workflow-template card: tags, a 16px title, a two-line description, and the
 * whole card is the control (a link or a button, so its accessible name is the title,
 * not "Template"). Selected uses the tan fill and edge.
 */
export function TemplateCard({ tags, title, description, footer, href, onSelect, selected, className }: TemplateCardProps) {
  const content = (
    <>
      {tags && <span className="flex flex-wrap gap-1">{tags}</span>}
      <span className="text-title-sm">{title}</span>
      {description && <span className="line-clamp-2 text-body-sm text-on-surface-variant">{description}</span>}
    </>
  );
  const cls = cn(
    "state-layer [--state-hover:0.03] focus-ring relative flex h-full min-w-0 flex-col items-start gap-1.5 rounded-lg border p-3 text-left text-on-surface outline-none",
    selected ? "border-selected-border bg-secondary-container" : "border-outline-variant bg-card"
  );
  return (
    <div className={cn("flex min-w-0 flex-col", className)} data-slot="template-card">
      {href ? (
        <Link aria-current={selected ? "true" : undefined} className={cls} href={href}>
          {content}
        </Link>
      ) : (
        <button aria-pressed={selected} className={cls} onClick={onSelect} type="button">
          {content}
        </button>
      )}
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}

/* ================================================================ ChecklistCard */

export type ChecklistItem = { id: string; title: ReactNode; description?: ReactNode; done?: boolean; action?: ReactNode };

/**
 * Apollo Home's onboarding checklist: title 22/28, a reward badge, "2 of 6 completed",
 * collapsible, 64px rows each with one action (only the first open item gets the primary
 * button). The one card in Beams with a resting shadow.
 */
export function ChecklistCard({
  title,
  description,
  reward,
  items,
  defaultOpen = true,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  reward?: ReactNode;
  items: ChecklistItem[];
  defaultOpen?: boolean;
  className?: string;
}) {
  const done = items.filter((i) => i.done).length;
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <CollapsiblePrimitive.Root asChild onOpenChange={setOpen} open={open}>
      <section aria-labelledby={id} className={cn("rounded-lg border border-outline-variant bg-card shadow-raised", className)}>
        <header className="flex items-start gap-3 p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-title-md" id={id}>
                {title}
              </h2>
              {reward}
            </div>
            {description && <p className="text-sm text-on-surface-variant">{description}</p>}
          </div>
          <span className="pt-1 text-body-sm whitespace-nowrap text-on-surface-variant tabular-nums">
            {done} of {items.length} completed
          </span>
          <CollapsiblePrimitive.Trigger asChild>
            <Button aria-label={open ? "Collapse checklist" : "Expand checklist"} size="icon-sm" variant="ghost">
              <ChevronDownIcon className={cn("transition-transform", !open && "-rotate-90")} />
            </Button>
          </CollapsiblePrimitive.Trigger>
        </header>
        <CollapsiblePrimitive.Content className="data-[state=closed]:hidden">
          <ol className="divide-y divide-outline-variant border-t border-outline-variant">
            {items.map((it) => (
              <li className="flex min-h-16 items-center gap-3 px-5 py-3" key={it.id}>
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex size-5 shrink-0 items-center justify-center rounded-sm border",
                    it.done ? "border-on-surface bg-on-surface text-surface" : "border-outline"
                  )}
                >
                  {it.done && <CheckIcon className="size-3.5" strokeWidth={3} />}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={cn("text-sm", it.done && "text-on-surface-variant line-through decoration-outline")}>
                    {it.title}
                    <span className="sr-only">{it.done ? ", done" : ", not done"}</span>
                  </span>
                  {it.description && <span className="text-body-sm text-on-surface-variant">{it.description}</span>}
                </div>
                {!it.done && it.action}
              </li>
            ))}
          </ol>
        </CollapsiblePrimitive.Content>
      </section>
    </CollapsiblePrimitive.Root>
  );
}

/* ================================================================ ChoiceCard */

export type Choice = { value: string; label: ReactNode; description?: ReactNode; recommended?: boolean };

/**
 * The assistant's "Select one of the following" card: a bordered radio list, an optional
 * "Recommended" badge, and a Continue button that stays disabled until something is
 * chosen. After submitting, the card locks and shows the choice.
 */
export function ChoiceCard({
  prompt,
  choices,
  onSubmit,
  submitLabel = "Continue",
  className,
}: {
  prompt: ReactNode;
  choices: Choice[];
  onSubmit?: (value: string) => void;
  submitLabel?: string;
  className?: string;
}) {
  const [value, setValue] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const id = useId();
  return (
    <div className={cn("flex flex-col rounded-lg border border-outline-variant bg-card", className)} data-slot="choice-card">
      <p className="px-4 pt-3 text-body-sm text-on-surface-variant" id={id}>
        {prompt}
      </p>
      <RadioGroupPrimitive.Root
        aria-labelledby={id}
        className="flex flex-col gap-1 p-2"
        disabled={submitted}
        onValueChange={setValue}
        value={value}
      >
        {choices.map((c) => (
          <label
            className="state-layer [--state-hover:0.04] flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 has-[[data-disabled]]:cursor-default has-[[data-state=checked]]:bg-secondary-container"
            key={c.value}
          >
            <RadioGroupPrimitive.Item
              className="focus-ring mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-outline bg-surface-container-lowest data-[state=checked]:border-on-surface"
              value={c.value}
            >
              <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-on-surface" />
            </RadioGroupPrimitive.Item>
            <span className="flex min-w-0 flex-col">
              <span className="flex flex-wrap items-center gap-2 text-sm">
                {c.label}
                {c.recommended && <Badge variant="success">Recommended</Badge>}
              </span>
              {c.description && <span className="text-body-sm text-on-surface-variant">{c.description}</span>}
            </span>
          </label>
        ))}
      </RadioGroupPrimitive.Root>
      <div className="flex justify-end border-t border-outline-variant p-2">
        {submitted ? (
          <span className="flex items-center gap-1.5 px-2 py-1.5 text-body-sm text-on-surface-variant" role="status">
            <CheckIcon className="size-4" /> Sent
          </span>
        ) : (
          <Button
            disabled={!value}
            onClick={() => {
              setSubmitted(true);
              onSubmit?.(value);
            }}
            size="sm"
            variant="secondary"
          >
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ================================================================ PromoCard */

/**
 * In-page promotion (Apollo's "Get Apollo AI in Slack"): an inline card, never a floating
 * box over content. Dismissible; the dismiss button is labelled.
 */
export function PromoCard({
  title,
  description,
  action,
  media,
  onDismiss,
  tone = "default",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  media?: ReactNode;
  onDismiss?: () => void;
  tone?: "default" | "dark";
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "relative flex min-w-0 items-center gap-4 rounded-lg border p-3 pr-10",
        tone === "dark" ? "dark border-transparent bg-surface text-on-surface" : "border-outline-variant bg-card",
        className
      )}
      data-slot="promo-card"
    >
      {media && <div className="hidden shrink-0 overflow-hidden rounded-md sm:block">{media}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-label-lg">{title}</span>
        {description && <span className="text-body-sm text-on-surface-variant">{description}</span>}
        {action && <div className="mt-1">{action}</div>}
      </div>
      {onDismiss && (
        <Button aria-label="Dismiss" className="absolute top-2 right-2" onClick={onDismiss} size="icon-xs" variant="ghost">
          <XIcon />
        </Button>
      )}
    </aside>
  );
}

/* ================================================================ EntityCard */

/**
 * Record summary for hover cards, side peeks and search results: logo, name, meta, a few
 * facts and actions. Keep it to what helps decide whether to open the record.
 */
export function EntityCard({
  leading,
  name,
  meta,
  status,
  facts,
  actions,
  className,
}: {
  leading?: ReactNode;
  name: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  facts?: { label: ReactNode; value: ReactNode }[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)} data-slot="entity-card">
      <div className="flex items-start gap-3">
        {leading}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-title-sm">{name}</span>
            {status}
          </div>
          {meta && <span className="text-body-sm text-on-surface-variant">{meta}</span>}
        </div>
      </div>
      {facts && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {facts.map((f, i) => (
            <div className="contents" key={i}>
              <dt className="text-label-md text-on-surface-tertiary">{f.label}</dt>
              <dd className="min-w-0 truncate text-sm">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="flex flex-wrap justify-end gap-2">{actions}</div>}
    </div>
  );
}
