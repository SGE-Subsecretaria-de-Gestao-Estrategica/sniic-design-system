<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasAntesDepoisChart from '$lib/components/eixo6/LinhasAntesDepoisChart.svelte';
  import { LINHAS_ANTES_DEPOIS_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, antesDepois } from './_exemplos';

  /**
   * A mesma medida em dois momentos, uma categoria por linha. Cada par é um
   * `Dumbbell` — o traço grosso das linhas, com o marcador no antes e o ponto
   * de destaque no depois.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Antes e depois' });

  const pct = (v: number) => `${formatLocale.format(',.1f')(v)}%`;
  const pctTick = (v: number) => `${formatLocale.format(',~f')(v)}%`;
  const pp = (v: number) => `${v > 0 ? '+' : ''}${formatLocale.format(',.1f')(v)} p.p.`;
  const etapas = LINHAS_ANTES_DEPOIS_STEPS;
  const categorias = antesDepois.map((d) => d.label);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasAntesDepoisChart
        data={antesDepois}
        beforeLabel="2018"
        afterLabel="2021"
        formatValue={pct}
        formatTick={pctTick}
        formatChange={pp}
        title="Dois momentos da mesma medida, categoria a categoria"
        subtitle="Valor de cada categoria nos dois momentos (%)"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Ordenado pela mudança: quem mais subiu primeiro, quem caiu por último. -->
<Story name="Ordenado pela mudança">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasAntesDepoisChart
        data={antesDepois}
        sort="change"
        formatValue={pct}
        formatTick={pctTick}
        formatChange={pp}
        title="Categorias pela mudança entre os dois momentos"
      />
    </div>
  {/snippet}
</Story>

<!-- `domain` fixa a escala — de 0 a 100 para percentuais que pedem o todo. -->
<Story name="Escala de 0 a 100">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasAntesDepoisChart
        data={antesDepois}
        domain={[0, 100]}
        formatValue={pct}
        formatTick={pctTick}
        formatChange={pp}
        title="Dois momentos, na escala inteira"
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <LinhasAntesDepoisChart data={antesDepois} formatValue={pct}
        formatTick={pctTick} title="Antes e depois" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={categorias} bind:highlight />
      <LinhasAntesDepoisChart
        data={antesDepois}
        formatValue={pct}
        formatTick={pctTick}
        formatChange={pp}
        {step}
        {highlight}
        title="Dois momentos da mesma medida, categoria a categoria"
      />
    </div>
  {/snippet}
</Story>

<Story name="Scrollytelling">
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <LinhasAntesDepoisChart
          data={antesDepois}
          formatValue={pct}
        formatTick={pctTick}
          step={etapa}
          title="Dois momentos da mesma medida, categoria a categoria"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
