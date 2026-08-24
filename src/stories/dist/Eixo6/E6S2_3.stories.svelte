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

  import { Tokens, getPillarTheme } from "$lib/core/theme";
  import Theme from "$lib/core/components/Theme.svelte";
  import { onMount } from "svelte";
  import {
    formatLocale,
    parseFormattedNumber,
    type ParsedNumber,
  } from "$lib/core/format";

  type Datum = {
    date: Date;
    group: "Brasil" | "Economia Criativa";
    inf: { value: number; label: ParsedNumber };
    x: number;
    y: number;
  };

  type DiffDatum = {
    date: Date;
    diff: { value: number; label: ParsedNumber };
    x: number;
    height: number;
  };

  const theme = getPillarTheme(6);

  const FIG_WIDTH = 580;
  const FIG_HEIGHT = 240;
  const MARGIN = { l: 24, r: 120, t: 12, b: 24 };
  const CHART_WIDTH = FIG_WIDTH - (MARGIN.l + MARGIN.r);
  const CHART_HEIGHT = FIG_HEIGHT - (MARGIN.t + MARGIN.b);
  const AXES_HSPACE = 24;
  const USABLE_HEIGHT = CHART_HEIGHT - AXES_HSPACE;
  const AX1_HEIGHT_PROP = 0.8;
  const AX1_HEIGHT = USABLE_HEIGHT * AX1_HEIGHT_PROP;
  const AX2_HEIGHT = USABLE_HEIGHT * (1 - AX1_HEIGHT_PROP);

  const pctFormatter = formatLocale.format(".1%");

  // RAIS BREAK GAP
  const yScale = d3.scaleLinear().range([AX1_HEIGHT, 0]);
  const xScale = d3.scaleTime().range([0, CHART_WIDTH]);
  const heightScale = d3.scaleLinear().range([AX2_HEIGHT, 0]);

  const colors = {
    "Economia Criativa": {
      default: theme.palette.secondary,
      variant: theme.palette.secondaryVariant,
    },
    Brasil: {
      default: theme.palette.primary,
      variant: theme.palette.primaryVariant,
    },
  };

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  let data = $state<Datum[]>([]);
  let diffData = $state<DiffDatum[]>([]);

  $inspect(data);

  onMount(async () => {
    const raw = await d3.dsv(";", "/data/eixo6/6.8.csv", (d) => {
      const inf = +d.taxa_informalidade;

      return {
        date: new Date(+d.ano, 0, 1),
        group: d.grupo as "Brasil" | "Economia Criativa",
        inf: {
          value: inf,
          label: parseFormattedNumber(pctFormatter(inf)),
        },
      };
    });

    const infExtent = d3.extent(raw, (d) => d.inf.value) as [number, number];
    const infRange = infExtent[1] - infExtent[0];
    const infOffset = infRange * 0.1;

    infExtent[0] = infExtent[0] - infOffset;
    infExtent[1] = infExtent[1] + infOffset;

    xScale.domain(d3.extent(raw, (d) => d.date) as [Date, Date]);
    yScale.domain(infExtent);

    data = raw.map((d) => ({
      ...d,
      x: xScale(d.date),
      y: yScale(d.inf.value),
    }));

    diffData = d3
      .groups(data, (d) => d.date)
      .map(([date, dateData]) => {
        const br = dateData.find((d) => d.group === "Brasil")!;
        const ec = dateData.find((d) => d.group === "Economia Criativa")!;
        const diff = ec.inf.value - br.inf.value;
        return {
          date: date,
          diff: {
            value: diff,
            label: parseFormattedNumber(pctFormatter(diff)),
          },
          x: br.x,
          height: 1,
        };
      });

    heightScale.domain([0, d3.max(diffData, (d) => d.diff.value)! * 1.5] as [
      number,
      number,
    ]);

    diffData.forEach((d) => {
      d.height = AX2_HEIGHT - heightScale(d.diff.value);
    });

    console.log({ data, diffData });
  });
</script>

<Story name="Informalidade EC e BR por ano">
  {#snippet template()}
    {#if data.length}
      <Theme {theme}>
        <Svg
          width={FIG_WIDTH}
          height={FIG_HEIGHT}
          style="border: 1px solid white; overflow: visible;"
        >
          <Group left={MARGIN.l} top={MARGIN.t}>
            <Group id="ax1">
              <GridColumns scale={xScale} height={AX1_HEIGHT} />
              {#each d3.group(data, (d) => d.group) as [group, groupData]}
                {@const lastPoint = groupData.find(
                  (d) => d.date.getFullYear() === 2024,
                )!}

                {@const color = colors[group]}
                <Group id={group}>
                  <LinePath
                    data={groupData}
                    x={(d) => d.x}
                    y={(d) => d.y}
                    stroke={color.default}
                  />

                  <Markers data={groupData} x={(d) => d.x} y={(d) => d.y}>
                    {#snippet marker({ x, y })}
                      {@const fill = color.variant}
                      <Circle {x} {y} {fill} />
                    {/snippet}
                  </Markers>

                  {#each groupData as d, i (d.date)}
                    {@const isLast = i === groupData.length - 1}
                    <Text
                      dx={isLast ? d.x + Tokens.spacing.md : d.x}
                      dy={isLast ? d.y - 5 : d.y - Tokens.spacing.md}
                      text={d.inf.label.formatted}
                      fontSize={isLast
                        ? Tokens.fontSize.lg
                        : Tokens.fontSize.sm}
                      fontWeight={isLast ? 700 : 500}
                      textAnchor={isLast ? "start" : "middle"}
                      width={MARGIN.r}
                    />
                  {/each}

                  <Text
                    dx={lastPoint.x + Tokens.spacing.md}
                    dy={lastPoint.y}
                    width={MARGIN.r - Tokens.spacing.md}
                    verticalAnchor="start"
                    text={group}
                    fontSize={Tokens.fontSize.md}
                    fontWeight={500}
                    textAnchor="start"
                  />
                </Group>
              {/each}
            </Group>

            <Text
              dx={-MARGIN.l}
              dy={AX1_HEIGHT + AXES_HSPACE / 2}
              text="A taxa de informalidade na Economia Criativa superou a média no Brasil em..."
              verticalAnchor="middle"
              fill={theme.palette.neutral[300]}
              fontSize={Tokens.fontSize.sm}
            />

            <Group id="ax2" top={AX1_HEIGHT + AXES_HSPACE}>
              <GridColumns scale={xScale} height={AX2_HEIGHT} />
              {#each diffData as d, i}
                {@const isLast = i === diffData.length - 1}
                {@const y = AX2_HEIGHT - d.height}
                <rect
                  x={d.x - Tokens.strokeWidth.xs / 2}
                  {y}
                  width={Tokens.strokeWidth.xs}
                  height={d.height}
                  fill={theme.palette.neutral[200]}
                  rx={2}
                />

                <Text
                  dx={isLast ? d.x + Tokens.spacing.md : d.x}
                  dy={y - 4}
                  text={isLast
                    ? d.diff.label.number + " pontos percentuais (pp)"
                    : d.diff.label.number + "pp"}
                  fontSize={Tokens.fontSize.xs}
                  fontWeight={Tokens.fontWeight.medium}
                  fill={theme.palette.neutral[300]}
                  textAnchor={"middle"}
                  verticalAnchor={"end"}
                />
              {/each}
            </Group>

            <Axis orientation="bottom" scale={xScale} top={CHART_HEIGHT} />
          </Group>
        </Svg>
      </Theme>
    {/if}
  {/snippet}
</Story>
