import {
  RANGE_ROWS_DEFAULTS,
  rangeRowsLayout,
} from "$lib/core/layouts/rangeRows";
import { fitBandThickness } from "../fit";
import {
  CATEGORY_ORDER_OPTION,
  readNumber,
  readOrdering,
  SORT_OPTION,
} from "../options";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

export const rangeRowsChart = defineChart({
  id: "rangeRows",
  label: "Intervalos",
  group: "categories",
  channels: [
    { id: "category", label: "Categoria", accepts: ["text"], required: true },
    { id: "group", label: "Grupo", accepts: ["text"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
  ],
  keys: ["category", "group"],
  measures: ["value"],
  params: [
    {
      id: "rowThickness",
      label: "Altura das linhas (px)",
      min: 8,
      max: 80,
      step: 1,
      default: RANGE_ROWS_DEFAULTS.rowThickness,
      solvedBy: "height",
    },
    {
      id: "rowGapRatio",
      label: "Espaço entre linhas (× altura)",
      min: 0,
      max: 2,
      step: 0.05,
      default: RANGE_ROWS_DEFAULTS.rowGapRatio,
    },
    {
      id: "markerRadius",
      label: "Raio dos marcadores (px)",
      min: 2,
      max: 24,
      step: 1,
      default: RANGE_ROWS_DEFAULTS.markerRadius,
    },
    {
      id: "insetStart",
      label: "Recuo à esquerda, para os menores valores (px)",
      min: 0,
      max: 160,
      step: 4,
      default: RANGE_ROWS_DEFAULTS.insetStart,
    },
    {
      id: "insetEnd",
      label: "Recuo à direita, para os maiores valores (px)",
      min: 0,
      max: 160,
      step: 4,
      default: RANGE_ROWS_DEFAULTS.insetEnd,
    },
  ],
  sizing: { width: "free", height: "fitted" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 400 },
  margin: "left",
  extraMargin: { top: 24 },
  build: (rows, { read, box, options, params, ...fitting }) => {
    const getCategory = read.text("category");
    const getValue = read.number("value");
    const categories = new Set(rows.map(getCategory)).size;
    const layoutWith = (valueDomain?: [number | undefined, number | undefined]) =>
      rangeRowsLayout(rows, {
        getCategory,
        getGroup: read.text("group"),
        getValue,
        width: box.width,
        valueDomain,
        ...readOrdering(options),
        rowThickness:
          fitBandThickness(
            categories,
            params.rowGapRatio,
            "rowThickness",
            fitting,
          ) ?? params.rowThickness,
        rowGapRatio: params.rowGapRatio,
        markerRadius: params.markerRadius,
        insetStart: params.insetStart,
        insetEnd: params.insetEnd,
      });

    // Empty ends stay automatic: the data's extent, padded.
    const domainMin = readNumber(options, "domainMin");
    const domainMax = readNumber(options, "domainMax");
    if (domainMin === undefined && domainMax === undefined) return layoutWith();

    const layout = layoutWith([domainMin, domainMax]);
    const [lo, hi] = layout.valueScale.domain();
    if (!(lo < hi)) {
      fitting.warn(
        "O início do eixo precisa ser menor que o fim. O eixo voltou ao intervalo automático.",
      );
      return layoutWith();
    }
    const values = rows.map(getValue);
    if (values.some((v) => v < lo || v > hi)) {
      fitting.warn(
        "Há valores fora do intervalo do eixo: seus marcadores ficam fora da área do gráfico.",
      );
    }
    return layout;
  },
  options: [
    SORT_OPTION,
    {
      ...CATEGORY_ORDER_OPTION,
      current: (layout) => layout.rows.map((r) => r.category),
    },
    {
      id: "domainMin",
      label: "Início do eixo",
      step: "style",
      kind: "number",
      placeholder: "Automático",
      note: "Vazio: o menor valor, com uma folga.",
    },
    {
      id: "domainMax",
      label: "Fim do eixo",
      step: "style",
      kind: "number",
      placeholder: "Automático",
      note: "Vazio: o maior valor, com uma folga.",
    },
  ],
});
