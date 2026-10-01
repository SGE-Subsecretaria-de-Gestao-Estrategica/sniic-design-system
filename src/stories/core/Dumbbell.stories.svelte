<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Svg from "$lib/core/components/Svg.svelte";
  import Theme from "$lib/core/components/Theme.svelte";
  import Dumbbell from "$lib/core/components/shape/Dumbbell.svelte";
  import { getPillarTheme } from "$lib/core/theme";

  const theme = getPillarTheme(6);

  const { Story } = defineMeta({
    title: "Core/Dumbbell",
    component: Dumbbell,
    tags: [],
  });
</script>

<!--
  Dois valores ligados: o traço grosso de ponta redonda das linhas, com o
  marcador comum no início e o ponto de destaque (accent, maior) no fim — a
  direção da mudança se lê sem seta. Valores iguais ainda desenham uma
  pastilha curta, nunca somem.
-->
<Story name="Pares">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={420} height={200}>
        {#each [[40, 360], [120, 260], [300, 180], [210, 214], [200, 200]] as [from, to], i (i)}
          <Dumbbell from={{ x: from, y: 24 + i * 38 }} to={{ x: to, y: 24 + i * 38 }} />
        {/each}
      </Svg>
    </Theme>
  {/snippet}
</Story>

<!-- Qualquer direção: as pontas são pontos, não um eixo. -->
<Story name="Vertical e diagonal">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={420} height={200}>
        <Dumbbell from={{ x: 40, y: 180 }} to={{ x: 40, y: 30 }} />
        <Dumbbell from={{ x: 100, y: 40 }} to={{ x: 100, y: 150 }} />
        <Dumbbell from={{ x: 180, y: 170 }} to={{ x: 380, y: 40 }} />
      </Svg>
    </Theme>
  {/snippet}
</Story>

<!-- Cores e tamanhos por prop; `showFrom`/`showTo`/`showStroke` revelam o par em etapas. -->
<Story name="Variações">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={420} height={150}>
        <Dumbbell
          from={{ x: 40, y: 30 }}
          to={{ x: 360, y: 30 }}
          stroke={theme.palette.secondaryVariant}
          fromFill={theme.palette.secondary}
          toFill={theme.palette.secondary}
        />
        <Dumbbell from={{ x: 40, y: 75 }} to={{ x: 300, y: 75 }} strokeWidth={6} fromSize={4} toSize={6} />
        <Dumbbell from={{ x: 40, y: 120 }} to={{ x: 240, y: 120 }} showStroke={false} showTo={false} />
      </Svg>
    </Theme>
  {/snippet}
</Story>
