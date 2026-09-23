<script lang="ts">
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";
  import type { CommonShapeProps } from "$lib/types/Marker";

  let {
    x,
    y,
    size,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    strokeDasharray,
  }: CommonShapeProps = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        size,
        fill,
        fillOpacity,
        stroke,
        strokeWidth,
        strokeOpacity,
        strokeDasharray,
      },
      theme?.marker?.circle,
      DefaultTheme.marker.circle,
    ),
  );
</script>

<circle
  cx={x}
  cy={y}
  r={style.size}
  fill={style.fill}
  stroke={style.stroke}
  fill-opacity={style.fillOpacity}
  stroke-width={style.strokeWidth}
  stroke-opacity={style.strokeOpacity}
  stroke-dasharray={style.strokeDasharray}
/>
