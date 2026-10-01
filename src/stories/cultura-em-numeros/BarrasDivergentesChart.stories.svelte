<script lang="ts" module>
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
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Barras divergentes' });

  const lados = { left: 'Parcela à esquerda', right: 'Parcela à direita' };
  const etapas = BARRAS_DIVERGENTES_STEPS;
  const grupos = divergentes.map((d) => d.label);
  const { palette } = getPillarTheme(6);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasDivergentesChart
        data={divergentes}
        sideLabels={lados}
        title="Duas parcelas em direções opostas, na mesma escala"
        subtitle="Valor de cada parcela, por grupo"
        source={FONTE}
      />
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

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <BarrasDivergentesChart data={divergentes} sideLabels={lados} title="Duas parcelas opostas" />
    </div>
  {/snippet}
</Story>

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

<Story name="Scrollytelling">
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
