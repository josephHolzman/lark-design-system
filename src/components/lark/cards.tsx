"use client";

import { AlertTriangleIcon, ArrowRightIcon, CheckIcon, CircleAlertIcon, CircleCheckIcon, ChevronDownIcon, InfoIcon, StarIcon, UsersIcon, XIcon } from "lucide-react";
import { Collapsible as CollapsiblePrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode, useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Illustration, type IllustrationSpec } from "./illustration";
import { LarkLink as Link } from "./provider";

/* ================================================================ SectionCard */

export type SectionCardProps = Omit<ComponentProps<"section">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  /**
   * Right side of the header: controls only (an icon button or menu, a segmented control or
   * filter that changes this card's content). v0.6: no text buttons or links here; put the
   * card's action in `footer` and "see more" in `link`.
   */
  action?: ReactNode;
  /** v0.6: the card's way out ("View all deals"), rendered as a link at the end of the footer. */
  link?: { label: string; href: string };
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
  /**
   * What the collapse toggle names: "Collapse <label>" / "Expand <label>". Defaults to the
   * title when it's text, so several cards on a page don't share one name (WCAG 2.4.6).
   */
  collapseLabel?: string;
  /** Keep the header `action` while the card is closed (default: hidden with the body). */
  keepActionWhenClosed?: boolean;
  /**
   * "strip" (v0.6): the header sits in a 40px stone band with a hairline under it, so a page of
   * stacked sections (a quote's lines, terms, approvals) reads as separate parts. Not tan:
   * tan means selected.
   */
  variant?: "default" | "strip" | "feature" | "status";
  /**
   * v0.7. `feature`: iris (AI: an ACE answer, a recommendation) or sky (a decision the reader
   * makes). `status`: warning, error, success or info. A status module always shows its icon
   * tile and its title says the status, so the tint is never the only signal (WCAG 1.4.1).
   */
  tone?: "iris" | "sky" | "warning" | "error" | "success" | "info";
  /** v0.7: an icon in a 32px tile before the title. Status modules default to their status icon. */
  icon?: ReactNode;
  /** v0.8: a picture above the body when the module has no content yet. Decorative unless `alt`. */
  illustration?: IllustrationSpec;
};

const MODULE_TONE = {
  iris: { shell: "border-ai-border/40 bg-module-feature-iris", tile: "bg-tertiary-container text-on-tertiary-container" },
  sky: { shell: "border-primary/30 bg-module-feature-sky", tile: "bg-primary-container text-on-primary-container" },
  warning: { shell: "border-warning/50 bg-tint-ember", tile: "bg-warning-container text-on-warning-container" },
  error: { shell: "border-error/50 bg-tint-coral", tile: "bg-error-container text-on-error-container" },
  success: { shell: "border-success/50 bg-tint-evergreen", tile: "bg-success-container text-on-success-container" },
  info: { shell: "border-primary/30 bg-tint-sky", tile: "bg-primary-container text-on-primary-container" },
} as const;
const STATUS_ICON = { warning: AlertTriangleIcon, error: CircleAlertIcon, success: CircleCheckIcon, info: InfoIcon } as const;

