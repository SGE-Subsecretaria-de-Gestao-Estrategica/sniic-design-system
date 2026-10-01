/**
 * Dados ilustrativos das stories de Cultura em Números.
 *
 * As bases não carregam dados: as figuras publicadas, com os números de
 * verdade, vivem nos repositórios de cada eixo. Aqui só se gera o bastante
 * para cada base desenhar algo plausível — determinístico, para o Chromatic e
 * o SVG exportado não mudarem a cada render.
 */

import { UFS } from '$lib/components/eixo1/mapaUf';
import type {
  BarrasCascataDatum,
  BolhasMatrizLinha,
  CristaDensidade,
  PontosPainel,
  CurvaConcentracaoPonto,
  LinhasPainel,
  ColunasDatum,
  BarrasDivergentesDatum,
  LinhasAntesDepoisDatum,
  BarrasRankingDatum,
  BolhasComparadasDatum,
  LinhaParticipacaoDatum,
  LinhasComparadasDatum,
  LinhasDiferencaDatum,
} from '$lib/components/eixo6/data';

export { UFS };

/** Gerador pseudoaleatório com semente (mulberry32): mesmo número, mesma saída. */
export function sorteio(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Um valor por UF entre `min` e `max`, estável para a mesma semente. */
export function valoresPorUf(semente: number, min: number, max: number) {
  const r = sorteio(semente);
  return UFS.map((uf) => ({ uf, valor: Math.round(min + r() * (max - min)) }));
}

const decimal1 = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const pct = (v: number) => `${Math.round(v)}%`;
export const pct1 = (v: number) => `${decimal1.format(v)}%`;
export const bi = (v: number) => `R$ ${decimal1.format(v)} bi`;

export const FONTE = 'Fonte: dados ilustrativos.';

// ---------------------------------------------------------------------------
// Gráficos interativos controlados por etapa (nascidos no Eixo 6)
// ---------------------------------------------------------------------------

/** Ano em que a série ilustrativa muda de metodologia. */
export const QUEBRA = 2022;

/** Uma contagem anual e a participação dela num total (0–1). */
export const serieComParticipacao: LinhaParticipacaoDatum[] = [
  [2015, 5.62e6, 0.0631],
  [2016, 5.48e6, 0.0622],
  [2017, 5.51e6, 0.0619],
  [2018, 5.69e6, 0.0628],
  [2019, 5.88e6, 0.0637],
  [2020, 5.21e6, 0.0601],
  [2021, 5.74e6, 0.0624],
  [2022, 6.41e6, 0.0668],
  [2023, 6.73e6, 0.0681],
  [2024, 6.98e6, 0.0694],
].map(([year, value, share]) => ({ year, value, share }));

/** Quatro grupos na mesma escala; o primeiro é o destacado. */
export const GRUPO_DESTAQUE = 'Grupo A';
export const gruposPorAno: LinhasComparadasDatum[] = (
  [
    [GRUPO_DESTAQUE, 5.4e6, 0.035],
    ['Grupo B', 8.9e6, 0.012],
    ['Grupo C', 3.1e6, 0.021],
    ['Grupo D', 1.8e6, -0.008],
  ] as const
).flatMap(([group, base, ritmo]) =>
  Array.from({ length: 10 }, (_, i) => ({
    group,
    year: 2016 + i,
    value: Math.round(base * (1 + ritmo) ** i * (2016 + i >= QUEBRA ? 1.06 : 1)),
  })),
);

/** Uma taxa (0–1) para o grupo destacado e para a referência. */
export const REFERENCIA = 'Referência';
export const taxasPorAno: LinhasDiferencaDatum[] = [
  [2016, 0.452, 0.389],
  [2017, 0.461, 0.402],
  [2018, 0.468, 0.411],
  [2019, 0.474, 0.416],
  [2020, 0.441, 0.383],
  [2021, 0.463, 0.401],
  [2022, 0.471, 0.394],
  [2023, 0.466, 0.389],
  [2024, 0.459, 0.383],
].flatMap(([year, a, ref]) => [
  { group: GRUPO_DESTAQUE, year, value: a },
  { group: REFERENCIA, year, value: ref },
]);

/** A mesma repartição em dois escopos — o grupo e a referência. */
export const ESCOPOS = { grupo: GRUPO_DESTAQUE, referencia: REFERENCIA };
export const composicaoEmDoisEscopos: BolhasComparadasDatum[] = (
  [
    ['Categoria 1', 0.448, 0.461],
    ['Categoria 2', 0.392, 0.418],
    ['Categoria 3', 0.104, 0.081],
    ['Categoria 4', 0.031, 0.019],
    ['Categoria 5', 0.009, 0.007],
    ['Sem informação', 0.016, 0.014],
  ] as const
).flatMap(([category, grupo, ref]) => [
  { scope: 'grupo' as const, category, share: grupo },
  { scope: 'referencia' as const, category, share: ref },
]);

/** Categorias com valores de ordens de grandeza diferentes, até uma fatia. */
export const ranking: BarrasRankingDatum[] = [
  { label: 'Categoria com um nome mais longo que quebra', value: 1_004_000 },
  { label: 'Categoria B, também em duas linhas', value: 237_000 },
  { label: 'Categoria C', value: 236_000 },
  { label: 'Categoria D', value: 191_000 },
  { label: 'Categoria E', value: 87_000 },
  { label: 'Categoria F', value: 62_000 },
  { label: 'Categoria G, outra de nome longo', value: 49_000 },
  { label: 'Categoria H', value: 46_000 },
  { label: 'Categoria I', value: 9_000 },
];

/** Duas parcelas por grupo, em direções opostas; a da direita domina em todos. */
export const divergentes: BarrasDivergentesDatum[] = [
  { label: 'Grupo A', left: 12_800, right: 41_200 },
  { label: 'Grupo B', left: 10_100, right: 46_500 },
  { label: 'Grupo C, com um nome que quebra em duas linhas', left: 15_400, right: 38_900 },
  { label: 'Grupo D', left: 17_900, right: 35_700 },
  { label: 'Grupo E', left: 19_600, right: 33_100 },
  { label: 'Grupo F', left: 2_300, right: 6_100 },
];

/** A mesma medida em dois momentos (%): sobe, cai, e uma que não muda. */
export const antesDepois: LinhasAntesDepoisDatum[] = [
  { label: 'Categoria A', before: 59.3, after: 63.0 },
  { label: 'Categoria B', before: 85.2, after: 81.5 },
  { label: 'Categoria C, com um nome que quebra em duas linhas', before: 40.7, after: 48.1 },
  { label: 'Categoria D', before: 77.8, after: 77.8 },
  { label: 'Categoria E', before: 22.4, after: 35.9 },
  { label: 'Categoria F', before: 12.1, after: 9.6 },
];

/** Um estoque de partida, três variações (uma negativa, uma agregada) e o de chegada. */
export const cascata: BarrasCascataDatum[] = [
  { label: 'Estoque inicial', value: 2.4e9, type: 'base' },
  { label: 'Variação A', value: 1.3e9, type: 'delta' },
  { label: 'Variação B', value: 1.4e9, type: 'delta', detail: ['B1 0,7 · B2 0,5', 'B3 0,2'] },
  { label: 'Variação C', value: -0.3e9, type: 'delta' },
  { label: 'Estoque final', value: 4.8e9, type: 'total' },
];

/** Cinco categorias, três séries em valor absoluto (R$ bilhões). */
export const colunasCategoria: ColunasDatum[] = [
  { label: 'Categoria 1', values: { a: 6.1, b: 4.2, c: 0.3 } },
  { label: 'Categoria 2', values: { a: 9.4, b: 8.8, c: 0.6 } },
  { label: 'Categoria 3', values: { a: 11.2, b: 10.5, c: 0.9 } },
  { label: 'Categoria 4', values: { a: 7.3, b: 9.1, c: 4.4 } },
  { label: 'Categoria 5', values: { a: 8.0, b: 8.6, c: 9.7 } },
];

/** Três categorias ao longo das ondas, em participação (%). */
export const composicaoPorAno: ColunasDatum[] = [
  ['2006', 4.2, 72.5, 23.3],
  ['2009', 7.8, 71.1, 21.1],
  ['2012', 10.4, 69.3, 20.3],
  ['2014', 13.6, 66.8, 19.6],
  ['2018', 17.9, 64.0, 18.1],
  ['2021', 21.3, 61.2, 17.5],
].map(([label, a, b, c]) => ({ label: String(label), values: { a: Number(a), b: Number(b), c: Number(c) } }));

/** Quatro fontes que se revezam: a ordem muda de um ano para o outro. */
export const fontesPorAno: ColunasDatum[] = [
  { label: '2019', values: { a: 2.4, b: 0, c: 0, d: 0 } },
  { label: '2020', values: { a: 2.1, b: 1.2, c: 0, d: 0 } },
  { label: '2021', values: { a: 2.6, b: 0.5, c: 0, d: 0 } },
  { label: '2022', values: { a: 3.2, b: 0, c: 0, d: 0 } },
  { label: '2023', values: { a: 3.5, b: 0, c: 2.1, d: 0 } },
  { label: '2024', values: { a: 3.7, b: 0, c: 0.4, d: 0.6 } },
];

/** Três séries pares em três medições (%): cada uma com cor própria. */
export const seriesPorAno: LinhasComparadasDatum[] = (
  [
    ['Série A', [81, 93, 100]],
    ['Série B', [59, 70, 78]],
    ['Série C', [30, 44, 56]],
  ] as const
).flatMap(([group, values]) =>
  [2014, 2018, 2021].map((year, i) => ({ group, year, value: values[i] })),
);

/** Cinco grupos em seis medições, e a referência que se repete em cada painel. */
export const paineisAnos = [2006, 2009, 2012, 2014, 2018, 2021];
export const paineis: LinhasPainel[] = [
  { label: 'Grupo A', values: [2, 4, 7, 9, 13, 16], note: '450 unidades' },
  { label: 'Grupo B', values: [3, 5, 9, 12, 17, 21], note: '1.794 unidades' },
  { label: 'Grupo C', values: [2, 3, 6, 8, 11, 14], note: '467 unidades' },
  { label: 'Grupo D', values: [4, 7, 11, 14, 18, 22], note: '1.668 unidades' },
  { label: 'Grupo E', values: [3, 6, null, 13, 19, 25], note: '1.191 unidades' },
];
export const paineisReferencia = [3, 5, 9, 12, 16, 20];

/** Curva de Lorenz de potência, `L(p) = p^4,5`. */
export const lorenz: CurvaConcentracaoPonto[] = Array.from({ length: 101 }, (_, p) => [
  p,
  100 * (p / 100) ** 4.5,
]);
export const parcelaDoTopo = (topo: number) => 100 - 100 * ((100 - topo) / 100) ** 4.5;

/** Cinco categorias de 2003 a 2025: entradas, saídas e uma que vale dois anos só. */
export const participacaoPorAno: ColunasDatum[] = Array.from({ length: 23 }, (_, i) => {
  const ano = 2003 + i;
  return {
    label: String(ano),
    values: {
      a: 1.2 + 0.08 * i,
      b: ano >= 2006 ? 1.0 + 0.06 * (ano - 2006) : 0,
      c: ano >= 2006 ? 0.5 + 0.03 * (ano - 2006) : 0,
      d: ano === 2020 ? 3.9 : ano === 2021 ? 0.6 : 0,
      e: ano >= 2023 ? 3.6 : 0,
    },
  };
});

/** Quatro grupos por quatro classes (%): cada linha soma 100. */
export const matrizColunas = ['Classe 0', 'Classe 1', 'Classe 2', 'Classe 3'];
export const matrizLinhas: BolhasMatrizLinha[] = [
  { label: 'Grupo A', note: '412 unidades', values: [41.3, 32.0, 17.5, 9.2] },
  { label: 'Grupo B', note: '1.388 unidades', values: [38.6, 31.4, 19.1, 10.9] },
  { label: 'Grupo C', note: '2.217 unidades', values: [36.2, 30.9, 20.6, 12.3] },
  { label: 'Grupo D', note: '1.524 unidades', values: [34.8, 30.1, 21.7, 13.4] },
];

/** 600 unidades, repartidas de quatro maneiras. */
export const pontosPaineis: PontosPainel[] = [
  { title: 'Painel 1', slices: [{ label: 'Categoria A', n: 330 }, { label: 'Categoria B', n: 246 }, { label: 'Categoria C', n: 24 }] },
  { title: 'Painel 2', slices: [{ label: 'Categoria A', n: 357 }, { label: 'Categoria B', n: 198 }, { label: 'Categoria C', n: 30 }, { label: 'Categoria D', n: 15 }] },
  { title: 'Painel 3', slices: [{ label: 'Categoria A', n: 400 }, { label: 'Categoria B', n: 200 }] },
  { title: 'Painel 4', slices: [{ label: 'Categoria A', n: 180 }, { label: 'Categoria B', n: 156 }, { label: 'Categoria C', n: 104 }, { label: 'Categoria D', n: 88 }, { label: 'Categoria E', n: 72 }] },
];

/** Densidade lognormal de 0 a `xMax` em `grade` pontos. */
function lognormal(mediana: number, dispersao: number, xMax: number, grade = 161) {
  const mu = Math.log(mediana);
  return Array.from({ length: grade }, (_, i) => {
    const x = (i / (grade - 1)) * xMax;
    return x === 0 ? 0 : Math.exp(-((Math.log(x) - mu) ** 2) / (2 * dispersao ** 2)) / x;
  });
}

/** A parte da densidade além da referência, em %. */
function alemDe(densidade: number[], referencia: number, xMax: number) {
  const total = densidade.reduce((a, b) => a + b, 0);
  const i0 = Math.round((referencia / xMax) * (densidade.length - 1));
  return (100 * densidade.slice(i0).reduce((a, b) => a + b, 0)) / total;
}

export const CRISTAS_XMAX = 8;
export const CRISTAS_REFERENCIA = 2;
export const cristas: CristaDensidade[] = [
  ['Grupo A', '1.794 unidades', 1.9, 0.55],
  ['Grupo B', '450 unidades', 1.6, 0.6],
  ['Grupo C', '467 unidades', 1.3, 0.65],
  ['Grupo D', '1.668 unidades', 1.1, 0.7],
  ['Grupo E', '1.191 unidades', 1.0, 0.7],
].map(([label, note, mediana, dispersao]) => {
  const density = lognormal(Number(mediana), Number(dispersao), CRISTAS_XMAX);
  return {
    label: String(label),
    note: String(note),
    density,
    value: `${alemDe(density, CRISTAS_REFERENCIA, CRISTAS_XMAX).toFixed(1).replace('.', ',')}%`,
  };
});
