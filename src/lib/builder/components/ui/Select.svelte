<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";
  import "./tokens.css";

  type Props = Omit<HTMLSelectAttributes, "size"> & {
    size?: "md" | "sm";
    children: Snippet;
  };

  let { size = "md", value, children, ...rest }: Props = $props();
</script>

<select class={size} {value} {...rest}>
  {@render children()}
</select>

<style>
  select {
    appearance: none;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: var(--builder-control-height);
    padding: 0 32px 0 10px;
    color: var(--builder-ink);
    font: 400 var(--builder-text) / 1.2 var(--builder-font);
    text-overflow: ellipsis;
    background-color: var(--builder-surface);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%232D2E2B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1.5 1.5 6 6l4.5-4.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    border: 1px solid var(--builder-line);
    border-radius: var(--builder-radius);
    cursor: pointer;
  }
  select.sm {
    height: var(--builder-control-height-sm);
    padding-left: 8px;
    padding-right: 26px;
    font-size: var(--builder-text-sm);
    background-position: right 8px center;
  }
  select:hover {
    border-color: var(--builder-faint);
  }
  select:focus-visible {
    outline: 2px solid var(--builder-ink-strong);
    outline-offset: 1px;
  }
  select:disabled {
    color: var(--builder-faint);
    background-color: var(--builder-wash);
    cursor: not-allowed;
  }
</style>
