import { describe, expectTypeOf, it } from "vitest";
import type { BubbleColumnsLayout } from "$lib/core/layouts/bubbleColumns";
import type { CoverageDotsLayout } from "$lib/core/layouts/coverageDots";
import type { PartitionBarsLayout } from "$lib/core/layouts/partitionBars";
import type { HeatmapLayout } from "$lib/core/layouts/heatmap";
import type { TwinBarsLayout } from "$lib/core/layouts/hexMap";
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
      | "rankedRibbons"
      | "rangeRows"
      | "coverageDots"
      | "partitionBars"
      | "bubbleColumns"
      | "heatmap"
      | "hexChoropleth"
      | "hexTwinBars"
      | "hexCategorical"
    >();
    expectTypeOf<ChartLayouts["horizontalBars"]>().toEqualTypeOf<
      HorizontalBarsLayout<Row>
    >();
    expectTypeOf<ChartLayouts["lineSeries"]>().toEqualTypeOf<
      LineSeriesLayout<Row>
    >();
    expectTypeOf<ChartLayouts["heatmap"]>().toEqualTypeOf<
      HeatmapLayout<Row>
    >();
    expectTypeOf<ChartLayouts["rangeRows"]>().toEqualTypeOf<
      RangeRowsLayout<Row>
    >();
    expectTypeOf<ChartLayouts["coverageDots"]>().toEqualTypeOf<
      CoverageDotsLayout<Row>
    >();
    expectTypeOf<ChartLayouts["partitionBars"]>().toEqualTypeOf<
      PartitionBarsLayout<Row>
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
    expectTypeOf<ChartLayouts["hexTwinBars"]>().toEqualTypeOf<
      TwinBarsLayout<Row>
    >();
    expectTypeOf<
      ChartLayouts["hexChoropleth"]["steps"]
    >().toEqualTypeOf<number>();
    expectTypeOf<
      ChartLayouts["hexCategorical"]["categories"]
    >().toEqualTypeOf<string[]>();
    expectTypeOf(CHARTS[0].id).toEqualTypeOf<"horizontalBars">();
  });
});
