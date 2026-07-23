<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as d3 from "d3";
  import Svg from "$lib/core/components/Svg.svelte";
  import Axis from "$lib/core/components/axis/Axis.svelte";
  import Orientation from "$lib/constants/orientation";
  import { DEFAULT_AXIS_THEME } from "$lib/constants/theme";

  const { Story } = defineMeta({
    title: "Core/Axis",
    component: Axis,
    tags: [],
    argTypes: {
      scale: { control: false },
      innerRef: { control: false },
      children: { control: false },
      tickComponent: { control: false },
      ticksComponent: { control: false },

      axisClassName: { control: { type: "text" } },
      axisLineClassName: { control: { type: "text" } },
      labelClassName: { control: { type: "text" } },
      tickClassName: { control: { type: "text" } },
      label: { control: { type: "text" } },
      stroke: { control: { type: "text" } },
      strokeDasharray: { control: { type: "text" } },
      tickStroke: { control: { type: "text" } },
      tickTransform: { control: { type: "text" } },

      left: { control: { type: "number" } },
      top: { control: { type: "number" } },

      labelOffset: { control: { type: "number" } },
      numTicks: { control: { type: "number" } },
      rangePadding: { control: { type: "number" } },
      strokeWidth: { control: { type: "number" } },
      tickLength: { control: { type: "number" } },

      tickValues: { control: { type: "object" } },
      labelProps: { control: { type: "object" } },
      tickLineProps: { control: { type: "object" } },
      tickLabelProps: { control: { type: "object" } },

      hideAxisLine: { control: { type: "boolean" } },
      hideTicks: { control: { type: "boolean" } },
      hideZero: { control: { type: "boolean" } },

      orientation: {
        control: { type: "radio", options: Object.values(Orientation) },
      },
      tickFormat: { control: false },
    },
    args: {
      left: 0,
      top: 0,
      numTicks: 10,
      orientation: Orientation.bottom,
      ...DEFAULT_AXIS_THEME,
    },
  });

  const WIDTH = 500;
  const HEIGHT = 500;
  const PADDING = 20;

  const scale = d3
    .scaleTime()
    .domain([new Date(2000, 0, 1), new Date(2010, 0, 1)])
    .range([PADDING, WIDTH - 2 * PADDING]);
</script>

<Story name="Default">
  {#snippet template({ scale: _, ...args })}
    <Svg width={WIDTH} height={HEIGHT} style="border: 1px solid black;">
      <Axis {scale} top={HEIGHT * 0.5} {...args} />
    </Svg>
  {/snippet}
</Story>
