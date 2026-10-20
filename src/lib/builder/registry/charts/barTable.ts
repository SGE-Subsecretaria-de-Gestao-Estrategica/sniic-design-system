import {
  BAR_TABLE_DEFAULTS,
  bandHeightFor,
  barTableLayout,
  columnWidth,
  type BarTableScale,
} from "$lib/core/layouts/barTable";
import { fitBandThickness } from "../fit";
import {
  CATEGORY_ORDER_OPTION,
  readChoice,
  readOrdering,
  readStringList,
  SORT_OPTION,
} from "../options";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

/** Below this a column can't hold a bar and its value. */
const MIN_COLUMN_WIDTH = 80;

const SCALES: readonly BarTableScale[] = ["shared", "independent"];

/** One row per category, one column of capsule bars per measure or source (Tabela com barras). */
export const barTableChart = defineChart({
  id: "barTable",
  label: "Tabela com barras",
  group: "categories",
  channels: [
    { id: "category", label: "Categoria", accepts: ["text"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
    {
      id: "column",
      label: "Coluna (medida ou fonte)",
      accepts: ["text"],
      required: true,
    },
  ],
  keys: ["column", "category"],
  measures: ["value"],
  params: [
    {
      id: "barThickness",
      label: "Espessura das barras (px)",
      min: 6,
      max: 48,
      step: 1,
      default: BAR_TABLE_DEFAULTS.barThickness,
      solvedBy: "height",
    },
    {
      id: "barGapRatio",
      label: "Espaço entre barras (× espessura)",
      min: 0,
      max: 2,
      step: 0.05,
      default: BAR_TABLE_DEFAULTS.barGapRatio,
    },
    {
      id: "columnGap",
      label: "Espaço entre colunas (px)",
      min: 0,
      max: 120,
      step: 2,
      default: BAR_TABLE_DEFAULTS.columnGap,
    },
    {
      id: "valueHeadroom",
      label: "Folga para os valores (× maior barra)",
      min: 1,
      max: 2.5,
      step: 0.05,
      default: BAR_TABLE_DEFAULTS.valueHeadroom,
    },
  ],
  sizing: { width: "free", height: "fitted" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 400 },
  margin: "left",
  build: (rows, { read, box, options, params, warn, ...fitting }) => {
    const getColumn = read.text("column");
    const getCategory = read.text("category");
    const width = columnWidth(
      new Set(rows.map(getColumn)).size,
      box.width,
      params.columnGap,
    );
    if (width < MIN_COLUMN_WIDTH) {
      warn(
        `Cada coluna fica com ${Math.round(width)} px de largura. Aumente a largura ou use menos colunas.`,
      );
    }
    // The height asked for, minus the headers, is what the rows fill.
    const fit = {
      ...fitting.fit,
      height:
        fitting.fit.height === null
          ? null
          : bandHeightFor(fitting.fit.height, BAR_TABLE_DEFAULTS.headerHeight),
    };
    const layout = barTableLayout(rows, {
      getColumn,
      getCategory,
      getValue: read.number("value"),
      width: box.width,
      ...readOrdering(options),
      columnOrder: readStringList(options, "columnOrder"),
      scale: readChoice(options, "scale", SCALES, "shared"),
      barThickness:
        fitBandThickness(
          new Set(rows.map(getCategory)).size,
          params.barGapRatio,
          "barThickness",
          { ...fitting, fit, warn },
        ) ?? params.barThickness,
      barGapRatio: params.barGapRatio,
      columnGap: params.columnGap,
      valueHeadroom: params.valueHeadroom,
    });
    if (layout.missing) {
      warn(
        layout.missing === 1
          ? "1 célula não tem valor: ela fica escrita como não informado."
          : `${layout.missing} células não têm valor: elas ficam escritas como não informado.`,
      );
    }
    return layout;
  },
  options: [
    {
      id: "scale",
      step: "style",
      label: "Escala das colunas",
      kind: "choice",
      choices: [
        {
          value: "shared",
          label: "A mesma em todas (mesma medida, fontes diferentes)",
        },
        {
          value: "independent",
          label: "Uma por coluna (medidas de unidades diferentes)",
        },
      ],
      default: "shared",
    },
    SORT_OPTION,
    {
      ...CATEGORY_ORDER_OPTION,
      current: (layout) => layout.rows.map((r) => r.category),
    },
    {
      id: "columnOrder",
      step: "style",
      label: "Ordem das colunas",
      kind: "order",
      current: (layout) => layout.columns.map((c) => c.key),
    },
  ],
});
