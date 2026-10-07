<script lang="ts">
  import type { Row } from "../../data/types";
  import { choiceValue, ordersOpenedBy } from "../../registry/options";
  import type { AnyChartDefinition, OptionStep } from "../../registry/types";
  import type { ChartResolution } from "../../resolve/types";
  import type { Aggregation, Encoding, JsonValue } from "../../spec/types";
  import Fieldset from "../ui/Fieldset.svelte";
  import AggregationField from "./AggregationField.svelte";
  import ChoiceOption from "./ChoiceOption.svelte";
  import NumberOption from "./NumberOption.svelte";
  import OrderOption from "./OrderOption.svelte";
  import TextOption from "./TextOption.svelte";
  import ToggleOption from "./ToggleOption.svelte";
  import ValueOption from "./ValueOption.svelte";
  import ValuesOption from "./ValuesOption.svelte";

  type Props = {
    /** The wizard step this panel sits in: it shows the options of that step. */
    step: OptionStep;
    definition: AnyChartDefinition;
    resolution: ChartResolution;
    rows: readonly Row[];
    encoding: Encoding;
    aggregate: Aggregation;
    options: Record<string, JsonValue>;
    onaggregate: (aggregate: Aggregation) => void;
    /** `undefined` restores the option's default. */
    onoption: (optionId: string, value: JsonValue | undefined) => void;
  };

  let {
    step,
    definition,
    resolution,
    rows,
    encoding,
    aggregate,
    options,
    onaggregate,
    onoption,
  }: Props = $props();

  const ready = $derived(resolution.status === "ready" ? resolution : null);
  const shown = $derived(
    (definition.options ?? []).filter((option) => option.step === step),
  );
  // How repeated rows are combined is a data choice.
  const combined = $derived(step === "mapping" ? (ready?.combined ?? 0) : 0);

  function valuesOf(channelId: string): string[] {
    const column = encoding[channelId];
    if (!column) return [];
    return [
      ...new Set(
        rows.map((r) => r[column]).filter((v) => typeof v === "string"),
      ),
    ];
  }

  function choose(optionId: string, value: string) {
    // A manual order starts from the order on screen, unless one was already made.
    for (const order of ordersOpenedBy(definition.options, optionId, value)) {
      if (ready && options[order.id] === undefined) {
        onoption(order.id, order.current(ready.view.layout));
      }
    }
    onoption(optionId, value);
  }
</script>

{#snippet fields()}
  {#if combined}
    <AggregationField {aggregate} {combined} {onaggregate} />
  {/if}

  {#each shown as option (option.id)}
    {@const stored = options[option.id]}
    {#if option.kind === "choice"}
      <ChoiceOption
        {option}
        {stored}
        onchange={(value) => choose(option.id, value)}
      />
    {:else if option.kind === "value"}
      {@const values = valuesOf(option.channel)}
      {#if values.length}
        <ValueOption
          {option}
          {values}
          {stored}
          onchange={(value) => onoption(option.id, value)}
        />
      {/if}
    {:else if option.kind === "values"}
      <ValuesOption
        {option}
        values={valuesOf(option.channel)}
        {stored}
        onchange={(value) => onoption(option.id, value)}
      />
    {:else if option.kind === "toggle"}
      <ToggleOption
        {option}
        {stored}
        onchange={(value) => onoption(option.id, value)}
      />
    {:else if option.kind === "number"}
      <NumberOption
        {option}
        {stored}
        onchange={(value) => onoption(option.id, value)}
      />
    {:else if option.kind === "text"}
      <TextOption
        {option}
        {stored}
        onchange={(value) => onoption(option.id, value)}
      />
    {:else if option.kind === "order" && ready && (!option.when || choiceValue(definition.options, options, option.when.option) === option.when.equals)}
      <OrderOption
        label={option.label}
        order={option.current(ready.view.layout)}
        onchange={(order) => onoption(option.id, order)}
      />
    {/if}
  {/each}
{/snippet}

{#if shown.length || combined}
  {#if step === "style"}
    <Fieldset legend="Opções deste gráfico">
      {@render fields()}
    </Fieldset>
  {:else}
    <div class="chart-options">
      {@render fields()}
    </div>
  {/if}
{/if}

<style>
  .chart-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
