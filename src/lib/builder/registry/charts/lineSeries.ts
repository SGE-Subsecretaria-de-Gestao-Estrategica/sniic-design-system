import {
  LINE_SERIES_DEFAULTS,
  lineSeriesLayout,
} from "$lib/core/layouts/lineSeries";
import {
  ACCENT_END_OPTION,
  END_VALUE_OPTION,
  HIGHLIGHT_OPTION,
  MANUAL,
  readEndValue,
  readStringList,
  readToggle,
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
    {
      id: "panel",
      label: "Painéis (um gráfico por valor)",
      accepts: ["text"],
      required: false,
    },
  ],
  keys: ["panel", "series", "x"],
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
    {
      id: "panelGap",
      label: "Espaço entre os painéis, quando houver (px)",
      min: 0,
      max: 80,
      step: 2,
      default: LINE_SERIES_DEFAULTS.panelGap,
    },
  ],
  sizing: { width: "free", height: "free" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 320 },
  // Short strips (a sparkline-like line, a thin band of ribbons) fit the page.
  minSize: { height: 80 },
  margin: "right",
  build: (rows, { read, box, options, params }) => {
    const getX = read.x("x");
    const paneled = read.has("panel");
    return lineSeriesLayout(rows, {
      getX,
      getY: read.number("y"),
      getSeries: read.has("series") ? read.text("series") : undefined,
      getPanel: paneled ? read.text("panel") : undefined,
      panelOrder:
        options.panelSort === MANUAL
          ? readStringList(options, "panelOrder")
          : undefined,
      shareY: readToggle(options, "panelSharedY", true),
      panelGap: params.panelGap,
      width: box.width,
      height: box.height,
      breaksAfter: raisBreaksAfter(options, rows, getX),
      yPaddingRatio: params.yPaddingRatio,
      valueLabelGap: params.valueLabelGap,
      endLabelGap: params.endLabelGap,
      endLabels: readEndValue(options),
    });
  },
  options: [
    valueLabelsOption("ends"),
    END_VALUE_OPTION,
    HIGHLIGHT_OPTION,
    ACCENT_END_OPTION,
    RAIS_BREAK_OPTION,
    {
      id: "seriesColors",
      step: "style",
      drawingOnly: true,
      label: "Cor de cada série",
      kind: "colors",
      whenMapped: "series",
      automatic: "lines",
      // One entry per name: a series has one colour in every panel.
      current: (layout) => [...new Set(layout.series.map((s) => s.name))],
    },
    {
      id: "panelSharedY",
      step: "style",
      label: "Mesma escala vertical em todos os painéis",
      kind: "toggle",
      default: true,
      whenMapped: "panel",
    },
    {
      id: "panelSort",
      step: "style",
      label: "Ordem dos painéis (de cima para baixo)",
      kind: "choice",
      whenMapped: "panel",
      choices: [
        { value: "file", label: "Ordem do arquivo" },
        { value: MANUAL, label: "Ordem manual" },
      ],
      default: "file",
    },
    {
      id: "panelOrder",
      step: "style",
      label: "Ordem manual",
      kind: "order",
      whenMapped: "panel",
      when: { option: "panelSort", equals: MANUAL },
      current: (layout) => layout.panels.map((panel) => panel.key),
    },
  ],
});
