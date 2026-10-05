<script lang="ts">
  import type { OptionOf } from "../../registry/types";
  import type { JsonValue } from "../../spec/types";
  import Checkbox from "../ui/Checkbox.svelte";

  type Props = {
    option: OptionOf<"toggle">;
    stored: JsonValue | undefined;
    /** `undefined` = off. */
    onchange: (value: true | undefined) => void;
  };

  let { option, stored, onchange }: Props = $props();
</script>

<Checkbox
  checked={stored === true}
  onchange={(e) => onchange(e.currentTarget.checked || undefined)}
>
  {option.label}
</Checkbox>
