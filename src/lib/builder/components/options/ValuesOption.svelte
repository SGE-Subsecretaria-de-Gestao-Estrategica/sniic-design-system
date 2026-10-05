<script lang="ts">
  import { pickedValues, togglePicked } from "../../registry/options";
  import type { OptionOf } from "../../registry/types";
  import type { JsonValue } from "../../spec/types";
  import Checkbox from "../ui/Checkbox.svelte";

  type Props = {
    option: OptionOf<"values">;
    /** The values of the column mapped to the option's channel; empty when it has none. */
    values: readonly string[];
    stored: JsonValue | undefined;
    /** `undefined` = nothing ticked. */
    onchange: (value: JsonValue | undefined) => void;
  };

  let { option, values, stored, onchange }: Props = $props();

  const picked = $derived(pickedValues(stored, values));
</script>

{#if values.length}
  <fieldset>
    <legend>{option.label}</legend>
    <div class="checks">
      {#each values as value (value)}
        <Checkbox
          checked={picked.includes(value)}
          onchange={(e) =>
            onchange(
              togglePicked(stored, values, value, e.currentTarget.checked),
            )}
        >
          {value}
        </Checkbox>
      {/each}
    </div>
  </fieldset>
{:else if option.whole}
  <Checkbox
    checked={stored === true}
    onchange={(e) => onchange(e.currentTarget.checked || undefined)}
  >
    {option.whole}
  </Checkbox>
{/if}

<style>
  fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    font-family: var(--builder-font);
    border: 0;
  }
  legend {
    margin-bottom: 6px;
    padding: 0;
    color: var(--builder-ink);
    font-size: var(--builder-text-sm);
    font-weight: 500;
  }
  .checks {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow: auto;
  }
</style>
