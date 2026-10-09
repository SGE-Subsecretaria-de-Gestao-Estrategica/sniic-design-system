<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TabelaBarrasChart from '$lib/components/eixo6/TabelaBarrasChart.svelte';
  import { tabelaBarrasSteps } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, tabelaColunas, tabelaLinhas, tabelaRazaoLinhas, tabelaTotal } from './_exemplos';

  /**
   * Uma linha por categoria, uma coluna por medida: cada célula é uma
   * `CapsuleBar` com o seu valor, e cada coluna tem a sua própria escala.
   *
   * **Função:** comparação entre categorias em várias medidas ao mesmo tempo.
   *
   * **Quando usar:** no lugar de uma tabela que iria crua para a página — duas
   * a quatro medidas por linha, em unidades que não se misturam (ações,
   * pessoas, municípios, uma razão). Cada coluna se lê de cima para baixo como
   * um ranking; cada linha, da esquerda para a direita. As barras só se
   * comparam dentro da coluna.
   *
   * **Quando não usar:** para uma medida só, *Barras em ranking*; para medidas
   * que somam um todo, *Colunas empilhadas*; para um cruzamento de duas
   * categorias, *Matriz de bolhas*.
   *
   * **Dados:** `columns: TabelaBarrasColuna[]` — `label`, e opcionalmente
   * `format`, `reference` e `referenceLabel` (uma linha tracejada, como a
   * paridade) — e `rows: TabelaBarrasLinha[]` — `label`, `note` opcional e
   * `values` na ordem de `columns`. `null` é *não informado*: vira texto, nunca
   * zero. `total` fecha a tabela, escrito e não desenhado. `sortBy` ordena pelo
   * índice de uma coluna; sem ele, vale a ordem de `rows`.
   *
   * **Etapas (`tabelaBarrasSteps(columns, { total })`):** uma por coluna — cada
   * uma traz a sua medida e esmaece as já lidas — e, por fim, a tabela inteira,
   * com o total. Como seguem as colunas, as etapas são geradas a partir delas;
   * `stepLabel` em cada coluna dá o texto da etapa. `highlight` recebe o `label`
   * de uma linha.
   *
   * ```ts
   * import { TabelaBarrasChart, tabelaBarrasSteps } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Tabela com barras',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: TabelaBarrasChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof TabelaBarrasChart>;

  const colunas = tabelaColunas.map((label) => ({ label }));
  const razao = (v: number) => v.toFixed(1).replace('.', ',');
  const colunasComReferencia = [
    { label: 'Participantes' },
    { label: 'Unidades envolvidas' },
    { label: 'Razão entre os dois lados', format: razao, reference: 1, referenceLabel: 'paridade' },
  ];
  const etapas = tabelaBarrasSteps(colunas, { total: true });

  /** O texto de cada etapa, para a story de scroll: uma frase por medida. */
  const colunasNarradas = [
    { label: 'Ações', stepLabel: 'O Grupo B realizou mais ações que qualquer outro: 368, um terço do total.' },
    { label: 'Participantes', stepLabel: 'Em participantes, o Grupo D passa o B, mesmo com 87 ações a menos.' },
    { label: 'Unidades envolvidas', stepLabel: 'E o Grupo B é também o que chegou a mais unidades: 134.' },
  ];
  const etapasNarradas = tabelaBarrasSteps(colunasNarradas, { total: true });
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    columns: colunas,
    rows: tabelaLinhas,
    total: tabelaTotal,
    rowLabel: 'Grupo',
    title: 'Três medidas de cada grupo, lado a lado',
    subtitle: 'Cada coluna na sua própria escala',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <TabelaBarrasChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Uma coluna com referência (a paridade em 1) e valores não informados, que viram texto em vez de zero; ordenada pela primeira coluna. -->
<Story name="Com referência">
  {#snippet template()}
    <div style="max-width: 680px;">
      <TabelaBarrasChart
        columns={colunasComReferencia}
        rows={tabelaRazaoLinhas}
        sortBy={0}
        rowLabel="Unidade"
        title="Participação por unidade, e a razão entre os dois lados"
        subtitle="Abaixo da linha tracejada, um lado supera o outro"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular os nomes ganham uma linha própria acima das barras, e as colunas ficam com a largura toda. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <TabelaBarrasChart columns={colunas} rows={tabelaLinhas} total={tabelaTotal} title="Tabela com barras" source={FONTE} />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `tabelaBarrasSteps(colunas, { total: true })` — uma etapa por coluna, depois a tabela inteira; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={tabelaLinhas.map((r) => r.label)} bind:highlight />
      <TabelaBarrasChart
        columns={colunas}
        rows={tabelaLinhas}
        total={tabelaTotal}
        {step}
        {highlight}
        title="Três medidas de cada grupo, lado a lado"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Cada etapa traz uma coluna e esmaece as já lidas; a última mostra a tabela inteira, com o total. O texto de cada etapa vem de `stepLabel`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly etapas={etapasNarradas}>
      {#snippet grafico(etapa: number)}
        <TabelaBarrasChart
          columns={colunasNarradas}
          rows={tabelaLinhas}
          total={tabelaTotal}
          step={etapa}
          title="Três medidas de cada grupo, lado a lado"
          source={FONTE}
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
