<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasDiferencaChart from '$lib/components/eixo6/LinhasDiferencaChart.svelte';
  import { LINHAS_DIFERENCA_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, GRUPO_DESTAQUE, REFERENCIA, taxasPorAno } from './_exemplos';

  /**
   * Duas taxas na mesma escala e, num painel abaixo, a distância entre elas em
   * pontos percentuais — a diferença é outra medida, então ganha outro plot.
   *
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Linhas com diferença' });

  const textos = {
    featured: GRUPO_DESTAQUE,
    baseline: REFERENCIA,
    measureLabel: 'Taxa',
    gapIntro: `A taxa do ${GRUPO_DESTAQUE} superou a da ${REFERENCIA.toLowerCase()} em...`,
  };
  const etapas = LINHAS_DIFERENCA_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasDiferencaChart
        data={taxasPorAno}
        {...textos}
        title="Uma taxa diante da referência, e a distância entre as duas"
        subtitle="Taxa anual e a diferença em pontos percentuais"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Sem `featured` e `baseline`, o primeiro grupo de `data` é o destaque e o segundo a referência. -->
<Story name="Só os padrões">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasDiferencaChart data={taxasPorAno} title="Uma taxa diante da referência" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step />
      <LinhasDiferencaChart
        data={taxasPorAno}
        {...textos}
        {step}
        title="Uma taxa diante da referência, e a distância entre as duas"
      />
    </div>
  {/snippet}
</Story>

<Story name="Scrollytelling">
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <LinhasDiferencaChart
          data={taxasPorAno}
          {...textos}
          step={etapa}
          title="Uma taxa diante da referência, e a distância entre as duas"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
