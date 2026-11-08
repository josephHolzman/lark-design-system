"use client";

import { type ComponentProps, useState } from "react";

import { cn } from "@/lib/utils";

import { ACE_PATHS, LOGO_SRC } from "./logos.data";

const TONES = [
  "bg-primary-container text-on-primary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-tag-teal text-on-tag-teal",
  "bg-success-container text-on-success-container",
  "bg-tag-pink text-on-tag-pink",
  "bg-tag-olive text-on-tag-olive",
  "bg-surface-container-high text-on-surface-variant",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "?";
}

const SIZE = {
  xs: "size-5 text-meta",
  sm: "size-6 text-meta",
  md: "size-8 text-sm",
  lg: "size-10 text-sm",
  xl: "size-12 text-base",
} as const;

/** Companies are rounded squares (corner grows with size); people and ACE are circles. */
const SQUARE = { xs: "rounded-[5px]", sm: "rounded-[6px]", md: "rounded-md", lg: "rounded-md", xl: "rounded-lg" } as const;

export type CompanyLogoProps = Omit<ComponentProps<"span">, "children"> & {
  name: string;
  src?: string;
  size?: keyof typeof SIZE;
  /** Decorative when the name is printed next to it (the default). */
  decorative?: boolean;
};

/**
 * A rounded-square mark (companies are squares, people are circles). A missing or failed image
 * falls back to the company's initials on a quiet inset tile, at the same size; `name` stays the
 * accessible name. Without `src` the initials use a tone picked deterministically from the name,
 * so a logo is stable across pages.
 */
export function CompanyLogo({ name, src, size = "md", decorative = true, className, ...props }: CompanyLogoProps) {
  // Remember which src failed: a new src gets a fresh try.
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = !!src && failedSrc !== src;
  return (
    <span
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold select-none",
        SIZE[size],
        SQUARE[size],
        !src && TONES[hash(name) % TONES.length],
        src && !showImage && "bg-inset text-on-surface-variant",
        showImage && "bg-surface-container-lowest ring-1 ring-outline-variant ring-inset",
        className
      )}
      data-slot="company-logo"
      role={decorative ? undefined : "img"}
      {...props}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="size-full object-contain" onError={() => setFailedSrc(src)} src={src} />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export type PersonAvatarProps = Omit<CompanyLogoProps, "src">;

/** Initials in a circle, same tone rule as CompanyLogo. */
export function PersonAvatar({ name, size = "sm", decorative = true, className, ...props }: PersonAvatarProps) {
  return (
    <span
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        SIZE[size],
        TONES[hash(name) % TONES.length],
        className
      )}
      data-slot="person-avatar"
      role={decorative ? undefined : "img"}
      {...props}
    >
      {initials(name)}
    </span>
  );
}

/**
 * The ACE mark (from deepgrids-ACE's ACELogo.svg). `badge` sets it white on an iris disc (iris
 * always means AI); `bare` draws the rays in the current text colour.
 * Motion: `spin` while ACE works, `settle` once when an answer lands, `slow` for ambient states.
 * All motion stops under prefers-reduced-motion.
 */
export function AceMark({
  size = "sm",
  variant = "badge",
  motion,
  className,
  ...props
}: { size?: keyof typeof SIZE; variant?: "badge" | "bare"; motion?: "spin" | "settle" | "slow" } & ComponentProps<"span">) {
  const anim = motion === "spin" ? "lark-ace-spin" : motion === "settle" ? "lark-ace-settle" : motion === "slow" ? "lark-ace-spin-slow" : undefined;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        variant === "badge" ? "rounded-full bg-tertiary text-on-tertiary" : "text-tertiary",
        SIZE[size],
        variant === "bare" && "bg-transparent",
        className
      )}
      data-slot="ace-mark"
      {...props}
    >
      <svg className={cn(variant === "badge" ? "size-[68%]" : "size-full", anim)} fill="none" viewBox="0 0 44 44">
        {ACE_PATHS.map((d) => (
          <path d={d} fill="currentColor" key={d} />
        ))}
      </svg>
    </span>
  );
}

/**
 * Maps a service name, or a label that names one, to its logo key (deepgrids-ACE's rules, plus
 * Snowflake, MCP and email). Generic mail is the neutral envelope; only "Outlook" gets Outlook's mark.
 */
