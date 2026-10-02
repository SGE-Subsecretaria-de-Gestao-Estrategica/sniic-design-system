<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColunasEmpilhadasChart from '$lib/components/eixo6/ColunasEmpilhadasChart.svelte';
  import { COLUNAS_EMPILHADAS_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, colunasCategoria } from './_exemplos';

  /**
   * Uma coluna por categoria, as séries empilhadas em valor absoluto. Cada
   * coluna é uma `CapsuleStack` — a cápsula da família dividida em faixas.
   *
   * **Função:** composição — o total e as partes dele.
   *
   * **Quando usar:** quando o total de cada coluna importa e a repartição dele
   * também: o orçamento por categoria e por fonte, o público por região e por
   * tipo. A mesma base cobre *Composição* (`normalize`) e *Colunas com fitas*
   * (`rank` + `ribbons`).
   *
   * **Quando não usar:** com muitas séries (passou de quatro, as faixas do meio
   * ficam ilegíveis); para comparar uma série entre colunas, as linhas ou
   * *Barras em ranking*.
   *
   * **Dados:** `data: ColunasDatum[]` — `label` da coluna e `values` por chave;
   * `keys` dá a ordem de empilhamento, `labels` os nomes, `colors` substitui a
   * paleta categórica do pilar.
   *
   * **Etapas (`COLUNAS_EMPILHADAS_STEPS`):** colunas → valores. `highlight`
   * recebe o nome de uma série.
   *
   * ```ts
   * import { ColunasEmpilhadasChart, COLUNAS_EMPILHADAS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Colunas empilhadas',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: ColunasEmpilhadasChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof ColunasEmpilhadasChart>;

  const keys = ['a', 'b', 'c'];
  const labels = { a: 'Série A', b: 'Série B', c: 'Série C' };
  const bi = (v: number) => formatLocale.format(',.1f')(v);
  const etapas = COLUNAS_EMPILHADAS_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: colunasCategoria,
    keys,
    labels,
    formatValue: bi,
    title: 'O total de cada categoria, por série',
    subtitle: 'R$ bilhões',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <ColunasEmpilhadasChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <ColunasEmpilhadasChart data={colunasCategoria} {keys} {labels} formatValue={bi} title="Colunas empilhadas" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `COLUNAS_EMPILHADAS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <ColunasEmpilhadasChart
        data={colunasCategoria}
        {keys}
        {labels}
        formatValue={bi}
        {step}
        {highlight}
        title="O total de cada categoria, por série"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <ColunasEmpilhadasChart
          data={colunasCategoria}
          {keys}
          {labels}
          formatValue={bi}
          step={etapa}
          title="O total de cada categoria, por série"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
