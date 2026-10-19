import {
  RANKED_RIBBONS_DEFAULTS,
  rankedRibbonsLayout,
  type RankDirection,
} from "$lib/core/layouts/rankedRibbons";
import wrappedLineCount from "$lib/core/utils/wrappedLineCount";
import {
  MANUAL,
  readChoice,
  readStringList,
  readToggle,
  valueLabelsOption,
} from "../options";
import type { JsonValue } from "../../spec/types";
import { RAIS_BREAK_OPTION, raisBreaksAfter } from "../rais";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

const RANK_DIRECTIONS: readonly RankDirection[] = [
  "largestOnTop",
  "largestAtBottom",
];

/** The stack's order for the layout: ranked one way or the other, or fixed (file or manual order). */
function readStacking(options: Record<string, JsonValue>) {
  const ranked = readToggle(options, "ranked", true);
  return {
    ranked,
    rankDirection: readChoice(
      options,
      "rankDirection",
      RANK_DIRECTIONS,
      "largestOnTop",
    ),
    stackOrder:
      !ranked && options.stackSort === MANUAL
        ? readStringList(options, "stackOrder")
        : undefined,
  };
}

export const rankedRibbonsChart = defineChart({
  id: "rankedRibbons",
  label: "Fitas ranqueadas",
  group: "lines",
  channels: [
    { id: "x", label: "Eixo X", accepts: ["date", "number"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
    { id: "series", label: "Série", accepts: ["text"], required: true },
  ],
  keys: ["series", "x"],
  measures: ["value"],
  params: [
    {
      id: "ribbonGap",
      label: "Espaço entre fitas (px)",
      min: 0,
      max: 24,
      step: 1,
      default: RANKED_RIBBONS_DEFAULTS.ribbonGap,
    },
    {
      id: "plateau",
      label: "Trecho reto em cada ano (× passo)",
      min: 0,
      max: 0.45,
      step: 0.01,
      default: RANKED_RIBBONS_DEFAULTS.plateau,
    },
  ],
  sizing: { width: "free", height: "free" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 320 },
  margin: "right",
  build: (rows, { read, box, margin, options, params, warn }) => {
    const getX = read.x("x");
    const getValue = read.number("value");
    const negatives = rows.filter((row) => getValue(row) < 0).length;
    if (negatives) {
      warn(
        negatives === 1
          ? "1 valor negativo foi tratado como zero: as fitas só empilham valores positivos."
          : `${negatives} valores negativos foram tratados como zero: as fitas só empilham valores positivos.`,
      );
    }
    // The names wrap in the right margin, past the gap to the plot.
    const nameWidth = margin.right - RANKED_RIBBONS_DEFAULTS.endLabelGap;
    return rankedRibbonsLayout(rows, {
      getX,
      getY: getValue,
      getSeries: read.text("series"),
      width: box.width,
      height: box.height,
      breaksAfter: raisBreaksAfter(options, rows, getX),
      ...readStacking(options),
      totals: readToggle(options, "totals"),
      ribbonGap: params.ribbonGap,
      plateau: params.plateau,
      endNameLines: (series) => wrappedLineCount(series, nameWidth),
    });
  },
  options: [
    {
      id: "ranked",
      step: "style",
      label: "Ranquear as fitas em cada ano",
      kind: "toggle",
      default: true,
    },
    {
      id: "rankDirection",
      step: "style",
      label: "Maior valor de cada ano",
      kind: "choice",
      when: { option: "ranked", equals: true },
      choices: [
        { value: "largestOnTop", label: "No topo" },
        { value: "largestAtBottom", label: "Embaixo" },
      ],
      default: "largestOnTop",
    },
    {
      id: "stackSort",
      step: "style",
      label: "Ordem das fitas (de cima para baixo)",
      kind: "choice",
      when: { option: "ranked", equals: false },
      choices: [
        { value: "file", label: "Ordem do arquivo" },
        { value: MANUAL, label: "Ordem manual" },
      ],
      default: "file",
    },
    {
      id: "stackOrder",
      step: "style",
      label: "Ordem manual",
      kind: "order",
      when: { option: "stackSort", equals: MANUAL },
      current: (layout) => layout.stackOrder,
    },
    valueLabelsOption("all"),
    {
      id: "totals",
      step: "style",
      label: "Mostrar o total de cada ano",
      kind: "toggle",
    },
    {
      id: "seriesColors",
      step: "style",
      drawingOnly: true,
      label: "Cor de cada fita",
      kind: "colors",
      current: (layout) => layout.series,
      // As stacked in the last year, top to bottom, where the end labels sit.
      listed: (layout) =>
        layout.columns.at(-1)?.slots.map((slot) => slot.series).reverse() ??
        layout.series,
    },
    RAIS_BREAK_OPTION,
  ],
});