export function serviceKey(name?: string): string | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (/\bace\b/.test(n) && !/place|space|race|trace|face/.test(n)) return "ace";
  if (/salesforce|\bcpq\b/.test(n)) return "salesforce";
  if (/outlook/.test(n)) return "outlook";
  if (/snowflake/.test(n)) return "snowflake";
  if (/\bmcp\b|model context protocol/.test(n)) return "mcp";
  if (/\be-?mail\b|\bmail\b|mailbox/.test(n)) return "email";
  if (/slack/.test(n)) return "slack";
  if (/teams/.test(n)) return "teams";
  if (/sharepoint/.test(n)) return "sharepoint";
  if (/google meet|\bmeet\b/.test(n)) return "meet";
  if (/zoom/.test(n)) return "zoom";
  if (/excel|workbook|\.xlsx/.test(n)) return "excel";
  if (/\bword\b|\.docx/.test(n)) return "word";
  return null;
}

/** https:, data:image/… or a relative path ("/x.svg", "./x.svg", "x.svg"); never javascript: or //host. */
export function safeLogoSrc(src?: string): string | undefined {
  const s = src?.trim();
  if (!s) return undefined;
  if (/^https:\/\//i.test(s)) return s;
  if (/^data:image\//i.test(s)) return s;
  if (s.startsWith("//") || s.startsWith("\\")) return undefined;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return undefined;
  return s;
}

/**
 * A connected service's logo (Salesforce, Outlook, Slack, Teams, SharePoint, Meet, Zoom, Excel,
 * Word, Snowflake, ACE; a neutral plug for MCP servers and an envelope for email). Decorative by
 * default: the service's name is always in the text beside it. Unknown services get a neutral
 * two-letter mark, never a guessed logo. `src` shows a mark the app provides (https:, data:image/
 * or a relative path; anything else is ignored).
 */
export function ServiceLogo({
  service,
  size = 16,
  label,
  src,
  className,
}: {
  service: string;
  size?: number;
  label?: string;
  src?: string;
  className?: string;
}) {
  const key = serviceKey(service);
  const own = safeLogoSrc(src);
  if (own)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- app-provided mark, sized by the caller
      <img alt={label ?? ""} aria-hidden={label ? undefined : true} className={cn("shrink-0 object-contain", className)} data-slot="service-logo" height={size} src={own} style={{ width: size, height: size }} width={size} />
    );
  if (key === "ace")
    return (
      <span aria-hidden={label ? undefined : true} aria-label={label} className={cn("inline-flex shrink-0", className)} role={label ? "img" : undefined} style={{ width: size, height: size }}>
        <AceMark className="size-full" size="xs" />
      </span>
    );
  if (key && LOGO_SRC[key])
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URI, no optimisation to gain
      <img alt={label ?? ""} aria-hidden={label ? undefined : true} className={cn("shrink-0 object-contain", className)} data-slot="service-logo" height={size} src={LOGO_SRC[key]} style={{ width: size, height: size }} width={size} />
    );
  const words = service.replace(/[^A-Za-z ]/g, " ").split(" ").filter(Boolean);
  const caps = service.match(/[A-Z]/g) ?? [];
  const letters =
    words.length > 1
      ? words.map((w) => w[0].toUpperCase()).join("").slice(0, 2)
      : caps.length > 1 && caps.length <= 3
        ? caps.join("").slice(0, 2)
        : (words[0] ?? "?").slice(0, 2).replace(/^./, (c) => c.toUpperCase());
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[4px] bg-surface-container-highest font-semibold tracking-tight text-on-surface-variant", className)}
      data-slot="service-logo"
      role={label ? "img" : undefined}
      style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.56)) }}
    >
      {letters}
    </span>
  );
}

/* ================================================================ ServiceStack */

/**
 * The services an automation or integration touches, as overlapping round marks with "+2" for
 * the rest (v0.6, from North's automation cards). The list of names is spoken; marks are
 * decorative. Max 3 shown.
 */
export function ServiceStack({ services, max = 3, size = 28, className }: { services: string[]; max?: number; size?: number; className?: string }) {
  const shown = services.slice(0, max);
  const more = services.length - shown.length;
  return (
    <span className={cn("inline-flex items-center", className)} data-slot="service-stack">
      <span className="sr-only">Uses {services.join(", ")}</span>
      {shown.map((sv, i) => (
        <span
          aria-hidden
          className={cn("inline-flex shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest", i > 0 && "-ml-1.5")}
          key={sv}
          style={{ width: size, height: size }}
        >
          <ServiceLogo service={sv} size={Math.round(size * 0.55)} />
        </span>
      ))}
      {more > 0 && (
        <span aria-hidden className="-ml-1.5 inline-flex shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-meta-strong text-on-surface-variant" style={{ width: size, height: size }}>
          +{more}
        </span>
      )}
    </span>
  );
}
