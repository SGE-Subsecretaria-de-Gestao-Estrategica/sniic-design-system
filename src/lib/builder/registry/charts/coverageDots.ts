import {
  COVERAGE_DOTS_DEFAULTS,
  coverageDotsLayout,
  rowThicknessFor,
} from "$lib/core/layouts/coverageDots";
import { MIN_BAND_THICKNESS } from "../fit";
import {
  CATEGORY_ORDER_OPTION,
  readNumber,
  readOrdering,
  SORT_OPTION,
} from "../options";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

export const coverageDotsChart = defineChart({
  id: "coverageDots",
  label: "Pontos de cobertura",
  group: "categories",
  channels: [
    { id: "category", label: "Categoria", accepts: ["text"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
    { id: "group", label: "Recorte", accepts: ["text"], required: false },
  ],
  keys: ["group", "category"],
  measures: ["value"],
  params: [
    {
      id: "rowThickness",
      label: "Altura das linhas (px)",
      min: 8,
      max: 80,
      step: 1,
      default: COVERAGE_DOTS_DEFAULTS.rowThickness,
      solvedBy: "height",
    },
    {
      id: "rowGapRatio",
      label: "Espaço entre linhas (× altura)",
      min: 0,
      max: 2,
      step: 0.05,
      default: COVERAGE_DOTS_DEFAULTS.rowGapRatio,
    },
    {
      id: "markerRadius",
      label: "Raio dos pontos (px)",
      min: 2,
      max: 20,
      step: 1,
      default: COVERAGE_DOTS_DEFAULTS.markerRadius,
    },
    {
      id: "insetEnd",
      label: "Recuo à direita, para os maiores valores (px)",
      min: 0,
      max: 160,
      step: 4,
      default: COVERAGE_DOTS_DEFAULTS.insetEnd,
    },
  ],
  sizing: { width: "free", height: "fitted" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 400 },
  margin: "left",
  build: (rows, { read, box, options, params, fit, warn, solved }) => {
    const getCategory = read.text("category");
    const getValue = read.number("value");
    const getGroup = read.has("group") ? read.text("group") : undefined;
    const reference = readNumber(options, "reference");

    let rowThickness = params.rowThickness;
    if (fit.height !== null) {
      const blocks = getGroup ? new Set(rows.map(getGroup)).size : 1;
      const fitted = rowThicknessFor(
        fit.height,
        { rows: rows.length, blocks, named: getGroup !== undefined, reference: reference !== undefined },
        { ...COVERAGE_DOTS_DEFAULTS, rowGapRatio: params.rowGapRatio },
      );
      if (fitted !== undefined) {
        if (fitted < MIN_BAND_THICKNESS) {
          warn(
            `Com esta altura cada linha fica com ${Math.round(fitted)} px. Aumente a altura ou reduza as categorias.`,
          );
        }
        solved("rowThickness", fitted);
        rowThickness = fitted;
      }
    }

    const layoutWith = (valueDomain?: [number | undefined, number | undefined]) =>
      coverageDotsLayout(rows, {
        getCategory,
        getValue,
        getGroup,
        width: box.width,
        reference,
        valueDomain,
        ...readOrdering(options),
        rowThickness,
        rowGapRatio: params.rowGapRatio,
        markerRadius: params.markerRadius,
        insetEnd: params.insetEnd,
      });

    // Empty ends stay automatic: near the data, reaching zero only if the data does.
    const domainMin = readNumber(options, "domainMin");
    const domainMax = readNumber(options, "domainMax");
    if (domainMin === undefined && domainMax === undefined) return layoutWith();

    const layout = layoutWith([domainMin, domainMax]);
    const [lo, hi] = layout.valueScale.domain();
    if (!(lo < hi)) {
      warn("O início do eixo precisa ser menor que o fim. O eixo voltou ao intervalo automático.");
      return layoutWith();
    }
    if (layout.rows.some((r) => r.value < lo || r.value > hi)) {
      warn("Há valores fora do intervalo do eixo: seus pontos ficam fora da área do gráfico.");
    }
    return layout;
  },
  options: [
    SORT_OPTION,
    {
      ...CATEGORY_ORDER_OPTION,
      current: (layout) => [...new Set(layout.rows.map((r) => r.category))],
    },
    {
      id: "reference",
      label: "Linha de referência",
      step: "style",
      kind: "number",
      note: "No número do arquivo: a média nacional, uma meta.",
    },
    {
      id: "referenceName",
      label: "Nome da linha de referência",
      step: "style",
      drawingOnly: true,
      kind: "text",
      placeholder: "Média do Brasil",
    },
    {
      id: "domainMin",
      label: "Início do eixo",
      step: "style",
      kind: "number",
      placeholder: "Automático",
      note: "Vazio: perto do menor valor. O eixo só parte do zero quando os dados chegam perto dele.",
    },
    {
      id: "domainMax",
      label: "Fim do eixo",
      step: "style",
      kind: "number",
      placeholder: "Automático",
      note: "Vazio: o maior valor, com uma folga. Use 100 para percentuais.",
    },
  ],
});
