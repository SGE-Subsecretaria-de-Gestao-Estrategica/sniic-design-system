<script lang="ts" module>
  /** Um ponto da dispersão: as duas medidas, em unidades dos dados. */
  export type PontoDispersao = {
    key: string;
    label: string;
    x: number;
    y: number;
    /** Complemento do rótulo, ao lado do nome, só para os pontos fora da escala. */
    detalhe?: string;
  };
  /** Uma diagonal de produto constante `x · y = valor`. */
  export type Isolinha = {
    valor: number;
    label: string;
    /**
     * Em qual trecho livre da diagonal, de cima para baixo, o valor é escrito
     * — 0, o padrão, é o primeiro. Se não houver tantos, fica no último.
     */
    trecho?: number;
  };
  /**
   * Uma nota sobre o gráfico, num vão livre do painel: um ou mais destaques
   * empilhados — o número grande na cor da medida e a frase embaixo, a forma
   * de toda anotação de `figuras/` (`Destaque`) —, e os pontos de que ela fala
   * desenhados cheios.
   */
  export type AnotacaoDispersao = {
    itens: { valor: string; texto: string; cor: string }[];
    /** As `key` dos pontos em destaque. */
    destaques?: string[];
    /**
     * A nota fica no canto de baixo à esquerda do painel, com a mesma
     * distância, `margem`, da borda esquerda à primeira letra e da última
     * linha de base à borda de baixo. Em unidades autorais (multiplicar por `k`).
     */
    margem?: number;
    /** A largura da nota, em fração da largura do painel. */
    largura: number;
  };
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
   * Mesmo cabeçalho e rodapé das demais figuras de `figuras/`.
   */
  import { a4Scale, fontFamily, fontSize as scale, measureLabel, wrapText } from '../eixo1/tokens';
  import { RAIO_BARRA } from './forma';
  import Destaque, { DESTAQUE, alturaDestaque } from './Destaque.svelte';


  interface Props {
    pontos: PontoDispersao[];
    dominioX: [number, number];
    dominioY: [number, number];
    /** Sem seta: a seta do eixo x é desenhada depois do texto. */
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
    /** Cor dos valores dos dois eixos. */
    corEixos?: string;
    anotacao?: AnotacaoDispersao;
    title: string;
    subtitle?: string;
    footnote?: string;
    source?: string;
    /** Altura da área do gráfico em relação à largura. */
    proporcao?: number;
    width?: number;
    /** A cor do texto escuro — título, rótulos e valores. */
    corTexto?: string;
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
    corRotuloFaixa = '#8A8A84',
    corEixos = '#8A8A84',
    anotacao,
    title,
    subtitle,
    footnote,
    source,
    proporcao = 0.78,
    width = 580,
    corTexto = '#2F2F2B',
    background = '#ffffff',
    svgEl = $bindable(null),
  }: Props = $props();

  const cinza = $derived({
    titulo: corTexto,
    subtitulo: '#6E6E68',
    dado: corTexto,
    eixo: '#8A8A84',
    nota: '#8A8A84',
    /** O fundo da área do gráfico — o mesmo das faixas de `PainelMetricasChart`. */
    painel: '#F4F4F1',
    /** As faixas diagonais alternadas, sobre o painel. */
    faixa: '#E9E9E3',
  });

  const k = $derived(a4Scale(width));

  const type = $derived({
    title: 14 * k,
    subtitle: scale.md * k,
    rotulo: scale.sm * k,
    detalhe: scale.xs * k,
    valorEixo: scale.sm * k,
    tituloEixo: scale.sm * k,
    iso: scale.xs * k,
    destaqueTexto: scale.md * k,
    sm: scale.sm * k,
  });

  const pad = $derived(16 * k);
  const r = $derived(2.8 * k);
  const marca = $derived(3 * k);

  // O texto é medido num canvas, na fonte do gráfico. Se a General Sans ainda
  // não carregou na primeira medida, o canvas mede na fonte de reserva, mais
  // estreita, e rótulos e notas saem apertados. Cada vez que as fontes terminam
  // de carregar, `medir` e `quebrar` mudam de identidade e todo o arranjo que
  // mede texto é refeito.
  let versaoFontes = $state(0);
  $effect(() => {
    if (typeof document === 'undefined' || !document.fonts) return;
    const refazer = () => versaoFontes++;
    document.fonts.ready.then(refazer);
    document.fonts.addEventListener('loadingdone', refazer);
    return () => document.fonts.removeEventListener('loadingdone', refazer);
  });
  const medir = $derived.by(() => {
    void versaoFontes;
    return (texto: string, tamanho: number, peso?: number) => measureLabel(texto, tamanho, peso);
  });
  const quebrar = $derived.by(() => {
    void versaoFontes;
    return (texto: string, tamanho: number, largura: number, peso?: number) =>
      wrapText(texto, tamanho, largura, peso);
  });

  const textWidth = $derived(width - pad * 2);
  const titleLines = $derived(quebrar(title, type.title, textWidth, 600));
  const subtitleLines = $derived(quebrar(subtitle ?? '', type.subtitle, textWidth));
  const footnoteLines = $derived(quebrar(footnote ?? '', type.sm, textWidth));
  const sourceLines = $derived(quebrar(source ?? '', type.sm, textWidth));

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
  // A origem fica sem valor nos dois eixos: os dois rótulos disputariam o canto.
  const semOrigem = (ticks: number[], [a]: [number, number]) => ticks.filter((t) => t > a * 1.001);
  const ticksX = $derived(semOrigem(ticksLog(dominioX), dominioX));
  const ticksY = $derived(semOrigem(ticksLog(dominioY), dominioY));

  // O título do eixo y vai deitado sobre a área do gráfico, alinhado à
  // esquerda: não rouba largura como um título girado roubaria.
  const tituloYTop = $derived(cabecalho + 16 * k);
  const plotTop = $derived(tituloYTop + 14 * k);
  const plotLeft = $derived(
    pad + Math.max(...ticksY.map((t) => medir(formatY(t), type.valorEixo, 600))) * 1.08 + marca + 4 * k,
  );
  const plotRight = $derived(width - pad);
  const plotW = $derived(plotRight - plotLeft);
  const plotH = $derived(plotW * proporcao);
  const plotBottom = $derived(plotTop + plotH);
  // Um respiro no alto do painel, acima do fim da escala: o ponto fora da
  // escala fica preso ao topo do domínio, e o rótulo dele, ao lado do ponto,
  // cabe dentro do painel.
  const respiro = $derived(24 * k);
  const escalaTop = $derived(plotTop + respiro);
  const recuo = $derived(11 * k);
  const distCanto = $derived(19.5 * k);
  /** Espaço entre o nome e o detalhe, na mesma linha. */
  const vaoDetalhe = $derived(5 * k);
  const setaEixoX = $derived(22 * k);

  /**
   * O título do eixo x fica dentro do painel, no canto de baixo à direita, e
   * termina na seta. A caixa entra nas ocupadas: nenhum rótulo a cobre.
   */
  const tituloXPos = $derived.by(() => {
    const margem = 8 * k;
    const base = plotBottom - margem;
    const fimSeta = plotRight - margem;
    const inicioSeta = fimSeta - setaEixoX;
    const fimTexto = inicioSeta - 5 * k;
    const w = medir(tituloX, type.tituloEixo, 600);
    return {
      base,
      meio: base - type.tituloEixo * 0.35,
      inicioSeta,
      fimSeta,
      fimTexto,
      caixa: { x0: fimTexto - w, y0: base - type.tituloEixo, x1: fimSeta, y1: base + 2 * k },
    };
  });

  /** A ponta de seta: um triângulo com o dorso recortado, cheio. */
  const seta = $derived({ comprimento: 6.5 * k, largura: 6 * k, recorte: 2.2 * k, haste: 1.2 * k });
  const pontaSeta = $derived(
    `M0,0 L${-seta.comprimento},${-seta.largura / 2} L${-seta.comprimento + seta.recorte},0 L${-seta.comprimento},${seta.largura / 2} Z`,
  );

  const lx = $derived([Math.log10(dominioX[0]), Math.log10(dominioX[1])]);
  const ly = $derived([Math.log10(dominioY[0]), Math.log10(dominioY[1])]);
  const sx = $derived((v: number) => plotLeft + ((Math.log10(v) - lx[0]) / (lx[1] - lx[0])) * plotW);
  const sy = $derived(
    (v: number) => plotBottom - ((Math.log10(v) - ly[0]) / (ly[1] - ly[0])) * (plotBottom - escalaTop),
  );

  const clamp = (v: number, [a, b]: [number, number]) => Math.min(Math.max(v, a), b);

  /**
   * Onde vai o valor de cada isolinha: no eixo da faixa que começa nela, a
   * diagonal de total `√(valor · próximo)` — em escala log, a meia distância
   * entre as duas bordas. A última faixa, sem borda de cima, toma a largura da
   * anterior. Cada diagonal é recortada ao retângulo do domínio: entra por
   * baixo ou pela esquerda, sai por cima ou pela direita.
   */
  const isoPos = $derived.by(() => {
    const valores = isolinhas.map((iso) => iso.valor).sort((a, b) => a - b);
    return isolinhas
      .map((iso) => {
        const i = valores.indexOf(iso.valor);
        const proximo = valores[i + 1];
        const anterior = valores[i - 1];
        const centro = proximo
          ? Math.sqrt(iso.valor * proximo)
          : anterior
            ? iso.valor * Math.sqrt(iso.valor / anterior)
            : iso.valor;
        const x0 = clamp(centro / dominioY[1], dominioX);
        const x1 = clamp(centro / dominioY[0], dominioX);
        if (x1 <= x0) return null;
        const a: [number, number] = [sx(x0), sy(centro / x0)];
        const b: [number, number] = [sx(x1), sy(centro / x1)];
        return { ...iso, a, b, angulo: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
      })
      .filter((d) => d !== null);
  });

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

  /**
   * A nota: os destaques empilhados, cada frase quebrada na largura dada, com
   * um respiro entre um e outro.
   */
  const nota = $derived.by(() => {
    if (!anotacao) return null;
    const margem = (anotacao.margem ?? 10) * k;
    const w = plotW * anotacao.largura;
    const vaoItens = 10 * k;
    let topo = 0;
    const itens = anotacao.itens.map((item) => {
      const linhas = quebrar(item.texto, type.destaqueTexto, w, 500);
      const y = topo;
      topo += alturaDestaque(linhas.length, k) + vaoItens;
      return { ...item, linhas, y };
    });
    const h = topo - vaoItens;
    // A última linha de base fica a `margem` da borda de baixo: a altura do
    // bloco menos o que a entrelinha deixa abaixo da última base.
    const ultimaBase = h - (1 - 0.85) * DESTAQUE.linha * k;
    const x0 = plotLeft + margem;
    const y0 = plotBottom - margem - ultimaBase;
    return { x0, y0, itens, caixa: { x0, y0, x1: x0 + w, y1: y0 + h } };
  });
  const destaques = $derived(new Set(anotacao?.destaques ?? []));
  const sobrepoe = (p: Caixa, q: Caixa) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;

  const pontosPos = $derived.by(() => {
    const base = pontos.map((p) => {
      const foraX = p.x < dominioX[0] ? -1 : p.x > dominioX[1] ? 1 : 0;
      const foraY = p.y < dominioY[0] ? -1 : p.y > dominioY[1] ? 1 : 0;
      // O ponto fora da escala recua da borda para dentro do painel, e a seta
      // vai dele até a borda — ou até o canto, se está fora nos dois eixos.
      // Em cima o ponto sobe para dentro do `respiro`, perto da borda.
      // No canto, o ponto fica a `distCanto` do vértice, na diagonal (45°).
      const canto = foraX !== 0 && foraY !== 0;
      const anguloCanto = (45 * Math.PI) / 180;
      const rx = canto ? distCanto * Math.cos(anguloCanto) : recuo;
      const ry = canto ? distCanto * Math.sin(anguloCanto) : recuo;
      let cx = sx(clamp(p.x, dominioX));
      let cy = sy(clamp(p.y, dominioY));
      if (foraX < 0) cx = plotLeft + rx;
      if (foraX > 0) cx = plotRight - rx;
      if (foraY > 0) cy = plotTop + ry;
      if (foraY < 0) cy = plotBottom - ry;
      return {
        ...p,
        cx,
        cy,
        foraX,
        foraY,
        fora: foraX !== 0 || foraY !== 0,
        alvo: [
          foraX < 0 ? plotLeft : foraX > 0 ? plotRight : cx,
          foraY > 0 ? plotTop : foraY < 0 ? plotBottom : cy,
        ] as [number, number],
      };
    });

    const ocupadas: Caixa[] = base.map((p) => ({
      x0: p.cx - r,
      y0: p.cy - r,
      x1: p.cx + r,
      y1: p.cy + r,
    }));
    // A nota entra antes de todos os rótulos: nenhum a cobre.
    if (nota) ocupadas.push(nota.caixa);
    ocupadas.push(tituloXPos.caixa);
    const vao = 3 * k;
    const alto = type.rotulo;

    const rotulos = [...base]
      .sort((a, b) => a.cy - b.cy)
      .map((p) => {
        // O nome e, para o ponto fora da escala, o detalhe na mesma linha, à
        // direita do nome.
        const partes = p.fora && p.detalhe ? [p.label, p.detalhe] : [p.label];
        // A medida estimada fica um pouco aquém do texto desenhado; a folga
        // evita que dois rótulos vizinhos se encostem.
        const w =
          (medir(partes[0], type.rotulo, 600) +
            (partes[1] ? vaoDetalhe + medir(partes[1], type.detalhe, 500) : 0)) *
            1.08 +
          2 * k;
        const h = alto;
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
        // Um rótulo guarda distância dos vizinhos: a caixa cresce `margem` de
        // cada lado no teste de colisão, e não no desenho.
        const margem = 4 * k;
        const comMargem = (c: Caixa): Caixa => ({
          x0: c.x0 - margem,
          y0: c.y0 - margem,
          x1: c.x1 + margem,
          y1: c.y1 + margem,
        });
        const escolhido =
          lugares.find((l) => {
            const c = caixaDe(l);
            return (
              dentroDoPlot(c) && !ocupadas.some((o) => !proprio(o) && sobrepoe(comMargem(c), o))
            );
          }) ?? lugares[0];
        const caixa = caixaDe(escolhido);
        ocupadas.push(caixa);
        const x =
          escolhido.anchor === 'start' ? caixa.x0 : escolhido.anchor === 'end' ? caixa.x1 : caixa.x0 + w / 2;
        return { key: p.key, partes, x, y: caixa.y0 + alto * 0.8, anchor: escolhido.anchor };
      });

    // Os valores das diagonais, depois dos nomes: cada um centrado no primeiro
    // trecho livre da sua diagonal, de cima para baixo — da entrada no painel
    // até o primeiro ponto ou rótulo que o texto girado cobriria. A caixa de
    // colisão é a envolvente do texto girado.
    const isoRotulos = isoPos.map((iso) => {
      const w = medir(iso.label, type.iso, 600);
      const h = type.iso;
      const rad = (iso.angulo * Math.PI) / 180;
      const [cos, sin] = [Math.abs(Math.cos(rad)), Math.abs(Math.sin(rad))];
      const meiaL = (cos * w + sin * h) / 2;
      const meiaA = (sin * w + cos * h) / 2;
      const len = Math.hypot(iso.b[0] - iso.a[0], iso.b[1] - iso.a[1]);
      const passos = 120;
      const lugar = (t: number) => {
        const cx = iso.a[0] + (iso.b[0] - iso.a[0]) * t;
        const cy = iso.a[1] + (iso.b[1] - iso.a[1]) * t;
        return { cx, cy, caixa: { x0: cx - meiaL, y0: cy - meiaA, x1: cx + meiaL, y1: cy + meiaA } };
      };
      const cabe = (t: number) => {
        const { caixa } = lugar(t);
        return (
          t * len >= w / 2 &&
          (1 - t) * len >= w / 2 &&
          caixa.x0 >= plotLeft &&
          caixa.x1 <= plotRight &&
          caixa.y0 >= plotTop &&
          caixa.y1 <= plotBottom &&
          !ocupadas.some((o) => sobrepoe(caixa, o))
        );
      };
      // Os trechos contínuos em que o texto cabe; o escolhido, e o meio dele.
      const trechos: [number, number][] = [];
      for (let i = 1; i < passos; i++) {
        if (!cabe(i / passos)) continue;
        const ultimo = trechos.at(-1);
        if (ultimo && ultimo[1] === i - 1) ultimo[1] = i;
        else trechos.push([i, i]);
      }
      if (trechos.length === 0) return null;
      const [inicio, fim] = trechos[Math.min(iso.trecho ?? 0, trechos.length - 1)];
      const { cx, cy, caixa } = lugar((inicio + fim) / 2 / passos);
      ocupadas.push(caixa);
      return { valor: iso.valor, label: iso.label, angulo: iso.angulo, cx, cy };
    });

    return { base, rotulos, isoRotulos: isoRotulos.filter((d) => d !== null) };
  });

  const eixoXTop = $derived(plotBottom + marca + 3 * k + type.valorEixo);
  const notasTop = $derived(eixoXTop + 12 * k);
  const height = $derived(notasTop + (footnoteLines.length + sourceLines.length) * notaLine + pad);

  const uid = $props.id();
</script>

<!-- Seta de `de` até `ate`: haste de pontas redondas e a ponta cheia, com o bico exatamente em `ate`. -->
{#snippet setaDe(de: [number, number], ate: [number, number], fill: string, escala = 1)}
  {@const ang = Math.atan2(ate[1] - de[1], ate[0] - de[0])}
  {@const fimHaste = (seta.comprimento - seta.recorte) * escala}
  <line
    x1={de[0]}
    y1={de[1]}
    x2={ate[0] - Math.cos(ang) * fimHaste}
    y2={ate[1] - Math.sin(ang) * fimHaste}
    stroke={fill}
    stroke-width={seta.haste}
    stroke-linecap="round"
  />
  <path
    d={pontaSeta}
    transform="translate({ate[0]} {ate[1]}) rotate({(ang * 180) / Math.PI}) scale({escala})"
    {fill}
    stroke={fill}
    stroke-width={(0.5 * k) / escala}
    stroke-linejoin="round"
  />
{/snippet}

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
      font-size={type.valorEixo}
      font-weight="600"
      fill={corEixos}
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
      y={sy(t) + type.valorEixo * 0.35}
      text-anchor="end"
      font-size={type.valorEixo}
      font-weight="600"
      fill={corEixos}
      font-family={fontFamily}>{formatY(t)}</text
    >
  {/each}

  <!-- O título do eixo x, dentro do painel, termina na seta. -->
  <text
    x={tituloXPos.fimTexto}
    y={tituloXPos.base}
    text-anchor="end"
    font-size={type.tituloEixo}
    font-weight="600"
    fill={cinza.subtitulo}
    font-family={fontFamily}>{tituloX}</text
  >
  {@render setaDe(
    [tituloXPos.inicioSeta, tituloXPos.meio],
    [tituloXPos.fimSeta, tituloXPos.meio],
    cinza.subtitulo,
  )}

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
      {@const ang = Math.atan2(p.alvo[1] - p.cy, p.alvo[0] - p.cx)}
      {@render setaDe(
        [p.cx + Math.cos(ang) * (r + 2 * k), p.cy + Math.sin(ang) * (r + 2 * k)],
        p.alvo,
        cor,
        0.9,
      )}
    {/if}
    <circle
      cx={p.cx}
      cy={p.cy}
      {r}
      fill={destaques.has(p.key) ? cor : 'none'}
      stroke={cor}
      stroke-width={1.1 * k}
    />
  {/each}

  {#if nota}
    {#each nota.itens as item, i (i)}
      <Destaque
        {corTexto}
        x={nota.x0}
        y={nota.y0 + item.y}
        valor={item.valor}
        linhas={item.linhas}
        cor={item.cor}
        {k}
      />
    {/each}
  {/if}

  {#each pontosPos.rotulos as l (l.key)}
    <text
      x={l.x}
      y={l.y}
      text-anchor={l.anchor}
      font-size={type.rotulo}
      font-weight="600"
      fill={cinza.dado}
      font-family={fontFamily}
      >{l.partes[0]}{#if l.partes[1]}<tspan
          dx={vaoDetalhe}
          font-size={type.detalhe}
          font-weight="500"
          fill={cinza.dado}>{l.partes[1]}</tspan
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
