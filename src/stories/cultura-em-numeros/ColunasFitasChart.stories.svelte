<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColunasEmpilhadasChart from '$lib/components/eixo6/ColunasEmpilhadasChart.svelte';
  import { COLUNAS_EMPILHADAS_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import { FONTE, fontesPorAno } from './_exemplos';

  /**
   * Colunas por ano com as fontes reordenadas pelo valor — a maior no topo —
   * e fitas ligando a mesma fonte de um ano ao outro: quando a ordem muda, as
   * fitas se cruzam. É o `ColunasEmpilhadasChart` com `rank` e `ribbons`.
   *
   * **Função:** composição — quem lidera, e quando a liderança troca.
   *
   * **Quando usar:** para poucas fontes ou categorias que se revezam no topo,
   * quando a troca de posição é a história (fontes de financiamento ano a ano).
   *
   * **Quando não usar:** se a ordem é estável, as fitas só poluem — use
   * *Colunas empilhadas*; para muitos anos, *Faixas de participação*.
   *
   * **Dados:** os mesmos de *Colunas empilhadas* (`data`, `keys`, `labels`);
   * um valor `0` some da coluna e a fita correspondente se interrompe.
   *
   * **Etapas (`COLUNAS_EMPILHADAS_STEPS`):** colunas → valores. `highlight`
   * recebe o nome de uma fonte.
   *
   * ```ts
   * import { ColunasEmpilhadasChart, COLUNAS_EMPILHADAS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Colunas com fitas',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: ColunasEmpilhadasChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof ColunasEmpilhadasChart>;

  const keys = ['a', 'b', 'c', 'd'];
  const labels = { a: 'Fonte A', b: 'Fonte B', c: 'Fonte C', d: 'Fonte D' };
  const bi = (v: number) => `${formatLocale.format(',.1f')(v)} bi`;
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
    data: fontesPorAno,
    keys,
    labels,
    rank: true,
    ribbons: true,
    formatValue: bi,
    title: 'Fontes que se revezam, ano a ano',
    subtitle: 'Valor por fonte, R$ · 2019–2024',
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

<!-- O slider percorre `COLUNAS_EMPILHADAS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <ColunasEmpilhadasChart
        data={fontesPorAno}
        {keys}
        {labels}
        rank
        ribbons
        formatValue={bi}
        {step}
        {highlight}
        title="Fontes que se revezam, ano a ano"
      />
    </div>
  {/snippet}
</Story>
