export type ExportFormat = "svg" | "png";

/** `vinculos 2024.csv` → `vinculos 2024` */
export function fileBaseName(fileName: string | null): string {
  return fileName?.replace(/\.[^.]+$/, "").trim() || "grafico";
}

/** The exported file's name, from the CSV's: `vinculos.svg`, `vinculos.png`, `vinculos@2x.png`. */
export function exportName(
  fileName: string | null,
  format: ExportFormat,
  scale = 1,
): string {
  const suffix = format === "png" && scale !== 1 ? `@${scale}x` : "";
  return `${fileBaseName(fileName)}${suffix}.${format}`;
}