/**
 * The module (v0.7): white (dusk-300 in dusk), radius --module-radius, 24px padding (16 when
 * the module is under 30rem or the viewport under 640), title at the module step (18 or 20,
 * see --module-title-size). The title says the module's job. Title 2 lines at most; actions right; optional tabs on the header edge; collapsible like Apollo's
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
  collapseLabel,
  keepActionWhenClosed,
  link,
  variant = "default",
  tone,
  icon,
  illustration,
  className,
  children,
  ...props
}: SectionCardProps) {
  const strip = variant === "strip";
  const id = useId();
  const toggleName = collapseLabel ?? (typeof title === "string" ? title.charAt(0).toLowerCase() + title.slice(1) : "section");
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = (o: boolean) => {
    setOpenState(o);
    onOpenChange?.(o);
  };

  const toneKey = tone ?? (variant === "feature" ? "iris" : variant === "status" ? "info" : undefined);
  const toned = toneKey && (variant === "feature" || variant === "status") ? MODULE_TONE[toneKey] : undefined;
  const StatusIcon = variant === "status" && toneKey && toneKey in STATUS_ICON ? STATUS_ICON[toneKey as keyof typeof STATUS_ICON] : undefined;
  const tileIcon = icon ?? (StatusIcon ? <StatusIcon /> : null);

  const header = (
    <header
      className={cn(
        "flex flex-wrap items-start gap-x-3 gap-y-2 px-module",
        strip ? "min-h-12 items-center border-b border-outline-variant bg-inset/60 py-3" : "pt-module pb-4",
        strip && collapsible && !open && "border-b-0"
      )}
    >
      {tileIcon && (
        <span
          aria-hidden="true"
          className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-md [&>svg]:size-4", toned?.tile ?? "bg-inset text-on-surface-variant")}
          data-slot="module-icon"
        >
          {tileIcon}
        </span>
      )}
      <div className="flex min-w-[min(12rem,100%)] flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-baseline gap-2">
          <H className="line-clamp-2 min-w-0 text-title-module text-on-surface [overflow-wrap:break-word]" id={id}>
            {title}
          </H>
          {collapsible && !open && collapsedSummary && (
            <span className="shrink-0 text-meta text-on-surface-variant">{collapsedSummary}</span>
          )}
        </div>
        {description && open && <p className="text-body-md text-on-surface-variant">{description}</p>}
      </div>
      {(action || collapsible) && (
        <div className="-my-0.5 flex shrink-0 items-center gap-1">
          {(open || keepActionWhenClosed) && action}
          {collapsible && (
            <CollapsiblePrimitive.Trigger asChild>
              <Button aria-label={`${open ? "Collapse" : "Expand"} ${toggleName}`} size="icon-sm" variant="ghost">
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
      {tabs && <div className="border-b border-outline-variant px-module">{tabs}</div>}
      <div className={cn("flex min-w-0 flex-1 flex-col", !flush && "px-module pb-module", (tabs || strip) && !flush && "pt-module")}>
        {illustration && !children && <Illustration {...illustration} className="mb-4" />}
        {children}
      </div>
      {(footer || link) && (
        <footer className="flex min-h-12 flex-wrap items-center gap-2 border-t border-outline-variant px-module py-3 text-body-md text-on-surface-variant">
          {footer}
          {link && <CardLink className={footer ? "ml-auto" : undefined} {...link} />}
        </footer>
      )}
    </>
  );

  const cls = cn(
    "lark-module flex min-w-0 flex-col overflow-hidden rounded-module border text-card-foreground",
    toned ? toned.shell : "border-edge bg-module",
    className
  );

  if (!collapsible) {
    return (
      <section aria-labelledby={id} className={cls} data-slot="section-card" data-tone={toned ? toneKey : undefined} data-variant={variant} {...props}>
        {header}
        {body}
      </section>
    );
  }
  return (
    <CollapsiblePrimitive.Root asChild onOpenChange={setOpen} open={open}>
      <section aria-labelledby={id} className={cls} data-slot="section-card" data-state={open ? "open" : "closed"} data-tone={toned ? toneKey : undefined} data-variant={variant} {...props}>
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
  coral: "bg-tint-coral-strong text-on-error-container",
} as const;

/** v0.6: solid tiles for an object's identity (an agent, an automation, a template). White glyph. */
const CHIP_SOLID = {
  primary: "bg-[var(--lark-sky-650)] text-white",
  secondary: "bg-[var(--lark-sand-600)] text-white",
  ai: "bg-[var(--lark-iris-60)] text-white",
  tertiary: "bg-[var(--lark-iris-60)] text-white",
  success: "bg-[var(--lark-evergreen-60)] text-white",
  warning: "bg-[var(--lark-ember-60)] text-white",
  error: "bg-[var(--lark-rust-60)] text-white",
  coral: "bg-[var(--lark-coral-50)] text-white",
  neutral: "bg-[var(--lark-paper-70)] text-white",
} as const;

