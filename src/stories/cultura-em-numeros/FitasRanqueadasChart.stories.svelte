<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FitasRanqueadasChart from '$lib/components/eixo6/FitasRanqueadasChart.svelte';
  import { FITAS_RANQUEADAS_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import { FONTE, fontesRevezando } from './_exemplos';

  /**
   * Cada série é uma fita contínua que corre ano a ano, empilhada pelo valor —
   * a maior no topo. Em cada ano a fita fica plana com a sua espessura medida;
   * entre dois anos ela se curva, e quando uma série ultrapassa outra as fitas
   * se cruzam. Sem colunas: o ano é só uma linha-guia fina.
   *
   * **Função:** composição — quem lidera, e quando a liderança troca.
   *
   * **Quando usar:** para poucas fontes ou categorias (até umas cinco) que se
   * revezam no topo, quando a troca de posição é a história.
   *
   * **Quando não usar:** se a ordem é estável, os cruzamentos não contam nada —
   * use *Colunas empilhadas*; para muitos anos, *Faixas de participação*.
   *
   * **Dados:** os mesmos de *Colunas empilhadas* (`data`, `keys`, `labels`);
   * a ordem de `keys` só fixa as cores — a pilha é sempre por valor. Um valor
   * `0` afina a fita até sumir na base.
   *
   * **Opções:** `valueLabels` (`'all'` ou `'ends'`: só no início e no fim do
   * período, e de cada trecho), `showTotals`, `ribbonGap` (espaço entre as
   * fitas, em px) e `breakBefore` (o primeiro ano depois de uma quebra
   * metodológica, como a da RAIS: os anos se separam e as fitas atravessam o
   * vão esmaecidas, como as linhas atravessam a quebra tracejadas). O último
   * valor de cada fita fica só à direita, junto do nome, como no fim de uma
   * linha.
   *
   * **Etapas (`FITAS_RANQUEADAS_STEPS`):** fitas → valores. `highlight` recebe
   * o nome de uma série.
   *
   * ```ts
   * import { FitasRanqueadasChart, FITAS_RANQUEADAS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Fitas ranqueadas',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: FitasRanqueadasChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof FitasRanqueadasChart>;

  const keys = ['a', 'b', 'c', 'd'];
  const labels = { a: 'Fonte A', b: 'Fonte B', c: 'Fonte C', d: 'Fonte D' };
  const bi = (v: number) => `${formatLocale.format(',.1f')(v)} bi`;
  const etapas = FITAS_RANQUEADAS_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: fontesRevezando,
    keys,
    labels,
    formatValue: bi,
    title: 'Fontes que se revezam, ano a ano',
    subtitle: 'Valor por fonte, R$ · 2019–2024',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <FitasRanqueadasChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `FITAS_RANQUEADAS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <FitasRanqueadasChart
        data={fontesRevezando}
        {keys}
        {labels}
        formatValue={bi}
        {step}
        {highlight}
        title="Fontes que se revezam, ano a ano"
      />
    </div>
  {/snippet}
</Story>

<!-- Quebra da RAIS depois de 2021 (`breakBefore="2022"`), valores só no início e no fim de cada trecho e 4px entre as fitas. -->
<Story name="Quebra da série">
  {#snippet template()}
    <div style="max-width: 680px;">
      <FitasRanqueadasChart
        data={fontesRevezando}
        {keys}
        {labels}
        formatValue={bi}
        breakBefore="2022"
        valueLabels="ends"
        ribbonGap={4}
        title="Fontes que se revezam, ano a ano"
        subtitle="Valor por fonte, R$ · 2019–2024 · quebra da RAIS depois de 2021"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Abaixo de 520px o rodapé com os valores finais sai; a legenda fica. -->
<Story name="Estreito">
  {#snippet template()}
    <div style="max-width: 360px;">
      <FitasRanqueadasChart data={fontesRevezando} {keys} {labels} formatValue={bi} title="Fontes que se revezam" />
    </div>
  {/snippet}
</Story>
