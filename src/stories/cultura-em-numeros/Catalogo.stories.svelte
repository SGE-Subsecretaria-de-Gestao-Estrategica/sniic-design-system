<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Catalogo from './_Catalogo.svelte';

  /**
   * Todos os gráficos de Cultura em Números, agrupados pela pergunta que
   * respondem: comparar categorias, evolução no tempo, composição,
   * distribuição e território. Cada cartão leva à página de docs do gráfico.
   */
  const { Story } = defineMeta({
    title: 'Cultura em Números/Catálogo por função',
    globals: { backgrounds: { value: 'cultnum-bg' } },
    parameters: { layout: 'fullscreen', controls: { disable: true } },
  });
</script>

<!-- Mesmo nome do título, para o Storybook mostrar o catálogo como item único na sidebar. -->
<Story name="Catálogo por função">
  {#snippet template()}
    <Catalogo />
  {/snippet}
</Story>