export type ChipTone = keyof typeof CHIP;
export type IconChipProps = ComponentProps<"span"> & {
  tone?: ChipTone;
  size?: "sm" | "md" | "lg";
  /**
   * v0.6: "square" (default) for things (objects, categories, actions); "circle" only for
   * people and presence, which use PersonAvatar anyway.
   */
  shape?: "square" | "circle";
  /** "tint" (default): pale fill, dark glyph. "solid": the object's identity colour, white glyph. */
  variant?: "tint" | "solid";
};

/** Icon tile (24 / 32 / 40). Square with 6 / 8 / 10 corners by default (v0.6). Decorative. */
export function IconChip({ tone = "primary", size = "md", shape = "square", variant = "tint", className, ...props }: IconChipProps) {
  const round = shape === "circle";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        size === "sm" && cn("size-6 [&_svg]:size-3.5", round ? "rounded-full" : "rounded-[6px]"),
        size === "md" && cn("size-8 [&_svg]:size-4", round ? "rounded-full" : "rounded-md"),
        size === "lg" && cn("size-10 [&_svg]:size-5", round ? "rounded-full" : "rounded-[10px]"),
        variant === "solid" ? CHIP_SOLID[tone] : CHIP[tone],
        className
      )}
      data-slot="icon-chip"
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
 * Action card: white, hairline, 32px square tinted tile. For things to do next: ACE task tiles,
 * "Create dashboard", integrations. With href, the title is the link and its ::after covers the
 * card: one tab stop, still announced as a link. v0.6: `action` sits in the footer under the text,
 * never in the top-right corner (that corner holds icon-only controls).
 */
