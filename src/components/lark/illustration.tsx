import { cn } from "@/lib/utils";

/*
 * Illustration (v0.8): a picture in an empty state, a promo card or a module that has no content
 * yet. Decorative by default (alt ""), with a `brief` kept for authors. The box is reserved by the
 * image's width and height attributes, so nothing shifts while the file loads. Its own container
 * decides the step: in a box under 20rem a 200px illustration renders at 140 and a 140 at 96.
 */

export type IllustrationSize = 48 | 96 | 140 | 200 | "wide";

/** What the illustration props on StatePanel, ChatWelcome, Banner, PromoCard and SectionCard take. */
export type IllustrationSpec = {
  src: string;
  /** Empty (the default) means decorative: the words around it carry the meaning. */
  alt?: string;
  size?: IllustrationSize;
};

const SIZE: Record<IllustrationSize, { cls: string; w: number; h: number }> = {
  48: { cls: "size-12", w: 48, h: 48 },
  96: { cls: "size-24 rounded-xl", w: 96, h: 96 },
  // The step down follows the picture's container (the module it sits in), not the viewport.
  140: { cls: "size-[8.75rem] rounded-xl @max-[20rem]/illustration:size-24", w: 140, h: 140 },
  200: { cls: "size-[12.5rem] rounded-xl @max-[20rem]/illustration:size-[8.75rem]", w: 200, h: 200 },
  wide: { cls: "h-[8.75rem] w-full rounded-xl", w: 640, h: 140 },
};

export type IllustrationProps = IllustrationSpec & {
  /** Kept in `data-brief` for authors; never rendered or announced. */
  brief?: string;
  className?: string;
};

/**
 * An illustration that reserves its space before it loads. `alt` empty (default) hides it from
 * screen readers; when it carries information, pass `alt`. `size` "wide" fills the container's
 * width at 140 high. Under 20rem of container, 200 shows at 140 and 140 at 96.
 */
export function Illustration({ src, alt = "", size = 96, brief, className }: IllustrationProps) {
  const s = SIZE[size];
  return (
    <span
      className={cn("@container/illustration block w-full min-w-0", className)}
      data-brief={brief}
      data-size={size}
      data-slot="illustration"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- illustration files are app-supplied; no optimizer needed */}
      <img
        alt={alt}
        aria-hidden={alt ? undefined : true}
        className={cn("mx-auto block object-contain", s.cls, size === "wide" && "mx-0")}
        height={s.h}
        src={src}
        width={s.w}
      />
    </span>
  );
}

/** True for an `{ src, alt?, size? }` spec (as opposed to a ReactNode illustration slot). */
export function isIllustrationSpec(value: unknown): value is IllustrationSpec {
  return typeof value === "object" && value !== null && "src" in value && typeof (value as IllustrationSpec).src === "string";
}
