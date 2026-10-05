import { describe, expectTypeOf, it } from "vitest";
import type { BubbleColumnsLayout } from "$lib/core/layouts/bubbleColumns";
import type { HorizontalBarsLayout } from "$lib/core/layouts/horizontalBars";
import type { LineSeriesLayout } from "$lib/core/layouts/lineSeries";
import type { RangeRowsLayout } from "$lib/core/layouts/rangeRows";
import type { Row } from "../data/types";
import { CHARTS } from "./charts";
import type { ChartId, ChartLayouts } from "./layouts";

describe("ChartLayouts", () => {
  it("is derived from CHARTS", () => {
    expectTypeOf<ChartId>().toEqualTypeOf<
      | "horizontalBars"
      | "lineSeries"
      | "lineBubbleRow"
      | "lineDifference"
      | "rangeRows"
      | "bubbleColumns"
    >();
    expectTypeOf<ChartLayouts["horizontalBars"]>().toEqualTypeOf<
      HorizontalBarsLayout<Row>
    >();
    expectTypeOf<ChartLayouts["lineSeries"]>().toEqualTypeOf<
      LineSeriesLayout<Row>
    >();
    expectTypeOf<ChartLayouts["rangeRows"]>().toEqualTypeOf<
      RangeRowsLayout<Row>
    >();
    expectTypeOf<ChartLayouts["bubbleColumns"]>().toEqualTypeOf<
      BubbleColumnsLayout<Row>
    >();
    expectTypeOf<ChartLayouts["lineBubbleRow"]["line"]>().toEqualTypeOf<
      LineSeriesLayout<Row>
    >();
    expectTypeOf<
      ChartLayouts["lineDifference"]["minuend"]
    >().toEqualTypeOf<string>();
    expectTypeOf(CHARTS[0].id).toEqualTypeOf<"horizontalBars">();
  });
});
