<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FaixasParticipacaoChart from '$lib/components/eixo6/FaixasParticipacaoChart.svelte';
  import { FAIXAS_PARTICIPACAO_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, participacaoPorAno } from './_exemplos';

  /**
   * Os anos de cima para baixo; em cada um, as categorias repartem a largura
   * toda. A largura de cada faixa é a participação; as transições fluem no vão
   * entre os anos.
   *
   * **Função:** composição — participação ao longo de muitos anos.
   *
   * **Quando usar:** para séries longas (dez, vinte anos) em que categorias
   * entram, saem e trocam de peso, e alguns anos pedem uma anotação — os
   * `highlights` na calha à direita.
   *
   * **Quando não usar:** para poucos momentos, *Composição*; se o volume importa
   * mais do que a participação, *Colunas empilhadas*.
   *
   * **Dados:** `data: ColunasDatum[]` com uma linha por ano (`label` é o ano),
   * `keys` na ordem da esquerda para a direita e `labels`. `highlights` são
   * blocos `{ year, value?, title, note? }`.
   *
   * **Etapas (`FAIXAS_PARTICIPACAO_STEPS`):** faixas → nomes → destaques.
   * `highlight` recebe o nome de uma categoria.
   *
   * ```ts
   * import { FaixasParticipacaoChart, FAIXAS_PARTICIPACAO_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Faixas de participação',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: FaixasParticipacaoChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof FaixasParticipacaoChart>;

  const keys = ['a', 'b', 'c', 'd', 'e'];
  const labels = { a: 'Categoria A', b: 'Categoria B', c: 'Categoria C', d: 'Categoria D', e: 'Categoria E' };
  const highlights = [
    { year: 2006, value: 'R$ 2,9 bi', title: 'B e C entram na série' },
    { year: 2020, value: 'R$ 7,4 bi', title: 'a Categoria D aparece', note: 'por dois anos só' },
    { year: 2023, value: 'R$ 9,5 bi', title: 'a Categoria E começa' },
  ];
  const etapas = FAIXAS_PARTICIPACAO_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: participacaoPorAno,
    keys,
    labels,
    highlights,
    title: 'A participação de cada categoria, ano a ano',
    subtitle: 'Participação no total de cada ano · 2003–2025',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <FaixasParticipacaoChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <FaixasParticipacaoChart data={participacaoPorAno} {keys} {labels} {highlights} title="Faixas de participação" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `FAIXAS_PARTICIPACAO_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <FaixasParticipacaoChart
        data={participacaoPorAno}
        {keys}
        {labels}
        {highlights}
        {step}
        {highlight}
        title="A participação de cada categoria, ano a ano"
      />
    </div>
  {/snippet}
</Story>
