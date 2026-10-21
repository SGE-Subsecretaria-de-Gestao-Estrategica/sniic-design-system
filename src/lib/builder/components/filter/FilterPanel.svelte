<script lang="ts">
  import { formatLocale } from "$lib/core/format";
  import type { ColumnSchema, Row } from "../../data/types";
  import { filterRows, filterValues } from "../../resolve/filter";
  import { filterableColumns } from "../../spec/spec";
  import type { Filter } from "../../spec/types";
  import Button from "../ui/Button.svelte";
  import Checkbox from "../ui/Checkbox.svelte";
  import Field from "../ui/Field.svelte";
  import Fieldset from "../ui/Fieldset.svelte";
  import Select from "../ui/Select.svelte";

  type Props = {
    columns: readonly ColumnSchema[];
    /** Every row of the file, before any filter. */
    rows: readonly Row[];
    filters: readonly Filter[];
    onchange: (filters: Filter[]) => void;
  };

  let { columns, rows, filters, onchange }: Props = $props();

  const formatCount = formatLocale.format(",");
  const filterable = $derived(filterableColumns(columns));
  const unused = $derived(
    filterable.filter((c) => !filters.some((f) => f.column === c.name)),
  );
  const kept = $derived(filterRows(rows, filters).rows.length);

  function replace(index: number, filter: Filter | null) {
    const next = [...filters];
    if (filter) next[index] = filter;
    else next.splice(index, 1);
    onchange(next);
  }

  function add() {
    const column = unused[0];
    if (column) onchange([...filters, { column: column.name, exclude: [] }]);
  }

  function toggle(index: number, value: string, shown: boolean) {
    const { column, exclude } = filters[index];
    replace(index, {
      column,
      exclude: shown
        ? exclude.filter((v) => v !== value)
        : [...exclude, value],
    });
  }
</script>

<Fieldset legend="Filtrar dados">
  {#if !filterable.length}
    <p class="hint">Só colunas de texto ou UF podem ser filtradas.</p>
  {/if}

  {#each filters as filter, index (filter.column)}
    {@const values = filterValues(rows, filter.column)}
    {@const shown = values.filter((v) => !filter.exclude.includes(v))}
    <div class="filter">
      <div class="head">
        <Field label="Coluna">
          <Select
            size="sm"
            value={filter.column}
            onchange={(e) =>
              replace(index, { column: e.currentTarget.value, exclude: [] })}
          >
            {#each filterable as column (column.name)}
              {#if column.name === filter.column || unused.includes(column)}
                <option value={column.name}>{column.name}</option>
              {/if}
            {/each}
          </Select>
        </Field>
        <Button
          variant="icon"
          aria-label="Remover o filtro de {filter.column}"
          title="Remover filtro"
          onclick={() => replace(index, null)}
        >
          ×
        </Button>
      </div>

      <div class="bulk">
        <span class="hint">
          {formatCount(shown.length)} de {formatCount(values.length)}
          {values.length === 1 ? "valor" : "valores"}
        </span>
        <Button
          size="sm"
          disabled={!filter.exclude.length}
          onclick={() => replace(index, { column: filter.column, exclude: [] })}
        >
          Todos
        </Button>
        <Button
          size="sm"
          disabled={!shown.length}
          onclick={() =>
            replace(index, { column: filter.column, exclude: values })}
        >
          Nenhum
        </Button>
      </div>

      <div class="checks">
        {#each values as value (value)}
          <Checkbox
            checked={!filter.exclude.includes(value)}
            onchange={(e) => toggle(index, value, e.currentTarget.checked)}
          >
            {value === "" ? "(vazio)" : value}
          </Checkbox>
        {/each}
      </div>
    </div>
  {/each}

  {#if filterable.length}
    <div class="foot">
      <Button size="sm" disabled={!unused.length} onclick={add}>
        Adicionar filtro
      </Button>
      {#if filters.length}
        <span class="hint">
          {formatCount(kept)} de {formatCount(rows.length)} linhas no gráfico
        </span>
      {/if}
    </div>
  {/if}
</Fieldset>

<style>
  .filter {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--builder-line-soft);
  }
  .head {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }
  .head > :global(:first-child) {
    flex: 1;
    min-width: 0;
  }
  .bulk,
  .foot {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .bulk .hint {
    flex: 1;
  }
  .checks {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow: auto;
  }
  .hint {
    margin: 0;
    color: var(--builder-faint);
    font: var(--builder-text-xs) var(--builder-font);
  }
</style>
