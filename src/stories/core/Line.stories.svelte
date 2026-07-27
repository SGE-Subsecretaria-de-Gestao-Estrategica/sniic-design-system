<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as d3 from "d3";
  import Svg from "$lib/core/components/Svg.svelte";
  import LinePath from "$lib/core/components/shape/LinePath.svelte";
  import Axis from "$lib/core/components/axis/Axis.svelte";
  import Group from "$lib/core/components/Group.svelte";
  import Markers from "$lib/core/components/markers/Markers.svelte";
  import GridColumns from "$lib/core/components/grid/GridColumns.svelte";
  import Circle from "$lib/core/components/markers/Circle.svelte";
  import Text from "$lib/core/components/Text.svelte";
  import { getPillarTheme } from "$lib/core/theme";
  import Theme from "$lib/core/components/Theme.svelte";

  const WIDTH = 500;
  const HEIGHT = 380;
  const PADDING = 40;

  const START_DATE = new Date(2000, 0, 1);
  const END_DATE = new Date(2010, 0, 1);

  const xScale = d3
    .scaleTime()
    .domain([START_DATE, END_DATE])
    .range([0, WIDTH - 2 * PADDING]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([HEIGHT - PADDING, PADDING]);

  const formatter = d3.format("d");

  const dates = d3.timeYear.range(START_DATE, d3.utcYear.offset(END_DATE, 1));

  const data = dates.map((d) => {
    const value = Math.random() * 100;
    return {
      date: d,
      value,
      x: xScale(d),
      y: yScale(value),
      label: formatter(value),
    };
  });

  type Datum = (typeof data)[number];

  const { Story } = defineMeta({
    title: "Core/Line",
    component: LinePath,
    argTypes: {
      innerRef: { control: false },
      children: { control: false },
      className: { control: false },
      x: { control: false },
      y: { control: false },
      fill: { control: { type: "text" } },
      stroke: { control: { type: "text" } },
      fillOpacity: { control: { type: "number", max: 1, min: 0, step: 0.1 } },
      strokeWidth: { control: { type: "number" } },
      strokeOpacity: {
        control: { type: "number", max: 1, min: 0, step: 0.1 },
      },

      data: { control: { type: "object" } },

      curve: {
        control: { type: "select" },

        options: [
          "curveCatmullRom",
          "curveBumpX",
          "curveCardinal",
          "curveLinear",
          "curveStep",
        ],
        mapping: {
          curveCatmullRom: d3.curveCatmullRom.alpha(0.5),
          curveBumpX: d3.curveBumpX,
          curveCardinal: d3.curveCardinal,
          curveLinear: d3.curveLinear,
          curveStep: d3.curveStep,
        },
      },
    },
    args: {
      data: data,
      // @ts-expect-error - Storybook mapping expects string key, component expects CurveFactory
      curve: "curveCatmullRom",
    },
  });

  const theme = getPillarTheme(6);
</script>

<Story name="Line Path">
  {#snippet template({ scale: _, ...args })}
    <Svg width={WIDTH} height={HEIGHT} style="border: 1px solid black;">
      <Group left={PADDING}>
        <LinePath
          {...args}
          {data}
          x={(d) => (d as Datum).x ?? 0}
          y={(d) => (d as Datum).y ?? 0}
        />
      </Group>
    </Svg>
  {/snippet}
</Story>

<Story name="Line Chart">
  {#snippet template({ scale: _, ...args })}
    <Theme {theme}>
      <Svg width={WIDTH} height={HEIGHT} style="border: 1px solid white;">
        <Group left={PADDING}>
          <GridColumns
            scale={xScale}
            top={PADDING}
            height={HEIGHT - PADDING * 2}
          />

          <Axis orientation="bottom" scale={xScale} top={HEIGHT - PADDING} />

          <LinePath
            {...args}
            {data}
            x={(d) => (d as Datum).x ?? 0}
            y={(d) => (d as Datum).y ?? 0}
            strokeOpacity={0.9}
          />
          <Markers {data} x={(d) => (d as Datum).x} y={(d) => (d as Datum).y}>
            {#snippet marker({ x, y, placement })}
              {@const isEnd = placement === "END"}
              {@const size = isEnd ? 8 : undefined}
              {@const fill = isEnd ? theme.palette.accent : undefined}
              <Circle {x} {y} {size} {fill} />
            {/snippet}
          </Markers>

          {#each data as d (d.date)}
            <Text
              dx={d.x}
              dy={d.y - 10}
              text={d.label}
              fontSize={13}
              fontWeight={700}
              textAnchor="middle"
            />
          {/each}
        </Group>
      </Svg>
    </Theme>
  {/snippet}
</Story>
