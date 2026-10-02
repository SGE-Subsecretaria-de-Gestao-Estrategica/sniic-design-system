<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasComparadasChart from '$lib/components/eixo6/LinhasComparadasChart.svelte';
  import { LINHAS_COMPARADAS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, seriesPorAno } from './_exemplos';

  /**
   * Poucas séries pares, cada uma com a cor própria da paleta do pilar e o
   * nome na ponta. É o `LinhasComparadasChart` com `colorBy="series"`.
   *
   * **Função:** evolução no tempo — séries pares, sem sujeito.
   *
   * **Quando usar:** para duas a quatro séries que valem igualmente (indicadores
   * de um mesmo índice, faixas de uma população), quando nenhuma é o destaque.
   *
   * **Quando não usar:** se há um sujeito, deixe `colorBy` no padrão
   * (*Linhas comparadas*); com mais de quatro séries, *Linhas em painéis*.
   *
   * **Dados:** os mesmos de *Linhas comparadas* (`LinhasComparadasDatum[]`).
   * `valueLabels="all"` rotula todos os pontos — útil com poucas medições.
   *
   * **Etapas (`LINHAS_COMPARADAS_STEPS`):** as mesmas de *Linhas comparadas*.
   * `highlight` recebe um `group`.
   *
   * ```ts
   * import { LinhasComparadasChart, LINHAS_COMPARADAS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Linhas por série',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: LinhasComparadasChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof LinhasComparadasChart>;

  const pct = (v: number) => `${Math.round(v)}%`;
  const etapas = LINHAS_COMPARADAS_STEPS;
  const series = [...new Set(seriesPorAno.map((d) => d.group))];
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: seriesPorAno,
    colorBy: 'series',
    formatValue: pct,
    valueLabels: 'all',
    title: 'Três séries em três medições',
    subtitle: 'Valor de cada série (%)',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <LinhasComparadasChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `LINHAS_COMPARADAS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={series} bind:highlight />
      <LinhasComparadasChart
        data={seriesPorAno}
        colorBy="series"
        formatValue={pct}
        {step}
        {highlight}
        title="Três séries em três medições"
      />
    </div>
  {/snippet}
</Story>
