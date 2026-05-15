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
  import TreemapChart from '../lib/components/TreemapChart.svelte';
  import DonutChart from '../lib/components/DonutChart.svelte';
  import GroupedColumnChart from '../lib/components/GroupedColumnChart.svelte';
  import ParliamentChart from '../lib/components/ParliamentChart.svelte';
  import WaffleChart from '../lib/components/WaffleChart.svelte';
  import PieChart from '../lib/components/PieChart.svelte';
  import TierSmallMultiples from '../lib/components/TierSmallMultiples.svelte';
  import CorrelationMatrix from '../lib/components/CorrelationMatrix.svelte';
  import CalendarHeatmap from '../lib/components/CalendarHeatmap.svelte';
  import ContourPlot from '../lib/components/ContourPlot.svelte';
  import { colorScales } from '../lib/tokens.js';

  // ── Shared sample data ──────────────────────────────────────────────────

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
  const stackedLabels = { youth: '15–29', adult: '30–59', senior: '60+' };

  const hStackedData = [
    { label: 'São Paulo',      audiovisual: 320, demais: 500 },
    { label: 'Rio de Janeiro', audiovisual: 180, demais: 130 },
    { label: 'Minas Gerais',   audiovisual: 90,  demais: 190 },
    { label: 'Bahia',          audiovisual: 75,  demais: 135 },
    { label: 'Paraná',         audiovisual: 65,  demais: 125 },
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
  const lineSeries = [{
    name: 'Revenue',
    data: months.map((label, i) => ({ label, value: [42, 78, 55, 91, 63, 110][i] })),
  }];

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

  const bubbleData = [
    { label: 'SP', x: 100, y: 5000, size: 80 },
    { label: 'RJ', x: 250, y: 8000, size: 45 },
    { label: 'MG', x: 180, y: 3000, size: 60 },
    { label: 'BA', x: 400, y: 12000, size: 25 },
    { label: 'PR', x: 320, y: 9500, size: 50 },
  ];

  const slopeLabels = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const slopeItems = [
    { name: 'São Paulo',      values: [82, 84, 86, 88, 90, 91] },
    { name: 'Rio de Janeiro', values: [74, 73, 71, 70, 69, 68] },
    { name: 'Belo Horizonte', values: [61, 64, 68, 72, 76, 79] },
    { name: 'Salvador',       values: [55, 56, 58, 59, 61, 63] },
  ];

  const radialSeries = [
    {
      name: 'Sudeste',
      values: [
        { axis: 'Saúde',      value: 82 },
        { axis: 'Educação',   value: 74 },
        { axis: 'Renda',      value: 68 },
        { axis: 'Habitação',  value: 71 },
        { axis: 'Saneamento', value: 65 },
        { axis: 'Mobilidade', value: 58 },
      ],
    },
    {
      name: 'Nordeste',
      values: [
        { axis: 'Saúde',      value: 55 },
        { axis: 'Educação',   value: 48 },
        { axis: 'Renda',      value: 32 },
        { axis: 'Habitação',  value: 45 },
        { axis: 'Saneamento', value: 38 },
        { axis: 'Mobilidade', value: 28 },
      ],
    },
    {
      name: 'Sul',
      values: [
        { axis: 'Saúde',      value: 78 },
        { axis: 'Educação',   value: 70 },
        { axis: 'Renda',      value: 62 },
        { axis: 'Habitação',  value: 75 },
        { axis: 'Saneamento', value: 72 },
        { axis: 'Mobilidade', value: 52 },
      ],
    },
  ];

  const pyramidData = [
    { label: '0–9',   left: 7200, right: 6900 },
    { label: '10–19', left: 8100, right: 7800 },
    { label: '20–29', left: 9500, right: 9200 },
    { label: '30–39', left: 10800, right: 10500 },
    { label: '40–49', left: 9200, right: 9600 },
    { label: '50–59', left: 7500, right: 8100 },
    { label: '60–69', left: 5200, right: 6000 },
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

  // Correlation matrix data
  const corrVars = ['PIB', 'Emprego', 'Renda', 'Educação', 'Saúde', 'Cultura'];
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

  // Calendar heatmap data
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

  // Contour plot data
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
      'São Paulo':         { execucaoFinanceira: 87.2 },
      'Rio de Janeiro':    { execucaoFinanceira: 72.5 },
      'Minas Gerais':      { execucaoFinanceira: 68.1 },
      'Bahia':             { execucaoFinanceira: 61.3 },
      'Paraná':            { execucaoFinanceira: 74.8 },
      'Rio Grande do Sul': { execucaoFinanceira: 70.2 },
      'Pernambuco':        { execucaoFinanceira: 58.9 },
      'Ceará':             { execucaoFinanceira: 55.4 },
      'Pará':              { execucaoFinanceira: 42.7 },
      'Goiás':             { execucaoFinanceira: 63.5 },
      'Distrito Federal':  { execucaoFinanceira: 91.0 },
      'Maranhão':          { execucaoFinanceira: 38.2 },
      'Amazonas':          { execucaoFinanceira: 45.6 },
      'Santa Catarina':    { execucaoFinanceira: 76.3 },
      'Espírito Santo':    { execucaoFinanceira: 66.8 },
      'Paraíba':           { execucaoFinanceira: 52.1 },
      'Mato Grosso':       { execucaoFinanceira: 57.3 },
      'Mato Grosso do Sul':{ execucaoFinanceira: 60.4 },
      'Rio Grande do Norte':{ execucaoFinanceira: 49.8 },
      'Piauí':             { execucaoFinanceira: 35.6 },
      'Alagoas':           { execucaoFinanceira: 41.2 },
      'Sergipe':           { execucaoFinanceira: 44.7 },
      'Rondônia':          { execucaoFinanceira: 39.1 },
      'Tocantins':         { execucaoFinanceira: 33.5 },
      'Acre':              { execucaoFinanceira: 28.9 },
      'Amapá':             { execucaoFinanceira: 25.3 },
      'Roraima':           { execucaoFinanceira: 22.7 },
    },
  };

  const tierCities = [
    { name: 'Belo Horizonte', uf: 'MG', lat: -19.9167, lng: -43.9345, tier: 'Capitais' },
    { name: 'Uberlândia',     uf: 'MG', lat: -18.9186, lng: -48.2772, tier: 'Grande Porte' },
    { name: 'Juiz de Fora',   uf: 'MG', lat: -21.7642, lng: -43.3503, tier: 'Grande Porte' },
    { name: 'Montes Claros',  uf: 'MG', lat: -16.7350, lng: -43.8615, tier: 'Médio Porte' },
    { name: 'São Paulo',      uf: 'SP', lat: -23.5505, lng: -46.6333, tier: 'Capitais' },
    { name: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9068, lng: -43.1729, tier: 'Capitais' },
  ];
