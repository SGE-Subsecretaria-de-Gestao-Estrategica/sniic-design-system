<script lang="ts">
  import { pillarPalettes } from "$lib/core/theme/tokens";
  import "../ui/tokens.css";

  type Props = { pillar: number; onpillar: (pillar: number) => void };

  let { pillar, onpillar }: Props = $props();

  // Unique per instance, so two builders on a page keep separate radio groups.
  const uid = $props.id();
</script>

<fieldset>
  <legend>Cores</legend>
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
          {#each new Set( [palette.primary, palette.primaryVariant, palette.secondary, palette.secondaryVariant, palette.accent], ) as color, i (color + i)}
            <span style:background={color}></span>
          {/each}
        </span>
        {palette.name}
      </label>
    {/each}
  </div>
</fieldset>

<style>
  fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    font-family: var(--builder-font);
    border: 0;
  }
  legend {
    margin-bottom: 8px;
    padding: 0;
    color: var(--builder-ink-strong);
    font-size: var(--builder-text);
    font-weight: 600;
  }
  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .swatch {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    color: var(--builder-ink);
    font-size: var(--builder-text-sm);
    background: var(--builder-surface);
    border: 1px solid var(--builder-line);
    border-radius: var(--builder-radius);
    cursor: pointer;
  }
  .swatch:hover {
    border-color: var(--builder-faint);
  }
  .swatch.selected {
    padding: 7px;
    font-weight: 600;
    border: 2px solid var(--builder-ink);
  }
  .swatch input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .swatch:focus-within {
    outline: 2px solid var(--builder-ink-strong);
    outline-offset: 2px;
  }
  .colors {
    display: flex;
  }
  .colors span {
    width: 12px;
    height: 20px;
  }
</style>
