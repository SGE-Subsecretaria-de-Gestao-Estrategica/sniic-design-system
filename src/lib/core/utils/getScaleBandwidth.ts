import type { GridScale } from "$lib/types/Grid";

export default function getScaleBandwidth(scale: GridScale) {
  return 'bandwidth' in scale ? scale.bandwidth() : 0;
}