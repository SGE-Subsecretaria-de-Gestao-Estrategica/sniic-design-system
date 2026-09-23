<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as d3 from "d3";
  import Svg from "$lib/core/components/Svg.svelte";
  import Group from "$lib/core/components/Group.svelte";
  import Axis from "$lib/core/components/axis/Axis.svelte";
  import LinePath from "$lib/core/components/shape/LinePath.svelte";
  import Circle from "$lib/core/components/markers/Circle.svelte";
  import TimelineBreak from "$lib/core/components/annotation/TimelineBreak.svelte";
  import { getPillarTheme } from "$lib/core/theme";
  import Theme from "$lib/core/components/Theme.svelte";

  const WIDTH = 480;
  const HEIGHT = 300;
  const PADDING = 40;

  // A methodology change between 2015 and 2018 makes the series
  // non-comparable across the gap — real data on both sides, but the chart
  // should not read the segment between them as a measured trend.
  const before = [2010, 2011, 2012, 2013, 2014, 2015].map((year) => ({
    year,
    value: 30 + (year - 2010) * 4 + Math.random() * 6,
  }));
  const after = [2018, 2019, 2020, 2021, 2022].map((year) => ({
    year,
    value: 55 + (year - 2018) * 3 + Math.random() * 6,
  }));

  const xScale = d3
    .scaleLinear()
    .domain([2010, 2022])
    .range([0, WIDTH - 2 * PADDING]);
  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([HEIGHT - PADDING, PADDING]);

  const breakX = xScale((2015 + 2018) / 2);

  const { Story } = defineMeta({
    title: "Core/TimelineBreak",
    component: TimelineBreak,
    tags: [],
  });

  const theme = getPillarTheme(1);
</script>

<Story name="Default">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={WIDTH} height={HEIGHT} style="border: 1px solid #eee;">
        <Group left={PADDING}>
          <Axis orientation="bottom" scale={xScale} top={HEIGHT - PADDING} />
          <Axis orientation="left" scale={yScale} />

          <LinePath
            data={before}
            x={(d) => xScale(d.year)}
            y={(d) => yScale(d.value)}
            stroke={theme.palette.primary}
            strokeWidth={2.5}
          />
          <LinePath
            data={after}
            x={(d) => xScale(d.year)}
            y={(d) => yScale(d.value)}
            stroke={theme.palette.primary}
            strokeWidth={2.5}
          />
          <LinePath
            data={[before[before.length - 1], after[0]]}
            x={(d) => xScale(d.year)}
            y={(d) => yScale(d.value)}
            stroke={theme.palette.primary}
            strokeWidth={2}
            strokeOpacity={0.5}
            stroke-dasharray="4 3"
          />

          {#each [...before, ...after] as d (d.year)}
            <Circle x={xScale(d.year)} y={yScale(d.value)} fill={theme.palette.primary} />
          {/each}

          <TimelineBreak x={breakX} axisY={HEIGHT - PADDING} />
        </Group>
      </Svg>
    </Theme>
  {/snippet}
</Story>
