<script lang="ts">
  import { DATE_PATTERNS } from "../../data/coerce";
  import { cellFails, describeIssues } from "../../data/issues";
  import type {
    ColumnIssues,
    ColumnSchema,
    ColumnType,
    DatePattern,
    DecimalSeparator,
    Table,
  } from "../../data/types";
  import Select from "../ui/Select.svelte";

  type Props = {
    table: Table;
    columns: ColumnSchema[];
    decimal: DecimalSeparator;
    issues: Record<string, ColumnIssues>;
    ontype: (column: string, type: ColumnType) => void;
    onpattern: (column: string, pattern: DatePattern) => void;
  };

  let { table, columns, decimal, issues, ontype, onpattern }: Props = $props();

  const PREVIEW_ROWS = 20;

  const TYPES: { value: ColumnType; label: string }[] = [
    { value: "number", label: "Número" },
    { value: "date", label: "Data" },
    { value: "text", label: "Texto" },
    { value: "uf", label: "UF" },
  ];

  const visible = $derived(table.rows.slice(0, PREVIEW_ROWS));
</script>

<div class="data-preview">
  <table>
    <thead>
      <tr>
        {#each columns as column (column.name)}
          {@const issue = issues[column.name]}
          <th class:number={column.type === "number"}>
            <div class="name">{column.name}</div>
            <div class="controls">
              <Select
                size="sm"
                aria-label="Tipo de {column.name}"
                value={column.type}
                onchange={(e) =>
                  ontype(column.name, e.currentTarget.value as ColumnType)}
              >
                {#each TYPES as type (type.value)}
                  <option value={type.value}>{type.label}</option>
                {/each}
              </Select>
              {#if column.type === "date"}
                <Select
                  size="sm"
                  aria-label="Formato de data de {column.name}"
                  value={column.datePattern}
                  onchange={(e) =>
                    onpattern(
                      column.name,
                      e.currentTarget.value as DatePattern,
                    )}
                >
                  {#each DATE_PATTERNS as pattern (pattern)}
                    <option value={pattern}>{pattern}</option>
                  {/each}
                </Select>
              {/if}
            </div>
            {#if issue?.failed}
              <div class="issue">
                {describeIssues(column.type, issue.failed, issue.examples)}
              </div>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each visible as raw, i (i)}
        <tr>
          {#each columns as column (column.name)}
            {@const text = raw[column.name]?.trim() ?? ""}
            {@const invalid = cellFails(text, column, decimal)}
            <td
              class:number={column.type === "number"}
              class:invalid
              title={invalid ? "Não foi possível ler este valor" : undefined}
            >
              {text}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .data-preview {
    max-height: 480px;
    overflow: auto;
    font-family: var(--builder-font);
    border: 1px solid var(--builder-line);
    border-radius: var(--builder-radius);
  }
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    color: var(--builder-ink);
    font-size: var(--builder-text-sm);
    font-variant-numeric: tabular-nums;
  }
  th,
  td {
    padding: 7px 12px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--builder-line-soft);
    white-space: nowrap;
    background: var(--builder-surface);
  }
  th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 10px 12px;
    background: var(--builder-wash);
    border-bottom: 1px solid var(--builder-line);
    font-weight: 400;
  }
  .controls {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 112px;
    margin-top: 6px;
  }
  tbody tr:hover td {
    background: var(--builder-wash);
  }
  .name {
    color: var(--builder-ink-strong);
    font-weight: 600;
  }
  .issue {
    max-width: 220px;
    margin-top: 6px;
    color: var(--builder-danger);
    font-size: var(--builder-text-xs);
    white-space: normal;
  }
  .number {
    text-align: right;
  }
  th.number .controls {
    margin-left: auto;
  }
  .invalid {
    color: var(--builder-danger);
    font-style: italic;
  }
</style>
