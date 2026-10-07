import {
  LINE_SERIES_DEFAULTS,
  lineSeriesLayout,
} from "$lib/core/layouts/lineSeries";
import {
  ACCENT_END_OPTION,
  HIGHLIGHT_OPTION,
  valueLabelsOption,
} from "../options";
import { RAIS_BREAK_OPTION, raisBreaksAfter } from "../rais";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

export const lineSeriesChart = defineChart({
  id: "lineSeries",
  label: "Linhas",
  group: "lines",
  channels: [
    { id: "x", label: "Eixo X", accepts: ["date", "number"], required: true },
    { id: "y", label: "Valor", accepts: ["number"], required: true },
    { id: "series", label: "Série", accepts: ["text"], required: false },
  ],
  keys: ["series", "x"],
  measures: ["y"],
  params: [
    {
      id: "yPaddingRatio",
      label: "Folga acima e abaixo das linhas (× amplitude)",
      min: 0,
      max: 1,
      step: 0.05,
      default: LINE_SERIES_DEFAULTS.yPaddingRatio,
    },
    {
      id: "valueLabelGap",
      label: "Distância entre ponto e valor (px)",
      min: 0,
      max: 32,
      step: 1,
      default: LINE_SERIES_DEFAULTS.valueLabelGap,
    },
    {
      id: "endLabelGap",
      label: "Distância entre o último ponto e o nome (px)",
      min: 0,
      max: 32,
      step: 1,
      default: LINE_SERIES_DEFAULTS.endLabelGap,
    },
  ],
  sizing: { width: "free", height: "free" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 320 },
  margin: "right",
  build: (rows, { read, box, options, params }) => {
    const getX = read.x("x");
    return lineSeriesLayout(rows, {
      getX,
      getY: read.number("y"),
      getSeries: read.has("series") ? read.text("series") : undefined,
      width: box.width,
      height: box.height,
      breaksAfter: raisBreaksAfter(options, rows, getX),
      yPaddingRatio: params.yPaddingRatio,
      valueLabelGap: params.valueLabelGap,
      endLabelGap: params.endLabelGap,
    });
  },
  options: [
    valueLabelsOption("ends"),
    HIGHLIGHT_OPTION,
    ACCENT_END_OPTION,
    RAIS_BREAK_OPTION,
  ],
});
