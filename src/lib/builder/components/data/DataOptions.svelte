<script lang="ts">
  import { DECIMAL_SEPARATORS } from "../../data/coerce";
  import { FIELD_SEPARATORS } from "../../data/table";
  import type { DecimalSeparator, FieldSeparator } from "../../data/types";
  import Field from "../ui/Field.svelte";
  import Select from "../ui/Select.svelte";

  type Props = {
    delimiter: FieldSeparator;
    decimal: DecimalSeparator;
    ondelimiter: (delimiter: FieldSeparator) => void;
    ondecimal: (decimal: DecimalSeparator) => void;
  };

  let { delimiter, decimal, ondelimiter, ondecimal }: Props = $props();

  const DELIMITER_LABELS: Record<FieldSeparator, string> = {
    ";": "Ponto e vírgula ( ; )",
    ",": "Vírgula ( , )",
    "\t": "Tabulação",
    "|": "Barra vertical ( | )",
  };

  const DECIMAL_LABELS: Record<DecimalSeparator, string> = {
    ",": "Vírgula (1.234,5)",
    ".": "Ponto (1,234.5)",
  };
</script>

<div class="data-options">
  <Field label="Separador de campos">
    <Select
      value={delimiter}
      onchange={(e) => ondelimiter(e.currentTarget.value as FieldSeparator)}
    >
      {#each FIELD_SEPARATORS as separator (separator)}
        <option value={separator}>{DELIMITER_LABELS[separator]}</option>
      {/each}
    </Select>
  </Field>

  <Field label="Separador decimal">
    <Select
      value={decimal}
      onchange={(e) => ondecimal(e.currentTarget.value as DecimalSeparator)}
    >
      {#each DECIMAL_SEPARATORS as separator (separator)}
        <option value={separator}>{DECIMAL_LABELS[separator]}</option>
      {/each}
    </Select>
  </Field>
</div>

<style>
  .data-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 220px));
    gap: 16px;
  }
</style>
