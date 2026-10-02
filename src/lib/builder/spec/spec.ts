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

export function compatibleColumns(
  channel: ChannelDef,
  columns: readonly ColumnSchema[],
): ColumnSchema[] {
  return columns.filter((c) => channel.accepts.includes(c.type));
}

export function missingChannels(
  channels: readonly ChannelDef[],
  encoding: Encoding,
): ChannelDef[] {
  return channels.filter((c) => c.required && !(encoding[c.id]?.length));
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

export function setData(
  spec: ChartSpec,
  data: DataSpec,
  registry: ChartRegistry,
): SpecChange {
  const { encoding, reset } = pruneEncoding(spec.encoding, channelsOf(spec, registry), data.columns);
  return { spec: { ...spec, data, encoding }, reset };
}

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

export const SIZE_LIMITS = { min: 240, max: 1600 } as const;

export function clampSize(size: number): number {
  return Math.round(Math.min(SIZE_LIMITS.max, Math.max(SIZE_LIMITS.min, size)));
}

export function setStyle(spec: ChartSpec, patch: Partial<StyleSpec>): SpecChange {
  if (patch.pillar !== undefined && !pillarPalettes.some((p) => p.id === patch.pillar)) {
    throw new Error(`Unknown pillar ${patch.pillar}.`);
  }
  const sizes: Partial<Pick<StyleSpec, "width" | "height">> = {};
  for (const key of ["width", "height"] as const) {
    const size = patch[key];
    if (size === undefined) continue;
    if (size !== null && !(Number.isFinite(size) && size > 0)) {
      throw new Error(`Style ${key} must be a positive number or null (got ${size}).`);
    }
    sizes[key] = size === null ? null : clampSize(size);
  }
  return { spec: { ...spec, style: { ...spec.style, ...patch, ...sizes } }, reset: [] };
}

export function autoEncode(spec: ChartSpec, registry: ChartRegistry): SpecChange {
  const channels = channelsOf(spec, registry);
  if (!channels) return { spec, reset: [] };

  const encoding = { ...spec.encoding };
  const used = new Set(Object.values(encoding).flat());
  for (const channel of channels) {
    if (!channel.required || encoding[channel.id]?.length) continue;
    const column = compatibleColumns(channel, spec.data.columns).find((c) => !used.has(c.name));
    if (!column) continue;
    encoding[channel.id] = [column.name];
    used.add(column.name);
  }
  return { spec: { ...spec, encoding }, reset: [] };
}
