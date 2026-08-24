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
  import textures from "textures";
  import { Tokens, getPillarTheme } from "$lib/core/theme";
  import Theme from "$lib/core/components/Theme.svelte";
  import { onMount } from "svelte";
  import {
    formatLocale,
    parseFormattedNumber,
    type ParsedNumber,
  } from "$lib/core/format";
  import Line from "$lib/core/components/shape/Line.svelte";

  type SkinColor =
    | "Indígena"
    | "Branca"
    | "Preta/Parda"
    | "Amarela"
    | "Não identificado";

  type Datum = {
    scope: "EC" | "BR";
    skinColor: SkinColor;
    pct: { value: number; label: ParsedNumber };
    radius: number;
    y: number;
  };

  type ParsedItem = Omit<Datum, "y">;

  const theme = getPillarTheme(6);

  const FIG_WIDTH = 580;
  const FIG_HEIGHT = 240;
  const MARGIN = { l: 48, r: 120, t: 12, b: 24 };
  const CHART_WIDTH = FIG_WIDTH - (MARGIN.l + MARGIN.r);
  const CHART_HEIGHT = FIG_HEIGHT - (MARGIN.t + MARGIN.b);

  const MAX_AREA = 10e3;
  const MAX_RADIUS = Math.sqrt(MAX_AREA / Math.PI);

  const pctFormatter = formatLocale.format(".1%");

  const areaScale = d3.scaleLinear().domain([0, 1]).range([0, MAX_AREA]);

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  let data = $state<d3.InternMap<string, Datum[]> | null>(null);
  let missing = $state<Datum | null>(null);

  let skinColorIndex = $state<Map<SkinColor, number> | null>(null);

  let svgRef = $state<SVGSVGElement | null>(null);

  const colors = ["#F6B60E", "#F1AA2D", "#F19D2B", "#F68E0E", "#F9820B"];

  const texture = textures
    .lines()
    .background(theme.palette.base[100])
    .stroke(theme.palette.secondary)
    .size(4)
    .strokeWidth(0.7);

  onMount(async () => {
    function applyVerticalLayout(items: ParsedItem[], gap = 12): Datum[] {
      let currentY = 0;
      return items.map((d, i) => {
        const y = i === 0 ? 0 : currentY + gap;
        currentY = y + d.radius;
        return { ...d, y };
      });
    }

    const raw = await d3.dsv(";", "/data/eixo6/6.13_6.21.csv", (d) => {
      const pct = +d.participacao_pct;
      return {
        scope: d.escopo as "EC" | "BR",
        skinColor: d.raca_cor as SkinColor,
        pct: { value: pct, label: parseFormattedNumber(pctFormatter(pct)) },
        radius: Math.sqrt(areaScale(pct) / Math.PI),
      };
    });

    const cleanData = raw.filter((d) => d.skinColor !== "Não identificado");
    const grouped = d3.group(cleanData, (d) => d.scope);

    const ecItems =
      grouped
        .get("EC")
        ?.slice()
        .sort((a, b) => b.pct.value - a.pct.value) ?? [];

    skinColorIndex = new Map(ecItems.map((d, i) => [d.skinColor, i]));

    const rawLayouts = new Map<string, Datum[]>();
    const maxYByColor = new Map<SkinColor, number>();

    for (const [scope, items] of grouped) {
      const sorted = items
        .slice()
        .sort(
          (a, b) =>
            (skinColorIndex!.get(a.skinColor) ?? 0) -
            (skinColorIndex!.get(b.skinColor) ?? 0),
        );

      const layout = applyVerticalLayout(sorted);
      rawLayouts.set(scope, layout);

      // Track max Y reached for each color across all groups
      for (const item of layout) {
        const currentMax = maxYByColor.get(item.skinColor) ?? 0;
        maxYByColor.set(item.skinColor, Math.max(currentMax, item.y));
      }
    }

    // 4. PASS 2: Apply synchronized max 'y' to every group
    const result = new Map<string, Datum[]>();

    for (const [scope, items] of rawLayouts) {
      const alignedItems = items.map((item) => ({
        ...item,
        y: maxYByColor.get(item.skinColor) ?? item.y,
      }));

      result.set(scope, alignedItems);
    }

    data = result;
    missing = raw.find((d) => d.skinColor === "Não identificado")! as Datum;
  });

  $effect(() => {
    if (!svgRef) return;
    d3.select(svgRef).call(texture);
  });
</script>

<Story name="Percentual de trabalhadores por cor ou raça v2">
  {#snippet template()}
    {#if data}
      <Theme {theme}>
        <Svg
          width={FIG_WIDTH}
          height={FIG_HEIGHT}
          style="border: 1px solid white; overflow: visible;"
          bind:ref={svgRef}
        >
          <defs>
            {#each colors.slice(0, -1) as color, i}
              {@const colorA = i === 0 ? color : colors[i + 1]}
              {@const colorB = i === 0 ? color : colors[i]}
              <linearGradient id="grad-{i}" x1="0" x2="0" y1="0" y2="100%">
                <stop offset="0%" stop-color={colorA} />
                <stop offset="100%" stop-color={colorB} />
              </linearGradient>
            {/each}
          </defs>
          <Group left={MARGIN.l} top={MARGIN.t}>
            {#each Array.from(data).reverse() as [scope, arr], i (scope)}
              <Group
                left={MAX_RADIUS + (i === 0 ? 1 : 0) * 72}
                top={MAX_RADIUS}
              >
                <Line
                  from={{ x: 0, y: 0 }}
                  to={{ x: 0, y: CHART_HEIGHT }}
                  stroke={theme.palette.base[200]}
                  strokeWidth={1.5}
                />

                {#each arr as d, j}
                  <Circle
                    x={0}
                    y={16 + j * 72}
                    size={d.radius}
                    fill={scope === "EC" ? `url('#grad-${j}')` : texture.url()}
                    stroke={scope === "EC"
                      ? undefined
                      : theme.palette.secondary}
                    strokeWidth={scope === "EC" ? undefined : 1}
                  />
                {/each}
              </Group>
            {/each}
          </Group>
        </Svg>
      </Theme>
    {/if}
  {/snippet}
</Story>
