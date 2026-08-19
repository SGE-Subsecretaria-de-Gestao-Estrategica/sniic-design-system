<script lang="ts">
  import { teal, orange, typography } from '../../tokens.js';
  import AnnotationBox from './AnnotationBox.svelte';

  interface Annotation {
    /** Which side of the diagram the box appears on (informational). */
    side: 'left' | 'right';
    /** Point on the silhouette the connector targets (SVG coords). */
    pointX: number;
    pointY: number;
    /** Top-left of the annotation box. */
    boxX: number;
    boxY: number;
    title: string;
    subtitle?: string;
    color?: string;
    boxWidth?: number;
    boxHeight?: number;
    circleRadius?: number;
  }

  interface Props {
    /** Width of the SVG viewport. */
    width?: number;
    /** Height of the SVG viewport. */
    height?: number;
    /** Color of the silhouette stroke. */
    strokeColor?: string;
    /** Stroke width of the silhouette. */
    strokeWidth?: number;
    /** Array of annotation descriptors to place around the silhouette. */
    annotations?: Annotation[];
  }

  let {
    width = 900,
    height = 600,
    strokeColor = teal,
    strokeWidth = 2,
    annotations = [],
  }: Props = $props();

  /**
   * Classic stepped office building silhouette — positioned in the right portion
   * of the SVG (x: 518–865, y: 88–548).
   *
   * Structure:
   *   - Center tower:  x 638–748, y 88–548  (taller setback)
   *   - Left wing:     x 518–638, y 135–548
   *   - Right wing:    x 748–865, y 135–548
   *   - Entrance arch: x 660–726, y 475–548  (recessed)
   */
  const buildingPath = `
    M 638,88
    L 638,135
    L 518,135
    L 518,548
    L 660,548
    L 660,475
    L 726,475
    L 726,548
    L 865,548
    L 865,135
    L 748,135
    L 748,88
    Z
  `;

  // Window geometry
  const winW = 20;
  const winH = 30;

  function grid(cols: number[], rows: number[]): { x: number; y: number }[] {
    return cols.flatMap(cx => rows.map(ry => ({ x: cx, y: ry })));
  }

  // Center tower: 3 cols × 8 rows (y stops before entrance zone)
  const centerWindows = grid([652, 680, 708], [108, 150, 192, 234, 276, 318, 360, 402]);

  // Left wing: 2 cols × 6 rows
  const leftWindows = grid([536, 572], [158, 210, 262, 314, 366, 418]);

  // Right wing: 2 cols × 6 rows
  const rightWindows = grid([764, 800], [158, 210, 262, 314, 366, 418]);

  const allWindows = [...centerWindows, ...leftWindows, ...rightWindows];
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" style="font-family: {typography.chartValueFontFamily};">
  <!-- Building silhouette -->
  <path
    d={buildingPath}
    fill="var(--silhouette-fill, #dce8e5)"
    stroke={strokeColor}
    stroke-width={strokeWidth}
    stroke-linejoin="round"
    stroke-linecap="round"
  />

  <!-- Windows -->
  {#each allWindows as w (w.x + '-' + w.y)}
    <rect
      x={w.x}
      y={w.y}
      width={winW}
      height={winH}
      fill="var(--window-fill, #b0cfc9)"
      stroke={strokeColor}
      stroke-width="0.8"
      rx="0"
    />
  {/each}

  <!-- Ground line -->
  <line
    x1={518}
    y1={548}
    x2={865}
    y2={548}
    stroke={strokeColor}
    stroke-width={strokeWidth}
  />

  <!-- Annotation boxes -->
  {#each annotations as ann (ann.title + ann.side)}
    <AnnotationBox
      pointX={ann.pointX}
      pointY={ann.pointY}
      boxX={ann.boxX}
      boxY={ann.boxY}
      title={ann.title}
      subtitle={ann.subtitle ?? ''}
      color={ann.color ?? orange}
      boxWidth={ann.boxWidth ?? 190}
      boxHeight={ann.boxHeight}
      circleRadius={ann.circleRadius ?? 12}
    />
  {/each}
</svg>
