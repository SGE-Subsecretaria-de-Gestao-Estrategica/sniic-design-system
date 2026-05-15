<script lang="ts">
  import Legend from '../lib/components/atoms/Legend.svelte';

  interface Props {
    swatch?: 'rect' | 'circle';
    direction?: 'row' | 'col';
    spacing?: number;
    fontSize?: number;
    color?: string;
  }

  let {
    swatch = 'rect',
    direction = 'row',
    spacing = 100,
    fontSize = 12,
    color = '#64748b',
  }: Props = $props();

  const items = [
    { label: 'Series A', color: '#4271b5' },
    { label: 'Series B', color: '#ea662f' },
    { label: 'Series C', color: '#48a89c' },
  ];

  const svgW = $derived(direction === 'row' ? items.length * spacing + 40 : 200);
  const svgH = $derived(direction === 'col' ? items.length * spacing + 20 : 40);
</script>

<svg width={svgW} height={svgH} style="background: #fafafa; border: 1px solid #eee;">
  <g transform="translate(10, 10)">
    <Legend {items} {swatch} {direction} {spacing} {fontSize} {color} />
  </g>
</svg>
