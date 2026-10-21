import * as d3 from "d3";
import {
  HEATMAP_DEFAULTS,
  heatmapLayout,
} from "$lib/core/layouts/heatmap";
import { categoryKeys } from "../../encoding/keys";
import { MANUAL, readStringList, readToggle } from "../options";
import { defineChart } from "../registry";
import { BASE_RAMP_OPTIONS, PAIR_RAMP, rampKindOption } from "../ramps";
import { FULL_PAGE_WIDTH } from "../widths";

/** Room under the grid for the legend (its offset and its swatches). */
export const HEATMAP_LEGEND_ROOM = 32;

/** The automatic order, or a manual one: `${axis}Sort` + `${axis}Order`. */
function orderOptions(axis: "row" | "column", label: string) {
  return [
    {
      id: `${axis}Sort`,
      step: "style",
      label,
      kind: "choice",
      choices: [
        {
          value: "auto",
          label: "Do arquivo (números e datas em ordem crescente)",
        },
        { value: MANUAL, label: "Ordem manual" },
      ],
      default: "auto",
    },
    {
      id: `${axis}Order`,
      step: "style",
      label: "Ordem manual",
      kind: "order",
      when: { option: `${axis}Sort`, equals: MANUAL },
    },
  ] as const;
}

const [rowSort, rowOrder] = orderOptions("row", "Ordem das linhas");
const [columnSort, columnOrder] = orderOptions("column", "Ordem das colunas");

/**
 * A grid of rows × columns coloured by value, pivoted from tidy data: each
 * row of the file is one cell (rows repeating a pair are combined).
 */
export const heatmapChart = defineChart({
  id: "heatmap",
  label: "Mapa de calor",
  group: "categories",
  channels: [
    {
      id: "row",
      label: "Linhas",
      accepts: ["text", "number", "date"],
      required: true,
    },
    {
      id: "column",
      label: "Colunas",
      accepts: ["text", "number", "date"],
      required: true,
    },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
  ],
  keys: ["row", "column"],
  measures: ["value"],
  params: [
    {
      id: "steps",
      label: "Faixas de cor",
      min: 2,
      max: 9,
      step: 1,
      default: HEATMAP_DEFAULTS.steps,
    },
    {
      id: "cellGap",
      label: "Espaço entre as células (px)",
      min: 0,
      max: 12,
      step: 0.5,
      default: HEATMAP_DEFAULTS.cellGap,
    },
  ],
  sizing: { width: "free", height: "free" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 320 },
  margin: "left",
  extraMargin: { bottom: HEATMAP_LEGEND_ROOM },
  build: (rows, { read, box, options, params }) => {
    const row = categoryKeys(read, rows, "row");
    const column = categoryKeys(read, rows, "column");
    const getValue = read.number("value");
    const manual = (axis: "row" | "column") =>
      options[`${axis}Sort`] === MANUAL
        ? readStringList(options, `${axis}Order`)
        : undefined;
    const [min = 0, max = 0] = d3.extent(rows, getValue);
    return heatmapLayout(rows, {
      getRow: row.get,
      getColumn: column.get,
      getValue,
      width: box.width,
      height: box.height,
      // A manual order goes first; the automatic one keeps the rest in place.
      rowOrder: [...(manual("row") ?? []), ...(row.order ?? [])],
      columnOrder: [...(manual("column") ?? []), ...(column.order ?? [])],
      steps: params.steps,
      cellGap: params.cellGap,
      domain: readToggle(options, "fromMin")
        ? [min, max]
        : [Math.min(0, min), max],
    });
  },
  options: [
    rampKindOption("Entre uma cor do pilar e sua variante"),
    {
      id: "ramp",
      label: "Cor das faixas",
      step: "style",
      drawingOnly: true,
      when: PAIR_RAMP,
      kind: "choice",
      choices: [
        { value: "primary", label: "Primária → variante" },
        { value: "secondary", label: "Secundária → variante" },
      ],
      default: "primary",
    },
    {
      id: "rampOrder",
      label: "Sentido das cores (do menor para o maior valor)",
      step: "style",
      drawingOnly: true,
      when: PAIR_RAMP,
      kind: "choice",
      choices: [
        { value: "lightToDark", label: "Da mais clara para a mais escura" },
        { value: "toVariant", label: "Da cor para a variante" },
        { value: "fromVariant", label: "Da variante para a cor" },
      ],
      default: "lightToDark",
    },
    ...BASE_RAMP_OPTIONS,
    {
      id: "fromMin",
      label: "Começar a escala no menor valor, não no zero",
      step: "style",
      kind: "toggle",
    },
    {
      id: "showValues",
      label: "Escrever o valor em cada célula",
      step: "style",
      drawingOnly: true,
      kind: "toggle",
      default: true,
    },
    {
      id: "legendValues",
      label: "Mostrar o menor e o maior valor na legenda",
      step: "style",
      drawingOnly: true,
      kind: "toggle",
      default: true,
    },
    { ...rowSort },
    { ...rowOrder, current: (layout) => layout.rows.map((r) => r.key) },
    { ...columnSort },
    {
      ...columnOrder,
      current: (layout) => layout.columns.map((c) => c.key),
    },
  ],
});
