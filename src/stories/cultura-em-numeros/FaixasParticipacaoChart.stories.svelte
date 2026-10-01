<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FaixasParticipacaoChart from '$lib/components/eixo6/FaixasParticipacaoChart.svelte';
  import { FAIXAS_PARTICIPACAO_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, participacaoPorAno } from './_exemplos';

  /**
   * Os anos de cima para baixo; em cada um, as categorias repartem a largura
   * toda. A largura de cada faixa é a participação; as transições fluem no vão
   * entre os anos.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Faixas de participação' });

  const keys = ['a', 'b', 'c', 'd', 'e'];
  const labels = { a: 'Categoria A', b: 'Categoria B', c: 'Categoria C', d: 'Categoria D', e: 'Categoria E' };
  const highlights = [
    { year: 2006, value: 'R$ 2,9 bi', title: 'B e C entram na série' },
    { year: 2020, value: 'R$ 7,4 bi', title: 'a Categoria D aparece', note: 'por dois anos só' },
    { year: 2023, value: 'R$ 9,5 bi', title: 'a Categoria E começa' },
  ];
  const etapas = FAIXAS_PARTICIPACAO_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <FaixasParticipacaoChart
        data={participacaoPorAno}
        {keys}
        {labels}
        {highlights}
        title="A participação de cada categoria, ano a ano"
        subtitle="Participação no total de cada ano · 2003–2025"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <FaixasParticipacaoChart data={participacaoPorAno} {keys} {labels} {highlights} title="Faixas de participação" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <FaixasParticipacaoChart
        data={participacaoPorAno}
        {keys}
        {labels}
        {highlights}
        {step}
        {highlight}
        title="A participação de cada categoria, ano a ano"
      />
    </div>
  {/snippet}
</Story>
