<script lang="ts">
  import type { OptionOf } from "../../registry/types";
  import type { JsonValue } from "../../spec/types";
  import Field from "../ui/Field.svelte";
  import Input from "../ui/Input.svelte";

  type Props = {
    option: OptionOf<"text">;
    stored: JsonValue | undefined;
    /** `undefined` = empty. */
    onchange: (value: string | undefined) => void;
  };

  let { option, stored, onchange }: Props = $props();
</script>

<Field label={option.label}>
  <Input
    placeholder={option.placeholder}
    value={typeof stored === "string" ? stored : ""}
    oninput={(e) => onchange(e.currentTarget.value || undefined)}
  />
</Field>
