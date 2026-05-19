<script lang="ts">
  import { teal, orange, white, black, typography } from '../../tokens.js';
  import AnnotationBox from './AnnotationBox.svelte';

  interface Annotation {
    /** Which side of the body the box appears on. */
    side: 'left' | 'right';
    /** Point on the body the connector targets (inner SVG coords). */
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
    /** Color of the body outline stroke. */
    strokeColor?: string;
    /** Stroke width of the body outline. */
    strokeWidth?: number;
    /** Array of annotation descriptors to place around the body. */
    annotations?: Annotation[];
  }

  let {
    width = 900,
    height = 700,
    strokeColor = teal,
    strokeWidth = 2,
    annotations = [],
  }: Props = $props();

  // Body silhouette path — centered around x≈450, y spans ~40–660
  // A simplified male outline: head, neck, shoulders, arms, torso, legs
  const bodyPath = `
    M 450,50
    C 430,50 415,65 415,85
    C 415,105 430,120 450,120
    C 470,120 485,105 485,85
    C 485,65 470,50 450,50
    Z

    M 438,120
    L 438,145
    L 355,175
    C 340,180 330,195 328,210
    L 300,310
    C 298,318 302,325 310,325
    L 330,325
    C 338,325 344,318 346,310
    L 370,235
    L 385,210
    L 385,380
    L 375,500
    L 370,540
    L 360,660
    C 358,670 365,678 375,678
    L 415,678
    C 422,678 428,672 428,665
    L 435,540
    L 445,430
    L 455,540
    L 462,665
    C 462,672 468,678 475,678
    L 515,678
    C 525,678 532,670 530,660
    L 520,540
    L 515,500
    L 505,380
    L 505,210
    L 520,235
    L 544,310
    C 546,318 552,325 560,325
    L 580,325
    C 588,325 592,318 590,310
    L 562,210
    C 560,195 550,180 535,175
    L 462,145
    L 462,120
  `;
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" style="font-family: {typography.chartValueFontFamily};">
  <!-- Body outline -->
  <path
    d={bodyPath}
    fill="none"
    stroke={strokeColor}
    stroke-width={strokeWidth}
    stroke-linejoin="round"
    stroke-linecap="round"
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
      boxWidth={ann.boxWidth ?? 180}
      boxHeight={ann.boxHeight}
      circleRadius={ann.circleRadius ?? 12}
    />
  {/each}
</svg>
