<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Svg from "$lib/core/components/Svg.svelte";
  import Theme from "$lib/core/components/Theme.svelte";
  import CapsuleStack from "$lib/core/components/shape/CapsuleStack.svelte";
  import { getPillarTheme } from "$lib/core/theme";

  const theme = getPillarTheme(6);
  const [c1, c2, c3] = theme.palette.categorical;

  const { Story } = defineMeta({
    title: "Cultura em Números/Primitivas/CapsuleStack",
    globals: { backgrounds: { value: "cultnum-bg" } },
    component: CapsuleStack,
    tags: [],
  });
</script>

<!--
  A `CapsuleBar` dividida em faixas: a ponta redonda é da pilha inteira, não
  do último segmento, e nenhum segmento ganha cantos que roubariam área.
  Um vão fino na cor do fundo separa faixas de cores próximas.
-->
<Story name="Colunas">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={420} height={220}>
        {#each [[60, 50, 40], [90, 30, 20], [20, 20, 12], [8, 6, 4]] as lengths, i (i)}
          <CapsuleStack
            x={30 + i * 90}
            y={10}
            width={44}
            height={200}
            segments={lengths.map((length, k) => ({ length, fill: [c1, c2, c3][k] }))}
          />
        {/each}
        <line x1={10} x2={410} y1={210} y2={210} stroke="#ECEEED" stroke-width={2} />
      </Svg>
    </Theme>
  {/snippet}
</Story>

<Story name="Horizontal">
  {#snippet template()}
    <Theme {theme}>
      <Svg width={420} height={110}>
        <CapsuleStack
          orientation="horizontal"
          x={20}
          y={10}
          width={380}
          height={36}
          segments={[{ length: 180, fill: c1 }, { length: 120, fill: c2 }, { length: 60, fill: c3 }]}
        />
        <CapsuleStack
          orientation="horizontal"
          x={20}
          y={60}
          width={380}
          height={36}
          segments={[{ length: 90, fill: c1 }, { length: 40, fill: c2 }]}
        />
      </Svg>
    </Theme>
  {/snippet}
</Story>
