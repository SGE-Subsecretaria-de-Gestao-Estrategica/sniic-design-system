import { describe, expectTypeOf, it } from "vitest";
import type { HorizontalBarsLayout } from "$lib/core/layouts/horizontalBars";
import type { Row } from "../data/types";
import { CHARTS } from "./charts";
import type { ChartId, ChartLayouts } from "./layouts";

describe("ChartLayouts", () => {
  it("is derived from CHARTS", () => {
    expectTypeOf<ChartId>().toEqualTypeOf<"horizontalBars">();
    expectTypeOf<ChartLayouts["horizontalBars"]>().toEqualTypeOf<HorizontalBarsLayout<Row>>();
    expectTypeOf(CHARTS[0].id).toEqualTypeOf<"horizontalBars">();
  });
});