export function ActionCard({ icon, tone = "primary", title, description, meta, action, href, media, className, ...props }: ActionCardProps) {
  return (
    <div
      className={cn(
        "group/action relative flex min-w-0 flex-col gap-3 rounded-lg border border-edge bg-card p-3 text-on-surface",
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
          <div className="text-title-sm">
            {href ? (
              <Link className="outline-none after:absolute after:inset-0 after:content-['']" data-slot="action-card-link" href={href}>
                {title}
              </Link>
            ) : (
              title
            )}
          </div>
          {description && <p className="text-body-md text-on-surface-variant">{description}</p>}
          {meta && <div className="mt-1 flex flex-wrap items-center gap-2 text-meta text-on-surface-variant">{meta}</div>}
          {action && <div className="relative z-10 mt-2 flex flex-wrap items-center gap-2">{action}</div>}
        </div>
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
      {description && <span className="line-clamp-2 text-body-md text-on-surface-variant">{description}</span>}
    </>
  );
  const cls = cn(
    "state-layer [--state-hover:0.03] focus-ring relative flex h-full min-w-0 flex-col items-start gap-1.5 rounded-lg border p-3 text-left text-on-surface outline-none",
    selected ? "border-selected-border bg-secondary-container" : "border-edge bg-card"
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
      <section aria-labelledby={id} className={cn("rounded-lg border border-edge bg-card", className)}>
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
          <span className="pt-1 text-meta whitespace-nowrap text-on-surface-variant tabular-nums">
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
                  {it.description && <span className="text-body-md text-on-surface-variant">{it.description}</span>}
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

/* ================================================================ BestFor */

/**
 * "Best for" and a short checklist under an option (v0.6, from Cohere's mode cards). Says what
 * an option suits so people choose by fit, not by reading every metric.
 */
export function BestFor({ items, label = "Best for", className }: { items: string[]; label?: string; className?: string }) {
  return (
    <div className={cn("mt-1.5 flex flex-col gap-1 border-t border-outline-faint pt-1.5", className)} data-slot="best-for">
      <span className="text-label-lg text-on-surface-variant">{label}</span>
      <ul className="flex flex-col gap-0.5">
        {items.map((it) => (
          <li className="flex items-start gap-1.5 text-body-md text-on-surface" key={it}>
            <CheckIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-on-surface-variant" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================ ChoiceCard */

export type Choice = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  recommended?: boolean;
  /** v0.6: what this choice suits, as a short checklist ("Best for: renewals under 50 seats"). */
  bestFor?: string[];
};

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
    <div className={cn("flex flex-col rounded-lg border border-edge bg-card", className)} data-slot="choice-card">
      <p className="px-4 pt-3 text-body-md text-on-surface-variant" id={id}>
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
              {c.description && <span className="text-body-md text-on-surface-variant">{c.description}</span>}
              {c.bestFor && c.bestFor.length > 0 && <BestFor items={c.bestFor} />}
            </span>
          </label>
        ))}
      </RadioGroupPrimitive.Root>
      <div className="flex justify-end border-t border-outline-variant p-2">
        {submitted ? (
          <span className="flex items-center gap-1.5 px-2 py-1.5 text-body-md text-on-surface-variant" role="status">
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
  illustration,
  onDismiss,
  dismissLabel,
  titleAs: T = "span",
  tone = "default",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  media?: ReactNode;
  /** v0.8: a picture above the card's words. Decorative unless `alt`. */
  illustration?: IllustrationSpec;
  onDismiss?: () => void;
  /** The dismiss button's name. Default "Dismiss <title>" when the title is text. */
  dismissLabel?: string;
  /** Make the title a heading where the card is a section of the page. Default a span. */
  titleAs?: "span" | "h2" | "h3" | "h4";
  tone?: "default" | "dark";
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "relative flex min-w-0 items-center gap-4 rounded-lg border p-3 pr-10",
        tone === "dark" ? "dark border-transparent bg-surface text-on-surface" : "border-edge bg-card",
        className
      )}
      data-slot="promo-card"
    >
      {media && <div className="hidden shrink-0 overflow-hidden rounded-md sm:block">{media}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {illustration && <Illustration {...illustration} className="mb-1" />}
        <T className="text-title-sm">{title}</T>
        {description && <span className="text-body-md text-on-surface-variant">{description}</span>}
        {action && <div className="mt-1">{action}</div>}
      </div>
      {onDismiss && (
        <Button aria-label={dismissLabel ?? (typeof title === "string" ? `Dismiss ${title}` : "Dismiss")} className="absolute top-2 right-2" onClick={onDismiss} size="icon-xs" variant="ghost">
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
          {meta && <span className="text-meta text-on-surface-variant">{meta}</span>}
        </div>
      </div>
      {facts && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {facts.map((f, i) => (
            <div className="contents" key={i}>
              <dt className="text-body-md text-on-surface-variant">{f.label}</dt>
              <dd className="min-w-0 truncate text-sm">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="flex flex-wrap justify-end gap-2">{actions}</div>}
    </div>
  );
}

/* ================================================================ CardLink */

/** A card's "see more" link: label plus an arrow, at the end of the footer. */
export function CardLink({ label, href, className }: { label: string; href: string; className?: string }) {
  return (
    <Link className={cn("focus-ring inline-flex min-h-6 items-center gap-1 rounded-sm text-label-lg text-on-surface outline-none hover:text-on-surface-variant", className)} href={href}>
      {label}
      <ArrowRightIcon aria-hidden className="size-3.5" />
    </Link>
  );
}

/* ================================================================ ObjectCard */

export type ObjectCardProps = {
  /** An IconChip (variant "solid" for identity), a CompanyLogo, a PersonAvatar or a ServiceStack. */
  identity?: ReactNode;
  title: ReactNode;
  /** One line under the title: "By Priya Raman". */
  byline?: ReactNode;
  /** Lifecycle or status beside the title: Badge "Beta", StatusBadge. */
  badge?: ReactNode;
  description?: ReactNode;
  /** Footer left: facts as small chips ("v2.0.2", "43 users"). Use ObjectFact. */
  facts?: ReactNode;
  /** Footer right: one action (a Button) or a state (StatusBadge). */
  footerEnd?: ReactNode;
  /** Opens the object. The title becomes the link and covers the card (one tab stop). */
  href?: string;
  /** Star toggle in the top-right corner. */
  starred?: boolean;
  onStarredChange?: (starred: boolean) => void;
  /** Overflow menu in the top-right corner (an ActionMenu). Icon-only controls only. */
  menu?: ReactNode;
  as?: "h2" | "h3" | "h4";
  className?: string;
};

/**
 * One card for things people browse and open: agents, automations, templates, saved views,
 * integrations (v0.6, from North's agent cards and Cohere's model cards). Anatomy, always in
 * this order:
 *   identity tile · title (+ badge) · byline ........ star · menu   (icon-only)
 *   description (two lines, then clamped)
 *   facts (version, counts) .................... one action or state
 * The whole card is the link when it opens something; the star, menu and footer action sit
 * above the link layer so they stay separate tab stops.
 */
export function ObjectCard({ identity, title, byline, badge, description, facts, footerEnd, href, starred, onStarredChange, menu, as: H = "h3", className }: ObjectCardProps) {
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group/object relative flex min-w-0 flex-col gap-3 rounded-lg border border-edge bg-card p-4 text-on-surface",
        href && "state-layer [--state-hover:0.03] has-[a[data-object-link]:focus-visible]:outline-2 has-[a[data-object-link]:focus-visible]:outline-offset-2 has-[a[data-object-link]:focus-visible]:outline-ring",
        className
      )}
      data-slot="object-card"
    >
      <div className="flex items-start gap-3">
        {identity && <div className="shrink-0">{identity}</div>}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <H className="min-w-0 text-title-sm" id={titleId}>
              {href ? (
                <Link className="outline-none after:absolute after:inset-0 after:content-['']" data-object-link href={href}>
                  {title}
                </Link>
              ) : (
                title
              )}
            </H>
            {badge}
          </div>
          {byline && <p data-meta="byline" className="text-meta text-on-surface-variant">{byline}</p>}
        </div>
        {(onStarredChange || menu) && (
          <div className="relative z-10 -mt-1 -mr-1.5 flex shrink-0 items-center">
            {onStarredChange && (
              <Button aria-label="Star" aria-pressed={!!starred} onClick={() => onStarredChange(!starred)} size="icon-sm" variant="ghost">
                <StarIcon className={cn(starred && "fill-current text-on-surface")} />
              </Button>
            )}
            {menu}
          </div>
        )}
      </div>
      {description && <p className="line-clamp-2 text-sm text-on-surface-variant">{description}</p>}
      {(facts || footerEnd) && (
        <div className="mt-auto flex min-h-8 flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">{facts}</div>
          {footerEnd && <div className="relative z-10 flex items-center gap-2">{footerEnd}</div>}
        </div>
      )}
    </article>
  );
}

/**
 * A fact on an ObjectCard footer: a version in a mono chip, or a count with its icon.
 * The label is spoken ("43 users"); the icon is decorative.
 */
export function ObjectFact({ kind = "count", icon, children, label }: { kind?: "version" | "count"; icon?: ReactNode; children: ReactNode; label?: string }) {
  if (kind === "version")
    return (
      <span className="inline-flex h-6 items-center rounded-[6px] bg-surface-container-high px-1.5 font-mono text-meta-strong text-on-surface" data-slot="object-fact">
        {label && <span className="sr-only">{label} </span>}
        {children}
      </span>
    );
  return (
    <span className="inline-flex h-6 items-center gap-1 text-meta text-on-surface-variant tabular-nums" data-slot="object-fact">
      <span aria-hidden className="[&_svg]:size-3.5">{icon ?? <UsersIcon />}</span>
      {children}
      {label && <span className="sr-only"> {label}</span>}
    </span>
  );
}
