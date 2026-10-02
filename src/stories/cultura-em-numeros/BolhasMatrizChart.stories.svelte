<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BolhasMatrizChart from '$lib/components/eixo6/BolhasMatrizChart.svelte';
  import { BOLHAS_MATRIZ_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, matrizColunas, matrizLinhas } from './_exemplos';

  /**
   * Linhas por colunas, uma bolha por cruzamento: a área é o valor, e a cor
   * acompanha o mesmo valor na rampa do pilar.
   *
   * **Função:** distribuição — como cada grupo se reparte por classes.
   *
   * **Quando usar:** para uma tabela cruzada pequena (até uns seis por seis) em
   * que o leitor precisa achar os cruzamentos grandes e comparar linhas — por
   * exemplo, a distribuição de cada grupo por faixas.
   *
   * **Quando não usar:** para só dois recortes, *Bolhas comparadas*; para uma
   * repartição que soma um todo e cabe em barras, *Composição*.
   *
   * **Dados:** `columns: string[]` (da esquerda para a direita) e
   * `rows: BolhasMatrizLinha[]` — `label`, `note` opcional (a base da linha) e
   * `values` na ordem de `columns`.
   *
   * **Etapas (`BOLHAS_MATRIZ_STEPS`):** bolhas → valores. `highlight` recebe o
   * `label` de uma linha.
   *
   * ```ts
   * import { BolhasMatrizChart, BOLHAS_MATRIZ_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Matriz de bolhas',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: BolhasMatrizChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof BolhasMatrizChart>;

  const pct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`;
  const etapas = BOLHAS_MATRIZ_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    columns: matrizColunas,
    rows: matrizLinhas,
    formatValue: pct,
    rowLabel: 'Grupo',
    title: 'Como cada grupo se distribui pelas classes',
    subtitle: 'Participação de cada classe no grupo (%)',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <BolhasMatrizChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <BolhasMatrizChart columns={matrizColunas} rows={matrizLinhas} formatValue={pct} title="Matriz de bolhas" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `BOLHAS_MATRIZ_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={matrizLinhas.map((r) => r.label)} bind:highlight />
      <BolhasMatrizChart
        columns={matrizColunas}
        rows={matrizLinhas}
        formatValue={pct}
        {step}
        {highlight}
        title="Como cada grupo se distribui pelas classes"
      />
    </div>
  {/snippet}
</Story>
