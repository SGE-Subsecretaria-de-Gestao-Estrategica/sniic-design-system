import {
  RANKED_RIBBONS_DEFAULTS,
  rankedRibbonsLayout,
} from "$lib/core/layouts/rankedRibbons";
import wrappedLineCount from "$lib/core/utils/wrappedLineCount";
import { readToggle, valueLabelsOption } from "../options";
import { RAIS_BREAK_OPTION, raisBreaksAfter } from "../rais";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

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
  build: (rows, { read, box, margin, options, params }) => {
    const getX = read.x("x");
    // The names wrap in the right margin, past the gap to the plot.
    const nameWidth = margin.right - RANKED_RIBBONS_DEFAULTS.endLabelGap;
    return rankedRibbonsLayout(rows, {
      getX,
      getY: read.number("value"),
      getSeries: read.text("series"),
      width: box.width,
      height: box.height,
      breaksAfter: raisBreaksAfter(options, rows, getX),
      totals: readToggle(options, "totals"),
      ribbonGap: params.ribbonGap,
      plateau: params.plateau,
      endNameLines: (series) => wrappedLineCount(series, nameWidth),
    });
  },
  options: [
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
      channel: "series",
    },
    RAIS_BREAK_OPTION,
  ],
});
