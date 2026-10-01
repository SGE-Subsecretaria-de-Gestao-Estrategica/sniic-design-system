<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasComparadasChart from '$lib/components/eixo6/LinhasComparadasChart.svelte';
  import { LINHAS_COMPARADAS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, GRUPO_DESTAQUE, QUEBRA, gruposPorAno } from './_exemplos';

  /**
   * Várias linhas na mesma escala, uma destacada na cor de ênfase e as demais
   * nomeadas na ponta — a cor só separa o destaque do resto. Exportado como
   * `LinhasComparadasChart`.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Linhas comparadas' });

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

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasComparadasChart
        data={gruposPorAno}
        {...textos}
        title="Um grupo destacado diante dos demais"
        subtitle="Valor anual por grupo, 2016–2025"
        source="{FONTE} A série tem quebra metodológica em {QUEBRA}."
      />
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

<Story name="Scrollytelling">
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
