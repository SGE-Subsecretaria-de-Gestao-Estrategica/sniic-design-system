import {
  PARTITION_BARS_DEFAULTS,
  partitionBarsLayout,
} from "$lib/core/layouts/partitionBars";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

export const partitionBarsChart = defineChart({
  id: "partitionBars",
  label: "Barra de partição",
  group: "categories",
  channels: [
    { id: "part", label: "Parte", accepts: ["text"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
    { id: "subpart", label: "Pedaço da parte", accepts: ["text"], required: false },
    { id: "category", label: "Todo", accepts: ["text"], required: false },
  ],
  keys: ["category", "part", "subpart"],
  measures: ["value"],
  params: [
    {
      id: "barThickness",
      label: "Espessura das barras das partes (px)",
      min: 8,
      max: 80,
      step: 1,
      default: PARTITION_BARS_DEFAULTS.barThickness,
    },
    {
      id: "pieceThickness",
      label: "Espessura das barras dos pedaços (px)",
      min: 4,
      max: 80,
      step: 1,
      default: PARTITION_BARS_DEFAULTS.pieceThickness,
    },
    {
      id: "rowGap",
      label: "Espaço entre partes (px)",
      min: 0,
      max: 80,
      step: 2,
      default: PARTITION_BARS_DEFAULTS.rowGap,
    },
    {
      id: "valueSpace",
      label: "Espaço para os valores, à direita (px)",
      min: 32,
      max: 240,
      step: 4,
      default: PARTITION_BARS_DEFAULTS.valueSpace,
    },
  ],
  sizing: { width: "free", height: "derived" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 240 },
  margin: "left",
  build: (rows, { read, box, params }) =>
    partitionBarsLayout(rows, {
      getPart: read.text("part"),
      getValue: read.number("value"),
      getSubpart: read.has("subpart") ? read.text("subpart") : undefined,
      getCategory: read.has("category") ? read.text("category") : undefined,
      width: box.width,
      barThickness: params.barThickness,
      pieceThickness: params.pieceThickness,
      rowGap: params.rowGap,
      valueSpace: params.valueSpace,
    }),
  options: [
    {
      id: "pieceSuffix",
      label: "Texto depois do percentual de cada pedaço",
      step: "style",
      drawingOnly: true,
      kind: "text",
      placeholder: "da parte",
    },
  ],
});
