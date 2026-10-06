import {
  BUBBLE_ROW_DEFAULTS,
  bubbleRowLayout,
} from "$lib/core/layouts/bubbleRow";
import { lineSeriesLayout } from "$lib/core/layouts/lineSeries";
import {
  STACK_PANELS_DEFAULTS,
  stackPanelsLayout,
} from "$lib/core/layouts/stackPanels";
import { spacing } from "$lib/core/theme/tokens";
import { ACCENT_END_OPTION, readText, valueLabelsOption } from "../options";
import { RAIS_BREAK_OPTION, raisBreaksAfter } from "../rais";
import { defineChart } from "../registry";
import { FULL_PAGE_WIDTH } from "../widths";

/** A line panel over a row of bubbles on the same x axis (G6.05). */
export const lineBubbleRowChart = defineChart({
  id: "lineBubbleRow",
  label: "Linhas com bolhas",
  group: "lines",
  channels: [
    { id: "x", label: "Eixo X", accepts: ["date", "number"], required: true },
    { id: "y", label: "Valor da linha", accepts: ["number"], required: true },
    {
      id: "size",
      label: "Valor das bolhas",
      accepts: ["number"],
      required: true,
    },
  ],
  keys: ["x"],
  measures: ["y", "size"],
  params: [
    {
      id: "linePanelShare",
      label: "Parte da altura para a linha (0 a 1)",
      min: 0.3,
      max: 0.9,
      step: 0.05,
      default: 0.75,
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
      id: "minRadius",
      label: "Raio da menor bolha (px)",
      min: 1,
      max: 24,
      step: 1,
      default: BUBBLE_ROW_DEFAULTS.minRadius,
    },
    {
      id: "maxRadius",
      label: "Raio da maior bolha (px)",
      min: 4,
      max: 40,
      step: 1,
      default: BUBBLE_ROW_DEFAULTS.maxRadius,
    },
  ],
  formats: [{ id: "bubbles", label: "Formato dos valores das bolhas" }],
  sizing: { width: "free", height: "free" },
  defaultSize: { width: FULL_PAGE_WIDTH, height: 320 },
  margin: "right",
  build: (rows, { read, box, options, params }) => {
    const panels = stackPanelsLayout(
      [
        { key: "line", share: params.linePanelShare },
        { key: "row", share: 1 - params.linePanelShare },
      ],
      { ...box, gap: params.panelGap },
    );
    const getX = read.x("x");
    const name = readText(options, "lineName");
    const line = lineSeriesLayout(rows, {
      getX,
      getY: read.number("y"),
      getSeries: name ? () => name : undefined,
      width: box.width,
      height: panels.byKey.line.height,
      breaksAfter: raisBreaksAfter(options, rows, getX),
      // Room for the larger end marker.
      endLabelGap: spacing.lg,
      endValueGap: spacing.sm,
    });
    const row = bubbleRowLayout(rows, {
      getX,
      getValue: read.number("size"),
      ...line.xAxis,
      minRadius: params.minRadius,
      maxRadius: Math.max(params.minRadius, params.maxRadius),
    });
    return { ...box, panels, line, row };
  },
  options: [
    valueLabelsOption("all"),
    ACCENT_END_OPTION,
    RAIS_BREAK_OPTION,
    {
      id: "invertColors",
      label: "Inverter as cores das bolhas",
      step: "style",
      drawingOnly: true,
      kind: "toggle",
    },
    {
      id: "lineName",
      label: "Nome da linha",
      step: "style",
      kind: "text",
      placeholder: "ao lado do último ponto",
    },
    {
      id: "caption",
      label: "Texto entre os painéis",
      step: "style",
      drawingOnly: true,
      kind: "text",
    },
    {
      id: "endNote",
      label: "Texto depois do último valor das bolhas",
      step: "style",
      drawingOnly: true,
      kind: "text",
    },
  ],
});
