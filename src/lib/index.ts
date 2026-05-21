// Atoms — single-responsibility SVG <g> fragments
export { default as XAxis } from './components/atoms/XAxis.svelte';
export { default as YAxis } from './components/atoms/YAxis.svelte';
export { default as GridLines } from './components/atoms/GridLines.svelte';
export { default as Legend } from './components/atoms/Legend.svelte';
export { default as ChartTitle } from './components/atoms/ChartTitle.svelte';
export { default as GradientLegend } from './components/atoms/GradientLegend.svelte';
export { default as BarRect } from './components/atoms/BarRect.svelte';
export { default as ReferenceLine } from './components/atoms/ReferenceLine.svelte';
export { default as BubbleWithLabel } from './components/atoms/BubbleWithLabel.svelte';
export { default as SegmentLabel } from './components/atoms/SegmentLabel.svelte';

// Icons — territory
export { default as IconFavela } from './components/atoms/icons/IconFavela.svelte';
export { default as IconTerritorioIndigena } from './components/atoms/icons/IconTerritorioIndigena.svelte';
export { default as IconTerritorioQuilombola } from './components/atoms/icons/IconTerritorioQuilombola.svelte';
export { default as IconRural } from './components/atoms/icons/IconRural.svelte';
export { default as IconCidade } from './components/atoms/icons/IconCidade.svelte';
export { default as IconInterior } from './components/atoms/icons/IconInterior.svelte';
export { default as IconPerson } from './components/atoms/icons/IconPerson.svelte';

// Icons — municipality categories
export { default as IconMunicipioPequenoI } from './components/atoms/icons/IconMunicipioPequenoI.svelte';
export { default as IconMunicipioPequenoII } from './components/atoms/icons/IconMunicipioPequenoII.svelte';
export { default as IconMunicipioMedio } from './components/atoms/icons/IconMunicipioMedio.svelte';
export { default as IconMunicipioGrande } from './components/atoms/icons/IconMunicipioGrande.svelte';

// Icons — state flags
export { default as StateFlag } from './components/atoms/icons/StateFlag.svelte';

// Molecules — composed SVG/HTML shells
export { default as ChartFrame } from './components/molecules/ChartFrame.svelte';
export { default as Tooltip } from './components/molecules/Tooltip.svelte';
export { default as AnnotationBox } from './components/molecules/AnnotationBox.svelte';
export { default as SimpleBox } from './components/molecules/SimpleBox.svelte';
export { default as LegendBar } from './components/molecules/LegendBar.svelte';
export { default as DataTable } from './components/molecules/DataTable.svelte';
export type { TableColumn } from './components/molecules/DataTable.svelte';
export { default as TooltipContainer } from './components/molecules/TooltipContainer.svelte';
export type { TooltipHelpers } from './components/molecules/TooltipContainer.svelte';

// Organisms — full chart components
export { default as VerticalBarChart } from './components/VerticalBarChart.svelte';
export { default as HorizontalBarChart } from './components/HorizontalBarChart.svelte';
export { default as LineChart } from './components/LineChart.svelte';
export { default as VerticalStackedBarChart } from './components/VerticalStackedBarChart.svelte';
export type { StackedDatum } from './components/VerticalStackedBarChart.svelte';
export { default as HorizontalStackedBarChart } from './components/HorizontalStackedBarChart.svelte';
export { default as DivergingBarChart } from './components/DivergingBarChart.svelte';
export type { DivergingDatum } from './components/DivergingBarChart.svelte';
export { default as BubbleChart } from './components/BubbleChart.svelte';
export type { BubbleDatum } from './components/BubbleChart.svelte';
export { default as ChoroplethMap } from './components/ChoroplethMap.svelte';
export { default as TierSmallMultiples } from './components/TierSmallMultiples.svelte';
export { default as SlopeGraph } from './components/SlopeGraph.svelte';
export { default as RadialChart } from './components/RadialChart.svelte';
export { default as PyramidChart } from './components/PyramidChart.svelte';
export type { PyramidTier } from './components/PyramidChart.svelte';
export { default as BigNumber } from './components/BigNumber.svelte';
export { default as HeatMap } from './components/HeatMap.svelte';
export type { HeatMapCell } from './components/HeatMap.svelte';
export { default as ColorPalette } from './components/ColorPalette.svelte';
export { default as StreamGraph } from './components/StreamGraph.svelte';
export type { StreamDatum } from './components/StreamGraph.svelte';
export { default as PictogramChart } from './components/PictogramChart.svelte';
export type { PictogramDatum } from './components/PictogramChart.svelte';
export { default as ProportionalAreaChart } from './components/ProportionalAreaChart.svelte';
export type { ProportionalDatum } from './components/ProportionalAreaChart.svelte';
export { default as MarimekkoChart } from './components/MarimekkoChart.svelte';
export type { MekkoDatum } from './components/MarimekkoChart.svelte';
export { default as TreemapChart } from './components/TreemapChart.svelte';
export type { TreemapNode } from './components/TreemapChart.svelte';
export { default as DonutChart } from './components/DonutChart.svelte';
export type { DonutDatum } from './components/DonutChart.svelte';
export { default as GroupedColumnChart } from './components/GroupedColumnChart.svelte';
export type { GroupedDatum } from './components/GroupedColumnChart.svelte';
export { default as ParliamentChart } from './components/ParliamentChart.svelte';
export type { ParliamentDatum } from './components/ParliamentChart.svelte';
export { default as WaffleChart } from './components/WaffleChart.svelte';
export type { WaffleDatum } from './components/WaffleChart.svelte';
export { default as PieChart } from './components/PieChart.svelte';
export type { PieDatum } from './components/PieChart.svelte';
export { default as CorrelationMatrix } from './components/CorrelationMatrix.svelte';
export type { CorrelationDatum } from './components/CorrelationMatrix.svelte';
export { default as CalendarHeatmap } from './components/CalendarHeatmap.svelte';
export type { CalendarDatum } from './components/CalendarHeatmap.svelte';
export { default as ContourPlot } from './components/ContourPlot.svelte';
export type { ContourPoint } from './components/ContourPlot.svelte';

// Tokens
export * from './tokens.js';

// Color palettes
export * from './palettes.js';

// Shared utilities
export * from './utils/colorContrast.js';
export * from './utils/formatters.js';
export * from './utils/tooltip.js';
export * from './utils/geoLoader.js';
export * from './utils/axisHelpers.js';
export * from './utils/resizeObserver.js';
export * from './utils/exportSvg.js';
export * from './utils/labelHelpers.js';
export * from './utils/colorMapHelpers.js';
export * from './utils/tooltipState.js';
export * from './utils/scaleHelpers.js';
export * from './utils/stackHelpers.js';

// Chart draw functions (for headless / custom-shell usage)
export * from './charts/choroplethMap.js';
export * from './charts/tierSmallMultiples.js';
