<script lang="ts">
  import type { OptionOf } from "../../registry/types";
  import type { JsonValue } from "../../spec/types";
  import Checkbox from "../ui/Checkbox.svelte";

  type Props = {
    option: OptionOf<"toggle">;
    stored: JsonValue | undefined;
    /** `undefined` = back to the option's default. */
    onchange: (value: boolean | undefined) => void;
  };

  let { option, stored, onchange }: Props = $props();

  const fallback = $derived(option.default ?? false);
</script>

<Checkbox
  checked={typeof stored === "boolean" ? stored : fallback}
  onchange={(e) => {
    const checked = e.currentTarget.checked;
    onchange(checked === fallback ? undefined : checked);
  }}
>
  {option.label}
</Checkbox>
