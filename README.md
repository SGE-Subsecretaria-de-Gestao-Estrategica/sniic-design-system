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

---

### AgeGroupChart

Renders a stacked bar chart of age groups (youth / adult / senior) by state, normalised to percentages.

```svelte
<script>
  import { AgeGroupChart } from 'sniic';

  const data = [
    { uf: 'SP', youth: 1200, adult: 3500, senior: 800 },
    { uf: 'RJ', youth: 900,  adult: 2800, senior: 650 },
  ];
</script>

<AgeGroupChart {data} />
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `StateAgeRow[]` | `[]` | Array of per-state age counts |

**StateAgeRow type**

```ts
interface StateAgeRow {
  uf: string;
  youth: number;   // 15–29 years old
  adult: number;   // 30–59 years old
  senior: number;  // 60+ years old
}
```

---

### BubbleScatter

Renders a log-scale scatter plot where each bubble represents a Brazilian state. Bubble size encodes number of funded projects; colour encodes region. Includes interactive tooltips.

```svelte
<script>
  import { BubbleScatter } from 'sniic';

  const states = {
    'São Paulo': { uf: 'São Paulo', popTotal: 45919049, valorRecebido: 500000000, qtdFomentos: 120, valorPerCapita: 10.88 },
    'Pará':      { uf: 'Pará',      popTotal: 8690745,  valorRecebido:  80000000, qtdFomentos:  30, valorPerCapita:  9.20 },
  };
</script>

<BubbleScatter {states} />
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `states` | `Record<string, BubbleScatterRow>` | `{}` | Map of state name → data row |

**BubbleScatterRow type**

```ts
interface BubbleScatterRow {
  uf: string;
  popTotal: number;
  valorRecebido: number;
  qtdFomentos: number;
  valorPerCapita: number;
}
```

---

### GenderDivergingBar

Renders a horizontal diverging bar chart showing female vs. male participation per state, with an optional national average reference line.

```svelte
<script>
  import { GenderDivergingBar } from 'sniic';

  const data = [
    { uf: 'SP', pctFeminino: 42.3, qtdFeminino: 508, qtdMasculino: 692 },
    { uf: 'BA', pctFeminino: 38.1, qtdFeminino: 210, qtdMasculino: 341 },
  ];
</script>

<GenderDivergingBar {data} nationalAvg={40.5} />
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `GenderRow[]` | `[]` | Per-state gender breakdown |
| `nationalAvg` | `number` | `0` | National average % (shown as dashed reference line) |

**GenderRow type**

```ts
interface GenderRow {
  uf: string;
  pctFeminino: number;
  qtdFeminino: number;
  qtdMasculino: number;
}
```

---

### StackedBarChart

Renders a horizontal stacked bar chart split into two categories (`audiovisual` and `demais`), sorted by total value descending. Values are formatted as BRL currency.

```svelte
<script>
  import { StackedBarChart } from 'sniic';

  const data = [
    { uf: 'SP', audiovisual: 12000000, demais: 8000000 },
    { uf: 'RJ', audiovisual:  7500000, demais: 4200000 },
  ];
</script>

<StackedBarChart {data} />
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `StackedBarRow[]` | `[]` | Per-state values split by category |

**StackedBarRow type**

```ts
interface StackedBarRow {
  uf: string;
  audiovisual: number;
  demais: number;
}
```

---

### ChoroplethMap

Renders a choropleth map of Brazil coloured by a numeric metric. Supports an optional capital-city bubble overlay and emits the hovered state via a bindable prop.

```svelte
<script>
  import { ChoroplethMap } from 'sniic';

  const states = {
    'São Paulo': { execucaoFinanceira: 95.2, valorRecebido: 500000000 },
    'Pará':      { execucaoFinanceira: 78.4, valorRecebido:  80000000 },
  };

  let activeState = $state(null);
</script>

<ChoroplethMap
  {states}
  metric="execucaoFinanceira"
  label="Execução financeira (%)"
  format={(v) => `${v.toFixed(1)}%`}
  bind:activeState
/>
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `states` | `Record<string, object>` | `{}` | Map of state name → data object |
| `metric` | `string` | `'execucaoFinanceira'` | Key to read from each state object |
| `label` | `string` | `''` | Tooltip label prefix |
| `format` | `(v: number) => string` | `v.toLocaleString('pt-BR')` | Value formatter |
| `colorRange` | `string[]` | `[black, blue]` | Two-colour gradient range |
| `activeState` | `object \| null` | `null` | Bindable — set to hovered state object |
| `capitals` | `ChoroplethCapital[]` | `[]` | Capital city data for bubble overlay |
| `showCapitals` | `boolean` | `false` | Enable capital bubble overlay |

---

### TierSmallMultiples

Renders five small choropleth maps of Brazil, one per city-size tier (Capitais, Grande Porte, Médio Porte, Pequeno Porte II, Pequeno Porte I), sharing a common colour scale.

```svelte
<script>
  import { TierSmallMultiples } from 'sniic';

  const tiers = {
    Capitais:          { 'São Paulo': { execucaoFinanceira: 95.2 } },
    'Grande Porte':    { 'Campinas':  { execucaoFinanceira: 88.0 } },
    'Médio Porte':     {},
    'Pequeno Porte II':{},
    'Pequeno Porte I': {},
  };
</script>

<TierSmallMultiples
  {tiers}
  metric="execucaoFinanceira"
  format={(v) => `${v.toFixed(1)}%`}
/>
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `tiers` | `Record<string, Record<string, object>>` | `{}` | Map of tier name → (state name → data) |
| `metric` | `string` | `'execucaoFinanceira'` | Key to read from each city object |
| `format` | `(v: number) => string` | `` `${v.toFixed(1)}%` `` | Value formatter for legend |

---

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
