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
    parseFormattedNumber,
    formatCompactNumber,
    type ParsedNumber,
  } from "$lib/core/format";

  type Datum = {
    group: string;
    date: Date;
    nWorkers: { value: number; label: ParsedNumber };
    x: number;
    y: number;
  };

  const MARGIN = { l: 24, r: 120, t: 12, b: 24 };
  const FIG_WIDTH = 580;
  // const FIG_HEIGHT = 320;
  const FIG_HEIGHT = 280;
  const CHART_WIDTH = FIG_WIDTH - (MARGIN.l + MARGIN.r);
  const CHART_HEIGHT = FIG_HEIGHT - (MARGIN.t + MARGIN.b);

  // RAIS BREAK GAP
  const GAP_WIDTH = CHART_WIDTH * 0.175;

  const PRE_RANGE = [2016, 2021];
  const POST_RANGE = [2022, 2025];
  const PRE_INTERVALS = PRE_RANGE[1] - PRE_RANGE[0];
  const POST_INTERVALS = POST_RANGE[1] - POST_RANGE[0];
  const TOTAL_INTERVALS = PRE_INTERVALS + POST_INTERVALS;

  const USABLE_WIDTH = CHART_WIDTH - GAP_WIDTH;
  const BANDWIDTH = USABLE_WIDTH / TOTAL_INTERVALS;

  const PRE_GAP_START = 0;
  const PRE_GAP_WIDTH = BANDWIDTH * PRE_INTERVALS;
  const POST_GAP_START = PRE_GAP_START + PRE_GAP_WIDTH + GAP_WIDTH;

  const theme = getPillarTheme(6);

  const yScale = d3.scaleLinear().range([CHART_HEIGHT, 0]);

  const preGapScale = d3
    .scaleTime()
    .domain(PRE_RANGE.map((d) => new Date(d, 0, 1)))
    .range([PRE_GAP_START, PRE_GAP_WIDTH]);

  const postGapScale = d3
    .scaleTime()
    .domain(POST_RANGE.map((d) => new Date(d, 0, 1)))
    .range([POST_GAP_START, CHART_WIDTH]);

  const xScale = (date: Date) => {
    if (isPreGap(date)) return preGapScale(date);
    return postGapScale(date);
  };

  function isPreGap(date: Date) {
    return date.getTime() <= new Date(PRE_RANGE[1], 0, 1).getTime();
  }

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  let data = $state<Datum[]>([]);

  onMount(async () => {
    const raw = await d3.dsv(
      ";",
      "/data/eixo6/E6S2-n-trabalhadores-cultura-e-outros-setores-ano.csv",
      (d) => {
        return {
          group: d.grupo,
          date: new Date(+d.ano, 0, 1),
          nWorkers: +d.total_vinculos,
        };
      },
    );

    const nWorkersExtent = d3.extent(raw, (d) => d.nWorkers) as [
      number,
      number,
    ];
    const nWorkersRange = nWorkersExtent[1] - nWorkersExtent[0];
    const nWorkersOffset = nWorkersRange * 0.1;

    nWorkersExtent[0] = nWorkersExtent[0] - nWorkersOffset;
    nWorkersExtent[1] = nWorkersExtent[1] + nWorkersOffset;

    yScale.domain(nWorkersExtent);

    data = raw.map((d) => ({
      ...d,
      x: xScale(d.date),
      y: yScale(d.nWorkers),
      nWorkers: {
        value: d.nWorkers,
        label: parseFormattedNumber(
          formatCompactNumber(d.nWorkers, d.nWorkers >= 1e6 ? 1 : 0),
        ),
      },
    }));
  });
</script>

<Story name="Trabalhadores da cultura e outros setores por ano">
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
              <Group id="gridlines">
                <GridColumns
                  scale={preGapScale}
                  height={CHART_HEIGHT}
                  numTicks={6}
                />
                <GridColumns
                  scale={postGapScale}
                  height={CHART_HEIGHT}
                  numTicks={4}
                />
              </Group>

              {#each d3.group(data, (d) => d.group) as [group, groupData]}
                {@const edgesData = groupData.filter((d) =>
                  [...PRE_RANGE, ...POST_RANGE].includes(d.date.getFullYear()),
                )}
                {@const isCult = group === "Economia Criativa"}
                {@const isAgro = group === "Agricultura"}
                {@const color = isCult
                  ? theme.palette.secondary
                  : theme.palette.primary}
                {@const colorVariant = isCult
                  ? theme.palette.secondaryVariant
                  : theme.palette.primaryVariant}
                {@const lastDatum = groupData.find(
                  (d) => d.date.getFullYear() === POST_RANGE[1],
                )!}
                <Group id={group}>
                  <LinePath
                    data={groupData.filter((d) =>
                      [PRE_RANGE[1], POST_RANGE[0]].includes(
                        d.date.getFullYear(),
                      ),
                    )}
                    x={(d) => d.x}
                    y={(d) => d.y}
                    stroke={color}
                    strokeOpacity={0.3}
                    strokeWidth={8}
                    stroke-dasharray="8,12"
                  />

                  <LinePath
                    data={groupData.filter((d) => isPreGap(d.date))}
                    stroke={color}
                    x={(d) => d.x}
                    y={(d) => d.y}
                  />
                  <LinePath
                    data={groupData.filter((d) => !isPreGap(d.date))}
                    stroke={color}
                    x={(d) => d.x}
                    y={(d) => d.y}
                  />
                  <Markers data={groupData} x={(d) => d.x} y={(d) => d.y}>
                    {#snippet marker({ x, y, placement })}
                      {@const isEnd = placement === "END"}
                      {@const size = isEnd ? 8 : undefined}
                      {@const fill = colorVariant}
                      <Circle {x} {y} {size} {fill} />
                    {/snippet}
                  </Markers>

                  {#each edgesData as d, i (d.date)}
                    {@const isLast = i === edgesData.length - 1}
                    <Text
                      dx={isLast ? d.x + Tokens.spacing.md : d.x}
                      dy={d.y +
                        (isLast ? 5 : Tokens.spacing.md) * (isAgro ? 1 : -1)}
                      text={d.nWorkers.label.formatted}
                      fontSize={isLast
                        ? Tokens.fontSize.lg
                        : Tokens.fontSize.sm}
                      fontWeight={isLast ? 700 : 500}
                      textAnchor={isLast ? "start" : "middle"}
                      verticalAnchor={isAgro ? "start" : "end"}
                    />
                  {/each}

                  <Text
                    text={group}
                    dx={lastDatum.x + Tokens.spacing.md}
                    dy={isAgro ? lastDatum.y + Tokens.spacing.md : lastDatum.y}
                    width={MARGIN.r - Tokens.spacing.md}
                    textAnchor="start"
                    verticalAnchor="start"
                  />
                </Group>
              {/each}
            </Group>

            <Group id="axis">
              <Axis
                orientation="bottom"
                scale={preGapScale}
                top={CHART_HEIGHT}
                numTicks={6}
              />
              <Axis
                orientation="bottom"
                scale={postGapScale}
                top={CHART_HEIGHT}
                numTicks={4}
              />
            </Group>
          </Group>
        </Svg>
      </Theme>
    {/if}
  {/snippet}
</Story>
