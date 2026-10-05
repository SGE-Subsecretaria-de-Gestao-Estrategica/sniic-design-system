<script lang="ts">
  import { formatLocale } from "$lib/core/format";
  import type { Aggregation } from "../../spec/types";
  import Field from "../ui/Field.svelte";
  import Select from "../ui/Select.svelte";

  type Props = {
    aggregate: Aggregation;
    /** Rows merged into another because they repeat the chart's keys. */
    combined: number;
    onaggregate: (aggregate: Aggregation) => void;
  };

  let { aggregate, combined, onaggregate }: Props = $props();

  const AGGREGATIONS: { value: Aggregation; label: string }[] = [
    { value: "sum", label: "Soma" },
    { value: "mean", label: "Média" },
    { value: "count", label: "Contagem" },
    { value: "first", label: "Primeiro valor" },
  ];

  const formatCount = formatLocale.format(",");
</script>

<Field
  label="Linhas repetidas"
  note="{formatCount(combined)} {combined === 1
    ? 'linha foi combinada'
    : 'linhas foram combinadas'} com outras de mesma chave."
>
  <Select
    value={aggregate}
    onchange={(e) => onaggregate(e.currentTarget.value as Aggregation)}
  >
    {#each AGGREGATIONS as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </Select>
</Field>
