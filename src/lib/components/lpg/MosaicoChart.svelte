<script lang="ts" module>
  /** Uma peça do mosaico: a área mede `valor`; `detalhe` é a segunda linha do rótulo. */
  export type PecaMosaico = {
    key: string;
    label: string;
    valor: number;
    cor: string;
    /** Substitui `formatValue(valor)` na segunda linha do rótulo. */
    detalhe?: string;
  };
</script>

<script lang="ts">
  /**
   * Mosaico (treemap): um todo repartido em retângulos de área proporcional a
   * cada parte — para quando as partes são poucas, sem ordem entre si, e o
   * leitor precisa ver o peso de cada uma e ainda ler um segundo número dentro
   * dela.
   *
   * A segunda linha do rótulo é livre (`detalhe`): a área pode medir uma coisa
   * e o texto dizer outra — contemplados na área, valor médio no rótulo. É a
   * forma de pôr duas medidas lado a lado sem uma segunda escala.
   *
   * Um nível só, de propósito: com hierarquia o mosaico vira um exercício de
   * decifrar bordas. As peças entram na ordem dada, que `treemapSquarify`
   * respeita o quanto consegue, e o rótulo só é escrito quando cabe inteiro —
   * a peça que não comporta o próprio nome é identificada pela cor na legenda
   * de pastilhas.
   *
   * No mesmo idioma das figuras do Eixo 1: medidas e tipografia de
   * `../eixo1/tokens`, pastilhas de `../eixo1/legend`.
   */
  import { hierarchy, treemap, treemapSquarify } from 'd3';
  import { a4Scale, fontFamily, fontSize as scale, measureLabel, wrapText } from '../eixo1/tokens';
  import { layoutLegend } from '../eixo1/legend';
  import { RAIO_BARRA, segmentoPath } from './forma';

  const cinza = {
    titulo: '#2F2F2B',
    subtitulo: '#6E6E68',
    nota: '#8A8A84',
  };

  interface Props {
    pecas: PecaMosaico[];
    title: string;
    subtitle?: string;
    formatValue?: (v: number) => string;
    footnote?: string;
    source?: string;
    legenda?: boolean;
    /** Altura do mosaico, antes da escala de impressão. */
    plotHeight?: number;
    width?: number;
    background?: string | null;
    svgEl?: SVGSVGElement | null;
  }

  let {
    pecas,
    title,
    subtitle,
    formatValue = (v: number) => String(v),
    footnote,
    source,
    legenda = true,
    plotHeight = 260,
    width = 580,
    background = '#ffffff',
    svgEl = $bindable(null),
  }: Props = $props();

  const k = $derived(a4Scale(width));

  const type = $derived({
    title: 14 * k,
    subtitle: scale.md * k,
    rotulo: scale.md * k,
    detalhe: scale.sm * k,
    sm: scale.sm * k,
  });

  const pad = $derived(16 * k);

  const canal = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const luminancia = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => canal(c / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const razao = (a: string, b: string) => {
    const [claro, escuro] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
    return (claro + 0.05) / (escuro + 0.05);
  };
  const contraste = (fundo: string) =>
    razao(fundo, '#FFFFFF') >= razao(fundo, cinza.titulo) ? '#FFFFFF' : cinza.titulo;

  const textWidth = $derived(width - pad * 2);
  const titleLines = $derived(wrapText(title, type.title, textWidth, 600));
  const subtitleLines = $derived(wrapText(subtitle ?? '', type.subtitle, textWidth));
  const footnoteLines = $derived(wrapText(footnote ?? '', type.sm, textWidth));
  const sourceLines = $derived(wrapText(source ?? '', type.sm, textWidth));

  const titleLine = $derived(19 * k);
  const subtitleLine = $derived(15 * k);
  const notaLine = $derived(13.5 * k);

  const cabecalho = $derived(
    12 * k + titleLines.length * titleLine + subtitleLines.length * subtitleLine,
  );

  const legendaLayout = $derived(
    legenda
      ? layoutLegend(
          pecas.map((p) => ({ label: p.label, color: p.cor })),
          { fontSize: type.sm, fontWeight: 600, padX: 8 * k, maxWidth: textWidth, rowGap: 4 * k },
        )
      : null,
  );
  const legendaY = $derived(cabecalho + 13 * k);

  const plotTop = $derived(
    legendaLayout ? legendaY + legendaLayout.height + 18 * k : cabecalho + 16 * k,
  );
  const plotH = $derived(plotHeight * k);

  const folhas = $derived.by(() => {
    const raiz = hierarchy<{ children?: PecaMosaico[] } | PecaMosaico>({ children: pecas })
      .sum((d) => ('valor' in d ? d.valor : 0));
    treemap<{ children?: PecaMosaico[] } | PecaMosaico>()
      .tile(treemapSquarify)
      .size([textWidth, plotH])
      .paddingInner(3 * k)
      .round(false)(raiz);
    return raiz.leaves().map((folha) => {
      const p = folha.data as PecaMosaico;
      const n = folha as typeof folha & { x0: number; x1: number; y0: number; y1: number };
      const x = pad + n.x0;
      const y = plotTop + n.y0;
      const w = n.x1 - n.x0;
      const h = n.y1 - n.y0;
      const detalhe = p.detalhe ?? formatValue(p.valor);
      const folga = 8 * k;
      const cabeRotulo =
        measureLabel(p.label, type.rotulo, 600) + folga * 2 <= w && type.rotulo + folga * 2 <= h;
      const larguraRotulo = measureLabel(p.label, type.rotulo, 600);
      const larguraDetalhe = measureLabel(detalhe, type.detalhe, 500);
      const cabeDetalhe =
        cabeRotulo &&
        larguraDetalhe + folga * 2 <= w &&
        type.rotulo + type.detalhe * 1.4 + folga * 2 <= h;
      // Peça larga e baixa: o detalhe vai na mesma linha do rótulo, à direita.
      const detalheAoLado =
        cabeRotulo && !cabeDetalhe && larguraRotulo + folga * 3 + larguraDetalhe <= w;
      return { ...p, x, y, w, h, detalhe, cabeRotulo, cabeDetalhe, detalheAoLado, larguraRotulo, folga };
    });
  });

  const notasTop = $derived(plotTop + plotH + 16 * k);
  const height = $derived(
    notasTop + (footnoteLines.length + sourceLines.length) * notaLine + pad,
  );

</script>

<svg
  bind:this={svgEl}
  viewBox="0 0 {width} {height}"
  {width}
  {height}
  style="width: 100%; height: auto; font-family: {fontFamily};"
  role="img"
  aria-label={title}
>
  {#if background}
    <rect x="0" y="0" {width} {height} rx={10 * k} fill={background} />
  {/if}

  {#each titleLines as linha, i (i)}
    <text
      x={pad}
      y={12 * k + (i + 0.8) * titleLine}
      font-size={type.title}
      font-weight="600"
      fill={cinza.titulo}
      font-family={fontFamily}>{linha}</text
    >
  {/each}
  {#each subtitleLines as linha, i (i)}
    <text
      x={pad}
      y={12 * k + titleLines.length * titleLine + (i + 0.75) * subtitleLine}
      font-size={type.subtitle}
      fill={cinza.subtitulo}
      font-family={fontFamily}>{linha}</text
    >
  {/each}

  {#if legendaLayout}
    {#each legendaLayout.chips as chip (chip.label)}
      <path
        d={segmentoPath(pad + chip.x, legendaY + chip.y, chip.width, legendaLayout.chipHeight, RAIO_BARRA * k, chip.first, chip.last)}
        fill={chip.color}
      />
      <text
        x={pad + chip.x + chip.width / 2}
        y={legendaY + chip.y + legendaLayout.chipHeight / 2 + type.sm * 0.35}
        text-anchor="middle"
        font-size={type.sm}
        font-weight="600"
        fill={contraste(chip.color)}
        font-family={fontFamily}>{chip.label}</text
      >
    {/each}
  {/if}

  {#each folhas as f (f.key)}
    <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={RAIO_BARRA * k} fill={f.cor} />
    {#if f.cabeRotulo}
      <text
        x={f.x + f.folga}
        y={f.y + f.folga + type.rotulo * 0.85}
        font-size={type.rotulo}
        font-weight="600"
        fill={contraste(f.cor)}
        font-family={fontFamily}>{f.label}</text
      >
    {/if}
    {#if f.cabeDetalhe}
      <text
        x={f.x + f.folga}
        y={f.y + f.folga + type.rotulo + type.detalhe * 1.25}
        font-size={type.detalhe}
        font-weight="500"
        fill={contraste(f.cor)}
        font-family={fontFamily}>{f.detalhe}</text
      >
    {:else if f.detalheAoLado}
      <text
        x={f.x + f.folga * 2 + f.larguraRotulo}
        y={f.y + f.folga + type.rotulo * 0.85}
        font-size={type.detalhe}
        font-weight="500"
        fill={contraste(f.cor)}
        font-family={fontFamily}>{f.detalhe}</text
      >
    {/if}
  {/each}

  {#each [...footnoteLines, ...sourceLines] as linha, i (i)}
    <text
      x={pad}
      y={notasTop + (i + 0.8) * notaLine}
      font-size={type.sm}
      fill={cinza.nota}
      font-family={fontFamily}>{linha}</text
    >
  {/each}
</svg>
