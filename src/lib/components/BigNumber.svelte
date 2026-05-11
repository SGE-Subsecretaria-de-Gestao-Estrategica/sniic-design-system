<script lang="ts">
  import { white, black, typography } from '../tokens.js';

  interface Props {
    value: string | number;
    suffix?: string;
    label?: string;
    fontSize?: number;
    color?: string;
    shadowColor?: string;
    shadowDepth?: number;
  }

  let {
    value,
    suffix = '',
    label = '',
    fontSize = 96,
    color = white,
    shadowColor = black,
    shadowDepth = 8,
  }: Props = $props();

  const outlineSize = $derived(Math.max(2, Math.round(fontSize * 0.035)));

  const textShadow = $derived.by(() => {
    const o = outlineSize;
    const d = shadowDepth;
    const c = shadowColor;

    // Outline: 8 directions
    const outline = [
      `-${o}px -${o}px 0 ${c}`,
      `${o}px -${o}px 0 ${c}`,
      `-${o}px ${o}px 0 ${c}`,
      `${o}px ${o}px 0 ${c}`,
      `0 -${o}px 0 ${c}`,
      `0 ${o}px 0 ${c}`,
      `-${o}px 0 0 ${c}`,
      `${o}px 0 0 ${c}`,
    ];

    // Block shadow layers: offset steps down-right
    const block = Array.from({ length: d }, (_, i) => {
      const step = i + 1;
      return `${step}px ${step}px 0 ${c}`;
    });

    return [...outline, ...block].join(', ');
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="big-number" style="font-family: {typography.chartValueFontFamily};">
  <span
    class="value"
    style="
      font-size: {fontSize}px;
      color: {color};
      text-shadow: {textShadow};
      line-height: 1;
    "
  >{value}{suffix}</span>
  {#if label}
    <span
      class="label"
      style="
        font-size: {Math.round(fontSize * 0.22)}px;
        color: {color};
        opacity: 0.75;
      "
    >{label}</span>
  {/if}
</div>

<style>
  .big-number {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25em;
  }

  .value {
    display: block;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .label {
    display: block;
    font-weight: 600;
    letter-spacing: 0.01em;
    text-align: center;
  }
</style>
