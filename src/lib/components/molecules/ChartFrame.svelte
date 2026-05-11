<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { defaultMargin, type Margin } from '../../tokens.js';

  interface Props {
    width?: number;
    height?: number;
    margin?: Margin;
    /**
     * When true, ignores width/height props and fills the container width,
     * maintaining the aspect ratio (height / width).
     */
    responsive?: boolean;
    role?: string;
    ariaLabel?: string;
    /** Bindable — reports the margin-inset inner width to the parent. */
    innerWidth?: number;
    /** Bindable — reports the margin-inset inner height to the parent. */
    innerHeight?: number;
    /** Bindable — exposes the underlying SVGSVGElement for serialization/export. */
    svgEl?: SVGSVGElement | undefined;
    children?: Snippet;
  }

  let {
    width = 600,
    height = 400,
    margin = defaultMargin,
    responsive = false,
    role = 'img',
    ariaLabel = 'Chart',
    innerWidth = $bindable(0),
    innerHeight = $bindable(0),
    svgEl = $bindable<SVGSVGElement | undefined>(undefined),
    children,
  }: Props = $props();

  let containerEl: HTMLDivElement | undefined = $state();
  let localSvgEl: SVGSVGElement | undefined = $state();
  let containerWidth = $state(width);

  const svgWidth  = $derived(responsive ? containerWidth : width);
  const svgHeight = $derived(responsive ? Math.round(svgWidth * (height / width)) : height);

  $effect(() => {
    innerWidth  = svgWidth  - margin.left - margin.right;
    innerHeight = svgHeight - margin.top  - margin.bottom;
    svgEl = localSvgEl;
  });

  onMount(() => {
    if (!responsive || !containerEl) return;
    containerWidth = containerEl.clientWidth || width;
    const ro = new ResizeObserver(([entry]) => {
      containerWidth = entry.contentRect.width;
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  });
</script>

<div bind:this={containerEl} class="chart-frame">
  <svg
    bind:this={localSvgEl}
    width={svgWidth}
    height={svgHeight}
    {role}
    aria-label={ariaLabel}
  >
    <g transform="translate({margin.left},{margin.top})">
      {@render children?.()}
    </g>
  </svg>
</div>

<style>
  .chart-frame {
    width: 100%;
  }
  svg {
    display: block;
  }
</style>
