<script lang="ts">
  interface Props {
    /** 'horizontal' draws lines across the chart width; 'vertical' down the height. */
    type?: 'horizontal' | 'vertical';
    /** Scale positions at which to draw lines. */
    positions: number[];
    /** Full cross-axis length (innerWidth for horizontal, innerHeight for vertical). */
    length: number;
    color?: string;
    dashed?: boolean;
    strokeWidth?: number;
  }

  let {
    type = 'horizontal',
    positions,
    length,
    color = '#e2e8f0',
    dashed = false,
    strokeWidth = 1,
  }: Props = $props();

  const dashArray = $derived(dashed ? '3,3' : undefined);
</script>

<g>
  {#each positions as pos}
    {#if type === 'horizontal'}
      <line
        x1={0} x2={length}
        y1={pos} y2={pos}
        stroke={color}
        stroke-width={strokeWidth}
        stroke-dasharray={dashArray}
      />
    {:else}
      <line
        x1={pos} x2={pos}
        y1={0} y2={length}
        stroke={color}
        stroke-width={strokeWidth}
        stroke-dasharray={dashArray}
      />
    {/if}
  {/each}
</g>
