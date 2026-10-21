<script lang="ts" generics="D">
  import type { MapTile } from "$lib/core/layouts/hexMap";
  import { sharedPalette, strokeWidth } from "$lib/core/theme/tokens";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { HexCategoricalProps } from "$lib/types/HexMap";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import HexTiles from "./HexTiles.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    categoryColors,
    emptyFill = sharedPalette.base[200],
    tileStroke = sharedPalette.base[100],
    tileStrokeWidth = strokeWidth.sm,
    tileOpacity,
    showNames = true,
    formatName = (ufCode) => ufCode,
    labelFill,
    nameFontSize,
    nameFontWeight,
  }: HexCategoricalProps<D> = $props();

  const byUf = $derived(new Map(layout.data.map((d) => [d.ufCode, d])));
  const emptyTiles = $derived(
    [...layout.tiles.values()].filter((tile) => !byUf.has(tile.ufCode)),
  );
  const opacityOf = (tile: MapTile) =>
    resolveValue(tileOpacity, byUf.get(tile.ufCode), tile);
</script>

<Group class={["hex-categorical", className]} {top} {left}>
  <HexTiles
    class="hex-categorical__tiles"
    tiles={layout.tiles.values()}
    pathData={layout.pathData}
    fill={(tile) => {
      const datum = byUf.get(tile.ufCode);
      return datum ? categoryColors[datum.categoryIndex] : emptyFill;
    }}
    stroke={tileStroke}
    strokeWidth={tileStrokeWidth}
    opacity={opacityOf}
  />

  {#if showNames}
    <Group class="hex-categorical__names">
      {#each layout.data as d (d.key)}
        <g opacity={opacityOf(d)}>
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
        </g>
      {/each}
      {#each emptyTiles as tile (tile.ufCode)}
        <g opacity={opacityOf(tile)}>
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
        </g>
      {/each}
    </Group>
  {/if}
</Group>
