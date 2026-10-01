<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MapaUfChart from '$lib/components/eixo6/MapaUfChart.svelte';
  import { MAPA_CLASSES_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, UFS, valoresPorUf } from './_exemplos';

  /**
   * Cada UF na cor da classe do seu valor, na rampa sequencial do pilar. As
   * grandes levam sigla e valor dentro; as pequenas ficam para o tooltip.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Mapa por UF' });

  const pct = (v: number) => `${Math.round(v)}%`;
  const valores = valoresPorUf(7, 4, 62).map(({ uf, valor }) => ({ uf, value: valor }));
  const etapas = MAPA_CLASSES_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 640px;">
      <MapaUfChart
        values={valores}
        breaks={[10, 20, 30, 50]}
        formatValue={pct}
        title="Uma classe por estado, da mais clara à mais escura"
        subtitle="Valor de cada UF, em cinco classes (%)"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Duas classes nomeadas em vez de faixas numéricas. -->
<Story name="Classes nomeadas">
  {#snippet template()}
    <div style="max-width: 640px;">
      <MapaUfChart
        values={valoresPorUf(11, 0, 1).map(({ uf, valor }) => ({ uf, value: valor }))}
        breaks={[1]}
        classLabels={['Classe A', 'Classe B']}
        formatValue={(v) => (v >= 1 ? 'B' : 'A')}
        title="Duas classes nomeadas"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <MapaUfChart values={valores} breaks={[10, 20, 30, 50]} formatValue={pct} title="Mapa por UF" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 640px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={UFS} bind:highlight />
      <MapaUfChart
        values={valores}
        breaks={[10, 20, 30, 50]}
        formatValue={pct}
        {step}
        {highlight}
        title="Uma classe por estado"
      />
    </div>
  {/snippet}
</Story>
