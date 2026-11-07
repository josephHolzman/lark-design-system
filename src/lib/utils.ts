import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge must know Lark's custom type roles are font sizes. Without this it
 * reads `text-label-lg` as a text colour and drops it when a variant adds
 * `text-on-primary`, so buttons and badges silently fall back to 16px.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "body-lg",
            "body-md",
            "body-sm",
            "label-lg",
            "label-md",
            "title-sm",
            "title-md",
            "title-lg",
            "headline-sm",
            "subtext",
            // v0.7
            "meta",
            "meta-strong",
            "title-module",
            "display-sm",
            "display-md",
          ],
        },
      ],
      shadow: [{ shadow: ["raised", "raised-focus", "drawer"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
