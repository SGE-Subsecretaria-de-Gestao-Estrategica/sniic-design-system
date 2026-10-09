<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as d3 from "d3";
  import Chart from "$lib/core/components/Chart.svelte";
  import Svg from "$lib/core/components/Svg.svelte";
  import Theme from "$lib/core/components/Theme.svelte";
  import Text from "$lib/core/components/Text.svelte";
  import Line from "$lib/core/components/shape/Line.svelte";
  import CapsuleBar from "$lib/core/components/shape/CapsuleBar.svelte";
  import { Tokens, getPillarTheme } from "$lib/core/theme";
  import { formatCompactNumber } from "$lib/core/format";

  const theme = getPillarTheme(6);

  const { Story } = defineMeta({
    title: "Cultura em Números/Primitivas/CapsuleBar",
    globals: { backgrounds: { value: "cultnum-bg" } },
    component: CapsuleBar,
    tags: [],
  });

  /** Categorias genéricas, do maior ao menor — a ordem é dado, não layout. */
  const ranking = [
    { label: "Categoria com um nome mais longo que quebra", value: 1_004_000 },
    { label: "Categoria B, também em duas linhas", value: 237_000 },
    { label: "Categoria C", value: 236_000 },
    { label: "Categoria D", value: 191_000 },
    { label: "Categoria E", value: 87_000 },
    { label: "Categoria F", value: 62_000 },
    { label: "Categoria G, outra de nome longo", value: 49_000 },
    { label: "Categoria H", value: 46_000 },
    { label: "Categoria I", value: 9_000 },
  ];

  const BAR = 42;
  const ROW = 56;
  const GUTTER = 210;
</script>

<!--
  A barra da identidade de Cultura em Números: base reta no zero, ponta em
  meia-lua, gradiente que clareia até a ponta e o ponto concêntrico à ponta —
  o mesmo traço grosso com marcador das linhas, deitado. A cor vem do tema.
-->
<Story name="Barras horizontais">
  {#snippet template()}
    <div style="max-width: 640px;">
      <Chart
        {theme}
        responsive
        height={ranking.length * ROW + 8}
        margin={{ top: 4, right: 72, bottom: 4, left: GUTTER }}
      >
        {#snippet children({ innerWidth })}
          {@const x = d3
            .scaleLinear()
            .domain([0, d3.max(ranking, (d) => d.value) ?? 1])
            .range([0, innerWidth])}

          {#each ranking as d, i (d.label)}
            {@const top = i * ROW + (ROW - BAR) / 2}
            <Text
              dx={-Tokens.spacing.lg}
              dy={top + BAR / 2}
              width={GUTTER - Tokens.spacing.lg}
              text={d.label}
              textAnchor="end"
              verticalAnchor="middle"
              fontSize={Tokens.fontSize.md}
            />
            <CapsuleBar x={0} y={top} width={x(d.value)} height={BAR} />
            <Text
              dx={x(d.value) + Tokens.spacing.md}
              dy={top + BAR / 2}
              text={formatCompactNumber(d.value, 0)}
              verticalAnchor="middle"
              fontSize={Tokens.fontSize.md}
              fontWeight={Tokens.fontWeight.semibold}
            />
          {/each}

          <!-- A linha de base, desenhada por cima: é dela que todas partem. -->
          <Line
            from={{ x: 0, y: 0 }}
            to={{ x: 0, y: ranking.length * ROW }}
            stroke={theme.palette.base[300]}
            strokeWidth={2}
          />
        {/snippet}
      </Chart>
    </div>
  {/snippet}
</Story>

<!--
  Do comprimento cheio a uma fração do raio: abaixo da própria ponta, a barra
  não infla para caber — a ponta é cortada na base e vira uma fatia do disco.
-->
<Story name="Comprimentos">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={480} height={330}>
        {#each [360, 160, 60, 42, 30, 21, 12, 5] as length, i (length)}
          <CapsuleBar x={20} y={10 + i * 40} width={length} height={30} />
          <text x={470} y={30 + i * 40} text-anchor="end" font-size="11" fill="#808679">
            {length}px
          </text>
        {/each}
        <line x1={20} x2={20} y1={4} y2={326} stroke="#ECEEED" stroke-width={2} />
      </Svg>
    </Theme>
  {/snippet}
</Story>

<Story name="Vertical">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={360} height={240}>
        {#each [200, 150, 96, 40, 14] as length, i (length)}
          <CapsuleBar
            orientation="vertical"
            x={20 + i * 64}
            y={220 - length}
            width={42}
            height={length}
          />
        {/each}
        <line x1={10} x2={350} y1={220} y2={220} stroke="#ECEEED" stroke-width={2} />
      </Svg>
    </Theme>
  {/snippet}
</Story>

<!--
  `reverse` faz a barra crescer para o outro lado — a metade esquerda de um
  gráfico divergente. A base continua reta no zero, a ponta continua redonda.
-->
<Story name="Invertida">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={420} height={180}>
        {#each [[150, 120], [90, 160], [20, 60], [8, 14]] as [left, right], i (i)}
          <CapsuleBar
            x={210 - left}
            y={10 + i * 42}
            width={left}
            height={30}
            reverse
          />
          <CapsuleBar x={210} y={10 + i * 42} width={right} height={30} />
        {/each}
        <line x1={210} x2={210} y1={4} y2={176} stroke="#ECEEED" stroke-width={2} />
      </Svg>
    </Theme>
  {/snippet}
</Story>

<!-- Cor sólida, gradiente próprio e sem o ponto — para séries que não são a destacada. -->
<Story name="Variações de cor">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={420} height={180}>
        <CapsuleBar x={20} y={10} width={360} height={30} />
        <CapsuleBar
          x={20}
          y={55}
          width={300}
          height={30}
          fill={theme.palette.secondary}
          dotFill={theme.palette.secondaryVariant}
        />
        <CapsuleBar
          x={20}
          y={100}
          width={240}
          height={30}
          fill={[theme.palette.secondary, theme.palette.secondaryVariant]}
          dotFill={theme.palette.base[100]}
        />
        <CapsuleBar
          x={20}
          y={145}
          width={180}
          height={30}
          fill={theme.palette.base[300]}
          dot={false}
        />
      </Svg>
    </Theme>
  {/snippet}
</Story>

<!-- Sem tema no contexto, a primitiva cai no tema padrão. -->
<Story name="Pilar 1">
  {#snippet template()}
    <Svg width={420} height={100}>
      <CapsuleBar x={20} y={10} width={360} height={36} />
      <CapsuleBar x={20} y={56} width={140} height={36} />
    </Svg>
  {/snippet}
</Story>
