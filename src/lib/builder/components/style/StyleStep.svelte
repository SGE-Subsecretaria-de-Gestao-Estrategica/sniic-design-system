<script lang="ts">
  import { pillarPalettes } from "$lib/core/theme/tokens";
  import type { LayoutBox } from "$lib/core/layouts/types";
  import type { ChartSizing } from "../../registry/types";
  import { SIZE_LIMITS } from "../../spec/spec";

  type Props = {
    pillar: number;
    width: number | null;
    height: number | null;
    sizing: ChartSizing;
    defaultSize: LayoutBox;
    figure: LayoutBox | null;
    onpillar: (pillar: number) => void;
    onsize: (axis: "width" | "height", size: number | null) => void;
  };

  let {
    pillar,
    width,
    height,
    sizing,
    defaultSize,
    figure,
    onpillar,
    onsize,
  }: Props = $props();

  const uid = $props.id();

  const WIDTH_PRESETS = [480, 640, 938];

  const sizes = $derived({ width, height });

  function read(value: string): number | null {
    return value.trim() === "" ? null : Number(value);
  }

  function commit(axis: "width" | "height", input: HTMLInputElement) {
    onsize(axis, read(input.value));
    input.value = String(sizes[axis] ?? "");
  }
</script>

<div class="style-step">
  <fieldset>
    <legend>Pilar</legend>
    <div class="swatches">
      {#each pillarPalettes as palette (palette.id)}
        <label class="swatch" class:selected={palette.id === pillar}>
          <input
            type="radio"
            name="{uid}-pillar"
            value={palette.id}
            checked={palette.id === pillar}
            onchange={() => onpillar(palette.id)}
          />
          <span class="colors" aria-hidden="true">
            {#each [palette.primary, palette.primaryVariant, palette.secondary, palette.accent] as color (color)}
              <span style:background={color}></span>
            {/each}
          </span>
          Pilar {palette.id}
        </label>
      {/each}
    </div>
  </fieldset>

  {#each ["width", "height"] as const as axis (axis)}
    {@const label = axis === "width" ? "Largura" : "Altura"}
    {#if sizing[axis] === "free"}
      <label class="size">
        {label} (px)
        <input
          type="number"
          min={SIZE_LIMITS.min}
          max={SIZE_LIMITS.max}
          step="1"
          placeholder={String(defaultSize[axis])}
          value={sizes[axis] ?? ""}
          onchange={(e) => commit(axis, e.currentTarget)}
        />
      </label>
      {#if axis === "width"}
        <div class="presets">
          {#each WIDTH_PRESETS as preset (preset)}
            <button type="button" onclick={() => onsize("width", preset)}
              >{preset} px</button
            >
          {/each}
        </div>
      {/if}
    {:else}
      <p class="size-note">
        {label}: {figure ? `${Math.round(figure[axis])} px` : "—"},
        {sizing[axis] === "derived" ? "calculada a partir dos dados" : "fixa"}.
      </p>
    {/if}
  {/each}
</div>

<style>
  .style-step {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }
  legend {
    margin-bottom: 8px;
  }
  .swatches {
    display: flex;
    gap: 8px;
  }
  .swatch {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
  }
  .swatch.selected {
    border: 2px solid #333;
    padding: 7px;
  }
  .swatch input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .swatch:focus-within {
    outline: 2px solid #4f68da;
  }
  .colors {
    display: flex;
  }
  .colors span {
    width: 20px;
    height: 20px;
  }
  .size {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .size input {
    width: 120px;
  }
  .presets {
    display: flex;
    gap: 6px;
    margin-top: -8px;
  }
  .size-note {
    margin: 0;
    color: #555;
  }
</style>
