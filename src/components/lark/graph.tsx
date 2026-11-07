// Lark's graph pieces for React Flow (@xyflow/react). Entry: "@deepgrids/lark/graph".
// This module never imports @xyflow/react, so it renders anywhere (server, tests, apps without
// React Flow). In a React Flow app, wrap GraphNode in a custom node type and pass the Handles
// as children; style the canvas with "@deepgrids/lark/graph.css".
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { BandTone } from "./bands";

export type GraphTone = BandTone | "neutral";

const TILE: Record<GraphTone, string> = {
  sky: "bg-tint-sky-strong text-on-primary-container",
  coral: "bg-tint-coral-strong text-on-error-container",
  sand: "bg-tint-sand-strong text-on-secondary-container",
  evergreen: "bg-tint-evergreen-strong text-on-success-container",
  ember: "bg-tint-ember-strong text-on-warning-container",
  iris: "bg-tint-iris-strong text-on-tertiary-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export type GraphNodeProps = Omit<ComponentProps<"div">, "title"> & {
  title: ReactNode;
  /** One line that names the category in words ("Account · 12 contacts"); colour never carries it alone. */
  meta: ReactNode;
  /** Shown in a 32px tile tinted by tone. Decorative. */
  icon?: ReactNode;
  /** The category's tone. Default "neutral". */
  tone?: GraphTone;
  selected?: boolean;
  /** Faded back (filtered out, or not on the selected path). Still readable and focusable. */
  dimmed?: boolean;
  /** React Flow Handles go here. */
  children?: ReactNode;
};

/**
 * A record on a graph: 216×64, radius 12, a 32px icon tile by category tone, title and a meta line
 * that names the category. Selected = a 2px primary ring; dimmed = 40% opacity. Selection is
 * also announced ("selected").
 */
export function GraphNode({ title, meta, icon, tone = "neutral", selected, dimmed, className, children, ...props }: GraphNodeProps) {
  return (
    <div
      className={cn(
        "relative flex h-16 w-[216px] items-center gap-3 rounded-lg border bg-surface px-3 text-on-surface transition-[opacity,border-color,box-shadow] duration-(--duration-short2)",
        selected ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-outline-variant",
        dimmed && "opacity-40",
        className
      )}
      data-dimmed={dimmed ? "" : undefined}
      data-selected={selected ? "" : undefined}
      data-slot="graph-node"
      data-tone={tone}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-md [&_svg]:size-4", TILE[tone])} data-slot="graph-node-icon">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-label-lg">{title}</span>
        <span className="truncate text-body-sm text-on-surface-variant">{meta}</span>
      </span>
      {selected && <span className="sr-only">, selected</span>}
      {children}
    </div>
  );
}

export type GraphEdgeLabelProps = ComponentProps<"div">;

/**
 * An edge's label ("owns", "renews"): a 20px pill with an outline-variant edge on the surface.
 * Render inside React Flow's EdgeLabelRenderer and position it with `style` (transform).
 */
export function GraphEdgeLabel({ className, ...props }: GraphEdgeLabelProps) {
  return (
    <div
      className={cn("nodrag nopan pointer-events-auto absolute inline-flex h-5 items-center rounded-full border border-outline-variant bg-surface px-2 text-label-md whitespace-nowrap text-on-surface-variant", className)}
      data-slot="graph-edge-label"
      {...props}
    />
  );
}
