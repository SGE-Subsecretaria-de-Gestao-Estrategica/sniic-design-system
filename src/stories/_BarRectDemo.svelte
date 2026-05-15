<script lang="ts">
  import BarRect from '../lib/components/atoms/BarRect.svelte';

  interface Props {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    rx?: number;
    opacity?: number;
    stroke?: string;
    strokeWidth?: number;
    shapeRendering?: string;
    title?: string;
  }

  let {
    x = 20,
    y = 20,
    width = 200,
    height = 40,
    fill = '#4271b5',
    rx = 0,
    opacity = undefined,
    stroke = undefined,
    strokeWidth = undefined,
    shapeRendering = undefined,
    title = undefined,
  }: Props = $props();
</script>

<svg width={300} height={100} style="background: #fafafa; border: 1px solid #eee;">
  <BarRect {x} {y} {width} {height} {fill} {rx} {opacity} {stroke} {strokeWidth} {shapeRendering} {title} />
</svg>
