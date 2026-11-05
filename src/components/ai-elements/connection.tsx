import type { ConnectionLineComponent } from "@xyflow/react";

const HALF = 0.5;

/** The line drawn while dragging from a handle: primary, dashed, ending in a handle-sized ring. */
export const Connection: ConnectionLineComponent = ({ fromX, fromY, toX, toY }) => (
  <g>
    <path
      d={`M${fromX},${fromY} C ${fromX + (toX - fromX) * HALF},${fromY} ${fromX + (toX - fromX) * HALF},${toY} ${toX},${toY}`}
      fill="none"
      stroke="var(--primary)"
      strokeDasharray="6 4"
      strokeWidth={1.5}
    />
    <circle cx={toX} cy={toY} fill="var(--card)" r={5} stroke="var(--primary)" strokeWidth={2} />
  </g>
);
