# Eixo 6 — gráficos interativos para scrollytelling

Quatro gráficos do Eixo 6 (trabalho e renda na Economia Criativa) empacotados
para serem consumidos por outro projeto Svelte. Cada um é:

- **controlado por dados** — recebe linhas já parseadas via prop, então o host
  decide como buscar, cachear e renderizar no servidor;
- **responsivo** — preenche a largura do contêiner, sem largura fixa;
- **interativo por padrão** — crosshair com tooltip nas séries temporais,
  tooltip por marca nas bolhas, navegação por teclado e tabela acessível;
- **controlado por etapa** — a prop `step` diz qual estágio da narrativa
  mostrar, que é o que liga o gráfico ao scroll da página.

## Instalação e importação

```ts
import {
  TrabalhadoresCulturaChart,
  SetoresComparadosChart,
  InformalidadeChart,
  RacaCorChart,
  // metadados das etapas
  TRABALHADORES_CULTURA_STEPS,
  SETORES_STEPS,
  INFORMALIDADE_STEPS,
  RACA_COR_STEPS,
  // parsers e loaders
  parseInformalidade,
  loadInformalidade,
  // driver opcional de scroll
  ScrollySteps,
  scrollStep
} from 'sniic-design-system';
```

Os CSVs publicados **não** vão no pacote: copie os arquivos de
`public/data/eixo6/` para o `static/` (SvelteKit) ou `public/` do seu projeto,
ou sirva-os de onde preferir e passe a URL para o `load*`.

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

## Montando o scrollytelling

O gráfico é controlado; quem decide a etapa ativa é a página. Use a biblioteca
de scroll que preferir e apenas passe `step`. Se não quiser trazer uma
dependência, o pacote inclui um driver mínimo:

```svelte
<script lang="ts">
  import {
    InformalidadeChart,
    INFORMALIDADE_STEPS,
    ScrollySteps,
    scrollStep,
    loadInformalidade
  } from 'sniic-design-system';

  const scrolly = new ScrollySteps();          // opcional: { offset: 0.5 }
  let data = $state([]);
  $effect(() => { loadInformalidade('/data/eixo6/6.8.csv').then((d) => (data = d)); });
</script>

<div class="scrolly">
  <div class="graphic">
    <InformalidadeChart {data} step={scrolly.step} title="Informalidade" />
  </div>

  {#each INFORMALIDADE_STEPS as etapa, i (etapa.id)}
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
contínuos. Os textos em `*_STEPS` são um ponto de partida — troque por copy
editorial mantendo a ordem e a quantidade de etapas.

## Etapas por gráfico

- **`TrabalhadoresCulturaChart`** (`6.5.csv`) — linha, valores, quebra da RAIS,
  painel de participação, último ano.
- **`SetoresComparadosChart`** (`E6S2-n-trabalhadores-…-setores-ano.csv`) —
  Economia Criativa, demais setores, quebra da RAIS, valores finais.
- **`InformalidadeChart`** (`6.8.csv`) — Brasil, Economia Criativa, diferença em
  pontos percentuais, último ano.
- **`RacaCorChart`** (`6.13_6.21.csv`) — Economia Criativa, Brasil, diferença.

## Acessibilidade

Nada que o tooltip mostra depende do tooltip: todos os valores estão numa
tabela visualmente oculta dentro de cada `<figure>`, os rótulos diretos nomeiam
as séries, e o crosshair é operável pelo teclado (`Tab` para focar, setas para
percorrer os anos, `Esc` para fechar). As animações de etapa respeitam
`prefers-reduced-motion`.

## Notas de cor

A paleta do pilar 6 tem três matizes utilizáveis (amarelo, verde-escuro,
terracota). Por isso o `SetoresComparadosChart`, que tem quatro séries, usa cor
para separar **destaque × demais** e deixa a identidade por conta dos rótulos no
fim de cada linha — a legenda diz exatamente isso, em vez de prometer uma cor
por setor. No `RacaCorChart` a cor codifica o **escopo** (preenchimento sólido =
Economia Criativa, hachura = Brasil) e as categorias vêm nomeadas na coluna da
esquerda.

O amarelo da marca (`#F6B60E`) tem contraste 1,8:1 sobre a superfície clara —
abaixo de 3:1. Por isso todos os gráficos que o usam trazem rótulos visíveis e
tabela; não remova nenhum dos dois ao customizar.
