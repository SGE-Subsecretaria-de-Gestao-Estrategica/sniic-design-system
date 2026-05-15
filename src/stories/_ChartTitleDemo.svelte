<script lang="ts">
  import ChartTitle from '../lib/components/atoms/ChartTitle.svelte';

  interface Props {
    text?: string;
    fontSize?: number;
    color?: string;
    anchor?: 'start' | 'middle' | 'end';
  }

  let {
    text = 'Chart Title',
    fontSize = 16,
    color = '#334155',
    anchor = 'start',
  }: Props = $props();

  const svgW = 400;
  const x = $derived(anchor === 'middle' ? svgW / 2 : anchor === 'end' ? svgW - 10 : 10);
</script>

<svg width={svgW} height={40} style="background: #fafafa; border: 1px solid #eee;">
  <ChartTitle {text} {x} y={24} {fontSize} {color} {anchor} />
</svg>
