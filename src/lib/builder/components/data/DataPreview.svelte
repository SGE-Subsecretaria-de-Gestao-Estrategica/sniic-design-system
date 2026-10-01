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
            <select
              aria-label="Tipo de {column.name}"
              value={column.type}
              onchange={(e) =>
                ontype(column.name, e.currentTarget.value as ColumnType)}
            >
              {#each TYPES as type (type.value)}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
            {#if column.type === "date"}
              <select
                aria-label="Formato de data de {column.name}"
                value={column.datePattern}
                onchange={(e) =>
                  onpattern(column.name, e.currentTarget.value as DatePattern)}
              >
                {#each DATE_PATTERNS as pattern (pattern)}
                  <option value={pattern}>{pattern}</option>
                {/each}
              </select>
            {/if}
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
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
  th,
  td {
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid #eee;
    white-space: nowrap;
    background: #fff;
  }
  th {
    position: sticky;
    top: 0;
    background: #f5f5f5;
    border-bottom: 1px solid #d9d9d9;
    font-weight: 400;
  }
  th select {
    display: block;
    margin-top: 4px;
  }
  tbody tr:nth-child(even) td {
    background: #fafafa;
  }
  tbody tr:hover td {
    background: #f0f4ff;
  }
  .name {
    font-weight: 600;
  }
  .issue {
    margin-top: 4px;
    color: #b42318;
    white-space: normal;
  }
  .number {
    text-align: right;
  }
  th.number select {
    margin-left: auto;
  }
  .invalid {
    color: #b42318;
    font-style: italic;
  }
</style>
