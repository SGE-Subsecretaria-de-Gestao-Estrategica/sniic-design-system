import type { ColumnSchema } from "../data/types";
import { pillarPalettes } from "$lib/core/theme/tokens";
import type { ChartId } from "../registry/layouts";
import { channelAccepts } from "../registry/compatibility";
import { isMarginPresetId } from "../registry/margins";
import { clampParam, resolveFormat } from "../registry/params";
import type { ChannelDef, ChartRegistry } from "../registry/types";
import { DEFAULT_FORMAT } from "./format";
import {
  CHART_SPEC_VERSION,
  type Aggregation,
  type ChartSpec,
  type DataSpec,
  type Encoding,
  type JsonValue,
  type NumberFormat,
  type ResetNotice,
  type SpecChange,
  type StyleSpec,
} from "./types";

export function createSpec(): ChartSpec {
  return {
    version: CHART_SPEC_VERSION,
    data: { fileName: null, delimiter: ";", decimal: ".", columns: [] },
    chart: null,
    encoding: {},
    aggregate: "sum",
    style: {
      pillar: 1,
      width: null,
      height: null,
      format: DEFAULT_FORMAT,
      formats: {},
      margin: null,
      options: {},
      params: {},
    },
  };
}

export function compatibleColumns(
  channel: ChannelDef,
  columns: readonly ColumnSchema[],
): ColumnSchema[] {
  return columns.filter((c) => channelAccepts(channel, c.type));
}

export function missingChannels(
  channels: readonly ChannelDef[],
  encoding: Encoding,
): ChannelDef[] {
  return channels.filter((c) => c.required && !encoding[c.id]);
}

export function pruneEncoding(
  encoding: Encoding,
  channels: readonly ChannelDef[] | null,
  columns: readonly ColumnSchema[],
): { encoding: Encoding; reset: ResetNotice[] } {
  const byId = new Map((channels ?? []).map((c) => [c.id, c]));
  const schema = new Map(columns.map((c) => [c.name, c]));
  const next: Encoding = {};
  const reset: ResetNotice[] = [];

  for (const [channelId, column] of Object.entries(encoding)) {
    const channel = byId.get(channelId);
    const schemaColumn = schema.get(column);
    if (!channel) {
      reset.push({ channel: channelId, column, reason: "channel-removed" });
    } else if (!schemaColumn) {
      reset.push({ channel: channelId, column, reason: "column-removed" });
    } else if (!channelAccepts(channel, schemaColumn.type)) {
      reset.push({ channel: channelId, column, reason: "type-mismatch" });
    } else {
      next[channelId] = column;
    }
  }
  return { encoding: next, reset };
}

function channelsOf(spec: ChartSpec, registry: ChartRegistry) {
  return spec.chart ? registry.require(spec.chart).channels : null;
}

export function setData(
  spec: ChartSpec,
  data: DataSpec,
  registry: ChartRegistry,
): SpecChange {
  const { encoding, reset } = pruneEncoding(
    spec.encoding,
    channelsOf(spec, registry),
    data.columns,
  );
  return { spec: { ...spec, data, encoding }, reset };
}

export function setChart(
  spec: ChartSpec,
  chartId: ChartId | null,
  registry: ChartRegistry,
): SpecChange {
  if (chartId === spec.chart) return { spec, reset: [] };
  const channels = chartId ? registry.require(chartId).channels : null;
  const { encoding, reset } = pruneEncoding(
    spec.encoding,
    channels,
    spec.data.columns,
  );
  return {
    // Extra formats, margin, options and params belong to the chart that was picked.
    spec: {
      ...spec,
      chart: chartId,
      encoding,
      style: {
        ...spec.style,
        formats: {},
        margin: null,
        options: {},
        params: {},
      },
    },
    reset,
  };
}

/** Step 3: maps a column to a channel; `null` clears it. */
export function setEncoding(
  spec: ChartSpec,
  channelId: string,
  columnName: string | null,
  registry: ChartRegistry,
): SpecChange {
  const channel = channelsOf(spec, registry)?.find((c) => c.id === channelId);
  if (!channel)
    throw new Error(
      `Unknown channel "${channelId}" for chart "${spec.chart}".`,
    );

  const encoding = { ...spec.encoding };
  if (columnName === null) {
    delete encoding[channelId];
  } else {
    const column = spec.data.columns.find((c) => c.name === columnName);
    if (!column) throw new Error(`Unknown column "${columnName}".`);
    if (!channelAccepts(channel, column.type)) {
      throw new Error(
        `Channel "${channelId}" does not accept ${column.type} column "${columnName}".`,
      );
    }
    encoding[channelId] = columnName;
  }
  return { spec: { ...spec, encoding }, reset: [] };
}

export function setAggregate(
  spec: ChartSpec,
  aggregate: Aggregation,
): SpecChange {
  return { spec: { ...spec, aggregate }, reset: [] };
}

/** Sets a chart option declared in the registry; `undefined` restores its default. */
export function setOption(
  spec: ChartSpec,
  optionId: string,
  value: JsonValue | undefined,
  registry: ChartRegistry,
): SpecChange {
  const options = spec.chart
    ? (registry.require(spec.chart).options ?? [])
    : [];
  if (!options.some((o) => o.id === optionId)) {
    throw new Error(`Unknown option "${optionId}" for chart "${spec.chart}".`);
  }
  const next = { ...spec.style.options };
  if (value === undefined) delete next[optionId];
  else next[optionId] = value;
  return {
    spec: { ...spec, style: { ...spec.style, options: next } },
    reset: [],
  };
}

