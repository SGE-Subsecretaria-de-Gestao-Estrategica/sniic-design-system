<script lang="ts">
  import { ACCEPTED_EXTENSIONS } from "../../data/file";
  import "../ui/tokens.css";

  type Props = {
    fileName: string | null;
    onfile: (file: File) => void;
    label?: string;
    accept?: string;
    /** The button's text; by default it follows `fileName`. */
    action?: string;
    /** Shown while no file is chosen. */
    hint?: string;
    variant?: "primary" | "secondary";
  };

  let {
    fileName,
    onfile,
    label = "Arquivo CSV",
    accept = ACCEPTED_EXTENSIONS.join(","),
    action,
    hint = "Nenhum arquivo escolhido (.csv ou .txt, até 5 MB)",
    variant = "primary",
  }: Props = $props();

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
  <span class="label">{label}</span>
  <span class="row">
    <span class="button {variant}"
      >{action ?? (fileName ? "Trocar arquivo" : "Escolher arquivo")}</span
    >
    <span class="name" class:empty={!fileName}>
      {fileName ?? hint}
    </span>
  </span>
  <input type="file" {accept} onchange={onChange} />
</label>

<style>
  .file-input {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: var(--builder-font);
    cursor: pointer;
  }
  .label {
    color: var(--builder-ink);
    font-size: var(--builder-text-sm);
    font-weight: 500;
  }
  .row {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }
  .button {
    display: inline-flex;
    flex: none;
    align-items: center;
    height: var(--builder-control-height);
    padding: 0 14px;
    color: var(--builder-surface);
    font-size: var(--builder-text);
    font-weight: 500;
    background: var(--builder-ink);
    border-radius: var(--builder-radius);
  }
  .file-input:hover .button {
    background: var(--builder-ink-strong);
  }
  .button.secondary {
    box-sizing: border-box;
    color: var(--builder-ink);
    background: var(--builder-surface);
    border: 1px solid var(--builder-line);
  }
  .file-input:hover .button.secondary {
    background: var(--builder-wash);
    border-color: var(--builder-faint);
  }
  .name {
    overflow: hidden;
    color: var(--builder-ink);
    font-size: var(--builder-text);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .name.empty {
    color: var(--builder-faint);
  }
  /* The native input stays in the page for keyboard and assistive use, out of sight. */
  input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .file-input:focus-within .button {
    outline: 2px solid var(--builder-ink-strong);
    outline-offset: 2px;
  }
</style>
