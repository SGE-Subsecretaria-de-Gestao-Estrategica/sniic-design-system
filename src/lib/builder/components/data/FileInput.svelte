<script lang="ts">
  import { ACCEPTED_EXTENSIONS } from "../../data/file";

  type Props = {
    fileName: string | null;
    onfile: (file: File) => void;
  };

  let { fileName, onfile }: Props = $props();

  const onChange = (
    e: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (file) onfile(file);
  };
</script>

<label class="file-input">
  {fileName ? `Arquivo: ${fileName}` : "Arquivo CSV"}
  <input
    type="file"
    accept={ACCEPTED_EXTENSIONS.join(",")}
    onchange={onChange}
  />
</label>

<style>
  .file-input {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
