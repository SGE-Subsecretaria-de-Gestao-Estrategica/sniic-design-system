<script lang="ts">
  import type { Snippet } from "svelte";
  import "./tokens.css";

  type Props = {
    label: string;
    /** Shown after the label in a lighter weight, e.g. the accepted types. */
    hint?: string;
    required?: boolean;
    /** Help under the control. It stays outside the label, so the label text is only `label`. */
    note?: string;
    tone?: "muted" | "warning";
    /** Label and control on one row. */
    inline?: boolean;
    children: Snippet;
  };

  let {
    label,
    hint,
    required = false,
    note,
    tone = "muted",
    inline = false,
    children,
  }: Props = $props();
</script>

<div class="field">
  <label class:inline>
    <span class="label">
      {label}{#if required}<span class="required" title="obrigatório"
          >&nbsp;*</span
        >{/if}
      {#if hint}<span class="hint">{hint}</span>{/if}
    </span>
    {@render children()}
  </label>
  {#if note}
    <p class="note {tone}">{note}</p>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    font-family: var(--builder-font);
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  label.inline {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .label {
    color: var(--builder-ink);
    font-size: var(--builder-text-sm);
    font-weight: 500;
    line-height: 1.3;
  }
  .hint {
    color: var(--builder-faint);
    font-weight: 400;
  }
  .required {
    color: var(--builder-danger);
  }
  .note {
    margin: 0;
    color: var(--builder-faint);
    font-size: var(--builder-text-xs);
    line-height: 1.35;
  }
  .note.warning {
    color: var(--builder-warning);
  }
</style>
