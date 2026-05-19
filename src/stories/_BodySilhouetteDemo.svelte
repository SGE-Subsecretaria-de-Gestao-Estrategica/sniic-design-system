<script lang="ts">
  import BodySilhouette from '../lib/components/molecules/BodySilhouette.svelte';
  import { orange, blue, red, teal, purple, lime } from '../lib/tokens.js';

  interface Props {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
  }

  let {
    width = 900,
    height = 720,
    strokeColor = teal,
    strokeWidth = 2,
  }: Props = $props();

  const annotations = [
    // Left side annotations
    {
      side: 'left' as const,
      pointX: 415,
      pointY: 85,
      boxX: 30,
      boxY: 30,
      title: 'Cabeca',
      subtitle: 'Capacete obrigatorio\nem areas de risco',
      color: orange,
      circleRadius: 40,
    },
    {
      side: 'left' as const,
      pointX: 355,
      pointY: 190,
      boxX: 30,
      boxY: 170,
      title: 'Ombros',
      subtitle: 'Protetor de ombros',
      color: blue,
      circleRadius: 14,
    },
    {
      side: 'left' as const,
      pointX: 310,
      pointY: 310,
      boxX: 30,
      boxY: 300,
      title: 'Maos',
      subtitle: 'Luvas de protecao\nresistentes a corte',
      color: purple,
      circleRadius: 14,
    },
    {
      side: 'left' as const,
      pointX: 385,
      pointY: 500,
      boxX: 30,
      boxY: 450,
      title: 'Joelhos',
      subtitle: 'Joelheiras acolchoadas',
      color: lime,
      circleRadius: 14,
    },
    // Right side annotations
    {
      side: 'right' as const,
      pointX: 505,
      pointY: 250,
      boxX: 640,
      boxY: 50,
      title: 'Torso',
      subtitle: 'Colete de protecao\nresistente a impactos',
      color: red,
      circleRadius: 14,
    },
    {
      side: 'right' as const,
      pointX: 535,
      pointY: 175,
      boxX: 640,
      boxY: 200,
      title: 'Bracos',
      subtitle: 'Manga longa reforçada',
      color: teal,
      circleRadius: 14,
    },
    {
      side: 'right' as const,
      pointX: 520,
      pointY: 540,
      boxX: 640,
      boxY: 400,
      title: 'Pernas',
      subtitle: 'Calca de seguranca\ncom faixas refletivas',
      color: orange,
      circleRadius: 14,
    },
    {
      side: 'right' as const,
      pointX: 490,
      pointY: 670,
      boxX: 640,
      boxY: 560,
      title: 'Pes',
      subtitle: 'Botas com biqueira\nde aco',
      color: blue,
      circleRadius: 14,
    },
  ];
</script>

<BodySilhouette {width} {height} {strokeColor} {strokeWidth} {annotations} />
