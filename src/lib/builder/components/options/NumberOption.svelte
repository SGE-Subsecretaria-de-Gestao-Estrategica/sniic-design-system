<script lang="ts">
  import type { OptionOf } from "../../registry/types";
  import type { JsonValue } from "../../spec/types";
  import { readNumber } from "../style/numbers";
  import Field from "../ui/Field.svelte";
  import Input from "../ui/Input.svelte";

  type Props = {
    option: OptionOf<"number">;
    stored: JsonValue | undefined;
    /** `undefined` = empty. */
    onchange: (value: number | undefined) => void;
  };

  let { option, stored, onchange }: Props = $props();

  function commit(input: HTMLInputElement) {
    const value = readNumber(input.value);
    onchange(value !== null && Number.isFinite(value) ? value : undefined);
  }
</script>

<Field label={option.label} inline note={option.note}>
  <Input
    type="number"
    width="narrow"
    step="any"
    placeholder={option.placeholder}
    value={typeof stored === "number" ? stored : ""}
    onchange={(e) => commit(e.currentTarget)}
  />
</Field>