</script>

<div class="overview">

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <h2 class="category-title">Desenvolvimento ao longo do tempo</h2>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Linha (serie unica)</span>
      <LineChart series={lineSeries} width={320} height={240} />
    </div>
    <div class="cell">
      <span class="label">Grafico de Linha (3 series)</span>
      <LineChart series={lineMultiSeries} width={320} height={240} />
    </div>
  </div>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Linha (3 series, sem pontos)</span>
      <LineChart series={lineMultiSeries} width={320} height={240} showDots={false} />
    </div>
    <div class="cell">
      <span class="label">Grafico de Linha (4 series, linear)</span>
      <LineChart series={lineTrendSeries} width={320} height={240} smooth={false} />
    </div>
  </div>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Linha (4 series, suavizado)</span>
      <LineChart series={lineTrendSeries} width={320} height={240} />
    </div>
    <div class="cell">
      <span class="label">Grafico de Inclinacao</span>
      <SlopeGraph
        items={slopeItems}
        labels={slopeLabels}
        width={500}
        height={320}
        margin={{ top: 40, right: 120, bottom: 40, left: 120 }}
      />
    </div>
  </div>

  <div class="row">
    <div class="cell span-2">
      <span class="label">Grafico de Fluxo</span>
      <StreamGraph
        data={streamData}
        keys={['Music', 'Film', 'Theater', 'Dance']}
        height={300}
      />
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <h2 class="category-title">Comparacao de valores</h2>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Barras Vertical</span>
      <VerticalBarChart data={barData} height={240} />
    </div>
    <div class="cell">
      <span class="label">Grafico de Barras Horizontal</span>
      <HorizontalBarChart data={barData} />
    </div>
  </div>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Colunas Agrupadas</span>
      <GroupedColumnChart
        data={groupedData}
        keys={['music', 'film', 'theater']}
        labels={{ music: 'Musica', film: 'Cinema', theater: 'Teatro' }}
        height={340}
      />
    </div>
    <div class="cell">
      <span class="label">Numeros em Destaque</span>
      <div class="big-number-wrapper column">
        <BigNumber value={93} suffix="%" label="execução financeira" fontSize={72} />
        <BigNumber value="1.250,45" label="projetos culturais" fontSize={64} />
        <BigNumber value="82.731,09" suffix=" mi" label="valor investido (R$)" fontSize={56} />
        <BigNumber value="3.47" suffix=" bi" label="receita bruta (R$)" fontSize={64} />
        <BigNumber value="67,83" suffix="%" label="taxa de ocupação" fontSize={72} />
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <h2 class="category-title">Proporcoes e composicao</h2>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Barras Empilhadas Vertical</span>
      <VerticalStackedBarChart
        data={stackedData}
        keys={stackedKeys}
        labels={stackedLabels}
        normalize
        height={240}
      />
    </div>
    <div class="cell">
      <span class="label">Grafico de Barras Empilhadas Horizontal</span>
      <HorizontalStackedBarChart
        data={hStackedData}
        keys={['audiovisual', 'demais']}
        labels={{ audiovisual: 'Audiovisual', demais: 'Demais' }}
      />
    </div>
  </div>

  <div class="row">
    <div class="cell span-2">
      <span class="label">Grafico de Barras Empilhadas Horizontal (com bandeiras)</span>
      <HorizontalStackedBarChart
        data={hStackedFlagData}
        keys={['audiovisual', 'demais']}
        labels={{ audiovisual: 'Audiovisual', demais: 'Demais' }}
        icons={stateFlags}
      />
    </div>
  </div>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Pizza</span>
      <PieChart data={pieData} height={340} />
    </div>
    <div class="cell">
      <span class="label">Grafico de Rosca</span>
      <DonutChart data={donutData} height={340} centerValue="8.1k" centerLabel="Total" />
    </div>
  </div>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico Waffle</span>
      <WaffleChart data={waffleData} height={340} />
    </div>
    <div class="cell">
      <span class="label">Grafico de Parlamento</span>
      <ParliamentChart data={parliamentData} height={340} rows={5} />
    </div>
  </div>

  <div class="row">
    <div class="cell">
      <span class="label">Mapa de Arvore</span>
      <TreemapChart data={treemapData} height={350} />
    </div>
    <div class="cell">
      <span class="label">Grafico Marimekko</span>
      <MarimekkoChart
        data={mekkoData}
        keys={['music', 'film', 'theater', 'dance']}
        labels={{ music: 'Musica', film: 'Cinema', theater: 'Teatro', dance: 'Danca' }}
        height={350}
      />
    </div>
  </div>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Area Proporcional</span>
      <ProportionalAreaChart data={proportionalData} maxRadius={60} />
    </div>
    <div class="cell">
      <span class="label">Pictograma</span>
      <PictogramChart data={pictogramData} columns={10} iconSize={18} />
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <h2 class="category-title">Distribuicao e divergencia</h2>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico Divergente</span>
      <DivergingBarChart
        data={divergingData}
        leftLabel="Feminino"
        rightLabel="Masculino"
        referenceValue={51.5}
        referenceLabel="média"
      />
    </div>
    <div class="cell">
      <span class="label">Piramide Etaria</span>
      <PyramidChart data={pyramidData} height={340} />
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <h2 class="category-title">Correlacoes</h2>

  <div class="row">
    <div class="cell">
      <span class="label">Grafico de Bolhas</span>
      <BubbleChart
        data={bubbleData}
        xLabel="Units"
        yLabel="Revenue"
        sizeLabel="Share"
      />
    </div>
    <div class="cell">
      <span class="label">Grafico Radial (3 series)</span>
      <RadialChart series={radialSeries} size={420} />
    </div>
  </div>

  <div class="row">
    <div class="cell span-2">
      <span class="label">Mapa de Calor</span>
      <HeatMap data={heatData} height={240} />
    </div>
  </div>

  <div class="row">
    <div class="cell">
      <span class="label">Matriz de Correlacao</span>
      <CorrelationMatrix data={corrData} height={400} />
    </div>
    <div class="cell">
      <span class="label">Grafico de Contorno</span>
      <ContourPlot data={contourData} height={400} />
    </div>
  </div>

  <div class="row">
    <div class="cell span-2">
      <span class="label">Calendario Mapa de Calor</span>
      <CalendarHeatmap data={calendarData} height={160} />
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <h2 class="category-title">Mapas</h2>

  <div class="row">
    <div class="cell span-2">
      <span class="label">Mapa Coropletico</span>
      <ChoroplethMap
        states={statesData}
        metric="valorRecebido"
        label="Valor Recebido"
        format={(v) => BRL.format(v)}
        colorRange={[...colorScales.blue]}
        isStatic
      />
    </div>
  </div>

  <div class="row">
    <div class="cell span-2">
      <span class="label">Pequenos Multiplos por Porte</span>
      <TierSmallMultiples
        tiers={tierData}
        cities={tierCities}
        initialState="MG"
      />
    </div>
  </div>
</div>

<style>
  .overview {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 32px;
    font-family: 'Space Grotesk', system-ui, sans-serif;
  }

  .category-title {
    font-size: 18px;
    font-weight: 700;
    color: #4a3347;
    letter-spacing: 0.02em;
    border-bottom: 2px solid #d4c5d0;
    padding-bottom: 8px;
    margin: 16px 0 0 0;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .cell {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .cell.span-2 {
    grid-column: span 2;
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    color: #8a6d84;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .big-number-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .big-number-wrapper.column {
    flex-direction: column;
    gap: 32px;
    min-height: auto;
    padding: 24px 0;
  }
</style>
