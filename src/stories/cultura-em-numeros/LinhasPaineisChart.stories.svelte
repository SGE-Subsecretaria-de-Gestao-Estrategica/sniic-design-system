<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasPaineisChart from '$lib/components/eixo6/LinhasPaineisChart.svelte';
  import { LINHAS_PAINEIS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, paineis, paineisAnos, paineisReferencia } from './_exemplos';

  /**
   * Um painel por grupo, no mesmo eixo de anos e na mesma escala, com a
   * referência ao fundo de cada um. Um `null` é um ano sem medição: a linha
   * se interrompe ali.
   *
   * **Função:** evolução no tempo — muitos grupos, cada um diante da referência.
   *
   * **Quando usar:** com cinco ou mais séries que, juntas, virariam um novelo; a
   * escala comum mantém os painéis comparáveis entre si.
   *
   * **Quando não usar:** com poucas séries e um destaque, *Linhas comparadas*;
   * só dois momentos, *Antes e depois*.
   *
   * **Dados:** `years: number[]` e `panels: LinhasPainel[]` — `label`, `note`
   * opcional e `values` na ordem de `years` (`null` = sem medição).
   * `reference` é a série de fundo, repetida em cada painel.
   *
   * **Etapas (`LINHAS_PAINEIS_STEPS`):** referência → painéis → valores.
   * `highlight` recebe o `label` de um painel.
   *
   * ```ts
   * import { LinhasPaineisChart, LINHAS_PAINEIS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Linhas em painéis',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: LinhasPaineisChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof LinhasPaineisChart>;

  const pct = (v: number) => `${Math.round(v)}%`;
  const etapas = LINHAS_PAINEIS_STEPS;
  const grupos = paineis.map((p) => p.label);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    years: paineisAnos,
    panels: paineis,
    reference: paineisReferencia,
    referenceLabel: 'Referência',
    formatValue: pct,
    title: 'Cada grupo diante da referência',
    subtitle: 'Valor de cada grupo ao longo das medições (%)',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <LinhasPaineisChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <LinhasPaineisChart years={paineisAnos} panels={paineis} reference={paineisReferencia} formatValue={pct} title="Linhas em painéis" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `LINHAS_PAINEIS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={grupos} bind:highlight />
      <LinhasPaineisChart
        years={paineisAnos}
        panels={paineis}
        reference={paineisReferencia}
        formatValue={pct}
        {step}
        {highlight}
        title="Cada grupo diante da referência"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <LinhasPaineisChart
          years={paineisAnos}
          panels={paineis}
          reference={paineisReferencia}
          formatValue={pct}
          step={etapa}
          title="Cada grupo diante da referência"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
