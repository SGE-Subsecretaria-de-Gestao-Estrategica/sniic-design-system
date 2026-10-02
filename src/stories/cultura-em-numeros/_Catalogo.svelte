<script lang="ts">
  /**
   * Os gráficos de Cultura em Números agrupados pela pergunta que respondem.
   * Cada cartão desenha o gráfico com os dados ilustrativos da story dele e
   * leva à página de docs, onde estão props, dados e etapas.
   */
  import type { Component } from 'svelte';
  import type { Attachment } from 'svelte/attachments';
  import * as G from '$lib/components/eixo6';
  import type { MalhaMunicipiosProjetada } from '$lib/components/eixo1/malhaMunicipal';
  import { sharedPalette } from '$lib/core/theme/tokens';
  import { formatLocale } from '$lib/core/format';
  import * as ex from './_exemplos';

  type Cartao = {
    /** Fim do título da story, sob `Cultura em Números/Gráficos/`. */
    nome: string;
    componente: string;
    /** A pergunta que o gráfico responde. */
    pergunta: string;
    grafico: Component<any>;
    props: Record<string, unknown>;
    /** Pesado demais para desenhar junto com os outros: espera um clique. */
    sobDemanda?: boolean;
  };

  const f1 = formatLocale.format(',.1f');
  const pct = (v: number) => `${Math.round(v)}%`;
  const pct1 = (v: number) => `${f1(v)}%`;

  const r = ex.sorteio(3);
  const hexagonos = ex.UFS.map((uf) => {
    const a = Math.round(5 + r() * 30);
    return { uf, a, b: Math.min(95, Math.round(a + 5 + r() * 35)) };
  });

  // A malha municipal (1,1 MB, 5.570 caminhos) trava a página se desenhada
  // junto com os outros 20 gráficos; só é buscada quando pedida.
  let malha = $state<MalhaMunicipiosProjetada | null>(null);
  let municipios = $state<{ values: Record<string, number>; names: Record<string, string> }>({ values: {}, names: {} });
  let carregando = $state(false);
  const malhaUrl = new URL('./data/malha-municipios-projetada.json', import.meta.url).href;

  async function carregarMalha() {
    carregando = true;
    const m: MalhaMunicipiosProjetada = await (await fetch(malhaUrl)).json();
    municipios = ex.valoresMunicipios(m.municipios.map((mun) => mun.c));
    malha = m;
  }

  const funcoes: { titulo: string; descricao: string; cartoes: Cartao[] }[] = [
    {
      titulo: 'Comparar categorias',
      descricao: 'Quem é maior, quanto, e como isso mudou entre dois momentos.',
      cartoes: [
        { nome: 'Barras em ranking', componente: 'BarrasRankingChart', pergunta: 'Qual categoria é maior numa medida?', grafico: G.BarrasRankingChart, props: { data: ex.ranking } },
        { nome: 'Barras divergentes', componente: 'BarrasDivergentesChart', pergunta: 'Como cada categoria se divide em dois lados opostos?', grafico: G.BarrasDivergentesChart, props: { data: ex.divergentes, sideLabels: { left: 'Parcela à esquerda', right: 'Parcela à direita' } } },
        { nome: 'Antes e depois', componente: 'LinhasAntesDepoisChart', pergunta: 'Quem subiu e quem caiu entre dois momentos?', grafico: G.LinhasAntesDepoisChart, props: { data: ex.antesDepois, beforeLabel: '2018', afterLabel: '2021', formatValue: pct1 } },
        { nome: 'Tabela com barras', componente: 'TabelaBarrasChart', pergunta: 'Como cada categoria se sai em várias medidas de unidades diferentes?', grafico: G.TabelaBarrasChart, props: { columns: ex.tabelaColunas.map((label) => ({ label })), rows: ex.tabelaLinhas, total: ex.tabelaTotal } },
      ],
    },
    {
      titulo: 'Evolução no tempo',
      descricao: 'Séries anuais — uma, várias, ou a distância entre duas.',
      cartoes: [
        { nome: 'Linha com participação', componente: 'LinhaParticipacaoChart', pergunta: 'Quanto uma série vale e quanto pesa no total?', grafico: G.LinhaParticipacaoChart, props: { data: ex.serieComParticipacao, seriesLabel: ex.GRUPO_DESTAQUE, breakYear: ex.QUEBRA } },
        { nome: 'Linhas comparadas', componente: 'LinhasComparadasChart', pergunta: 'Como um grupo evoluiu diante dos demais?', grafico: G.LinhasComparadasChart, props: { data: ex.gruposPorAno, featured: ex.GRUPO_DESTAQUE, breakYear: ex.QUEBRA } },
        { nome: 'Linhas por série', componente: 'LinhasComparadasChart', pergunta: 'Como evoluíram poucas séries pares, sem destaque?', grafico: G.LinhasComparadasChart, props: { data: ex.seriesPorAno, colorBy: 'series', formatValue: pct, valueLabels: 'all' } },
        { nome: 'Linhas com diferença', componente: 'LinhasDiferencaChart', pergunta: 'A distância entre duas taxas abriu ou fechou?', grafico: G.LinhasDiferencaChart, props: { data: ex.taxasPorAno, featured: ex.GRUPO_DESTAQUE, baseline: ex.REFERENCIA } },
        { nome: 'Linhas em painéis', componente: 'LinhasPaineisChart', pergunta: 'Como cada um de muitos grupos se compara à referência?', grafico: G.LinhasPaineisChart, props: { years: ex.paineisAnos, panels: ex.paineis, reference: ex.paineisReferencia, referenceLabel: 'Referência', formatValue: pct } },
      ],
    },
    {
      titulo: 'Composição',
      descricao: 'As partes de um todo — num momento, ao longo do tempo, ou o caminho de um total a outro.',
      cartoes: [
        { nome: 'Colunas empilhadas', componente: 'ColunasEmpilhadasChart', pergunta: 'Quanto soma cada coluna, e de quê?', grafico: G.ColunasEmpilhadasChart, props: { data: ex.colunasCategoria, keys: ['a', 'b', 'c'], labels: { a: 'Série A', b: 'Série B', c: 'Série C' }, formatValue: f1 } },
        { nome: 'Composição', componente: 'ColunasEmpilhadasChart', pergunta: 'Quanto cada parte pesa no todo, momento a momento?', grafico: G.ColunasEmpilhadasChart, props: { data: ex.composicaoPorAno, keys: ['a', 'b', 'c'], labels: { a: 'Categoria A', b: 'Categoria B', c: 'Categoria C' }, normalize: true } },
        { nome: 'Colunas com fitas', componente: 'ColunasEmpilhadasChart', pergunta: 'Quem lidera, e quando a liderança troca?', grafico: G.ColunasEmpilhadasChart, props: { data: ex.fontesPorAno, keys: ['a', 'b', 'c', 'd'], labels: { a: 'Fonte A', b: 'Fonte B', c: 'Fonte C', d: 'Fonte D' }, rank: true, ribbons: true, formatValue: (v: number) => `${f1(v)} bi` } },
        { nome: 'Faixas de participação', componente: 'FaixasParticipacaoChart', pergunta: 'Como a participação muda ao longo de muitos anos?', grafico: G.FaixasParticipacaoChart, props: { data: ex.participacaoPorAno, keys: ['a', 'b', 'c', 'd', 'e'], labels: { a: 'Categoria A', b: 'Categoria B', c: 'Categoria C', d: 'Categoria D', e: 'Categoria E' } } },
        { nome: 'Bolhas comparadas', componente: 'BolhasComparadasChart', pergunta: 'A repartição do grupo difere da referência?', grafico: G.BolhasComparadasChart, props: { data: ex.composicaoEmDoisEscopos, scopeLabels: ex.ESCOPOS, excluded: ['Sem informação'] } },
        { nome: 'Cascata', componente: 'BarrasCascataChart', pergunta: 'Que parcelas levam de um total a outro?', grafico: G.BarrasCascataChart, props: { data: ex.cascata, formatValue: (v: number) => `R$ ${f1(v / 1e9)} bi` } },
      ],
    },
    {
      titulo: 'Distribuição e concentração',
      descricao: 'Como os valores se espalham entre unidades e grupos.',
      cartoes: [
        { nome: 'Matriz de bolhas', componente: 'BolhasMatrizChart', pergunta: 'Como cada grupo se distribui pelas classes?', grafico: G.BolhasMatrizChart, props: { columns: ex.matrizColunas, rows: ex.matrizLinhas, formatValue: pct1 } },
        { nome: 'Cristas', componente: 'CristasDensidadeChart', pergunta: 'Qual a forma da distribuição de cada grupo, e quem passa da meta?', grafico: G.CristasDensidadeChart, props: { ridges: ex.cristas, xMax: ex.CRISTAS_XMAX, reference: ex.CRISTAS_REFERENCIA, referenceLabel: 'Meta', formatX: (v: number) => `${v}%` } },
        { nome: 'Concentração', componente: 'CurvaConcentracaoChart', pergunta: 'Quanto do total está nas mãos de poucos?', grafico: G.CurvaConcentracaoChart, props: { points: ex.lorenz, marks: [10].map((top) => ({ top, label: `os ${top}% maiores concentram ${pct1(ex.parcelaDoTopo(top))}` })) } },
      ],
    },
    {
      titulo: 'Território',
      descricao: 'Valores por UF ou por município, sobre o mapa.',
      cartoes: [
        { nome: 'Mapa por UF', componente: 'MapaUfChart', pergunta: 'Como um indicador varia entre os estados?', grafico: G.MapaUfChart, props: { values: ex.valoresPorUf(7, 4, 62).map(({ uf, valor }) => ({ uf, value: valor })), breaks: [10, 20, 30, 50], formatValue: pct } },
        { nome: 'Mapa hexagonal', componente: 'MapaHexagonalChart', pergunta: 'Dois valores por estado: quem supera a referência?', grafico: G.MapaHexagonalChart, props: { values: hexagonos, reference: Math.round(hexagonos.reduce((s, v) => s + v.b, 0) / hexagonos.length), referenceLabel: 'Média', legend: 'none' } },
        { nome: 'Mapa por município', componente: 'MapaMunicipiosChart', pergunta: 'Onde estão os municípios com os maiores valores?', grafico: G.MapaMunicipiosChart, props: {}, sobDemanda: true },
      ],
    },
  ];

  // Vinte gráficos de uma vez levam segundos: cada cartão só desenha o seu
  // quando chega perto da tela.
  let vistos = $state<Record<string, boolean>>({});

  function aoAparecer(nome: string): Attachment<HTMLElement> {
    return (no) => {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            vistos[nome] = true;
            io.disconnect();
          }
        },
        { rootMargin: '400px 0px' },
      );
      io.observe(no);
      return () => io.disconnect();
    };
  }

  /** O id de docs que o Storybook gera a partir do título. */
  const docsId = (nome: string) =>
    `Cultura em Números/Gráficos/${nome}`
      .toLowerCase()
      .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '--docs';
