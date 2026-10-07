<script lang="ts" generics="D">
  import { sharedPalette, strokeWidth } from "$lib/core/theme/tokens";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { HexChoroplethProps } from "$lib/types/HexMap";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import HexTiles from "./HexTiles.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    stepColors,
    emptyFill = sharedPalette.base[200],
    tileStroke = sharedPalette.base[100],
    tileStrokeWidth = strokeWidth.sm,
    showNames = true,
    showValues = true,
    formatName = (ufCode) => ufCode,
    formatValue = (datum) => String(datum.value),
    labelFill,
    nameFontSize,
    nameFontWeight,
    valueFontSize,
    valueFontWeight,
  }: HexChoroplethProps<D> = $props();

  const byUf = $derived(new Map(layout.data.map((d) => [d.ufCode, d])));
  const emptyTiles = $derived(
    [...layout.tiles.values()].filter((tile) => !byUf.has(tile.ufCode)),
  );
</script>

<Group class={["hex-choropleth", className]} {top} {left}>
  <HexTiles
    class="hex-choropleth__tiles"
    tiles={layout.tiles.values()}
    pathData={layout.pathData}
    fill={(tile) => {
      const datum = byUf.get(tile.ufCode);
      return datum ? stepColors[datum.step] : emptyFill;
    }}
    stroke={tileStroke}
    strokeWidth={tileStrokeWidth}
  />

  {#if showNames}
    <Group class="hex-choropleth__names">
      {#each layout.data as d (d.key)}
        <PlacedLabel
          variant="categoryLabel"
          placement={d.labels.name}
          left={d.position.x}
          top={d.position.y}
          text={formatName(d.ufCode)}
          fill={resolveValue(labelFill, d, d)}
          fontSize={nameFontSize}
          fontWeight={nameFontWeight}
        />
      {/each}
      {#each emptyTiles as tile (tile.ufCode)}
        <PlacedLabel
          variant="categoryLabel"
          placement={layout.emptyLabel}
          left={tile.position.x}
          top={tile.position.y}
          text={formatName(tile.ufCode)}
          fill={resolveValue(labelFill, undefined, tile)}
          fontSize={nameFontSize}
          fontWeight={nameFontWeight}
        />
      {/each}
    </Group>
  {/if}

  {#if showValues}
    <Group class="hex-choropleth__values">
      {#each layout.data as d (d.key)}
        <PlacedLabel
          variant="valueLabel"
          placement={d.labels.value}
          left={d.position.x}
          top={d.position.y}
          text={formatValue(d)}
          fill={resolveValue(labelFill, d, d)}
          fontSize={valueFontSize}
          fontWeight={valueFontWeight}
        />
      {/each}
    </Group>
  {/if}
</Group>
