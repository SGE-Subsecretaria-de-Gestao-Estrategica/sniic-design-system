import type { ClassValue } from "svelte/elements";

interface Point {
  x?: number;
  y?: number;
}

export type LineProps = {
  class?: ClassValue;
  innerRef?: SVGLineElement | null;
  fill?: string;
  from?: Point;
  to?: Point;
};