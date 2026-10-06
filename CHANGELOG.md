# Changelog

All notable changes to this project will be documented in this file.

## [1.0.30] - 2026-09-02

### Added
- **shapeFactory**: new `generateRoundedRect()` utility to generate an SVG path for a rectangle rounded on a single side (`top` | `right` | `bottom` | `left`).
- **Theme**: new `missing` style block on `ChartTheme` (fill, opacity, stroke, strokeWidth, strokeDasharray) to represent missing data points, with a new `MissingStyle` type.
- **Circle** marker: new `strokeDasharray` prop, also added to the shared `CommonShapeProps` type.
- New `textures` dependency (`^1.2.3`), with hand-written type declarations added at `src/lib/types/textures.d.ts`.

### Changed
- **Theme tokens**: pillar 1 palette colors updated (primary, primaryVariant, secondary, secondaryVariant, accent); new `spacing` steps `xs` (4), `xl` (24), `xxl` (32), `xxxl` (48) and `lg` increased from 14 to 16; `strokeWidth` scale reduced (xs 2.5→1, sm 4→1.5, md 8→2, lg 12→2.5) for publication compliance.
- **Theme**: default per-pillar `text.fill` changed from `neutral[200]` to `neutral[300]`.
- **formatCompactNumber**: suffixes changed from "B"/"M" to " bi"/" mi" (pt-BR), for publication compliance.

## [1.0.29] - 2026-08-19

### Added
- **format**: new `core/format` module — `formatLocale` (d3 pt-BR locale: "." thousands, "," decimal, "R$" currency) plus `formatCompactNumber` and `parseFormattedNumber` utilities, re-exported from `theme`/`core`.
- **Text**: new `suffix` / `suffixScale` / `suffixXOffset` / `suffixYOffset` props to render a smaller trailing tspan (e.g. a unit) next to wrapped text.
- **Theme**: `pillarPalettes` gained `primaryVariant`/`secondaryVariant` colors; `Tokens` and all theme types are now re-exported from `theme/index`.

### Changed
- **Theme tokens**: `fontSize` gained `xs` (9) and `sm` moved to 10.5; base/neutral palette values updated; `spacing` gained `none`/`sm`/`md`/`lg` steps; `strokeWidths` renamed to `strokeWidth` with an `xs`/`sm`/`md`/`lg` scale.
- **Theme**: default marker circle fill now uses `pillarPalette.primaryVariant` instead of a computed `d3.color().darker()`; grid `strokeWidth` reduced 3→1.5; text `lineHeight` now resolves through the theme cascade (default `1.1em`) instead of a hardcoded prop default; `DefaultTheme` now resolves pillar 1 instead of pillar 6.
- **Markers**: snippet props `datum`/`index` merged into a single `data` prop.

### Fixed
- CI: publish workflow restores `registry-url` in `setup-node` so the OIDC trusted-publishing handshake completes (publish was failing with `ENEEDAUTH`).

## [1.0.28] - 2026-07-31

### Added
- **RibbonChart**: new chart — stacked columns whose series reorder by value within each category, connected across columns by a ribbon so a rank change reads as a crossing. Built on the core primitives (`Chart`, `Axis`, `Bar`, `Text`); segment gaps are reserved in the scale range rather than the domain so pixel gaps don't shift the Y axis. Values render inside their column and fall back to a leader-line callout (new `utils/callouts` `placeCallouts` + `core/components/annotation/ValueCallout`) when a segment is too small.
- **LegendChips**: new legend molecule — a continuous strip of color-filled chips with rounded end caps only, for layouts where `Legend`'s per-item spacing doesn't fit.

### Changed
- npm publish now authenticates via GitHub Actions' own OIDC (Trusted Publishing) instead of a `NPM_TOKEN` secret that was never set (publish was failing with `ENEEDAUTH`); also fixes `package.json`'s `repository.url`, which pointed at the wrong org and would have broken provenance generation.
- Storybook dependencies updated.

## [1.0.27] - 2026-07-31

### Added
- **core**: primitives layer completed — `Chart` (responsive container driven by theme margins, exposing resolved dimensions to a children snippet), `GridRows` (mirroring `GridColumns`), `Bar`/`BarStack`/`BarGroup` (both orientations, with a geometry snippet), `Arc`, `AreaPath`, and `Legend` (row/column layout with a custom-item snippet, exported as `ChartLegend` to avoid clashing with the legacy atom).
- **Theme**: gained `bar`/`area`/`arc`/`legend` styles, a default margin, and a categorical palette derived from the pillar colors, plus `getCategoricalColor` for per-series assignment.
- `LineChart`, `VerticalBarChart`, `HorizontalBarChart`, `VerticalStackedBarChart`, `HorizontalStackedBarChart` and `LegendBar` rebuilt on the core primitives instead of `ChartFrame`/the atoms layer. Existing props are unchanged, but each chart gains optional `width`/`responsive`/`theme`, and the stacked charts gain a configurable `margin`. Theme-driven defaults now apply when colors aren't passed explicitly: series colors default to the categorical palette, bars lose their black outline and gain 2px corners, and grids render solid instead of dashed.

