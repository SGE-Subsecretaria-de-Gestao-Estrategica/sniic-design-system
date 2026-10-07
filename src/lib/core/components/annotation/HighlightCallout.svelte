<script lang="ts">
  /**
   * A big colored number with a short wrapped sentence under it — the
   * "leia aqui o achado" block that sits in the gutter of a chart. Reads
   * top-down from `(x, y)`: the value first, the description wrapped to
   * `width` below it.
   *
   * Unset styles come from the theme's `calloutValue` and
   * `calloutDescription` text roles.
   */
  import { placeBelowLine } from "$lib/core/layouts/labels";
  import { DefaultTheme, getChartTheme, resolveThemeStyles, type TextStyle } from "$lib/core/theme";
  import type { HighlightCalloutProps } from "$lib/types/HighlightCallout";
  import Text from "../Text.svelte";

  let {
    value,
    description,
    color,
    x,
    y,
    width,
    valueFontSize,
    descriptionFontSize,
    descriptionColor,
    fontFamily,
    descriptionFontWeight,
    gap,
    lineHeight,
  }: HighlightCalloutProps = $props();

  const theme = getChartTheme();

  // The description's position depends on the value's resolved size.
  let valueStyle = $derived(
    resolveThemeStyles<TextStyle>(
      { fontSize: valueFontSize },
      theme?.calloutValue,
      DefaultTheme.calloutValue,
    ),
  );
  let descriptionY = $derived(placeBelowLine(y, Number(valueStyle.fontSize), gap));
</script>

<Text
  variant="calloutValue"
  {x}
  {y}
  verticalAnchor="start"
  {fontFamily}
  fontSize={valueFontSize}
  fill={color}
  text={value}
/>
<Text
  variant="calloutDescription"
  {x}
  y={descriptionY}
  {width}
  verticalAnchor="start"
  {fontFamily}
  fontSize={descriptionFontSize}
  fontWeight={descriptionFontWeight}
  fill={descriptionColor}
  {lineHeight}
  text={description}
/>
