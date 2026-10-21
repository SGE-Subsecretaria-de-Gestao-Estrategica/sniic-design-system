import { categoricalLayout } from "$lib/core/layouts/hexMap";
import { spacing } from "$lib/core/theme/tokens";
import {
  assertOnePerTile,
  hexRadiusFor,
  hexRadiusParam,
  regionGapParam,
  warnMissingUfs,
} from "../hex";
import {
  CATEGORY_ORDER_OPTION,
  orderModeOption,
  readManualOrder,
} from "../options";
import { defineChart } from "../registry";

/** The legend, one category per row, under the map. */
export const HEX_CATEGORICAL_LEGEND = {
  gap: spacing.lg,
  rowHeight: 20,
};

export const hexCategoricalChart = defineChart({
  id: "hexCategorical",
  label: "Categórico",
  group: "hexMaps",
  channels: [
    { id: "uf", label: "UF", accepts: ["uf"], required: true },
    { id: "category", label: "Categoria", accepts: ["text"], required: true },
  ],
  keys: ["uf", "category"],
  measures: [],
  params: [hexRadiusParam(22), regionGapParam(0)],
  sizing: { width: "fitted", height: "derived" },
  defaultSize: { width: 323, height: 391 },
  margin: "even",
  build: (rows, context) => {
    const { read, options, params, warn } = context;
    const getUf = read.uf("uf");
    const getCategory = read.text("category");

    const categoryOf = new Map<string, string>();
    for (const row of rows) {
      const uf = getUf(row);
      const category = getCategory(row);
      const seen = categoryOf.get(uf);
      if (seen !== undefined && seen !== category) {
        throw new Error(
          `A UF ${uf} aparece com mais de uma categoria (${seen} e ${category}). Deixe uma só linha por UF.`,
        );
      }
      categoryOf.set(uf, category);
    }
    assertOnePerTile(rows, getUf, getUf);
    warnMissingUfs(rows.map(getUf), warn);

    const layout = categoricalLayout(rows, {
      radius: hexRadiusFor(params.regionGap, context),
      offsetK: params.regionGap,
      getUf,
      getCategory,
      categoryOrder: readManualOrder(options),
    });
    // The legend sits under the map, inside the figure's height.
    const mapHeight = layout.height;
    const legendTop = mapHeight + HEX_CATEGORICAL_LEGEND.gap;
    return {
      ...layout,
      mapHeight,
      legendTop,
      height:
        legendTop +
        layout.categories.length * HEX_CATEGORICAL_LEGEND.rowHeight,
    };
  },
  options: [
    orderModeOption("Ordem do arquivo"),
    {
      ...CATEGORY_ORDER_OPTION,
      current: (layout) => layout.categories,
    },
    {
      id: "colorScale",
      label: "Cores das categorias",
      step: "style",
      drawingOnly: true,
      kind: "choice",
      choices: [
        { value: "steps", label: "Degraus de uma cor (categorias em ordem)" },
        { value: "palette", label: "Cores da paleta (categorias sem ordem)" },
      ],
      default: "steps",
    },
    {
      id: "ramp",
      label: "Cor dos degraus",
      step: "style",
      drawingOnly: true,
      kind: "choice",
      when: { option: "colorScale", equals: "steps" },
      choices: [
        { value: "primary", label: "Primária" },
        { value: "secondary", label: "Secundária" },
      ],
      default: "primary",
    },
    {
      id: "categoryColors",
      label: "Cor de cada categoria",
      step: "style",
      drawingOnly: true,
      kind: "colors",
      when: { option: "colorScale", equals: "palette" },
      current: (layout) => layout.categories,
    },
    {
      id: "legendCounts",
      label: "Mostrar quantas UFs há em cada categoria na legenda",
      step: "style",
      drawingOnly: true,
      kind: "toggle",
      default: true,
    },
  ],
});
