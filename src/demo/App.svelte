<script lang="ts">
  import VerticalBarChart from '../lib/components/VerticalBarChart.svelte';
  import HorizontalBarChart from '../lib/components/HorizontalBarChart.svelte';
  import VerticalStackedBarChart from '../lib/components/VerticalStackedBarChart.svelte';
  import HorizontalStackedBarChart from '../lib/components/HorizontalStackedBarChart.svelte';
  import DivergingBarChart from '../lib/components/DivergingBarChart.svelte';
  import LineChart from '../lib/components/LineChart.svelte';
  import BubbleChart from '../lib/components/BubbleChart.svelte';
  import SlopeGraph from '../lib/components/SlopeGraph.svelte';
  import RadialChart from '../lib/components/RadialChart.svelte';
  import PyramidChart from '../lib/components/PyramidChart.svelte';
  import HeatMap from '../lib/components/HeatMap.svelte';
  import BigNumber from '../lib/components/BigNumber.svelte';
  import ChoroplethMap from '../lib/components/ChoroplethMap.svelte';
  import StreamGraph from '../lib/components/StreamGraph.svelte';
  import PictogramChart from '../lib/components/PictogramChart.svelte';
  import ProportionalAreaChart from '../lib/components/ProportionalAreaChart.svelte';
  import MarimekkoChart from '../lib/components/MarimekkoChart.svelte';
  import DonutChart from '../lib/components/DonutChart.svelte';
  import GroupedColumnChart from '../lib/components/GroupedColumnChart.svelte';
  import ParliamentChart from '../lib/components/ParliamentChart.svelte';
  import WaffleChart from '../lib/components/WaffleChart.svelte';
  import PieChart from '../lib/components/PieChart.svelte';
  import TreemapChart from '../lib/components/TreemapChart.svelte';
  import TierSmallMultiples from '../lib/components/TierSmallMultiples.svelte';
  import CorrelationMatrix from '../lib/components/CorrelationMatrix.svelte';
  import CalendarHeatmap from '../lib/components/CalendarHeatmap.svelte';
  import ContourPlot from '../lib/components/ContourPlot.svelte';
  import { colorScales } from '../lib/tokens.js';

  // ── Data ──────────────────────────────────────────────────────────────

  const barData = [
    { label: 'Jan', value: 42 },
    { label: 'Fev', value: 78 },
    { label: 'Mar', value: 55 },
    { label: 'Abr', value: 91 },
    { label: 'Mai', value: 63 },
    { label: 'Jun', value: 110 },
  ];

  const stackedData = [
    { label: 'SP', youth: 12000, adult: 28000, senior: 8000 },
    { label: 'RJ', youth: 7500,  adult: 18000, senior: 5500 },
    { label: 'MG', youth: 8200,  adult: 20000, senior: 6000 },
    { label: 'BA', youth: 6800,  adult: 14000, senior: 3500 },
    { label: 'RS', youth: 4200,  adult: 11000, senior: 4800 },
  ];
  const stackedKeys = ['youth', 'adult', 'senior'];
  const stackedLabels = { youth: '15-29', adult: '30-59', senior: '60+' };

  const hStackedData = [
    { label: 'Sao Paulo',      audiovisual: 320, demais: 500 },
    { label: 'Rio de Janeiro', audiovisual: 180, demais: 130 },
    { label: 'Minas Gerais',   audiovisual: 90,  demais: 190 },
    { label: 'Bahia',          audiovisual: 75,  demais: 135 },
    { label: 'Parana',         audiovisual: 65,  demais: 125 },
  ];

  const hStackedFlagData = [
    { label: 'SP', audiovisual: 320, demais: 500 },
    { label: 'RJ', audiovisual: 180, demais: 130 },
    { label: 'MG', audiovisual: 90,  demais: 190 },
    { label: 'BA', audiovisual: 75,  demais: 135 },
    { label: 'PR', audiovisual: 65,  demais: 125 },
  ];

  const stateFlags: Record<string, string> = {
    SP: '/flags/states/SP.svg',
    RJ: '/flags/states/RJ.svg',
    MG: '/flags/states/MG.svg',
    BA: '/flags/states/BA.svg',
    PR: '/flags/states/PR.svg',
  };

  const divergingData = [
    { label: 'SP', leftPct: 51.8 },
    { label: 'RJ', leftPct: 53.2 },
    { label: 'MG', leftPct: 50.9 },
    { label: 'BA', leftPct: 52.1 },
    { label: 'RS', leftPct: 50.4 },
    { label: 'PR', leftPct: 50.6 },
  ];

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const lineMultiSeries = [
    {
      name: 'Sudeste',
      data: months.map((label, i) => ({ label, value: [120, 135, 128, 142, 155, 168][i] })),
    },
    {
      name: 'Nordeste',
      data: months.map((label, i) => ({ label, value: [80, 75, 88, 92, 85, 98][i] })),
    },
    {
      name: 'Sul',
      data: months.map((label, i) => ({ label, value: [60, 68, 55, 72, 78, 82][i] })),
    },
  ];

  const lineYears = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const lineTrendSeries = [
    {
      name: 'Museus',
      data: lineYears.map((label, i) => ({ label, value: [320, 180, 210, 290, 350, 410][i] })),
    },
    {
      name: 'Bibliotecas',
      data: lineYears.map((label, i) => ({ label, value: [280, 250, 240, 260, 275, 300][i] })),
    },
    {
      name: 'Teatros',
      data: lineYears.map((label, i) => ({ label, value: [150, 60, 85, 130, 170, 195][i] })),
    },
    {
      name: 'Cinemas',
      data: lineYears.map((label, i) => ({ label, value: [200, 40, 70, 155, 210, 240][i] })),
    },
  ];

  const slopeLabels = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const slopeItems = [
    { name: 'Sao Paulo',      values: [82, 84, 86, 88, 90, 91] },
    { name: 'Rio de Janeiro', values: [74, 73, 71, 70, 69, 68] },
    { name: 'Belo Horizonte', values: [61, 64, 68, 72, 76, 79] },
    { name: 'Salvador',       values: [55, 56, 58, 59, 61, 63] },
  ];

  const bubbleData = [
    { label: 'SP', x: 100, y: 5000, size: 80 },
    { label: 'RJ', x: 250, y: 8000, size: 45 },
    { label: 'MG', x: 180, y: 3000, size: 60 },
    { label: 'BA', x: 400, y: 12000, size: 25 },
    { label: 'PR', x: 320, y: 9500, size: 50 },
  ];

  const radialSeries = [
    {
      name: 'Sudeste',
      values: [
        { axis: 'Saude',      value: 82 },
        { axis: 'Educacao',   value: 74 },
        { axis: 'Renda',      value: 68 },
        { axis: 'Habitacao',  value: 71 },
        { axis: 'Saneamento', value: 65 },
        { axis: 'Mobilidade', value: 58 },
      ],
    },
    {
      name: 'Nordeste',
      values: [
        { axis: 'Saude',      value: 55 },
        { axis: 'Educacao',   value: 48 },
        { axis: 'Renda',      value: 32 },
        { axis: 'Habitacao',  value: 45 },
        { axis: 'Saneamento', value: 38 },
        { axis: 'Mobilidade', value: 28 },
      ],
    },
  ];

  const pyramidData = [
    { label: '0-9',   left: 7200, right: 6900 },
    { label: '10-19', left: 8100, right: 7800 },
    { label: '20-29', left: 9500, right: 9200 },
    { label: '30-39', left: 10800, right: 10500 },
    { label: '40-49', left: 9200, right: 9600 },
    { label: '50-59', left: 7500, right: 8100 },
    { label: '60-69', left: 5200, right: 6000 },
    { label: '70+',   left: 2800, right: 3600 },
  ];

  const heatStates = ['SP', 'RJ', 'MG', 'BA', 'RS'];
  const heatMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const heatData = heatStates.flatMap((y, ri) =>
    heatMonths.map((x, ci) => ({
      x, y,
      value: Math.round(20 + 60 * Math.abs(Math.sin(ri * 3 + ci * 7))),
    }))
  );

  const statesData: Record<string, any> = {
    'São Paulo':       { valorRecebido: 820000000 },
    'Rio de Janeiro':  { valorRecebido: 310000000 },
    'Minas Gerais':    { valorRecebido: 280000000 },
    'Bahia':           { valorRecebido: 210000000 },
    'Paraná':          { valorRecebido: 190000000 },
    'Rio Grande do Sul': { valorRecebido: 175000000 },
    'Pernambuco':      { valorRecebido: 145000000 },
    'Ceará':           { valorRecebido: 120000000 },
    'Pará':            { valorRecebido: 98000000 },
    'Goiás':           { valorRecebido: 88000000 },
    'Distrito Federal':{ valorRecebido: 78000000 },
    'Maranhão':        { valorRecebido: 72000000 },
    'Espírito Santo':  { valorRecebido: 65000000 },
    'Amazonas':        { valorRecebido: 58000000 },
    'Paraíba':         { valorRecebido: 55000000 },
    'Mato Grosso':     { valorRecebido: 52000000 },
    'Santa Catarina':  { valorRecebido: 148000000 },
    'Mato Grosso do Sul': { valorRecebido: 48000000 },
    'Rio Grande do Norte': { valorRecebido: 48000000 },
    'Piauí':           { valorRecebido: 40000000 },
    'Alagoas':         { valorRecebido: 38000000 },
    'Rondônia':        { valorRecebido: 32000000 },
    'Sergipe':         { valorRecebido: 30000000 },
    'Tocantins':       { valorRecebido: 22000000 },
    'Acre':            { valorRecebido: 12000000 },
    'Amapá':           { valorRecebido: 9500000 },
    'Roraima':         { valorRecebido: 8000000 },
  };

  const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1,
  });

  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  const streamData = years.map((label, i) => ({
    label,
    Music: [30, 42, 55, 48, 60, 72, 85][i],
    Film: [20, 25, 35, 45, 40, 38, 50][i],
    Theater: [15, 18, 12, 20, 25, 22, 28][i],
    Dance: [10, 12, 8, 15, 18, 20, 24][i],
  }));

  const pictogramData = [
    { label: 'Museus', value: 35 },
    { label: 'Bibliotecas', value: 52 },
    { label: 'Teatros', value: 18 },
  ];

  const proportionalData = [
    { label: 'Sudeste', value: 4200 },
    { label: 'Nordeste', value: 2800 },
    { label: 'Sul', value: 1500 },
    { label: 'Centro-Oeste', value: 900 },
    { label: 'Norte', value: 600 },
  ];

  const mekkoData = [
    { label: 'Sudeste', total: 4500, music: 1800, film: 1200, theater: 900, dance: 600 },
    { label: 'Nordeste', total: 2800, music: 1000, film: 800, theater: 600, dance: 400 },
    { label: 'Sul', total: 1900, music: 700, film: 500, theater: 400, dance: 300 },
    { label: 'Norte', total: 600, music: 200, film: 180, theater: 120, dance: 100 },
  ];

  const donutData = [
    { label: 'Musica', value: 3200 },
    { label: 'Cinema', value: 2100 },
    { label: 'Teatro', value: 1400 },
    { label: 'Danca', value: 800 },
    { label: 'Artes Visuais', value: 600 },
  ];

  const groupedData = [
    { label: '2020', music: 3200, film: 2100, theater: 1400 },
    { label: '2021', music: 3800, film: 2400, theater: 1600 },
    { label: '2022', music: 4200, film: 2800, theater: 1900 },
    { label: '2023', music: 4800, film: 3100, theater: 2200 },
  ];

  const parliamentData = [
    { label: 'Partido A', seats: 120 },
    { label: 'Partido B', seats: 85 },
    { label: 'Partido C', seats: 62 },
    { label: 'Partido D', seats: 45 },
    { label: 'Partido E', seats: 30 },
    { label: 'Outros', seats: 18 },
  ];

  const waffleData = [
    { label: 'Musica', value: 32 },
    { label: 'Cinema', value: 21 },
    { label: 'Teatro', value: 14 },
    { label: 'Danca', value: 8 },
    { label: 'Artes Visuais', value: 6 },
    { label: 'Outros', value: 19 },
  ];

  const pieData = [
    { label: 'Norte', value: 600 },
    { label: 'Nordeste', value: 2800 },
    { label: 'Centro-Oeste', value: 900 },
    { label: 'Sudeste', value: 4200 },
    { label: 'Sul', value: 1500 },
  ];

  const treemapData = {
    name: 'Cultura',
    children: [
      { name: 'Musica', children: [
        { name: 'Sertanejo', value: 3200 }, { name: 'MPB', value: 2400 },
        { name: 'Rock', value: 1800 }, { name: 'Funk', value: 1500 },
      ]},
      { name: 'Cinema', children: [
        { name: 'Drama', value: 2100 }, { name: 'Comedia', value: 1600 },
        { name: 'Documentario', value: 800 },
      ]},
      { name: 'Teatro', children: [
        { name: 'Musical', value: 1200 }, { name: 'Dramaturgia', value: 900 },
      ]},
      { name: 'Danca', children: [
        { name: 'Ballet', value: 700 }, { name: 'Contemporanea', value: 500 },
      ]},
    ],
  };

  const corrVars = ['PIB', 'Emprego', 'Renda', 'Educacao', 'Saude', 'Cultura'];
  const corrData = (() => {
    const cells: Array<{x: string; y: string; value: number}> = [];
    let n = 42;
    for (const x of corrVars) {
      for (const y of corrVars) {
        if (x === y) { cells.push({ x, y, value: 1.0 }); continue; }
        n = (n * 1664525 + 1013904223) & 0xffffffff;
        cells.push({ x, y, value: Math.round((Math.abs(n) % 2000 - 1000) / 10) / 100 });
      }
    }
    return cells;
  })();

  const calendarData = (() => {
    const data: Array<{date: string; value: number}> = [];
    let n = 1;
    const d = new Date(2025, 0, 1);
    const end = new Date(2025, 11, 31);
    while (d <= end) {
      n = (n * 1664525 + 1013904223) & 0xffffffff;
      if (Math.abs(n) % 100 > 20) {
        data.push({ date: d.toISOString().slice(0, 10), value: Math.abs(n % 50) });
      }
      d.setDate(d.getDate() + 1);
    }
    return data;
  })();

  const contourData = (() => {
    const pts: Array<{x: number; y: number}> = [];
    let s = 42;
    function rng() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }
    function bm() { const u1 = rng() || 0.001; const u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }
    for (let i = 0; i < 400; i++) {
      if (rng() < 0.6) pts.push({ x: bm() * 15 + 50, y: bm() * 12 + 60 });
      else pts.push({ x: bm() * 10 + 80, y: bm() * 18 + 30 });
    }
    return pts;
  })();

  const tierData: Record<string, Record<string, Record<string, any>>> = {
    Capitais: {
      'Sao Paulo':         { execucaoFinanceira: 87.2 },
      'Rio de Janeiro':    { execucaoFinanceira: 72.5 },
      'Minas Gerais':      { execucaoFinanceira: 68.1 },
      'Bahia':             { execucaoFinanceira: 61.3 },
      'Parana':            { execucaoFinanceira: 74.8 },
      'Rio Grande do Sul': { execucaoFinanceira: 70.2 },
      'Pernambuco':        { execucaoFinanceira: 58.9 },
      'Ceara':             { execucaoFinanceira: 55.4 },
      'Para':              { execucaoFinanceira: 42.7 },
      'Goias':             { execucaoFinanceira: 63.5 },
      'Distrito Federal':  { execucaoFinanceira: 91.0 },
      'Maranhao':          { execucaoFinanceira: 38.2 },
      'Amazonas':          { execucaoFinanceira: 45.6 },
      'Santa Catarina':    { execucaoFinanceira: 76.3 },
      'Espirito Santo':    { execucaoFinanceira: 66.8 },
      'Paraiba':           { execucaoFinanceira: 52.1 },
      'Mato Grosso':       { execucaoFinanceira: 57.3 },
      'Mato Grosso do Sul':{ execucaoFinanceira: 60.4 },
      'Rio Grande do Norte':{ execucaoFinanceira: 49.8 },
      'Piaui':             { execucaoFinanceira: 35.6 },
      'Alagoas':           { execucaoFinanceira: 41.2 },
      'Sergipe':           { execucaoFinanceira: 44.7 },
      'Rondonia':          { execucaoFinanceira: 39.1 },
      'Tocantins':         { execucaoFinanceira: 33.5 },
      'Acre':              { execucaoFinanceira: 28.9 },
      'Amapa':             { execucaoFinanceira: 25.3 },
      'Roraima':           { execucaoFinanceira: 22.7 },
    },
  };

  const tierCities = [
    { name: 'Belo Horizonte', uf: 'MG', lat: -19.9167, lng: -43.9345, tier: 'Capitais' },
    { name: 'Uberlandia',     uf: 'MG', lat: -18.9186, lng: -48.2772, tier: 'Grande Porte' },
    { name: 'Juiz de Fora',   uf: 'MG', lat: -21.7642, lng: -43.3503, tier: 'Grande Porte' },
    { name: 'Montes Claros',  uf: 'MG', lat: -16.7350, lng: -43.8615, tier: 'Medio Porte' },
    { name: 'Sao Paulo',      uf: 'SP', lat: -23.5505, lng: -46.6333, tier: 'Capitais' },
    { name: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9068, lng: -43.1729, tier: 'Capitais' },
  ];
