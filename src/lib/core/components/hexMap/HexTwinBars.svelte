<script lang="ts" generics="D">
  import type { TwinBarDatum, TwinBarItem } from "$lib/core/layouts/hexMap";
  import { radii, sharedPalette, strokeWidth } from "$lib/core/theme/tokens";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { HexTwinBarsProps } from "$lib/types/HexMap";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Line from "../shape/Line.svelte";
  import HexTiles from "./HexTiles.svelte";

  let {
    layout,
    id,
    top = 0,
    left = 0,
    class: className,
    tileFill = sharedPalette.base[100],
    tileStroke = sharedPalette.base[300],
    tileStrokeWidth = strokeWidth.sm,
    barFill,
    overflowFill,
    barRadius = radii.md,
    showThreshold = true,
    thresholdStroke,
    thresholdStrokeWidth,
    showValues = true,
    showNames = true,
    formatValue = (bar) => String(bar.value),
    formatName = (ufCode) => ufCode,
    valueFill,
    valueFontSize,
    valueFontWeight,
    nameFill,
    nameFontSize,
    nameFontWeight,
  }: HexTwinBarsProps<D> = $props();

  // Built from positions: a type's name may hold spaces, which an id can't.
  const clipId = (tile: TwinBarDatum<D>, bar: TwinBarItem<D>) =>
    `${id}-bar-${tile.index}-${bar.index}`;
</script>

<Group class={["hex-twin-bars", className]} {top} {left}>
  <HexTiles
    class="hex-twin-bars__tiles"
    tiles={layout.tiles.values()}
    pathData={layout.pathData}
    fill={tileFill}
    stroke={tileStroke}
    strokeWidth={tileStrokeWidth}
  />

  <Group class="hex-twin-bars__bars">
    {#each layout.data as tile (tile.key)}
      <Group left={tile.position.x} top={tile.position.y}>
        {#each tile.bars as bar (bar.key)}
          <Group left={bar.x} top={bar.y}>
            <clipPath id={clipId(tile, bar)}>
              <rect height={bar.height} width={bar.width} rx={barRadius} />
            </clipPath>
            <Group clip-path="url(#{clipId(tile, bar)})">
              {#each bar.segments as segment, i (i)}
                <rect
                  y={segment.y}
                  width={bar.width}
                  height={segment.height}
                  fill={(i > 0 && resolveValue(overflowFill, bar, tile)) ||
                    resolveValue(barFill, bar, tile)}
                />
              {/each}
            </Group>
          </Group>
        {/each}

        {#if showThreshold && tile.threshold}
          <Line
            role="baseline"
            from={tile.threshold.from}
            to={tile.threshold.to}
            stroke={thresholdStroke}
            strokeWidth={thresholdStrokeWidth}
          />
        {/if}
      </Group>
    {/each}
  </Group>

  {#if showValues}
    <Group class="hex-twin-bars__values">
      {#each layout.data as tile (tile.key)}
        {#each tile.bars as bar (bar.key)}
          <PlacedLabel
            variant="valueLabel"
            placement={bar.label}
            left={tile.position.x}
            top={tile.position.y}
            text={formatValue(bar, tile)}
            fill={resolveValue(valueFill, bar, tile)}
            fontSize={valueFontSize}
            fontWeight={valueFontWeight}
          />
        {/each}
      {/each}
    </Group>
  {/if}

  {#if showNames}
    <Group class="hex-twin-bars__names">
      {#each layout.tiles.values() as tile (tile.ufCode)}
        <PlacedLabel
          variant="categoryLabel"
          placement={layout.nameLabel}
          left={tile.position.x}
          top={tile.position.y}
          text={formatName(tile.ufCode)}
          fill={nameFill}
          fontSize={nameFontSize}
          fontWeight={nameFontWeight}
        />
      {/each}
    </Group>
  {/if}
</Group>
