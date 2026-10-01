import { horizontalBarsLayout } from "$lib/core/layouts/horizontalBars";
import { defineChart } from "../registry";

export const horizontalBarsChart = defineChart({
  id: "horizontalBars",
  label: "Barras horizontais",
  description: "Compara um valor entre categorias, da maior para a menor.",
  channels: [
    { id: "category", label: "Categoria", accepts: ["text"], required: true },
    { id: "value", label: "Valor", accepts: ["number"], required: true },
  ],
  sizing: { width: "free", height: "derived" },
  defaultSize: { width: 640, height: 400 },
  margin: { top: 24, right: 48, bottom: 24, left: 150 },
  build: (rows, { read, box }) =>
    horizontalBarsLayout(rows, {
      getCategory: read.text("category"),
      getValue: read.number("value"),
      width: box.width,
    }),
});
