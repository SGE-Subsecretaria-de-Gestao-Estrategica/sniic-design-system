# Chart builder

A four-step wizard (data → chart → mapping → style) that turns a CSV into one
of the library's charts. It sits on top of `core` and is the only place that
knows about CSV columns: layouts and layout components are used unchanged,
through accessors. It is not exported from `src/lib/index.ts` yet.

The rules that shape the code are in the repository's `CLAUDE.md`. This file
is the map: what each folder holds and how the parts connect.

## How a chart gets drawn

```
file ─► data/ ─► rows ─┐
                       ├─► resolve/resolveChart ─► ReadyChart ─► ChartView ─► views/<Name>View
ChartSpec (spec/) ─────┘         │
                                 └─ registry/: the chart's definition and its build()
```

1. `data/` reads the file into a `Table` (raw strings) and coerces it into
   typed `rows` using the column schema in the spec.
2. `spec/` holds every choice the user made as plain JSON (`ChartSpec`).
3. `resolve/resolveChart(spec, rows, registry)` drops incomplete rows,
   combines repeated keys, and calls the chart's `build`, which calls a `core`
   layout function. It never throws: the result is empty, incomplete, an
   error, or ready.
4. `components/ChartView.svelte` draws a ready chart by picking the view for
   its id; the view carries the chart's look.

`state/BuilderState.svelte.ts` owns the spec and derives the rest;
`components/Builder.svelte` is the wizard around it.

## `data/`

| File | What it does |
|---|---|
| `types.ts` | `ColumnSchema`, `Row`, `Table` (unique headers + raw string rows), `ColumnIssues`. Column types: `number`, `date`, `text`, `uf` |
| `file.ts` | `readCsvFile`: .csv / .txt, 5 MB limit, UTF-8 then Windows-1252 |
| `table.ts` | `detectDelimiter`, `parseTable`, `FIELD_SEPARATORS` |
| `coerce.ts` | `parseNumber(raw, decimal)` (thousands only in groups of three), `parseDate`, `coerceRows`, `coerceData`; `DECIMAL_SEPARATORS`, `DATE_PATTERNS` |
| `infer.ts` | `detectDecimal`, `inferColumn` / `inferSchema` (≥ 90% parse rate; years are numbers; leading-zero codes are text; siglas or state names are UFs), `columnAs`, `yearLikeColumns` |
| `uf.ts` | `UFS` (sigla, name, IBGE code), `parseUf` (any of the three), `parseUfName` (sigla or name) |
| `issues.ts` | `cellFails`, `columnIssues`, `describeIssues` |
| `labels.ts` | `COLUMN_TYPE_LABELS` |

