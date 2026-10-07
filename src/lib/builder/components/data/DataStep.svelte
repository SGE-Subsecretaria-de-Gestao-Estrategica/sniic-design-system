<script lang="ts">
  import { formatLocale } from "$lib/core/format";
  import { SAVED_CHART_EXTENSION } from "../../spec/saved";
  import type { BuilderState } from "../../state/BuilderState.svelte";
  import DataOptions from "./DataOptions.svelte";
  import DataPreview from "./DataPreview.svelte";
  import FileInput from "./FileInput.svelte";
  import "../ui/tokens.css";

  let { builder }: { builder: BuilderState } = $props();

  const formatCount = formatLocale.format(",");

  const data = $derived(builder.spec.data);
  const table = $derived(builder.table);
</script>

<section class="data-step">
  <div class="files">
    <FileInput
      fileName={data.fileName}
      onfile={(file) => builder.loadFile(file)}
    />
    <FileInput
      label="Gráfico salvo"
      accept={SAVED_CHART_EXTENSION}
      action="Abrir gráfico salvo"
      hint="Arquivo .json salvo por este construtor"
      variant="secondary"
      fileName={builder.pending?.name ?? null}
      onfile={(file) => builder.openSaved(file)}
    />
  </div>

  {#if builder.pending}
    <p class="note" role="status">
      Gráfico salvo aberto. Escolha agora o arquivo CSV com os dados: as
      escolhas valem para as colunas que ainda existirem.
    </p>
  {/if}

  {#if builder.error}
    <p class="error" role="alert">{builder.error}</p>
  {/if}

  {#if table}
    {#if builder.source?.encoding === "windows-1252"}
      <p class="note">
        O arquivo não estava em UTF-8; foi lido como Windows-1252.
      </p>
    {/if}

    <DataOptions
      delimiter={data.delimiter}
      decimal={data.decimal}
      ondelimiter={(d) => builder.setDelimiter(d)}
      ondecimal={(d) => builder.setDecimal(d)}
    />

    <p class="summary">
      {formatCount(table.rows.length)} linhas · {formatCount(
        table.columns.length,
      )} colunas
    </p>
    {#if table.columns.length === 1}
      <p class="warning">
        Só uma coluna foi encontrada. Confira o separador de campos.
      </p>
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
    color: var(--builder-ink);
    font-family: var(--builder-font);
    font-size: var(--builder-text);
  }
  .files {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 48px;
  }
  p {
    margin: 0;
  }
  .error {
    color: var(--builder-danger);
  }
  .warning {
    color: var(--builder-warning);
  }
  .note,
  .summary {
    color: var(--builder-muted);
    font-size: var(--builder-text-sm);
  }
</style>
