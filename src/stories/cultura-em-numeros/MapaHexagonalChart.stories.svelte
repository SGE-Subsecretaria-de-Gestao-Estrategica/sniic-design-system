<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MapaHexagonalChart from '$lib/components/eixo6/MapaHexagonalChart.svelte';
  import MapaHexagonalLegenda from '$lib/components/eixo6/MapaHexagonalLegenda.svelte';
  import { MAPA_HEXAGONAL_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { REGIOES } from '$lib/components/eixo1/mapaUf';
  import { FONTE, UFS, sorteio } from './_exemplos';

  /**
   * O Brasil esquemático, uma célula por UF, duas barras em cada uma e a
   * referência atravessando todas. O que passa da referência é pintado de
   * vermelho. A legenda (`MapaHexagonalLegenda`) explica cada elemento com setas
   * e ocupa o canto vazio do mapa — ou desce para baixo dele em colunas
   * estreitas. Um dos gráficos de referência da identidade visual.
   *
   * **Função:** território — dois valores por UF e uma referência.
   *
   * **Quando usar:** para comparar duas medidas (dois anos, duas populações) em
   * todas as UFs ao mesmo tempo, com o mesmo peso visual para estados grandes e
   * pequenos.
   *
   * **Quando não usar:** para um valor só, *Mapa por UF*; quando a forma real do
   * território importa, também *Mapa por UF* ou *Mapa por município*.
   *
   * **Dados:** `values: MapaHexagonalValor[]` — `uf` (sigla), `a` e `b`; sem
   * `b`, a UF tem uma barra só, centrada (o DF, onde estado e capital
   * coincidem). `reference` é o valor da linha (uma média nacional); `aLabel`,
   * `bLabel` e `referenceLabel` nomeiam as três coisas.
   *
   * **Legenda:** `legend` = `'auto'` (no canto do mapa quando cabe legível,
   * senão abaixo), `'inline'`, `'below'` ou `'none'` — neste caso o host põe
   * `<MapaHexagonalLegenda standalone>` onde quiser. `legendText` troca o texto;
   * `**negrito**` funciona dentro dele. Nenhuma região tem contorno por padrão;
   * `emphasizedRegions` escolhe as que ganham contorno escuro.
   *
   * **Etapas (`MAPA_HEXAGONAL_STEPS`):** primeiro valor → segundo valor →
   * referência → uma região por vez (Norte, Nordeste, Centro-Oeste, Sudeste,
   * Sul), com contorno e as demais esmaecidas. `highlight` recebe a sigla de uma UF ou o nome de uma região.
   *
   * ```ts
   * import { MapaHexagonalChart, MapaHexagonalLegenda, MAPA_HEXAGONAL_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Mapa hexagonal',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: MapaHexagonalChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof MapaHexagonalChart>;

  const r = sorteio(3);
  const valores = UFS.map((uf) => {
    const a = Math.round(28 + r() * 48);
    const b = Math.round(a * (0.6 + r() * 0.5));
    // No DF os dois valores são o mesmo: uma barra só.
    return uf === 'DF' ? { uf, a } : { uf, a, b };
  });
  const media = Math.round(valores.reduce((s, v) => s + v.a, 0) / valores.length);
  const legendText = {
    totalText: 'Percentual de unidades com a ação (%)',
    excessText: 'Marca quanto o percentual supera a média brasileira',
    referenceText: 'média do conjunto do país',
    aText: 'Percentual no **Estado**',
    bText: 'Percentual na **Capital**',
  };
  const etapas = MAPA_HEXAGONAL_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    values: valores,
    reference: media,
    aLabel: 'Estado',
    bLabel: 'Capital',
    referenceLabel: 'Média',
    legendText,
    title: 'Estado e capital, diante da média',
    subtitle: 'Percentual de unidades com a ação, no estado e na capital',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 980px;">
      <MapaHexagonalChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <MapaHexagonalChart values={valores} reference={media} title="Mapa hexagonal" />
    </div>
  {/snippet}
</Story>

<!-- Em colunas de largura média a legenda não caberia legível no canto do mapa, então desce para baixo dele (`legend="auto"`). -->
<Story name="Legenda abaixo">
  {#snippet template()}
    <div style="max-width: 620px;">
      <MapaHexagonalChart values={valores} reference={media} aLabel="Estado" bLabel="Capital" referenceLabel="Média" {legendText} title="Mapa hexagonal" />
    </div>
  {/snippet}
</Story>

<!-- A legenda sozinha, com `standalone`: para o host que passa `legend="none"` ao mapa e a põe em outro lugar da página. -->
<Story name="Legenda separada">
  {#snippet template()}
    <div style="max-width: 460px;">
      <MapaHexagonalLegenda reference={media} texto={legendText} standalone />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `MAPA_HEXAGONAL_STEPS`; o seletor passa o valor de `highlight` (uma região ou uma UF), que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 980px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={[...Object.keys(REGIOES), ...UFS]} bind:highlight />
      <MapaHexagonalChart
        values={valores}
        reference={media}
        referenceLabel="Média"
        {legendText}
        {step}
        {highlight}
        title="Duas medições por estado, e a média"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <MapaHexagonalChart values={valores} reference={media} referenceLabel="Média" step={etapa} title="Duas medições por estado" />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
