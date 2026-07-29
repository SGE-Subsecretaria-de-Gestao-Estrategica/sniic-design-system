import type { Snippet } from "svelte";
import type { ClassValue, SVGAttributes } from "svelte/elements";
import type { NumberLike } from "./Base";
import type { LineProps } from "./Line";
import type { D3Scale, ScaleInput } from "./Scale";

export type GridScaleOutput = number | NumberLike | undefined;

export type GridScale<Output extends GridScaleOutput = GridScaleOutput> =
  D3Scale<Output, any, any>;

export type GridLines = {
  from: { x?: number; y?: number };
  to: { x?: number; y?: number };
  index: number;
}[];

export type CommonGridProps = {
  className?: ClassValue;
  children?: Snippet<[{ lines: GridLines }]>;
  top?: number;
  left?: number;
  stroke?: string;
  strokeWidth?: string | number;
  strokeDasharray?: string;
  numTicks?: number;
  offset?: number;
};

export type GridColumnsProps<Scale extends GridScale> = CommonGridProps & {
  scale: Scale;
  tickValues?: ScaleInput<Scale>[];
  height: number;
};

export type AllGridColumnsProps<Scale extends GridScale> = GridColumnsProps<Scale> &
  Omit<LineProps & Omit<SVGAttributes<SVGLineElement>, keyof LineProps>, keyof GridColumnsProps<Scale>>;

export type GridRowsProps<Scale extends GridScale> = CommonGridProps & {
  scale: Scale;
  tickValues?: ScaleInput<Scale>[];
  width: number;
};

export type AllGridRowsProps<Scale extends GridScale> = GridRowsProps<Scale> &
  Omit<LineProps & Omit<SVGAttributes<SVGLineElement>, keyof LineProps>, keyof GridRowsProps<Scale>>;

/** Rows and columns drawn together. Per-axis props override the shared ones. */
export type GridProps<
  XScale extends GridScale,
  YScale extends GridScale,
> = Omit<CommonGridProps, 'children' | 'numTicks' | 'offset'> & {
  xScale: XScale;
  yScale: YScale;
  width: number;
  height: number;
  numTicksRows?: number;
  numTicksColumns?: number;
  xTickValues?: ScaleInput<XScale>[];
  yTickValues?: ScaleInput<YScale>[];
  xOffset?: number;
  yOffset?: number;
  /** Draw only one direction — handy for the common "horizontal rules" grid. */
  rows?: boolean;
  columns?: boolean;
  rowLineProps?: GridLineStyleProps;
  columnLineProps?: GridLineStyleProps;
};

export type GridLineStyleProps = Pick<
  CommonGridProps,
  'stroke' | 'strokeWidth' | 'strokeDasharray'
> & {
  strokeOpacity?: LineProps['strokeOpacity'];
};