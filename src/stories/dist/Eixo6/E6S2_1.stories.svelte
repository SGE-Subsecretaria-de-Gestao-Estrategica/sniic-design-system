<script lang="ts" module>
  import { onMount } from "svelte";
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
  import {
    formatCompactNumber,
    parseFormattedNumber,
    formatLocale,
    type ParsedNumber,
  } from "$lib/core/format";
  import Line from "$lib/core/components/shape/Line.svelte";

  type Datum = {
    date: Date;
    nWorkers: { value: number; label: ParsedNumber };
    propWorkers: { value: number; label: ParsedNumber };
    x: number;
    y: number;
    r: number;
    fill: string;
  };

  const theme = getPillarTheme(6);

  const FIG_WIDTH = 580;
  const FIG_HEIGHT = 320;
  const MARGIN = { l: 24, r: 120, t: 12, b: 24 };
  const CHART_WIDTH = FIG_WIDTH - (MARGIN.l + MARGIN.r);
  const CHART_HEIGHT = FIG_HEIGHT - (MARGIN.t + MARGIN.b);
  const AXES_HSPACE = 24;
  const USABLE_HEIGHT = CHART_HEIGHT - AXES_HSPACE;
  const AX1_HEIGHT_PROP = 0.75;
  const AX1_HEIGHT = USABLE_HEIGHT * AX1_HEIGHT_PROP;
  const AX2_HEIGHT = USABLE_HEIGHT * (1 - AX1_HEIGHT_PROP);

  const pctFormatter = formatLocale.format(".2%");

  // RAIS BREAK GAP
  const GAP_WIDTH = CHART_WIDTH * 0.175;

  const PRE_RANGE = [2015, 2021];
  const POST_RANGE = [2022, 2024];
  const PRE_INTERVALS = PRE_RANGE[1] - PRE_RANGE[0];
  const POST_INTERVALS = POST_RANGE[1] - POST_RANGE[0];
  const TOTAL_INTERVALS = PRE_INTERVALS + POST_INTERVALS;

  const USABLE_WIDTH = CHART_WIDTH - GAP_WIDTH;
  const BANDWIDTH = USABLE_WIDTH / TOTAL_INTERVALS;

  const PRE_GAP_START = 0;
  const PRE_GAP_WIDTH = BANDWIDTH * PRE_INTERVALS;
  const POST_GAP_START = PRE_GAP_START + PRE_GAP_WIDTH + GAP_WIDTH;

  const yScale = d3.scaleLinear().range([AX1_HEIGHT, 0]);

  const preGapScale = d3
    .scaleTime()
    .domain(PRE_RANGE.map((d) => new Date(d, 0, 1)))
    .range([PRE_GAP_START, PRE_GAP_WIDTH]);

  const postGapScale = d3
    .scaleTime()
    .domain(POST_RANGE.map((d) => new Date(d, 0, 1)))
    .range([POST_GAP_START, CHART_WIDTH]);

  const areaScale = d3.scaleLinear().range([150, 600]);
  const fillScale = d3
    .scaleSequential()
    .interpolator(
      d3.interpolateLab(theme.palette.primary, theme.palette.primaryVariant),
    );
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
    const raw = await d3.dsv(";", "/data/eixo6/6.5.csv", (d) => {
      const nWorkers = +d.total_vinculos_formal_informal;
      const propWorkers = +d.participacao_pct;
      return {
        date: new Date(+d.ano, 0, 1),
        nWorkers: {
          value: nWorkers,
          label: parseFormattedNumber(formatCompactNumber(nWorkers, 1)),
        },
        propWorkers: {
          value: propWorkers,
          label: parseFormattedNumber(pctFormatter(propWorkers)),
        },
      };
    });

    const nWorkersExtent = d3.extent(raw, (d) => d.nWorkers.value) as [
      number,
      number,
    ];
    const nWorkersRange = nWorkersExtent[1] - nWorkersExtent[0];
    const nWorkersOffset = nWorkersRange * 0.1;

    nWorkersExtent[0] = nWorkersExtent[0] - nWorkersOffset;
    nWorkersExtent[1] = nWorkersExtent[1] + nWorkersOffset;

    yScale.domain(nWorkersExtent);
    areaScale.domain(
      d3.extent(raw, (d) => d.propWorkers.value) as [number, number],
    );
    fillScale.domain(
      d3.extent(raw, (d) => d.propWorkers.value) as [number, number],
    );

    data = raw.map((d) => ({
      ...d,
      x: xScale(d.date),
      y: yScale(d.nWorkers.value),
      r: Math.sqrt(areaScale(d.propWorkers.value) / Math.PI),
      fill: fillScale(d.propWorkers.value),
    }));
  });
</script>

