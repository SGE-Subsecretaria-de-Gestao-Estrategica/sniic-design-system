<script lang="ts">
  import { BuilderState } from "../state/BuilderState.svelte";
  import { STEPS } from "../state/steps";
  import ChartGallery from "./chart/ChartGallery.svelte";
  import DataStep from "./data/DataStep.svelte";
  import MappingStep from "./mapping/MappingStep.svelte";
  import ChartPreview from "./preview/ChartPreview.svelte";
  import StyleStep from "./style/StyleStep.svelte";

  let { builder = new BuilderState() }: { builder?: BuilderState } = $props();

  // Unique per instance, so two builders on a page don't share clip-path ids.
  const uid = $props.id();

  const definition = $derived(
    builder.spec.chart ? builder.registry.get(builder.spec.chart) : undefined,
  );
  const current = $derived(builder.steps.find((s) => s.id === builder.step)!);
  const isLast = $derived(builder.step === STEPS[STEPS.length - 1].id);
  const showPreview = $derived(builder.step === "mapping" || builder.step === "style");

  function channelLabel(channelId: string): string {
    for (const chart of builder.registry.list()) {
      const channel = chart.channels.find((c) => c.id === channelId);
      if (channel) return channel.label;
    }
    return channelId;
  }
</script>

<div class="builder">
  <nav aria-label="Etapas">
    <ol>
      {#each builder.steps as step, i (step.id)}
        <li>
          <button
            type="button"
            aria-current={step.id === builder.step ? "step" : undefined}
            disabled={!builder.canEnter(step.id)}
            title={builder.blocker(step.id) ?? undefined}
            onclick={() => builder.goTo(step.id)}
          >
            {i + 1}. {step.label}{step.done ? " ✓" : ""}
          </button>
        </li>
      {/each}
    </ol>
  </nav>

  {#if builder.reset.length}
    <p class="reset" role="status">
      Mapeamentos desfeitos:
      {builder.reset.map((r) => `${r.column} (${channelLabel(r.channel)})`).join(", ")}.
    </p>
  {/if}

  <div class="body" class:with-preview={showPreview}>
    <section class="step">
      {#if builder.step === "data"}
        <DataStep {builder} />
      {:else if builder.step === "chart"}
        <ChartGallery
          charts={builder.registry.list()}
          selected={builder.spec.chart}
          onselect={(id) => builder.setChart(id)}
        />
      {:else if builder.step === "mapping" && definition}
        <MappingStep
          channels={definition.channels}
          columns={builder.spec.data.columns}
          encoding={builder.spec.encoding}
          onchange={(channel, columns) => builder.setEncoding(channel, columns)}
        />
      {:else if builder.step === "style" && definition}
        <StyleStep
          pillar={builder.spec.style.pillar}
          width={builder.spec.style.width}
          height={builder.spec.style.height}
          sizing={definition.sizing}
          defaultSize={definition.defaultSize}
          figure={builder.resolution.status === "ready" ? builder.resolution.figure : null}
          onpillar={(pillar) => builder.setPillar(pillar)}
          onsize={(axis, size) => builder.setSize(axis, size)}
        />
      {/if}
    </section>

    {#if showPreview}
      <ChartPreview
        resolution={builder.resolution}
        pillar={builder.spec.style.pillar}
        id="{uid}-preview"
      />
    {/if}
  </div>

  <footer>
    <button type="button" onclick={() => builder.back()} disabled={builder.step === "data"}>
      Voltar
    </button>
    {#if !isLast}
      <button type="button" onclick={() => builder.next()} disabled={!current.done}>
        Próximo
      </button>
      {#if current.reason}
        <span class="reason">{current.reason}</span>
      {/if}
    {/if}
  </footer>
</div>

<style>
  .builder {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: system-ui, sans-serif;
  }
  ol {
    display: flex;
    gap: 8px;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  nav button {
    padding: 6px 12px;
    font: inherit;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 999px;
    cursor: pointer;
  }
  nav button[aria-current="step"] {
    color: #fff;
    background: #333;
    border-color: #333;
  }
  nav button:disabled {
    color: #aaa;
    cursor: not-allowed;
  }
  .body.with-preview {
    display: grid;
    grid-template-columns: minmax(240px, 320px) 1fr;
    gap: 24px;
    align-items: start;
  }
  footer {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .reason {
    color: #555;
    font-size: 13px;
  }
  .reset {
    margin: 0;
    color: #b54708;
  }
</style>
