<script lang="ts" module>
  /** Uma das duas barras: uma medida repartida entre as mesmas categorias. */
  export type BarraFluxo = {
    label: string;
    cor: string;
    /** Valor de cada categoria, indexado pela `key` dela. */
    valores: Record<string, number>;
    /** Texto depois do percentual, dentro do segmento, quando cabe. */
    detalhes?: Record<string, string>;
  };

  export type CategoriaFluxo = { key: string; label: string };
</script>

<script lang="ts">
  /**
   * Duas composições da mesma população, uma sobre a outra, ligadas categoria a
   * categoria — contemplados em cima, recursos embaixo, por exemplo.
   *
   * Cada barra é um todo (100%) repartido nas mesmas categorias, na mesma
   * ordem. A faixa que liga o segmento de uma categoria em cima ao dela embaixo
   * alarga quando a categoria pesa mais embaixo e estreita quando pesa menos: a
   * diferença entre as duas repartições vira forma, e não uma conta que o leitor
   * precisa fazer entre dois números.
   *
   * A cor é a da medida, não a da categoria — cada barra numa cor só, as
   * categorias separadas pelo vão e nomeadas pelo rótulo —, então a figura cabe
   * no par de cores do boletim com qualquer número de categorias. A faixa passa
   * de uma cor à outra, esmaecida para não disputar com as barras, e alterna
   * de intensidade entre categorias vizinhas para que cada uma se leia como uma
   * peça; o nome da categoria vai no meio da sua faixa.
   *
   * Sob a barra de baixo, `notas` põe um texto por categoria (o valor médio por
   * contemplado, por exemplo): a razão entre as duas barras, dita em número.
   *
   * No mesmo idioma das figuras do Eixo 1: medidas e tipografia de
   * `../eixo1/tokens`.
   */
  import { a4Scale, fontFamily, fontSize as scale, measureLabel, wrapText } from '../eixo1/tokens';
  import { RAIO_BARRA, segmentoPath } from './forma';

  const cinza = {
    titulo: '#2F2F2B',
    subtitulo: '#6E6E68',
    dado: '#2F2F2B',
    nota: '#8A8A84',
  };

  interface Props {
    categorias: CategoriaFluxo[];
    /** A barra de cima e a de baixo. */
    barras: [BarraFluxo, BarraFluxo];
    title: string;
    subtitle?: string;
    formatValue?: (v: number) => string;
    /** Um texto por categoria, sob o seu segmento na barra de baixo. */
    notas?: Record<string, string>;
    footnote?: string;
    source?: string;
    alturaBarra?: number;
    /** Altura da faixa de ligação entre as barras. */
    alturaFluxo?: number;
    width?: number;
    background?: string | null;
    svgEl?: SVGSVGElement | null;
  }

  let {
    categorias,
    barras,
    title,
    subtitle,
    formatValue = (v: number) => `${v}%`,
    notas,
    footnote,
    source,
    alturaBarra = 30,
    alturaFluxo = 64,
    width = 580,
    background = '#ffffff',
    svgEl = $bindable(null),
  }: Props = $props();

  const uid = $props.id();

  // svelte-ignore state_referenced_locally -- a largura autoral é fixada na criação
  const k = a4Scale(width);

  const type = {
    title: 14 * k,
    subtitle: scale.md * k,
    barra: scale.md * k,
    categoria: scale.sm * k,
    valor: scale.sm * k,
    nota: scale.sm * k,
  };

  const pad = 16 * k;
  const barH = $derived(alturaBarra * k);
  const fluxoH = $derived(alturaFluxo * k);
  /** O vão entre segmentos: separa as categorias sem uma segunda cor. */
  const vao = 3 * k;

  const canal = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const luminancia = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => canal(c / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const razao = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const contraste = (fundo: string) => {
    const l = luminancia(fundo);
    return razao(l, 1) >= razao(l, luminancia(cinza.titulo)) ? '#FFFFFF' : cinza.titulo;
  };

  const textWidth = $derived(width - pad * 2);
  const titleLines = $derived(wrapText(title, type.title, textWidth, 600));
  const subtitleLines = $derived(wrapText(subtitle ?? '', type.subtitle, textWidth));
  const footnoteLines = $derived(wrapText(footnote ?? '', type.nota, textWidth));
  const sourceLines = $derived(wrapText(source ?? '', type.nota, textWidth));

  const titleLine = 19 * k;
  const subtitleLine = 15 * k;
  const notaLine = 13.5 * k;

  const headerBottom = $derived(
    12 * k + titleLines.length * titleLine + subtitleLines.length * subtitleLine,
  );

  // Calha com o nome de cada barra, à esquerda.
  const larguraRotulo = $derived(
    Math.max(...barras.map((b) => measureLabel(b.label, type.barra, 700))) * 1.1,
  );
  const plotLeft = $derived(pad + larguraRotulo + 12 * k);
  const plotRight = $derived(width - pad);
  const plotW = $derived(plotRight - plotLeft - vao * (categorias.length - 1));

  const topoY = $derived(headerBottom + 18 * k);
  const baseY = $derived(topoY + barH + fluxoH);

  const segmentos = $derived(
    barras.map((b) => {
      const total = categorias.reduce((s, c) => s + (b.valores[c.key] ?? 0), 0);
      let x = plotLeft;
      return categorias.map((c, i) => {
        const v = b.valores[c.key] ?? 0;
        const w = total > 0 ? (v / total) * plotW : 0;
        const pct = total > 0 ? (v / total) * 100 : 0;
        // O texto mais completo que couber: percentual e detalhe, só o
        // percentual, ou nada — o nome e o número da categoria estão à vista
        // na outra barra e no rótulo de cima.
        const completo = b.detalhes?.[c.key] ? `${formatValue(pct)} · ${b.detalhes[c.key]}` : null;
        const cabe = (t: string) => measureLabel(t, type.valor, 700) + 12 * k <= w;
        const texto = completo && cabe(completo) ? completo : cabe(formatValue(pct)) ? formatValue(pct) : null;
        const seg = { key: c.key, i, x, w, texto };
        x += w + vao;
        return seg;
      });
    }),
  );

  const fluxos = $derived(
    categorias.map((c, i) => {
      const t = segmentos[0][i];
      const b = segmentos[1][i];
      const y1 = topoY + barH;
      const y2 = baseY;
      const ym = (y1 + y2) / 2;
      return {
        key: c.key,
        label: c.label,
        opacidade: i % 2 === 0 ? 0.34 : 0.16,
        // O meio da faixa: a média dos centros dos dois segmentos que ela liga.
        cx: (t.x + t.w / 2 + b.x + b.w / 2) / 2,
        cy: ym,
        d: [
          `M${t.x},${y1}`,
          `C${t.x},${ym} ${b.x},${ym} ${b.x},${y2}`,
          `L${b.x + b.w},${y2}`,
          `C${b.x + b.w},${ym} ${t.x + t.w},${ym} ${t.x + t.w},${y1}`,
          'Z',
        ].join(' '),
      };
    }),
  );

  const notasLinhas = $derived(
    categorias.map((c, i) =>
      wrapText(notas?.[c.key] ?? '', type.nota, Math.max(segmentos[1][i].w - 4 * k, 60 * k), 500),
    ),
  );
  const notasAltura = $derived(Math.max(0, ...notasLinhas.map((l) => l.length)) * notaLine);

  const notasTop = $derived(baseY + barH + (notasAltura ? 8 * k : 0));
  const rodapeTop = $derived(notasTop + notasAltura + 14 * k);
  const height = $derived(rodapeTop + (footnoteLines.length + sourceLines.length) * notaLine + pad);
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
  <defs>
    <linearGradient id="{uid}-fluxo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color={barras[0].cor} />
      <stop offset="1" stop-color={barras[1].cor} />
    </linearGradient>
  </defs>

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

  <!-- As ligações por baixo das barras, na altura inteira do vão entre elas. -->
  {#each fluxos as f (f.key)}
    <path d={f.d} fill="url(#{uid}-fluxo)" opacity={f.opacidade} />
    <text
      x={f.cx}
      y={f.cy + type.categoria * 0.35}
      text-anchor="middle"
      font-size={type.categoria}
      font-weight="700"
      fill={cinza.dado}
      font-family={fontFamily}>{f.label}</text
    >
  {/each}

  {#each barras as b, j (b.label)}
    {@const y = j === 0 ? topoY : baseY}
    <text
      x={pad}
      y={y + barH / 2 + type.barra * 0.35}
      font-size={type.barra}
      font-weight="700"
      fill={b.cor}
      font-family={fontFamily}>{b.label}</text
    >
    {#each segmentos[j] as s (s.key)}
      {#if s.w > 0}
        <path
          d={segmentoPath(s.x, y, s.w, barH, RAIO_BARRA * k, s.i === 0, s.i === categorias.length - 1)}
          fill={b.cor}
        />
        {#if s.texto}
          <text
            x={s.x + 7 * k}
            y={y + barH / 2 + type.valor * 0.35}
            font-size={type.valor}
            font-weight="700"
            fill={contraste(b.cor)}
            font-family={fontFamily}>{s.texto}</text
          >
        {/if}
      {/if}
    {/each}
  {/each}

  {#each categorias as c, i (c.key)}
    {#each notasLinhas[i] as linha, n (n)}
      <text
        x={segmentos[1][i].x}
        y={notasTop + (n + 0.8) * notaLine}
        font-size={type.nota}
        font-weight="500"
        fill={cinza.subtitulo}
        font-family={fontFamily}>{linha}</text
      >
    {/each}
  {/each}

  {#each [...footnoteLines, ...sourceLines] as linha, i (i)}
    <text
      x={pad}
      y={rodapeTop + (i + 0.8) * notaLine}
      font-size={type.nota}
      fill={cinza.nota}
      font-family={fontFamily}>{linha}</text
    >
  {/each}
</svg>
