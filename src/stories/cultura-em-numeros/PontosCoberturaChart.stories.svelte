<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PontosCoberturaChart from '$lib/components/eixo6/PontosCoberturaChart.svelte';
  import { PONTOS_COBERTURA_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { COBERTURA_REFERENCIA, FONTE, cobertura } from './_exemplos';

  /**
   * Uma categoria por linha, um ponto no seu valor, as linhas agrupadas em
   * blocos — um por recorte do mesmo indicador — e uma linha de referência que
   * atravessa todos. O eixo começa onde os dados começam e diz isso com a marca
   * de eixo cortado.
   *
   * **Função:** comparação entre categorias — quando todas estão perto do teto.
   *
   * **Quando usar:** para um indicador em que todos ficam entre, digamos, 96% e
   * 100% (cobertura, adesão, presença): de zero, as barras seriam idênticas. Os
   * blocos juntam num gráfico só vários recortes do mesmo indicador (rede,
   * etapa, localização), que de outro modo viram quatro gráficos quase iguais.
   *
   * **Quando não usar:** se os valores se espalham de perto de zero até o
   * topo, *Barras em ranking* — o comprimento lê melhor que a posição; para dois
   * valores por categoria, *Intervalos* ou *Antes e depois*.
   *
   * **Dados:** `data: PontosCoberturaDatum[]` — `label`, `value` e, para os
   * blocos, `group` (sem `group`, um bloco só, sem título). Os blocos seguem a
   * ordem de `data`; dentro de cada um, `sort="desc"` (padrão) ordena do maior
   * para o menor e `sort="none"` mantém a ordem dos dados. `reference` desenha a
   * linha tracejada, nomeada em `referenceLabel`; `max={100}` fixa o fim do
   * eixo num percentual. `formatValue`, `formatTick` e `formatDifference`
   * escrevem os valores, o eixo e a distância para a referência.
   *
   * **Etapas (`PONTOS_COBERTURA_STEPS`):** pontos → referência → valores. Sem
   * `reference`, a segunda etapa não muda nada. `highlight` recebe o `label` de
   * uma categoria ou o nome de um bloco inteiro.
   *
   * ```ts
   * import { PontosCoberturaChart, PONTOS_COBERTURA_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Pontos de cobertura',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: PontosCoberturaChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof PontosCoberturaChart>;

  const f1 = formatLocale.format(',.1f');
  const pct1 = (v: number) => `${f1(v)}%`;
  const pct = (v: number) => `${Math.round(v)}%`;
  const pp = (d: number) => `${d > 0 ? '+' : d < 0 ? '−' : ''}${f1(Math.abs(d))} p.p.`;

  const etapas = PONTOS_COBERTURA_STEPS;
  const opcoes = [...new Set(cobertura.map((d) => d.group!)), ...cobertura.map((d) => d.label)];

  const comum = {
    data: cobertura,
    reference: COBERTURA_REFERENCIA,
    referenceLabel: `Média: ${pct1(COBERTURA_REFERENCIA)}`,
    max: 100,
    formatValue: pct1,
    formatTick: pct,
    formatDifference: pp,
    valueLabel: 'Cobertura',
  };
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`): quatro recortes do mesmo indicador, todos perto do teto, contra a média. Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    ...comum,
    title: 'Todas as categorias passam de 96%, em todos os recortes',
    subtitle: 'Cobertura de cada categoria, por recorte (%)',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <PontosCoberturaChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna estreita a calha dos nomes encolhe; os nomes longos quebram e a linha cresce para eles. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <PontosCoberturaChart {...comum} title="Cobertura por recorte" source={FONTE} />
    </div>
  {/snippet}
</Story>

<!-- Sem `group`, um bloco só, sem título; sem `reference`, nenhuma linha. O eixo ainda começa perto dos dados. -->
<Story name="Sem blocos nem referência">
  {#snippet template()}
    <div style="max-width: 680px;">
      <PontosCoberturaChart
        data={cobertura.filter((d) => d.group === 'Recorte C').map(({ label, value }) => ({ label, value }))}
        max={100}
        formatValue={pct1}
        formatTick={pct}
        title="Cobertura de cada categoria"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Quando os dados se espalham até perto de zero, o eixo vai a zero e a marca de eixo cortado some. -->
<Story name="Eixo a partir de zero">
  {#snippet template()}
    <div style="max-width: 680px;">
      <PontosCoberturaChart
        data={[
          { label: 'Categoria 1', value: 30.8 },
          { label: 'Categoria 2', value: 11.8 },
          { label: 'Categoria 3', value: 5.9 },
          { label: 'Categoria 4', value: 2.8 },
          { label: 'Categoria 5', value: 0.6 },
        ]}
        formatValue={pct1}
        formatTick={pct}
        title="Valores espalhados: o eixo parte do zero"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `PONTOS_COBERTURA_STEPS`; o seletor passa o valor de `highlight` — um bloco inteiro ou uma categoria. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step {opcoes} bind:highlight />
      <PontosCoberturaChart {...comum} {step} {highlight} title="Cobertura por recorte" />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <PontosCoberturaChart {...comum} step={etapa} title="Cobertura por recorte" />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
