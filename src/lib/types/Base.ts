import type { SVGAttributes } from "svelte/elements";

export type NumberLike = { valueOf(): number };

export type StringLike = { toString(): string };

export type DefaultOutput = number | string | boolean | null;

export type ValueOf<T> = T[keyof T];

export type Unarray<T> = T extends Array<infer U> ? U : T;

export type AddSVGProps<Props, Element extends SVGElement> = Props &
  Omit<SVGAttributes<Element>, keyof Props>;