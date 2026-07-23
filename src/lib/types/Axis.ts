import type { Snippet } from 'svelte';
import type { NumberLike, ValueOf } from './Base';
import type { D3Scale, ScaleInput } from './Scale';
import type { TextProps } from './Text';
import type { ClassValue } from 'svelte/elements';
import type Orientation from '$lib/constants/orientation';
import type { LineProps } from './Line';


interface Point {
  x: number;
  y: number;
}

type FormattedValue = string | undefined;


export type TickFormatter<T> = (
  value: T,
  index: number,
  values: { value: T; index: number }[],
) => FormattedValue;

export type TickLabelProps<T> =
  | Partial<TextProps>
  | ((value: T, index: number, values: { value: T; index: number }[]) => Partial<TextProps>);
  
export type AxisScaleOutput = number | NumberLike | undefined;

export type AxisScale<Output extends AxisScaleOutput = AxisScaleOutput> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D3Scale<Output, any, any>;

export type ComputedTick<Scale extends AxisScale> = {
  value: ScaleInput<Scale>;
  index: number;
  from: Point;
  to: Point;
  formattedValue: FormattedValue;
};

export type TickRendererProps = Partial<TextProps> & {
  x: number;
  y: number;
  formattedValue: FormattedValue;
};

export type AxisRendererProps<Scale extends AxisScale> = CommonProps<Scale> & {
  axisFromPoint: Point;
  axisToPoint: Point;
  horizontal: boolean;
  scale: Scale;
  tickPosition: (value: ScaleInput<Scale>) => AxisScaleOutput;
  tickSign: 1 | -1;
  ticks: ComputedTick<Scale>[];
};

export type TicksRendererProps<Scale extends AxisScale> = {
  tickLabelProps: Partial<TextProps>[];
} & Pick<
  AxisRendererProps<Scale>,
  | 'hideTicks'
  | 'horizontal'
  | 'orientation'
  | 'scale'
  | 'tickClassName'
  | 'tickComponent'
  | 'tickStroke'
  | 'tickTransform'
  | 'ticks'
  | 'strokeWidth'
  | 'tickLineProps'
>;

export type CommonProps<Scale extends AxisScale> = {
  axisLineClassName?: ClassValue;
  hideAxisLine?: boolean;
  hideTicks?: boolean;
  hideZero?: boolean;
  label?: string;
  labelClassName?: ClassValue;
  labelOffset?: number;
  labelProps?: Partial<TextProps>;
  numTicks?: number;
  orientation?: ValueOf<typeof Orientation>;
  rangePadding?: number | { start?: number; end?: number };
  stroke?: string;
  strokeWidth?: number | string;
  strokeDasharray?: string;
  tickLineProps?: Omit<LineProps, 'to' | 'from' | 'ref'>;
  tickClassName?: ClassValue;
  tickComponent?: Snippet<[TickRendererProps]>;
  ticksComponent?: Snippet<[TicksRendererProps<Scale>]>;
  tickFormat?: TickFormatter<ScaleInput<Scale>>;
  tickLabelProps?: TickLabelProps<ScaleInput<Scale>>;
  tickLength?: number;
  tickStroke?: string;
  tickTransform?: string;
};

export type SharedAxisProps<Scale extends AxisScale> = CommonProps<Scale> & {
  axisClassName?: ClassValue;
  left?: number;
  innerRef?: SVGGElement | null;
  scale: Scale;
  tickValues?: ScaleInput<Scale>[];
  top?: number;
  children?: Snippet<[AxisRendererProps<Scale>]>;
};