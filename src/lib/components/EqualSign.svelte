<script lang="ts">
  import { white, black, typography } from '../tokens.js';

  interface Props {
    fontSize?: number;
    color?: string;
    shadowColor?: string;
    shadowDepth?: number;
  }

  let {
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

    const block = Array.from({ length: d }, (_, i) => {
      const step = i + 1;
      return `${step}px ${step}px 0 ${c}`;
    });

    return [...outline, ...block].join(', ');
  });
</script>

<span
  class="equal-sign"
  style="
    font-family: {typography.chartValueFontFamily};
    font-size: {fontSize}px;
    color: {color};
    text-shadow: {textShadow};
    line-height: 1;
  "
>=</span>

<style>
  .equal-sign {
    display: inline-block;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
</style>
