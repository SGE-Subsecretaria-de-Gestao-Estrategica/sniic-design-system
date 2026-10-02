<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BarrasCascataChart from '$lib/components/eixo6/BarrasCascataChart.svelte';
  import { BARRAS_CASCATA_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import { getPillarTheme } from '$lib/core/theme';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, cascata } from './_exemplos';

  /**
   * Dois estoques e as parcelas que levam de um ao outro. Cada degrau é uma
   * `CapsuleBar` vertical: os estoques partem do zero, as variações flutuam
   * sobre o acumulado — para cima quando somam, pendendo quando subtraem.
   *
   * **Função:** decomposição de uma variação.
   *
   * **Quando usar:** para explicar como se vai de um total a outro — um
   * orçamento de um ano para o seguinte, um estoque antes e depois de
   * entradas e saídas. A soma das variações precisa fechar a diferença entre
   * os dois estoques.
   *
   * **Quando não usar:** se as parcelas não se somam (são medidas
   * independentes), prefira *Barras em ranking*; se o que importa é a
   * composição de cada total, *Colunas empilhadas*.
   *
   * **Dados:** `data: BarrasCascataDatum[]`, na ordem dos degraus. Cada item
   * tem `label`, `value` e `type` — `base` e `total` partem do zero, `delta`
   * flutua sobre o acumulado (negativo, pende para baixo). `detail` escreve
   * linhas miúdas sob o nome, para um degrau agregado; `fill` troca a cor de
   * um degrau.
   *
   * **Etapas (`BARRAS_CASCATA_STEPS`):** estoque de partida → variações →
   * estoque de chegada. `highlight` recebe o `label` de um degrau.
   *
   * ```ts
   * import { BarrasCascataChart, BARRAS_CASCATA_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Cascata',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: BarrasCascataChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof BarrasCascataChart>;

  const bi = (v: number) => `R$ ${formatLocale.format(',.1f')(v / 1e9)} bi`;
  const etapas = BARRAS_CASCATA_STEPS;
  const degraus = cascata.map((d) => d.label);
  const { palette } = getPillarTheme(6);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: cascata,
    formatValue: bi,
    title: 'Dois estoques e as parcelas que levam de um ao outro',
    subtitle: 'R$ bilhões',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <BarrasCascataChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Um degrau pode ter cor própria — aqui, a variação negativa, via `fill`. -->
<Story name="Cor por degrau">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasCascataChart
        data={cascata.map((d) =>
          d.value < 0 ? { ...d, fill: [palette.secondary, palette.secondaryVariant] as const } : d,
        )}
        formatValue={bi}
        title="A variação negativa em outra cor"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna estreita os degraus afinam e os nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <BarrasCascataChart data={cascata} formatValue={bi} title="Cascata" source={FONTE} />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `BARRAS_CASCATA_STEPS`; o seletor passa um degrau como `highlight`. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={degraus} bind:highlight />
      <BarrasCascataChart
        data={cascata}
        formatValue={bi}
        {step}
        {highlight}
        title="Dois estoques e as parcelas que levam de um ao outro"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <BarrasCascataChart
          data={cascata}
          formatValue={bi}
          step={etapa}
          title="Dois estoques e as parcelas que levam de um ao outro"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
