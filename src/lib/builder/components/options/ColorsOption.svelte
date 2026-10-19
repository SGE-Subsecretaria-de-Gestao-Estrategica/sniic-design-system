<script lang="ts">
  import { getPillarTheme } from "$lib/core/theme";
  import { pickColor, readColorMap } from "../../registry/options";
  import type { OptionOf } from "../../registry/types";
  import type { JsonValue } from "../../spec/types";
  import {
    pickedSeriesColors,
    SERIES_COLOR_GROUPS,
    seriesColorChoices,
  } from "../views/colors";
  import Field from "../ui/Field.svelte";
  import Select from "../ui/Select.svelte";

  type Props = {
    option: OptionOf<"colors">;
    /** The items to colour, as the layout has them: their position sets the automatic colour. */
    values: readonly string[];
    /** The same items, in the order the panel lists them. */
    listed: readonly string[];
    stored: JsonValue | undefined;
    pillar: number;
    /** `undefined` = every value on its automatic colour. */
    onchange: (value: JsonValue | undefined) => void;
  };

  let { option, values, listed, stored, pillar, onchange }: Props = $props();

  const theme = $derived(getPillarTheme(pillar));
  const choices = $derived(seriesColorChoices(values.length, theme));
  const groups = $derived(
    SERIES_COLOR_GROUPS.map((group) => ({
      ...group,
      choices: choices.filter((c) => c.group === group.id),
    })).filter((group) => group.choices.length),
  );
  const picked = $derived(readColorMap(stored));
  const colors = $derived(pickedSeriesColors(values, stored, theme));
</script>

<fieldset>
  <legend>{option.label}</legend>
  <div class="rows">
    {#each listed as value (value)}
      <Field label={value} inline>
        <span class="control">
          <span class="swatch" style:background={colors.get(value)}></span>
          <Select
            size="sm"
            value={choices.some((c) => c.id === picked[value])
              ? picked[value]
              : ""}
            onchange={(e) =>
              onchange(pickColor(stored, value, e.currentTarget.value || undefined))}
          >
            <option value="">Automática</option>
            {#each groups as group (group.id)}
              <optgroup label={group.label}>
                {#each group.choices as choice (choice.id)}
                  <option value={choice.id}>{choice.label}</option>
                {/each}
              </optgroup>
            {/each}
          </Select>
        </span>
      </Field>
    {/each}
  </div>
</fieldset>

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
  .rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .control {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .swatch {
    flex: none;
    width: 16px;
    height: 16px;
    border: 1px solid var(--builder-line);
    border-radius: 50%;
  }
</style>
