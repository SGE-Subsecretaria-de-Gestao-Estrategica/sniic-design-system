<script lang="ts" module>
  /** Uma categoria e as duas participações que o haltere liga. */
  export type LinhaHalteres = {
    key: string;
    label: string;
    a: number;
    b: number;
    /** O valor da coluna à direita, já formatado. */
    extra?: string;
  };
</script>

<script lang="ts">
  /**
   * Halteres: duas participações por categoria — `a` e `b` —, cada uma um
   * ponto sobre o mesmo eixo, ligadas por um traço. O traço é a diferença; com
   * `formatDiff`, o número sobre ele a diz sem que o leitor subtraia.
   *
   * O traço é pintado com a rampa `gradiente`, de `a` para `b`, seja qual for
   * o lado em que `b` cai: a cor diz a direção. Com uma rampa que vai da cor
   * de uma medida à da outra (de contemplados a recursos, por exemplo), o
   * traço lê como "de onde as pessoas estão para onde o dinheiro foi".
   *
   * Os rótulos de valor ficam do lado de fora de cada ponta — o menor à
   * esquerda, o maior à direita —, então não colidem nem quando os dois pontos
   * coincidem. `extra` abre uma coluna à direita do eixo para uma terceira
   * medida que não cabe na escala (o valor médio, por exemplo).
   *
   * Mesmo cabeçalho, legenda em pastilhas e rodapé das demais figuras de `figuras/`.
   */
  import { a4Scale, fontFamily, fontSize as scale, measureLabel, wrapText } from '../eixo1/tokens';
  import { layoutLegend } from '../eixo1/legend';
  import { RAIO_BARRA, segmentoPath } from './forma';


  interface Props {
    linhas: LinhaHalteres[];
    labelA: string;
    labelB: string;
    corA: string;
    corB: string;
    /** As cores do traço, de `a` para `b`. Por omissão, só `corA` → `corB`. */
    gradiente?: readonly string[];
    title: string;
    subtitle?: string;
    /** Formato dos pontos (entrada em escala 0–100). */
    formatValue?: (v: number) => string;
    /** Formato da diferença `b − a`, escrita sobre o traço. Sem ele, a diferença não aparece. */
    formatDiff?: (d: number) => string;
    /** O título da coluna de `extra`. */
    extraTitulo?: string;
    /** Passo das linhas de grade, na unidade dos dados. */
    passo?: number;
    footnote?: string;
    source?: string;
    raio?: number;
    width?: number;
    /** A cor do texto escuro — título, rótulos e valores. */
    corTexto?: string;
    background?: string | null;
    svgEl?: SVGSVGElement | null;
  }

  let {
    linhas,
    labelA,
    labelB,
    corA,
    corB,
    gradiente,
    title,
    subtitle,
    formatValue = (v: number) => `${v}%`,
    formatDiff,
    extraTitulo,
    passo = 10,
    footnote,
    source,
    raio = 6,
    width = 580,
    corTexto = '#2F2F2B',
    background = '#ffffff',
    svgEl = $bindable(null),
  }: Props = $props();

  const cinza = $derived({
    titulo: corTexto,
    subtitulo: '#6E6E68',
    dado: corTexto,
    grade: '#E4E4DF',
    eixo: '#8A8A84',
    nota: '#8A8A84',
  });

  const k = $derived(a4Scale(width));

  const type = $derived({
    title: 14 * k,
    subtitle: scale.md * k,
    rotulo: scale.md * k,
    valor: scale.sm * k,
    diff: scale.sm * k,
    eixo: scale.xs * k,
    sm: scale.sm * k,
  });

  const pad = $derived(16 * k);
  const r = $derived(raio * k);
  const paradas = $derived(gradiente?.length ? gradiente : [corA, corB]);

  const canal = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const luminancia = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const [rr, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => canal(c / 255));
    return 0.2126 * rr + 0.7152 * g + 0.0722 * b;
  };
  const razao = (p: string, q: string) => {
    const [claro, escuro] = [luminancia(p), luminancia(q)].sort((m, n) => n - m);
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
    layoutLegend(
      [
        { label: labelA, color: corA },
        { label: labelB, color: corB },
      ],
      { fontSize: type.sm, fontWeight: 600, padX: 8 * k, maxWidth: textWidth, rowGap: 4 * k },
    ),
  );
  const legendaY = $derived(cabecalho + 13 * k);

  /** A coluna de `extra`: o título quebra em até duas linhas sobre os números. */
  const temExtra = $derived(linhas.some((l) => l.extra));
  const larguraExtra = $derived(
    temExtra
      ? Math.max(
          ...linhas.map((l) => measureLabel(l.extra ?? '', type.valor, 700)),
          66 * k,
        )
      : 0,
  );
  const extraTituloLines = $derived(
    temExtra ? wrapText(extraTitulo ?? '', type.eixo, larguraExtra + 12 * k, 600) : [],
  );

  /** Os ticks do eixo ficam no alto, entre a legenda e a primeira linha. */
  const eixoY = $derived(
    legendaY +
      legendaLayout.height +
      18 * k +
      Math.max(0, extraTituloLines.length - 1) * type.eixo * 1.2,
  );
  const plotTop = $derived(eixoY + 16 * k);

  const larguraRotulo = $derived(
    Math.max(0, ...linhas.map((l) => measureLabel(l.label, type.rotulo, 600))),
  );
  /** Folga para o rótulo de valor à esquerda do menor ponto. */
  const folgaValor = $derived(
    Math.max(0, ...linhas.map((l) => measureLabel(formatValue(Math.min(l.a, l.b)), type.valor, 700))) +
      r +
      8 * k,
  );
  const plotLeft = $derived(pad + larguraRotulo + 14 * k);
  const eixoLeft = $derived(plotLeft + folgaValor);
  const colunaExtraRight = $derived(width - pad);
  const plotRight = $derived(
    width -
      pad -
      (temExtra ? larguraExtra + 22 * k : 0) -
      Math.max(0, ...linhas.map((l) => measureLabel(formatValue(Math.max(l.a, l.b)), type.valor, 700))) -
      r -
      8 * k,
  );

  const maxDom = $derived(
    Math.max(passo, Math.ceil(Math.max(...linhas.flatMap((l) => [l.a, l.b]), 0) / passo) * passo),
  );
  const x = $derived((v: number) => eixoLeft + (v / maxDom) * (plotRight - eixoLeft));
  const ticks = $derived(Array.from({ length: Math.round(maxDom / passo) + 1 }, (_, i) => i * passo));

  /** Cada linha: o haltere no meio e, com `formatDiff`, o vão para a diferença em cima. */
  const alturaLinha = $derived((formatDiff ? 34 : 26) * k);

  const linhasPos = $derived(
    linhas.map((l, i) => {
      const y = plotTop + i * alturaLinha + alturaLinha * (formatDiff ? 0.62 : 0.5);
      const xa = x(l.a);
      const xb = x(l.b);
      const d = l.b - l.a;
      return {
        ...l,
        y,
        xa,
        xb,
        d,
        /** Quem fica à esquerda leva o rótulo à esquerda. */
        aEsquerda: l.a <= l.b,
      };
    }),
  );

  const plotBottom = $derived(plotTop + linhas.length * alturaLinha);
  const notasTop = $derived(plotBottom + 14 * k);
  const height = $derived(notasTop + (footnoteLines.length + sourceLines.length) * notaLine + pad);

  // Um id por instância: dois cartões na mesma página não podem dividir o
  // gradiente, cujas coordenadas são as de cada linha.
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
    {#each linhasPos as l, i (l.key)}
      <linearGradient
        id="halteres-{uid}-{i}"
        gradientUnits="userSpaceOnUse"
        x1={l.xa}
        y1={l.y}
        x2={l.xb === l.xa ? l.xa + 0.01 : l.xb}
        y2={l.y}
      >
        {#each paradas as c, j (j)}
          <stop offset={paradas.length > 1 ? j / (paradas.length - 1) : 0} stop-color={c} />
        {/each}
      </linearGradient>
    {/each}
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

  <!-- Grade e eixo no alto. -->
  {#each ticks as t (t)}
    <line
      x1={x(t)}
      x2={x(t)}
      y1={eixoY + 5 * k}
      y2={plotBottom}
      stroke={cinza.grade}
      stroke-width={0.8 * k}
    />
    <text
      x={x(t)}
      y={eixoY}
      text-anchor="middle"
      font-size={type.eixo}
      fill={cinza.eixo}
      font-family={fontFamily}>{formatValue(t)}</text
    >
  {/each}

  {#if temExtra}
    {#each extraTituloLines as linha, i (i)}
      <text
        x={colunaExtraRight}
        y={eixoY - (extraTituloLines.length - 1 - i) * type.eixo * 1.2}
        text-anchor="end"
        font-size={type.eixo}
        font-weight="600"
        fill={cinza.eixo}
        font-family={fontFamily}>{linha}</text
      >
    {/each}
  {/if}

  {#each linhasPos as l, i (l.key)}
    <text
      x={pad + larguraRotulo}
      y={l.y + type.rotulo * 0.35}
      text-anchor="end"
      font-size={type.rotulo}
      font-weight="600"
      fill={cinza.dado}
      font-family={fontFamily}>{l.label}</text
    >

    <line
      x1={l.xa}
      y1={l.y}
      x2={l.xb}
      y2={l.y}
      stroke="url(#halteres-{uid}-{i})"
      stroke-width={5 * k}
      stroke-linecap="round"
    />

    <circle cx={l.xa} cy={l.y} r={r} fill={corA} stroke={background ?? '#ffffff'} stroke-width={1.2 * k} />
    <circle cx={l.xb} cy={l.y} r={r} fill={corB} stroke={background ?? '#ffffff'} stroke-width={1.2 * k} />

    <text
      x={l.aEsquerda ? l.xa - r - 5 * k : l.xa + r + 5 * k}
      y={l.y + type.valor * 0.35}
      text-anchor={l.aEsquerda ? 'end' : 'start'}
      font-size={type.valor}
      font-weight="700"
      fill={corA}
      font-family={fontFamily}>{formatValue(l.a)}</text
    >
    <text
      x={l.aEsquerda ? l.xb + r + 5 * k : l.xb - r - 5 * k}
      y={l.y + type.valor * 0.35}
      text-anchor={l.aEsquerda ? 'start' : 'end'}
      font-size={type.valor}
      font-weight="700"
      fill={corB}
      font-family={fontFamily}>{formatValue(l.b)}</text
    >

    {#if formatDiff}
      <text
        x={(l.xa + l.xb) / 2}
        y={l.y - r - 5 * k}
        text-anchor="middle"
        font-size={type.diff}
        font-weight="600"
        fill={cinza.subtitulo}
        font-family={fontFamily}>{formatDiff(l.d)}</text
      >
    {/if}

    {#if l.extra}
      <text
        x={colunaExtraRight}
        y={l.y + type.valor * 0.35}
        text-anchor="end"
        font-size={type.valor}
        font-weight="700"
        fill={cinza.dado}
        font-family={fontFamily}>{l.extra}</text
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
