import { bubbleColumnsChart } from "./bubbleColumns";
import { heatmapChart } from "./heatmap";
import { hexChoroplethChart } from "./hexChoropleth";
import { hexTwinBarsChart } from "./hexTwinBars";
import { horizontalBarsChart } from "./horizontalBars";
import { lineBubbleRowChart } from "./lineBubbleRow";
import { lineDifferenceChart } from "./lineDifference";
import { lineSeriesChart } from "./lineSeries";
import { rangeRowsChart } from "./rangeRows";
import { rankedRibbonsChart } from "./rankedRibbons";

/** Every chart the builder offers. `ChartLayouts` is derived from this list. */
export const CHARTS = [
  horizontalBarsChart,
  lineSeriesChart,
  lineBubbleRowChart,
  lineDifferenceChart,
  rankedRibbonsChart,
  rangeRowsChart,
  bubbleColumnsChart,
  heatmapChart,
  hexChoroplethChart,
  hexTwinBarsChart,
] as const;
