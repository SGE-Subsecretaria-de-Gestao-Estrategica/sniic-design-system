<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MapaMunicipiosChart from '$lib/components/eixo6/MapaMunicipiosChart.svelte';
  import { MAPA_CLASSES_STEPS, MAPA_DESTAQUES_STEPS } from '$lib/components/eixo6/steps';
  import type { MalhaMunicipiosProjetada } from '$lib/components/eixo1/malhaMunicipal';
  import Etapas from './_Etapas.svelte';
  import ScrollyLado, { type Passagem } from './_ScrollyLado.svelte';
  import { FONTE, MUNICIPIOS_DESTAQUE, valoresMunicipios } from './_exemplos';
  // A malha (1,1MB) não vai no pacote — quem consome traz a sua. Aqui ela fica
  // só para as stories, buscada em runtime em vez de entrar no bundle.
  const malhaUrl = new URL('./data/malha-municipios-projetada.json', import.meta.url).href;

  /**
   * O território em cinza e só os dez municípios com os maiores valores
   * destacados: a forma de cada um preenchida, um marcador numerado por cima
   * (uma capital tem poucos pixels na escala do país) e o ranking ao lado — ou
   * embaixo, em colunas estreitas. Passar o mouse num marcador ou numa linha do
   * ranking mostra o valor.
   *
   * **Função:** território — onde estão os maiores, município a município.
   *
   * **Quando usar:** quando a história é a localização dos líderes de uma
   * medida municipal (concentração nas capitais, polos no interior). Com
   * `zoomTo`, para levar o leitor de um município a outro num scrollytelling.
   *
   * **Quando não usar:** para valores por UF, *Mapa por UF*; para comparar os
   * valores em si, *Barras em ranking*.
   *
   * **Mosaico:** com `breaks` (e opcionalmente `classLabels`), todos os
   * municípios ganham a cor da sua classe na rampa sequencial do tema, com
   * legenda — para quando a história é o padrão do território inteiro. Passar
   * o mouse numa UF mostra como os municípios dela se dividem entre as classes;
   * `highlight` recebe a sigla da UF. `top` cai para 0, então os marcadores só
   * aparecem se pedidos. Etapas: `MAPA_CLASSES_STEPS`.
   *
   * **Dados:** `values: Record<string, number>` por código IBGE de 7 dígitos,
   * `names` (código → nome) para o ranking e `top` (padrão 10). `valueLabel`
   * nomeia a medida no tooltip. A malha (`mesh`, `MalhaMunicipiosProjetada`,
   * ~1,1 MB) **não vai no pacote**: quem consome traz a sua. Esta story a busca
   * de `data/` em runtime.
   *
   * **Zoom:** `zoomTo` recebe códigos IBGE — um enquadra o município e os
   * vizinhos, vários enquadram todos, `null` volta ao país. A câmera voa entre
   * enquadramentos (afasta, viaja, aproxima); com movimento reduzido, corta.
   * `ranking={false}` tira a lista, para quando o texto ao lado já a conta.
   *
   * **Etapas (`MAPA_DESTAQUES_STEPS`):** território → destaques → ranking. O
   * zoom não é etapa: segue `zoomTo`. `highlight` recebe um código IBGE.
   *
   * ```ts
   * import { MapaMunicipiosChart, MAPA_DESTAQUES_STEPS } from 'sniic-design-system';
   * ```
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Gráficos/Mapa por município',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    component: MapaMunicipiosChart,
    tags: ['autodocs'],
    parameters: { controls: { disable: true } },
  });

  const etapas = MAPA_DESTAQUES_STEPS;
  const medida = 'Equipamentos culturais';
  const int = new Intl.NumberFormat('pt-BR');
  const formatValue = (v: number) => int.format(v);
  const codigo = (nome: string) => MUNICIPIOS_DESTAQUE.find((m) => m.nome === nome)!.c;

  // O texto do storytelling e, para cada passagem, o que o mapa enquadra.
  const passagens: (Passagem & { zoomTo: string[] | null })[] = [
    {
      id: 'brasil',
      titulo: 'Dez municípios na frente',
      texto: 'Dos 5.570 municípios do país, estes dez reúnem o maior número de equipamentos culturais. Todos são capitais — ou a capital federal.',
      zoomTo: null,
    },
    ...MUNICIPIOS_DESTAQUE.map((m, i) => ({
      id: m.c,
      titulo: `${i + 1}º ${m.nome} (${m.uf})`,
      texto:
        i === 0
          ? `${int.format(m.valor)} equipamentos: quase o dobro do terceiro colocado, e a maior concentração do país.`
          : `${int.format(m.valor)} equipamentos, ${int.format(MUNICIPIOS_DESTAQUE[0].valor - m.valor)} a menos que São Paulo.`,
      zoomTo: [m.c],
    })),
    {
      id: 'centro-oeste',
      titulo: 'Vizinhos no Planalto Central',
      texto: 'Brasília e Goiânia, a pouco mais de 200 km uma da outra, entram as duas no ranking.',
      zoomTo: [codigo('Brasília'), codigo('Goiânia')],
    },
    {
      id: 'volta',
      titulo: 'De volta ao país',
      texto: 'Do Norte só Manaus aparece; o Sul tem uma capital, Curitiba. O Sudeste e o Nordeste ficam com seis dos dez.',
      zoomTo: null,
    },
  ];
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  let mesh = $state<MalhaMunicipiosProjetada | null>(null);
  let dados = $state<ReturnType<typeof valoresMunicipios>>({ values: {}, names: {} });
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
  let stepMosaico = $state(MAPA_CLASSES_STEPS.length - 1);
  let ufMosaico = $state<string | null>(null);

  onMount(async () => {
    const m: MalhaMunicipiosProjetada = await (await fetch(malhaUrl)).json();
    dados = valoresMunicipios(m.municipios.map((mun) => mun.c));
    mesh = m;
  });
</script>

<!-- O gráfico completo (`step = -1`): os dez maiores marcados e o ranking ao lado. -->
<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 900px;">
      {#if mesh}
        <MapaMunicipiosChart
          values={dados.values}
          names={dados.names}
          {mesh}
          valueLabel={medida}
          {formatValue}
          title="Dez capitais concentram os equipamentos culturais"
          subtitle="Municípios com mais equipamentos culturais"
          source={FONTE}
        />
      {:else}
        <p>Carregando a malha municipal…</p>
      {/if}
    </div>
  {/snippet}
</Story>

<!-- Numa coluna estreita o ranking desce para baixo do mapa, em duas colunas (ou uma, abaixo de 380px). -->
<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 420px;">
      {#if mesh}
        <MapaMunicipiosChart values={dados.values} names={dados.names} {mesh} valueLabel={medida} {formatValue} title="Mapa por município" />
      {:else}
        <p>Carregando a malha municipal…</p>
      {/if}
    </div>
  {/snippet}
</Story>

<!-- Mosaico: com `breaks`, cada município na cor da sua classe; o mouse numa UF mostra a divisão dos municípios dela. -->
<Story name="Mosaico por classes">
  {#snippet template()}
    <div style="max-width: 900px;">
      {#if mesh}
        <MapaMunicipiosChart
          values={dados.values}
          {mesh}
          breaks={[5, 20, 60, 120]}
          valueLabel={medida}
          {formatValue}
          title="Poucos municípios têm muitos equipamentos culturais"
          subtitle="Municípios por número de equipamentos culturais"
          source={FONTE}
        />
      {:else}
        <p>Carregando a malha municipal…</p>
      {/if}
    </div>
  {/snippet}
</Story>

<!-- O mosaico etapa a etapa (`MAPA_CLASSES_STEPS`); o seletor passa a sigla de uma UF para `highlight`. -->
<Story name="Mosaico em etapas">
  {#snippet template()}
    <div style="max-width: 900px; display: grid; gap: 1rem;">
      <Etapas etapas={MAPA_CLASSES_STEPS} bind:step={stepMosaico} opcoes={['SP', 'MG', 'BA', 'AM']} bind:highlight={ufMosaico} />
      {#if mesh}
        <MapaMunicipiosChart values={dados.values} {mesh} breaks={[5, 20, 60, 120]} {formatValue} step={stepMosaico} highlight={ufMosaico} title="O mosaico, etapa a etapa" />
      {/if}
    </div>
  {/snippet}
</Story>

<!-- O slider percorre `MAPA_DESTAQUES_STEPS`; o seletor passa um código IBGE para `highlight`, que esmaece os demais. -->
<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 900px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={MUNICIPIOS_DESTAQUE.map((m) => m.c)} bind:highlight />
      {#if mesh}
        <MapaMunicipiosChart values={dados.values} names={dados.names} {mesh} valueLabel={medida} {formatValue} {step} {highlight} title="Os dez maiores, etapa a etapa" />
      {/if}
    </div>
  {/snippet}
</Story>

<!-- Storytelling: o texto corre à esquerda e o mapa, preso à direita, voa até o município de cada passagem (`zoomTo`). Fica fora da página de docs, porque precisa da altura da janela. -->
<Story name="Storytelling com zoom" tags={['!autodocs']}>
  {#snippet template()}
    {#if mesh}
      <ScrollyLado {passagens}>
        {#snippet grafico(i: number)}
          <MapaMunicipiosChart
            values={dados.values}
            names={dados.names}
            mesh={mesh!}
            valueLabel={medida}
            {formatValue}
            ranking={false}
            zoomTo={passagens[i]?.zoomTo ?? null}
          />
        {/snippet}
      </ScrollyLado>
    {:else}
      <p>Carregando a malha municipal…</p>
    {/if}
  {/snippet}
</Story>