A `uf` column is text that names a state. Its cells stay as written (so a
bar chart shows the file's own names) and a cell that isn't a state is a
failed cell, like "Brasil" in a total row. IBGE codes are numbers to the
detection, so that column becomes a UF only when its type is set by hand.

## `spec/`

`ChartSpec` (`types.ts`), `version: 1`:

- `data`: file name, separators, column schema
- `chart`: a registry id or `null`
- `encoding`: channel id → one column name
- `aggregate`: `sum` | `mean` | `count` | `first`
- `style`: `pillar`, `width` / `height` (the figure, margins included; `null`
  = the chart's default), `margin` (a preset id or `null`), `format` and
  `formats` (number formats), `options` and `params` (the chart's own
  settings)

It changes only through the pure setters in `spec.ts`, which return a
`SpecChange` (`{ spec, reset }`):

| Setter | Notes |
|---|---|
| `setData`, `setChart` | The only two that prune mappings; `reset` lists what was undone. `setChart` also clears `margin`, `options`, `params` and `formats`, which belong to the chart. |
| `setEncoding` | One column per channel; `null` clears it. |
| `setAggregate` | |
| `setOption` | Throws for an option the chart doesn't declare; `undefined` removes the value. |
| `setParam` | Clamps to the param's range; `null` restores the default. |
| `setFormat` | The main format, or one of the chart's extra formats by id. |
| `setStyle` | Pillar, sizes, margin and the main format only. Sizes are clamped to `SIZE_LIMITS` (160–1600 px) and kept to one decimal (`roundSize`). |
| `autoEncode` | Fills empty required channels with unused compatible columns; year-like columns go to date channels first and to value channels last. |

`format.ts`: `NumberFormat` (`decimals`, `compact`, `percent`, `prefix`,
`suffix`), `createFormatter` (pt-BR). `percent` multiplies by 100; the "%" is
an ordinary suffix that `togglePercent` writes into an empty suffix field, so
it can be edited (e.g. to "pp").

## `registry/`

One `ChartDefinition` per chart (`charts/`), declared with `defineChart` and
listed in `charts/index.ts` (`CHARTS`). `layouts.ts` derives `ChartLayouts`,
`ChartId` and `ChartLayoutView` from that list; nothing is kept by hand.

A definition has:

- `channels`: `id`, `label`, `accepts` (column types), `required`. A `uf`
  column also fits a channel that accepts `text` (`channelAccepts`).
- `keys` and `measures`: rows repeating the `keys` are combined, applying the
  spec's `aggregate` to the `measures`
- `sizing` per axis: `free` (the user sets it), `fitted` (computed, unless the
  user sets a target the layout fits to), `derived`, `fixed`
- `defaultSize`, `margin` (its default margin preset), `extraMargin` (room for
  parts the builder draws, such as the range-rows legend)
- `options`, `params`, `formats` (below)
- `build(rows, context)`: calls the `core` layout function. `context` has
  `read` (typed accessors by channel), `box` (the plot size), `fit` (target
  sizes on fitted axes), `options`, `params`, `warn` (a pt-BR notice under the
  chart) and `solved` (reports the value used in place of a param)

Put `options` after `build` in the object, so `current: (layout) => …` gets
the layout's type.

### Charts

| Id | Channels | From |
|---|---|---|
| `horizontalBars` | category, value | G6.26 |
| `lineSeries` | x (date or number), y, series (optional) | G6.07 |
| `lineBubbleRow` | x, y, size | G6.05: a line panel over a bubble row |
| `lineDifference` | x, y, series (exactly two values) | G6.08: two lines over their difference |
| `rangeRows` | category, group, value | G6.20 |
| `bubbleColumns` | category, value, group (optional) | G6.12 |
| `hexChoropleth` | uf, value, slice (optional) | G6.10: one value per state, coloured by steps |
| `hexTwinBars` | uf, value, type (at most two values) | G6.09: up to two bars per state and a reference line |

The two combined charts stack several `core` layouts on one
`stackPanelsLayout` and return them together; the lower panel reuses
`line.xAxis`, so it shares the line's breaks.

The two hex maps (`hex.ts` holds what they share) are sized by the `radius`
param. Their width is `fitted`: once the user sets a figure width, the radius
is solved from it instead, and the height always follows (`derived`). The
choropleth's ramp runs from the page colour through a colour pair, lighter
first by default or in a chosen direction (`rampOrder`). The part of a twin
bar above the reference line takes the accent colour only when asked
(`accentOver`). The choropleth's `slice` channel is for
files with several rows per state (state and capital, say): one slice is
shown at a time, picked in the mapping step. Both warn about states with no
row and about hexagons too small for the labels.

### Options (`options.ts`, `OptionDef`)

A chart's own settings, stored in `style.options`. Each declares:

- `step`: `mapping` or `style` (which wizard step shows it)
- `drawingOnly`: only the view reads it, so `build` doesn't receive it and
  changing it doesn't rebuild the layout
- a `kind`:

| Kind | Control | Stored |
|---|---|---|
| `choice` | select | one of its values (has a default) |
| `order` | list with ↑ / ↓ | category names; `when` ties it to a value of a choice |
| `value` | select | one value of a channel's column |
| `values` | checkboxes | a list of a channel's values; one `whole` checkbox (`true`) while the channel has no column |
| `number` | number field | a number in the data's own unit (a reference value) |
| `toggle` | checkbox | `true`, or nothing |
| `text` | text field | the text |

Readers: `readChoice`, `readText`, `readNumber`, `readToggle`, `readStringList`,
`isPicked`, `readOrdering`. A stored value that no longer fits the data is
ignored, never an error. The helpers the options panel uses are here too
(`choiceValue`, `ordersOpenedBy`, `pickedValues`, `togglePicked`, `moveItem`,
`layoutOptions`).

Shared options: `SORT_OPTION` + `CATEGORY_ORDER_OPTION` (manual order sits
behind the sort select's "Ordem manual"), `valueLabelsOption`,
`HIGHLIGHT_OPTION`, `ACCENT_END_OPTION`, and `RAIS_BREAK_OPTION` (`rais.ts`:
breaks the x axis after 2021, for dates or years as numbers).

### Params, formats, sizes

- `params.ts`, `ParamDef`: layout numbers the user may tune (`min`, `max`,
  `step`, `default` from the layout's `XXX_DEFAULTS`). `solvedBy` names the
  fitted axis that replaces it; `fit.ts` (`fitBandThickness`) does the solving
  and reports the value through `context.solved`.
- `FormatDef`: a number format besides the main one (the bubbles of
  `lineBubbleRow`, the difference of `lineDifference`).
- `widths.ts`: `WIDTH_PRESETS`, the figure widths of the report's page grid
  (4 to 24 columns; 12 = a full page = `FULL_PAGE_WIDTH`, the default).
- `margins.ts`: `MARGIN_PRESETS`, the margin combinations of the Eixo 6
  figures. There are no free margin inputs.
- `compatibility.ts`: `chartCompatibility(channels, columns)`: can every
  required channel get its own column?

## `encoding/`

`createChannelReader(encoding, columns)` gives strict accessors by channel
(`has`, `text`, `number`, `x`, `uf`). They throw `MissingValueError` on
`null`, so incomplete rows are dropped first (`dropIncomplete`). `uf` gives
the state's sigla whatever the file wrote; `text` on a UF column gives the
cell as written.

## `resolve/`

`resolveChart` returns one of (`types.ts`):

- `EmptyChart`: no chart or no data
- `IncompleteChart`: required channels still to map
- `ErrorChart`: a pt-BR message and the `step` where it is fixed (`style` for
  a size smaller than the margins, which therefore doesn't lock the style
  step; `mapping` for the rest)
- `ReadyChart`: `view` (`{ chart, layout }`), `figure` size, `margin`,
  `dropped` and `combined` row counts, `warnings`, `solved` params

`aggregate.ts`: `aggregateRows(rows, keys, measures, how)`.

## `state/`

`BuilderState` (a rune class): `$state` for `spec`, `source` (file text and
encoding), `error`, `reset` and `step`; `$derived` for `table`, `rows`,
`issues`, `resolution` and `steps`. Each derived reads the narrowest slice it
needs, so a pillar, number-format or drawing-only option change doesn't
rebuild the layout. Its actions wrap the pure setters; `apply(change)` takes
any `SpecChange`.

Auto-fill runs when a chart is picked and when a new file is loaded, never on
separator or type edits. After a chart change the notice lists only the
columns that ended up unused.

`steps.ts`: `STEPS`, `stepStatuses`, `canEnter`, `blockingReason`.

## `components/`

| Path | What it is |
|---|---|
| `Builder.svelte` | The wizard: stepper, back / next, reset notice, preview beside steps 3 and 4 |
| `data/` | Step 1: `DataStep`, `FileInput`, `DataOptions`, `DataPreview` (raw values, never reformatted) |
| `chart/ChartGallery.svelte` | Step 2: every chart, incompatible ones disabled with the reason |
| `mapping/MappingStep.svelte` | Step 3: one select per channel |
| `options/` | `ChartOptions` shows the options of one step (`step="mapping"` under the mapping, `step="style"` as the first group of the style step). One component per option kind, plus `AggregationField`. |
| `style/` | Step 4: `StyleStep` composes `PillarPicker`, the chart options, `SizeFields` (page-grid width, sizes, margins), `ParamFields`, and one `NumberFormatFields` per format |
| `preview/` | `ChartPreview` draws any resolution. The dashed frame is the figure's exact size; `overflow.ts` measures what is drawn outside it and says so. |
| `ChartView.svelte` | `<ChartView chart id style>`: theme from the pillar, the `<Svg>`, and one branch per chart (a chart without a branch fails the type check) |
| `views/` | One `<Name>View` per chart, props `ViewProps<L>`. It owns the chart's look, taken from its Eixo 6 story. Shared: `colors.ts` (series and group colours, the choropleth ramp, the label colour on a filled tile), `lines.ts`, `XAxisFrame.svelte`. |
| `ui/` | The wizard's own controls: `Field`, `Select`, `Input`, `Checkbox`, `Button`, `Fieldset`, and `tokens.css` (`--builder-*`) |

## Adding a chart

1. A `defineChart` file in `registry/charts/`, calling the `core` layout.
2. A line in `CHARTS` (`registry/charts/index.ts`).
3. A view in `components/views/`, with the look of its story.
4. A branch in `ChartView.svelte`.

## Tests and stories

- Unit tests sit beside the code (`*.test.ts`): `npm run test:unit`.
- Stories are in `src/stories/dist/builder/` (git-ignored). `Builder/Wizard`
  has `Vazio`, `Com dados de exemplo`, `Com dados longos` and
  `Com dados por UF` for manual checks (keep them without `play`), and
  `Fluxo completo`, `Dois na mesma página`, `Opções dos gráficos`,
  `Linhas e gráficos combinados` and `Mapas de UFs` as `play` tests:
  `npx vitest run --project storybook src/stories/dist/builder`.
