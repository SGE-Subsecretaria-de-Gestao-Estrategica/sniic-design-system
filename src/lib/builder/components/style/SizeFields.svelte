<script lang="ts">
  import type { LayoutBox } from "$lib/core/layouts/types";
  import { MARGIN_PRESETS, type MarginPresetId } from "../../registry/margins";
  import type { AnyChartDefinition } from "../../registry/types";
  import {
    WIDTH_PRESETS,
    widthPresetOf,
    type WidthPreset,
  } from "../../registry/widths";
  import { SIZE_LIMITS } from "../../spec/spec";
  import type { StyleSpec } from "../../spec/types";
  import Field from "../ui/Field.svelte";
  import Fieldset from "../ui/Fieldset.svelte";
  import Input from "../ui/Input.svelte";
  import Select from "../ui/Select.svelte";
  import { formatNumber, readNumber } from "./numbers";

  type Props = {
    definition: AnyChartDefinition;
    style: StyleSpec;
    /** The drawn figure's size, when there is a chart. */
    figure: LayoutBox | null;
    onsize: (axis: "width" | "height", size: number | null) => void;
    onmargin: (margin: MarginPresetId) => void;
  };

  let { definition, style, figure, onsize, onmargin }: Props = $props();

  const sizing = $derived(definition.sizing);
  // The page-grid entry the current width sits on, if any.
  const widthPreset = $derived(
    widthPresetOf(style.width ?? definition.defaultSize.width),
  );

  function presetLabel(preset: WidthPreset): string {
    const note = "note" in preset ? ` (${preset.note})` : "";
    return `${preset.columns} colunas${note}: ${formatNumber(preset.width)} px`;
  }

  function commit(axis: "width" | "height", input: HTMLInputElement) {
    onsize(axis, readNumber(input.value));
    input.value = String(style[axis] ?? "");
  }
</script>

<Fieldset legend="Tamanho">
  {#each ["width", "height"] as const as axis (axis)}
    {@const label = axis === "width" ? "Largura" : "Altura"}
    {@const fitted = sizing[axis] === "fitted"}
    {#if sizing[axis] === "free" || fitted}
      {#if axis === "width"}
        <Field label="Largura na grade da página">
          <Select
            value={widthPreset?.id ?? ""}
            onchange={(e) => {
              const preset = WIDTH_PRESETS.find(
                (p) => p.id === e.currentTarget.value,
              );
              if (preset) onsize("width", preset.width);
            }}
          >
            {#if !widthPreset}
              <option value="">Fora da grade</option>
            {/if}
            {#each WIDTH_PRESETS as preset (preset.id)}
              <option value={preset.id}>{presetLabel(preset)}</option>
            {/each}
          </Select>
        </Field>
      {/if}
      <Field
        label="{label} (px)"
        inline
        note={fitted && style[axis] === null && figure
          ? `Agora: ${Math.round(figure[axis])} px, calculada automaticamente.`
          : undefined}
      >
        <Input
          type="number"
          width="narrow"
          min={SIZE_LIMITS.min}
          max={SIZE_LIMITS.max}
          step="0.1"
          placeholder={fitted
            ? "automática"
            : formatNumber(definition.defaultSize[axis])}
          value={style[axis] ?? ""}
          onchange={(e) => commit(axis, e.currentTarget)}
        />
      </Field>
    {:else}
      <p>
        {label}: {figure ? `${Math.round(figure[axis])} px` : "—"},
        {sizing[axis] === "derived" ? "calculada automaticamente" : "fixa"}.
      </p>
    {/if}
  {/each}

  <Field
    label="Margens"
    note="Topo / direita / base / esquerda, em px. Entre parênteses, as figuras do Eixo 6 que usam cada uma."
  >
    <Select
      value={style.margin ?? definition.margin}
      onchange={(e) => onmargin(e.currentTarget.value as MarginPresetId)}
    >
      {#each MARGIN_PRESETS as preset (preset.id)}
        {@const m = preset.margin}
        <option value={preset.id}>
          {preset.label}: {m.top} / {m.right} / {m.bottom} / {m.left}{preset.id ===
          definition.margin
            ? ", padrão"
            : ""}
        </option>
      {/each}
    </Select>
  </Field>
</Fieldset>

<style>
  p {
    margin: 0;
    color: var(--builder-muted);
    font-size: var(--builder-text-sm);
  }
</style>
