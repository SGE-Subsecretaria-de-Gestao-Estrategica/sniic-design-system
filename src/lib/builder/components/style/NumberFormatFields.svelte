<script lang="ts">
  import { togglePercent } from "../../spec/format";
  import type { NumberFormat } from "../../spec/types";
  import Checkbox from "../ui/Checkbox.svelte";
  import Field from "../ui/Field.svelte";
  import Fieldset from "../ui/Fieldset.svelte";
  import Input from "../ui/Input.svelte";
  import Select from "../ui/Select.svelte";

  type Props = {
    legend: string;
    format: NumberFormat;
    onformat: (patch: Partial<NumberFormat>) => void;
  };

  let { legend, format, onformat }: Props = $props();

  const DECIMALS = [0, 1, 2, 3];
</script>

<Fieldset {legend}>
  <Field label="Casas decimais" inline>
    <span class="narrow">
      <Select
        value={format.decimals === null ? "" : String(format.decimals)}
        onchange={(e) =>
          onformat({
            decimals:
              e.currentTarget.value === ""
                ? null
                : Number(e.currentTarget.value),
          })}
      >
        <option value="">Automático</option>
        {#each DECIMALS as n (n)}
          <option value={String(n)}>{n}</option>
        {/each}
      </Select>
    </span>
  </Field>
  <Checkbox
    checked={format.percent}
    onchange={(e) => onformat(togglePercent(format, e.currentTarget.checked))}
  >
    Percentual (multiplica por 100)
  </Checkbox>
  <Checkbox
    checked={format.compact}
    onchange={(e) => onformat({ compact: e.currentTarget.checked })}
  >
    Compacto (mil, mi, bi)
  </Checkbox>
  <div class="affixes">
    <Field label="Prefixo">
      <Input
        placeholder="R$ "
        value={format.prefix}
        oninput={(e) => onformat({ prefix: e.currentTarget.value })}
      />
    </Field>
    <Field label="Sufixo">
      <Input
        placeholder="%"
        value={format.suffix}
        oninput={(e) => onformat({ suffix: e.currentTarget.value })}
      />
    </Field>
  </div>
</Fieldset>

<style>
  .narrow {
    flex: none;
    width: 128px;
  }
  .affixes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
</style>
