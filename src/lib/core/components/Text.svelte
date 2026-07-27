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
    lineHeight = "1em",
    scaleToFit = false,
    capHeight,
    width,
    fill,
    fontFamily,
    fontSize,
    fontWeight,
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
      lineHeight,
      scaleToFit,
      capHeight,
      width,
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
        <tspan {x} dy={i === 0 ? txt.startDy : lineHeight}>
          {line.words.join(" ")}
        </tspan>
      {/each}
    </text>
  {/if}
</svg>
