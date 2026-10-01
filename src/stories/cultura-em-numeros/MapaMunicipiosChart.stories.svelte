<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MapaMunicipiosChart from '$lib/components/eixo6/MapaMunicipiosChart.svelte';
  import type { MalhaMunicipiosProjetada } from '$lib/components/eixo1/malhaMunicipal';
  import { FONTE, sorteio } from './_exemplos';
  // A malha (1,1MB) não vai no pacote — quem consome traz a sua. Aqui ela fica
  // só para as stories, buscada em runtime em vez de entrar no bundle.
  const malhaUrl = new URL('./data/malha-municipios-projetada.json', import.meta.url).href;

  /**
   * Os 5.570 municípios, cada um na cor da sua classe, com as UFs por cima.
   * Passar o mouse numa UF mostra como os municípios dela se repartem.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Mapa por município' });
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  let mesh = $state<MalhaMunicipiosProjetada | null>(null);
  let values = $state<Record<string, number>>({});

  onMount(async () => {
    const m: MalhaMunicipiosProjetada = await (await fetch(malhaUrl)).json();
    const r = sorteio(5);
    // Classe 0–3 por município; os de código iniciado em 2 puxados para cima,
    // para o mapa ter forma regional e não só ruído.
    values = Object.fromEntries(
      m.municipios.map((mun) => {
        const vies = mun.c.startsWith('2') ? 0.6 : 0;
        return [mun.c, Math.min(3, Math.floor(r() * 3.4 + vies))];
      }),
    );
    mesh = m;
  });
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 640px;">
      {#if mesh}
        <MapaMunicipiosChart
          {values}
          {mesh}
          breaks={[1, 2, 3]}
          classLabels={['Classe 0', 'Classe 1', 'Classe 2', 'Classe 3']}
          title="Os 5.570 municípios, cada um na cor da sua classe"
          subtitle="Municípios por classe"
          source={FONTE}
        />
      {:else}
        <p>Carregando a malha municipal…</p>
      {/if}
    </div>
  {/snippet}
</Story>
