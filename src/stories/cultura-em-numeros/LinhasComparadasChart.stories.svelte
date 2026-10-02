<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasComparadasChart from '$lib/components/eixo6/LinhasComparadasChart.svelte';
  import { LINHAS_COMPARADAS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, GRUPO_DESTAQUE, QUEBRA, gruposPorAno } from './_exemplos';

  /**
   * Várias linhas na mesma escala, uma destacada na cor de ênfase e as demais
   * nomeadas na ponta — a cor só separa o destaque do resto. Um dos gráficos de
   * referência da identidade visual.
   *
   * **Função:** evolução no tempo — um grupo diante dos demais.
   *
   * **Quando usar:** quando há um sujeito (o setor, a região do texto) e um
   * conjunto de comparação, todos na mesma unidade e escala.
   *
   * **Quando não usar:** se as séries são pares, sem sujeito, use
   * `colorBy="series"` (*Linhas por série*); com muitas séries que se cruzam,
   * *Linhas em painéis*.
   *
   * **Dados:** `data: LinhasComparadasDatum[]` — `group`, `year`, `value`.
   * `featured` escolhe o destaque (padrão: o primeiro grupo de `data`);
   * `breakYear` marca uma quebra metodológica; `othersLabel` nomeia os demais
   * na legenda.
   *
   * **Etapas (`LINHAS_COMPARADAS_STEPS`):** destaque → demais → quebra → onde
   * cada um chegou. `highlight` recebe um `group`.
   *
   * ```ts
   * import { LinhasComparadasChart, LINHAS_COMPARADAS_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Linhas comparadas',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: LinhasComparadasChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  type Args = ComponentProps<typeof LinhasComparadasChart>;

  const textos = {
    featured: GRUPO_DESTAQUE,
    valueLabel: 'Valor',
    othersLabel: 'Demais grupos (nomeados no gráfico)',
    breakYear: QUEBRA,
  };
  const etapas = LINHAS_COMPARADAS_STEPS;
  const grupos = [...new Set(gruposPorAno.map((d) => d.group))];
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<!-- O gráfico completo (`step = -1`). Os controles mexem nas props desta story. -->
<Story
  name="Padrão"
  args={{
    data: gruposPorAno,
    ...textos,
    title: 'Um grupo destacado diante dos demais',
    subtitle: 'Valor anual por grupo, 2016–2025',
    source: `${FONTE} A série tem quebra metodológica em ${QUEBRA}.`,
  }}
  parameters={{ controls: { disable: false } }}
>
  {#snippet template(args)}
    <div style="max-width: 680px;">
      <LinhasComparadasChart {...args as Args} />
    </div>
  {/snippet}
</Story>

<!-- Sem `featured`, o primeiro grupo de `data` lidera; sem `breakYear`, a série é contínua. -->
<Story name="Série contínua, só os padrões">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasComparadasChart data={gruposPorAno} title="Um grupo destacado diante dos demais" />
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `LINHAS_COMPARADAS_STEPS`; o seletor passa o valor de `highlight`, que esmaece o resto. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={grupos} bind:highlight />
      <LinhasComparadasChart
        data={gruposPorAno}
        {...textos}
        {step}
        {highlight}
        title="Um grupo destacado diante dos demais"
      />
    </div>
  {/snippet}
</Story>

<!-- O padrão de consumo: gráfico fixo, uma seção por etapa, o scroll decide o `step`. Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Scrollytelling" tags={['!autodocs']}>
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <LinhasComparadasChart
          data={gruposPorAno}
          {...textos}
          step={etapa}
          title="Um grupo destacado diante dos demais"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
