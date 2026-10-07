import {
  RANGE_ROWS_DEFAULTS,
  rangeRowsLayout,
} from "$lib/core/layouts/rangeRows";
import { fitBandThickness } from "../fit";
import { CATEGORY_ORDER_OPTION, readOrdering, SORT_OPTION } from "../options";
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
    const categories = new Set(rows.map(getCategory)).size;
    return rangeRowsLayout(rows, {
      getCategory,
      getGroup: read.text("group"),
      getValue: read.number("value"),
      width: box.width,
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
  },
  options: [
    SORT_OPTION,
    {
      ...CATEGORY_ORDER_OPTION,
      current: (layout) => layout.rows.map((r) => r.category),
    },
  ],
});
