import type { EdgeProps, InternalNode, Node } from "@xyflow/react";
import type { ReactNode } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSimpleBezierPath,
  Position,
  useInternalNode,
} from "@xyflow/react";

/**
 * Lark edges. Resting edges are 1.5px in the outline role (3:1 on the canvas) with an
 * arrowhead from the Canvas defaults. "Running" is dashed and marches; under reduced
 * motion it stays dashed but still. Colour is not the only state cue: dash pattern and
 * motion both change.
 */
const REST = { stroke: "var(--outline)", strokeWidth: 1.5 };

/** Branch labels ("Yes", "No") as small chips sitting on the path. */
const EdgeLabel = ({ x, y, children }: { x: number; y: number; children?: ReactNode }) =>
  children ? (
    <EdgeLabelRenderer>
      <span
        className="nodrag nopan pointer-events-none absolute rounded-md bg-surface-container-high px-1.5 py-0.5 text-label-md text-on-surface-variant"
        style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
      >
        {children}
      </span>
    </EdgeLabelRenderer>
  ) : null;

const Temporary = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  label,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSimpleBezierPath({
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ ...REST, strokeDasharray: "4 4" }}
      />
      <EdgeLabel x={labelX} y={labelY}>{label}</EdgeLabel>
    </>
  );
};

const getHandleCoordsByPosition = (
  node: InternalNode<Node>,
  handlePosition: Position
) => {
  // Left is the target handle, Right is the source handle.
  const handleType = handlePosition === Position.Left ? "target" : "source";

  const handle = node.internals.handleBounds?.[handleType]?.find(
    (h) => h.position === handlePosition
  );

  if (!handle) {
    return [0, 0] as const;
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // Offset to the outer edge of the handle so the arrowhead stays visible.
  switch (handlePosition) {
    case Position.Left: {
      offsetX = 0;
      break;
    }
    case Position.Right: {
      offsetX = handle.width;
      break;
    }
    case Position.Top: {
      offsetY = 0;
      break;
    }
    case Position.Bottom: {
      offsetY = handle.height;
      break;
    }
    default: {
      throw new Error(`Invalid handle position: ${handlePosition}`);
    }
  }

  const x = node.internals.positionAbsolute.x + handle.x + offsetX;
  const y = node.internals.positionAbsolute.y + handle.y + offsetY;

  return [x, y] as const;
};

const getEdgeParams = (
  source: InternalNode<Node>,
  target: InternalNode<Node>
) => {
  const sourcePos = Position.Right;
  const [sx, sy] = getHandleCoordsByPosition(source, sourcePos);
  const targetPos = Position.Left;
  const [tx, ty] = getHandleCoordsByPosition(target, targetPos);

  return { sourcePos, sx, sy, targetPos, tx, ty };
};

const useNodePath = (source: string, target: string) => {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!(sourceNode && targetNode)) {
    return null;
  }
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
  const [path, labelX, labelY] = getBezierPath({
    sourcePosition: sourcePos,
    sourceX: sx,
    sourceY: sy,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });
  return { labelX, labelY, path };
};

/** Solid resting edge. */
const Default = ({ id, source, target, markerEnd, style, label }: EdgeProps) => {
  const p = useNodePath(source, target);
  if (!p) return null;
  return (
    <>
      <BaseEdge id={id} markerEnd={markerEnd} path={p.path} style={{ ...REST, ...style }} />
      <EdgeLabel x={p.labelX} y={p.labelY}>{label}</EdgeLabel>
    </>
  );
};

/** Data flowing: a small primary dot travels the path (hidden under reduced motion). */
const Animated = ({ id, source, target, markerEnd, style }: EdgeProps) => {
  const path = useNodePath(source, target)?.path;
  if (!path) return null;
  return (
    <>
      <BaseEdge id={id} markerEnd={markerEnd} path={path} style={{ ...REST, ...style }} />
      <circle className="motion-reduce:hidden" fill="var(--primary)" r="3">
        <animateMotion dur="2.4s" path={path} repeatCount="indefinite" />
      </circle>
    </>
  );
};

/** The step this edge feeds is running: primary, dashed, marching. */
const Running = ({ id, source, target, markerEnd, style }: EdgeProps) => {
  const path = useNodePath(source, target)?.path;
  if (!path) return null;
  return (
    <BaseEdge
      className="lark-edge-running"
      id={id}
      markerEnd={markerEnd}
      path={path}
      style={{ stroke: "var(--primary)", strokeWidth: 1.5, strokeDasharray: "6 4", ...style }}
    />
  );
};

export const Edge = {
  Animated,
  Default,
  Running,
  Temporary,
};
