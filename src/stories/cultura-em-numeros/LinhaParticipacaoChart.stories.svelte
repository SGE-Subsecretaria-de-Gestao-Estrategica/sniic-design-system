<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhaParticipacaoChart from '$lib/components/eixo6/LinhaParticipacaoChart.svelte';
  import { LINHA_PARTICIPACAO_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, GRUPO_DESTAQUE, QUEBRA, serieComParticipacao } from './_exemplos';

  /**
   * Linha de valores absolutos com a participação no total logo abaixo, em
   * bolhas de área proporcional — dois painéis sobre o mesmo eixo de anos,
   * nunca duas escalas no mesmo plot.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Linha com participação' });

  const textos = {
    seriesLabel: GRUPO_DESTAQUE,
    valueLabel: 'Valor',
    shareLabel: 'Participação no total',
    shareIntro: 'No total, esse grupo representa...',
    shareSuffix: 'do total',
    breakYear: QUEBRA,
  };
  const etapas = LINHA_PARTICIPACAO_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhaParticipacaoChart
        data={serieComParticipacao}
        {...textos}
        title="Uma série absoluta e a participação dela no total"
        subtitle="Valor anual e participação no total, 2015–2024"
        source="{FONTE} A série tem quebra metodológica em {QUEBRA}."
      />
    </div>
  {/snippet}
</Story>

<!-- Sem `breakYear`, a série é contínua; sem `seriesLabel` e `shareIntro`, nada é escrito no lugar deles. -->
<Story name="Série contínua, só os padrões">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhaParticipacaoChart
        data={serieComParticipacao}
        title="Uma série absoluta e a participação dela no total"
      />
    </div>
  {/snippet}
</Story>

<Story name="Todos os valores rotulados">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhaParticipacaoChart
        data={serieComParticipacao}
        {...textos}
        valueLabels="all"
        title="Uma série absoluta e a participação dela no total"
      />
    </div>
  {/snippet}
</Story>

<Story name="Etapas">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step />
      <LinhaParticipacaoChart
        data={serieComParticipacao}
        {...textos}
        {step}
        title="Uma série absoluta e a participação dela no total"
        subtitle="Cada etapa corresponde a uma seção do scrollytelling no projeto que consome o pacote"
      />
    </div>
  {/snippet}
</Story>

<Story name="Scrollytelling">
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <LinhaParticipacaoChart
          data={serieComParticipacao}
          {...textos}
          step={etapa}
          title="Uma série absoluta e a participação dela no total"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
