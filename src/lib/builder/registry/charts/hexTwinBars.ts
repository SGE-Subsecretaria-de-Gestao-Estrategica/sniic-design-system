import { TWIN_BARS_DEFAULTS, twinBarsLayout } from "$lib/core/layouts/hexMap";
import {
  assertOnePerTile,
  hexRadiusFor,
  hexRadiusParam,
  regionGapParam,
  warnMissingUfs,
} from "../hex";
import { readNumber, readText } from "../options";
import { defineChart } from "../registry";

const MAX_TYPES = 2;
const MAX_BARS_WIDTH_RATIO = 1.1;

export const hexTwinBarsChart = defineChart({
  id: "hexTwinBars",
  label: "Mapa UF barras gêmeas",
  description:
    "Até dois valores por estado, lado a lado em um mapa de hexágonos, com uma linha de referência opcional.",
  channels: [
    { id: "uf", label: "UF", accepts: ["uf"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
    {
      id: "type",
      label: "Tipo (até dois)",
      accepts: ["text"],
      required: true,
    },
  ],
  keys: ["uf", "type"],
  measures: ["value"],
  params: [
    hexRadiusParam(45),
    regionGapParam(0.6),
    {
      id: "barWidth",
      label: "Largura das barras (px)",
      min: 4,
      max: 40,
      step: 1,
      default: TWIN_BARS_DEFAULTS.barWidth,
    },
    {
      id: "barGap",
      label: "Espaço entre as barras (px)",
      min: 0,
      max: 12,
      step: 1,
      default: TWIN_BARS_DEFAULTS.barGap,
    },
  ],
  sizing: { width: "fitted", height: "derived" },
  defaultSize: { width: 633.5, height: 634 },
  margin: "even",
  build: (rows, context) => {
    const { read, options, params, warn } = context;
    const getUf = read.uf("uf");
    const getType = read.text("type");
    const getValue = read.number("value");

    const types = [...new Set(rows.map(getType))];
    if (types.length > MAX_TYPES) {
      throw new Error(
        `Este gráfico mostra até dois tipos por UF; a coluna escolhida tem ${types.length}.`,
      );
    }
    assertOnePerTile(rows, (row) => `${getUf(row)}|${getType(row)}`, getUf);
    warnMissingUfs(rows.map(getUf), warn);

    const radius = hexRadiusFor(params.regionGap, context);
    const barsWidth =
      types.length * params.barWidth + (types.length - 1) * params.barGap;
    if (barsWidth > radius * MAX_BARS_WIDTH_RATIO) {
      warn(
        "As barras estão largas demais para os hexágonos. Reduza a largura das barras ou aumente os hexágonos.",
      );
    }

    // A stored first type may be gone after the data or mapping changed.
    const first = readText(options, "firstType");
    return twinBarsLayout(rows, {
      radius,
      offsetK: params.regionGap,
      getUf,
      getType,
      getValue,
      typeOrder: first && types.includes(first) ? [first] : undefined,
      threshold: readNumber(options, "threshold"),
      barWidth: params.barWidth,
      barGap: params.barGap,
    });
  },
  options: [
    {
      id: "firstType",
      label: "Primeira barra",
      step: "style",
      kind: "value",
      channel: "type",
      none: "A primeira do arquivo",
    },
    {
      id: "threshold",
      label: "Linha de referência",
      step: "style",
      kind: "number",
      note: "No número do arquivo: 0,4 para 40%.",
    },
    {
      id: "accentOver",
      label: "Parte acima da linha de referência na cor de acento",
      step: "style",
      drawingOnly: true,
      kind: "toggle",
    },
    {
      id: "thresholdName",
      label: "Nome da linha de referência",
      step: "style",
      drawingOnly: true,
      kind: "text",
      placeholder: "Média do Brasil",
    },
    {
      id: "legend",
      label: "Mostrar legenda",
      step: "style",
      drawingOnly: true,
      kind: "toggle",
    },
  ],
});
