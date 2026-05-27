<script lang="ts">
  import EnterpriseSilhouette from '../lib/components/molecules/EnterpriseSilhouette.svelte';
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

  // Building landmarks (right side, x: 518–865).
  // Annotation boxes are placed on the LEFT (boxX=28), so connectors run left → right.
  // Since all pointX values are greater than boxCX (≈123), AnnotationBox anchors
  // from the RIGHT edge of each box, creating a clean left-to-right connector.
  const annotations = [
    {
      side: 'left' as const,
      pointX: 693,
      pointY: 100,
      boxX: 28,
      boxY: 28,
      title: 'Razão Social',
      subtitle: 'Nome oficial da\nempresa registrada',
      color: teal,
      circleRadius: 14,
    },
    {
      side: 'left' as const,
      pointX: 807,
      pointY: 210,
      boxX: 28,
      boxY: 152,
      title: 'CNPJ',
      subtitle: 'Cadastro Nacional de\nPessoa Jurídica',
      color: blue,
      circleRadius: 12,
    },
    {
      side: 'left' as const,
      pointX: 693,
      pointY: 310,
      boxX: 28,
      boxY: 272,
      title: 'Atividade',
      subtitle: 'CNAE - Atividade\nEconômica Principal',
      color: orange,
      circleRadius: 12,
    },
    {
      side: 'left' as const,
      pointX: 578,
      pointY: 418,
      boxX: 28,
      boxY: 382,
      title: 'Endereço',
      subtitle: 'Sede e endereço\nfiscal da empresa',
      color: purple,
      circleRadius: 12,
    },
    {
      side: 'left' as const,
      pointX: 693,
      pointY: 508,
      boxX: 28,
      boxY: 470,
      title: 'Capital Social',
      subtitle: 'Capital registrado\ne integralizado',
      color: lime,
      circleRadius: 12,
    },
  ];
</script>

<EnterpriseSilhouette {width} {height} {strokeColor} {strokeWidth} {annotations} />
