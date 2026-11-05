import type { DefaultEdgeOptions, ReactFlowProps } from "@xyflow/react";
import { Background, BackgroundVariant, MarkerType, ReactFlow } from "@xyflow/react";
import type { ReactNode } from "react";
import "@xyflow/react/dist/style.css";

type CanvasProps = ReactFlowProps & {
  children?: ReactNode;
};

const deleteKeyCode = ["Backspace", "Delete"];

// Arrowheads on every edge by default, in the same outline role as the stroke.
const defaultEdgeOptions: DefaultEdgeOptions = {
  markerEnd: { color: "var(--outline)", height: 14, type: MarkerType.ArrowClosed, width: 14 },
};

/**
 * Lark canvas: the surface role with a dot grid in outline-variant, so raised nodes
 * read as objects on a page rather than boxes on a void. Theme variables for React
 * Flow's own chrome (selection box, attribution) live in globals.css under `.react-flow`.
 */
export const Canvas = ({ children, ...props }: CanvasProps) => (
  <ReactFlow
    defaultEdgeOptions={defaultEdgeOptions}
    deleteKeyCode={deleteKeyCode}
    fitView
    panOnDrag={false}
    panOnScroll
    selectionOnDrag={true}
    zoomOnDoubleClick={false}
    {...props}
  >
    <Background
      bgColor="var(--surface)"
      color="var(--outline-variant)"
      gap={20}
      size={1.5}
      variant={BackgroundVariant.Dots}
    />
    {children}
  </ReactFlow>
);
