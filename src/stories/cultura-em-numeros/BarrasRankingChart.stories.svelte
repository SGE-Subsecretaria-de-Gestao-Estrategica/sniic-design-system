<script lang="ts" module>
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
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Barras em ranking' });

  const etapas = BARRAS_RANKING_STEPS;
  const categorias = ranking.map((d) => d.label);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasRankingChart
        data={ranking}
        valueLabel="Valor"
        title="Categorias em ranking, da maior à menor"
        subtitle="Valor de cada categoria"
        source={FONTE}
      />
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

<Story name="Scrollytelling">
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
