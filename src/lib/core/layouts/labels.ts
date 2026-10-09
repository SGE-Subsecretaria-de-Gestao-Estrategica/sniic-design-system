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

/**
 * Top of a block stacked under a line of text set at `fontSize` from `y` —
 * one line box (1.15em) plus `gap`, which defaults to 0.55em.
 */
export function placeBelowLine(y: number, fontSize: number, gap = fontSize * 0.55): number {
  return y + fontSize * 1.15 + gap;
}
