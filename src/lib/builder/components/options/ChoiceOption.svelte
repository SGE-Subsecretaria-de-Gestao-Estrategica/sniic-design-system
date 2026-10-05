<script lang="ts">
  import type { OptionOf } from "../../registry/types";
  import type { JsonValue } from "../../spec/types";
  import Field from "../ui/Field.svelte";
  import Select from "../ui/Select.svelte";

  type Props = {
    option: OptionOf<"choice">;
    stored: JsonValue | undefined;
    onchange: (value: string) => void;
  };

  let { option, stored, onchange }: Props = $props();
</script>

<Field label={option.label}>
  <Select
    value={typeof stored === "string" ? stored : option.default}
    onchange={(e) => onchange(e.currentTarget.value)}
  >
    {#each option.choices as choice (choice.value)}
      <option value={choice.value}>{choice.label}</option>
    {/each}
  </Select>
</Field>
