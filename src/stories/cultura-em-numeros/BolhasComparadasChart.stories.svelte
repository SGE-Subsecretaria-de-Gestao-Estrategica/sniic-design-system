<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BolhasComparadasChart from '$lib/components/eixo6/BolhasComparadasChart.svelte';
  import { BOLHAS_COMPARADAS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { ESCOPOS, FONTE, composicaoEmDoisEscopos } from './_exemplos';

  /**
   * A mesma repartição em dois escopos, lado a lado: uma coluna de bolhas de
   * área proporcional por escopo, categorias nas linhas. A cor marca o escopo,
   * a área o valor; a referência é hachurada. Um dos gráficos de referência da
   * identidade visual.
   *
   * **Função:** composição — a mesma repartição em dois recortes.
   *
   * **Quando usar:** para comparar como um grupo se reparte entre categorias
   * contra a repartição de uma referência (o setor contra a economia, a região
   * contra o país), quando as participações vão de muito grandes a muito pequenas.
   *
   * **Quando não usar:** para mais de dois escopos, *Matriz de bolhas*; quando a
   * mudança entre dois momentos é a história, *Antes e depois*.
   *
   * **Dados:** `data: BolhasComparadasDatum[]` — `scope` (`'grupo'` ou
   * `'referencia'`), `category` e `share` (0–1). `scopeLabels` nomeia os dois
   * escopos; `excluded` tira categorias do gráfico e as cita em nota.
   *
   * **Etapas (`BOLHAS_COMPARADAS_STEPS`):** o grupo → a referência → onde se
   * afastam. `highlight` recebe uma `category`.
   *
   * ```ts
   * import { BolhasComparadasChart, BOLHAS_COMPARADAS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Bolhas comparadas',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: BolhasComparadasChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof BolhasComparadasChart>;

  const textos = {
    scopeLabels: ESCOPOS,
    categoryLabel: 'Categoria',
    excluded: ['Sem informação'],
  };
  const etapas = BOLHAS_COMPARADAS_STEPS;
  const categorias = [
    ...new Set(
      composicaoEmDoisEscopos
        .filter((d) => d.scope === 'grupo' && !textos.excluded.includes(d.category))
        .map((d) => d.category),
    ),
  ];
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: composicaoEmDoisEscopos,
    ...textos,
    title: 'A mesma repartição em dois escopos',
    subtitle: 'Participação de cada categoria no grupo e na referência',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <BolhasComparadasChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `BOLHAS_COMPARADAS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={categorias} bind:highlight />
      <BolhasComparadasChart
        data={composicaoEmDoisEscopos}
        {...textos}
        {step}
        {highlight}
        title="A mesma repartição em dois escopos"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <BolhasComparadasChart
          data={composicaoEmDoisEscopos}
          {...textos}
          step={etapa}
          title="A mesma repartição em dois escopos"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
