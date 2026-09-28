<script lang="ts" module>
  /**
   * Uma barra: o rótulo da linha e o valor de cada parcela nela. Linhas
   * consecutivas com o mesmo `grupo` são desenhadas juntas, com o nome do grupo
   * uma vez na calha e o `label` de cada barra, menor, ao lado.
   */
  export type LinhaComposicao = { label: string; grupo?: string } & Record<
    string,
    number | string | undefined
  >;
</script>

<script lang="ts">
  /**
   * Composição em barras horizontais: cada linha é um todo repartido nas
   * parcelas de `keys`, da esquerda para a direita — a versão deitada de
   * `ComposicaoChart` do Eixo 1, para quando as linhas não são anos e os
   * rótulos são longos demais para caber sob uma coluna.
   *
   * O comprimento da barra é sempre o todo, e não o valor absoluto da linha:
   * o que se compara entre as linhas é a repartição. Por omissão o todo é a
   * soma da linha; com `total`, é um número fixo — o que deixa à vista, na
   * ponta direita, a fração que não entrou em nenhuma parcela (os registros
   * sem classificação, por exemplo), em vez de esticar as parcelas para
   * escondê-la.
   *
   * As pontas externas levam o raio curto de `RAIO_BARRA` e as junções não,
   * como as demais barras da LPG. O valor vai dentro do segmento quando cabe;
   * quando não cabe, desce para baixo da barra, ligado por um traço fino — e
   * os rótulos de fora de uma mesma linha são empurrados para a direita até
   * não se sobreporem, o que mantém a ordem da barra.
   *
   * Com `grupo`, as barras de um mesmo grupo encostam umas nas outras e os
   * grupos se separam pelo vão normal — o par "contemplados / recursos" de uma
   * região, por exemplo, lido como uma unidade. Com `rotulosFora = false`, o
   * valor que não cabe no segmento é omitido em vez de descer para baixo da
   * barra: com muitas barras e parcelas finas, a fila de rótulos de fora
   * atrapalha mais do que informa.
   *
   * Desenhada com as medidas de `../eixo1/tokens` (escala de impressão A4,
   * tipografia, quebra de linha) e a faixa de pastilhas de `../eixo1/legend`,
   * para que as figuras da LPG leiam como parte da mesma coleção.
   */
  import {
    a4Scale,
    fontFamily,
    fontSize as scale,
    labelFitsInBar,
    measureLabel,
    wrapText,
  } from '../eixo1/tokens';
  import { layoutLegend } from '../eixo1/legend';
  import { RAIO_BARRA, segmentoPath } from './forma';

  const cinza = {
    titulo: '#2F2F2B',
    subtitulo: '#6E6E68',
    dado: '#2F2F2B',
    guia: '#B5B5AE',
    nota: '#8A8A84',
  };

  interface Props {
    data: LinhaComposicao[];
    /** As parcelas, na ordem em que se sucedem da esquerda para a direita. */
    keys: string[];
    labels?: Record<string, string>;
    /** Cores na ordem de `keys`. */
    colors: readonly string[];
    title: string;
    subtitle?: string;
    formatValue?: (v: number) => string;
    /** O todo de cada barra. Por omissão, a soma das parcelas da linha. */
    total?: number;
    footnote?: string;
    source?: string;
    /** A faixa de pastilhas sob o subtítulo, na ordem das parcelas. */
    legenda?: boolean;
    /** `false` omite os valores que não cabem no segmento. */
    rotulosFora?: boolean;
    /**
     * Um filete na cor do fundo entre os segmentos — para rampas de tons
     * próximos, em que a cor sozinha não marca bem a junção.
     */
    divisoria?: boolean;
    alturaBarra?: number;
    width?: number;
    background?: string | null;
    svgEl?: SVGSVGElement | null;
  }

  let {
    data,
    keys,
    labels = {},
    colors,
    title,
    subtitle,
    formatValue = (v: number) => String(v),
    total,
    footnote,
    source,
    legenda = true,
    rotulosFora = true,
    divisoria = false,
    alturaBarra = 26,
    width = 580,
    background = '#ffffff',
    svgEl = $bindable(null),
  }: Props = $props();

  const k = $derived(a4Scale(width));

  const type = $derived({
    title: 14 * k,
    subtitle: scale.md * k,
    rotulo: scale.md * k,
    valor: scale.sm * k,
    sm: scale.sm * k,
  });

  const pad = $derived(16 * k);
  const cor = (i: number) => colors[i % colors.length];

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
          keys.map((key, i) => ({ label: labels[key] ?? key, color: cor(i) })),
          { fontSize: type.sm, fontWeight: 600, padX: 8 * k, maxWidth: textWidth, rowGap: 4 * k },
        )
      : null,
  );
  const legendaY = $derived(cabecalho + 13 * k);

  const plotTop = $derived(
    legendaLayout ? legendaY + legendaLayout.height + 22 * k : cabecalho + 20 * k,
  );

  const agrupado = $derived(data.some((row) => row.grupo));

  /** Os rótulos das linhas podem ser longos — até 30% da largura, em até duas linhas. */
  const rotulosQuebrados = $derived(
    data.map((row) =>
      agrupado ? [row.label] : wrapText(row.label, type.rotulo, 0.3 * textWidth, 600),
    ),
  );
  /** Com grupos, o rótulo da barra é secundário: menor e mais leve. */
  const rotuloBarra = $derived(
    agrupado
      ? { size: type.valor, weight: 500, fill: cinza.subtitulo }
      : { size: type.rotulo, weight: 600, fill: cinza.dado },
  );
  const larguraRotulo = $derived(
    Math.max(
      0,
      ...rotulosQuebrados.flat().map((l) => measureLabel(l, rotuloBarra.size, rotuloBarra.weight)),
    ),
  );
  // Folga de 25% na medida: se a fonte ainda não carregou quando a figura mede,
  // a largura sai curta e o nome do grupo encosta no rótulo da barra.
  const larguraGrupo = $derived(
    agrupado
      ? Math.max(0, ...data.map((row) => measureLabel(row.grupo ?? '', type.rotulo, 600))) * 1.25 +
          14 * k
      : 0,
  );
  const rotuloRight = $derived(pad + larguraGrupo + larguraRotulo);
  const plotLeft = $derived(rotuloRight + (agrupado ? 8 * k : 14 * k));
  const plotRight = $derived(width - pad);
  const plotW = $derived(plotRight - plotLeft);

  const rotuloAltura = $derived(13 * k);
  const barH = $derived(alturaBarra * k);
  const gapLinha = $derived(14 * k);
  /** Entre barras de um mesmo grupo. */
  const gapGrupo = $derived(3 * k);
  /** Altura da faixa de rótulos de fora, sob a barra. */
  const faixaFora = $derived(type.valor + 12 * k);

  const valor = (row: LinhaComposicao, key: string) => Number(row[key]) || 0;

  type Segmento = {
    keyIndex: number;
    x: number;
    w: number;
    valor: number;
    texto: string;
    dentro: boolean;
    /** Não cabe no segmento e desce para baixo da barra. */
    fora: boolean;
    /** Onde o rótulo de fora fica, depois de afastado dos vizinhos. */
    xFora: number;
  };

  const linhasPos = $derived.by(() => {
    let cursor = plotTop;
    return data.map((row, i) => {
      const todo = total ?? keys.reduce((s, key) => s + valor(row, key), 0);
      let x = plotLeft;
      const segmentos: Segmento[] = keys.map((key, keyIndex) => {
        const v = valor(row, key);
        const w = todo > 0 ? (v / todo) * plotW : 0;
        const texto = formatValue(v);
        const dentro = labelFitsInBar(texto, type.valor, w, 700, 6 * k, 6 * k);
        const seg = {
          keyIndex,
          x,
          w,
          valor: v,
          texto,
          dentro,
          fora: !dentro && v > 0 && rotulosFora,
          xFora: x + w / 2,
        };
        x += w;
        return seg;
      });

      // Rótulos de fora: primeiro empurrados para a direita até não se
      // sobreporem; depois, da direita para a esquerda, puxados de volta para
      // dentro da borda — sem a segunda passada, os dois últimos de uma linha
      // com parcelas finas na ponta se amontoam contra `plotRight`.
      const fora = segmentos
        .filter((s) => s.fora)
        .map((s) => ({ seg: s, meia: measureLabel(s.texto, type.valor, 700) / 2 }));
      const vao = 6 * k;
      let limite = -Infinity;
      for (const f of fora) {
        f.seg.xFora = Math.max(f.seg.xFora, limite + f.meia + vao);
        limite = f.seg.xFora + f.meia;
      }
      limite = plotRight + vao;
      for (const f of [...fora].reverse()) {
        f.seg.xFora = Math.min(f.seg.xFora, limite - f.meia - vao);
        limite = f.seg.xFora - f.meia;
      }
      const temFora = segmentos.some((s) => s.fora);

      const nLinhasRotulo = Math.max(rotulosQuebrados[i].length, 1);
      const alturaLinha = Math.max(barH, nLinhasRotulo * rotuloAltura);
      const top = cursor + (alturaLinha - barH) / 2;
      const centro = cursor + alturaLinha / 2;
      const mesmoGrupo = agrupado && data[i + 1]?.grupo === row.grupo;
      cursor += alturaLinha + (temFora ? faixaFora : 0) + (mesmoGrupo ? gapGrupo : gapLinha);

      return {
        key: `${row.grupo ?? ''}|${row.label}`,
        label: row.label,
        grupo: row.grupo,
        /** Primeira barra do grupo: é ela que abre o nome do grupo na calha. */
        abreGrupo: agrupado && data[i - 1]?.grupo !== row.grupo,
        rotuloLinhas: rotulosQuebrados[i],
        top,
        centro,
        segmentos,
        primeiro: segmentos.findIndex((s) => s.w > 0),
        ultimo: segmentos.reduce((acc, s, j) => (s.w > 0 ? j : acc), -1),
      };
    });
  });

  const plotBottom = $derived.by(() => {
    const ultima = linhasPos[linhasPos.length - 1];
    if (!ultima) return plotTop;
    const fora = ultima.segmentos.some((s) => s.fora);
    return ultima.top + barH + (fora ? faixaFora : 0);
  });

  /** O nome de cada grupo, centrado na altura das barras que ele reúne. */
  const grupos = $derived.by(() => {
    if (!agrupado) return [];
    const spans: { label: string; centro: number }[] = [];
    linhasPos.forEach((l, i) => {
      if (!l.abreGrupo) return;
      let j = i;
      while (linhasPos[j + 1] && !linhasPos[j + 1].abreGrupo) j++;
      spans.push({ label: l.grupo ?? '', centro: (l.top + linhasPos[j].top + barH) / 2 });
    });
    return spans;
  });

  const notasTop = $derived(plotBottom + 16 * k);
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

  {#each grupos as g (g.label)}
    <text
      x={pad}
      y={g.centro + type.rotulo * 0.35}
      font-size={type.rotulo}
      font-weight="600"
      fill={cinza.dado}
      font-family={fontFamily}>{g.label}</text
    >
  {/each}

  {#each linhasPos as l (l.key)}
    {#each l.rotuloLinhas as linha, i (i)}
      <text
        x={rotuloRight}
        y={l.centro - (l.rotuloLinhas.length - 1) * rotuloAltura * 0.5 + (i + 0.35) * rotuloAltura}
        text-anchor="end"
        font-size={rotuloBarra.size}
        font-weight={rotuloBarra.weight}
        fill={rotuloBarra.fill}
        font-family={fontFamily}>{linha}</text
      >
    {/each}

    {#each l.segmentos as seg (seg.keyIndex)}
      {#if seg.w > 0}
        <path
          d={segmentoPath(seg.x, l.top, seg.w, barH, RAIO_BARRA * k, seg.keyIndex === l.primeiro, seg.keyIndex === l.ultimo)}
          fill={cor(seg.keyIndex)}
          stroke={divisoria ? (background ?? '#ffffff') : undefined}
          stroke-width={divisoria ? 1.2 * k : undefined}
        />
        {#if seg.dentro}
          <text
            x={seg.x + seg.w / 2}
            y={l.top + barH / 2 + type.valor * 0.35}
            text-anchor="middle"
            font-size={type.valor}
            font-weight="700"
            fill={contraste(cor(seg.keyIndex))}
            font-family={fontFamily}>{seg.texto}</text
          >
        {:else if seg.fora}
          {@const yTexto = l.top + barH + 10 * k + type.valor * 0.7}
          <path
            d="M{seg.x + seg.w / 2},{l.top + barH + 2 * k} L{seg.xFora},{yTexto - type.valor * 0.95}"
            stroke={cinza.guia}
            stroke-width={0.8 * k}
            fill="none"
          />
          <text
            x={seg.xFora}
            y={yTexto}
            text-anchor="middle"
            font-size={type.valor}
            font-weight="700"
            fill={cinza.dado}
            font-family={fontFamily}>{seg.texto}</text
          >
        {/if}
      {/if}
    {/each}
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
