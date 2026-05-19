<script lang="ts">
  import DataTable from '../lib/components/molecules/DataTable.svelte';

  interface Props {
    x?: number;
    y?: number;
    tableWidth?: number;
    minRowHeight?: number;
    headerColor?: string;
    lineColor?: string;
    textColor?: string;
  }

  let {
    x = 10,
    y = 10,
    tableWidth,
    minRowHeight = 32,
    headerColor,
    lineColor,
    textColor,
  }: Props = $props();
</script>

<svg width={700} height={300}>
  <DataTable
    {x}
    {y}
    {tableWidth}
    {minRowHeight}
    {headerColor}
    {lineColor}
    {textColor}
  />
</svg>
