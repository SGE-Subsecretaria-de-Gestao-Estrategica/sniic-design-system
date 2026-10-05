<script lang="ts">
  import type { Snippet } from "svelte";
  import type { MarginPresetId } from "../../registry/margins";
  import { resolveFormat } from "../../registry/params";
  import type { AnyChartDefinition } from "../../registry/types";
  import type { ChartResolution } from "../../resolve/types";
  import type { NumberFormat, StyleSpec } from "../../spec/types";
  import NumberFormatFields from "./NumberFormatFields.svelte";
  import ParamFields from "./ParamFields.svelte";
  import PillarPicker from "./PillarPicker.svelte";
  import SizeFields from "./SizeFields.svelte";

  type Props = {
    definition: AnyChartDefinition;
    style: StyleSpec;
    resolution: ChartResolution;
    onpillar: (pillar: number) => void;
    onsize: (axis: "width" | "height", size: number | null) => void;
    onmargin: (margin: MarginPresetId) => void;
    /** `null` restores the layout's default. */
    onparam: (paramId: string, value: number | null) => void;
    /** `formatId`: one of the chart's extra formats; without it, the main format. */
    onformat: (patch: Partial<NumberFormat>, formatId?: string) => void;
    /** The chart's own style options, drawn right after the pillar. */
    chartOptions?: Snippet;
  };

  let {
    definition,
    style,
    resolution,
    onpillar,
    onsize,
    onmargin,
    onparam,
    onformat,
    chartOptions,
  }: Props = $props();

  const ready = $derived(resolution.status === "ready" ? resolution : null);
  const formats = $derived(definition.formats ?? []);
</script>

<div class="style-step">
  <PillarPicker pillar={style.pillar} {onpillar} />

  {@render chartOptions?.()}

  <SizeFields
    {definition}
    {style}
    figure={ready?.figure ?? null}
    {onsize}
    {onmargin}
  />

  {#if definition.params?.length}
    <ParamFields
      params={definition.params}
      {style}
      solved={ready?.solved ?? {}}
      {onparam}
    />
  {/if}

  <NumberFormatFields
    legend={formats.length
      ? "Formato dos valores principais"
      : "Formato dos números"}
    format={style.format}
    onformat={(patch) => onformat(patch)}
  />
  {#each formats as def (def.id)}
    <NumberFormatFields
      legend={def.label}
      format={resolveFormat(def, style.formats[def.id])}
      onformat={(patch) => onformat(patch, def.id)}
    />
  {/each}
</div>

<style>
  .style-step {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
</style>
