<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BolhasComparadasChart from '$lib/components/eixo6/BolhasComparadasChart.svelte';
  import { BOLHAS_COMPARADAS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { ESCOPOS, FONTE, composicaoEmDoisEscopos } from './_exemplos';

  /**
   * A mesma repartição em dois escopos, lado a lado: uma coluna de bolhas de
   * área proporcional por escopo, categorias nas linhas. A cor marca o escopo,
   * a área o valor; a referência é hachurada.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Bolhas comparadas' });

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

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BolhasComparadasChart
        data={composicaoEmDoisEscopos}
        {...textos}
        title="A mesma repartição em dois escopos"
        subtitle="Participação de cada categoria no grupo e na referência"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

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

<Story name="Scrollytelling">
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
