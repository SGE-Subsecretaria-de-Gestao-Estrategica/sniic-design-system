<script lang="ts">
  import type { OptionStep } from "../registry/types";
  import { savedChartName } from "../spec/saved";
  import { BuilderState } from "../state/BuilderState.svelte";
  import { STEPS } from "../state/steps";
  import ChartGallery from "./chart/ChartGallery.svelte";
  import DataStep from "./data/DataStep.svelte";
  import ChartOptions from "./options/ChartOptions.svelte";
  import MappingStep from "./mapping/MappingStep.svelte";
  import ChartPreview from "./preview/ChartPreview.svelte";
  import SaveChart from "./save/SaveChart.svelte";
  import StyleStep from "./style/StyleStep.svelte";
  import Button from "./ui/Button.svelte";

  let { builder = new BuilderState() }: { builder?: BuilderState } = $props();

  // Unique per instance, so two builders on a page don't share clip-path ids.
  const uid = $props.id();

  const definition = $derived(
    builder.spec.chart ? builder.registry.get(builder.spec.chart) : undefined,
  );
  const current = $derived(builder.steps.find((s) => s.id === builder.step)!);
  const isLast = $derived(builder.step === STEPS[STEPS.length - 1].id);
  const showPreview = $derived(
    builder.step === "mapping" || builder.step === "style",
  );

  function channelLabel(channelId: string): string {
    for (const chart of builder.registry.list()) {
      const channel = chart.channels.find((c) => c.id === channelId);
      if (channel) return channel.label;
    }
    return channelId;
  }
</script>

{#snippet optionsPanel(step: OptionStep)}
  {#if definition}
    <ChartOptions
      {step}
      {definition}
      resolution={builder.resolution}
      rows={builder.rows}
      encoding={builder.spec.encoding}
      aggregate={builder.spec.aggregate}
      options={builder.spec.style.options}
      onaggregate={(aggregate) => builder.setAggregate(aggregate)}
      onoption={(id, value) => builder.setOption(id, value)}
    />
  {/if}
{/snippet}

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
            {i + 1}. {step.label}
          </button>
        </li>
      {/each}
    </ol>
  </nav>

  {#if builder.reset.length}
    <p class="reset" role="status">
      Mapeamentos desfeitos:
      {builder.reset
        .map((r) => `${r.column} (${channelLabel(r.channel)})`)
        .join(", ")}.
    </p>
  {/if}

  <div class="body" class:with-preview={showPreview}>
    <section class="step">
      {#if builder.step === "data"}
        <DataStep {builder} />
      {:else if builder.step === "chart"}
        <ChartGallery
          charts={builder.registry.list()}
          columns={builder.spec.data.columns}
          selected={builder.spec.chart}
          onselect={(id) => builder.setChart(id)}
        />
      {:else if builder.step === "mapping" && definition}
        <MappingStep
          channels={definition.channels}
          columns={builder.spec.data.columns}
          encoding={builder.spec.encoding}
          onchange={(channel, column) => builder.setEncoding(channel, column)}
        />
        {@render optionsPanel("mapping")}
      {:else if builder.step === "style" && definition}
        <StyleStep
          {definition}
          style={builder.spec.style}
          resolution={builder.resolution}
          onpillar={(pillar) => builder.setPillar(pillar)}
          onsize={(axis, size) => builder.setSize(axis, size)}
          onmargin={(margin) => builder.setMargin(margin)}
          onparam={(id, value) => builder.setParam(id, value)}
          onformat={(patch, formatId) => builder.setFormat(patch, formatId)}
        >
          {#snippet chartOptions()}
            {@render optionsPanel("style")}
          {/snippet}
        </StyleStep>
      {/if}
    </section>

    {#if showPreview}
      <ChartPreview
        resolution={builder.resolution}
        style={builder.spec.style}
        id="{uid}-preview"
        fileName={builder.spec.data.fileName}
      />
    {/if}
  </div>

  <footer>
    <Button onclick={() => builder.back()} disabled={builder.step === "data"}>
      Voltar
    </Button>
    {#if !isLast}
      <Button
        variant="primary"
        onclick={() => builder.next()}
        disabled={!current.done}
      >
        Próximo
      </Button>
      {#if current.reason}
        <span class="reason">{current.reason}</span>
      {/if}
    {/if}
    <SaveChart
      fileName={savedChartName(builder.spec.data.fileName)}
      content={(withData) => builder.save(withData)}
      disabled={!builder.spec.chart}
    />
  </footer>
</div>

<style>
  .builder {
    display: flex;
    flex-direction: column;
    gap: 20px;
    color: var(--builder-ink);
    font-family: var(--builder-font);
    font-size: var(--builder-text);
  }

  /* The steps are a sequence: a rule joins them, and the current one is filled. */
  ol {
    display: flex;
    gap: 0;
    padding: 0;
    margin: 0;
    list-style: none;
    border-bottom: 1px solid var(--builder-line);
  }
  nav button {
    position: relative;
    height: 40px;
    padding: 0 18px;
    color: var(--builder-muted);
    font: 500 var(--builder-text) / 1 var(--builder-font);
    background: none;
    border: 0;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
  }
  nav li:first-child button {
    padding-left: 2px;
  }
  nav button:hover:not(:disabled) {
    color: var(--builder-ink-strong);
  }
  nav button[aria-current="step"] {
    color: var(--builder-ink-strong);
    font-weight: 600;
    border-bottom-color: var(--builder-ink-strong);
  }
  nav button:focus-visible {
    outline: 2px solid var(--builder-ink-strong);
    outline-offset: -2px;
  }
  nav button:disabled {
    color: var(--builder-faint);
    opacity: 0.6;
    cursor: not-allowed;
  }

  .step {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }
  .body.with-preview {
    display: grid;
    grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
    gap: 32px;
    align-items: start;
  }
  footer {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--builder-line-soft);
  }
  .reason {
    margin-left: 8px;
    color: var(--builder-muted);
    font-size: var(--builder-text-sm);
  }
  .reset {
    margin: 0;
    padding: 8px 12px;
    color: var(--builder-warning);
    font-size: var(--builder-text-sm);
    background: color-mix(
      in srgb,
      var(--builder-warning) 8%,
      var(--builder-surface)
    );
    border-radius: var(--builder-radius);
  }
</style>
