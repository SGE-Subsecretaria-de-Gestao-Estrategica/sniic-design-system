# sniic-design-system

A Svelte 5 component library with chart components and design tokens based on the [Brazilian Government Design System](https://www.gov.br/ds/fundamentos-visuais/cores) (Padrão Digital de Governo), used by SNIIC's data publications — Cultura em Números, the LPG and PNAB boletins, and others.

## Installation

```bash
npm install sniic-design-system
```

This library requires **Svelte 5** and **D3 7+** as peer dependencies:

```bash
npm install svelte d3
```

## Usage

```svelte
<script>
  import { VerticalBarChart, HalteresChart, colorScales } from 'sniic-design-system';
</script>
```

### Styles and fonts

The package's `exports` map exposes only the root entry, so load the stylesheet through its path in `node_modules`:

```ts
import '../node_modules/sniic-design-system/dist/sniic.css';
```

Fonts are not loaded for you:

- **Rawline** (Governo Federal) is the default typeface of the general charts (`typography.fontFamily`). It is **not** shipped in the package. Serve it yourself with an `@font-face` for `'Rawline'`.
- **General Sans Variable** is the typeface of the Eixo 1 and `figuras` charts. It ships in `dist/typefaces/GeneralSans-Variable.ttf`. Copy it to your static assets and declare it:

  ```css
  @font-face {
    font-family: 'General Sans Variable';
    src: url('/typefaces/GeneralSans-Variable.ttf') format('truetype-variations');
    font-weight: 200 700;
    font-display: swap;
  }
  ```

  The Eixo 1 and `figuras` charts measure their text once, in a canvas, to wrap titles and labels. If the font hasn't loaded yet, the measurement uses the fallback font and lines overflow the figure. Wait for it before rendering, for example with `await document.fonts.load('700 12px "General Sans Variable"')`. Only `DispersaoLogChart` re-measures on its own.

## Architecture

There are three layers, all exported from the package root:

- **Core primitives** (`src/lib/core/`) — composable, themeable building blocks in the style of visx (`Chart`, `Axis`, `Grid`, `Bar`, `BarStack`, `LinePath`, `Arc`, `Legend`…) with a theme context. **New general-purpose charts are built on this layer.**
- **Legacy atoms and molecules** — the previous generation (`ChartFrame`, `XAxis`, `Legend`, `DataTable`…), following atomic design. They stay exported while the organisms migrate to `core`, one chart at a time.
- **Print figures** — self-contained SVG cards in the Cultura em Números idiom, sized for A4 print and SVG export: the Eixo 1 bases and the generic `figuras` bases. Title, subtitle, legend, notes and source are drawn inside the `<svg>`.

All charts use **D3** for scales and layouts, with **SVG rendering**.

Charts tied to a specific project's data and copy live in that project's repository, which consumes the generic bases from here. The LPG boletim figures, for instance, live in `LPG-2026/data-viz`. Storybook is organised by project, one top-level folder each:

- `Cultura em Números` — `Catálogo por função` (every chart grouped by the question it answers), `Primitivas` (the `src/lib/core` shapes the family is built from) and `Gráficos` (one docs page per chart: when to use it, data shape, props, steps). Stories in `src/stories/cultura-em-numeros/`.
- `PNAB` — the first-generation layer (`components/atoms`, `molecules`, `ChartFrame` and the charts built on them): `Fundamentos`, `Átomos`, `Moléculas`, `Gráficos`. Stories in `src/stories/pnab/`.
- `LPG` — `Figuras`, the generic print bases the LPG boletim composes. Stories in `src/stories/lpg/`.

## Components

### Core primitives

| Group | Exports |
|---|---|
| Container | `Chart`, `Svg`, `Group`, `Text`, `Theme` |
| Axes and grid | `Axis`, `AxisRenderer`, `Ticks`, `Grid`, `GridRows`, `GridColumns` |
| Shapes | `Line`, `LinePath`, `AreaPath`, `Arc`, `Bar`, `BarStack`, `BarGroup`, `RoundedBar` |
| Markers | `Marker`, `MarkerCircle`, `Markers`, `Circle` |
| Legend | `ChartLegend` (core's `Legend`, renamed at the root to avoid the legacy atom), `LegendChips` |
| Annotation | `ValueCallout`, `HighlightCallout`, `TimelineBreak` |
| Interaction | `HoverLayer`, `HitTarget`, `Crosshair`, `ChartTooltip`, `HoverState`, `ScrollySteps`, `scrollStep` |
| Theme | `DefaultTheme`, `getPillarTheme`, `getChartTheme`, `setChartTheme`, `getCategoricalColor` |
| Utilities | `roundedRect`, `wrapText`, `relativeLuminance`, `contrastRatio`, `pickContrastInk`, `getTicks`, `getStringWidth`… |

### Figuras — generic print bases

Data-agnostic bases in the Eixo 1 print idiom. Everything comes in by prop, including colors and `corTexto` (the dark text tone, which defaults to Eixo 1's `#2F2F2B`).

| Component | Description |
|---|---|
| `HalteresChart` | Dumbbell chart: two shares per row on a shared axis, with an optional gradient stroke and an extra column |
| `FluxoComposicaoChart` | Two 100% bars over the same categories, linked category by category, with optional notes |
| `PainelMetricasChart` | One row per category and one column per metric, each column on its own scale, with reference lines |
| `BarraComposicaoChart` | Horizontal 100% stacked bars, optionally grouped in pairs |
| `MosaicoChart` | Treemap whose area is one measure and whose label can state another |
| `DispersaoLogChart` | Log–log scatter with iso-product bands (for measures that multiply) and annotations |
| `Destaque` | The annotation used by the bases: a large value in the measure's color, with a phrase below |
| `RAIO_BARRA`, `segmentoPath` | Shared bar corner radius and path helper. Pass `raio={RAIO_BARRA}` to the bar bases below so the corners match |
| `BarraRankingChart` | Ranking bars, largest first, value past the tip (formerly an Eixo 1 base) |
| `BarraDivergenteChart` | Two bars per category from a shared zero (formerly an Eixo 1 base) |
| `ColunaCategoriaChart` | Stacked columns by category, in absolute values (formerly an Eixo 1 base) |
| `CoropletoUfChart` | Choropleth by state on the IBGE mesh, with callouts (formerly an Eixo 1 base) |

### Eixo 1 — print tokens

The Eixo 1 chart bases are gone: each one has a generic Cultura em Números chart below that does the same job, and the four the LPG bulletin prints with (`BarraRankingChart`, `BarraDivergenteChart`, `ColunaCategoriaChart`, `CoropletoUfChart`) moved to the figure bases above. What remains is the A4 print system those figures use, exported as namespaces so it doesn't clash with the package's generic `colors` and `fontSize`: `eixo1Cores`, `eixo1Tokens` and `eixo1LayoutLegend`.

The UF mesh ships inside `CoropletoUfChart`, `MapaUfChart` and `MapaMunicipiosChart`. The municipal mesh does not: pass your own to `MapaMunicipiosChart` as `mesh` (type `MalhaMunicipiosProjetada`).

### Interactive, step-controlled charts

`LinhaParticipacaoChart`, `LinhasComparadasChart`, `LinhasDiferencaChart`, `BolhasComparadasChart`, `BarrasRankingChart`, `BarrasDivergentesChart`, `LinhasAntesDepoisChart`, `BarrasCascataChart`, `ColunasEmpilhadasChart`, `LinhasPaineisChart`, `CurvaConcentracaoChart`, `FaixasParticipacaoChart`, `BolhasMatrizChart`, `CristasDensidadeChart`, `MapaUfChart`, `MapaMunicipiosChart` and `MapaHexagonalChart` are interactive charts controlled by a `step` prop, for scrollytelling hosts. Born in Eixo 6, they are the reference for the rest: named by form, with the publication's text and data passed in as props. Their data types, `*_STEPS` and scale helpers are exported alongside them; see `src/lib/components/eixo6/README.md`.

### Legacy atoms and molecules

| Component | Description |
|---|---|
| `XAxis`, `YAxis`, `GridLines` | Axes and grid lines |
| `Legend`, `GradientLegend`, `LegendBar` | Color-keyed legends |
| `ChartTitle`, `SegmentLabel` | Chart title and segment labels |
| `BarRect` | Reusable bar rect with safety guards |
| `ReferenceLine` | Annotated reference line (vertical/horizontal) |
| `BubbleWithLabel` | Circle with optional ring and contrast-aware text label |
| `ChartFrame` | Responsive SVG wrapper with margins, font loading and `ResizeObserver` |
| `Tooltip`, `TooltipContainer` | Tooltip overlays |
| `AnnotationBox`, `SimpleBox` | Bordered annotation and value boxes |
| `DataTable` | SVG-rendered data table |
| `BodySilhouette`, `EnterpriseSilhouette` | Silhouette illustrations |

Icons: `IconFavela`, `IconTerritorioIndigena`, `IconTerritorioQuilombola`, `IconRural`, `IconCidade`, `IconInterior`, `IconPerson`, `IconMunicipioPequenoI`, `IconMunicipioPequenoII`, `IconMunicipioMedio`, `IconMunicipioGrande`, `StateFlag`.

### Chart components

| Component | Description |
|---|---|
| `VerticalBarChart`, `HorizontalBarChart` | Bar charts |
| `VerticalStackedBarChart`, `HorizontalStackedBarChart` | Stacked bar charts (the horizontal one supports icons and flags) |
| `GroupedColumnChart` | Grouped column chart |
| `DivergingBarChart` | Horizontal diverging bar chart with a reference line |
| `LineChart` | Multi-series line chart |
| `SlopeGraph` | Slope graph comparing two points in time |
| `BubbleChart` | Scatter plot with sized bubbles |
| `BoxPlotChart` | Box plot (with `computeBoxStats`) |
| `RadialChart` | Radar chart with optional icon labels |
| `PyramidChart` | Population pyramid |
| `DonutChart`, `PieChart` | Donut and pie charts |
| `WaffleChart`, `PictogramChart` | Waffle and pictogram charts |
| `ParliamentChart` | Hemicycle chart |
| `MarimekkoChart`, `TreemapChart`, `ProportionalAreaChart` | Area-based part-to-whole charts |
| `StreamGraph`, `RibbonChart` | Stacked-area and ribbon charts |
| `HeatMap`, `CorrelationMatrix`, `CalendarHeatmap` | Grid heat maps |
| `ContourPlot` | 2D density contour plot |
| `ChoroplethMap`, `TierSmallMultiples` | Choropleth of Brazil, and five small maps by city-size tier |
| `RegionSilhouetteChart`, `StatesSilhouetteChart` | Region and state silhouettes |
| `BigNumber`, `EqualSign` | Large formatted numbers |
| `ColorPalette` | Visual display of the color palettes |

## Design tokens

Tokens are exported from the package root.

### Colors

Named colors derived from the Brazilian Government Design System: `blue`, `orange`, `teal`, `yellow`, `purple`, `lime`, `red`, `lavender`, `white`, `cream`, `black`. The aliases `amber`, `green` and `darkGreen` also exist.

`colorScales` holds a five-step ramp per hue, from light to dark, with the base color at index 2:

```ts
import { colorScales } from 'sniic-design-system';

colorScales.blue;      // ['#d5e4f7', '#9fbbe0', '#4271b5', '#2e4e8a', '#0b1540']
colorScales.purple[2]; // '#a44c7f'
// blue, orange, teal, yellow, purple, lime, red, lavender
```

### Palettes

```ts
import { categorical3, categorical5, categorical8, colorPairs } from 'sniic-design-system';

colorPairs.bluePurple; // ['#4271b5', '#a44c7f'] — two-series pairs at the base tone
```

### Typography, spacing and margin

```ts
import { typography, spacing, defaultMargin } from 'sniic-design-system';

typography.fontFamily; // "'Rawline', 'Raleway', system-ui, sans-serif"
typography.sizes;      // { xs: 10, sm: 12, md: 14, lg: 16 }
spacing;               // { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
defaultMargin;         // { top: 20, right: 20, bottom: 40, left: 48 }
```

## Utilities

| Export | Description |
|---|---|
| `colorContrast` | Pick light or dark text for a given background |
| `formatters` | Brazilian-locale number and currency formatters |
| `exportSvg` | `serializeSvg` and `downloadSvg`, for exporting charts |
| `geoLoader` | Async GeoJSON loader for Brazil maps |
| `axisHelpers`, `scaleHelpers`, `stackHelpers` | Axis ticks, scales and stacking |
| `labelHelpers` | Text measurement, font sizing and label fitting |
| `colorMapHelpers` | Category-to-color mapping and legend item builders |
| `callouts` | Callout placement helpers |
| `tooltip`, `tooltipState` | Tooltip positioning and shared state |
| `resizeObserver` | Svelte-friendly `ResizeObserver` action |

## Development

```bash
npm install          # install dependencies
npm run storybook    # Storybook on port 6006
npm run build        # build the library into dist/
npm run check        # svelte-check (some errors predate the current work; CI runs it as informational)
```

To try unreleased changes in a consuming app, point its dependency at your checkout (`"sniic-design-system": "file:../sniic-dsm"`) and run `npm run build` here after each change. Also add `resolve: { dedupe: ['svelte', 'd3'] }` to the app's Vite config: otherwise the symlinked bundle resolves Svelte from this repo's `node_modules`, and the app runs two copies. To go back to the published version, remove the symlink and run `npm install sniic-design-system@<version>`. A plain `npm install` keeps the link when the local version satisfies the range.

## Releasing

Releases are published by CI; nobody runs `npm publish` by hand.

1. On your branch, bump the version: `npm version patch|minor|major --no-git-tag-version`, then commit it. The workflow creates the tag.
2. Open a PR to `main`. `main` is protected: it accepts no direct pushes and requires the **Build** and **Version bump** checks. **Version bump** fails if the version is already on npm.
3. Merging runs `publish.yml`, which builds, publishes to npm through Trusted Publishing (OIDC, with provenance, no token) and pushes the `vX.Y.Z` tag.

A new version can take a few minutes to show up in `npm view`.

## Tech stack

- [Svelte 5](https://svelte.dev)
- [D3](https://d3js.org): scales, axes and path generation
- [Vite](https://vitejs.dev): bundler, in library mode
- [Storybook](https://storybook.js.org): component explorer
- [TypeScript](https://www.typescriptlang.org)

## License

MIT