<Story name="Trabalhadores da cultura por ano">
  {#snippet template()}
    {#if data.length}
      {@const lastPoint = data[data.length - 1]}
      <Theme {theme}>
        <Svg
          width={FIG_WIDTH}
          height={FIG_HEIGHT}
          style="border: 1px solid white; overflow: visible;"
        >
          <!-- <Text
            dx={MARGIN.l}
            dy={2}
            text="Postos de trabalho na Economia Criativa e sua participação no contingente do país (2015-2024)"
            verticalAnchor="start"
            fill={theme.palette.neutral[200]}
            fontSize={Tokens.fontSize.lg}
          /> -->
          <Group left={MARGIN.l} top={MARGIN.t}>
            <Group id="ax1">
              <Group id="gridlines">
                <GridColumns
                  scale={preGapScale}
                  height={AX1_HEIGHT}
                  numTicks={6}
                />
                <GridColumns
                  scale={postGapScale}
                  height={AX1_HEIGHT}
                  numTicks={4}
                />
              </Group>

              <LinePath
                data={data.filter((d) =>
                  [PRE_RANGE[1], POST_RANGE[0]].includes(d.date.getFullYear()),
                )}
                strokeOpacity={0.3}
                strokeWidth={8}
                stroke-dasharray="8,12"
              />

              <LinePath data={data.filter((d) => isPreGap(d.date))} />
              <LinePath data={data.filter((d) => !isPreGap(d.date))} />
              <Markers {data} x={(d) => d.x} y={(d) => d.y}>
                {#snippet marker({ x, y, placement })}
                  {@const isEnd = placement === "END"}
                  {@const size = isEnd ? 8 : undefined}
                  {@const fill = isEnd ? theme.palette.accent : undefined}
                  <Circle {x} {y} {size} {fill} />
                {/snippet}
              </Markers>

              {#each data as d, i (d.date)}
                {@const isLast = i === data.length - 1}
                <Text
                  dx={d.x + Tokens.spacing[isLast ? "lg" : "none"]}
                  dy={d.y - Tokens.spacing[isLast ? "sm" : "md"]}
                  text={d.nWorkers.label.number}
                  suffix={d.nWorkers.label.suffix}
                  suffixXOffset={-1.5}
                  fontSize={Tokens.fontSize[isLast ? "lg" : "sm"]}
                  fontWeight={Tokens.fontWeight[isLast ? "bold" : "medium"]}
                  textAnchor={isLast ? "start" : "middle"}
                  fill={isLast ? theme.palette.accent : undefined}
                />
              {/each}

              <Text
                dx={lastPoint.x + Tokens.spacing.lg}
                dy={lastPoint.y}
                width={MARGIN.r - Tokens.spacing.md}
                verticalAnchor="start"
                text={"Economia Criativa"}
                fontSize={Tokens.fontSize.md}
                fontWeight={500}
                textAnchor="start"
              />
            </Group>

            <Text
              dx={-MARGIN.l}
              dy={AX1_HEIGHT + AXES_HSPACE / 2}
              text="No total de vínculos de trabalho do Brasil, esses trabalhadores representam..."
              verticalAnchor="middle"
              fill={theme.palette.neutral[200]}
              fontSize={Tokens.fontSize.sm}
            />

            <Group id="ax2" top={AX1_HEIGHT + AXES_HSPACE}>
              <Group id="gridlines">
                <GridColumns
                  scale={preGapScale}
                  height={AX2_HEIGHT}
                  numTicks={6}
                />
                <GridColumns
                  scale={postGapScale}
                  height={AX2_HEIGHT}
                  numTicks={4}
                />
              </Group>

              <Group top={AX2_HEIGHT * 0.6}>
                <Line
                  from={{ x: xScale(new Date(PRE_RANGE[1], 0, 1)) }}
                  to={{ x: xScale(new Date(POST_RANGE[0], 0, 1)) }}
                  stroke={theme.palette.primary}
                  strokeOpacity={0.3}
                  strokeWidth={Tokens.strokeWidth.sm}
                  strokeDasharray="6,8"
                  stroke-linecap="round"
                />

                <Line
                  from={{ x: xScale(new Date(PRE_RANGE[0], 0, 1)) }}
                  to={{ x: xScale(new Date(PRE_RANGE[1], 0, 1)) }}
                  stroke={theme.palette.primary}
                  strokeWidth={Tokens.strokeWidth.sm}
                />

                <Line
                  from={{ x: xScale(new Date(POST_RANGE[0], 0, 1)) }}
                  to={{ x: xScale(new Date(POST_RANGE[1], 0, 1)) }}
                  stroke={theme.palette.primary}
                  strokeWidth={Tokens.strokeWidth.sm}
                />

                {#each data as d, i (d.date)}
                  {@const isLast = i === data.length - 1}
                  <Group left={d.x}>
                    <circle r={d.r} fill={d.fill} />
                    <Text
                      textAnchor={isLast ? "start" : "middle"}
                      text={isLast
                        ? d.propWorkers.label.formatted +
                          " do total de vínculos de trabalho"
                        : d.propWorkers.label.number}
                      suffix={isLast ? undefined : d.propWorkers.label.suffix}
                      suffixXOffset={-1.5}
                      dx={isLast ? d.r + Tokens.spacing.md : 0}
                      dy={-(d.r + Tokens.spacing.sm)}
                      fill={theme.palette.neutral[200]}
                      fontSize={Tokens.fontSize.sm}
                      fontWeight={Tokens.fontWeight.medium}
                      width={MARGIN.r}
                      verticalAnchor={isLast ? "start" : "end"}
                    />
                  </Group>
                {/each}
              </Group>
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
