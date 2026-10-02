<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CurvaConcentracaoChart from '$lib/components/eixo6/CurvaConcentracaoChart.svelte';
  import { CURVA_CONCENTRACAO_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import { FONTE, lorenz, parcelaDoTopo } from './_exemplos';

  /**
   * Quanto do total se acumula conforme se percorrem as unidades. A curva é o
   * traço grosso da família; a diagonal tracejada, a igualdade; a área entre
   * as duas, a concentração.
   *
   * **Função:** distribuição — concentração de um total (curva de Lorenz).
   *
   * **Quando usar:** para dizer quão desigual é a repartição de um total entre
   * unidades — recursos entre municípios, público entre equipamentos — e marcar
   * leituras como "os 10% maiores concentram X%".
   *
   * **Quando não usar:** para comparar a concentração de vários grupos (as curvas
   * se embolam; prefira *Cristas* ou um número por grupo em *Barras em ranking*).
   *
   * **Dados:** `points: CurvaConcentracaoPonto[]` — pares `[unidades, total]`,
   * os dois acumulados de 0 a 100, de (0, 0) a (100, 100). `marks` são leituras
   * `{ top, label }`: `top` é a fatia do topo, `label` a frase inteira.
   *
   * **Etapas (`CURVA_CONCENTRACAO_STEPS`):** a igualdade → a curva → os marcos.
   * Não tem `highlight`.
   *
   * ```ts
   * import { CurvaConcentracaoChart, CURVA_CONCENTRACAO_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Concentração',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: CurvaConcentracaoChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof CurvaConcentracaoChart>;

  const pct = (v: number) => `${formatLocale.format(',.1f')(v)}%`;
  const marks = [50, 10, 1].map((top) => ({
    top,
    label: `os ${top}% maiores concentram ${pct(parcelaDoTopo(top))}`,
  }));
  const etapas = CURVA_CONCENTRACAO_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    points: lorenz,
    marks,
    title: 'Quanto do total sai de quão poucos',
    subtitle: 'Total acumulado, da menor unidade à maior',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 560px;">
      <CurvaConcentracaoChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <CurvaConcentracaoChart points={lorenz} {marks} title="Concentração" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `CURVA_CONCENTRACAO_STEPS`, uma etapa por seção do scrollytelling. -->
<Story name="Etapas">
  {#snippet template()}
    <div style="max-width: 560px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step />
      <CurvaConcentracaoChart points={lorenz} {marks} {step} title="Quanto do total sai de quão poucos" />
    </div>
  {/snippet}
</Story>
