<script lang="ts">
  import { white, black, typography } from '../tokens.js';

  interface Props {
    value: string | number;
    suffix?: string;
    label?: string;
    subtitle?: string;
    fontSize?: number;
    color?: string;
    shadowColor?: string;
    shadowDepth?: number;
    width?: number;
    labelColor?: string;
    subtitleColor?: string;
  }

  let {
    value,
    suffix = '',
    label = '',
    subtitle = '',
    fontSize = 96,
    color = white,
    shadowColor = black,
    shadowDepth = 8,
    width = 400,
    labelColor = black,
    subtitleColor = black,
  }: Props = $props();

  const outlineSize = $derived(Math.max(2, Math.round(fontSize * 0.035)));
  const labelFontSize = $derived(Math.round(fontSize * 0.22));
  const subtitleFontSize = $derived(Math.round(fontSize * 0.18));
  const cx = $derived(width / 2);

  // Vertical layout: y positions are text baselines
  const topPad = $derived(Math.round(fontSize * 0.12));
  const valueBaseline = $derived(topPad + Math.round(fontSize * 0.85));
  const labelGap = $derived(Math.round(fontSize * 0.18));
  const labelBaseline = $derived(valueBaseline + labelGap + labelFontSize);
  const subtitleGap = $derived(Math.round(fontSize * 0.14));
  const subtitleBaseline = $derived(
    (label ? labelBaseline : valueBaseline) + subtitleGap + subtitleFontSize
  );
  const bottomPad = $derived(topPad);

  const svgHeight = $derived.by(() => {
    const lastBaseline = subtitle
      ? subtitleBaseline
      : label
        ? labelBaseline
        : valueBaseline + Math.round(fontSize * 0.2);
    return lastBaseline + bottomPad;
  });

  const letterSpacingValue = $derived(Math.round(fontSize * -0.02));
  const fontFamily = typography.chartValueFontFamily;
</script>

<svg
  {width}
  height={svgHeight}
  viewBox="0 0 {width} {svgHeight}"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Block shadow layers (painted bottom-up so largest offset is furthest back) -->
  {#each Array.from({ length: shadowDepth }, (_, i) => shadowDepth - i) as step (step)}
    <text
      x={cx + step}
      y={valueBaseline + step}
      text-anchor="middle"
      fill={shadowColor}
      font-family={fontFamily}
      font-size={fontSize}
      font-weight="700"
      letter-spacing="{letterSpacingValue}px"
    >{value}{suffix}</text>
  {/each}

  <!-- Main value text with stroke outline -->
  <text
    x={cx}
    y={valueBaseline}
    text-anchor="middle"
    fill={color}
    stroke={shadowColor}
    stroke-width={outlineSize * 2}
    paint-order="stroke fill"
    font-family={fontFamily}
    font-size={fontSize}
    font-weight="700"
    letter-spacing="{letterSpacingValue}px"
  >{value}{suffix}</text>

  <!-- Label (existing prop) -->
  {#if label}
    <text
      x={cx}
      y={labelBaseline}
      text-anchor="middle"
      fill={labelColor}
      font-family={fontFamily}
      font-size={labelFontSize}
      font-weight="600"
    >{label}</text>
  {/if}

  <!-- Subtitle: centered text below the big number -->
  {#if subtitle}
    <text
      x={cx}
      y={subtitleBaseline}
      text-anchor="middle"
      fill={subtitleColor}
      font-family={fontFamily}
      font-size={subtitleFontSize}
      font-weight="400"
    >{subtitle}</text>
  {/if}
</svg>
