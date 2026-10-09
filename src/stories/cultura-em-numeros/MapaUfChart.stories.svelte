<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MapaUfChart from '$lib/components/eixo6/MapaUfChart.svelte';
  import { MAPA_CLASSES_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, UFS, valoresPorUf } from './_exemplos';

  /**
   * Cada UF na cor da classe do seu valor, na rampa sequencial do pilar. As
   * grandes levam sigla e valor dentro; as pequenas ficam para o tooltip.
   *
   * **Função:** território — um valor por UF, em classes.
   *
   * **Quando usar:** para um indicador por estado em que a geografia ajuda a
   * leitura (contrastes regionais).
   *
   * **Quando não usar:** para dois valores por UF, *Mapa hexagonal*; para
   * detalhe municipal, *Mapa por município*; para ordenar os estados, *Barras em
   * ranking*.
   *
   * **Dados:** `values: MapaUfValor[]` — `uf` (sigla) e `value`. `breaks` traz
   * os limites inferiores das classes acima da primeira, em ordem crescente;
   * `classLabels` troca as faixas numéricas da legenda por nomes.
   * `categories: MapaUfCategoria[]` liga o modo categórico: `value` passa a ser
   * o índice da categoria, o estado leva só a sigla, e legenda, tooltip e
   * tabela dizem o nome — para "em que situação está cada UF" em vez de
   * "quanto". Sem `color`, as categorias seguem a rampa na ordem dada.
   *
   * **Etapas (`MAPA_CLASSES_STEPS`):** território → classes. `highlight` recebe
   * a sigla de uma UF.
   *
   * ```ts
   * import { MapaUfChart, MAPA_CLASSES_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Mapa por UF',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: MapaUfChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof MapaUfChart>;

  const pct = (v: number) => `${Math.round(v)}%`;
  const valores = valoresPorUf(7, 4, 62).map(({ uf, valor }) => ({ uf, value: valor }));
  const etapas = MAPA_CLASSES_STEPS;
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
    breaks: [10, 20, 30, 50],
    formatValue: pct,
    title: 'Uma classe por estado, da mais clara à mais escura',
    subtitle: 'Valor de cada UF, em cinco classes (%)',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 640px;">
      <MapaUfChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Duas classes nomeadas em vez de faixas numéricas. -->
<Story name="Classes nomeadas">
  {#snippet template()}
    <div style="max-width: 640px;">
      <MapaUfChart
        values={valoresPorUf(11, 0, 1).map(({ uf, valor }) => ({ uf, value: valor }))}
        breaks={[1]}
        classLabels={['Classe A', 'Classe B']}
        formatValue={(v) => (v >= 1 ? 'B' : 'A')}
        title="Duas classes nomeadas"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Modo categórico: cada UF numa situação, não num valor. As categorias são etapas em ordem, então seguem a rampa do claro ao escuro; o estado leva só a sigla. -->
<Story name="Categorias">
  {#snippet template()}
    <div style="max-width: 640px;">
      <MapaUfChart
        values={valoresPorUf(5, 0, 2).map(({ uf, valor }) => ({ uf, value: Math.round(valor) }))}
        categories={[
          { label: 'Nenhuma etapa concluída' },
          { label: 'Primeira etapa concluída' },
          { label: 'Processo completo' },
        ]}
        categoryLabel="Situação"
        title="Em que etapa está cada estado"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <MapaUfChart values={valores} breaks={[10, 20, 30, 50]} formatValue={pct} title="Mapa por UF" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `MAPA_CLASSES_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 640px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={UFS} bind:highlight />
      <MapaUfChart
        values={valores}
        breaks={[10, 20, 30, 50]}
        formatValue={pct}
        {step}
        {highlight}
        title="Uma classe por estado"
      />
    </div>
  {/snippet}
</Story>
