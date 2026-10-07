import type { SortOrder } from "$lib/core/layouts/types";
import type { JsonValue } from "../spec/types";
import type { OptionDef } from "./types";

type Options = Record<string, JsonValue>;
type Defs = readonly OptionDef<never>[];

/** The stored options a layout depends on: everything but the `drawingOnly` ones. */
export function layoutOptions(defs: Defs = [], options: Options): Options {
  const drawing = new Set(defs.filter((d) => d.drawingOnly).map((d) => d.id));
  return Object.fromEntries(
    Object.entries(options).filter(([id]) => !drawing.has(id)),
  );
}

/** The value a choice option has now: the stored one, or its default. */
export function choiceValue(
  defs: Defs = [],
  options: Options,
  id: string,
): JsonValue | undefined {
  if (options[id] !== undefined) return options[id];
  const def = defs.find((d) => d.id === id);
  return def?.kind === "choice" ? def.default : undefined;
}

/** The "order" options that picking `value` in choice `id` opens. */
export function ordersOpenedBy<L>(
  defs: readonly OptionDef<L>[] = [],
  id: string,
  value: string,
) {
  return defs.filter(
    (d): d is Extract<OptionDef<L>, { kind: "order" }> =>
      d.kind === "order" && d.when?.option === id && d.when.equals === value,
  );
}

/** The ticked entries of a "values" option, in the order of `values`; a stored `true` ticks them all. */
export function pickedValues(
  stored: JsonValue | undefined,
  values: readonly string[],
): string[] {
  if (stored === true) return [...values];
  return Array.isArray(stored) ? values.filter((v) => stored.includes(v)) : [];
}

/** What to store after ticking or unticking `value`: the new list, or `undefined` when empty. */
export function togglePicked(
  stored: JsonValue | undefined,
  values: readonly string[],
  value: string,
  on: boolean,
): string[] | undefined {
  const current = pickedValues(stored, values);
  const next = on
    ? values.filter((v) => v === value || current.includes(v))
    : current.filter((v) => v !== value);
  return next.length ? next : undefined;
}

/** `order` with the item at `index` moved one place up (-1) or down (1). */
export function moveItem(
  order: readonly string[],
  index: number,
  by: -1 | 1,
): string[] {
  const target = index + by;
  if (target < 0 || target >= order.length) return [...order];
  const next = [...order];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** A stored choice if it is one of `allowed`, else `fallback`. */
export function readChoice<T extends string>(
  options: Options,
  id: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = options[id];
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function readStringList(
  options: Options,
  id: string,
): string[] | undefined {
  const value = options[id];
  if (!Array.isArray(value)) return undefined;
  const list = value.filter((v): v is string => typeof v === "string");
  return list.length ? list : undefined;
}

/** A stored text, trimmed; `undefined` when empty. */
export function readText(options: Options, id: string): string | undefined {
  const value = options[id];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** A stored number; `undefined` when empty or not finite. */
export function readNumber(options: Options, id: string): number | undefined {
  const value = options[id];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

export function readToggle(options: Options, id: string): boolean {
  return options[id] === true;
}

/** Whether `value` is ticked in a "values" option; a stored `true` ticks everything. */
export function isPicked(options: Options, id: string, value: string): boolean {
  const stored = options[id];
  return stored === true || (Array.isArray(stored) && stored.includes(value));
}

export const VALUE_LABELS = ["ends", "all"] as const;
export type ValueLabels = (typeof VALUE_LABELS)[number];

/** Which points of a line get a value label. Drawing only: the layout places every label. */
export function valueLabelsOption(fallback: ValueLabels) {
  return {
    id: "valueLabels",
    step: "style",
    drawingOnly: true,
    label: "Rótulos de valor",
    kind: "choice",
    choices: [
      { value: "ends", label: "Só no início e no fim de cada trecho" },
      { value: "all", label: "Em todos os pontos" },
    ],
    default: fallback,
  } as const;
}

/** The series drawn in the secondary colours; the others stay in the primary ones. */
export const HIGHLIGHT_OPTION = {
  id: "highlight",
  step: "style",
  drawingOnly: true,
  label: "Série em destaque",
  kind: "value",
  channel: "series",
  none: "Nenhuma",
} as const;

/**
 * The series whose last marker (and end value) take the accent colour. A
 * chart with one line shows a single checkbox instead. Off until ticked.
 */
export const ACCENT_END_OPTION = {
  id: "accentEnd",
  step: "style",
  drawingOnly: true,
  label: "Último marcador na cor de acento",
  kind: "values",
  channel: "series",
  whole: "Último marcador na cor de acento",
} as const;

export const SORT_ORDERS: readonly SortOrder[] = [
  "descending",
  "ascending",
  "none",
];

export const MANUAL = "manual";

const MANUAL_CHOICE = { value: MANUAL, label: "Ordem manual" } as const;

export const SORT_OPTION = {
  id: "sort",
  step: "style",
  label: "Ordem das categorias",
  kind: "choice",
  choices: [
    { value: "descending", label: "Do maior para o menor valor" },
    { value: "ascending", label: "Do menor para o maior valor" },
    { value: "none", label: "Ordem do arquivo" },
    MANUAL_CHOICE,
  ],
  default: "descending",
} as const;

/** For layouts with one built-in order: that order, or a manual one. */
export function orderModeOption(automaticLabel: string) {
  return {
    id: "sort",
    step: "style",
    label: "Ordem das categorias",
    kind: "choice",
    choices: [{ value: "auto", label: automaticLabel }, MANUAL_CHOICE],
    default: "auto",
  } as const;
}

/** Shown under the "sort" select while it is on manual. Spread it and add `current`. */
export const CATEGORY_ORDER_OPTION = {
  id: "categoryOrder",
  step: "style",
  label: "Ordem manual",
  kind: "order",
  when: { option: "sort", equals: MANUAL },
} as const;

/** The stored category order, only while the "sort" option is on manual. */
export function readManualOrder(options: Options): string[] | undefined {
  return options.sort === MANUAL
    ? readStringList(options, "categoryOrder")
    : undefined;
}

/** `sort` + `categoryOrder` for a layout: manual order keeps the file order under the list. */
export function readOrdering(options: Options): {
  sort: SortOrder;
  categoryOrder?: string[];
} {
  if (options.sort === MANUAL)
    return { sort: "none", categoryOrder: readManualOrder(options) };
  return { sort: readChoice(options, "sort", SORT_ORDERS, "descending") };
}
