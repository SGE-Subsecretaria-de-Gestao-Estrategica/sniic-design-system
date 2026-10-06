import { bubbleColumnsChart } from "./bubbleColumns";
import { hexChoroplethChart } from "./hexChoropleth";
import { hexTwinBarsChart } from "./hexTwinBars";
import { horizontalBarsChart } from "./horizontalBars";
import { lineBubbleRowChart } from "./lineBubbleRow";
import { lineDifferenceChart } from "./lineDifference";
import { lineSeriesChart } from "./lineSeries";
import { rangeRowsChart } from "./rangeRows";

/** Every chart the builder offers. `ChartLayouts` is derived from this list. */
export const CHARTS = [
  horizontalBarsChart,
  lineSeriesChart,
  lineBubbleRowChart,
  lineDifferenceChart,
  rangeRowsChart,
  bubbleColumnsChart,
  hexChoroplethChart,
  hexTwinBarsChart,
] as const;
