<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColunasEmpilhadasChart from '$lib/components/eixo6/ColunasEmpilhadasChart.svelte';
  import { COLUNAS_EMPILHADAS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, composicaoPorAno } from './_exemplos';

  /**
   * Colunas que fecham em 100%: a composição de cada ano, não o volume.
   * É o `ColunasEmpilhadasChart` com `normalize`.
   *
   * **Função:** composição — parte do todo ao longo do tempo.
   *
   * **Quando usar:** para poucas categorias (até umas quatro) em poucos momentos,
   * quando a pergunta é quanto cada uma pesa no total e como esse peso muda.
   *
   * **Quando não usar:** se o volume importa, *Colunas empilhadas* sem
   * `normalize`; para muitos anos e categorias que entram e saem, *Faixas de
   * participação*.
   *
   * **Dados:** `data: ColunasDatum[]` — `label` da coluna e `values` por chave;
   * `keys` dá a ordem de empilhamento (de baixo para cima) e `labels` os nomes.
   * `spans` marca com colchete um trecho sem medição.
   *
   * **Etapas (`COLUNAS_EMPILHADAS_STEPS`):** colunas → valores. `highlight`
   * recebe o nome de uma série.
   *
   * ```ts
   * import { ColunasEmpilhadasChart, COLUNAS_EMPILHADAS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Composição',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: ColunasEmpilhadasChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof ColunasEmpilhadasChart>;

  const keys = ['a', 'b', 'c'];
  const labels = { a: 'Categoria A', b: 'Categoria B', c: 'Categoria C' };
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
    data: composicaoPorAno,
    keys,
    labels,
    normalize: true,
    title: 'A participação de cada categoria, onda a onda',
    subtitle: 'Participação no total de cada ano (%)',
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

<!-- Um trecho sem série marcado com colchete: zero que significa "não foi medido". -->
<Story name="Com trecho sem medição">
  {#snippet template()}
    <div style="max-width: 680px;">
      <ColunasEmpilhadasChart
        data={composicaoPorAno}
        {keys}
        {labels}
        normalize
        spans={[{ from: '2009', to: '2012', text: 'sem medição neste período' }]}
        title="A participação de cada categoria, onda a onda"
      />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `COLUNAS_EMPILHADAS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <ColunasEmpilhadasChart
        data={composicaoPorAno}
        {keys}
        {labels}
        normalize
        {step}
        {highlight}
        title="A participação de cada categoria, onda a onda"
      />
    </div>
  {/snippet}
</Story>
