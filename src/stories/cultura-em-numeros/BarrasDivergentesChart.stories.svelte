<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BarrasDivergentesChart from '$lib/components/eixo6/BarrasDivergentesChart.svelte';
  import { BARRAS_DIVERGENTES_STEPS } from '$lib/components/eixo6/steps';
  import { getPillarTheme } from '$lib/core/theme';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, divergentes } from './_exemplos';

  /**
   * Duas parcelas por categoria em direções opostas, numa só escala. Cada
   * metade é uma `CapsuleBar` — a da esquerda invertida —, com as mesmas cores
   * das outras barras por padrão.
   *
   * **Função:** comparação entre categorias — duas partes de cada uma.
   *
   * **Quando usar:** quando cada categoria se divide em duas parcelas que se
   * leem como lados opostos (entradas e saídas, formal e informal, homens e
   * mulheres) e importa ver, de uma vez, o tamanho de cada lado e qual domina.
   *
   * **Quando não usar:** para uma medida só, *Barras em ranking*; para a mesma
   * medida em dois momentos, *Antes e depois*; se as parcelas somam um todo que
   * importa, *Colunas empilhadas* em `normalize`.
   *
   * **Dados:** `data: BarrasDivergentesDatum[]` — `label`, `left` e `right`,
   * ambos positivos (a direção é a codificação, não o sinal). `sideLabels` nomeia
   * os lados; `sideColors` troca a cor de um deles; `sort` ordena por um lado.
   *
   * **Etapas (`BARRAS_DIVERGENTES_STEPS`):** parcela da direita → parcela da
   * esquerda → valores. `highlight` recebe o `label` de uma categoria.
   *
   * ```ts
   * import { BarrasDivergentesChart, BARRAS_DIVERGENTES_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Barras divergentes',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: BarrasDivergentesChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof BarrasDivergentesChart>;

  const lados = { left: 'Parcela à esquerda', right: 'Parcela à direita' };
  const etapas = BARRAS_DIVERGENTES_STEPS;
  const grupos = divergentes.map((d) => d.label);
  const { palette } = getPillarTheme(6);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: divergentes,
    sideLabels: lados,
    title: 'Duas parcelas em direções opostas, na mesma escala',
    subtitle: 'Valor de cada parcela, por grupo',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <BarrasDivergentesChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Quando as parcelas pedem cor própria: `sideColors` aceita uma cor ou `[base, ponta]`. -->
<Story name="Cor por lado">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasDivergentesChart
        data={divergentes}
        sideLabels={lados}
        sideColors={{ left: [palette.secondary, palette.secondaryVariant] }}
        title="Duas parcelas em direções opostas, na mesma escala"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- `sort="right"` ordena as categorias pela parcela da direita, a maior primeiro; `"left"` faz o mesmo pela esquerda. -->
<Story name="Ordenado pela direita">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasDivergentesChart
        data={divergentes}
        sideLabels={lados}
        sort="right"
        title="Grupos ordenados pela parcela à direita"
      />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <BarrasDivergentesChart data={divergentes} sideLabels={lados} title="Duas parcelas opostas" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `BARRAS_DIVERGENTES_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={grupos} bind:highlight />
      <BarrasDivergentesChart
        data={divergentes}
        sideLabels={lados}
        {step}
        {highlight}
        title="Duas parcelas em direções opostas, na mesma escala"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <BarrasDivergentesChart
          data={divergentes}
          sideLabels={lados}
          step={etapa}
          title="Duas parcelas em direções opostas, na mesma escala"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
