<script lang="ts" module>
  /** Uma medida do painel: uma coluna de barras com escala própria. */
  export type ColunaPainel = {
    key: string;
    /** Cabeçalho da coluna. */
    label: string;
    cor: string;
    formatValue: (v: number) => string;
    /** Valor de referência (a média nacional), traçado como régua na coluna. */
    referencia?: { valor: number; label: string };
    /**
     * O fim da escala, quando um valor está tão acima dos outros que as demais
     * barras sumiriam. A barra que passa do teto para nele, com uma quebra
     * desenhada perto da ponta; o número escrito é sempre o valor real.
     */
    teto?: number;
  };

  /** Uma linha do painel: uma categoria e um valor por coluna. */
  export type LinhaPainel = {
    key: string;
    label: string;
    /** Indexado pela `key` da coluna. */
    valores: Record<string, number>;
    /** Segunda linha do rótulo de cada valor, indexada pela `key` da coluna. */
    detalhes?: Record<string, string>;
  };
</script>

<script lang="ts">
  /**
   * Painel de medidas: as mesmas categorias nas linhas e várias medidas nas
   * colunas, cada coluna um ranking de barras com a sua própria escala.
   *
   * É a forma de ler juntas medidas que não dividem unidade — recurso total,
   * valor médio por contemplado, valor por habitante —, com a categoria parada
   * na mesma altura de uma coluna à outra. O olho corre a linha e vê o perfil da
   * categoria; corre a coluna e vê o ranking da medida.
   *
   * As escalas são independentes de propósito: o comprimento compara dentro da
   * coluna, nunca entre colunas. A régua tracejada da `referencia` dá, em cada
   * coluna, o ponto contra o qual a categoria está acima ou abaixo.
   *
   * O valor fica sempre fora da barra, com uma segunda linha opcional
   * (`detalhes`) — o número que explica o primeiro (a parte do total, os
   * contemplados, a população).
   *
   * No mesmo idioma das figuras do Eixo 1: medidas e tipografia de
   * `../eixo1/tokens`.
   */
  import { a4Scale, fontFamily, fontSize as scale, measureLabel, wrapText } from '../eixo1/tokens';
  import { RAIO_BARRA } from './forma';


  interface Props {
    colunas: ColunaPainel[];
    linhas: LinhaPainel[];
    title: string;
    subtitle?: string;
    footnote?: string;
    source?: string;
    width?: number;
    alturaBarra?: number;
    /** A cor do texto escuro — título, rótulos e valores. */
    corTexto?: string;
    background?: string | null;
    svgEl?: SVGSVGElement | null;
  }

  let {
    colunas,
    linhas,
    title,
    subtitle,
    footnote,
    source,
    width = 580,
    alturaBarra = 18,
    corTexto = '#2F2F2B',
    background = null,
    svgEl = $bindable(null),
  }: Props = $props();

  const cinza = $derived({
    titulo: corTexto,
    subtitulo: '#6E6E68',
    dado: corTexto,
    nota: '#8A8A84',
    regua: '#8A8A84',
    faixa: '#F4F4F1',
  });

  // svelte-ignore state_referenced_locally -- a largura autoral é fixada na criação
  const k = a4Scale(width);

  const type = {
    title: 14 * k,
    subtitle: scale.md * k,
    cabecalho: scale.sm * k,
    referencia: scale.xs * k,
    rotulo: scale.md * k,
    valor: scale.sm * k,
    detalhe: scale.xs * k,
    nota: scale.sm * k,
  };

  const pad = 16 * k;
  const rx = RAIO_BARRA * k;

  const textWidth = $derived(width - pad * 2);
  const titleLines = $derived(wrapText(title, type.title, textWidth, 600));
  const subtitleLines = $derived(wrapText(subtitle ?? '', type.subtitle, textWidth));
  const footnoteLines = $derived(wrapText(footnote ?? '', type.nota, textWidth));
  const sourceLines = $derived(wrapText(source ?? '', type.nota, textWidth));

  const titleLine = 19 * k;
  const subtitleLine = 15 * k;
  const cabecalhoLine = 13 * k;
  const notaLine = 13.5 * k;

  const headerBottom = $derived(
    12 * k + titleLines.length * titleLine + subtitleLines.length * subtitleLine,
  );

  // Calha dos rótulos das linhas, alinhados à esquerda: se a medida sair curta
  // (fonte ainda carregando), o nome invade a folga, não a margem do cartão.
  const larguraRotulo = $derived(
    Math.max(...linhas.map((l) => measureLabel(l.label, type.rotulo, 600)), 0),
  );
  const rotuloLeft = pad + 8 * k;
  const colunasLeft = $derived(rotuloLeft + larguraRotulo + 18 * k);
  const gapColuna = 18 * k;
  const larguraColuna = $derived(
    (width - pad - colunasLeft - gapColuna * (colunas.length - 1)) / colunas.length,
  );

  const cabecalhos = $derived(
    colunas.map((c) => wrapText(c.label, type.cabecalho, larguraColuna, 600)),
  );
  const nCabecalho = $derived(Math.max(...cabecalhos.map((c) => c.length), 1));
  const temReferencia = $derived(colunas.some((c) => c.referencia));

  const cabecalhoTop = $derived(headerBottom + 16 * k);
  const referenciaY = $derived(cabecalhoTop + nCabecalho * cabecalhoLine + 11 * k);
  const plotTop = $derived(
    cabecalhoTop + nCabecalho * cabecalhoLine + (temReferencia ? 20 * k : 8 * k),
  );

  const alturaLinha = $derived(Math.max(alturaBarra * k, 2 * 12 * k) + 8 * k);

  const colunasPos = $derived(
    colunas.map((c, i) => {
      const left = colunasLeft + i * (larguraColuna + gapColuna);
      // O rótulo de valor mora à direita da barra: a escala cede o espaço dele.
      const larguraTexto = Math.max(
        ...linhas.map((l) =>
          Math.max(
            measureLabel(c.formatValue(l.valores[c.key]), type.valor, 700),
            measureLabel(l.detalhes?.[c.key] ?? '', type.detalhe, 500),
          ),
        ),
      );
      const plotWidth = Math.max(larguraColuna - larguraTexto - 6 * k, 0);
      const max =
        c.teto ?? Math.max(...linhas.map((l) => l.valores[c.key]), c.referencia?.valor ?? 0);
      const x = (v: number) => left + (max > 0 ? (Math.min(v, max) / max) * plotWidth : 0);
      return { ...c, left, plotWidth, x, cabecalho: cabecalhos[i] };
    }),
  );

  const linhasPos = $derived(
    linhas.map((l, i) => {
      const top = plotTop + i * alturaLinha;
      return { ...l, top, meio: top + alturaLinha / 2, faixa: i % 2 === 0 };
    }),
  );

  const plotBottom = $derived(plotTop + linhas.length * alturaLinha);
  const notasTop = $derived(plotBottom + 12 * k);
  const height = $derived(notasTop + (footnoteLines.length + sourceLines.length) * notaLine + pad);
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

  <!-- Faixas alternadas: guiam o olho ao longo da linha, de coluna em coluna. -->
  {#each linhasPos as l (l.key)}
    {#if l.faixa}
      <rect x={pad} y={l.top} width={width - pad * 2} height={alturaLinha} fill={cinza.faixa} />
    {/if}
  {/each}

  <!-- As réguas vão por baixo: barras e rótulos passam por cima delas. -->
  {#each colunasPos as c (c.key)}
    {#if c.referencia}
      {@const xr = c.x(c.referencia.valor)}
      <line
        x1={xr}
        x2={xr}
        y1={referenciaY + 3 * k}
        y2={plotBottom}
        stroke={cinza.regua}
        stroke-width={1 * k}
        stroke-dasharray="{6 * k} {4 * k}"
      />
      <text
        x={xr}
        y={referenciaY}
        text-anchor="middle"
        font-size={type.referencia}
        font-weight="600"
        fill={cinza.subtitulo}
        font-family={fontFamily}>{c.referencia.label}</text
      >
    {/if}
  {/each}

  {#each colunasPos as c (c.key)}
    {#each c.cabecalho as linha, i (i)}
      <text
        x={c.left}
        y={cabecalhoTop + (i + 0.8) * cabecalhoLine}
        font-size={type.cabecalho}
        font-weight="600"
        fill={cinza.titulo}
        font-family={fontFamily}>{linha}</text
      >
    {/each}

    {#each linhasPos as l (l.key)}
      {@const v = l.valores[c.key]}
      {@const xFim = c.x(v)}
      {@const detalhe = l.detalhes?.[c.key]}
      <!-- Halo na cor do fundo da linha: a régua some atrás do número. -->
      {@const halo = l.faixa ? cinza.faixa : (background ?? 'none')}
      <rect
        x={c.left}
        y={l.meio - (alturaBarra * k) / 2}
        width={Math.max(xFim - c.left, 0)}
        height={alturaBarra * k}
        {rx}
        fill={c.cor}
      />
      {#if c.teto !== undefined && v > c.teto}
        <!-- A quebra: duas barras inclinadas na cor do fundo, perto da ponta. -->
        {#each [0, 3.5 * k] as dx (dx)}
          <line
            x1={xFim - 12 * k + dx - 2 * k}
            y1={l.meio + (alturaBarra * k) / 2 + 1 * k}
            x2={xFim - 12 * k + dx + 2 * k}
            y2={l.meio - (alturaBarra * k) / 2 - 1 * k}
            stroke={halo === 'none' ? '#ffffff' : halo}
            stroke-width={1.6 * k}
          />
        {/each}
      {/if}
      <text
        x={xFim + 6 * k}
        y={detalhe ? l.meio - 1.5 * k : l.meio + type.valor * 0.35}
        font-size={type.valor}
        font-weight="700"
        fill={cinza.dado}
        stroke={halo}
        stroke-width={3 * k}
        stroke-linejoin="round"
        paint-order="stroke"
        font-family={fontFamily}>{c.formatValue(v)}</text
      >
      {#if detalhe}
        <text
          x={xFim + 6 * k}
          y={l.meio + type.detalhe + 0.5 * k}
          font-size={type.detalhe}
          font-weight="500"
          fill={cinza.subtitulo}
          stroke={halo}
          stroke-width={3 * k}
          stroke-linejoin="round"
          paint-order="stroke"
          font-family={fontFamily}>{detalhe}</text
        >
      {/if}
    {/each}
  {/each}

  {#each linhasPos as l (l.key)}
    <text
      x={rotuloLeft}
      y={l.meio + type.rotulo * 0.35}
      font-size={type.rotulo}
      font-weight="600"
      fill={cinza.dado}
      font-family={fontFamily}>{l.label}</text
    >
  {/each}

  {#each [...footnoteLines, ...sourceLines] as linha, i (i)}
    <text
      x={pad}
      y={notasTop + (i + 0.8) * notaLine}
      font-size={type.nota}
      fill={cinza.nota}
      font-family={fontFamily}>{linha}</text
    >
  {/each}
</svg>
