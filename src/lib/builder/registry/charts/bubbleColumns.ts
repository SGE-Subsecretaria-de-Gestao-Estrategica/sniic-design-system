import * as d3 from "d3";
import {
  BUBBLE_COLUMNS_DEFAULTS,
  bubbleColumnsLayout,
} from "$lib/core/layouts/bubbleColumns";
import {
  CATEGORY_ORDER_OPTION,
  orderModeOption,
  readManualOrder,
  readText,
} from "../options";
import { defineChart } from "../registry";

export const bubbleColumnsChart = defineChart({
  id: "bubbleColumns",
  label: "Colunas de bolhas",
  description:
    "Compara proporções por categoria, com uma coluna de círculos por grupo.",
  channels: [
    { id: "category", label: "Categoria", accepts: ["text"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
    { id: "group", label: "Grupo", accepts: ["text"], required: false },
  ],
  keys: ["group", "category"],
  measures: ["value"],
  params: [
    {
      id: "maxRadius",
      label: "Raio do maior círculo (px)",
      min: 8,
      max: 96,
      step: 1,
      default: BUBBLE_COLUMNS_DEFAULTS.maxRadius,
    },
    {
      id: "rowSpacing",
      label: "Espaço entre linhas (px)",
      min: 0,
      max: 64,
      step: 1,
      default: BUBBLE_COLUMNS_DEFAULTS.labelGap,
    },
    {
      id: "columnGap",
      label: "Espaço entre colunas (px)",
      min: 0,
      max: 96,
      step: 1,
      default: BUBBLE_COLUMNS_DEFAULTS.columnGap,
    },
  ],
  sizing: { width: "derived", height: "derived" },
  defaultSize: { width: 480, height: 400 },
  margin: "labelsBothSides",
  build: (rows, { read, options, params }) => {
    const getGroup = read.has("group") ? read.text("group") : undefined;
    // A stored main group may be gone after the data or mapping changed.
    const mainGroup = readText(options, "mainGroup");
    const groups = getGroup ? new Set(rows.map(getGroup)) : new Set<string>();
    // The layout's default radius scale expects proportions (0–1); the
    // builder takes any magnitude, so the largest value gets `maxRadius`.
    const getValue = read.number("value");
    const { maxRadius } = params;
    const radius = d3
      .scaleSqrt()
      .domain([0, d3.max(rows, getValue) ?? 1])
      .range([0, maxRadius]);
    return bubbleColumnsLayout(rows, {
      getCategory: read.text("category"),
      getValue,
      radius,
      // Room for the largest circle in every cell, so circles never overlap.
      columnHalfWidth: maxRadius,
      rowGap: 2 * maxRadius + params.rowSpacing,
      columnGap: params.columnGap,
      getGroup,
      mainGroup: mainGroup && groups.has(mainGroup) ? mainGroup : undefined,
      categoryOrder: readManualOrder(options),
    });
  },
  options: [
    {
      id: "mainGroup",
      label: "Grupo principal",
      step: "mapping",
      kind: "value",
      channel: "group",
    },
    orderModeOption("Pelo valor do grupo principal"),
    {
      ...CATEGORY_ORDER_OPTION,
      current: (layout) => layout.rows.map((r) => r.category),
    },
  ],
});
