<script lang="ts">
  import BodySilhouette from '../lib/components/molecules/BodySilhouette.svelte';
  import { orange, blue, teal, purple, lime } from '../lib/tokens.js';

  interface Props {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
  }

  let {
    width = 900,
    height = 600,
    strokeColor = teal,
    strokeWidth = 2,
  }: Props = $props();

  // Body landmarks are in the transformed coordinate space used by BodySilhouette.svelte
  // (original 900×720 figure scaled 0.80× and shifted so body center ≈ x:230).
  // All annotation boxes are placed on the right side of the SVG (x=445).
  const annotations = [
    {
      side: 'right' as const,
      pointX: 230,
      pointY: 68,
      boxX: 445,
      boxY: 28,
      title: 'Cabeça',
      subtitle: 'Capacete obrigatório\nem áreas de risco',
      color: teal,
      circleRadius: 16,
    },
    {
      side: 'right' as const,
      pointX: 298,
      pointY: 140,
      boxX: 445,
      boxY: 152,
      title: 'Ombros',
      subtitle: 'Protetor de ombros\ncontra impactos',
      color: blue,
      circleRadius: 12,
    },
    {
      side: 'right' as const,
      pointX: 334,
      pointY: 260,
      boxX: 445,
      boxY: 270,
      title: 'Maos',
      subtitle: 'Luvas resistentes\na corte e abrasão',
      color: orange,
      circleRadius: 12,
    },
    {
      side: 'right' as const,
      pointX: 284,
      pointY: 416,
      boxX: 445,
      boxY: 378,
      title: 'Joelhos',
      subtitle: 'Joelheiras\nacolchoadas',
      color: purple,
      circleRadius: 12,
    },
    {
      side: 'right' as const,
      pointX: 286,
      pointY: 532,
      boxX: 445,
      boxY: 468,
      title: 'Pes',
      subtitle: 'Botas com biqueira\nde aço',
      color: lime,
      circleRadius: 12,
    },
  ];
</script>

<BodySilhouette {width} {height} {strokeColor} {strokeWidth} {annotations} />
