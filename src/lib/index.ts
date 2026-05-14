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

// Molecules — composed SVG/HTML shells
export { default as ChartFrame } from './components/molecules/ChartFrame.svelte';
export { default as Tooltip } from './components/molecules/Tooltip.svelte';
export { default as AnnotationBox } from './components/molecules/AnnotationBox.svelte';

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

// Chart draw functions (for headless / custom-shell usage)
export * from './charts/choroplethMap.js';
export * from './charts/tierSmallMultiples.js';
