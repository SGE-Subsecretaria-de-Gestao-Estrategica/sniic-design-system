<script lang="ts">
  import { COLUMN_TYPE_LABELS } from "../../data/labels";
  import type { ColumnSchema } from "../../data/types";
  import type { ChannelDef } from "../../registry/types";
  import { compatibleColumns } from "../../spec/spec";
  import type { Encoding } from "../../spec/types";
  import Field from "../ui/Field.svelte";
  import Select from "../ui/Select.svelte";

  type Props = {
    channels: readonly ChannelDef[];
    columns: readonly ColumnSchema[];
    encoding: Encoding;
    onchange: (channelId: string, column: string | null) => void;
  };

  let { channels, columns, encoding, onchange }: Props = $props();

  // Columns mapped to more than one channel: allowed, but worth flagging.
  const shared = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const column of Object.values(encoding)) {
      counts.set(column, (counts.get(column) ?? 0) + 1);
    }
    return new Set(
      [...counts].filter(([, n]) => n > 1).map(([column]) => column),
    );
  });
</script>

<div class="mapping-step">
  {#each channels as channel (channel.id)}
    {@const options = compatibleColumns(channel, columns)}
    {@const mapped = encoding[channel.id]}
    <Field
      label={channel.label}
      required={channel.required}
      hint="({channel.accepts.map((t) => COLUMN_TYPE_LABELS[t]).join(' ou ')})"
      tone="warning"
      note={!options.length
        ? "Nenhuma coluna compatível."
        : mapped && shared.has(mapped)
          ? `“${mapped}” também está em outro canal.`
          : undefined}
    >
      <Select
        value={mapped ?? ""}
        onchange={(e) => onchange(channel.id, e.currentTarget.value || null)}
      >
        <option value="">—</option>
        {#each options as column (column.name)}
          <option value={column.name}>{column.name}</option>
        {/each}
      </Select>
    </Field>
  {/each}
  <p class="hint">* obrigatório</p>
</div>

<style>
  .mapping-step {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .hint {
    margin: 0;
    color: var(--builder-faint);
    font: var(--builder-text-xs) var(--builder-font);
  }
</style>
