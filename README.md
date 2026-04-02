# sniic

A Svelte component library with chart components and design tokens based on the [Brazilian Government Design System](https://www.gov.br/ds/fundamentos-visuais/cores) (Padrão Digital de Governo).

## Requirements

- Node.js 18+
- npm 9+

## Getting started

```bash
npm install
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build the library |
| `npm run preview` | Preview the production build |
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run build-storybook` | Build static Storybook |
| `npm run check` | Run Svelte type checking |

## Components

### BarChart

Renders a vertical bar chart using D3.

```svelte
<script>
  import { BarChart } from 'sniic';

  const data = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 85 },
    { label: 'Mar', value: 200 },
  ];
</script>

<BarChart {data} width={600} height={400} xLabel="Month" yLabel="Sales" />
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `{ label: string; value: number }[]` | `[]` | Data points to render |
| `width` | `number` | `600` | SVG width in px |
| `height` | `number` | `400` | SVG height in px |
| `color` | `string` | `colors.primary[0]` | Bar fill color |
| `margin` | `Margin` | `defaultMargin` | Chart margins |
| `xLabel` | `string` | `''` | X-axis label |
| `yLabel` | `string` | `''` | Y-axis label |

---

### LineChart

Renders a multi-series line chart using D3. Supports smooth curves and an automatic legend.

```svelte
<script>
  import { LineChart } from 'sniic';

  const series = [
    {
      name: 'Revenue',
      data: [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 140 },
        { label: 'Mar', value: 130 },
      ],
    },
    {
      name: 'Expenses',
      color: '#e52207',
      data: [
        { label: 'Jan', value: 60 },
        { label: 'Feb', value: 75 },
        { label: 'Mar', value: 90 },
      ],
    },
  ];
</script>

<LineChart {series} width={600} height={400} smooth xLabel="Month" yLabel="USD" />
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `series` | `Series[]` | `[]` | Array of named data series |
| `width` | `number` | `600` | SVG width in px |
| `height` | `number` | `400` | SVG height in px |
| `margin` | `Margin` | `defaultMargin` | Chart margins |
| `xLabel` | `string` | `''` | X-axis label |
| `yLabel` | `string` | `''` | Y-axis label |
| `showDots` | `boolean` | `true` | Show data point dots |
| `smooth` | `boolean` | `true` | Use monotone curve interpolation |

**Series type**

```ts
interface Series {
  name: string;
  color?: string; // defaults to colors.primary palette
  data: { label: string; value: number }[];
}
```

## Design tokens

Tokens are exported from the package root and can be imported directly.

```ts
import { colors, typography, spacing, defaultMargin } from 'sniic';
```

### Colors

Derived from the Brazilian Government Design System (Padrão Digital de Governo).

| Token | Description |
|---|---|
| `colors.primary` | Blue Warm Vivid ramp (5 shades, darkest → lightest) |
| `colors.blue/green/yellow/red/...` | Extended color families with shades `90, 70, 40, 20, 10` |
| `colors.neutral` | Gray ramp (8 shades, darkest → lightest) |
| `colors.success` | `#168821` |
| `colors.warning` | `#ffcd07` |
| `colors.danger` | `#e52207` |
| `colors.info` | `#155bcb` |
| `colors.interactive` | `#1351b4` |
| `colors.visited` | `#0c326f` |
| `colors.focus` | `#c2850c` |

### Typography

```ts
typography.fontFamily // "'Inter', system-ui, sans-serif"
typography.sizes.xs   // 10
typography.sizes.sm   // 12
typography.sizes.md   // 14
typography.sizes.lg   // 16
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
import type { Margin } from 'sniic';
```

## Tech stack

- [Svelte 5](https://svelte.dev)
- [D3](https://d3js.org) — scales, axes, and path generation
- [Vite](https://vitejs.dev) — bundler
- [Storybook](https://storybook.js.org) — component explorer
- [Vitest](https://vitest.dev) — unit tests
- [TypeScript](https://www.typescriptlang.org)
