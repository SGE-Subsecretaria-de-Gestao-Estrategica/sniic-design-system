import type {
  LabelPlacement,
  LabelSide,
  Point,
  TextAnchor,
  VerticalAnchor,
} from "./types";


export function sideSign(side: LabelSide): -1 | 1 {
  return side === "above" ? -1 : 1;
}

export function sideAnchor(side: LabelSide): VerticalAnchor {
  return side === "above" ? "end" : "start";
}

export function placeOnSide(
  anchor: Point,
  side: LabelSide,
  gap: number,
  textAnchor: TextAnchor = "middle",
  dx = 0,
): LabelPlacement {
  return {
    x: anchor.x + dx,
    y: anchor.y + sideSign(side) * gap,
    textAnchor,
    verticalAnchor: sideAnchor(side),
  };
}

export function placeRight(
  anchor: Point,
  dx: number,
  dy = 0,
  verticalAnchor: VerticalAnchor = "start",
): LabelPlacement {
  return { x: anchor.x + dx, y: anchor.y + dy, textAnchor: "start", verticalAnchor };
}

export function placeLeft(
  anchor: Point,
  dx: number,
  dy = 0,
  verticalAnchor: VerticalAnchor = "middle",
): LabelPlacement {
  return { x: anchor.x - dx, y: anchor.y + dy, textAnchor: "end", verticalAnchor };
}

export function placeCentered(anchor: Point): LabelPlacement {
  return { x: anchor.x, y: anchor.y, textAnchor: "middle", verticalAnchor: "middle" };
}
