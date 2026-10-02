<script lang="ts">
  import { formatLocale } from "$lib/core/format";
  import type { ChartResolution } from "../../resolve/types";
  import ChartView from "../ChartView.svelte";

  type Props = {
    resolution: ChartResolution;
    pillar: number;
    id: string;
  };

  let { resolution, pillar, id }: Props = $props();

  const formatCount = formatLocale.format(",");
</script>

<figure class="chart-preview">
  {#if resolution.status === "ready"}
    <ChartView chart={resolution} {id} {pillar} />
    {#if resolution.dropped}
      <figcaption>
        {formatCount(resolution.dropped)}
        {resolution.dropped === 1 ? "linha ignorada" : "linhas ignoradas"} por valores ausentes.
      </figcaption>
    {/if}
  {:else if resolution.status === "incomplete"}
    <p>Escolha uma coluna para: {resolution.missing.map((c) => c.label).join(", ")}.</p>
  {:else if resolution.status === "error"}
    <p class="error" role="alert">{resolution.message}</p>
  {:else}
    <p>{resolution.reason === "no-data" ? "Carregue um arquivo CSV." : "Escolha um gráfico."}</p>
  {/if}
</figure>

<style>
  .chart-preview {
    margin: 0;
    padding: 16px;
    overflow: auto;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }
  figcaption,
  p {
    color: #555;
    font-size: 13px;
  }
  .error {
    color: #b42318;
  }
</style>
