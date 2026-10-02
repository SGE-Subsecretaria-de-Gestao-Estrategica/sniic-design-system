<script lang="ts">
  import type { ColumnSchema, ColumnType } from "../../data/types";
  import type { ChannelDef } from "../../registry/types";
  import { compatibleColumns } from "../../spec/spec";
  import type { Encoding } from "../../spec/types";

  type Props = {
    channels: readonly ChannelDef[];
    columns: readonly ColumnSchema[];
    encoding: Encoding;
    onchange: (channelId: string, columns: string[]) => void;
  };

  let { channels, columns, encoding, onchange }: Props = $props();

  // Columns mapped to more than one channel: allowed, but worth flagging.
  const shared = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const column of Object.values(encoding).flat()) {
      counts.set(column, (counts.get(column) ?? 0) + 1);
    }
    return new Set([...counts].filter(([, n]) => n > 1).map(([column]) => column));
  });

  const TYPE_LABELS: Record<ColumnType, string> = {
    number: "número",
    date: "data",
    text: "texto",
  };
</script>

<div class="mapping-step">
  {#each channels as channel (channel.id)}
    {@const options = compatibleColumns(channel, columns)}
    {@const mapped = encoding[channel.id] ?? []}
    <label>
      <span>
        {channel.label}{channel.required ? " *" : ""}
        <small>({channel.accepts.map((t) => TYPE_LABELS[t]).join(" ou ")})</small>
      </span>
      {#if channel.multiple}
        <select
          multiple
          onchange={(e) =>
            onchange(channel.id, [...e.currentTarget.selectedOptions].map((o) => o.value))}
        >
          {#each options as column (column.name)}
            <option value={column.name} selected={mapped.includes(column.name)}>
              {column.name}
            </option>
          {/each}
        </select>
      {:else}
        <select
          value={mapped[0] ?? ""}
          onchange={(e) => onchange(channel.id, e.currentTarget.value ? [e.currentTarget.value] : [])}
        >
          <option value="">—</option>
          {#each options as column (column.name)}
            <option value={column.name}>{column.name}</option>
          {/each}
        </select>
      {/if}
      {#if !options.length}
        <small class="warning">Nenhuma coluna compatível.</small>
      {/if}
      {#each mapped.filter((column) => shared.has(column)) as column (column)}
        <small class="warning">“{column}” também está em outro canal.</small>
      {/each}
    </label>
  {/each}
  <p class="hint">* obrigatório</p>
</div>

<style>
  .mapping-step {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  small {
    color: #777;
  }
  .warning {
    color: #b54708;
  }
  .hint {
    margin: 0;
    font-size: 12px;
    color: #777;
  }
</style>
