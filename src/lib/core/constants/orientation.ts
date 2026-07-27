import type { ValueOf } from "$lib/types/Base";

const Orientation = {
  top: 'top',
  left: 'left',
  right: 'right',
  bottom: 'bottom',
} as const;

export type OrientationType = ValueOf<typeof Orientation>;

export default Orientation;