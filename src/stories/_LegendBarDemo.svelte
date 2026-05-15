<script lang="ts">
  import LegendBar from '../lib/components/molecules/LegendBar.svelte';

  interface Props {
    height?: number;
    textPadding?: number;
    strokeWidth?: number;
    contrastLabels?: boolean;
  }

  let {
    height = 34,
    textPadding = 12,
    strokeWidth = 0.5,
    contrastLabels = true,
  }: Props = $props();

  const items = [
    { label: 'Categoria A', color: '#4271b5' },
    { label: 'Categoria B', color: '#ea662f' },
    { label: 'Categoria C', color: '#48a89c' },
  ];

  const svgWidth = 500;
</script>

<svg width={svgWidth} height={height + 20} style="background: #fafafa; border: 1px solid #eee;">
  <g transform="translate(0, 10)">
    <LegendBar {items} y={0} width={svgWidth} {height} {textPadding} {strokeWidth} {contrastLabels} />
  </g>
</svg>
