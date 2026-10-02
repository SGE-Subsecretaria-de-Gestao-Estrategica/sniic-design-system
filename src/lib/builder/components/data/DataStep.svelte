<script lang="ts">
  import { formatLocale } from "$lib/core/format";
  import type { BuilderState } from "../../state/BuilderState.svelte";
  import DataOptions from "./DataOptions.svelte";
  import DataPreview from "./DataPreview.svelte";
  import FileInput from "./FileInput.svelte";

  let { builder }: { builder: BuilderState } = $props();

  const formatCount = formatLocale.format(",");

  const data = $derived(builder.spec.data);
  const table = $derived(builder.table);
</script>

<section class="data-step">
  <FileInput fileName={data.fileName} onfile={(file) => builder.loadFile(file)} />

  {#if builder.error}
    <p class="error" role="alert">{builder.error}</p>
  {/if}

  {#if table}
    {#if builder.source?.encoding === "windows-1252"}
      <p class="note">O arquivo não estava em UTF-8; foi lido como Windows-1252.</p>
    {/if}

    <DataOptions
      delimiter={data.delimiter}
      decimal={data.decimal}
      ondelimiter={(d) => builder.setDelimiter(d)}
      ondecimal={(d) => builder.setDecimal(d)}
    />

    <p class="summary">
      {formatCount(table.rows.length)} linhas · {formatCount(table.columns.length)} colunas
    </p>
    {#if table.columns.length === 1}
      <p class="warning">Só uma coluna foi encontrada. Confira o separador de campos.</p>
    {/if}
    <DataPreview
      {table}
      columns={data.columns}
      decimal={data.decimal}
      issues={builder.issues}
      ontype={(column, type) => builder.setColumnType(column, type)}
      onpattern={(column, pattern) => builder.setDatePattern(column, pattern)}
    />
  {/if}
</section>

<style>
  .data-step {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: system-ui, sans-serif;
  }
  .error {
    color: #b42318;
  }
  .warning {
    color: #b54708;
  }
  .note,
  .summary {
    color: #555;
  }
</style>
