<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasAntesDepoisChart from '$lib/components/eixo6/LinhasAntesDepoisChart.svelte';
  import { LINHAS_ANTES_DEPOIS_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, antesDepois } from './_exemplos';

  /**
   * A mesma medida em dois momentos, uma categoria por linha. Cada par é um
   * `Dumbbell` — o traço grosso das linhas, com o marcador no antes e o ponto
   * de destaque no depois.
   *
   * **Função:** comparação entre categorias — mudança entre dois momentos.
   *
   * **Quando usar:** quando só os dois extremos importam (uma pesquisa em duas
   * edições) e o leitor precisa ver, categoria a categoria, quem subiu, quem caiu
   * e quanto.
   *
   * **Quando não usar:** com três ou mais momentos, as linhas (*Linhas
   * comparadas* ou *Linhas em painéis*); para duas parcelas do mesmo momento,
   * *Barras divergentes*.
   *
   * **Dados:** `data: LinhasAntesDepoisDatum[]` — `label`, `before` e `after`.
   * `beforeLabel`/`afterLabel` nomeiam os momentos; `sort` ordena por um deles
   * ou pela mudança; `domain` fixa a escala; `formatChange` escreve a variação.
   *
   * **Etapas (`LINHAS_ANTES_DEPOIS_STEPS`):** antes → depois → valores.
   * `highlight` recebe o `label` de uma categoria.
   *
   * ```ts
   * import { LinhasAntesDepoisChart, LINHAS_ANTES_DEPOIS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Antes e depois',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: LinhasAntesDepoisChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof LinhasAntesDepoisChart>;

  const pct = (v: number) => `${formatLocale.format(',.1f')(v)}%`;
  const pctTick = (v: number) => `${formatLocale.format(',~f')(v)}%`;
  const pp = (v: number) => `${v > 0 ? '+' : ''}${formatLocale.format(',.1f')(v)} p.p.`;
  const etapas = LINHAS_ANTES_DEPOIS_STEPS;
  const categorias = antesDepois.map((d) => d.label);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: antesDepois,
    beforeLabel: '2018',
    afterLabel: '2021',
    formatValue: pct,
    formatTick: pctTick,
    formatChange: pp,
    title: 'Dois momentos da mesma medida, categoria a categoria',
    subtitle: 'Valor de cada categoria nos dois momentos (%)',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <LinhasAntesDepoisChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Ordenado pela mudança: quem mais subiu primeiro, quem caiu por último. -->
<Story name="Ordenado pela mudança">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasAntesDepoisChart
        data={antesDepois}
        sort="change"
        formatValue={pct}
        formatTick={pctTick}
        formatChange={pp}
        title="Categorias pela mudança entre os dois momentos"
      />
    </div>
  {/snippet}
</Story>

<!-- `domain` fixa a escala — de 0 a 100 para percentuais que pedem o todo. -->
<Story name="Escala de 0 a 100">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasAntesDepoisChart
        data={antesDepois}
        domain={[0, 100]}
        formatValue={pct}
        formatTick={pctTick}
        formatChange={pp}
        title="Dois momentos, na escala inteira"
      />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <LinhasAntesDepoisChart data={antesDepois} formatValue={pct}
        formatTick={pctTick} title="Antes e depois" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `LINHAS_ANTES_DEPOIS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={categorias} bind:highlight />
      <LinhasAntesDepoisChart
        data={antesDepois}
        formatValue={pct}
        formatTick={pctTick}
        formatChange={pp}
        {step}
        {highlight}
        title="Dois momentos da mesma medida, categoria a categoria"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <LinhasAntesDepoisChart
          data={antesDepois}
          formatValue={pct}
        formatTick={pctTick}
          step={etapa}
          title="Dois momentos da mesma medida, categoria a categoria"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
