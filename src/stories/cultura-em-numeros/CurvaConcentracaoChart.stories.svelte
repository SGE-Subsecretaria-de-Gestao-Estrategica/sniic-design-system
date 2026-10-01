<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CurvaConcentracaoChart from '$lib/components/eixo6/CurvaConcentracaoChart.svelte';
  import { CURVA_CONCENTRACAO_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import { FONTE, lorenz, parcelaDoTopo } from './_exemplos';

  /**
   * Quanto do total se acumula conforme se percorrem as unidades. A curva é o
   * traço grosso da família; a diagonal tracejada, a igualdade; a área entre
   * as duas, a concentração.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Concentração' });

  const pct = (v: number) => `${formatLocale.format(',.1f')(v)}%`;
  const marks = [50, 10, 1].map((top) => ({
    top,
    label: `os ${top}% maiores concentram ${pct(parcelaDoTopo(top))}`,
  }));
  const etapas = CURVA_CONCENTRACAO_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 560px;">
      <CurvaConcentracaoChart
        points={lorenz}
        {marks}
        title="Quanto do total sai de quão poucos"
        subtitle="Total acumulado, da menor unidade à maior"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <CurvaConcentracaoChart points={lorenz} {marks} title="Concentração" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas">
  {#snippet template()}
    <div style="max-width: 560px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step />
      <CurvaConcentracaoChart points={lorenz} {marks} {step} title="Quanto do total sai de quão poucos" />
    </div>
  {/snippet}
</Story>
