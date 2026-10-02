import { horizontalBarsLayout } from "$lib/core/layouts/horizontalBars";
import { assertUnique } from "../checks";
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
  build: (rows, { read, box }) => {
    const getCategory = read.text("category");
    assertUnique(rows, getCategory, "categorias");
    return horizontalBarsLayout(rows, {
      getCategory,
      getValue: read.number("value"),
      width: box.width,
    });
  },
});
