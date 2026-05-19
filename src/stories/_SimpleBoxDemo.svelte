<script lang="ts">
  import SimpleBox from '../lib/components/molecules/SimpleBox.svelte';

  interface Props {
    x?: number;
    y?: number;
    title?: string;
    value?: string;
    subtitle?: string;
    boxWidth?: number;
    boxHeight?: number;
    color?: string;
    valueColor?: string;
    valueSize?: number;
  }

  let {
    x = 40,
    y = 40,
    title = '',
    value = '',
    subtitle = '',
    boxWidth = 180,
    boxHeight: boxHeightProp,
    color,
    valueColor,
    valueSize = 32,
  }: Props = $props();
</script>

<svg width={700} height={350}>
  <SimpleBox
    {x}
    {y}
    {title}
    {value}
    {subtitle}
    {boxWidth}
    boxHeight={boxHeightProp}
    {color}
    {valueColor}
    {valueSize}
  />
</svg>
