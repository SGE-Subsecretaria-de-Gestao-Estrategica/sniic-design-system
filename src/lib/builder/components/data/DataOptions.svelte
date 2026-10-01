<script lang="ts">
  import { DECIMAL_SEPARATORS } from "../../data/coerce";
  import { FIELD_SEPARATORS } from "../../data/table";
  import type { DecimalSeparator, FieldSeparator } from "../../data/types";

  type Props = {
    delimiter: FieldSeparator;
    decimal: DecimalSeparator;
    ondelimiter: (delimiter: FieldSeparator) => void;
    ondecimal: (decimal: DecimalSeparator) => void;
  };

  let { delimiter, decimal, ondelimiter, ondecimal }: Props = $props();

  const DELIMITER_LABELS: Record<FieldSeparator, string> = {
    ";": ";",
    ",": ",",
    "\t": "Tab",
    "|": "|",
  };
</script>

<div class="data-options">
  <label>
    Separador de campos
    <select
      value={delimiter}
      onchange={(e) => ondelimiter(e.currentTarget.value as FieldSeparator)}
    >
      {#each FIELD_SEPARATORS as separator (separator)}
        <option value={separator}>{DELIMITER_LABELS[separator]}</option>
      {/each}
    </select>
  </label>

  <label>
    Separador decimal
    <select
      value={decimal}
      onchange={(e) => ondecimal(e.currentTarget.value as DecimalSeparator)}
    >
      {#each DECIMAL_SEPARATORS as separator (separator)}
        <option value={separator}>{separator}</option>
      {/each}
    </select>
  </label>
</div>

<style>
  .data-options {
    display: flex;
    gap: 24px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
