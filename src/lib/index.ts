// Atoms — single-responsibility SVG <g> fragments
export { default as XAxis } from './components/atoms/XAxis.svelte';
export { default as YAxis } from './components/atoms/YAxis.svelte';
export { default as GridLines } from './components/atoms/GridLines.svelte';
export { default as Legend } from './components/atoms/Legend.svelte';
export { default as ChartTitle } from './components/atoms/ChartTitle.svelte';
export { default as GradientLegend } from './components/atoms/GradientLegend.svelte';

// Molecules — composed SVG/HTML shells
export { default as ChartFrame } from './components/molecules/ChartFrame.svelte';
export { default as Tooltip } from './components/molecules/Tooltip.svelte';
export { default as AnnotationBox } from './components/molecules/AnnotationBox.svelte';

// Organisms — full chart components
export { default as BarChart } from './components/BarChart.svelte';
export { default as LineChart } from './components/LineChart.svelte';
export { default as AgeGroupChart } from './components/AgeGroupChart.svelte';
export { default as BubbleScatter } from './components/BubbleScatter.svelte';
export { default as ChoroplethMap } from './components/ChoroplethMap.svelte';
export { default as GenderDivergingBar } from './components/GenderDivergingBar.svelte';
export { default as StackedBarChart } from './components/StackedBarChart.svelte';
export { default as TierSmallMultiples } from './components/TierSmallMultiples.svelte';
export { default as SlopeGraph } from './components/SlopeGraph.svelte';
export { default as RadialChart } from './components/RadialChart.svelte';
export { default as PyramidChart } from './components/PyramidChart.svelte';
export type { PyramidTier } from './components/PyramidChart.svelte';
export { default as BigNumber } from './components/BigNumber.svelte';
export { default as HeatMap } from './components/HeatMap.svelte';
export type { HeatMapCell } from './components/HeatMap.svelte';

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

// Chart draw functions (for headless / custom-shell usage)
export * from './charts/ageGroupChart.js';
export * from './charts/bubbleScatter.js';
export * from './charts/genderDivergingBar.js';
export * from './charts/choroplethMap.js';
export * from './charts/stackedBarChart.js';
export * from './charts/tierSmallMultiples.js';
