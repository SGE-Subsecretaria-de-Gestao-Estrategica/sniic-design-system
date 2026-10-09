<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhaParticipacaoChart from '$lib/components/eixo6/LinhaParticipacaoChart.svelte';
  import { LINHA_PARTICIPACAO_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, GRUPO_DESTAQUE, QUEBRA, serieComParticipacao } from './_exemplos';

  /**
   * Linha de valores absolutos com a participação no total logo abaixo, em
   * bolhas de área proporcional — dois painéis sobre o mesmo eixo de anos,
   * nunca duas escalas no mesmo plot. Um dos gráficos de referência da
   * identidade visual.
   *
   * **Função:** evolução no tempo — o volume e o peso no total.
   *
   * **Quando usar:** para uma série só, quando é preciso dizer ao mesmo tempo
   * quanto ela vale e quanto representa de um total maior.
   *
   * **Quando não usar:** para várias séries, *Linhas comparadas*; para a
   * distância entre duas taxas, *Linhas com diferença*.
   *
   * **Dados:** `data: LinhaParticipacaoDatum[]` — `year`, `value` (absoluto,
   * a linha) e `share` (0–1, a bolha). `breakYear` marca uma quebra
   * metodológica; os textos (`seriesLabel`, `valueLabel`, `shareLabel`,
   * `shareIntro`, `shareSuffix`) são todos props.
   *
   * **Etapas (`LINHA_PARTICIPACAO_STEPS`):** linha → valores do início e do
   * fim → quebra → participação → nome da série.
   *
   * ```ts
   * import { LinhaParticipacaoChart, LINHA_PARTICIPACAO_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Linha com participação',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: LinhaParticipacaoChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof LinhaParticipacaoChart>;

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

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: serieComParticipacao,
    ...textos,
    title: 'Uma série absoluta e a participação dela no total',
    subtitle: 'Valor anual e participação no total, 2015–2024',
    source: `${FONTE} A série tem quebra metodológica em ${QUEBRA}.`,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <LinhaParticipacaoChart {...args as Args} />
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

<!-- `valueLabels="all"` escreve um número em cada ponto; o padrão (`selective`) rotula só o primeiro, o último e o ano sob o mouse. -->
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

<!-- O slider percorre `LINHA_PARTICIPACAO_STEPS`, uma etapa por seção do scrollytelling. -->
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

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
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
