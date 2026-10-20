<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MapaHexagonalCategoricoChart from '$lib/components/eixo6/MapaHexagonalCategoricoChart.svelte';
  import { mapaHexagonalCategoricoSteps } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { eixo6Palette, sharedPalette } from '$lib/core/theme/tokens';
  import { FONTE, UFS, categoriasPorUf } from './_exemplos';

  /**
   * O Brasil esquemático, uma célula por UF, cada uma na cor da sua
   * categoria. A malha, os hexágonos e os rótulos são os dos mapas do builder
   * (`core/hexMap`): a sigla no centro, clara ou escura conforme o fundo, e
   * as UFs sem dado no cinza de vazio. A legenda diz quantas UFs há em cada
   * categoria.
   *
   * **Função:** território — em que situação está cada UF.
   *
   * **Quando usar:** para categorias, não valores: estágios de um processo
   * (adesão a um sistema, implantação de um instrumento), tipos de arranjo,
   * presença ou ausência de algo. Todos os estados com o mesmo peso visual.
   *
   * **Quando não usar:** para um valor numérico por UF, *Mapa por UF* (classes)
   * ou o Coropleto do builder; para dois valores por UF, *Mapa hexagonal*;
   * quando a forma real do território importa, *Mapa por UF*.
   *
   * **Dados:** `values: MapaHexagonalCategoricoValor[]` — `uf` (sigla) e
   * `category` (o nome). `categories: MapaHexagonalCategoria[]` dá a ordem,
   * e opcionalmente `color` e `stepLabel`; categorias fora da lista vêm depois,
   * na ordem em que aparecem. Com `ordered` (padrão) as cores seguem a rampa do
   * pilar, da mais clara para a mais escura; `ordered={false}` usa os matizes
   * do pilar, para categorias sem ordem. `regionGap` (0 a 1) afasta as regiões.
   *
   * **Etapas (`mapaHexagonalCategoricoSteps(categories)`):** uma por categoria,
   * na ordem — cada etapa pinta as UFs da sua categoria e mantém as anteriores.
   * `highlight` recebe a sigla de uma UF, o nome de uma categoria ou de uma
   * região, e esmaece o resto.
   *
   * ```ts
   * import { MapaHexagonalCategoricoChart, mapaHexagonalCategoricoSteps } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Mapa hexagonal categórico',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: MapaHexagonalCategoricoChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof MapaHexagonalCategoricoChart>;

  const estagios = [
    { label: 'Estágio inicial' },
    { label: 'Estágio intermediário' },
    { label: 'Estágio avançado' },
  ];
  const valores = categoriasPorUf(
    5,
    estagios.map((e) => e.label),
    [3, 1, 4],
  );

  const tipos = ['Tipo A', 'Tipo B', 'Tipo C', 'Tipo D'];
  const valoresTipos = categoriasPorUf(11, tipos);

  // Sem dado para três UFs: os hexágonos ficam no cinza de vazio.
  const valoresIncompletos = valores.filter((v) => !['AP', 'RR', 'SE'].includes(v.uf));

  const etapas = mapaHexagonalCategoricoSteps(estagios);
  const opcoes = [...estagios.map((e) => e.label), 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', ...UFS];
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`), com categorias ordenadas: a rampa do pilar vai da mais clara à mais escura. Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    values: valores,
    categories: estagios,
    categoryLabel: 'Estágio',
    title: 'Em que estágio está cada UF',
    subtitle: 'Estágio de implementação, por unidade da federação',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 560px;">
      <MapaHexagonalCategoricoChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Categorias sem ordem (`ordered={false}`): cada uma ganha um matiz do pilar, em vez de um passo da rampa. -->
<Story name="Categorias sem ordem">
  {#snippet template()}
    <div style="max-width: 560px;">
      <MapaHexagonalCategoricoChart
        values={valoresTipos}
        categories={tipos.map((label) => ({ label }))}
        ordered={false}
        categoryLabel="Tipo"
        title="Que tipo de arranjo cada UF adota"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- `color` em cada categoria troca a cor padrão — aqui, a última em destaque na cor de acento, as demais em tons neutros. -->
<Story name="Cores próprias">
  {#snippet template()}
    <div style="max-width: 560px;">
      <MapaHexagonalCategoricoChart
        values={valores}
        categories={[
          { label: 'Estágio inicial', color: sharedPalette.base[300] },
          { label: 'Estágio intermediário', color: sharedPalette.neutral[100] },
          { label: 'Estágio avançado', color: eixo6Palette.accent },
        ]}
        categoryLabel="Estágio"
        title="Quem já chegou ao estágio avançado"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- UFs sem dado ficam no cinza de vazio, com a sigla, e o tooltip diz "Sem dado". A legenda conta só as UFs com categoria. -->
<Story name="UFs sem dado">
  {#snippet template()}
    <div style="max-width: 560px;">
      <MapaHexagonalCategoricoChart
        values={valoresIncompletos}
        categories={estagios}
        categoryLabel="Estágio"
        title="Estágio por UF, com lacunas"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- `regionGap` afasta as cinco regiões, como a opção "Afastamento entre as regiões" dos mapas do builder. -->
<Story name="Regiões afastadas">
  {#snippet template()}
    <div style="max-width: 560px;">
      <MapaHexagonalCategoricoChart
        values={valores}
        categories={estagios}
        categoryLabel="Estágio"
        regionGap={0.6}
        title="Estágio por UF, regiões separadas"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular os hexágonos encolhem e a sigla passa ao corpo menor; abaixo de 12 px de raio ela some e fica para o tooltip e a tabela. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 320px;">
      <MapaHexagonalCategoricoChart values={valores} categories={estagios} title="Mapa hexagonal categórico" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `mapaHexagonalCategoricoSteps(categories)`, uma categoria por etapa; o seletor passa o valor de `highlight` (uma categoria, uma região ou uma UF), que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 560px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step {opcoes} bind:highlight />
      <MapaHexagonalCategoricoChart
        values={valores}
        categories={estagios}
        categoryLabel="Estágio"
        {step}
        {highlight}
        title="Do estágio inicial ao avançado"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <MapaHexagonalCategoricoChart
          values={valores}
          categories={estagios}
          categoryLabel="Estágio"
          step={etapa}
          title="Do estágio inicial ao avançado"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
