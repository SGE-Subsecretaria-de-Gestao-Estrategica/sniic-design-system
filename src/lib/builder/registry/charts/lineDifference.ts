import {
  DIFFERENCE_STEMS_DEFAULTS,
  differenceStemsLayout,
} from "$lib/core/layouts/differenceStems";
import { lineSeriesLayout } from "$lib/core/layouts/lineSeries";
import {
  STACK_PANELS_DEFAULTS,
  stackPanelsLayout,
} from "$lib/core/layouts/stackPanels";
import { ACCENT_END_OPTION, readText, valueLabelsOption } from "../options";
import { RAIS_BREAK_OPTION, raisBreaksAfter } from "../rais";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

/** Two lines over the difference between them, on the same x axis (G6.08). */
export const lineDifferenceChart = defineChart({
  id: "lineDifference",
  label: "Linhas com diferença",
  description:
    "Duas séries no tempo e, abaixo delas, a diferença entre as duas em cada ponto.",
  channels: [
    { id: "x", label: "Eixo X", accepts: ["date", "number"], required: true },
    { id: "y", label: "Valor", accepts: ["number"], required: true },
    { id: "series", label: "Série (duas)", accepts: ["text"], required: true },
  ],
  keys: ["series", "x"],
  measures: ["y"],
  params: [
    {
      id: "linePanelShare",
      label: "Parte da altura para as linhas (0 a 1)",
      min: 0.3,
      max: 0.9,
      step: 0.05,
      default: 0.8,
    },
    {
      id: "panelGap",
      label: "Espaço entre os painéis (px)",
      min: 0,
      max: 80,
      step: 2,
      default: STACK_PANELS_DEFAULTS.gap,
    },
    {
      id: "stemWidth",
      label: "Espessura das hastes (px)",
      min: 1,
      max: 12,
      step: 0.5,
      default: DIFFERENCE_STEMS_DEFAULTS.stemWidth,
    },
  ],
  formats: [{ id: "difference", label: "Formato da diferença" }],
  sizing: { width: "free", height: "free" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 240 },
  margin: "namesRight",
  build: (rows, { read, box, options, params }) => {
    const getX = read.x("x");
    const getY = read.number("y");
    const getSeries = read.text("series");
    const names = [...new Set(rows.map(getSeries))];
    if (names.length !== 2) {
      throw new Error(
        `Este gráfico compara exatamente duas séries; a coluna escolhida tem ${names.length}.`,
      );
    }
    // A stored minuend may be gone after the data or mapping changed.
    const chosen = readText(options, "minuend");
    const minuend = chosen && names.includes(chosen) ? chosen : names[0];
    const subtrahend = names.find((name) => name !== minuend)!;

    const panels = stackPanelsLayout(
      [
        { key: "line", share: params.linePanelShare },
        { key: "diff", share: 1 - params.linePanelShare },
      ],
      { ...box, gap: params.panelGap },
    );
    const line = lineSeriesLayout(rows, {
      getX,
      getY,
      getSeries,
      width: box.width,
      height: panels.byKey.line.height,
      breaksAfter: raisBreaksAfter(options, rows, getX),
    });
    const diff = differenceStemsLayout(rows, {
      getX,
      getSeries,
      getValue: getY,
      minuend,
      subtrahend,
      height: panels.byKey.diff.height,
      ...line.xAxis,
      stemWidth: params.stemWidth,
    });
    return { ...box, panels, line, diff, minuend, subtrahend };
  },
  options: [
    {
      id: "minuend",
      label: "Série de onde a outra é subtraída",
      step: "mapping",
      kind: "value",
      channel: "series",
      none: "A primeira do arquivo",
    },
    valueLabelsOption("all"),
    ACCENT_END_OPTION,
    RAIS_BREAK_OPTION,
    {
      id: "caption",
      label: "Texto entre os painéis",
      step: "style",
      drawingOnly: true,
      kind: "text",
    },
    {
      id: "endNote",
      label: "Texto do último valor da diferença, no lugar do sufixo",
      step: "style",
      drawingOnly: true,
      kind: "text",
      placeholder: "pontos percentuais (pp)",
    },
  ],
});
