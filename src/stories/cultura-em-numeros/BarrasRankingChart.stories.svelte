<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BarrasRankingChart from '$lib/components/eixo6/BarrasRankingChart.svelte';
  import { BARRAS_RANKING_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, ranking } from './_exemplos';

  /**
   * Uma categoria por linha, todas do mesmo zero, da maior para a menor. Cada
   * barra é uma `CapsuleBar` — o traço grosso de ponta redonda com o ponto na
   * ponta, o mesmo das linhas.
   *
   * **Função:** comparação entre categorias — ordem e magnitude.
   *
   * **Quando usar:** para mostrar quem é maior numa só medida, com nomes longos
   * (eles quebram na calha à esquerda) e valores de ordens de grandeza diferentes
   * — as barras curtas viram lascas, nunca são infladas.
   *
   * **Quando não usar:** para duas parcelas por categoria, *Barras divergentes*;
   * para dois momentos, *Antes e depois*; para séries no tempo, as linhas.
   *
   * **Dados:** `data: BarrasRankingDatum[]` — `label` e `value` (não negativo).
   * `sort="none"` mantém a ordem de `data`, para categorias que já têm ordem
   * própria (faixas etárias, de renda). `reference` desenha uma linha tracejada
   * atrás das barras — uma paridade, uma meta, uma média —, com o nome em
   * `referenceLabel`.
   *
   * **Etapas (`BARRAS_RANKING_STEPS`):** barras → valores. `highlight` recebe o
   * `label` de uma categoria.
   *
   * ```ts
   * import { BarrasRankingChart, BARRAS_RANKING_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Barras em ranking',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: BarrasRankingChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof BarrasRankingChart>;

  const etapas = BARRAS_RANKING_STEPS;
  const categorias = ranking.map((d) => d.label);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: ranking,
    valueLabel: 'Valor',
    title: 'Categorias em ranking, da maior à menor',
    subtitle: 'Valor de cada categoria',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <BarrasRankingChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna estreita a calha dos nomes encolhe e as barras afinam. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <BarrasRankingChart data={ranking} title="Categorias em ranking" source={FONTE} />
    </div>
  {/snippet}
</Story>

<!-- `reference` traça uma linha atrás das barras — aqui, a paridade em 1 —, nomeada sob a última linha; a escala se estende para mantê-la à vista. -->
<Story name="Com referência">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasRankingChart
        data={[
          { label: 'Unidade A', value: 5 },
          { label: 'Unidade B', value: 3.2 },
          { label: 'Unidade C', value: 2.5 },
          { label: 'Unidade D', value: 2.1 },
          { label: 'Unidade E', value: 1.8 },
          { label: 'Unidade F', value: 1.2 },
          { label: 'Unidade G', value: 0.8 },
          { label: 'Unidade H', value: 0.7 },
        ]}
        formatValue={(v) => v.toFixed(1).replace('.', ',')}
        valueLabel="Razão entre os dois lados"
        reference={1}
        referenceLabel="paridade"
        title="Razão entre os dois lados, por unidade"
        subtitle="Abaixo da linha tracejada, um lado supera o outro"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- `sort="none"` mantém a ordem de `data` — para categorias que já têm ordem própria. -->
<Story name="Ordem dos dados">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasRankingChart
        data={[...ranking].reverse()}
        sort="none"
        title="Categorias na ordem em que chegaram"
      />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `BARRAS_RANKING_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={categorias} bind:highlight />
      <BarrasRankingChart
        data={ranking}
        {step}
        {highlight}
        title="Categorias em ranking, da maior à menor"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <BarrasRankingChart
          data={ranking}
          step={etapa}
          title="Categorias em ranking, da maior à menor"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
