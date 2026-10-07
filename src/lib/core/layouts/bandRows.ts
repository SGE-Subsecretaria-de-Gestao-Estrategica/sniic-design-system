export type BandRowsSpec = {
  thickness: number;
  gapRatio: number;
};

export type BandRow = {
  index: number;
  y: number; // top of the band row
  cy: number; // center of the band row
};

export type BandRows = {
  rows: BandRow[];
  thickness: number;
  gap: number;
  height: number;
};

export function bandRows(count: number, { thickness, gapRatio }: BandRowsSpec): BandRows {
  const gap = thickness * gapRatio;
  const rows = Array.from({ length: count }, (_, index) => {
    const y = gap + index * (thickness + gap);
    return { index, y, cy: y + thickness / 2 };
  });
  return {
    rows,
    thickness,
    gap,
    height: count === 0 ? 0 : count * thickness + (count + 1) * gap,
  };
}
