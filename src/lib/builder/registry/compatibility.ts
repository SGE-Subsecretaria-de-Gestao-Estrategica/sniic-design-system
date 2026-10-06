import { COLUMN_TYPE_LABELS } from "../data/labels";
import type { ColumnSchema, ColumnType } from "../data/types";
import type { ChannelDef } from "./types";

/** Does a channel take a column of `type`? A UF column is text too. */
export function channelAccepts(
  channel: Pick<ChannelDef, "accepts">,
  type: ColumnType,
): boolean {
  return (
    channel.accepts.includes(type) ||
    (type === "uf" && channel.accepts.includes("text"))
  );
}

export type Compatibility = {
  compatible: boolean;
  /** Required channels left without a column in the best assignment. */
  missing: ChannelDef[];
  /** pt-BR, `null` when compatible. */
  reason: string | null;
};

/**
 * Can every required channel get its own column? Tries each assignment (a
 * chart has a handful of channels), so a column two channels could take
 * isn't wasted on the wrong one.
 */
export function chartCompatibility(
  channels: readonly ChannelDef[],
  columns: readonly ColumnSchema[],
): Compatibility {
  const required = channels.filter((c) => c.required);
  let best: ChannelDef[] = required;

  const assign = (
    index: number,
    used: Set<string>,
    unmatched: ChannelDef[],
  ) => {
    if (unmatched.length >= best.length) return;
    if (index === required.length) {
      best = unmatched;
      return;
    }
    const channel = required[index];
    for (const column of columns) {
      if (used.has(column.name) || !channelAccepts(channel, column.type))
        continue;
      assign(index + 1, new Set(used).add(column.name), unmatched);
    }
    assign(index + 1, used, [...unmatched, channel]);
  };
  assign(0, new Set(), []);

  const describe = (c: ChannelDef) =>
    `${c.label} (${c.accepts.map((t) => COLUMN_TYPE_LABELS[t]).join(" ou ")})`;
  return {
    compatible: best.length === 0,
    missing: best,
    reason: best.length
      ? `Faltam colunas para: ${best.map(describe).join(", ")}.`
      : null,
  };
}
