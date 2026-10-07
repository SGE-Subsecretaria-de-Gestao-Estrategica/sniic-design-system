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

// Bubble columns
export { default as BubbleColumns } from './components/bubbleColumns/BubbleColumns.svelte';

// Horizontal bars
export { default as HorizontalBars } from './components/horizontalBars/HorizontalBars.svelte';

// Line series, bubble row, difference stems
export { default as LineSeries } from './components/lineSeries/LineSeries.svelte';
export { default as BubbleRow } from './components/bubbleRow/BubbleRow.svelte';
export { default as DifferenceStems } from './components/differenceStems/DifferenceStems.svelte';

// Labels: draw a layout's LabelPlacement with a theme text role
export { default as PlacedLabel } from './components/label/PlacedLabel.svelte';

// Hex map of Brazilian states
export { default as HexTiles } from './components/hexMap/HexTiles.svelte';
export { default as HexChoropleth } from './components/hexMap/HexChoropleth.svelte';
export { default as HexTwinBars } from './components/hexMap/HexTwinBars.svelte';

// Range rows (dumbbell)
export { default as RangeRows } from './components/rangeRows/RangeRows.svelte';

// Gradients
export { default as LinearGradient } from './components/gradient/LinearGradient.svelte';


export { default as RoundedBar } from './components/shape/RoundedBar.svelte';

// Markers
export { default as Marker } from './components/markers/Marker.svelte';
export { default as MarkerCircle } from './components/markers/MarkerCircle.svelte';
export { default as Markers } from './components/markers/Markers.svelte';
export { default as Circle } from './components/markers/Circle.svelte';

// Legend
export { default as Legend } from './components/legend/Legend.svelte';
export { default as LegendChips } from './components/legend/LegendChips.svelte';
export { default as LegendSteps } from './components/legend/LegendSteps.svelte';

// Annotation
export { default as ValueCallout } from './components/annotation/ValueCallout.svelte';
export { default as HighlightCallout } from './components/annotation/HighlightCallout.svelte';
export { default as TimelineBreak } from './components/annotation/TimelineBreak.svelte';

// Interaction — hover, crosshair, tooltip and the optional scrollytelling driver
export { default as HoverLayer } from './components/interaction/HoverLayer.svelte';
export { default as HitTarget } from './components/interaction/HitTarget.svelte';
export { default as Crosshair } from './components/interaction/Crosshair.svelte';
export { default as ChartTooltip } from './components/interaction/ChartTooltip.svelte';
export { HoverState, relativeTo } from './interaction/hover.svelte.js';
export type { TooltipRow, TooltipContent } from './interaction/hover.svelte.js';
export { nearestIndex, nearestIndexWithin, nearestPoint, distance } from './interaction/nearest.js';
export { ScrollySteps, scrollStep } from './interaction/scrolly.svelte.js';
export type { ScrollyOptions } from './interaction/scrolly.svelte.js';

// Theme — tokens, palettes, context and the props > theme > default cascade
export * from './theme/index.js';

// Hooks
export { default as useAxis } from './hooks/useAxis.svelte.js';
export { default as useText } from './hooks/useText.svelte.js';
export { default as useLayoutData } from './hooks/useLayoutData.svelte.js';

// Utils
export { default as coerceNumber } from './utils/coerceNumber.js';
export { default as getScaleBandwidth } from './utils/getScaleBandwidth.js';
export { default as getStringWidth } from './utils/getStringWidth.js';
export { default as getTicks } from './utils/getTicks.js';
export { default as getLabelTransform } from './utils/getLabelTransform.js';
export { line, area, arc, roundedRect } from './utils/shapeFactory.js';
export { default as applyExplicitOrder } from './utils/applyExplicitOrder.js';
export { default as getGradientRamp } from './utils/getGradientRamp.js';
export type { GradientStops } from './utils/getGradientRamp.js';
export { default as resolveValue } from './utils/resolveValue.js';
export { default as splitAtBreaks } from './utils/splitAtBreaks.js';
export { default as padExtent } from './utils/padExtent.js';
export { default as resolveDefaults } from './utils/resolveDefaults.js';
export { default as orderKeys } from './utils/orderKeys.js';
export { default as resolveDomain } from './utils/resolveDomain.js';
export type { DomainOptions } from './utils/resolveDomain.js';