### Fixed
- `useAxis`: band scales no longer fall back to a stringified `[object Undefined]` tick label, and no longer receive a numeric `numTicks` that silently thinned a 27-state axis down to 9 labels — tick count now defaults per scale type.
- `AxisRenderer`: tick label anchors now follow the axis orientation instead of always centering, fixing overlap on long left-axis category names.
- `Text` no longer leaks its own `text` prop through to the DOM as an invalid attribute.
- `getStringWidth` no longer throws when measuring styled text (was passing a CSS string to `Object.assign`, which fails on `CSSStyleDeclaration`'s read-only indexed properties) — measurements had been silently falling back to character-count estimates.
- `GridColumns` now forwards `strokeOpacity`.
- `Palette.number` type now matches the neutral ramp `semantic.ts` actually populates.

### Internal
- CI: added the missing build/publish workflows, so the "Build" and "Version bump" status checks required by the `protect-main` ruleset are actually reported (PRs had been stuck blocked without them).

## [1.0.26] - 2026-07-27

### Added
- **core**: foundational primitives layer started — `Svg`, `Group`, `Text`, `Theme`, `Axis`/`AxisRenderer`/`Ticks`, `GridColumns`, `Circle`/`Marker`/`MarkerCircle`/`Markers`, `Line`/`LinePath`, plus supporting hooks (`useAxis`, `useText`) and utils (`coerceNumber`, `getLabelTransform`, `getScaleBandwidth`, `getStringWidth`, `getTicks`, `memoize`, `setNumberOrNumberAccessor`, `shapeFactory`).
- New theme system for the core layer (`theme/context`, `theme/semantic`, `theme/tokens`, `theme/types`, `theme/utils`) driving the primitives above.
- General Sans variable typeface ingested (regular + italic), plus the PNAB and PNAB-simples logos.

## [1.0.25] - 2026-06-26

### Added
- **StateFlag**: BR (Brasil) national flag added alongside the existing state flags.

## [1.0.24] - 2026-06-25

### Changed
- **AnnotationBox**, **SimpleBox**, **EnterpriseSilhouette**: corners squared off (`rx` 0), for consistency with the new visual language.
- In-progress corner-radius adjustments to `BigNumber`, `EqualSign`, `RadialChart`, `TreemapChart` and `ChartFrame`.

## [1.0.23] - 2026-06-22

### Changed
- Typography: Rawline is now the default font family across all charts (`typography.fontFamily` and `chartValueFontFamily` in `tokens.ts`), replacing Inter (axes/legends/UI) and Space Grotesk (values) — including hardcoded Space Grotesk usages in `ChoroplethMap`, `Tooltip` and `TierSmallMultiples`. Standardizes chart typography on the Brazilian Federal Government's official typeface for InDesign-consistent layouts.

## [1.0.22] - 2026-06-08

### Changed
- **BigNumber**: now renders as `<svg>` for native export support; new `subtitle` prop (centered text below the number), `labelColor` and `subtitleColor` props (default black), and `width` prop for SVG dimensions.

## [1.0.21] - 2026-05-28

### Fixed
- **DonutChart**: legend now wraps to 2 rows when there are more than 3 items, and `outerR` no longer overflows the chart bounds.

## [1.0.20] - 2026-05-28

No functional changes (version bump only).

## [1.0.19] - 2026-05-28

### Changed
- **DonutChart**: legend switches to a column layout when there are more than 3 items.

### Fixed
- **HeatMap**: gradient legend render guarded until `innerWidth` is available (was rendering before layout was ready).

## [1.0.18] - 2026-05-27

### Changed
- **DonutChart**, **PictogramChart**, **PieChart**: legend centered horizontally within the chart.

### Fixed
- `downloadSvg`: now works inside sandboxed iframes (e.g. Storybook) by targeting `window.top` when available.
- `SvgExportDecorator`: migrated from `<slot />` to a `children` snippet (Svelte 5).

## [1.0.16] - 2026-05-27

### Added
- **EnterpriseSilhouette**: new stepped office-building silhouette component (window grid + 5 CNPJ-themed annotation boxes), exported from `src/lib/index.ts`.

### Changed
- **BodySilhouette**: replaced the face-profile silhouette with a front-facing body figure (scaled 0.80×, positioned left) alongside 5 PPE annotation boxes.

## [1.0.15] - 2026-05-26

### Changed
- **AnnotationBox**: box width is now capped at `innerWidth / 2` by default when `innerWidth` is provided, preventing overflow on smaller viewports. Text (title and subtitle) automatically word-wraps to fit within the box using canvas-based measurement. A new `maxBoxWidth` prop allows explicit override of the cap.

## [1.0.14] - 2026-05-26

### Changed
- **PyramidChart**: restored Space Grotesk font family; refactored label placement with smarter positioning and axis labels.

## [1.0.13]

### Added
- **EqualSign**: new atom component.
- **AnnotationBox**: new `fullWidth` prop to stretch the box to the right edge of the inner chart area.

## [1.0.12]

### Added
- **AnnotationBox**: new `showTitle` prop to toggle title visibility.

## [1.0.10]

### Fixed
- `dist/index.d.ts` type generation.

## [1.0.9]

### Added
- **DivergingBarChart**: new `marginLeft` prop.
