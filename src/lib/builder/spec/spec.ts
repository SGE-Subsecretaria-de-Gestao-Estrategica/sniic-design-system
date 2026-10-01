import type { ColumnSchema } from "../data/types";
import { pillarPalettes } from "$lib/core/theme/tokens";
import type { ChartId } from "../registry/layouts";
import type { ChannelDef, ChartRegistry } from "../registry/types";
import {
  CHART_SPEC_VERSION,
  type ChartSpec,
  type DataSpec,
  type Encoding,
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
    style: { pillar: 1, width: null, height: null, options: {} },
  };
}

/** Columns a channel can take, in schema order (for step 3's selects). */
export function compatibleColumns(
  channel: ChannelDef,
  columns: readonly ColumnSchema[],
): ColumnSchema[] {
  return columns.filter((c) => channel.accepts.includes(c.type));
}

/** Required channels with no column mapped yet. */
export function missingChannels(
  channels: readonly ChannelDef[],
  encoding: Encoding,
): ChannelDef[] {
  return channels.filter((c) => c.required && !(encoding[c.id]?.length));
}

/**
 * Keeps only the mappings that still fit: the channel exists, the column
 * exists and its type is accepted. With `channels` null (no chart), nothing
 * fits. Reports each mapping it cleared.
 */
export function pruneEncoding(
  encoding: Encoding,
  channels: readonly ChannelDef[] | null,
  columns: readonly ColumnSchema[],
): { encoding: Encoding; reset: ResetNotice[] } {
  const byId = new Map((channels ?? []).map((c) => [c.id, c]));
  const schema = new Map(columns.map((c) => [c.name, c]));
  const next: Encoding = {};
  const reset: ResetNotice[] = [];

  for (const [channelId, mapped] of Object.entries(encoding)) {
    const channel = byId.get(channelId);
    const kept: string[] = [];
    for (const column of mapped) {
      const col = schema.get(column);
      if (!channel) {
        reset.push({ channel: channelId, column, reason: "channel-removed" });
      } 
      else if (!col) {
        reset.push({ channel: channelId, column, reason: "column-removed" });
      }
      else if (!channel.accepts.includes(col.type)) {
        reset.push({ channel: channelId, column, reason: "type-mismatch" });
      } else {
        kept.push(column)
      };
    }
    if (kept.length) next[channelId] = kept;
  }
  return { encoding: next, reset };
}

function channelsOf(spec: ChartSpec, registry: ChartRegistry) {
  return spec.chart ? registry.require(spec.chart).channels : null;
}

/** Step 1 changed: the file, separators or column types. */
export function setData(
  spec: ChartSpec,
  data: DataSpec,
  registry: ChartRegistry,
): SpecChange {
  const { encoding, reset } = pruneEncoding(spec.encoding, channelsOf(spec, registry), data.columns);
  return { spec: { ...spec, data, encoding }, reset };
}

/**
 * Step 2 changed. Keeps mappings whose channel id exists in the new chart
 * and still fits; chart options are cleared (they are chart-specific).
 */
export function setChart(
  spec: ChartSpec,
  chartId: ChartId | null,
  registry: ChartRegistry,
): SpecChange {
  if (chartId === spec.chart) return { spec, reset: [] };
  const channels = chartId ? registry.require(chartId).channels : null;
  const { encoding, reset } = pruneEncoding(spec.encoding, channels, spec.data.columns);
  return {
    spec: { ...spec, chart: chartId, encoding, style: { ...spec.style, options: {} } },
    reset,
  };
}

/** Step 3: maps columns to a channel. An empty list clears it. */
export function setEncoding(
  spec: ChartSpec,
  channelId: string,
  columns: readonly string[],
  registry: ChartRegistry,
): SpecChange {
  const channel = channelsOf(spec, registry)?.find((c) => c.id === channelId);
  if (!channel) throw new Error(`Unknown channel "${channelId}" for chart "${spec.chart}".`);
  if (!channel.multiple && columns.length > 1) {
    throw new Error(`Channel "${channelId}" takes a single column.`);
  }
  for (const name of columns) {
    const column = spec.data.columns.find((c) => c.name === name);
    if (!column) throw new Error(`Unknown column "${name}".`);
    if (!channel.accepts.includes(column.type)) {
      throw new Error(`Channel "${channelId}" does not accept ${column.type} column "${name}".`);
    }
  }

  const encoding = { ...spec.encoding };
  if (columns.length) encoding[channelId] = [...columns];
  else delete encoding[channelId];
  return { spec: { ...spec, encoding }, reset: [] };
}

/** Step 4: merges style changes. Throws for an unknown pillar or a size that isn't a positive number. */
export function setStyle(spec: ChartSpec, patch: Partial<StyleSpec>): SpecChange {
  if (patch.pillar !== undefined && !pillarPalettes.some((p) => p.id === patch.pillar)) {
    throw new Error(`Unknown pillar ${patch.pillar}.`);
  }
  for (const key of ["width", "height"] as const) {
    const size = patch[key];
    if (size != null && !(Number.isFinite(size) && size > 0)) {
      throw new Error(`Style ${key} must be a positive number or null (got ${size}).`);
    }
  }
  return { spec: { ...spec, style: { ...spec.style, ...patch } }, reset: [] };
}
