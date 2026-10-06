import * as d3 from "d3";
import { choroplethLayout } from "$lib/core/layouts/hexMap";
import {
  assertOnePerTile,
  hexRadiusFor,
  hexRadiusParam,
  regionGapParam,
  warnMissingUfs,
} from "../hex";
import { readText, readToggle } from "../options";
import { defineChart } from "../registry";

export const hexChoroplethChart = defineChart({
  id: "hexChoropleth",
  label: "Coropleto",
  group: "hexMaps",
  channels: [
    { id: "uf", label: "UF", accepts: ["uf"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
    { id: "slice", label: "Recorte", accepts: ["text"], required: false },
  ],
  keys: ["slice", "uf"],
  measures: ["value"],
  params: [
    hexRadiusParam(22),
    {
      id: "steps",
      label: "Faixas de cor",
      min: 3,
      max: 10,
      step: 1,
      default: 10,
    },
    regionGapParam(0),
  ],
  sizing: { width: "fitted", height: "derived" },
  defaultSize: { width: 323, height: 315 },
  margin: "even",
  build: (rows, context) => {
    const { read, options, params, warn } = context;
    const getUf = read.uf("uf");
    const getValue = read.number("value");

    let shown = rows;
    let slice: string | undefined;
    if (read.has("slice")) {
      const getSlice = read.text("slice");
      const slices = [...new Set(rows.map(getSlice))];
      const chosen = readText(options, "sliceValue");
      slice = chosen && slices.includes(chosen) ? chosen : slices[0];
      shown = rows.filter((row) => getSlice(row) === slice);
    }
    assertOnePerTile(shown, getUf, getUf);
    warnMissingUfs(shown.map(getUf), warn);

    const [min = 0, max = 0] = d3.extent(shown, getValue);
    const layout = choroplethLayout(shown, {
      radius: hexRadiusFor(params.regionGap, context),
      offsetK: params.regionGap,
      getUf,
      getValue,
      steps: params.steps,
      domain: readToggle(options, "fromMin")
        ? [min, max]
        : [Math.min(0, min), max],
    });
    return { ...layout, slice };
  },
  options: [
    {
      id: "sliceValue",
      label: "Recorte mostrado",
      step: "mapping",
      kind: "value",
      channel: "slice",
      none: "O primeiro do arquivo",
    },
    {
      id: "ramp",
      label: "Cor das faixas",
      step: "style",
      drawingOnly: true,
      kind: "choice",
      choices: [
        { value: "secondary", label: "Secundária" },
        { value: "primary", label: "Primária" },
      ],
      default: "primary",
    },
    {
      id: "rampOrder",
      label: "Sentido das cores",
      step: "style",
      drawingOnly: true,
      kind: "choice",
      choices: [
        { value: "lightToDark", label: "Da mais clara para a mais escura" },
        { value: "toVariant", label: "Da cor para a variante" },
        { value: "fromVariant", label: "Da variante para a cor" },
      ],
      default: "lightToDark",
    },
    {
      id: "fromMin",
      label: "Começar a escala no menor valor, não no zero",
      step: "style",
      kind: "toggle",
    },
    {
      id: "legendValues",
      label: "Mostrar o menor e o maior valor na legenda",
      step: "style",
      drawingOnly: true,
      kind: "toggle",
    },
  ],
});
