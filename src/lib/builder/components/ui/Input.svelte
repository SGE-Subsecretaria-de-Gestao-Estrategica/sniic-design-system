<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import "./tokens.css";

  type Props = Omit<HTMLInputAttributes, "type" | "size"> & {
    type?: "text" | "number";
    /** `narrow` for short values (a size in px, a suffix). */
    width?: "full" | "narrow";
  };

  let { type = "text", width = "full", value, ...rest }: Props = $props();
</script>

<input class={width} {type} {value} {...rest} />

<style>
  input {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: var(--builder-control-height);
    padding: 0 10px;
    color: var(--builder-ink);
    font: 400 var(--builder-text) / 1.2 var(--builder-font);
    font-variant-numeric: tabular-nums;
    background: var(--builder-surface);
    border: 1px solid var(--builder-line);
    border-radius: var(--builder-radius);
  }
  input.narrow {
    flex: none;
    width: 128px;
  }
  input::placeholder {
    color: var(--builder-faint);
  }
  input:hover {
    border-color: var(--builder-faint);
  }
  input:focus-visible {
    outline: 2px solid var(--builder-ink-strong);
    outline-offset: 1px;
  }
  input:disabled {
    color: var(--builder-faint);
    background: var(--builder-wash);
    cursor: not-allowed;
  }
</style>
