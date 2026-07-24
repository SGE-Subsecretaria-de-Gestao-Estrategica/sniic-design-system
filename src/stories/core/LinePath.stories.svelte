<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as d3 from "d3";
  import Svg from "$lib/core/components/Svg.svelte";
  import LinePath from "$lib/core/components/shape/LinePath.svelte";
  import Axis from "$lib/core/components/axis/Axis.svelte";
  import Group from "$lib/core/components/Group.svelte";
  import MarkerCircle from "$lib/core/components/markers/MarkerCircle.svelte";
  import { DEFAULT_LINE_THEME } from "$lib/constants/theme";

  const WIDTH = 500;
  const HEIGHT = 500;
  const PADDING = 40;

  const START_DATE = new Date(2000, 0, 1);
  const END_DATE = new Date(2010, 0, 1);

  const dates = d3.timeYear.range(START_DATE, d3.utcYear.offset(END_DATE, 1));

  const data = dates.map((d) => ({
    date: d,
    value: Math.random() * 100,
  }));

  type Datum = (typeof data)[number];

  const { Story } = defineMeta({
    title: "Core/LinePath",
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
      stroke: DEFAULT_LINE_THEME.stroke,
      strokeWidth: DEFAULT_LINE_THEME.strokeWidth,
      fill: DEFAULT_LINE_THEME.fill,
    },
  });

  const xScale = d3
    .scaleTime()
    .domain([START_DATE, END_DATE])
    .range([0, WIDTH - 2 * PADDING]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([HEIGHT - 2 * PADDING, PADDING]);
</script>

<Story name="Default">
  {#snippet template({ scale: _, ...args })}
    <Svg width={WIDTH} height={HEIGHT} style="border: 1px solid black;">
      <Group left={PADDING}>
        <LinePath
          {...args}
          {data}
          x={(d) => xScale((d as Datum).date) ?? 0}
          y={(d) => yScale((d as Datum).value) ?? 0}
        />
      </Group>
    </Svg>
  {/snippet}
</Story>

<Story name="With Axis and Marker">
  {#snippet template({ scale: _, ...args })}
    <Svg width={WIDTH} height={HEIGHT} style="border: 1px solid black;">
      <MarkerCircle id="marker" fill="#828679" size={1 / 3} />
      <Group left={PADDING}>
        <LinePath
          {...args}
          {data}
          x={(d) => xScale((d as Datum).date) ?? 0}
          y={(d) => yScale((d as Datum).value) ?? 0}
          marker-start="url(#marker)"
          marker-mid="url(#marker)"
          marker-end="url(#marker)"
        />
        <Axis orientation="bottom" scale={xScale} top={HEIGHT - PADDING * 2} />
      </Group>
    </Svg>
  {/snippet}
</Story>
