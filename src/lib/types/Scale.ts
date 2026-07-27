import * as d3 from 'd3';
import type { DefaultOutput, StringLike, ValueOf } from './Base';


export type DefaultThresholdInput = number | string | Date;

export interface ScaleTypeToD3Scale<
  Output = DefaultOutput,
  DiscreteInput extends StringLike = StringLike,
  ThresholdInput extends DefaultThresholdInput = DefaultThresholdInput,
> {
  // Input of these continuous scales are `number | { valueOf(): number }`
  // and cannot be customized via generic type.
  linear: d3.ScaleLinear<Output, Output>;
  log: d3.ScaleLogarithmic<Output, Output>;
  pow: d3.ScalePower<Output, Output>;
  sqrt: d3.ScalePower<Output, Output>;
  symlog: d3.ScaleSymLog<Output, Output>;
  radial: d3.ScaleRadial<Output, Output>;
  // Input of time scales are `Date | number | { valueOf(): number }`
  // and cannot be customized via generic type.
  time: d3.ScaleTime<Output, Output>;
  utc: d3.ScaleTime<Output, Output>;
  // Input of these discretizing scales are `number | { valueOf(): number }`
  // and cannot be customized via generic type.
  quantile: d3.ScaleQuantile<Output>;
  quantize: d3.ScaleQuantize<Output>;
  // Threshold scale has its own Input generic type.
  threshold: d3.ScaleThreshold<ThresholdInput, Output>;
  // Ordinal scale can customize both Input and Output types.
  ordinal: d3.ScaleOrdinal<DiscreteInput, Output>;
  // Output of these two scales are always number while Input can be customized.
  point: d3.ScalePoint<DiscreteInput>;
  band: d3.ScaleBand<DiscreteInput>;
}

export type D3Scale<
  Output = DefaultOutput,
  DiscreteInput extends StringLike = StringLike,
  ThresholdInput extends DefaultThresholdInput = DefaultThresholdInput,
> = ValueOf<ScaleTypeToD3Scale<Output, DiscreteInput, ThresholdInput>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyD3Scale = D3Scale<any, any, any>;

export type ScaleInput<Scale extends AnyD3Scale> = Parameters<Scale>[0];




