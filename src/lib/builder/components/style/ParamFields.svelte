<script lang="ts">
  import type { ParamDef } from "../../registry/types";
  import type { StyleSpec } from "../../spec/types";
  import Button from "../ui/Button.svelte";
  import Field from "../ui/Field.svelte";
  import Fieldset from "../ui/Fieldset.svelte";
  import Input from "../ui/Input.svelte";
  import { formatNumber, readNumber } from "./numbers";

  type Props = {
    params: readonly ParamDef[];
    style: StyleSpec;
    /** Values the layout solved from a target size, by param id. */
    solved: Record<string, number>;
    /** `null` restores the layout's default. */
    onparam: (paramId: string, value: number | null) => void;
  };

  let { params, style, solved, onparam }: Props = $props();

  const AXIS_NAMES = { width: "largura", height: "altura" };

  const isSolved = (param: ParamDef) =>
    param.solvedBy !== undefined && style[param.solvedBy] !== null;

  function commit(param: ParamDef, input: HTMLInputElement) {
    onparam(param.id, readNumber(input.value));
    input.value = String(style.params[param.id] ?? "");
  }

  function reset() {
    for (const id of Object.keys(style.params)) onparam(id, null);
  }
</script>

<Fieldset legend="Parâmetros do gráfico">
  {#each params as param (param.id)}
    {@const fromSize = isSolved(param)}
    <Field
      label={param.label}
      inline
      note={fromSize && param.solvedBy
        ? `Calculada a partir da ${AXIS_NAMES[param.solvedBy]} escolhida.`
        : undefined}
    >
      <!-- A solved param shows the value in use, not the one it would default to. -->
      <Input
        type="number"
        width="narrow"
        min={param.min}
        max={param.max}
        step={param.step}
        placeholder={formatNumber(
          fromSize ? (solved[param.id] ?? param.default) : param.default,
        )}
        value={fromSize ? "" : (style.params[param.id] ?? "")}
        disabled={fromSize}
        onchange={(e) => commit(param, e.currentTarget)}
      />
    </Field>
  {/each}
  {#if Object.keys(style.params).length}
    <div>
      <Button size="sm" onclick={reset}>Restaurar padrões</Button>
    </div>
  {/if}
</Fieldset>
