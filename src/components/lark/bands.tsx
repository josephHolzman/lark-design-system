import { ArrowRightIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";

import { LarkLink as Link } from "./provider";

/** Lark's illustration tones: a pale tint of the hue behind bands and media panels. */
/** v0.6: `coral` is the warm wash (Cohere's warmth without the sand/cream look). `sand` stays for
 * compatibility; prefer coral, sky or evergreen. Iris means AI. */
export type BandTone = "sky" | "coral" | "sand" | "evergreen" | "ember" | "iris";

/** The band fill (the tone's 10 step) and the stronger 20 step for media panels and tiles. */
export const BAND_TONE: Record<BandTone, { fill: string; strong: string }> = {
  sky: { fill: "bg-tint-sky", strong: "bg-tint-sky-strong" },
  coral: { fill: "bg-tint-coral", strong: "bg-tint-coral-strong" },
  sand: { fill: "bg-tint-sand", strong: "bg-tint-sand-strong" },
  evergreen: { fill: "bg-tint-evergreen", strong: "bg-tint-evergreen-strong" },
  ember: { fill: "bg-tint-ember", strong: "bg-tint-ember-strong" },
  iris: { fill: "bg-tint-iris", strong: "bg-tint-iris-strong" },
};

/* ================================================================ HeroBand */

export type HeroBandProps = Omit<ComponentProps<"section">, "title"> & {
  /**
   * A short role word ("Seller") shown as a badge beside the title. Lark has no eyebrow over a
   * title (§1, §5); the word stays in the band as metadata rather than above the heading.
   */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** One line of lead text, body-lg. */
  description?: ReactNode;
  /** One or two buttons. At most one brand (`default`) button; the rest `secondary`. */
  actions?: ReactNode;
  /** Illustration on the right (on top under 640). Decorative unless `mediaAlt` is set. */
  media?: ReactNode;
  /** Describes the media for screen readers; without it the media is hidden from them. */
  mediaAlt?: string;
  tone: BandTone;
  /** Heading level of the title. Default "h1" (the band leads the page). */
  as?: "h1" | "h2";
};

/**
 * A page's lead band: radius 16 on the canvas, tinted by tone, eyebrow, title-lg title, one
 * body-lg line, an actions row and an illustration on the right. Under 640 it stacks with the
 * media first. Never sticky; it scrolls away with the page.
 */
export function HeroBand({ eyebrow, title, description, actions, media, mediaAlt, tone, as: Heading = "h1", className, ...props }: HeroBandProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex flex-col-reverse gap-5 rounded-xl p-6 text-on-surface sm:flex-row sm:items-center sm:gap-8 sm:p-8", BAND_TONE[tone].fill, className)}
      data-slot="hero-band"
      data-tone={tone}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <Heading className="text-title-lg text-balance" id={titleId}>
            {title}
          </Heading>
          {eyebrow && (
            <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-outline-strong/40 bg-surface/60 px-2 text-meta-strong text-on-surface-variant">
              {eyebrow}
            </span>
          )}
        </div>
        {description && <p className="max-w-[60ch] text-body-lg text-on-surface-variant">{description}</p>}
        {actions && <div className="mt-2 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {media && (
        <div
          aria-hidden={mediaAlt ? undefined : true}
          aria-label={mediaAlt}
          className="flex shrink-0 items-center justify-center sm:w-[min(40%,320px)] [&_img]:h-auto [&_img]:max-w-full [&_svg]:h-auto [&_svg]:max-w-full"
          data-slot="hero-band-media"
          role={mediaAlt ? "img" : undefined}
        >
          {media}
        </div>
      )}
    </section>
  );
}

/* ================================================================ IllustratedChoiceCard */

export type IllustratedChoiceCardProps = Omit<ComponentProps<"a">, "title" | "href" | "media"> & {
  href: string;
  title: ReactNode;
  /** Up to two lines; longer text is clamped. */
  description?: ReactNode;
  /** Illustration on the tinted panel. Always decorative: the title names the card. */
  media: ReactNode;
  tone: BandTone;
  /** The line at the bottom, with an arrow. Default "Explore this role". */
  cta?: ReactNode;
  /** This is the active choice (the role you're in): sets aria-current="true". */
  current?: boolean;
  /**
   * The link's accessible name. Default: the title, description and cta in words, so the name
   * contains everything visible (WCAG 2.5.3). Pass one when they aren't plain text.
   */
  label?: string;
};

/**
 * A choice among a few big options (the entry page's roles): illustration on a tinted panel,
 * title-sm, two lines, and a call to action with an arrow. The whole card is one link named by the
 * title and described by the description. Put several in a grid; they stretch to equal heights.
 * Hover lifts the edge to outline-strong; there is no shadow.
 */
export function IllustratedChoiceCard({
  href,
  title,
  description,
  media,
  tone,
  cta = "Explore this role",
  current,
  label,
  className,
  ...props
}: IllustratedChoiceCardProps) {
  const titleId = useId();
  const descId = useId();
  // A name that contains the visible words: title, description, cta.
  const text = (n: ReactNode) => (typeof n === "string" || typeof n === "number" ? String(n).trim() : undefined);
  // Join with a full stop unless the previous part already ends in one, so no doubled punctuation.
  const autoName = [text(title), text(description), text(cta)]
    .filter((part): part is string => !!part)
    .reduce((name, part) => (!name ? part : `${name}${/[.!?]$/.test(name) ? " " : ". "}${part}`), "");
  const name = label ?? (autoName || undefined);
  return (
    <Link
      aria-current={current ? "true" : undefined}
      aria-describedby={!name && description ? descId : undefined}
      aria-label={name}
      aria-labelledby={name ? undefined : titleId}
      className={cn(
        "group/choice focus-ring flex h-full min-w-0 flex-col overflow-hidden rounded-lg border bg-card text-on-surface outline-none transition-colors duration-(--duration-short2)",
        current ? "border-selected-border" : "border-outline-variant hover:border-outline-strong",
        className
      )}
      data-slot="illustrated-choice-card"
      data-tone={tone}
      href={href}
      {...props}
    >
      <div aria-hidden="true" className={cn("flex h-36 items-center justify-center p-4 [&_img]:max-h-full [&_img]:max-w-full [&_svg]:max-h-full [&_svg]:max-w-full", BAND_TONE[tone].strong)}>
        {media}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="flex items-center gap-2">
          <span className="text-title-sm" id={titleId}>
            {title}
          </span>
          {current && (
            <span aria-hidden="true" className="ml-auto inline-flex h-5 items-center rounded-full bg-secondary-container px-2 text-meta-strong text-on-secondary-container">
              Current
            </span>
          )}
        </span>
        {description && (
          <span className="line-clamp-2 text-body-md text-on-surface-variant" id={descId}>
            {description}
          </span>
        )}
        <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1 pt-3 text-label-lg text-primary">
          {cta}
          <ArrowRightIcon className="size-4 transition-transform duration-(--duration-short2) group-hover/choice:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
