<script lang="ts">
  import type { TextProps } from "$lib/types/Text";
  import useText from "../hooks/useText.svelte";

  let {
    dx = 0,
    dy = 0,
    textAnchor = "start",
    innerRef = $bindable(null),
    innerTextRef = $bindable(null),
    verticalAnchor,
    angle,
    lineHeight = "1em",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scaleToFit = false,
    capHeight,
    width,
    ...textProps
  }: TextProps = $props();

  let { x = 0, fontSize } = $derived(textProps);

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
  font-size={fontSize}
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