</script>

<div class="page">
  <!-- Header -->
  <header class="header">
    <p class="header-eyebrow">SNIIC &middot; Sistema Nacional de Informacoes e Indicadores Culturais</p>
    <h1>Panorama Cultural do Brasil</h1>
    <p class="header-subtitle">
      Uma visao abrangente sobre os indicadores culturais brasileiros,
      apresentada atraves de visualizacoes de dados interativas do SNIIC Design System.
    </p>
  </header>

  <main class="content">
    <!-- Intro + Big Numbers -->
    <section class="section">
      <div class="text-block">
        <p class="lead">
          O cenario cultural brasileiro passou por transformacoes significativas nos ultimos anos.
          Com investimentos crescentes e novas politicas publicas, o setor demonstra sinais claros
          de recuperacao e crescimento sustentavel.
        </p>
      </div>
      <div class="big-numbers-row">
        <BigNumber value={93} suffix="%" label="execucao financeira" fontSize={64} />
        <BigNumber value="1.250" label="projetos culturais ativos" fontSize={56} />
        <BigNumber value="82,7" suffix=" mi" label="valor investido (R$)" fontSize={56} />
      </div>
      <div class="text-block">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
      </div>
    </section>

    <!-- Section 1: Trends -->
    <section class="section">
      <h2>Evolucao Temporal dos Indicadores</h2>
      <div class="text-block">
        <p>
          A analise longitudinal dos dados culturais revela padroes importantes de comportamento
          ao longo do tempo. O impacto da pandemia em 2020 e claramente visivel, com quedas
          acentuadas em todas as categorias. No entanto, a recuperacao subsequente demonstra
          a resiliencia do setor cultural.
        </p>
      </div>

      <div class="chart-with-text">
        <div class="chart-panel">
          <h3>Equipamentos Culturais por Ano</h3>
          <LineChart series={lineTrendSeries} width={560} height={320} />
        </div>
        <div class="text-panel">
          <p>
            Museus e bibliotecas mantiveram uma trajetoria relativamente estavel, enquanto
            teatros e cinemas sofreram impactos mais severos durante o periodo pandemico.
          </p>
          <p>
            A partir de 2022, observa-se uma aceleracao na recuperacao, com cinemas
            ultrapassando os niveis pre-pandemia em 2024. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Praesent vitae eros eget tellus tristique
            bibendum. Donec rutrum sed sem quis venenatis.
          </p>
        </div>
      </div>

      <div class="chart-with-text reverse">
        <div class="text-panel">
          <p>
            A producao cultural por regiao mostra disparidades significativas entre Sudeste,
            Nordeste e Sul. Enquanto a regiao Sudeste lidera em volume absoluto, o Nordeste
            apresenta as maiores taxas de crescimento percentual.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
            in voluptate velit esse cillum dolore.
          </p>
        </div>
        <div class="chart-panel">
          <h3>Producao Cultural por Regiao</h3>
          <LineChart series={lineMultiSeries} width={560} height={280} />
        </div>
      </div>
    </section>

    <!-- Section 2: Stream + Slope -->
    <section class="section">
      <div class="chart-block">
        <h3>Fluxo de Producao por Segmento (2018-2024)</h3>
        <StreamGraph
          data={streamData}
          keys={['Music', 'Film', 'Theater', 'Dance']}
          height={300}
        />
      </div>
      <div class="text-block">
        <p>
          O grafico de fluxo acima evidencia como a musica tem dominado a producao cultural,
          seguida pelo cinema. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus
          et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies
          nec, pellentesque eu, pretium quis, sem.
        </p>
      </div>

      <div class="chart-with-text">
        <div class="chart-panel">
          <h3>Evolucao de Indice por Cidade</h3>
          <SlopeGraph
            items={slopeItems}
            labels={slopeLabels}
            width={500}
            height={320}
            margin={{ top: 40, right: 120, bottom: 40, left: 120 }}
          />
        </div>
        <div class="text-panel">
          <p>
            Sao Paulo mantem a lideranca no indice cultural, com crescimento constante.
            Belo Horizonte apresenta a trajetoria mais impressionante, subindo de 61
            para 79 pontos no periodo. Em contraste, o Rio de Janeiro mostra uma
            tendencia de queda gradual.
          </p>
          <p>
            Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec,
            vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
          </p>
        </div>
      </div>
    </section>

    <!-- Section 3: Comparison -->
    <section class="section">
      <h2>Comparacao entre Estados e Regioes</h2>
      <div class="text-block">
        <p>
          A comparacao entre unidades federativas revela um cenario de desigualdade na
          distribuicao de recursos e equipamentos culturais. Os graficos a seguir ilustram
          as principais diferencas observadas no primeiro semestre.
        </p>
      </div>

      <div class="chart-grid-2">
        <div class="chart-cell">
          <h3>Eventos Mensais</h3>
          <VerticalBarChart data={barData} height={260} />
        </div>
        <div class="chart-cell">
          <h3>Ranking por Estado</h3>
          <HorizontalBarChart data={barData} />
        </div>
      </div>

      <div class="text-block">
        <p>
          Junho se destaca como o mes de maior atividade cultural, coincidindo com as
          festas juninas e a programacao de inverno. Excepteur sint occaecat cupidatat
          non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.
        </p>
      </div>

      <div class="chart-grid-2">
        <div class="chart-cell">
          <h3>Investimento por Segmento e Ano</h3>
          <GroupedColumnChart
            data={groupedData}
            keys={['music', 'film', 'theater']}
            labels={{ music: 'Musica', film: 'Cinema', theater: 'Teatro' }}
            height={300}
          />
        </div>
        <div class="chart-cell">
          <h3>Investimento por Regiao e Faixa Etaria</h3>
          <VerticalStackedBarChart
            data={stackedData}
            keys={stackedKeys}
            labels={stackedLabels}
            normalize
            height={300}
          />
        </div>
      </div>

      <div class="chart-block">
        <h3>Distribuicao de Recursos: Audiovisual vs. Demais Setores</h3>
        <HorizontalStackedBarChart
          data={hStackedData}
          keys={['audiovisual', 'demais']}
          labels={{ audiovisual: 'Audiovisual', demais: 'Demais' }}
        />
      </div>

      <div class="chart-block">
        <h3>Distribuicao por Estado (com bandeiras)</h3>
        <HorizontalStackedBarChart
          data={hStackedFlagData}
          keys={['audiovisual', 'demais']}
          labels={{ audiovisual: 'Audiovisual', demais: 'Demais' }}
          icons={stateFlags}
        />
      </div>
    </section>

    <!-- Section 4: Composition -->
    <section class="section">
      <h2>Composicao e Proporcoes</h2>
      <div class="text-block">
        <p>
          Entender a composicao dos investimentos culturais e fundamental para o
          planejamento de politicas publicas. Os graficos a seguir mostram como os
          recursos estao distribuidos entre diferentes segmentos artisticos e regioes.
        </p>
      </div>

      <div class="chart-grid-2">
        <div class="chart-cell">
          <h3>Distribuicao por Regiao</h3>
          <PieChart data={pieData} height={340} />
        </div>
        <div class="chart-cell">
          <h3>Composicao por Segmento</h3>
          <DonutChart data={donutData} height={340} centerValue="8.1k" centerLabel="Total" />
        </div>
      </div>

      <div class="chart-grid-2">
        <div class="chart-cell">
          <h3>Proporcao do Orcamento Cultural</h3>
          <WaffleChart data={waffleData} height={340} />
        </div>
        <div class="chart-cell">
          <h3>Composicao Parlamentar</h3>
          <ParliamentChart data={parliamentData} height={340} rows={5} />
        </div>
      </div>

      <div class="text-block">
        <p>
          A musica representa a maior fatia do orcamento cultural, com 32% do total,
          seguida pelo cinema (21%) e teatro (14%). As artes visuais, embora com
          menor participacao orcamentaria, apresentam o maior retorno em termos de
          alcance de publico. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Aenean commodo ligula eget dolor. Aenean massa.
        </p>
      </div>

      <div class="chart-block">
        <h3>Taxonomia Cultural: Segmentos e Generos</h3>
        <TreemapChart data={treemapData} height={380} />
      </div>

      <div class="chart-with-text">
        <div class="chart-panel">
          <h3>Grafico Marimekko</h3>
          <MarimekkoChart
            data={mekkoData}
            keys={['music', 'film', 'theater', 'dance']}
            labels={{ music: 'Musica', film: 'Cinema', theater: 'Teatro', dance: 'Danca' }}
            height={350}
          />
        </div>
        <div class="text-panel">
          <p>
            O grafico Marimekko combina a largura proporcional ao total de cada regiao
            com a altura proporcional de cada segmento cultural. A regiao Sudeste
            domina em volume absoluto, mas o Norte possui uma composicao mais equilibrada
            entre os segmentos.
          </p>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
            sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
        </div>
      </div>

      <div class="chart-grid-2">
        <div class="chart-cell">
          <h3>Area Proporcional por Regiao</h3>
          <ProportionalAreaChart data={proportionalData} maxRadius={60} />
        </div>
        <div class="chart-cell">
          <h3>Equipamentos Culturais (Pictograma)</h3>
          <PictogramChart data={pictogramData} columns={10} iconSize={18} />
        </div>
      </div>

      <div class="text-block">
        <p>
          O mapa de arvore revela a hierarquia dos generos culturais. Dentro da musica,
          o sertanejo lidera com ampla margem, seguido pela MPB. No cinema, o drama supera
          a comedia e os documentarios. At vero eos et accusamus et iusto odio dignissimos
          ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.
        </p>
      </div>
    </section>

    <!-- Section 5: Demographics -->
    <section class="section">
      <h2>Perfil Demografico e Divergencias</h2>
      <div class="text-block">
        <p>
          A analise demografica do publico cultural brasileiro revela diferencas
          importantes entre generos e faixas etarias. A piramide etaria do publico
          participante mostra uma concentracao na faixa de 30 a 39 anos.
        </p>
      </div>

      <div class="chart-with-text reverse">
        <div class="text-panel">
          <p>
            A participacao feminina supera ligeiramente a masculina em todos os estados
            analisados, com destaque para Rio de Janeiro (53,2%) e Bahia (52,1%).
            Essa tendencia se mantem consistente ao longo dos ultimos cinco anos.
          </p>
          <p>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis
            praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias
            excepturi sint occaecati cupiditate non provident.
          </p>
        </div>
        <div class="chart-panel">
          <h3>Participacao por Genero</h3>
          <DivergingBarChart
            data={divergingData}
            leftLabel="Feminino"
            rightLabel="Masculino"
            referenceValue={51.5}
            referenceLabel="media"
          />
        </div>
      </div>

      <div class="chart-with-text">
        <div class="chart-panel">
          <h3>Piramide Etaria do Publico</h3>
          <PyramidChart data={pyramidData} height={380} />
        </div>
        <div class="text-panel">
          <p>
            A faixa etaria de 30 a 39 anos e a mais representativa no consumo cultural,
            tanto entre homens quanto entre mulheres. Nota-se tambem que a partir dos
            60 anos, a participacao feminina supera a masculina de forma mais acentuada.
          </p>
          <p>
            Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum
            et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
          </p>
        </div>
      </div>
    </section>

    <!-- Section 6: Correlations -->
    <section class="section">
      <h2>Correlacoes e Padroes</h2>
      <div class="text-block">
        <p>
          A relacao entre indicadores socioeconomicos e culturais pode ser explorada
          atraves de diferentes representacoes visuais. Os graficos abaixo permitem
          identificar clusters e padroes ocultos nos dados.
        </p>
      </div>

      <div class="chart-grid-2">
        <div class="chart-cell">
          <h3>Investimento vs. Receita por Estado</h3>
          <BubbleChart
            data={bubbleData}
            xLabel="Investimento"
            yLabel="Receita"
            sizeLabel="Participacao"
          />
        </div>
        <div class="chart-cell">
          <h3>Indicadores Sociais por Regiao</h3>
          <RadialChart series={radialSeries} size={400} />
        </div>
      </div>

      <div class="text-block">
        <p>
          O grafico de bolhas evidencia que Bahia apresenta alta receita em relacao ao
          investimento, enquanto Sao Paulo lidera em participacao de mercado. O grafico
          radial compara os indicadores sociais entre Sudeste e Nordeste, revelando
          gaps significativos em renda e mobilidade.
        </p>
      </div>

      <div class="chart-grid-2">
        <div class="chart-cell">
          <h3>Matriz de Correlacao</h3>
          <CorrelationMatrix data={corrData} height={400} />
        </div>
        <div class="chart-cell">
          <h3>Grafico de Contorno</h3>
          <ContourPlot data={contourData} height={400} />
        </div>
      </div>

      <div class="text-block">
        <p>
          A matriz de correlacao revela relacoes fortes entre PIB e indicadores de emprego
          e renda. O grafico de contorno mostra dois clusters distintos na distribuicao
          espacial dos dados. Temporibus autem quibusdam et aut officiis debitis aut rerum
          necessitatibus saepe eveniet ut et voluptates repudiandae sint.
        </p>
      </div>

      <div class="chart-block">
        <h3>Intensidade de Eventos por Estado e Mes</h3>
        <HeatMap data={heatData} height={260} />
      </div>

      <div class="chart-block">
        <h3>Atividade Cultural Diaria (2025)</h3>
        <CalendarHeatmap data={calendarData} height={160} />
      </div>

      <div class="text-block">
        <p>
          Os mapas de calor permitem visualizar a sazonalidade dos eventos culturais
          por estado e a atividade diaria ao longo do ano. Itaque earum rerum hic tenetur
          a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur
          aut perferendis doloribus asperiores repellat.
        </p>
      </div>
    </section>

    <!-- Section 7: Maps -->
    <section class="section">
      <h2>Distribuicao Geografica</h2>
      <div class="text-block">
        <p>
          A distribuicao geografica dos recursos culturais reflete as desigualdades
          regionais historicas do Brasil. Sao Paulo concentra o maior volume de
          investimentos, seguido por Rio de Janeiro e Santa Catarina.
        </p>
      </div>

      <div class="chart-block">
        <h3>Valor Recebido por Estado (R$)</h3>
        <ChoroplethMap
          states={statesData}
          metric="valorRecebido"
          label="Valor Recebido"
          format={(v) => BRL.format(v)}
          colorRange={[...colorScales.blue]}
          isStatic
        />
      </div>

      <div class="text-block">
        <p>
          E necessario promover politicas de descentralizacao para que estados do Norte
          e Centro-Oeste possam ampliar sua participacao no cenario cultural nacional.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <div class="chart-block">
        <h3>Pequenos Multiplos por Porte de Cidade</h3>
        <TierSmallMultiples
          tiers={tierData}
          cities={tierCities}
          initialState="MG"
        />
      </div>

      <div class="text-block">
        <p>
          A visualizacao por porte de cidade permite comparar a execucao financeira
          entre capitais, cidades de grande porte e medio porte. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>
    </section>
  </main>

  <footer class="footer">
    <p>SNIIC Design System &middot; Ministerio da Cultura &middot; Governo Federal</p>
    <p class="footer-sub">Dados ilustrativos para demonstracao do Design System</p>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #ffffdeff;
    color: #1a1a2e;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    font-family: 'Inter', system-ui, sans-serif;
    max-width: 1120px;
    margin: 0 auto;
  }

  /* Header */
  .header {
    padding: 80px 40px 48px;
    margin-bottom: 48px;
    border-bottom: 2px solid #d4c5d0;
  }

  .header-eyebrow {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8a6d84;
    margin: 0 0 16px;
  }

  .header h1 {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.1;
    color: #4a3347;
    margin: 0 0 20px;
  }

  .header-subtitle {
    font-size: 18px;
    line-height: 1.6;
    color: #3a3a4a;
    max-width: 720px;
    margin: 0;
  }

  /* Content */
  .content {
    padding: 0 40px;
  }

  .section {
    margin-bottom: 72px;
  }

  .section h2 {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #4a3347;
    border-bottom: 2px solid #d4c5d0;
    padding-bottom: 12px;
    margin: 0 0 24px;
  }

  .text-block {
    max-width: 720px;
    margin-bottom: 32px;
  }

  .text-block p {
    font-size: 16px;
    line-height: 1.7;
    color: #3a3a4a;
    margin: 0 0 16px;
  }

  .text-block p:last-child {
    margin-bottom: 0;
  }

  .lead {
    font-size: 20px !important;
    line-height: 1.6 !important;
    color: #2a2a3a !important;
    font-weight: 500;
  }

  /* Big numbers row */
  .big-numbers-row {
    display: flex;
    gap: 48px;
    justify-content: flex-start;
    align-items: center;
    padding: 32px 0;
    margin-bottom: 24px;
    border-top: 1px solid #e8e0e6;
    border-bottom: 1px solid #e8e0e6;
  }

  /* Chart + text side by side */
  .chart-with-text {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 40px;
    align-items: start;
    margin-bottom: 48px;
  }

  .chart-with-text.reverse {
    grid-template-columns: 0.8fr 1.2fr;
  }

  .chart-panel h3,
  .chart-cell h3,
  .chart-block h3 {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #6b5568;
    letter-spacing: 0.01em;
    margin: 0 0 16px;
  }

  .text-panel p {
    font-size: 15px;
    line-height: 1.7;
    color: #3a3a4a;
    margin: 0 0 16px;
  }

  .text-panel p:last-child {
    margin-bottom: 0;
  }

  /* 2-col chart grid */
  .chart-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin-bottom: 40px;
  }

  .chart-cell {
    min-width: 0;
  }

  /* Full-width chart block */
  .chart-block {
    margin-bottom: 40px;
  }

  /* Footer */
  .footer {
    border-top: 2px solid #d4c5d0;
    padding: 40px;
    text-align: center;
    margin-top: 48px;
  }

  .footer p {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #4a3347;
    margin: 0 0 8px;
  }

  .footer-sub {
    font-weight: 400 !important;
    font-size: 12px !important;
    color: #8a6d84 !important;
  }
</style>