// Layouts
export { bubbleColumnsLayout, BUBBLE_COLUMNS_DEFAULTS } from './layouts/bubbleColumns/index.js';
export type * from './layouts/bubbleColumns/types.js';
export { horizontalBarsLayout, HORIZONTAL_BARS_DEFAULTS } from './layouts/horizontalBars/index.js';
export type {
  HorizontalBarsSpacing,
  HorizontalBarsLayoutConfig,
  HorizontalBarsEntry,
  HorizontalBarMarker,
  HorizontalBar,
  HorizontalBarsLayout,
} from './layouts/horizontalBars/types.js';
export type {
  XValue,
  XScaleFn,
  LineSegment,
  LabelPlacement,
  LabelSide,
  AxisBreak,
  SortOrder,
  LayoutBox,
  LayoutItem,
  SharedXAxis,
  XAccessor,
  YAccessor,
  ValueAccessor,
  CategoryAccessor,
  GroupAccessor,
  SeriesAccessor,
} from './layouts/types.js';
export { bandRows } from './layouts/bandRows.js';
export type { BandRow, BandRows, BandRowsSpec } from './layouts/bandRows.js';
export { segmentedAxisLayout, SEGMENTED_AXIS_DEFAULTS } from './layouts/segmentedAxis/index.js';
export type {
  SegmentedAxisSpacing,
  SegmentedAxisLayoutConfig,
  SegmentScale,
  AxisSegment,
  SegmentedAxis,
} from './layouts/segmentedAxis/types.js';
export { stackPanelsLayout, STACK_PANELS_DEFAULTS } from './layouts/stackPanels/index.js';
export type {
  StackPanelsSpacing,
  PanelSpec,
  StackPanelsLayoutConfig,
  StackedPanel,
  PanelGap,
  StackPanelsLayout,
} from './layouts/stackPanels/types.js';
export {
  placeOnSide,
  placeRight,
  placeLeft,
  placeCentered,
  sideSign,
  sideAnchor,
} from './layouts/labels.js';
export { lineSeriesLayout, LINE_SERIES_DEFAULTS } from './layouts/lineSeries/index.js';
export type {
  LineSeriesSpacing,
  LineSeriesLayoutConfig,
  LineSeriesEntry,
  LineSeriesXScale,
  LineSeriesSegment,
  LineSeriesPoint,
  LineSeriesItem,
  LineSeriesLayout,
} from './layouts/lineSeries/types.js';
export { bubbleRowLayout, BUBBLE_ROW_DEFAULTS } from './layouts/bubbleRow/index.js';
export type {
  BubbleRowSpacing,
  BubbleRowLayoutConfig,
  BubbleRowEntry,
  BubbleRowItem,
  BubbleRowLayout,
} from './layouts/bubbleRow/types.js';
export {
  differenceStemsLayout,
  DIFFERENCE_STEMS_DEFAULTS,
} from './layouts/differenceStems/index.js';
export type {
  DifferenceStemsSpacing,
  DifferenceStemsLayoutConfig,
  DifferenceStemsEntry,
  DifferencePair,
  StemRect,
  DifferenceStem,
  DifferenceStemsLayout,
} from './layouts/differenceStems/types.js';

export { rangeRowsLayout, RANGE_ROWS_DEFAULTS } from './layouts/rangeRows/index.js';
export type {
  RangeRowsSpacing,
  RangeRowsLayoutConfig,
  RangeRowsEntry,
  RangeMarker,
  RangeStrap,
  RangeRow,
  RangeRowsLayout,
} from './layouts/rangeRows/types.js';

export {
  choroplethLayout,
  choroplethStepColors,
  twinBarsLayout,
  hexRadiusForWidth,
  CHOROPLETH_DEFAULTS,
  CHOROPLETH_COLOR_DEFAULTS,
  TWIN_BARS_DEFAULTS,
} from './layouts/hexMap/index.js';
export type {
  BrazilianRegion,
  MapTile,
  TwinBarsSpacing,
  TwinBarsLayoutConfig,
  TwinBarSegment,
  TwinBarItem,
  TwinBarDatum,
  TwinBarsLayout,
  ChoroplethColorConfig,
  ChoroplethSpacing,
  ChoroplethLayoutConfig,
  ChoroplethDatum,
  ChoroplethLayout,
} from './layouts/hexMap/types.js';
export { wrapText } from './utils/wrapText.js';
export { relativeLuminance, contrastRatio, pickContrastInk } from './utils/contrastColor.js';

// Constants
export { default as Orientation } from './constants/orientation.js';
export type { OrientationType } from './constants/orientation.js';
