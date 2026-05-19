# sniic-design-system

A Svelte component library with chart components and design tokens based on the [Brazilian Government Design System](https://www.gov.br/ds/fundamentos-visuais/cores) (Padrao Digital de Governo).

## Installation

```bash
npm install sniic-design-system
```

### Peer dependencies

This library requires **Svelte 5** and **D3 7+** as peer dependencies:

```bash
npm install svelte d3
```

## Requirements

- Node.js 18+
- npm 9+

## Usage

```svelte
<script>
  import { VerticalBarChart, LineChart } from 'sniic-design-system';
  import { blue, orange } from 'sniic-design-system';
</script>
```

## Architecture

The library follows **atomic design** principles:

- **Atoms** — Single-responsibility SVG fragments (axes, legends, bars, labels)
- **Molecules** — Composed SVG/HTML shells (ChartFrame, Tooltip, AnnotationBox, DataTable)
- **Organisms** — Full chart components built from atoms and molecules

All charts use **D3** for scales and layouts with **SVG rendering**. `ChartFrame` handles responsive sizing via `ResizeObserver`, SVG setup, and font loading.

## Components

### Atoms

Low-level building blocks for composing custom charts.

| Component | Description |
|---|---|
| `XAxis` | Horizontal axis with ticks and labels |
| `YAxis` | Vertical axis with ticks and labels |
| `GridLines` | Horizontal/vertical grid lines |
| `Legend` | Color-keyed legend |
| `ChartTitle` | Chart title text |
| `GradientLegend` | Continuous color gradient legend |
| `BarRect` | Reusable bar rect with safety guards |
| `ReferenceLine` | Annotated reference line (vertical/horizontal) |
| `BubbleWithLabel` | Circle with optional ring and contrast-aware text label |

### Icons

| Component | Description |
|---|---|
| `IconFavela` | Territory icon for favelas/urban communities |
| `IconTerritorioIndigena` | Territory icon for indigenous territories |
| `IconTerritorioQuilombola` | Territory icon for quilombola territories |
| `IconRural` | Territory icon for rural areas |
| `StateFlag` | Brazilian state flag by UF code |

### Molecules

| Component | Description |
|---|---|
| `ChartFrame` | Responsive SVG wrapper with margins, font loading, and ResizeObserver |
| `Tooltip` | Positioned tooltip overlay |
| `AnnotationBox` | Bordered label box with connector line and highlight circle. Supports slotted children via snippet |
| `SimpleBox` | Bordered box with optional title, value, and subtitle |
| `LegendBar` | Horizontal color-keyed legend bar |
| `DataTable` | SVG-rendered data table with configurable columns, header color, and alignment |

### Chart Components (Organisms)

| Component | Description |
|---|---|
| `VerticalBarChart` | Vertical bar chart |
| `HorizontalBarChart` | Horizontal bar chart |
| `LineChart` | Multi-series line chart with smooth curves and legend |
| `VerticalStackedBarChart` | Vertical stacked bar chart |
| `HorizontalStackedBarChart` | Horizontal stacked bar chart with optional icons/flags |
| `DivergingBarChart` | Horizontal diverging bar chart with reference line |
| `BubbleChart` | Scatter plot with sized bubbles |
| `GroupedColumnChart` | Grouped column chart |
| `SlopeGraph` | Slope graph comparing two time points |
| `RadialChart` | Radar/spider chart with optional icon labels |
| `PyramidChart` | Population pyramid chart |
| `DonutChart` | Donut chart |
| `PieChart` | Pie chart |
| `WaffleChart` | Waffle/grid chart |
| `ParliamentChart` | Parliament/hemicycle chart |
| `PictogramChart` | Pictogram/icon array chart |
| `MarimekkoChart` | Marimekko/mosaic chart |
| `TreemapChart` | Treemap chart |
| `ProportionalAreaChart` | Proportional area comparison |
| `StreamGraph` | Streamgraph (stacked area) |
| `HeatMap` | Heat map grid |
| `CorrelationMatrix` | Correlation matrix with color scale |
| `CalendarHeatmap` | Calendar-based heatmap |
| `ContourPlot` | 2D density contour plot |
| `BigNumber` | Large formatted number display with shadow depth |
| `ChoroplethMap` | Choropleth map of Brazil with optional capital bubbles |
| `TierSmallMultiples` | Five small choropleth maps by city-size tier |
| `ColorPalette` | Visual display of color palettes |

## Design tokens

Tokens are exported from the package root.

```ts
import { blue, orange, teal, black, typography, spacing, defaultMargin } from 'sniic-design-system';
```

### Named colors

Individual color constants derived from the Brazilian Government Design System:

`blue`, `orange`, `teal`, `yellow`, `purple`, `lime`, `red`, `green`, `black`, `white`

### Color scales

```ts
import { colorScales } from 'sniic-design-system';
// colorScales.sequential, colorScales.diverging, etc.
```

### Palettes

```ts
import { categorical8 } from 'sniic-design-system';
// 8-color categorical palette
```

### Typography

```ts
typography.fontFamily          // "'Inter', system-ui, sans-serif"
typography.chartValueFontFamily // "'Space Grotesk', monospace"
typography.sizes.xs            // 10
typography.sizes.sm            // 12
typography.sizes.md            // 14
typography.sizes.lg            // 16
```

### Spacing

```ts
spacing.xs  // 4
spacing.sm  // 8
spacing.md  // 16
spacing.lg  // 24
spacing.xl  // 32
```

### Margin

```ts
defaultMargin // { top: 20, right: 20, bottom: 40, left: 48 }
```

The `Margin` interface is also exported for typing custom margin props:

```ts
import type { Margin } from 'sniic-design-system';
```

## Utilities

| Export | Description |
|---|---|
| `colorContrast` | Pick light/dark text for a given background |
| `formatters` | Brazilian locale number/currency formatters |
| `tooltip` | Tooltip positioning helpers |
| `geoLoader` | Async GeoJSON loader for Brazil maps |
| `axisHelpers` | Axis tick calculation utilities |
| `resizeObserver` | Svelte-friendly ResizeObserver action |
| `exportSvg` | Export SVG elements to PNG/SVG files |
| `labelHelpers` | Text measurement, font sizing, label fitting |
| `colorMapHelpers` | Category-to-color mapping and legend item builders |
| `tooltipState` | Shared tooltip state management |

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Build the library
npm run storybook    # Start Storybook on port 6006
npm run check        # Run Svelte type checking
```

## Tech stack

- [Svelte 5](https://svelte.dev)
- [D3](https://d3js.org) — scales, axes, and path generation
- [Vite](https://vitejs.dev) — bundler
- [Storybook](https://storybook.js.org) — component explorer
- [TypeScript](https://www.typescriptlang.org)

## License

MIT
