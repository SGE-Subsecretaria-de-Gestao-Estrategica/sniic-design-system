<script lang="ts">
  /** Controle das stories: um slider de etapas e, opcionalmente, um seletor de destaque. */
  import type { ChartStep } from '$lib/components/eixo6/types';

  let {
    etapas,
    step = $bindable(),
    opcoes,
    highlight = $bindable(null),
  }: {
    etapas: ChartStep[];
    step: number;
    /** Valores que `highlight` pode assumir; sem eles, o seletor não aparece. */
    opcoes?: string[];
    highlight?: string | null;
  } = $props();
</script>

<label>
  Etapa {step + 1} de {etapas.length} — {etapas[step]?.label}
  <input type="range" min="0" max={etapas.length - 1} bind:value={step} />
</label>

{#if opcoes}
  <label>
    Destacar
    <select bind:value={highlight}>
      <option value={null}>Nenhum</option>
      {#each opcoes as opcao (opcao)}
        <option value={opcao}>{opcao}</option>
      {/each}
    </select>
  </label>
{/if}

<style>
  label {
    font: 500 13px/1.4 system-ui;
    display: grid;
    gap: 0.35rem;
  }
</style>
