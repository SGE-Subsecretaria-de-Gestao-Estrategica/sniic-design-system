import type { SVGAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

export interface MarkerBaseProps {
  id: string;
  size?: number;
  markerWidth?: string | number;
  markerHeight?: string | number;
  markerUnits?: string;
  refX?: string | number;
  refY?: string | number;
  strokeWidth?: number;
  children: Snippet;
}

export type MarkerProps = MarkerBaseProps & Omit<SVGAttributes<SVGMarkerElement>, keyof MarkerBaseProps>;
export type MarkerComponentProps = Omit<MarkerProps, 'children'>;

export type CommonShapeProps = {
  x: number;
  y: number;
  size?: number;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
};