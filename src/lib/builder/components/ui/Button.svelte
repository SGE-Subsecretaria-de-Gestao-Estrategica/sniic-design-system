<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import "./tokens.css";

  type Props = HTMLButtonAttributes & {
    /** `primary`: the step's main action. `secondary`: any other. `icon`: a square, one-glyph button. */
    variant?: "primary" | "secondary" | "icon";
    size?: "md" | "sm";
    children: Snippet;
  };

  let {
    variant = "secondary",
    size = "md",
    type = "button",
    children,
    ...rest
  }: Props = $props();
</script>

<button class="{variant} {size}" {type} {...rest}>
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: var(--builder-control-height);
    padding: 0 14px;
    color: var(--builder-ink);
    font: 500 var(--builder-text) / 1 var(--builder-font);
    white-space: nowrap;
    background: var(--builder-surface);
    border: 1px solid var(--builder-line);
    border-radius: var(--builder-radius);
    cursor: pointer;
  }
  button.sm {
    height: var(--builder-control-height-sm);
    padding: 0 10px;
    font-size: var(--builder-text-sm);
  }
  button.icon {
    width: var(--builder-control-height-sm);
    height: var(--builder-control-height-sm);
    padding: 0;
  }
  button:hover:not(:disabled) {
    border-color: var(--builder-faint);
    background: var(--builder-wash);
  }
  button.primary {
    color: var(--builder-surface);
    background: var(--builder-ink);
    border-color: var(--builder-ink);
  }
  button.primary:hover:not(:disabled) {
    background: var(--builder-ink-strong);
    border-color: var(--builder-ink-strong);
  }
  button:focus-visible {
    outline: 2px solid var(--builder-ink-strong);
    outline-offset: 2px;
  }
  button:disabled {
    color: var(--builder-faint);
    background: var(--builder-wash);
    border-color: var(--builder-line-soft);
    cursor: not-allowed;
  }
</style>
