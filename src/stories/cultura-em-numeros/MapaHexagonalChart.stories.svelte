<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MapaHexagonalChart from '$lib/components/eixo6/MapaHexagonalChart.svelte';
  import { MAPA_HEXAGONAL_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, UFS, sorteio } from './_exemplos';

  /**
   * O Brasil esquemático, uma célula por UF, duas barras em cada uma e a
   * referência atravessando todas. Quem supera a referência ganha o ponto de
   * destaque na ponta da barra.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Mapa hexagonal' });

  const r = sorteio(3);
  const valores = UFS.map((uf) => {
    const a = Math.round(5 + r() * 30);
    return { uf, a, b: Math.min(95, Math.round(a + 5 + r() * 35)) };
  });
  const media = Math.round(valores.reduce((s, v) => s + v.b, 0) / valores.length);
  const etapas = MAPA_HEXAGONAL_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 720px;">
      <MapaHexagonalChart
        values={valores}
        reference={media}
        aLabel="Primeira medição"
        bLabel="Segunda medição"
        referenceLabel="Média"
        title="Duas medições por estado, e a média"
        subtitle="Percentual de unidades com a ação, em duas medições"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <MapaHexagonalChart values={valores} reference={media} title="Mapa hexagonal" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 720px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={UFS} bind:highlight />
      <MapaHexagonalChart
        values={valores}
        reference={media}
        referenceLabel="Média"
        {step}
        {highlight}
        title="Duas medições por estado, e a média"
      />
    </div>
  {/snippet}
</Story>

<Story name="Scrollytelling">
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <MapaHexagonalChart values={valores} reference={media} referenceLabel="Média" step={etapa} title="Duas medições por estado" />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
