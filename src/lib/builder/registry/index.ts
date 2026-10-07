import { CHARTS } from "./charts";
import { createRegistry } from "./registry";

export { createRegistry, defineChart } from "./registry";
export { CHARTS } from "./charts";
export type * from "./types";
export type * from "./layouts";

export const defaultRegistry = createRegistry(CHARTS);
