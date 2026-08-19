<script lang="ts">
  import useText from "../hooks/useText.svelte";
  import type { TextProps } from "$lib/types/Text";
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";

  let {
    dx = 0,
    dy = 0,
    textAnchor = "start",
    innerRef = $bindable(null),
    innerTextRef = $bindable(null),
    verticalAnchor,
    angle,
    lineHeight,
    scaleToFit = false,
    capHeight,
    width,
    fill,
    fontFamily,
    fontSize,
    fontWeight,
    suffix,
    suffixScale = 0.9,
    suffixXOffset = 0,
    suffixYOffset = 0,
    // Held back from the spread below: `text` is our own prop, and letting it
    // through would emit an invalid `text` attribute on every <text> element.
    text,
    ...textProps
  }: TextProps = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        fill,
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
      },
      theme?.text,
      DefaultTheme.text,
    ),
  );

  let { x = 0 } = $derived(textProps);

  let txt = $derived(
    useText({
      dx,
      dy,
      textAnchor,
      innerRef,
      innerTextRef,
      verticalAnchor,
      angle,
      lineHeight: style.lineHeight,
      scaleToFit,
      capHeight,
      width,
      text,
      ...textProps,
    }),
  );
</script>

<svg
  bind:this={innerRef}
  x={dx}
  y={dy}
  font-size={style.fontSize}
  font-family={style.fontFamily}
  font-weight={style.fontWeight}
  fill={style.fill}
  style:overflow="visible"
>
  {#if txt.wordsByLines.length > 0}
    <text
      bind:this={innerTextRef}
      transform={txt.transform}
      {...textProps}
      text-anchor={textAnchor}
    >
      {#each txt.wordsByLines as line, i (i)}
        <tspan {x} dy={i === 0 ? txt.startDy : style.lineHeight}>
          {line.words.join(" ")}
        </tspan>
      {/each}

      {#if suffix}
        <tspan
          dx={suffixXOffset}
          dy={txt.wordsByLines.length === 1 ? 0 : style.lineHeight}
          font-size={style.fontSize
            ? Number(style.fontSize) * suffixScale
            : undefined}
        >
          {suffix}
        </tspan>
      {/if}
    </text>
  {/if}
</svg>