</script>

<div
  class="catalogo"
  style:--fundo={sharedPalette.base[100]}
  style:--linha={sharedPalette.base[300]}
  style:--texto={sharedPalette.neutral[300]}
  style:--suave={sharedPalette.neutral[100]}
>
  <header>
    <h1>Gráficos por função</h1>
    <p>
      Escolha pela pergunta que o leitor precisa responder. Cada cartão leva à página do gráfico,
      com quando usar, formato dos dados, props e etapas de scrollytelling.
    </p>
  </header>

  {#each funcoes as funcao (funcao.titulo)}
    <section>
      <h2>{funcao.titulo}</h2>
      <p class="descricao">{funcao.descricao}</p>
      <div class="grade">
        {#each funcao.cartoes as c (c.nome)}
          <article>
            <a href="./?path=/docs/{docsId(c.nome)}" target="_top">
              <h3>{c.nome}</h3>
              <p class="pergunta">{c.pergunta}</p>
              <code>{c.componente}</code>
            </a>
            <div class="grafico" {@attach aoAparecer(c.nome)}>
              {#if !vistos[c.nome]}
                <div class="reserva"></div>
              {:else if !c.sobDemanda}
                <c.grafico {...c.props} interactive={false} />
              {:else if malha}
                <c.grafico {...c.props} values={municipios.values} names={municipios.names} mesh={malha} interactive={false} />
              {:else}
                <button type="button" onclick={carregarMalha} disabled={carregando}>
                  {carregando ? 'Carregando a malha…' : 'Desenhar os 5.570 municípios'}
                </button>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .catalogo {
    min-height: 100vh;
    padding: 2rem max(1rem, calc((100% - 76rem) / 2)) 4rem;
    background: var(--fundo);
    color: var(--texto);
    font-family: 'General Sans Variable', system-ui, sans-serif;
  }

  header p,
  .descricao {
    max-width: 42rem;
    color: var(--suave);
    line-height: 1.5;
  }

  h1 {
    margin: 0 0 0.5rem;
    font-size: 2rem;
  }

  section {
    margin-top: 3rem;
  }

  h2 {
    margin: 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--linha);
    font-size: 1.25rem;
  }

  .grade {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
    gap: 1.5rem;
    margin-top: 1.25rem;
  }

  article {
    min-width: 0;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--linha);
    border-radius: 12px;
    background: #FEFFFC;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  a:hover h3 {
    text-decoration: underline;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .pergunta {
    margin: 0.25rem 0 0.5rem;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  code {
    font-size: 0.75rem;
    color: var(--suave);
  }

  .reserva {
    min-height: 16rem;
  }

  button {
    width: 100%;
    min-height: 12rem;
    border: 1px dashed var(--linha);
    border-radius: 8px;
    background: var(--fundo);
    color: var(--suave);
    font: inherit;
    cursor: pointer;
  }

  .grafico {
    min-width: 0;
    align-self: end;
  }
</style>
