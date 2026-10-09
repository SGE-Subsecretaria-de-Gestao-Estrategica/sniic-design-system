<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CristasDensidadeChart from '$lib/components/eixo6/CristasDensidadeChart.svelte';
  import { CRISTAS_DENSIDADE_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { CRISTAS_REFERENCIA, CRISTAS_XMAX, FONTE, cristas } from './_exemplos';

  /**
   * A forma da distribuição de cada grupo, uma sob a outra. Além da
   * referência, a cor se aprofunda: a parte do grupo que a ultrapassa é uma
   * área antes de ser um número.
   *
   * **Função:** distribuição — a forma, não só a média.
   *
   * **Quando usar:** para comparar distribuições de vários grupos ao longo de
   * uma mesma medida contínua, com uma referência (meta, média) que separa quem
   * passa de quem não passa.
   *
   * **Quando não usar:** para uma distribuição em poucas classes, *Matriz de
   * bolhas*; para a concentração de um total entre unidades, *Concentração*.
   *
   * **Dados:** `ridges: CristaDensidade[]` — `label`, `note` opcional,
   * `density` amostrada numa grade uniforme de 0 a `xMax` (o gráfico normaliza a
   * altura) e `value`, o texto na ponta da crista. `reference` posiciona a linha
   * vertical; `formatX` formata o eixo.
   *
   * **Etapas (`CRISTAS_DENSIDADE_STEPS`):** formas → referência → valores.
   * `highlight` recebe o `label` de um grupo.
   *
   * ```ts
   * import { CristasDensidadeChart, CRISTAS_DENSIDADE_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Cristas',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: CristasDensidadeChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof CristasDensidadeChart>;

  const etapas = CRISTAS_DENSIDADE_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    ridges: cristas,
    xMax: CRISTAS_XMAX,
    reference: CRISTAS_REFERENCIA,
    referenceLabel: 'Meta',
    formatX: (v) => `${v}%`,
    title: 'A forma da distribuição de cada grupo',
    subtitle: 'Densidade das unidades ao longo do valor (%)',
    source: FONTE,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <CristasDensidadeChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Numa coluna de celular o gráfico se reorganiza: margens e calhas encolhem, nomes quebram em mais linhas. -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <CristasDensidadeChart ridges={cristas} xMax={CRISTAS_XMAX} reference={CRISTAS_REFERENCIA} formatX={(v) => `${v}%`} title="Cristas" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `CRISTAS_DENSIDADE_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={cristas.map((c) => c.label)} bind:highlight />
      <CristasDensidadeChart
        ridges={cristas}
        xMax={CRISTAS_XMAX}
        reference={CRISTAS_REFERENCIA}
        referenceLabel="Meta"
        formatX={(v) => `${v}%`}
        {step}
        {highlight}
        title="A forma da distribuição de cada grupo"
      />
    </div>
  {/snippet}
</Story>
