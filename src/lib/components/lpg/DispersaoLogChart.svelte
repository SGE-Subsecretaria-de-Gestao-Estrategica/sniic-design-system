<script lang="ts" module>
  /** Um ponto da dispersão: as duas medidas, em unidades dos dados. */
  export type PontoDispersao = {
    key: string;
    label: string;
    x: number;
    y: number;
    /** Segunda linha do rótulo, só para os pontos fora da escala. */
    detalhe?: string;
  };
  /** Uma diagonal de produto constante `x · y = valor`. */
  export type Isolinha = { valor: number; label: string };
</script>

<script lang="ts">
  /**
   * Dispersão com os dois eixos em escala logarítmica, e diagonais em que o
   * produto `x · y` é constante.
   *
   * Feita para as medidas que se multiplicam — contemplados × valor médio =
   * recurso total. Em escala log o produto constante é uma reta de inclinação
   * −1, então o total se lê pela diagonal em que o ponto cai, sem um terceiro
   * canal (tamanho ou cor): dois pontos na mesma diagonal receberam o mesmo
   * recurso, por caminhos opostos — muita gente com pouco, ou pouca gente com
   * muito.
   *
   * As diagonais não são traçadas como linhas: a área do gráfico é um painel
   * sem grade, e as `isolinhas` são as bordas de faixas diagonais alternadas,
   * cada uma um intervalo de total. Nenhuma linha cruza outra; os valores dos
   * eixos ficam com marcas curtas do lado de fora do painel.
   *
   * O domínio é dado, e não calculado dos dados: um ponto muito fora do padrão
   * esmagaria os outros num canto. O que fica fora do domínio é preso à borda,
   * com uma seta na direção em que está, e o rótulo dele traz
   * os valores de verdade (`detalhe`).
   *
   * Os rótulos são posicionados um a um, do ponto mais alto ao mais baixo, na
   * primeira de oito posições em volta do ponto que não cobre outro rótulo,
   * outro ponto nem sai da área do gráfico.
   *
   * Mesmo cabeçalho e rodapé das demais figuras da LPG.
   */
  import { a4Scale, fontFamily, fontSize as scale, measureLabel, wrapText } from '../eixo1/tokens';
  import { RAIO_BARRA } from './forma';

  const cinza = {
    titulo: '#2F2F2B',
    subtitulo: '#6E6E68',
    dado: '#2F2F2B',
    eixo: '#8A8A84',
    nota: '#8A8A84',
    /** O fundo da área do gráfico — o mesmo das faixas de `PainelMetricasChart`. */
    painel: '#F4F4F1',
    /** As faixas diagonais alternadas, sobre o painel. */
    faixa: '#E9E9E3',
  };

  interface Props {
    pontos: PontoDispersao[];
    dominioX: [number, number];
    dominioY: [number, number];
    tituloX: string;
    tituloY: string;
    formatX?: (v: number) => string;
    formatY?: (v: number) => string;
    isolinhas?: Isolinha[];
    cor: string;
    /**
     * Uma cor por faixa de total, da menor à maior (`isolinhas.length + 1`
     * cores). Sem ela, as faixas alternam dois cinzas.
     */
    coresFaixas?: string[];
    /** Cor do valor escrito em cada borda de faixa. */
    corRotuloFaixa?: string;
    title: string;
    subtitle?: string;
    footnote?: string;
    source?: string;
    /** Altura da área do gráfico em relação à largura. */
    proporcao?: number;
    width?: number;
    background?: string | null;
    svgEl?: SVGSVGElement | null;
  }

  let {
    pontos,
    dominioX,
    dominioY,
    tituloX,
    tituloY,
    formatX = (v: number) => String(v),
    formatY = (v: number) => String(v),
    isolinhas = [],
    cor,
    coresFaixas,
    corRotuloFaixa = cinza.eixo,
    title,
    subtitle,
    footnote,
    source,
    proporcao = 0.78,
    width = 580,
    background = '#ffffff',
    svgEl = $bindable(null),
  }: Props = $props();

  const k = $derived(a4Scale(width));

  const type = $derived({
    title: 14 * k,
    subtitle: scale.md * k,
    rotulo: scale.sm * k,
    detalhe: scale.xs * k,
    eixo: scale.xs * k,
    tituloEixo: scale.sm * k,
    iso: scale.xs * k,
    sm: scale.sm * k,
  });

  const pad = $derived(16 * k);
  const r = $derived(2.8 * k);
  const marca = $derived(3 * k);

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

  /** Os passos 1–2–5 de cada década dentro do domínio. */
  const ticksLog = ([a, b]: [number, number]) => {
    const ticks: number[] = [];
    for (let e = Math.floor(Math.log10(a)); e <= Math.ceil(Math.log10(b)); e++) {
      for (const m of [1, 2, 5]) {
        const v = m * 10 ** e;
        if (v >= a * 0.999 && v <= b * 1.001) ticks.push(v);
      }
    }
    return ticks;
  };
  const ticksX = $derived(ticksLog(dominioX));
  const ticksY = $derived(ticksLog(dominioY));

  // O título do eixo y vai deitado sobre a área do gráfico, alinhado à
  // esquerda: não rouba largura como um título girado roubaria.
  const tituloYTop = $derived(cabecalho + 16 * k);
  const plotTop = $derived(tituloYTop + 14 * k);
  const plotLeft = $derived(
    pad + Math.max(...ticksY.map((t) => measureLabel(formatY(t), type.eixo, 500))) + marca + 4 * k,
  );
  const plotRight = $derived(width - pad);
  const plotW = $derived(plotRight - plotLeft);
  const plotH = $derived(plotW * proporcao);
  const plotBottom = $derived(plotTop + plotH);

  const lx = $derived([Math.log10(dominioX[0]), Math.log10(dominioX[1])]);
  const ly = $derived([Math.log10(dominioY[0]), Math.log10(dominioY[1])]);
  const sx = $derived((v: number) => plotLeft + ((Math.log10(v) - lx[0]) / (lx[1] - lx[0])) * plotW);
  const sy = $derived((v: number) => plotBottom - ((Math.log10(v) - ly[0]) / (ly[1] - ly[0])) * plotH);

  const clamp = (v: number, [a, b]: [number, number]) => Math.min(Math.max(v, a), b);

  /** Cada diagonal recortada ao retângulo do domínio: entra por baixo ou pela esquerda, sai por cima ou pela direita. */
  const isoPos = $derived(
    isolinhas
      .map((iso) => {
        const x0 = clamp(iso.valor / dominioY[1], dominioX);
        const x1 = clamp(iso.valor / dominioY[0], dominioX);
        if (x1 <= x0) return null;
        const a: [number, number] = [sx(x0), sy(iso.valor / x0)];
        const b: [number, number] = [sx(x1), sy(iso.valor / x1)];
        return { ...iso, a, b, angulo: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
      })
      .filter((d) => d !== null),
  );

  /**
   * As faixas entre isolinhas vizinhas, cada uma com a sua cor de
   * `coresFaixas` — ou, sem ela, uma sim, uma não, a começar pela segunda,
   * sobre o painel. Cada faixa é o quadrilátero entre as duas retas,
   * estendidas bem além do domínio — o recorte do painel cuida das bordas.
   */
  const faixas = $derived.by(() => {
    const valores = [...isolinhas.map((iso) => iso.valor)].sort((a, b) => a - b);
    const [xa, xb] = [dominioX[0] / 1e3, dominioX[1] * 1e3];
    const reta = (v: number) => [
      [sx(xa), sy(v / xa)],
      [sx(xb), sy(v / xb)],
    ];
    const bordas = [dominioX[0] * dominioY[0] * 1e-6, ...valores, dominioX[1] * dominioY[1] * 1e6];
    return bordas.slice(0, -1).flatMap((lo, i) => {
      const fill = coresFaixas ? coresFaixas[i] : i % 2 === 1 ? cinza.faixa : null;
      if (!fill) return [];
      const [a, b] = reta(lo);
      const [c, d] = reta(bordas[i + 1]);
      return [{ key: lo, fill, pontos: [a, b, d, c].map((p) => p.join(',')).join(' ') }];
    });
  });

  type Caixa = { x0: number; y0: number; x1: number; y1: number };
  const sobrepoe = (p: Caixa, q: Caixa) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;

  const pontosPos = $derived.by(() => {
    const base = pontos.map((p) => {
      const foraX = p.x < dominioX[0] ? -1 : p.x > dominioX[1] ? 1 : 0;
      const foraY = p.y < dominioY[0] ? -1 : p.y > dominioY[1] ? 1 : 0;
      return {
        ...p,
        cx: sx(clamp(p.x, dominioX)),
        cy: sy(clamp(p.y, dominioY)),
        foraX,
        foraY,
        fora: foraX !== 0 || foraY !== 0,
      };
    });

    const ocupadas: Caixa[] = base.map((p) => ({
      x0: p.cx - r,
      y0: p.cy - r,
      x1: p.cx + r,
      y1: p.cy + r,
    }));
    const vao = 3 * k;
    const alto = type.rotulo;

    const rotulos = [...base]
      .sort((a, b) => a.cy - b.cy)
      .map((p) => {
        const linhas = p.fora && p.detalhe ? [p.label, p.detalhe] : [p.label];
        // A medida estimada fica um pouco aquém do texto desenhado; a folga
        // evita que dois rótulos vizinhos se encostem.
        const w =
          Math.max(
            measureLabel(linhas[0], type.rotulo, 600),
            linhas[1] ? measureLabel(linhas[1], type.detalhe, 500) : 0,
          ) *
            1.08 +
          2 * k;
        const h = alto + (linhas[1] ? type.detalhe * 1.25 : 0);
        const d = r + vao;
        // Ao lado do ponto, a primeira linha fica com as maiúsculas centradas
        // no círculo: a linha de base desce 0,35 do corpo abaixo do centro, e o
        // topo da caixa está 0,8 do corpo acima da linha de base.
        const lado = p.cy + alto * 0.35 - alto * 0.8;
        // Oito lugares em volta do ponto: direita, esquerda, cima, baixo e as diagonais.
        const lugares: { x0: number; y0: number; anchor: 'start' | 'end' | 'middle' }[] = [
          { x0: p.cx + d, y0: lado, anchor: 'start' },
          { x0: p.cx - d - w, y0: lado, anchor: 'end' },
          { x0: p.cx - w / 2, y0: p.cy - d - h, anchor: 'middle' },
          { x0: p.cx - w / 2, y0: p.cy + d, anchor: 'middle' },
          { x0: p.cx + d * 0.7, y0: p.cy - d * 0.7 - h, anchor: 'start' },
          { x0: p.cx - d * 0.7 - w, y0: p.cy - d * 0.7 - h, anchor: 'end' },
          { x0: p.cx + d * 0.7, y0: p.cy + d * 0.7, anchor: 'start' },
          { x0: p.cx - d * 0.7 - w, y0: p.cy + d * 0.7, anchor: 'end' },
        ];
        const caixaDe = (l: (typeof lugares)[number]): Caixa => ({
          x0: l.x0,
          y0: l.y0,
          x1: l.x0 + w,
          y1: l.y0 + h,
        });
        const dentroDoPlot = (c: Caixa) =>
          c.x0 >= plotLeft && c.x1 <= plotRight && c.y0 >= plotTop && c.y1 <= plotBottom;
        const proprio = (c: Caixa) =>
          c.x0 === p.cx - r && c.y0 === p.cy - r && c.x1 === p.cx + r && c.y1 === p.cy + r;
        const escolhido =
          lugares.find((l) => {
            const c = caixaDe(l);
            return dentroDoPlot(c) && !ocupadas.some((o) => !proprio(o) && sobrepoe(c, o));
          }) ?? lugares[0];
        const caixa = caixaDe(escolhido);
        ocupadas.push(caixa);
        const x =
          escolhido.anchor === 'start' ? caixa.x0 : escolhido.anchor === 'end' ? caixa.x1 : caixa.x0 + w / 2;
        return { key: p.key, linhas, x, y: caixa.y0 + alto * 0.8, anchor: escolhido.anchor };
      });

    // Os valores das diagonais, depois dos nomes: cada um no primeiro trecho da
    // sua diagonal, de cima para baixo, em que o texto girado não cobre ponto
    // nem rótulo. A caixa de colisão é a envolvente do texto girado.
    const isoRotulos = isoPos.map((iso) => {
      const w = measureLabel(iso.label, type.iso, 600);
      const h = type.iso;
      const rad = (iso.angulo * Math.PI) / 180;
      const [cos, sin] = [Math.abs(Math.cos(rad)), Math.abs(Math.sin(rad))];
      const meiaL = (cos * w + sin * h) / 2;
      const meiaA = (sin * w + cos * h) / 2;
      const len = Math.hypot(iso.b[0] - iso.a[0], iso.b[1] - iso.a[1]);
      // O texto fica logo acima da linha: o centro sai da linha na normal.
      const nx = Math.sin(rad) * (h * 0.5 + 1.5 * k);
      const ny = -Math.cos(rad) * (h * 0.5 + 1.5 * k);
      const passos = 24;
      let melhor: { cx: number; cy: number } | null = null;
      for (let i = 1; i < passos; i++) {
        const t = i / passos;
        const cx = iso.a[0] + (iso.b[0] - iso.a[0]) * t + nx;
        const cy = iso.a[1] + (iso.b[1] - iso.a[1]) * t + ny;
        const caixa = { x0: cx - meiaL, y0: cy - meiaA, x1: cx + meiaL, y1: cy + meiaA };
        const cabe =
          t * len >= w / 2 &&
          (1 - t) * len >= w / 2 &&
          caixa.x0 >= plotLeft &&
          caixa.x1 <= plotRight &&
          caixa.y0 >= plotTop &&
          caixa.y1 <= plotBottom &&
          !ocupadas.some((o) => sobrepoe(caixa, o));
        if (cabe) {
          melhor = { cx, cy };
          ocupadas.push(caixa);
          break;
        }
      }
      return melhor ? { valor: iso.valor, label: iso.label, angulo: iso.angulo, ...melhor } : null;
    });

    return { base, rotulos, isoRotulos: isoRotulos.filter((d) => d !== null) };
  });

  const eixoXTop = $derived(plotBottom + marca + 3 * k + type.eixo);
  const tituloXTop = $derived(eixoXTop + 6 * k + type.tituloEixo);
  const notasTop = $derived(tituloXTop + 12 * k);
  const height = $derived(notasTop + (footnoteLines.length + sourceLines.length) * notaLine + pad);

  const uid = $props.id();
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
    <clipPath id="dispersao-{uid}">
      <rect x={plotLeft} y={plotTop} width={plotW} height={plotH} rx={RAIO_BARRA * k} />
    </clipPath>
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

  <text
    x={pad}
    y={tituloYTop}
    font-size={type.tituloEixo}
    font-weight="600"
    fill={cinza.subtitulo}
    font-family={fontFamily}>{tituloY}</text
  >

  <!-- O painel e as faixas de total: nenhuma linha dentro da área do gráfico. -->
  <g clip-path="url(#dispersao-{uid})">
    <rect x={plotLeft} y={plotTop} width={plotW} height={plotH} fill={cinza.painel} />
    {#each faixas as f (f.key)}
      <polygon points={f.pontos} fill={f.fill} />
    {/each}
  </g>

  <!-- Valores nos passos 1–2–5 de cada década, com marcas curtas fora do painel. -->
  {#each ticksX as t (t)}
    <line
      x1={sx(t)}
      x2={sx(t)}
      y1={plotBottom}
      y2={plotBottom + marca}
      stroke={cinza.eixo}
      stroke-width={0.8 * k}
    />
    <text
      x={sx(t)}
      y={eixoXTop}
      text-anchor="middle"
      font-size={type.eixo}
      fill={cinza.eixo}
      font-family={fontFamily}>{formatX(t)}</text
    >
  {/each}
  {#each ticksY as t (t)}
    <line
      x1={plotLeft - marca}
      x2={plotLeft}
      y1={sy(t)}
      y2={sy(t)}
      stroke={cinza.eixo}
      stroke-width={0.8 * k}
    />
    <text
      x={plotLeft - marca - 3 * k}
      y={sy(t) + type.eixo * 0.35}
      text-anchor="end"
      font-size={type.eixo}
      fill={cinza.eixo}
      font-family={fontFamily}>{formatY(t)}</text
    >
  {/each}

  <text
    x={plotRight}
    y={tituloXTop}
    text-anchor="end"
    font-size={type.tituloEixo}
    font-weight="600"
    fill={cinza.subtitulo}
    font-family={fontFamily}>{tituloX}</text
  >

  <!-- O valor de cada borda de faixa, deitado sobre ela, do lado do total maior. -->
  {#each pontosPos.isoRotulos as iso (iso.valor)}
    <text
      x={iso.cx}
      y={iso.cy + type.iso * 0.35}
      text-anchor="middle"
      transform="rotate({iso.angulo} {iso.cx} {iso.cy})"
      font-size={type.iso}
      font-weight="600"
      fill={corRotuloFaixa}
      font-family={fontFamily}>{iso.label}</text
    >
  {/each}

  {#each pontosPos.base as p (p.key)}
    {#if p.fora}
      {@const ang = Math.atan2(-p.foraY, p.foraX)}
      {@const ax = p.cx + Math.cos(ang) * (r + 1.5 * k)}
      {@const ay = p.cy + Math.sin(ang) * (r + 1.5 * k)}
      {@const bx = p.cx + Math.cos(ang) * (r + 8 * k)}
      {@const by = p.cy + Math.sin(ang) * (r + 8 * k)}
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={cor} stroke-width={1.1 * k} />
      <path
        d="M{bx},{by} L{bx - Math.cos(ang - 0.5) * 3.5 * k},{by - Math.sin(ang - 0.5) * 3.5 * k} M{bx},{by} L{bx - Math.cos(ang + 0.5) * 3.5 * k},{by - Math.sin(ang + 0.5) * 3.5 * k}"
        stroke={cor}
        stroke-width={1.1 * k}
        fill="none"
      />
    {/if}
    <circle cx={p.cx} cy={p.cy} {r} fill="none" stroke={cor} stroke-width={1.1 * k} />
  {/each}

  {#each pontosPos.rotulos as l (l.key)}
    <text
      x={l.x}
      y={l.y}
      text-anchor={l.anchor}
      font-size={type.rotulo}
      font-weight="600"
      fill={cinza.dado}
      font-family={fontFamily}
      >{l.linhas[0]}{#if l.linhas[1]}<tspan
          x={l.x}
          dy={type.detalhe * 1.25}
          font-size={type.detalhe}
          font-weight="500"
          fill={cinza.subtitulo}>{l.linhas[1]}</tspan
        >{/if}</text
    >
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
