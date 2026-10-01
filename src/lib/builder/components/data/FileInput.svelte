<script lang="ts">
  import { ACCEPTED_EXTENSIONS } from "../../data/file";

  type Props = {
    fileName: string | null;
    onfile: (file: File) => void;
  };

  let { fileName, onfile }: Props = $props();
</script>

<label class="file-input">
  {fileName ? `Arquivo: ${fileName}` : "Arquivo CSV"}
  <input
    type="file"
    accept={ACCEPTED_EXTENSIONS.join(",")}
    onchange={(e) => {
      const file = e.currentTarget.files?.[0];
      // Cleared so picking the same file again still fires `change`.
      e.currentTarget.value = "";
      if (file) onfile(file);
    }}
  />
</label>

<style>
  .file-input {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
