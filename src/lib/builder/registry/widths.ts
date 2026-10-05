/** Figure widths on the report's page grid, in px. `note` says what the width is on the page. */
export const WIDTH_PRESETS = [
  { id: "4", columns: 4, width: 182.4 },
  { id: "5", columns: 5, width: 232.2 },
  { id: "6", columns: 6, width: 282, note: "meia página" },
  { id: "7", columns: 7, width: 331.9 },
  { id: "8", columns: 8, width: 381.7 },
  { id: "9", columns: 9, width: 431.6 },
  { id: "10", columns: 10, width: 481.4 },
  { id: "11", columns: 11, width: 531.3 },
  { id: "12", columns: 12, width: 581.1, note: "página inteira" },
  {
    id: "12+gap",
    columns: 12,
    width: 705.8,
    note: "com o espaço entre páginas",
  },
  { id: "13", columns: 13, width: 738.7 },
  { id: "14", columns: 14, width: 788.5 },
  { id: "15", columns: 15, width: 838.3 },
  { id: "16", columns: 16, width: 888.2 },
  { id: "17", columns: 17, width: 938 },
  { id: "18", columns: 18, width: 987.9 },
  { id: "19", columns: 19, width: 1037.7 },
  { id: "20", columns: 20, width: 1087.6 },
  { id: "21", columns: 21, width: 1137.4 },
  { id: "22", columns: 22, width: 1187.2 },
  { id: "24", columns: 24, width: 1286.9 },
] as const satisfies readonly {
  id: string;
  columns: number;
  width: number;
  note?: string;
}[];

export type WidthPreset = (typeof WIDTH_PRESETS)[number];

/** A full page: the default width of charts whose width is free. */
export const FULL_PAGE_WIDTH = 581.1;

export function widthPresetOf(width: number | null): WidthPreset | undefined {
  return WIDTH_PRESETS.find((preset) => preset.width === width);
}
