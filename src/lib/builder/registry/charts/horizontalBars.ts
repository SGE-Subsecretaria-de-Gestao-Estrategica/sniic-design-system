import {
  HORIZONTAL_BARS_DEFAULTS,
  horizontalBarsLayout,
} from "$lib/core/layouts/horizontalBars";
import { fitBandThickness } from "../fit";
import { CATEGORY_ORDER_OPTION, readOrdering, SORT_OPTION } from "../options";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

export const horizontalBarsChart = defineChart({
  id: "horizontalBars",
  label: "Barras horizontais",
  group: "categories",
  channels: [
    { id: "category", label: "Categoria", accepts: ["text"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
  ],
  keys: ["category"],
  measures: ["value"],
  params: [
    {
      id: "barThickness",
      label: "Espessura das barras (px)",
      min: 8,
      max: 80,
      step: 1,
      default: HORIZONTAL_BARS_DEFAULTS.barThickness,
      solvedBy: "height",
    },
    {
      id: "barGapRatio",
      label: "Espaço entre barras (× espessura)",
      min: 0,
      max: 2,
      step: 0.05,
      default: HORIZONTAL_BARS_DEFAULTS.barGapRatio,
    },
    {
      id: "valueHeadroom",
      label: "Folga para os valores (× maior barra)",
      min: 1,
      max: 2,
      step: 0.05,
      default: HORIZONTAL_BARS_DEFAULTS.valueHeadroom,
    },
  ],
  sizing: { width: "free", height: "fitted" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 400 },
  margin: "left",
  build: (rows, { read, box, options, params, ...fitting }) =>
    horizontalBarsLayout(rows, {
      getCategory: read.text("category"),
      getValue: read.number("value"),
      width: box.width,
      ...readOrdering(options),
      barThickness:
        fitBandThickness(
          rows.length,
          params.barGapRatio,
          "barThickness",
          fitting,
        ) ?? params.barThickness,
      barGapRatio: params.barGapRatio,
      valueHeadroom: params.valueHeadroom,
    }),
  options: [
    SORT_OPTION,
    {
      ...CATEGORY_ORDER_OPTION,
      current: (layout) => layout.bars.map((b) => b.category),
    },
  ],
});
