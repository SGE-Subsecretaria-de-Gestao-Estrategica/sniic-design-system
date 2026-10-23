<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BarraParticaoChart from '$lib/components/eixo6/BarraParticaoChart.svelte';
  import { BARRA_PARTICAO_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, particao, particaoEscopos } from './_exemplos';

  /**
   * As partes de um todo como linhas de barras, todas do mesmo zero, cada uma
   * sobre um trilho claro que vale o todo (100%). Uma parte com pedaços é
   * seguida de uma linha mais fina por pedaço, sobre um trilho do comprimento
   * da parte — o pedaço lê como fatia da parte, sem sair da escala do todo.
   * As barras são as do ranking: `CapsuleBar`, um matiz só, nomes na calha e
   * valores numa coluna depois dos 100%.
   *
   * **Função:** composição — parte do todo, e o detalhe de uma das partes.
   *
   * **Quando usar:** para a frase "das que têm, quantas…" — 63,2% das escolas
   * não têm biblioteca; das que têm, 56,5% não têm profissional. O trilho do
   * pedaço é a parte de onde ele vem, então o segundo percentual lê contra a
   * base certa. Com mais de um todo (`label` em cada linha de `data`), cada um
   * vira um bloco com título.
   *
   * **Quando não usar:** para muitas linhas ou muitos momentos, *Composição*
   * (colunas empilhadas normalizadas); para comparar uma repartição com a de
   * referência categoria a categoria, *Bolhas comparadas*; para duas parcelas
   * em poucos escopos (cotistas e não cotistas), *Barras divergentes*; para
   * partes que não somam um todo (respostas múltiplas), *Barras em ranking*.
   *
   * **Dados:** `data: BarraParticaoLinha[]` — cada todo tem `label` (opcional,
   * vira o título do bloco) e `parts`; cada parte tem `label` e `value`, ou
   * `parts` com os pedaços (o valor dela é a soma deles). Valores em qualquer
   * unidade: as parcelas são calculadas. `pieceSuffix` (padrão "da parte")
   * segue o percentual de cada pedaço, que é da parte e não do todo.
   *
   * **Etapas (`BARRA_PARTICAO_STEPS`):** partes → pedaços. Sem parte com
   * pedaços, a segunda etapa não muda nada. `highlight` recebe o nome de uma parte ou de
   * um pedaço.
   *
   * ```ts
   * import { BarraParticaoChart, BARRA_PARTICAO_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Barra de partição',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: BarraParticaoChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof BarraParticaoChart>;

  const etapas = BARRA_PARTICAO_STEPS;
  const opcoes = ['Parte A', 'Parte B', 'Pedaço B1', 'Pedaço B2'];
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`): duas partes, a segunda com dois pedaços sobre o trilho dela. Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: particao,
    valueLabel: 'Unidades',
    title: 'A maior parte fica na Parte A; da Parte B, mais da metade é Pedaço B2',
    subtitle: 'Repartição das unidades (%)',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <BarraParticaoChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna estreita a calha dos nomes encolhe e as barras afinam, como no ranking. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <BarraParticaoChart data={particao} title="Repartição das unidades" source={FONTE} />
    </div>
  {/snippet}
</Story>

<!-- Dois todos, sem pedaços: cada um vira um bloco com título. Para só duas parcelas, *Barras divergentes* também serve. -->
<Story name="Escopos comparados">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarraParticaoChart
        data={particaoEscopos}
        rowLabel="Escopo"
        valueLabel="Unidades"
        title="No grupo, a Parte A passa da metade; na referência, não"
        subtitle="Repartição em cada escopo (%)"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `BARRA_PARTICAO_STEPS`; o seletor passa o valor de `highlight` — uma parte ou um pedaço. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step {opcoes} bind:highlight />
      <BarraParticaoChart data={particao} {step} {highlight} title="Repartição das unidades" />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <BarraParticaoChart data={particao} step={etapa} title="Repartição das unidades" />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
