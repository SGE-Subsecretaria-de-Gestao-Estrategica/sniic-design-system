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