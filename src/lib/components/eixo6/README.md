# Gráficos interativos controlados por etapa

Dezoito gráficos nascidos no Eixo 6 e hoje a referência para os demais:
interativos, acessíveis e prontos para scrollytelling. Os nomes dizem a
**forma**, não o tema — o texto e os dados da publicação entram por prop, a
partir do projeto que consome o pacote.

| Gráfico | O que representa | Dados |
|---|---|---|
| `LinhaParticipacaoChart` | Uma série absoluta e, num painel abaixo, a participação dela num total (bolhas de área proporcional). | `LinhaParticipacaoDatum` — `{ year, value, share }` |
| `LinhasComparadasChart` | Um grupo destacado diante dos demais, todos na mesma escala, nomeados na ponta da linha. | `LinhasComparadasDatum` — `{ group, year, value }` |
| `LinhasDiferencaChart` | Duas taxas na mesma escala e, num painel abaixo, a distância entre elas em pontos percentuais. | `LinhasDiferencaDatum` — `{ group, year, value }` |
| `BarrasRankingChart` | Uma categoria por linha, do mesmo zero, da maior à menor; cada barra é uma `CapsuleBar` (base reta, ponta redonda, ponto na ponta). | `BarrasRankingDatum` — `{ label, value }` |
| `BarrasDivergentesChart` | Duas parcelas por categoria em direções opostas a partir de um zero comum, numa só escala; a metade esquerda é uma `CapsuleBar` invertida. | `BarrasDivergentesDatum` — `{ label, left, right }` |
| `LinhasAntesDepoisChart` | A mesma medida em dois momentos, uma categoria por linha; cada par é um `Dumbbell` (traço grosso, marcador no antes, ponto de destaque no depois). | `LinhasAntesDepoisDatum` — `{ label, before, after }` |
| `BarrasCascataChart` | Dois estoques e as parcelas que levam de um ao outro; cada degrau é uma `CapsuleBar` vertical — estoques do zero, variações flutuando sobre o acumulado (as negativas pendem). | `BarrasCascataDatum` — `{ label, value, type: 'base' \| 'delta' \| 'total', detail?, fill? }` |
| `ColunasEmpilhadasChart` | Colunas empilhadas por categoria ou ano, cada uma uma `CapsuleStack`. `normalize` fecha cada coluna em 100% (composição); `rank` + `ribbons` reordenam as séries por valor e ligam a mesma série entre colunas com fitas. | `ColunasDatum` — `{ label, values: Record<key, number> }` |
| `LinhasPaineisChart` | Pequenos múltiplos: um painel por grupo, mesmo eixo e mesma escala, com a referência ao fundo de cada painel. | `years` + `LinhasPainel` — `{ label, values: (number \| null)[], note? }` |
| `CurvaConcentracaoChart` | Curva de concentração (Lorenz) com a diagonal de igualdade e marcos ("os 10% maiores concentram…"). | `CurvaConcentracaoPonto` — `[unidades %, total %]`, `CurvaConcentracaoMarco` |
| `FaixasParticipacaoChart` | Histomap: anos de cima para baixo, cada um fechando em 100% na horizontal, com blocos de leitura na calha. | `ColunasDatum` (o `label` é o ano), `FaixasParticipacaoDestaque` |
| `BolhasMatrizChart` | Linhas por colunas, uma bolha de área proporcional por cruzamento, cor pelo valor na rampa do pilar. | `columns` + `BolhasMatrizLinha` — `{ label, note?, values }` |
| `PontosPaineisChart` | Um ponto por unidade, a mesma grade em cada painel, repartida de um jeito em cada um. | `PontosPainel` — `{ title, slices: { label, n, color? }[] }` |
| `CristasDensidadeChart` | Cristas de densidade partidas por uma referência; além dela a cor se aprofunda. | `CristaDensidade` — `{ label, note?, density, value? }` |
| `MapaUfChart` | Coroplético por UF na malha do IBGE, classes na rampa sequencial do pilar. | `MapaUfValor` — `{ uf, value }` + `breaks` |
| `MapaMunicipiosChart` | Coroplético por município; a malha municipal entra por prop (não vem no pacote). | `values: Record<código IBGE, number>` + `mesh` + `breaks` |
| `MapaHexagonalChart` | O Brasil esquemático em hexágonos, duas `CapsuleBar` por UF e uma linha de referência; quem a supera ganha o ponto de destaque. | `MapaHexagonalValor` — `{ uf, a, b }` + `reference` |
| `BolhasComparadasChart` | A mesma repartição em dois escopos — o grupo e a referência (hachurada) —, lado a lado. | `BolhasComparadasDatum` — `{ scope: 'grupo' \| 'referencia', category, share }` |

Cada um é:

