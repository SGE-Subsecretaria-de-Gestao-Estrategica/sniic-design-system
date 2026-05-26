# Changelog

All notable changes to this project will be documented in this file.

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
