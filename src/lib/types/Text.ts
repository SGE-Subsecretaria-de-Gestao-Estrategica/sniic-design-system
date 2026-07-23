import type { ClassValue, SVGAttributes } from "svelte/elements";

type SVGTSpanProps = SVGAttributes<SVGTSpanElement>;
type SVGTextProps = SVGAttributes<SVGTextElement>;

type OwnProps = {
  class?: ClassValue;
  scaleToFit?: boolean | 'shrink-only';
  angle?: number;
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
  verticalAnchor?: 'start' | 'middle' | 'end';
  style?: string | null;
  innerRef?: SVGSVGElement | null;
  innerTextRef?: SVGTextElement | null;
  x?: string | number;
  y?: string | number;
  dx?: string | number;
  dy?: string | number;
  lineHeight?: SVGTSpanProps['dy'];
  capHeight?: SVGTSpanProps['cap-height'];
  fontSize?: string | number;
  fontFamily?: string;
  fill?: string;
  width?: number;
  text?: string;
};

export type TextProps = OwnProps & Omit<SVGTextProps, keyof OwnProps>;

export type compareFunction<T> = (prev: T | undefined, next: T) => boolean;

export interface WordsWithWidth {
  words: string[];
  width?: number;
}