- **controlado por dados** — recebe linhas já parseadas via prop. O pacote não
  traz dados nem loaders: ler os arquivos da publicação e convertê-los nestes
  formatos é trabalho do host;
- **responsivo** — preenche a largura do contêiner, sem largura fixa;
- **interativo por padrão** — crosshair com tooltip nas séries temporais,
  tooltip por marca nas bolhas, navegação por teclado e tabela acessível;
- **controlado por etapa** — a prop `step` diz qual estágio da narrativa
  mostrar, que é o que liga o gráfico ao scroll da página.

## Importação

```ts
import {
  LinhaParticipacaoChart,
  LinhasComparadasChart,
  LinhasDiferencaChart,
  BolhasComparadasChart,
  BarrasRankingChart,
  BarrasDivergentesChart,
  LinhasAntesDepoisChart,
  BarrasCascataChart,
  // etapas de cada gráfico
  LINHA_PARTICIPACAO_STEPS,
  LINHAS_COMPARADAS_STEPS,
  LINHAS_DIFERENCA_STEPS,
  BOLHAS_COMPARADAS_STEPS,
  BARRAS_RANKING_STEPS,
  BARRAS_DIVERGENTES_STEPS,
  LINHAS_ANTES_DEPOIS_STEPS,
  BARRAS_CASCATA_STEPS,
  // driver opcional de scroll
  ScrollySteps,
  scrollStep,
  type LinhasDiferencaDatum
} from 'sniic-design-system';
```

## Props comuns

| Prop | Tipo | Padrão | O que faz |
|---|---|---|---|
| `data` | array tipado por gráfico | — | Linhas já parseadas. |
| `step` | `number` | `-1` | Estágio ativo. `-1` mostra tudo (uso estático). |
| `highlight` | `string \| null` | `null` | Realça uma série/categoria e esmaece o resto. |
| `focusIndex` | `number \| null` | `null` | Abre o tooltip num índice, sem depender do ponteiro. |
| `interactive` | `boolean` | `true` | `false` desliga hover e teclado (exportação estática). |
| `width` | `number` | — | Largura fixa; omita para preencher o contêiner. |
| `height` | `number` | por gráfico | Altura em px. |
| `title` / `subtitle` / `source` | `string` | — | Cabeçalho e nota de rodapé. |
| `valueLabels` | `'selective' \| 'all'` | `'selective'` | `'all'` volta a rotular todos os pontos. |

`step` conta a partir de 0 e revela cumulativamente: no estágio 2 tudo que
apareceu nos estágios 0 e 1 continua visível.

## Props de cada gráfico

O texto que aparece dentro do desenho é prop; os padrões são neutros.

- **`LinhaParticipacaoChart`** — `seriesLabel` (nome na ponta da linha e alvo de
  `highlight`; sem ele, nada é escrito), `valueLabel` (`'Valor'`), `shareLabel`
  (`'Participação no total'`), `shareIntro` (frase que apresenta o painel de
  bolhas; opcional), `shareSuffix` (`'do total'`), `breakYear`.
- **`LinhasComparadasChart`** — `featured` (o grupo em destaque; por padrão o
  primeiro de `data`), `valueLabel` (`'Valor'`), `othersLabel`, `breakYear`.
- **`LinhasDiferencaChart`** — `featured` e `baseline` (por padrão o primeiro e
  o segundo grupo de `data`), `measureLabel` (`'Taxa'`), `gapIntro` (frase que
  apresenta o painel da diferença; opcional).
- **`BarrasRankingChart`** — `sort` (`'desc'`, ou `'none'` para manter a ordem
  de `data`), `formatValue`, `valueLabel` (`'Valor'`), `categoryLabel`
  (`'Categoria'`), `barHeight` (espessura; por padrão 32px, 24px em coluna
  estreita). A altura de cada linha cresce com o nome quebrado em várias linhas.
- **`BarrasDivergentesChart`** — `sideLabels` (`{ left: 'Esquerda', right:
  'Direita' }`, escritos acima de cada metade), `sideColors` (por lado, uma cor ou
  `[base, ponta]`; sem eles, os dois lados usam o gradiente padrão das barras),
  `sort` (`'none'`, `'left'` ou `'right'`), `formatValue`, `categoryLabel`,
  `barHeight`. O zero fica onde termina a maior barra da esquerda — a escala é
  uma só, mas cada lado ganha o espaço do que carrega.
- **`LinhasAntesDepoisChart`** — `beforeLabel` / `afterLabel` (`'Antes'` /
  `'Depois'`), `sort` (`'none'`, `'before'`, `'after'` ou `'change'`),
  `formatValue`, `formatChange` (a diferença, com sinal), `formatTick` (o eixo),
  `domain` (por padrão a extensão dos dados, arredondada), `categoryLabel`. Os
  valores ficam fora do par — o de antes à esquerda e o de depois à direita, e
  trocam de lado quando o valor cai.
