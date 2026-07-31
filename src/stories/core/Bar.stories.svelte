<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as d3 from "d3";
  import Chart from "$lib/core/components/Chart.svelte";
  import Axis from "$lib/core/components/axis/Axis.svelte";
  import Grid from "$lib/core/components/grid/Grid.svelte";
  import Bar from "$lib/core/components/shape/Bar.svelte";
  import BarStack from "$lib/core/components/shape/BarStack.svelte";
  import BarGroup from "$lib/core/components/shape/BarGroup.svelte";
  import Legend from "$lib/core/components/legend/Legend.svelte";
  import Text from "$lib/core/components/Text.svelte";
  import { getPillarTheme } from "$lib/core/theme";

  const HEIGHT = 380;

  type Datum = {
    region: string;
    museus: number;
    bibliotecas: number;
    teatros: number;
  };

  const data: Datum[] = [
    { region: "Norte", museus: 120, bibliotecas: 260, teatros: 40 },
    { region: "Nordeste", museus: 310, bibliotecas: 520, teatros: 110 },
    { region: "Centro-Oeste", museus: 150, bibliotecas: 210, teatros: 60 },
    { region: "Sudeste", museus: 480, bibliotecas: 610, teatros: 230 },
    { region: "Sul", museus: 290, bibliotecas: 380, teatros: 140 },
  ];

  const keys = ["museus", "bibliotecas", "teatros"] as const;

  const theme = getPillarTheme(6);

  const legendItems = keys.map((key) => ({ label: key }));

  const total = (d: Datum) => keys.reduce((sum, k) => sum + d[k], 0);

  const { Story } = defineMeta({
    title: "Core/Bar",
    component: BarStack,
    argTypes: {
      data: { control: false },
      keys: { control: false },
      xScale: { control: false },
      yScale: { control: false },
      category: { control: false },
      children: { control: false },
      color: { control: false },
      horizontal: { control: { type: "boolean" } },
      rx: { control: { type: "number" } },
    },
    args: {
      horizontal: false,
      rx: 2,
    },
  });
</script>

<!--
  Reference composition for the new architecture: <Chart> owns responsive
  sizing, margins and the theme; every child reads styling from the theme
  context, and scales are built inline from the dimensions it hands down.
-->
<Story name="Stacked">
  {#snippet template(args)}
    <Chart {theme} responsive height={HEIGHT} margin={{ left: 56, bottom: 48 }}>
      {#snippet children({ innerWidth, innerHeight })}
        {@const xScale = d3
          .scaleBand<string>()
          .domain(data.map((d) => d.region))
          .range([0, innerWidth])
          .padding(0.3)}
        {@const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(data, total) ?? 0])
          .nice()
          .range([innerHeight, 0])}

        <Grid
          xScale={xScale}
          yScale={yScale}
          width={innerWidth}
          height={innerHeight}
          columns={false}
        />

        <BarStack
          {...args}
          {data}
          keys={[...keys]}
          category={(d) => d.region}
          {xScale}
          {yScale}
        />

        <Axis orientation="left" scale={yScale} />
        <Axis orientation="bottom" scale={xScale} top={innerHeight} />

        <Legend items={legendItems} top={innerHeight + 34} />
      {/snippet}
    </Chart>
  {/snippet}
</Story>

<Story name="Grouped">
  {#snippet template(args)}
    <Chart {theme} responsive height={HEIGHT} margin={{ left: 56, bottom: 48 }}>
      {#snippet children({ innerWidth, innerHeight })}
        {@const xScale = d3
          .scaleBand<string>()
          .domain(data.map((d) => d.region))
          .range([0, innerWidth])
          .padding(0.2)}
        {@const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d3.max(keys, (k) => d[k])) ?? 0])
          .nice()
          .range([innerHeight, 0])}

        <Grid
          xScale={xScale}
          yScale={yScale}
          width={innerWidth}
          height={innerHeight}
          columns={false}
        />

        <BarGroup
          horizontal={args.horizontal}
          rx={args.rx}
          {data}
          keys={[...keys]}
          category={(d) => d.region}
          {xScale}
          {yScale}
        />

        <Axis orientation="left" scale={yScale} />
        <Axis orientation="bottom" scale={xScale} top={innerHeight} />

        <Legend items={legendItems} top={innerHeight + 34} />
      {/snippet}
    </Chart>
  {/snippet}
</Story>

<!-- The `children` snippet is the escape hatch: take the computed geometry
     and render whatever you need on top of it. -->
<Story name="Horizontal with labels">
  {#snippet template()}
    <Chart {theme} responsive height={HEIGHT} margin={{ left: 96, bottom: 32 }}>
      {#snippet children({ innerWidth, innerHeight })}
        {@const yScale = d3
          .scaleBand<string>()
          .domain(data.map((d) => d.region))
          .range([0, innerHeight])
          .padding(0.3)}
        {@const xScale = d3
          .scaleLinear()
          .domain([0, d3.max(data, total) ?? 0])
          .nice()
          .range([0, innerWidth])}

        <BarStack
          horizontal
          {data}
          keys={[...keys]}
          category={(d) => d.region}
          {xScale}
          {yScale}
          rx={2}
        >
          {#snippet children({ barStacks })}
            {#each barStacks as stack (stack.key)}
              {#each stack.bars as bar (`${stack.key}-${bar.index}`)}
                <Bar
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={bar.color}
                  rx={2}
                />
                {#if bar.width > 34}
                  <Text
                    x={bar.x + bar.width / 2}
                    y={bar.y + bar.height / 2}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    fill="#fff"
                    fontWeight={700}
                    text={String(bar.value)}
                  />
                {/if}
              {/each}
            {/each}
          {/snippet}
        </BarStack>

        <Axis orientation="left" scale={yScale} />
        <Legend items={legendItems} top={innerHeight + 20} />
      {/snippet}
    </Chart>
  {/snippet}
</Story>
