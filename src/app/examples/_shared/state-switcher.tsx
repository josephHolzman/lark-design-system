"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Segmented } from "@/components/lark/filters";
import { cn } from "@/lib/utils";

/* The example pages' state switcher (v0.7): every state a pattern must handle, plus the 420px side panel. */

export const EXAMPLE_STATES = [
  { value: "default", label: "Default" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
  { value: "partial", label: "Missing fields" },
  { value: "long", label: "Long names, big numbers" },
  { value: "conflict", label: "Conflicting sources" },
  { value: "permission", label: "Permission-limited" },
  { value: "many", label: "Many rows" },
] as const;

export type ExampleState = (typeof EXAMPLE_STATES)[number]["value"];

export function StateSwitcher({ children }: { children: (state: ExampleState) => ReactNode }) {
  const [state, setState] = useState<ExampleState>("default");
  const [width, setWidth] = useState("full");
  // ?state=…&width=panel opens a state directly (tests and links).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = q.get("state");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s && EXAMPLE_STATES.some((x) => x.value === s)) setState(s as ExampleState);
    if (q.get("width") === "panel") setWidth("panel");
  }, []);
  return (
    <div className="flex min-w-0 flex-col gap-module-gap">
      <div className="flex flex-col gap-3 rounded-module border border-edge bg-module p-4" data-slot="state-switcher">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-label-lg text-on-surface">
            State
          </span>
          <Segmented aria-label="Example state" onValueChange={(v) => setState(v as ExampleState)} options={[...EXAMPLE_STATES]} value={state} />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-label-lg text-on-surface">Width</span>
          <Segmented
            aria-label="Example width"
            onValueChange={setWidth}
            options={[
              { value: "full", label: "Page" },
              { value: "panel", label: "Side panel, 420px" },
            ]}
            value={width}
          />
        </div>
      </div>
      <div className={cn("min-w-0", width === "panel" && "w-full max-w-[420px] rounded-module bg-canvas")} data-example-state={state} data-example-width={width}>
        {children(state)}
      </div>
    </div>
  );
}
