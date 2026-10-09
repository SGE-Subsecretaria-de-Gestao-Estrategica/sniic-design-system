<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Svg from "$lib/core/components/Svg.svelte";
  import Text from "$lib/core/components/Text.svelte";
  import LinePath from "$lib/core/components/shape/LinePath.svelte";
  import LabelMask from "$lib/core/components/annotation/LabelMask.svelte";
  import { Tokens, getPillarTheme } from "$lib/core/theme";

  /**
   * Uma faixa translúcida da cor do fundo entre o rótulo e o gráfico: onde um
   * número cruza uma linha, área ou barra, a marca continua aparecendo,
   * esmaecida, e o texto mantém a tinta escura com contraste.
   *
   * Envolva o rótulo com ela, depois das marcas que ela deve cobrir. A caixa é
   * medida do conteúdo (`getBBox`) e recebe `padding`; `x`/`y`/`width`/`height`
   * fixam a caixa à mão.
   */
  const { Story } = defineMeta({
    title: "Cultura em Números/Primitivas/LabelMask",
    globals: { backgrounds: { value: "cultnum-bg" } },
    component: LabelMask,
    tags: ["autodocs"],
    argTypes: {
      fillOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
      radius: { control: "number" },
    },
    args: { fillOpacity: 0.75, radius: 0 },
  });

  const theme = getPillarTheme(6);
  const curve = [
    { x: 0, y: 330 },
    { x: 140, y: 250 },
    { x: 300, y: 175 },
    { x: 480, y: 110 },
    { x: 640, y: 60 },
  ];
</script>

{#snippet scene(args: { fillOpacity?: number; radius?: number }, masked: boolean)}
  <Svg width={640} height={340} style="background: {theme.palette.base[100]};">
    <LinePath
      data={curve}
      stroke={theme.palette.secondary}
      strokeWidth={90}
      stroke-linecap="butt"
    />
    <circle cx={230} cy={225} r={40} fill={theme.palette.neutral[400]} fill-opacity={0.35} />
    {#if masked}
      <LabelMask {...args}>
        <Text
          dx={330}
          dy={150}
          text="40,1%"
          textAnchor="middle"
          verticalAnchor="middle"
          fontSize={96}
          fontWeight={Tokens.fontWeight.medium}
          fill={theme.palette.neutral[200]}
        />
      </LabelMask>
    {:else}
      <Text
        dx={330}
        dy={150}
        text="40,1%"
        textAnchor="middle"
        verticalAnchor="middle"
        fontSize={96}
        fontWeight={Tokens.fontWeight.medium}
        fill={theme.palette.neutral[200]}
      />
    {/if}
  </Svg>
{/snippet}

<Story name="Com máscara">
  {#snippet template(args)}
    {@render scene(args, true)}
  {/snippet}
</Story>

<Story name="Sem máscara">
  {#snippet template(args)}
    {@render scene(args, false)}
  {/snippet}
</Story>
