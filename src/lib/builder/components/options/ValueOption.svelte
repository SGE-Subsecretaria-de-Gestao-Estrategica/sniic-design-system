<script lang="ts">
  import type { OptionOf } from "../../registry/types";
  import type { JsonValue } from "../../spec/types";
  import Field from "../ui/Field.svelte";
  import Select from "../ui/Select.svelte";

  type Props = {
    option: OptionOf<"value">;
    /** The values of the column mapped to the option's channel. */
    values: readonly string[];
    stored: JsonValue | undefined;
    /** `undefined` = the empty choice. */
    onchange: (value: string | undefined) => void;
  };

  let { option, values, stored, onchange }: Props = $props();
</script>

<Field label={option.label}>
  <Select
    value={typeof stored === "string" ? stored : ""}
    onchange={(e) => onchange(e.currentTarget.value || undefined)}
  >
    <option value="">{option.none ?? "Automático"}</option>
    {#each values as value (value)}
      <option {value}>{value}</option>
    {/each}
  </Select>
</Field>
