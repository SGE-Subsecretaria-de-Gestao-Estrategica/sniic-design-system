<script lang="ts">
  import { teal, black, typography } from '../../tokens.js';

  export interface TableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: number;
  }

  interface Props {
    /** Column definitions. */
    columns?: TableColumn[];
    /** Row data (array of objects keyed by column.key). */
    rows?: Record<string, string>[];
    /** Top-left X of the table. */
    x?: number;
    /** Top-left Y of the table. */
    y?: number;
    /** Total table width. */
    tableWidth?: number;
    /** Minimum row height in px. */
    minRowHeight?: number;
    /** Vertical padding inside each cell. */
    cellPadY?: number;
    /** Header text color. */
    headerColor?: string;
    /** Line/border color. */
    lineColor?: string;
    /** Body text color. */
    textColor?: string;
    /** Body text size. */
    fontSize?: number;
    /** Header text size. */
    headerFontSize?: number;
    fontFamily?: string;
  }

  const defaultColumns: TableColumn[] = [
    { key: 'cnae', label: 'CNAE principal', align: 'left', width: 280 },
    { key: 'qtd', label: 'Qtd', align: 'right', width: 80 },
    { key: 'pctQtd', label: '% qtd', align: 'right', width: 80 },
    { key: 'valor', label: 'Valor total', align: 'right', width: 160 },
    { key: 'pctValor', label: '% valor', align: 'right', width: 80 },
  ];

  const defaultRows: Record<string, string>[] = [
    {
      cnae: 'Produção musical (CNAE 9001902)',
      qtd: '2.531',
      pctQtd: '7,9%',
      valor: 'R$ 83,38 milhões',
      pctValor: '5,3%',
    },
    {
      cnae: 'Produção teatral (CNAE 9001901)',
      qtd: '1.249',
      pctQtd: '3,9%',
      valor: 'R$ 81,74 milhões',
      pctValor: '5,2%',
    },
    {
      cnae: 'Produção cinematográfica, de vídeos e de programas de televisão não especificadas (CNAE 5911199)',
      qtd: '636',
      pctQtd: '2,0%',
      valor: 'R$ 58,21 milhões',
      pctValor: '3,7%',
    },
  ];

  let {
    columns = defaultColumns,
    rows = defaultRows,
    x = 0,
    y = 0,
    tableWidth,
    minRowHeight = 32,
    cellPadY = 8,
    headerColor = teal,
    lineColor = '#999999',
    textColor = black,
    fontSize = typography.sizes.sm,
    headerFontSize = typography.sizes.sm,
    fontFamily = typography.fontFamily,
  }: Props = $props();

  const padX = 10;
  const lineHeight = $derived(fontSize * 1.4);
  const headerLineHeight = $derived(headerFontSize * 1.4);
  const avgCharWidth = $derived(fontSize * 0.55);

  const totalExplicitWidth = $derived(
    columns.reduce((sum, c) => sum + (c.width ?? 0), 0)
  );
  const computedTableWidth = $derived(tableWidth ?? totalExplicitWidth);

  const colPositions = $derived.by(() => {
    const positions: { x: number; width: number }[] = [];
    let cx = 0;
    for (const col of columns) {
      const w = col.width ?? (computedTableWidth / columns.length);
      positions.push({ x: cx, width: w });
      cx += w;
    }
    return positions;
  });

  function wrapText(text: string, maxWidth: number, charW: number): string[] {
    const usable = maxWidth - padX * 2;
    const charsPerLine = Math.max(1, Math.floor(usable / charW));
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > charsPerLine && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // Pre-compute wrapped text for every cell
  const cellWrapped = $derived.by(() => {
    return rows.map((row) =>
      columns.map((col, ci) => {
        const text = row[col.key] ?? '';
        return wrapText(text, colPositions[ci].width, avgCharWidth);
      })
    );
  });

  // Header wrapping
  const headerWrapped = $derived.by(() => {
    const headerCharW = headerFontSize * 0.55;
    return columns.map((col, ci) =>
      wrapText(col.label, colPositions[ci].width, headerCharW)
    );
  });

  const headerHeight = $derived(
    Math.max(
      minRowHeight,
      ...headerWrapped.map(
        (lines) => lines.length * headerLineHeight + cellPadY * 2
      )
    )
  );

  // Row heights based on tallest cell in each row
  const rowHeights = $derived(
    cellWrapped.map((rowCells) =>
      Math.max(
        minRowHeight,
        ...rowCells.map(
          (lines) => lines.length * lineHeight + cellPadY * 2
        )
      )
    )
  );

  // Cumulative Y offsets for each row (after header)
  const rowYOffsets = $derived.by(() => {
    const offsets: number[] = [];
    let cy = headerHeight;
    for (const h of rowHeights) {
      offsets.push(cy);
      cy += h;
    }
    return offsets;
  });

  const totalHeight = $derived(
    headerHeight + rowHeights.reduce((s, h) => s + h, 0)
  );

  function textAnchor(align: string | undefined) {
    if (align === 'right') return 'end';
    if (align === 'center') return 'middle';
    return 'start';
  }

  function textX(col: TableColumn, pos: { x: number; width: number }) {
    if (col.align === 'right') return pos.x + pos.width - padX;
    if (col.align === 'center') return pos.x + pos.width / 2;
    return pos.x + padX;
  }
</script>

<g transform="translate({x},{y})" font-family={fontFamily}>
  <!-- Header labels -->
  {#each columns as col, i (col.key)}
    {#each headerWrapped[i] as line, li (li)}
      <text
        x={textX(col, colPositions[i])}
        y={cellPadY + li * headerLineHeight + headerFontSize}
        text-anchor={textAnchor(col.align)}
        fill={headerColor}
        font-size={headerFontSize}
        font-weight="700"
      >{line}</text>
    {/each}
  {/each}

  <!-- Header bottom line (thicker) -->
  <line
    x1={0}
    y1={headerHeight}
    x2={computedTableWidth}
    y2={headerHeight}
    stroke={headerColor}
    stroke-width="2"
  />

  <!-- Data rows -->
  {#each rows as row, ri (ri)}
    {@const ry = rowYOffsets[ri]}

    <!-- Cell values (wrapped) -->
    {#each columns as col, ci (col.key)}
      {#each cellWrapped[ri][ci] as line, li (li)}
        <text
          x={textX(col, colPositions[ci])}
          y={ry + cellPadY + li * lineHeight + fontSize}
          text-anchor={textAnchor(col.align)}
          fill={textColor}
          font-size={fontSize}
        >{line}</text>
      {/each}
    {/each}

    <!-- Row bottom separator -->
    <line
      x1={0}
      y1={ry + rowHeights[ri]}
      x2={computedTableWidth}
      y2={ry + rowHeights[ri]}
      stroke={lineColor}
      stroke-width="0.5"
    />
  {/each}
</g>
