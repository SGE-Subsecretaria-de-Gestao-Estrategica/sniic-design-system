<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BarrasCascataChart from '$lib/components/eixo6/BarrasCascataChart.svelte';
  import { BARRAS_CASCATA_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import { getPillarTheme } from '$lib/core/theme';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, cascata } from './_exemplos';

  /**
   * Dois estoques e as parcelas que levam de um ao outro. Cada degrau é uma
   * `CapsuleBar` vertical: os estoques partem do zero, as variações flutuam
   * sobre o acumulado — para cima quando somam, pendendo quando subtraem.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Cascata' });

  const bi = (v: number) => `R$ ${formatLocale.format(',.1f')(v / 1e9)} bi`;
  const etapas = BARRAS_CASCATA_STEPS;
  const degraus = cascata.map((d) => d.label);
  const { palette } = getPillarTheme(6);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasCascataChart
        data={cascata}
        formatValue={bi}
        title="Dois estoques e as parcelas que levam de um ao outro"
        subtitle="R$ bilhões"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Um degrau pode ter cor própria — aqui, a variação negativa. -->
<Story name="Cor por degrau">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BarrasCascataChart
        data={cascata.map((d) =>
          d.value < 0 ? { ...d, fill: [palette.secondary, palette.secondaryVariant] as const } : d,
        )}
        formatValue={bi}
        title="A variação negativa em outra cor"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <BarrasCascataChart data={cascata} formatValue={bi} title="Cascata" source={FONTE} />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={degraus} bind:highlight />
      <BarrasCascataChart
        data={cascata}
        formatValue={bi}
        {step}
        {highlight}
        title="Dois estoques e as parcelas que levam de um ao outro"
      />
    </div>
  {/snippet}
</Story>

<Story name="Scrollytelling">
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <BarrasCascataChart
          data={cascata}
          formatValue={bi}
          step={etapa}
          title="Dois estoques e as parcelas que levam de um ao outro"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
