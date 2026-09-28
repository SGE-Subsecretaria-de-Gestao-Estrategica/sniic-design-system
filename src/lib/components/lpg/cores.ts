/**
 * A paleta das figuras da LPG — as mesmas cores do boletim da PNAB, tiradas das
 * rampas `colorScales` do design system, não da paleta de marca do Eixo 1.
 *
 * As figuras são desenhadas pelas bases do Eixo 1 (e pelas duas bases próprias
 * desta pasta, no mesmo idioma visual): a forma segue Cultura em Números, a cor
 * segue a PNAB. Todas as bases recebem a cor por prop, então nada aqui vaza
 * para as figuras do Eixo 1.
 *
 * Tudo sai em `#rrggbb`: as bases calculam o contraste do texto sobre a cor
 * lendo o hexadecimal, e um `rgb(…)` vindo do d3 quebraria essa conta.
 */

import { color, interpolateHcl, quantize } from 'd3';
import { colorScales } from '$lib/tokens';
import { categorical3, categorical5 } from '$lib/palettes';

const hex = (c: string) => color(c)?.formatHex() ?? c;

/**
 * As sete faixas de valor recebido vão do azul dos contemplados ao roxo dos
 * recursos — exatamente o par da figura 1.1.1 (`corContemplados`,
 * `corRecursos`) nas pontas, e cinco tons intermediários entre eles. As faixas
 * baixas, onde estão as pessoas, ficam no azul; as altas, onde está o
 * dinheiro, no roxo.
 *
 * Interpolada em HCL: croma e luminosidade ficam constantes e só o matiz gira,
 * então o meio não acinzenta. O preço é a distância entre vizinhas (ΔE ≈ 9),
 * menor que a de uma rampa clara → escura — as figuras que usam esta rampa
 * separam os segmentos com um filete na cor do fundo.
 */
export const coresFaixas: string[] = quantize(
  interpolateHcl(colorScales.blue[2], colorScales.purple[2]),
  7,
).map(hex);

/** Norte, Nordeste, Sudeste, Sul, Centro-Oeste. */
export const coresRegioes = categorical5;

/** Capital, Região Metropolitana, Interior. */
export const coresClassificacao = categorical3;

/** Os cinco portes de município, do maior ao menor. */
export const coresPortes = categorical5;

export const corContemplados = colorScales.blue[2];
export const corRecursos = colorScales.purple[2];

export const corUrbano = colorScales.blue[2];
export const corRural = colorScales.lime[2];

export const corCapitais = colorScales.blue[2];
export const corFavelas = colorScales.orange[2];
export const corQuilombolas = colorScales.teal[2];

/**
 * Rampas dos mapas, da mais clara à mais escura — cinco classes cada. As mesmas
 * matizes de `corContemplados` (azul) e `corRecursos` (roxo), a associação da
 * figura 1.1.1; o laranja da PNAB foge da identidade do boletim.
 */
export const rampaRecursos = colorScales.purple;

/**
 * As faixas de recurso total da dispersão das capitais (1.1.5), da menor à
 * maior: um azul quase branco até o `blue[1]` clareado. Fica toda no lado
 * claro da rampa — é fundo, e os pontos e rótulos por cima precisam de
 * contraste.
 */
export const coresFaixasTotal = (n: number): string[] =>
  quantize(interpolateHcl('#f4f7fc', '#aec5e6'), n).map(hex);

/** O texto sobre as faixas de total: o azul escuro da mesma rampa. */
export const corRotuloFaixaTotal = colorScales.blue[3];
export const rampaContemplados = colorScales.blue;
