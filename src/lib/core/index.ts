// Core — composable chart primitives. Charts are built by composing these
// inside a <Chart> (or a bare <Svg>), with styling resolved from the theme
// context: props > <Theme> > DefaultTheme.

// Containers
export { default as Chart } from './components/Chart.svelte';
export { default as Svg } from './components/Svg.svelte';
export { default as Group } from './components/Group.svelte';
export { default as Text } from './components/Text.svelte';
export { default as Theme } from './components/Theme.svelte';

// Axis
export { default as Axis } from './components/axis/Axis.svelte';
export { default as AxisRenderer } from './components/axis/AxisRenderer.svelte';
export { default as Ticks } from './components/axis/Ticks.svelte';

// Grid
export { default as Grid } from './components/grid/Grid.svelte';
export { default as GridRows } from './components/grid/GridRows.svelte';
export { default as GridColumns } from './components/grid/GridColumns.svelte';

// Shapes
export { default as Line } from './components/shape/Line.svelte';
export { default as LinePath } from './components/shape/LinePath.svelte';
export { default as AreaPath } from './components/shape/AreaPath.svelte';
export { default as Arc } from './components/shape/Arc.svelte';
export { default as Bar } from './components/shape/Bar.svelte';
export { default as BarStack } from './components/shape/BarStack.svelte';
export { default as BarGroup } from './components/shape/BarGroup.svelte';

// Markers
export { default as Marker } from './components/markers/Marker.svelte';
export { default as MarkerCircle } from './components/markers/MarkerCircle.svelte';
export { default as Markers } from './components/markers/Markers.svelte';
export { default as Circle } from './components/markers/Circle.svelte';

// Legend
export { default as Legend } from './components/legend/Legend.svelte';

// Theme — tokens, palettes, context and the props > theme > default cascade
export * from './theme/index.js';

// Hooks
export { default as useAxis } from './hooks/useAxis.svelte.js';
export { default as useText } from './hooks/useText.svelte.js';

// Utils
export { default as coerceNumber } from './utils/coerceNumber.js';
export { default as getScaleBandwidth } from './utils/getScaleBandwidth.js';
export { default as getStringWidth } from './utils/getStringWidth.js';
export { default as getTicks } from './utils/getTicks.js';
export { default as getLabelTransform } from './utils/getLabelTransform.js';
export { line, area, arc } from './utils/shapeFactory.js';

// Constants
export { default as Orientation } from './constants/orientation.js';
export type { OrientationType } from './constants/orientation.js';