- **`BarrasCascataChart`** — `formatValue` (estoques e acumulado),
  `formatDelta` (variações, com sinal), `plotHeight` (240px por padrão, sem os
  rótulos). Por degrau, `detail` (linhas miúdas sob o nome) e `fill`. Sem eixo
  Y: o valor de cada degrau fica além da ponta, e o estoque final ganha o valor
  em destaque.
- **`LinhasComparadasChart`** também tem `colorBy` (`'featured'`, o padrão, ou
  `'series'`: uma cor por série da paleta categórica e uma legenda por série) e
  `formatValue`.
- Os gráficos de várias séries (`ColunasEmpilhadasChart`,
  `FaixasParticipacaoChart`) recebem `keys`, `labels` e `colors` (por padrão a
  paleta categórica do pilar); os mapas recebem `breaks` (limites inferiores das
  classes acima da primeira) e `classLabels`.
- **`BolhasComparadasChart`** — `scopeLabels` (`{ grupo: 'Grupo', referencia:
  'Referência' }`), `categoryLabel` (`'Categoria'`), `excluded` (categorias
  fora do desenho, citadas em nota).

`breakYear` é o primeiro ano depois de uma quebra metodológica: os dois trechos
são desenhados separados, com a junção tracejada, para ninguém ler o salto como
mudança real. Sem ele, a série é contínua.

## Montando o scrollytelling

O gráfico é controlado; quem decide a etapa ativa é a página. Use a biblioteca
de scroll que preferir e apenas passe `step`. Se não quiser trazer uma
dependência, o pacote inclui um driver mínimo:

```svelte
<script lang="ts">
  import {
    LinhasDiferencaChart,
    LINHAS_DIFERENCA_STEPS,
    ScrollySteps,
    scrollStep,
    type LinhasDiferencaDatum
  } from 'sniic-design-system';

  let { data }: { data: LinhasDiferencaDatum[] } = $props();

  const scrolly = new ScrollySteps(); // opcional: { offset: 0.5 }
</script>

<div class="scrolly">
  <div class="graphic">
    <LinhasDiferencaChart {data} step={scrolly.step} title="Uma taxa diante da referência" />
  </div>

  {#each LINHAS_DIFERENCA_STEPS as etapa, i (etapa.id)}
    <section use:scrollStep={{ scrolly, index: i }}>
      <p>{etapa.label}</p>
    </section>
  {/each}
</div>

<style>
  .graphic { position: sticky; top: 20vh; }
  section { min-height: 80vh; }
</style>
```

`scrolly.progress` dá o avanço 0–1 dentro da etapa ativa, para efeitos
contínuos. Os textos em `*_STEPS` são genéricos — troque por copy editorial
mantendo a ordem e a quantidade de etapas.

## Etapas por gráfico

- **`LinhaParticipacaoChart`** — linha, valores, quebra, painel de
  participação, nome da série.
- **`LinhasComparadasChart`** — grupo destacado, demais grupos, quebra, valores
  finais.
- **`LinhasDiferencaChart`** — referência, série destacada, diferença em
  pontos percentuais, último ano.
- **`BolhasComparadasChart`** — grupo, referência, diferença.
- **`BarrasRankingChart`** — barras e nomes, valores.
- **`BarrasDivergentesChart`** — lado direito, lado esquerdo, valores.
- **`LinhasAntesDepoisChart`** — antes, depois e o traço da mudança, valores.
- **`BarrasCascataChart`** — estoque de partida, variações, estoque de chegada.

## Acessibilidade

Nada que o tooltip mostra depende do tooltip: todos os valores estão numa
tabela visualmente oculta dentro de cada `<figure>`, os rótulos diretos nomeiam
as séries, e o crosshair é operável pelo teclado (`Tab` para focar, setas para
percorrer os anos, `Esc` para fechar). As animações de etapa respeitam
`prefers-reduced-motion`.

## Notas de cor

A paleta do pilar 6 tem três matizes utilizáveis (amarelo, verde-escuro,
terracota). Por isso o `LinhasComparadasChart`, que costuma ter várias séries, usa cor
para separar **destaque × demais** e deixa a identidade por conta dos rótulos no
fim de cada linha — a legenda diz exatamente isso, em vez de prometer uma cor
por grupo. No `BolhasComparadasChart` a cor codifica o **escopo** (preenchimento sólido =
grupo, hachura = referência) e as categorias vêm nomeadas na coluna da
esquerda.

O amarelo da marca (`#F6B60E`) tem contraste 1,8:1 sobre a superfície clara —
abaixo de 3:1. Por isso todos os gráficos que o usam trazem rótulos visíveis e
tabela; não remova nenhum dos dois ao customizar.
