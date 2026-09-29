<script lang="ts" module>
  export type ValorUf = { uf: string; valor: number };
  /** Um município da malha projetada: código, sigla da UF e o caminho. */
  export type Municipio = { c: string; uf: string; d: string };
</script>

<script lang="ts">
  /**
   * Um coroplético por unidade federativa, sobre a malha do IBGE.
   *
   * A geografia é a de verdade, e não a malha hexagonal das outras figuras
   * territoriais: quando o dado é uma contagem por estado e o leitor precisa
   * reconhecer o país, o contorno faz mais trabalho que o esquema. A projeção é
   * cônica equivalente de Albers com os paralelos do Brasil — num coroplético a
   * área pintada é o peso visual de cada estado, então ela tem de ser a área do
   * estado.
   *
   * O valor entra por classes, não por escala contínua: cinco degraus da mesma
   * rampa, do mais claro ao mais escuro. Uma rampa contínua pediria ao leitor
   * distinguir tons vizinhos a olho e ainda assim daria as classes de volta na
   * legenda; com cinco, cada estado tem uma resposta que se lê sem consulta, e a
   * ordem se enxerga mesmo impressa em escala de cinza.
   *
   * Cada estado carrega a sigla e o número dentro de si quando cabem — a medida
   * é o raio do maior círculo inscrito, que vem da malha pronta. Os oito que não
   * comportam texto (os do litoral do Nordeste, o Rio, o Espírito Santo e o
   * Distrito Federal) recebem o rótulo na calha à direita, ligado por uma linha
   * fina, empilhados na ordem em que aparecem de norte a sul para que as linhas
   * não se cruzem.
   *
   * O que a figura não diz, e nenhum coroplético de contagem diz: cobertura. Uma
   * cor escura significa muitos agentes, não muitos agentes por habitante nem
   * por município — e o estado grande e claro chama mais atenção que o pequeno e
   * escuro só por ser grande. É o custo do formato, e a nota de rodapé o assume.
   */
  import { geoConicEqualArea, polygonContains } from 'd3';
  import malha from './data/malha-ufs.json';
  import { a4Scale, fontFamily, fontSize as scale, measureLabel, wrapText } from './tokens';

  let {
    valores,
    mosaico,
    rampa,
    quebras,
    rotulosClasses,
    title,
    subtitle,
    legendaTitulo,
    formatValue = (v: number) => String(v),
    destaque,
    rotulosAbaixo = [],
    rotulosEsquerda = [],
    nomes,
    pontos,
    footnote,
    source,
    width = 580,
    corTexto,
    svgEl = $bindable(null),
    background = null,
  }: {
    valores: ValorUf[];
    /**
     * A malha municipal projetada, quando a figura quer desenhar os 5 570
     * municípios em vez das 27 UFs. O valor continua sendo o da UF — o que o
     * mosaico acrescenta é o denominador à vista: quantas unidades cabem em cada
     * estado. Sem ela, cada UF é uma mancha só.
     */
    mosaico?: Municipio[];
    /** Do mais claro ao mais escuro; precisa de `quebras.length + 1` degraus. */
    rampa: readonly string[];
    /** Os limites inferiores das classes acima da primeira: `[10, 20, 30, 50]`. */
    quebras: number[];
    /** Um rótulo por classe. Sem eles, a legenda escreve as faixas dos números. */
    rotulosClasses?: string[];
    title: string;
    subtitle?: string;
    legendaTitulo?: string;
    formatValue?: (v: number) => string;
    destaque?: { valor: string; cor: string; texto: string };
    /**
     * UFs cujo rótulo vai logo abaixo do estado, fora dele, em vez de dentro ou
     * na calha — para o estado da borda do mapa cuja linha de chamada até a
     * calha atravessaria o país inteiro (o Acre).
     */
    rotulosAbaixo?: string[];
    /**
     * UFs cujo rótulo vai à esquerda do estado, fora dele, alinhado contra a
     * borda oeste na altura do ponto de `pontos` (ou da âncora) — para o estado
     * da borda do mapa em que nem o nome cabe dentro nem a linha até a calha
     * passa limpa, e que tem o vazio dos países vizinhos a oeste.
     */
    rotulosEsquerda?: string[];
    /**
     * O texto que substitui a sigla no rótulo de cada UF — o nome da capital,
     * por exemplo, quando o valor é o da capital e não o do estado. As UFs
     * ausentes continuam com a sigla.
     */
    nomes?: Record<string, string>;
    /**
     * Um lugar por UF, em `[longitude, latitude]`, marcado com um ponto pequeno
     * dentro do estado — a sede da capital, por exemplo. Quando o rótulo vai
     * para a calha, a linha de chamada sai desse ponto.
     */
    pontos?: Record<string, [number, number]>;
    footnote?: string;
    source?: string;
    width?: number;
    /**
     * A cor do texto escuro — título, nomes e valores. Sem ela, o quase preto
     * do Eixo 1; a LPG passa o seu cinza-escuro.
     */
    corTexto?: string;
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  // svelte-ignore state_referenced_locally -- a largura autoral é fixada na criação
  const k = a4Scale(width);

  const type = {
    title: 14 * k,
    subtitle: scale.md * k,
    legendaTitulo: scale.sm * k,
    legenda: scale.sm * k,
    sigla: scale.sm * k,
    valor: 13 * k,
    chamada: scale.sm * k,
    destaqueValor: 19 * k,
    destaqueTexto: scale.md * k,
    nota: scale.sm * k,
  };

  const cinza = $derived({
    titulo: corTexto ?? '#2F2F2B',
    subtitulo: '#6E6E68',
    dado: corTexto ?? '#3F3F3B',
    legenda: '#8A8A84',
    nota: '#8A8A84',
    /** O traço entre estados, por cima dos preenchimentos. */
    divisa: '#FFFFFF',
    chamada: '#9A9A94',
  });

  const pad = 16 * k;

  const porUf = $derived(new Map(valores.map((v) => [v.uf, v.valor])));

  /** O que o rótulo escreve no lugar da sigla. */
  const rotuloDe = (uf: string) => nomes?.[uf] ?? uf;

  /** O rótulo vai fora do estado, abaixo ou à esquerda — nem dentro, nem na calha. */
  const foraDoEstado = (uf: string) => rotulosAbaixo.includes(uf) || rotulosEsquerda.includes(uf);

  /**
   * A projeção da malha: a cônica equivalente de Albers do d3 com os paralelos
   * do Brasil, na escala e translação padrão, recortada e ampliada pelo
   * `quadro` gravado com ela. Leva `[longitude, latitude]` ao domínio da malha.
   */
  const albers = geoConicEqualArea().parallels([-2, -32]).rotate([54, 0]);
  const projetar = ([lon, lat]: [number, number]): [number, number] | null => {
    const p = albers([lon, lat]);
    if (!p) return null;
    const { x0, y0, escala } = malha.quadro;
    return [(p[0] - x0) * escala, (p[1] - y0) * escala];
  };

  type Uf = (typeof malha.ufs)[number];

  /**
   * Os anéis de cada UF, para o teste de ponto no polígono. A malha só tem
   * `M`, `L` e `Z` absolutos: cada `M` abre um anel (as ilhas), e os números
   * vêm em pares x, y.
   */
  const aneis = new Map(
    malha.ufs.map((u) => [
      u.uf,
      u.d.split(/(?=M)/).map((trecho) => {
        const n = (trecho.match(/-?[\d.]+/g) ?? []).map(Number);
        const anel: [number, number][] = [];
        for (let i = 0; i + 1 < n.length; i += 2) anel.push([n[i], n[i + 1]]);
        return anel;
      }),
    ]),
  );

  /** O retângulo centrado em `c` está dentro da UF — bordas amostradas, seis pontos por lado. */
  const retanguloDentro = (uf: string, [cx, cy]: [number, number], w: number, h: number) => {
    const partes = aneis.get(uf) ?? [];
    const dentro = (p: [number, number]) => partes.some((a) => polygonContains(a, p));
    const passos = 5;
    for (let i = 0; i <= passos; i++) {
      const fx = cx - w / 2 + (w * i) / passos;
      const fy = cy - h / 2 + (h * i) / passos;
      if (
        !dentro([fx, cy - h / 2]) ||
        !dentro([fx, cy + h / 2]) ||
        !dentro([cx - w / 2, fy]) ||
        !dentro([cx + w / 2, fy])
      )
        return false;
    }
    return true;
  };

  /**
   * Com `nomes` ou `pontos`, o rótulo deixa de ser uma sigla de duas letras
   * centrada no estado: o nome é longo e há um ponto a desviar. O teste do
   * círculo inscrito, bom para a sigla, fica pessimista demais para o nome — o
   * Porto Velho de Rondônia ia para a calha com a linha atravessando o mapa —,
   * e por isso esses rótulos são testados pelo retângulo de fato contra o
   * contorno.
   */
  const rotuloLivre = $derived(!!(nomes || pontos));

  /**
   * Onde o bloco de duas linhas — nome e número — fica dentro do estado, no
   * domínio da malha, ou `null` se não couber e o rótulo for para a calha.
   * `escalaMapa` é a razão cartão/malha em que o mapa vai ser desenhado.
   *
   * Sem `nomes` nem `pontos`: o bloco cabe se couber no maior círculo inscrito,
   * cujo raio (`folga`) vem pronto da malha. O `0,85` desconta o que o círculo
   * tem de pessimista: ele é o que cabe no pior sentido, e o texto é largo e
   * baixo. Sem ele o Acre e Santa Catarina — que comportam o rótulo com sobra
   * visível — iriam para a calha por dois décimos de unidade, e as linhas de
   * chamada deles atravessariam o mapa inteiro.
   *
   * Com eles: o retângulo do bloco tem de caber no contorno e não pode cobrir
   * o ponto. Tenta primeiro o centro do círculo inscrito e depois uma grade
   * sobre o estado, do mais próximo desse centro para o mais distante.
   */
  const posicaoRotulo = (u: Uf, valor: number, escalaMapa: number): [number, number] | null => {
    const largura =
      Math.max(
        measureLabel(rotuloDe(u.uf), type.sigla, 600),
        measureLabel(formatValue(valor), type.valor, 700),
      ) / escalaMapa;
    const ancora = u.rotulo as [number, number];

    if (!rotuloLivre) {
      const altura = (type.sigla + type.valor + 2 * k) / escalaMapa;
      return u.folga >= 0.85 * Math.hypot(largura / 2, altura / 2) ? ancora : null;
    }

    // O bloco como ele é desenhado: duas caixas, uma por linha, cada uma da
    // largura do seu texto — o ponto pode ficar ao lado do número, que é mais
    // curto que o nome. Os deslocamentos são os do template, em relação ao
    // centro: a base do nome em −3,2k, a do número em +(valor − 2,2k).
    const e = escalaMapa;
    const baseNome = -3.2 * k;
    const baseValor = type.valor - 2.2 * k;
    const caixas = [
      {
        w: measureLabel(rotuloDe(u.uf), type.sigla, 600) / e,
        topo: (baseNome - 0.75 * type.sigla) / e,
        pe: (baseNome + 0.2 * type.sigla) / e,
      },
      {
        w: measureLabel(formatValue(valor), type.valor, 700) / e,
        topo: (baseValor - 0.75 * type.valor) / e,
        pe: (baseValor + 0.05 * type.valor) / e,
      },
    ];
    const h = caixas[1].pe - caixas[0].topo;
    const lugar = pontos?.[u.uf];
    const ponto = lugar ? projetar(lugar) : null;
    const margem = (3 * k) / e;
    const cobre = ([cx, cy]: [number, number]) =>
      !!ponto &&
      caixas.some(
        (c) =>
          Math.abs(ponto[0] - cx) <= c.w / 2 + margem &&
          ponto[1] >= cy + c.topo - margem &&
          ponto[1] <= cy + c.pe + margem,
      );
    const cabe = ([cx, cy]: [number, number]) =>
      caixas.every((c) =>
        retanguloDentro(u.uf, [cx, cy + (c.topo + c.pe) / 2], c.w, c.pe - c.topo),
      );
    const w = largura;

    // Uma grade sobre o retângulo envolvente do estado, do ponto mais perto do
    // centro do círculo inscrito para o mais longe; fica o primeiro que cabe.
    const partes = aneis.get(u.uf) ?? [];
    const xs = partes.flat().map((p) => p[0]);
    const ys = partes.flat().map((p) => p[1]);
    const passo = h / 4;
    const grade: [number, number][] = [ancora];
    for (let x = Math.min(...xs) + w / 2; x <= Math.max(...xs) - w / 2; x += passo) {
      for (let y = Math.min(...ys) + h / 2; y <= Math.max(...ys) - h / 2; y += passo) grade.push([x, y]);
    }
    const distancia = (c: [number, number]) => Math.hypot(c[0] - ancora[0], c[1] - ancora[1]);
    grade.sort((a, b) => distancia(a) - distancia(b));

    return grade.find((c) => !cobre(c) && cabe(c)) ?? null;
  };

  /** A largura de um rótulo na calha: nome em 600, número em 700. */
  const larguraChamada = (uf: string, valor: number) =>
    measureLabel(`${rotuloDe(uf)} `, type.chamada, 600) + measureLabel(formatValue(valor), type.chamada, 700);

  /**
   * A calha à direita do mapa, onde ficam os rótulos que não couberam dentro.
   *
   * Tem 84 unidades. O rótulo que não cabe numa linha — com os nomes das
   * capitais no lugar das siglas, "Rio de Janeiro 51,9 mi" — quebra em duas,
   * o nome em cima e o número embaixo; a calha só alarga se nem assim couber.
   * Alargar a calha encolhe o mapa, e o mapa menor manda mais rótulos para
   * fora: quebrar a linha é mais barato.
   *
   * Quais rótulos vão para a calha depende do tamanho do mapa, que depende da
   * calha; a conta sai da circularidade medindo primeiro com a calha mais
   * larga possível (o mapa menor, e portanto o maior conjunto de rótulos de
   * fora). O mapa final é igual ou maior, então quem estiver fora nele já
   * estava nesse conjunto e cabe na calha.
   */
  const calhaMinima = 84 * k;
  const folgaCalha = 13 * k;
  const umaLinha = (uf: string, valor: number) =>
    larguraChamada(uf, valor) + folgaCalha <= calhaMinima;
  const larguraNaCalha = (uf: string, valor: number) =>
    (umaLinha(uf, valor)
      ? larguraChamada(uf, valor)
      : Math.max(
          measureLabel(rotuloDe(uf), type.chamada, 600),
          measureLabel(formatValue(valor), type.chamada, 700),
        )) + folgaCalha;
  const escalaDe = (c: number) => (width - pad * 2 - c) / malha.largura;
  const calha = $derived.by(() => {
    const comValor = malha.ufs.filter(
      (u) => porUf.get(u.uf) !== undefined && !foraDoEstado(u.uf),
    );
    const larguraMaxima = Math.max(
      calhaMinima,
      ...comValor.map((u) => larguraNaCalha(u.uf, porUf.get(u.uf)!)),
    );
    const escalaPior = escalaDe(larguraMaxima);
    return Math.max(
      calhaMinima,
      ...comValor
        .filter((u) => !posicaoRotulo(u, porUf.get(u.uf)!, escalaPior))
        .map((u) => larguraNaCalha(u.uf, porUf.get(u.uf)!)),
    );
  });

  const mapaLargura = $derived(width - pad * 2 - calha);
  /** Domínio da malha → unidades do cartão. */
  const km = $derived(mapaLargura / malha.largura);
  /** Unidades do cartão → domínio da malha, para o texto desenhado dentro dele. */
  const dom = $derived((v: number) => v / km);

  const classeDe = (v: number) => quebras.filter((q) => v >= q).length;
  const corDe = (v: number | undefined) => (v === undefined ? '#EDEDE8' : rampa[classeDe(v)]);

  /**
   * Preto ou branco sobre o preenchimento, pelo contraste de fato.
   *
   * A rampa vai do claro ao escuro e o ponto de virada muda com a matiz, então
   * fixar "os dois últimos degraus levam branco" quebraria na primeira figura
   * que trocasse de família.
   */
  const luminancia = (hex: string) => {
    const canal = (i: number) => {
      const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * canal(0) + 0.7152 * canal(1) + 0.0722 * canal(2);
  };
  const contraste = (a: number, b: number) =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const corDoTexto = (fundo: string) => {
    const l = luminancia(fundo);
    return contraste(l, 1) >= contraste(l, luminancia(cinza.titulo)) ? '#FFFFFF' : cinza.titulo;
  };

  type Estado = {
    uf: string;
    /** O texto do rótulo: a sigla, ou o que `nomes` puser no lugar dela. */
    nome: string;
    /** O ponto de `pontos`, já no domínio da malha. */
    ponto: [number, number] | null;
    d: string;
    valor: number | undefined;
    cor: string;
    ancora: [number, number];
    /** Onde o rótulo dentro do estado é centrado; `null` quando vai para fora. */
    centro: [number, number] | null;
    dentro: boolean;
    abaixo: boolean;
    esquerda: boolean;
    /** O ponto mais a oeste do contorno ao lado do rótulo, no domínio da malha. */
    borda: number;
    /** A altura do centro do rótulo de fora, no domínio da malha. */
    alturaFora: number;
    /** O ponto mais ao sul do contorno sob o rótulo, no domínio da malha. */
    base: number;
  };

  /**
   * O ponto mais ao sul do contorno na faixa `[x - meia, x + meia]` — a borda
   * que fica de fato embaixo do rótulo, e não o extremo sul do estado, que no
   * Acre fica a leste da âncora e deixaria o rótulo solto no vazio.
   *
   * A malha só tem `M`, `L` e `Z` absolutos: os números vêm em pares x, y.
   */
  const baseSob = (d: string, x: number, meia: number) => {
    const n = (d.match(/-?[\d.]+/g) ?? []).map(Number);
    let base = -Infinity;
    for (let i = 0; i + 1 < n.length; i += 2) {
      if (Math.abs(n[i] - x) <= meia) base = Math.max(base, n[i + 1]);
    }
    return base;
  };

  /**
   * O ponto mais a oeste do contorno na faixa `[y - meia, y + meia]` — a borda
   * que fica de fato ao lado do rótulo, e não o extremo oeste do estado.
   */
  const bordaOeste = (d: string, y: number, meia: number) => {
    const n = (d.match(/-?[\d.]+/g) ?? []).map(Number);
    let borda = Infinity;
    for (let i = 0; i + 1 < n.length; i += 2) {
      if (Math.abs(n[i + 1] - y) <= meia) borda = Math.min(borda, n[i]);
    }
    return borda;
  };

  const estados: Estado[] = $derived(
    malha.ufs.map((u) => {
      const valor = porUf.get(u.uf);
      const nome = rotuloDe(u.uf);
      const lugar = pontos?.[u.uf];
      const ponto = lugar ? projetar(lugar) : null;
      const esquerda = valor !== undefined && rotulosEsquerda.includes(u.uf);
      const alturaFora = (ponto ?? u.rotulo)[1];
      const centro =
        valor !== undefined && !foraDoEstado(u.uf) ? posicaoRotulo(u, valor, km) : null;
      return {
        uf: u.uf,
        nome,
        ponto,
        d: u.d,
        valor,
        cor: corDe(valor),
        ancora: u.rotulo as [number, number],
        centro,
        dentro: centro !== null,
        abaixo: valor !== undefined && rotulosAbaixo.includes(u.uf),
        base:
          valor !== undefined && rotulosAbaixo.includes(u.uf)
            ? baseSob(
                u.d,
                u.rotulo[0],
                dom(Math.max(measureLabel(nome, type.sigla, 600), measureLabel(formatValue(valor), type.valor, 700))) / 2,
              )
            : 0,
        esquerda,
        alturaFora,
        // A faixa é a altura do bloco de duas linhas em torno do centro.
        borda: esquerda ? bordaOeste(u.d, alturaFora, dom(3.2 * k + 0.75 * type.sigla)) : 0,
      };
    }),
  );

  const textWidth = $derived(width - pad * 2);
  const titleLines = $derived(wrapText(title, type.title, textWidth, 600));
  const subtitleLines = $derived(wrapText(subtitle ?? '', type.subtitle, textWidth));
  const footnoteLines = $derived(wrapText(footnote ?? '', type.nota, textWidth));
  const sourceLines = $derived(wrapText(source ?? '', type.nota, textWidth));

  const titleLine = 19 * k;
  const subtitleLine = 15 * k;
  const notaLine = 13.5 * k;

  /** A legenda é uma faixa contínua de degraus, entre o subtítulo e o mapa. */
  const legendaTitle = $derived(legendaTitulo ? 19 * k : 6 * k);
  const legendaTop = $derived(
    12 * k + titleLines.length * titleLine + subtitleLines.length * subtitleLine + legendaTitle,
  );
  const faixaAltura = 9 * k;
  const rotulos = $derived(
    rotulosClasses ??
      quebras.map((q, i) =>
        i === 0
          ? `menos de ${formatValue(q)}`
          : `${formatValue(quebras[i - 1])} a ${formatValue(q - 1)}`,
      ).concat(`${formatValue(quebras.at(-1)!)} ou mais`),
  );
  const passo = $derived(
    Math.max(...rotulos.map((r) => measureLabel(r, type.legenda, 500))) + 12 * k,
  );

  const mapaTop = $derived(legendaTop + faixaAltura + 20 * k);
  const mapaAltura = $derived(malha.altura * km);

  /**
   * Os rótulos que não couberam dentro do estado, na calha: cada um na altura da
   * sua origem — o ponto de `pontos`, ou a âncora —, empurrados para baixo só
   * o suficiente para não se encostarem. A ordem é a das origens, do norte para
   * o sul, então as linhas de chamada não se cruzam. O rótulo de duas linhas
   * empurra o seguinte uma linha a mais.
   */
  const chamadaLinha = $derived(type.chamada * 1.5);
  const segundaLinha = $derived(type.chamada * 1.15);
  const chamadas = $derived.by(() => {
    const fora = estados
      .filter((e) => !e.dentro && !e.abaixo && !e.esquerda && e.valor !== undefined)
      .map((e) => ({ e, origem: e.ponto ?? e.ancora }))
      .sort((a, b) => a.origem[1] - b.origem[1]);

    let proximo = -Infinity;
    return fora.map(({ e, origem: [ax, ay] }) => {
      const y = Math.max(ay * km, proximo);
      const duasLinhas = !umaLinha(e.uf, e.valor!);
      proximo = y + chamadaLinha + (duasLinhas ? segundaLinha : 0);
      return {
        uf: e.uf,
        nome: e.nome,
        valor: e.valor!,
        y,
        duasLinhas,
        ax: ax * km,
        ay: ay * km,
        temPonto: !!e.ponto,
      };
    });
  });

  const calhaX = $derived(pad + mapaLargura + 9 * k);

  /** O destaque ocupa o vazio a sudoeste do mapa — Pacífico, Bolívia, Argentina. */
  const DESTAQUE = { x: 14, y: 812, largura: 258 };
  const destaqueLinhas = $derived(
    destaque ? wrapText(destaque.texto, type.destaqueTexto, DESTAQUE.largura * km, 500) : [],
  );

  const notasTop = $derived(mapaTop + mapaAltura + 10 * k);
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

  {#each titleLines as linha, i}
    <text
      x={pad}
      y={12 * k + (i + 0.8) * titleLine}
      font-size={type.title}
      font-weight="600"
      fill={cinza.titulo}
      font-family={fontFamily}>{linha}</text
    >
  {/each}
  {#each subtitleLines as linha, i}
    <text
      x={pad}
      y={12 * k + titleLines.length * titleLine + (i + 0.75) * subtitleLine}
      font-size={type.subtitle}
      fill={cinza.subtitulo}
      font-family={fontFamily}>{linha}</text
    >
  {/each}

  <!-- legenda: os degraus encostados, na ordem, com a faixa de cada um embaixo -->
  <g transform="translate({pad} {legendaTop})">
    {#if legendaTitulo}
      <text
        x="0"
        y={-6 * k}
        font-size={type.legendaTitulo}
        font-weight="600"
        fill={cinza.subtitulo}
        font-family={fontFamily}>{legendaTitulo}</text
      >
    {/if}
    {#each rampa as cor, i}
      <rect x={i * passo} y="0" width={passo} height={faixaAltura} fill={cor} />
      <text
        x={i * passo}
        y={faixaAltura + type.legenda + 3 * k}
        font-size={type.legenda}
        font-weight="500"
        fill={cinza.nota}
        font-family={fontFamily}>{rotulos[i]}</text
      >
    {/each}
  </g>

  <g transform="translate({pad} {mapaTop})">
    <g transform="scale({km})">
      {#if mosaico}
        <!--
          A malha municipal por baixo: cada município na cor da sua UF, com a
          divisa desenhada em branco esmaecido. É a mesma informação de cor do
          mapa por UF — o que muda é que o leitor passa a ver as unidades sobre
          as quais o número foi calculado.
        -->
        {#each mosaico as m (m.c)}
          <path
            d={m.d}
            fill={corDe(porUf.get(m.uf))}
            stroke="#FFFFFF"
            stroke-opacity="0.45"
            stroke-width={dom(0.35 * k)}
            stroke-linejoin="round"
          />
        {/each}
        {#each estados as e (e.uf)}
          <path
            d={e.d}
            fill="none"
            stroke={cinza.divisa}
            stroke-width={dom(1.2 * k)}
            stroke-linejoin="round"
          />
        {/each}
      {:else}
        {#each estados as e (e.uf)}
          <path d={e.d} fill={e.cor} stroke={cinza.divisa} stroke-width={dom(0.9 * k)} stroke-linejoin="round" />
        {/each}
      {/if}

      <!-- sigla e número dentro do estado, quando o círculo inscrito os comporta -->
      {#each estados as e (e.uf)}
        {#if e.dentro}
          {@const cor = corDoTexto(e.cor)}
          <!--
            As duas linhas montadas em torno da âncora, e não a partir dela: sem
            o recuo, o bloco desce para baixo do centro do círculo inscrito e a
            sigla de Santa Catarina encosta na divisa com o Paraná.
          -->
          <text
            x={e.centro![0]}
            y={e.centro![1] - dom(3.2 * k)}
            text-anchor="middle"
            font-size={dom(type.sigla)}
            font-weight="600"
            fill={cor}
            font-family={fontFamily}>{e.nome}</text
          >
          <text
            x={e.centro![0]}
            y={e.centro![1] + dom(type.valor - 2.2 * k)}
            text-anchor="middle"
            font-size={dom(type.valor)}
            font-weight="700"
            fill={cor}
            font-family={fontFamily}>{formatValue(e.valor!)}</text
          >
        {/if}
      {/each}

      <!-- sigla e número logo abaixo do estado, fora dele, na cor do texto do cartão -->
      {#each estados.filter((e) => e.abaixo) as e (e.uf)}
        <text
          x={e.ancora[0]}
          y={e.base + dom(4 * k + type.sigla)}
          text-anchor="middle"
          font-size={dom(type.sigla)}
          font-weight="600"
          fill={cinza.dado}
          font-family={fontFamily}>{e.nome}</text
        >
        <text
          x={e.ancora[0]}
          y={e.base + dom(6 * k + type.sigla + type.valor)}
          text-anchor="middle"
          font-size={dom(type.valor)}
          font-weight="700"
          fill={cinza.dado}
          font-family={fontFamily}>{formatValue(e.valor!)}</text
        >
      {/each}

      <!-- nome e número à esquerda do estado, contra a borda oeste, na altura do ponto -->
      {#each estados.filter((e) => e.esquerda) as e (e.uf)}
        <text
          x={e.borda - dom(5 * k)}
          y={e.alturaFora - dom(3.2 * k)}
          text-anchor="end"
          font-size={dom(type.sigla)}
          font-weight="600"
          fill={cinza.dado}
          font-family={fontFamily}>{e.nome}</text
        >
        <text
          x={e.borda - dom(5 * k)}
          y={e.alturaFora + dom(type.valor - 2.2 * k)}
          text-anchor="end"
          font-size={dom(type.valor)}
          font-weight="700"
          fill={cinza.dado}
          font-family={fontFamily}>{formatValue(e.valor!)}</text
        >
      {/each}
    </g>

    <!-- os oito estados pequenos: ponto na âncora, linha fina e rótulo na calha -->
    {#each chamadas as c (c.uf)}
      {@const traco = `M${c.ax} ${c.ay}L${calhaX - pad - 4 * k} ${c.y - type.chamada * 0.3}`}
      <!-- o halo branco carrega a linha por cima dos estados escuros -->
      <path d={traco} fill="none" stroke="#FFFFFF" stroke-width={2 * k} stroke-opacity="0.85" />
      <path d={traco} fill="none" stroke={cinza.chamada} stroke-width={0.6 * k} />
      {#if !c.temPonto}
        <circle cx={c.ax} cy={c.ay} r={1.6 * k} fill="#FFFFFF" />
        <circle cx={c.ax} cy={c.ay} r={1.1 * k} fill={cinza.chamada} />
      {/if}
      {#if c.duasLinhas}
        <text
          x={calhaX - pad}
          y={c.y}
          font-size={type.chamada}
          font-weight="600"
          fill={cinza.dado}
          font-family={fontFamily}
          >{c.nome}<tspan x={calhaX - pad} dy={segundaLinha} font-weight="700"
            >{formatValue(c.valor)}</tspan
          ></text
        >
      {:else}
        <text
          x={calhaX - pad}
          y={c.y}
          font-size={type.chamada}
          font-weight="600"
          fill={cinza.dado}
          font-family={fontFamily}
          >{c.nome} <tspan font-weight="700">{formatValue(c.valor)}</tspan></text
        >
      {/if}
    {/each}

    <!-- os lugares de `pontos`: branco com contorno escuro, legível em qualquer degrau da rampa -->
    {#each estados as e (e.uf)}
      {#if e.ponto}
        <circle
          cx={e.ponto[0] * km}
          cy={e.ponto[1] * km}
          r={2 * k}
          fill="#FFFFFF"
          stroke={cinza.titulo}
          stroke-width={0.9 * k}
        />
      {/if}
    {/each}

    {#if destaque}
      <text
        x={DESTAQUE.x * km}
        y={DESTAQUE.y * km + type.destaqueValor}
        font-size={type.destaqueValor}
        font-weight="700"
        fill={destaque.cor}
        font-family={fontFamily}>{destaque.valor}</text
      >
      {#each destaqueLinhas as linha, i}
        <text
          x={DESTAQUE.x * km}
          y={DESTAQUE.y * km + 21 * k + (i + 0.85) * 14.5 * k}
          font-size={type.destaqueTexto}
          font-weight="500"
          fill={cinza.dado}
          font-family={fontFamily}>{linha}</text
        >
      {/each}
    {/if}
  </g>

  {#each [...footnoteLines, ...sourceLines] as linha, i}
    <text
      x={pad}
      y={notasTop + (i + 0.8) * notaLine}
      font-size={type.nota}
      fill={cinza.nota}
      font-family={fontFamily}>{linha}</text
    >
  {/each}
</svg>
