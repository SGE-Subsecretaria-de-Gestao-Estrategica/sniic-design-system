<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SimpleBoxDemo from './_SimpleBoxDemo.svelte';
  import { orange, blue, teal, purple, lime } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Molecules/SimpleBox',
    component: SimpleBoxDemo,
    tags: ['autodocs'],
    argTypes: {
      boxWidth:   { control: { type: 'range', min: 100, max: 300, step: 10 } },
      valueSize:  { control: { type: 'range', min: 16, max: 64, step: 2 } },
      color:      { control: 'color' },
      valueColor: { control: 'color' },
    },
  });
</script>

<Story
  name="Big Number"
  args={{
    title: 'Museus',
    value: '1.247',
    subtitle: 'cadastrados em 2024',
    color: teal,
  }}
/>

<Story
  name="Percentage"
  args={{
    title: 'Execucao',
    value: '93%',
    color: orange,
    valueSize: 40,
  }}
/>

<Story
  name="Text Only"
  args={{
    title: 'Nota',
    subtitle: 'Valores preliminares\nsujeitos a revisao',
    color: blue,
    boxWidth: 200,
  }}
/>

<Story
  name="Value Only (no title)"
  args={{
    value: 'R$ 3,4 bi',
    subtitle: 'investimento total',
    valueSize: 28,
  }}
/>

<Story
  name="Title Only"
  args={{
    title: 'Destaque regional',
    boxWidth: 160,
  }}
/>

<Story
  name="Title + Long Text"
  args={{
    title: 'Metodologia',
    subtitle: 'Os dados apresentados referem-se\nao levantamento realizado entre\njaneiro e dezembro de 2024,\nabrangendo todos os municipios\ncom mais de 50 mil habitantes.',
    color: purple,
    boxWidth: 240,
  }}
/>

<Story
  name="Long Text (no title)"
  args={{
    subtitle: 'Fonte: Sistema Nacional de\nInformacoes e Indicadores Culturais\n(SNIIC), com base nos registros\ndo Cadastro Nacional de Museus\ne do Sistema Nacional de\nBibliotecas Publicas.',
    color: lime,
    boxWidth: 240,
  }}
/>
