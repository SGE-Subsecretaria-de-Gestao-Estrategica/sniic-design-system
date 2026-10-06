<script lang="ts">
  import { download } from "../../export/download";
  import Button from "../ui/Button.svelte";
  import Checkbox from "../ui/Checkbox.svelte";

  type Props = {
    fileName: string;
    /** The file's text, with or without the data inside. */
    content: (withData: boolean) => string;
    disabled?: boolean;
  };

  let { fileName, content, disabled = false }: Props = $props();

  let withData = $state(false);

  const save = () => download(content(withData), fileName, "application/json");
</script>

<div class="save-chart">
  <Checkbox
    checked={withData}
    {disabled}
    onchange={(e) => (withData = e.currentTarget.checked)}
  >
    Incluir os dados
  </Checkbox>
  <Button {disabled} onclick={save}>Salvar gráfico</Button>
</div>

<style>
  .save-chart {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }
</style>