/** Sets a layout number declared in the registry, clamped to its range; `null` restores its default. */
export function setParam(
  spec: ChartSpec,
  paramId: string,
  value: number | null,
  registry: ChartRegistry,
): SpecChange {
  const def = spec.chart
    ? registry.require(spec.chart).params?.find((p) => p.id === paramId)
    : undefined;
  if (!def)
    throw new Error(`Unknown param "${paramId}" for chart "${spec.chart}".`);
  if (value !== null && !Number.isFinite(value)) {
    throw new Error(
      `Param "${paramId}" must be a number or null (got ${value}).`,
    );
  }
  const next = { ...spec.style.params };
  if (value === null) delete next[paramId];
  else next[paramId] = clampParam(def, value);
  return {
    spec: { ...spec, style: { ...spec.style, params: next } },
    reset: [],
  };
}

export const SIZE_LIMITS = { min: 160, max: 1600 } as const;

/** Sizes keep one decimal: the page grid's widths aren't whole pixels (581,1). */
export function roundSize(size: number): number {
  return Math.round(size * 10) / 10;
}

export function clampSize(size: number): number {
  return roundSize(Math.min(SIZE_LIMITS.max, Math.max(SIZE_LIMITS.min, size)));
}

function assertDecimals(format: Partial<NumberFormat>) {
  const { decimals } = format;
  if (
    decimals != null &&
    !(Number.isInteger(decimals) && decimals >= 0 && decimals <= 6)
  ) {
    throw new Error(
      `Format decimals must be an integer from 0 to 6 or null (got ${decimals}).`,
    );
  }
}

/** Pillar, sizes, margin and the main format. Options, params and extra formats have their own setters. */
export type StylePatch = Partial<
  Pick<StyleSpec, "pillar" | "width" | "height" | "margin" | "format">
>;

export function setStyle(spec: ChartSpec, patch: StylePatch): SpecChange {
  if (
    patch.pillar !== undefined &&
    !pillarPalettes.some((p) => p.id === patch.pillar)
  ) {
    throw new Error(`Unknown pillar ${patch.pillar}.`);
  }
  const sizes: Partial<Pick<StyleSpec, "width" | "height">> = {};
  for (const key of ["width", "height"] as const) {
    const size = patch[key];
    if (size === undefined) continue;
    if (size !== null && !(Number.isFinite(size) && size > 0)) {
      throw new Error(
        `Style ${key} must be a positive number or null (got ${size}).`,
      );
    }
    sizes[key] = size === null ? null : clampSize(size);
  }
  if (patch.margin != null && !isMarginPresetId(patch.margin)) {
    throw new Error(`Unknown margin preset "${patch.margin}".`);
  }
  if (patch.format) assertDecimals(patch.format);
  // Only the keys of a style patch are copied, whatever else the object carries.
  const style = { ...spec.style, ...sizes };
  if (patch.pillar !== undefined) style.pillar = patch.pillar;
  if (patch.margin !== undefined) style.margin = patch.margin;
  if (patch.format !== undefined) style.format = patch.format;
  return { spec: { ...spec, style }, reset: [] };
}

/**
 * Patches a number format: the main one, or the chart's extra format
 * `formatId` (declared in the registry), which starts from its default.
 */
export function setFormat(
  spec: ChartSpec,
  patch: Partial<NumberFormat>,
  formatId: string | undefined,
  registry: ChartRegistry,
): SpecChange {
  assertDecimals(patch);
  const { format, formats } = spec.style;
  if (formatId === undefined) {
    return {
      spec: {
        ...spec,
        style: { ...spec.style, format: { ...format, ...patch } },
      },
      reset: [],
    };
  }
  const def = spec.chart
    ? registry.require(spec.chart).formats?.find((f) => f.id === formatId)
    : undefined;
  if (!def)
    throw new Error(`Unknown format "${formatId}" for chart "${spec.chart}".`);
  const next = { ...resolveFormat(def, formats[formatId]), ...patch };
  return {
    spec: {
      ...spec,
      style: { ...spec.style, formats: { ...formats, [formatId]: next } },
    },
    reset: [],
  };
}

/**
 * Fills each required channel that has no column yet with a compatible
 * column no other channel uses. Year-like number columns (`yearLike`) go
 * first for channels that take dates (an x axis) and last for the others
 * (a measure). Leaves existing mappings alone.
 */
export function autoEncode(
  spec: ChartSpec,
  registry: ChartRegistry,
  yearLike: ReadonlySet<string> = new Set(),
): SpecChange {
  const channels = channelsOf(spec, registry);
  if (!channels) return { spec, reset: [] };

  const encoding = { ...spec.encoding };
  const used = new Set(Object.values(encoding));
  for (const channel of channels) {
    if (!channel.required || encoding[channel.id]) continue;
    const wantsTime = channel.accepts.includes("date");
    const isTime = (c: ColumnSchema) =>
      c.type === "date" || yearLike.has(c.name);
    const candidates = compatibleColumns(channel, spec.data.columns).filter(
      (c) => !used.has(c.name),
    );
    const column =
      candidates.find((c) => isTime(c) === wantsTime) ?? candidates[0];
    if (!column) continue;
    encoding[channel.id] = column.name;
    used.add(column.name);
  }
  return { spec: { ...spec, encoding }, reset: [] };
}
