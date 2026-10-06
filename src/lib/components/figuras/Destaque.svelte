<script lang="ts" module>
  import { fontSize as scale, measureLabel, wrapText } from '../eixo1/tokens';

  /**
   * As medidas do destaque, em unidades autorais (multiplicar por `k`) — as
   * mesmas do destaque das bases do Eixo 1 (`BarraRankingChart`,
   * `BarraDivergenteChart`, `CoropletoUfChart`).
   */
  export const DESTAQUE = {
    /** Corpo do número. */
    valor: 19,
    /** Do topo do destaque à primeira linha de texto. */
    textoTopo: 21,
    /** Entrelinha da frase. */
    linha: 14.5,
  };

  /** A frase do destaque, quebrada na largura dada. */
  export const linhasDestaque = (texto: string, largura: number, k: number) =>
    wrapText(texto, scale.md * k, largura, 500);

  /** A altura do destaque com `n` linhas de frase (com ou sem o número). */
  export const alturaDestaque = (n: number, k: number, comValor = true) =>
    ((comValor ? DESTAQUE.textoTopo : 0) + n * DESTAQUE.linha) * k;

  /** A largura do número. */
  export const larguraValorDestaque = (valor: string, k: number) =>
    measureLabel(valor, DESTAQUE.valor * k, 700);
</script>

<script lang="ts">
  /**
   * O destaque das figuras: o número grande, em negrito, na cor da medida de
   * que ele fala, e a frase que o completa embaixo, em `corTexto`. "R$ 20,58 /
   * é a média nacional por habitante".
   *
   * `FluxoComposicaoChart` e `DispersaoLogChart` desenham suas anotações com
   * ele; quem monta uma figura própria no mesmo idioma pode usá-lo também.
   */
  import { fontFamily } from '../eixo1/tokens';

  let {
    x,
    y,
    valor,
    linhas,
    cor,
    k,
    anchor = 'start',
    corTexto = '#2F2F2B',
  }: {
    x: number;
    /** O topo do destaque. */
    y: number;
    valor?: string | null;
    /** A frase, já quebrada — `linhasDestaque`. */
    linhas: string[];
    cor: string;
    k: number;
    anchor?: 'start' | 'end' | 'middle';
    /** A cor da frase. */
    corTexto?: string;
  } = $props();
</script>

<g>
  {#if valor}
    <text
      {x}
      y={y + DESTAQUE.valor * k * 0.8}
      text-anchor={anchor}
      font-size={DESTAQUE.valor * k}
      font-weight="700"
      fill={cor}
      font-family={fontFamily}>{valor}</text
    >
  {/if}
  {#each linhas as linha, i (i)}
    <text
      {x}
      y={y + (valor ? DESTAQUE.textoTopo * k : 0) + (i + 0.85) * DESTAQUE.linha * k}
      text-anchor={anchor}
      font-size={scale.md * k}
      font-weight="500"
      fill={corTexto}
      font-family={fontFamily}>{linha}</text
    >
  {/each}
</g>
