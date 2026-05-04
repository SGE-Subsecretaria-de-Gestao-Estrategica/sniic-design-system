<script lang="ts">
  interface Props {
    visible?: boolean;
    x?: number;
    y?: number;
    html?: string;
    offsetX?: number;
    offsetY?: number;
  }

  let {
    visible = false,
    x = 0,
    y = 0,
    html = '',
    offsetX = 12,
    offsetY = -28,
  }: Props = $props();
</script>

{#if visible}
  <div
    class="tooltip"
    style="left: {x + offsetX}px; top: {y + offsetY}px;"
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html html}
  </div>
{/if}

<style>
  .tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.92);
    color: #fffffe;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    pointer-events: none;
    line-height: 1.6;
    max-width: 220px;
    z-index: 10;
  }
</style>
