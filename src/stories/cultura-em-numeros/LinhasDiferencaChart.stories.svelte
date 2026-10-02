<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasDiferencaChart from '$lib/components/eixo6/LinhasDiferencaChart.svelte';
  import { LINHAS_DIFERENCA_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, GRUPO_DESTAQUE, REFERENCIA, taxasPorAno } from './_exemplos';

  /**
   * Duas taxas na mesma escala e, num painel abaixo, a distância entre elas em
   * pontos percentuais — a diferença é outra medida, então ganha outro plot. Um
   * dos gráficos de referência da identidade visual.
   *
   * **Função:** evolução no tempo — uma taxa contra a referência.
   *
   * **Quando usar:** quando a história é o hiato entre duas taxas (a do grupo e
   * a média, a de um ano e a de outro) e como ele abre ou fecha.
   *
   * **Quando não usar:** para valores absolutos, *Linhas comparadas*; para mais
   * de duas séries, *Linhas em painéis*.
   *
   * **Dados:** `data: LinhasDiferencaDatum[]` — `group`, `year` e `value`
   * (taxa 0–1). `featured` e `baseline` escolhem as duas séries (padrão: o
   * primeiro e o segundo grupo de `data`); `gapIntro` é a frase do painel de
   * baixo.
   *
   * **Etapas (`LINHAS_DIFERENCA_STEPS`):** referência → destaque → diferença →
   * diferença no último ano. Não tem `highlight`.
   *
   * ```ts
   * import { LinhasDiferencaChart, LINHAS_DIFERENCA_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Linhas com diferença',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: LinhasDiferencaChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof LinhasDiferencaChart>;

  const textos = {
    featured: GRUPO_DESTAQUE,
    baseline: REFERENCIA,
    measureLabel: 'Taxa',
    gapIntro: `A taxa do ${GRUPO_DESTAQUE} superou a da ${REFERENCIA.toLowerCase()} em...`,
  };
  const etapas = LINHAS_DIFERENCA_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: taxasPorAno,
    ...textos,
    title: 'Uma taxa diante da referência, e a distância entre as duas',
    subtitle: 'Taxa anual e a diferença em pontos percentuais',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <LinhasDiferencaChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Sem `featured` e `baseline`, o primeiro grupo de `data` é o destaque e o segundo a referência. -->
<Story name="Só os padrões">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasDiferencaChart data={taxasPorAno} title="Uma taxa diante da referência" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `LINHAS_DIFERENCA_STEPS`, uma etapa por seção do scrollytelling. -->
<Story name="Etapas">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step />
      <LinhasDiferencaChart
        data={taxasPorAno}
        {...textos}
        {step}
        title="Uma taxa diante da referência, e a distância entre as duas"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <LinhasDiferencaChart
          data={taxasPorAno}
          {...textos}
          step={etapa}
          title="Uma taxa diante da referência, e a distância entre as duas"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
